---
title: systemd 进程守护
---

# systemd 进程守护

主流 Linux 发行版的系统原生方案，**无需安装任何东西**：一个 unit 文件即可获得开机自启、崩溃自动拉起、日志收集（journalctl）与开机依赖编排。二进制部署的 Team-API 默认推荐用 systemd 托管；需要 `supervisorctl` 风格的交互管理或面板集成时再看 [Supervisor 进程守护](/deploy/supervisor)。

## Unit 文件

创建 `/etc/systemd/system/team-api.service`：

```ini
[Unit]
Description=Team-API Gateway
# 数据库就绪后再启动（服务名按实际环境调整，远端数据库则删掉这两行）
After=network-online.target postgresql.service redis.service
Wants=network-online.target postgresql.service redis.service

[Service]
Type=simple
User=teamapi
Group=teamapi
WorkingDirectory=/opt/team-api
ExecStart=/opt/team-api/team-api

# 崩溃自动拉起：退出 5 秒后重试
Restart=always
RestartSec=5
# 优雅停止：先发 TERM（应用排空任务池、落盘计费流水后退出），30 秒仍活着再 SIGKILL
KillSignal=SIGTERM
TimeoutStopSec=30

# 无人值守初始化（可选；已通过 /setup 向导初始化则删除）
Environment=INIT_ADMIN_USERNAME=admin@example.com
Environment=INIT_ADMIN_PASSWORD=强密码
# 更多的环境变量建议放独立文件，避免密码进 unit：
# EnvironmentFile=-/opt/team-api/team-api.env

# 基础加固（整个文件系统只读，仅放开应用目录：
# 日志写入与「在线更新」替换二进制都需要写权限）
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=/opt/team-api

[Install]
WantedBy=multi-user.target
```

启用：

```bash
# 建运行用户与目录（沿用二进制部署的布局）
useradd -r -s /usr/sbin/nologin teamapi
mkdir -p /opt/team-api/logs
chown -R teamapi:teamapi /opt/team-api

systemctl daemon-reload
systemctl enable --now team-api

systemctl status team-api
```

::: tip 目录布局
Unit 假定按[二进制部署](/deploy/binary)的标准布局：二进制在 `/opt/team-api/team-api`，配置在 `/opt/team-api/config/config.yaml`（`WorkingDirectory` 决定相对查找起点），日志在 `/opt/team-api/logs/`。路径不同时同步修改 `WorkingDirectory` / `ExecStart` / `ReadWritePaths`。
:::

## 常用命令

| 命令 | 作用 |
|------|------|
| `systemctl status team-api` | 运行状态与最近日志片段 |
| `systemctl start / stop / restart team-api` | 启动 / 停止 / 重启 |
| `systemctl enable --now team-api` | 设为开机自启并立即启动 |
| `systemctl disable team-api` | 取消开机自启 |
| `journalctl -u team-api -f` | 实时跟踪日志 |
| `journalctl -u team-api --since "1 hour ago"` | 查看最近一小时的日志 |
| `journalctl -u team-api -p err` | 只看错误级别 |
| `systemd-analyze security team-api` | 评估 unit 的加固评分 |

## 配置逐项说明

| 配置 | 说明 |
|------|------|
| `Type=simple` | 前台进程型服务，ExecStart 即主进程，最简可靠 |
| `Restart=always` + `RestartSec=5` | 无论何种退出码都 5 秒后拉起；配合 `startretries` 语义由 `StartLimitIntervalSec` 控制（默认 10 秒内 5 次失败进入 failed 状态，可用 `StartLimitBurst=0` 取消限制） |
| `KillSignal=SIGTERM` | 应用收到 TERM 后走优雅关闭：排空异步任务、flush 计费流水、关闭 writer，再退出 |
| `TimeoutStopSec=30` | 优雅期上限，超时强制 SIGKILL |
| `ProtectSystem=strict` | 文件系统只读，防止供应链类攻击写系统目录 |
| `ReadWritePaths=/opt/team-api` | 应用目录可写——**注意必须覆盖二进制所在目录**，否则管理后台在线更新替换二进制会失败 |

## 与在线更新的关系

Team-API 的管理后台在线更新采用 `syscall.Exec` **原地换壳：进程 PID 不变，只是代码段换成了新版本**。因此：

- systemd 不会感知到「进程重启」，不会错误地拉起第二个实例；
- 在线更新前后 `systemctl status team-api` 显示的 PID 一致，属正常现象；
- 版本回滚同样在界面内完成（见[二进制部署 · 版本升级](/deploy/binary#版本升级)）。

手动升级 / 回滚才需要 `systemctl stop` → 替换二进制 → `systemctl start`。

## 常见问题

**启动失败，`systemctl status` 显示退出码非 0？** 直接看详细日志定位（应用启动即退出的三大原因：配置文件找不到、`crypto.encryptionKey` 缺失/非法、PostgreSQL / Redis 连不上）：

```bash
journalctl -u team-api -n 50 --no-pager
```

**PostgreSQL 由 systemd 管理，但启动顺序仍报连不上？** `After=` 只保证「先后」不保证「就绪」。两个办法：给 PG 的 unit 加 `Type=notify`（多数发行版的 PG unit 已是），或保留 `Restart=always` 依赖自动重试兜底——5 秒后第二次拉起时数据库通常已就绪。

**修改 unit 文件后不生效？** systemd 会缓存 unit 内容，`systemctl daemon-reload` 后再 `restart`。

**SELinux 环境拒绝执行 /opt 下的二进制？**（CentOS/RHEL 常见）`ls -Z /opt/team-api/team-api` 确认上下文，或 `restorecon -v` 修复；临时验证可用 `setenforce 0` 复测是否为 SELinux 拦截。

**端口被占用？** `ss -ltnp | grep 18888` 查看占用者；改端口需同步修改 `config.yaml` 的 `server.address` 与 Nginx 的 `proxy_pass`（见[Nginx 反向代理](/deploy/nginx)）。

## 下一步

- [Nginx 反向代理](/deploy/nginx) —— 服务守护好之后，公网入口配置
- [Supervisor 进程守护](/deploy/supervisor) —— 对比方案
- [宝塔部署](/deploy/baota) —— 面板用户的图形化替代路径
