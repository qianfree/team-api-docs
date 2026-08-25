---
title: Supervisor 进程守护
---

# Supervisor 进程守护

[Supervisor](https://supervisord.org/) 是经典的进程管理器，用配置文件管理 Team-API 二进制进程，提供**崩溃自动拉起、开机自启、日志接管与命令行控制**。相比 systemd 的优势：配置直观、`supervisorctl` 交互简单、跨发行版行为一致，并且在宝塔等面板中有现成的图形管理插件（见[宝塔部署](/deploy/baota)）。

适合不熟悉 systemd 单元文件、或习惯用 `supervisorctl` 管理所有服务的团队。系统自带的 systemd 方案见 [systemd 进程守护](/deploy/systemd)。

## 安装

```bash
# Debian / Ubuntu
apt install supervisor

# CentOS / RHEL（EPEL）
yum install epel-release && yum install supervisor

# 或用 pip（任意平台）
pip install supervisor
```

安装后 `supervisord` 服务随包管理器自动注册为 systemd 服务（即「用 systemd 守护守护器，用 Supervisor 守护应用」）：

```bash
systemctl enable --now supervisor
```

## 配置守护进程

新建 `/etc/supervisor/conf.d/team-api.conf`（路径随发行版可能为 `conf.d` 或 ` supervisord.d/*.ini`）：

```ini
[program:team-api]
; 启动命令与工作目录（工作目录决定 config/ 与 logs/ 的相对位置）
command=/opt/team-api/team-api
directory=/opt/team-api
; 运行用户（避免 root）
user=teamapi
; 自动启动与崩溃拉起
autostart=true
autorestart=true
startretries=5
restartsecs=5
; 关闭方式：发 TERM 信号让应用优雅退出（排空计费流水）
stopasgroup=true
killasgroup=true
stopsignal=TERM
stopwaitsecs=30

; 日志接管（应用侧 logger 可只输出 stdout，交给 Supervisor 统一落盘）
stdout_logfile=/opt/team-api/logs/supervisor.log
stderr_logfile=/opt/team-api/logs/supervisor-error.log
stdout_logfile_maxbytes=100MB
stdout_logfile_backups=10

; 无人值守初始化（可选；已通过 /setup 向导初始化则删除这两行）
environment=INIT_ADMIN_USERNAME="admin@example.com",INIT_ADMIN_PASSWORD="强密码"

; 进程数固定为 1（有状态网关不可多开，扩容请加实例+负载均衡）
numprocs=1
```

```bash
# 建用户与目录（沿用二进制部署的目录布局）
useradd -r -s /usr/sbin/nologin teamapi
mkdir -p /opt/team-api/logs
chown -R teamapi:teamapi /opt/team-api

# 加载配置并启动
supervisorctl reread
supervisorctl update
supervisorctl status
```

`status` 显示 `team-api  RUNNING` 即守护生效，此时杀掉进程会自动拉起：

```bash
kill -9 $(pgrep -f '/opt/team-api/team-api')
supervisorctl status   # 数秒后回到 RUNNING
```

## 常用命令

| 命令 | 作用 |
|------|------|
| `supervisorctl status` | 查看所有进程状态 |
| `supervisorctl start team-api` | 启动 |
| `supervisorctl stop team-api` | 停止（优雅退出） |
| `supervisorctl restart team-api` | 重启 |
| `supervisorctl tail -f team-api` | 跟踪日志 |
| `supervisorctl reread && supervisorctl update` | 修改配置后生效 |

也可以直接运行 `supervisorctl` 进入交互模式。

## 版本升级

```bash
# 1. 备份数据库（见 Docker Compose 部署的备份命令，pg_dump 同样适用）

# 2. 下载并校验新版本（见二进制部署「获取与校验」），替换二进制
supervisorctl stop team-api
tar -xzf team-api-<新版本>-linux-amd64.tar.gz -C /opt/team-api --strip-components=1
chown teamapi:teamapi /opt/team-api/team-api

# 3. 启动，自动执行增量迁移
supervisorctl start team-api
supervisorctl tail -f team-api   # 观察迁移与服务就绪日志
```

::: tip 优先尝试在线更新
Supervisor 托管不影­响管理后台的在线更新——Team-API 升级采用 `syscall.Exec` 原地换壳，**进程 PID 不变**，不会触发 Supervisor 的重启逻辑。日常升级直接在管理后台左上角完成即可（见[二进制部署 · 版本升级](/deploy/binary#版本升级)），手动替换仅作为服务器无法访问 GitHub 时的兜底。
:::

## 常见问题

**改了配置不生效？** `supervisorctl reread` 只重新读取，`update` 才会应用到进程；两者通常成对执行。

**启动立即退出（FATAL / BACKOFF）？** 先看 `supervisorctl tail team-api stderr`。最常见三类：

- `config.yaml` 不在 `/opt/team-api/config/` 下（`directory` 决定相对查找）；
- `crypto.encryptionKey` 未配置或不是 64 位十六进制（程序启动即退出）；
- PostgreSQL / Redis 连不上（检查 `config.yaml` 连接串与密码）。

**`unix:///var/run/supervisor.sock no such file`？** `supervisord` 主进程没起来：`systemctl status supervisor` 排查。

**为什么不用 root 运行？** 网关直接对接公网流量，任何解析漏洞都会以进程身份执行；`user=teamapi` + 独立目录权限把爆炸半径限制在应用目录内。

## 下一步

- [systemd 进程守护](/deploy/systemd) —— 无需额外安装的系统原生方案
- [Nginx 反向代理](/deploy/nginx) —— 进程守护就绪后，公网入口的 HTTPS 与流式配置
