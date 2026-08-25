---
title: 二进制部署
---

# 二进制部署

官方发布的二进制为**单文件、零依赖**形态：管理后台与租户控制台的前端资源已嵌入二进制内部（`embedweb` 构建标签），数据库迁移脚本同样内置，启动即自动迁移。适合不便使用 Docker 的服务器，或希望用 systemd / 服务管理器直接托管进程的场景。

需要**自备** PostgreSQL 与 Redis（云服务或自建均可）。如果希望全栈一键拉起，请用 [Docker Compose 部署](/deploy/docker-compose)。

## 环境要求

### 操作系统与架构

官方 Release 覆盖以下平台：

| 平台 | 文件 |
|------|------|
| Linux x86_64 | `team-api-<版本>-linux-amd64.tar.gz` |
| Linux ARM64 | `team-api-<版本>-linux-arm64.tar.gz` |
| Windows x64 | `team-api-<版本>-windows-amd64.zip` |
| macOS Apple Silicon | `team-api-<版本>-darwin-arm64.tar.gz` |
| macOS Intel | `team-api-<版本>-darwin-amd64.tar.gz` |

其他平台可用 [源码编译](/deploy/source)交叉编译获得。

### 外部依赖

| 依赖 | 版本 | 说明 |
|------|------|------|
| PostgreSQL | 15+（推荐 18） | 业务主库；建库 `CREATE DATABASE team_api;` 即可，建表由迁移自动完成 |
| Redis | 7+ | 额度账本与缓存；**建议开启 AOF 持久化**（`appendonly yes`），额度权威状态落在 Redis，重启不丢账 |

## 获取与校验

从 [GitHub Releases](https://github.com/qianfree/team-api/releases) 下载对应平台的压缩包，每个 Release 附带 `checksums-sha256.txt`：

```bash
# 以 linux-amd64 为例
VERSION=0.2.12
curl -LO https://github.com/qianfree/team-api/releases/download/${VERSION}/team-api-${VERSION}-linux-amd64.tar.gz
curl -LO https://github.com/qianfree/team-api/releases/download/${VERSION}/checksums-sha256.txt

# 校验完整性（输出 OK 即通过）
sha256sum -c --ignore-missing checksums-sha256.txt

# 解压
tar -xzf team-api-${VERSION}-linux-amd64.tar.gz
```

压缩包内含二进制（Windows 为 `team-api.exe`）、README 与 LICENSE。

## 目录结构与配置

### 推荐目录布局

```text
/opt/team-api/
├── team-api              # 二进制
├── config/
│   └── config.yaml       # 运行时配置（必需）
└── logs/                 # 日志目录（配置落盘日志时自动创建）
```

程序按 GoFrame 约定搜索配置文件：**工作目录**与**二进制所在目录**下的 `config/config.yaml`、`manifest/config/config.yaml` 均可被找到；也可用环境变量 `GF_GCFG_PATH` 指定绝对路径。最省心的做法是**在二进制同级建 `config/config.yaml`，并固定在该目录启动**。

### 最小配置示例

连接自备的 PostgreSQL 与 Redis（地址按实际环境修改）：

```yaml
server:
  address: ":18888"        # 监听地址与端口

database:
  default:
    type: "pgsql"
    link: "pgsql:team_api:数据库密码@tcp(127.0.0.1:5432)/team_api?sslmode=disable"
    maxIdle: 10
    maxOpen: 100

redis:
  default:
    address: "127.0.0.1:6379"
    pass: "Redis密码"       # 无密码则删除此行
    db: 0

jwt:
  secret: "随机强密钥"       # openssl rand -hex 32 生成

crypto:
  encryptionKey: "64位十六进制密钥"   # 必填！openssl rand -hex 32 生成

# 日志落盘（可选；不配 path 则仅输出到 stdout，交给 systemd journal 收集）
logger:
  level: "all"
  stdout: true
  path: "./logs"
  file: "{Y-m-d}.log"
  rotateSize: "100MB"
  rotateBackupLimit: 30
```

::: warning 两把密钥务必备份
- `jwt.secret` —— 更换后所有已登录会话立即失效；
- `crypto.encryptionKey` —— 用于 AES-256 加密存储租户 API Key 原值、渠道密钥等敏感字段，**丢失后加密数据无法恢复**。

两者生成命令相同：`openssl rand -hex 32`。请连同 `config.yaml` 一起妥善备份。
:::

## 启动与初始化

```bash
cd /opt/team-api
./team-api
```

启动流程依次为：打印横幅 → **自动执行数据库迁移**（内置 Goose 脚本，空库自动建表）→ Redis 连通性检查 → 加密密钥校验 → 进入服务。任一环节失败都会以致命日志退出，按日志提示排查。

::: tip 迁移也可以手动管理
二进制内置 `migrate` 子命令：`./team-api migrate status` 查看迁移版本、`migrate up` 前进、`migrate down` 回退一步。日常无需手动执行，启动时自动完成。
:::

首次启动数据库中没有管理员账号，系统进入初始化模式：

- **向导初始化（推荐）**：浏览器访问 `http://<服务器IP>:18888`，自动跳转 `/setup`，按提示创建管理员；
- **环境变量初始化**：启动前设置 `INIT_ADMIN_USERNAME` 与 `INIT_ADMIN_PASSWORD`，进程启动时自动创建管理员（已有则跳过）。

验证：

```bash
curl http://localhost:18888/api/health
# {"status":"ok","version":"0.2.12"}

curl http://localhost:18888/api/setup/status   # 初始化模式时返回未初始化状态
```

- 管理后台：`http://<服务器IP>:18888/admin/`
- 租户控制台：`http://<服务器IP>:18888/`

## 用 systemd 托管（Linux）

前台跑通后，交给 systemd 实现**开机自启与崩溃自动拉起**。创建 `/etc/systemd/system/team-api.service`（最小可用版）：

```ini
[Unit]
Description=Team-API Gateway
After=network-online.target
Wants=network-online.target

[Service]
User=teamapi
Group=teamapi
WorkingDirectory=/opt/team-api
ExecStart=/opt/team-api/team-api
Restart=always
RestartSec=5

# 无人值守初始化（可选；已通过向导初始化则无需设置）
Environment=INIT_ADMIN_USERNAME=admin@example.com
Environment=INIT_ADMIN_PASSWORD=强密码

[Install]
WantedBy=multi-user.target
```

```bash
# 建运行用户并授权
useradd -r -s /usr/sbin/nologin teamapi
mkdir -p /opt/team-api/logs
chown -R teamapi:teamapi /opt/team-api

# 启用并启动
systemctl daemon-reload
systemctl enable --now team-api
journalctl -u team-api -f
```

数据库依赖编排、安全加固（`ProtectSystem` 等）、日志查询与常见问题的完整说明见 [systemd 进程守护](/deploy/systemd)；偏好 `supervisorctl` 交互风格或使用宝塔面板的用户可改用 [Supervisor 进程守护](/deploy/supervisor)。

## Windows 服务器

解压得到 `team-api.exe`，同样在同级目录放置 `config\config.yaml` 后双击或在 PowerShell 中运行：

```powershell
.\team-api.exe
```

需要开机自启 / 崩溃重启时，推荐用 [NSSM](https://nssm.cc/) 将其注册为 Windows 服务：

```powershell
nssm install TeamAPI "C:\team-api\team-api.exe"
nssm set TeamAPI AppDirectory "C:\team-api"
nssm set TeamAPI AppStdout "C:\team-api\logs\service.log"
nssm start TeamAPI
```

## 版本升级

### 方式一：管理后台在线更新（推荐）

Linux 与 macOS 二进制内置完整的在线更新能力，**全程在管理后台点两下完成，无需登录服务器**：

1. 打开管理后台，点击**左上角 Logo / 版本号**区域，弹出更新窗口；
2. 窗口内显示当前版本与最新版本（有新版本时版本号旁会出现红点提示，支持「立即检测」强制刷新）；
3. 确认更新说明后点击**立即更新**，等待进度完成即可。

后台自动执行完整的升级流水线，期间无需人工干预：

| 阶段 | 动作 |
|------|------|
| 下载 | 从 GitHub Releases 拉取对应平台的更新包 |
| 校验 | SHA-256 完整性校验（`checksums-sha256.txt`），校验失败立即中止，不会替换 |
| 备份 | 当前二进制自动备份（保留 7 天） |
| 替换 | 新二进制落到与当前二进制相同的目录 |
| 重启 | 优雅关闭（排空任务池、落盘计费流水）→ `syscall.Exec` 原地换壳，**同 PID 继续运行，systemd 无感知**，不依赖进程管理器 |
| 自检 | 新版本启动后自动探测自身 `/api/health`，通过则清理标记、显示「更新完成」 |
| 迁移 | 启动时自动执行增量数据库迁移 |

**一键回滚**：更新后自检失败或发现新版本异常时，更新窗口会提示回滚，点击即可恢复到备份的旧版本并重启，同样无需登录服务器。

::: tip 使用前提
- 仅支持 **Linux / macOS** 二进制部署。Windows 不支持在线更新（运行中的二进制无法被替换），Docker 模式下入口会提示改用镜像升级（见 [Docker Compose 部署 · 版本升级与回滚](/deploy/docker-compose)）；
- 服务器需能访问 GitHub（默认检查 `api.github.com`；可在内网自建更新源后通过 `config.yaml` 的 `update.api_base` 指向它）；
- 建议更新前照常备份数据库——在线更新只回滚程序本体，**不回滚数据库结构**。
:::

### 方式二：手动替换二进制

适合 Windows 服务器、或服务器无法访问更新源的情况：

```bash
systemctl stop team-api
# 下载新版本并校验（见「获取与校验」），替换二进制
tar -xzf team-api-<新版本>-linux-amd64.tar.gz -C /opt/team-api --strip-components=1
systemctl start team-api    # 启动时自动执行增量迁移
```

替换前建议先备份数据库（`pg_dump`）。回滚则换回旧二进制重启。

::: warning 两种方式共用的约束
**应用回滚不会自动回滚数据库结构**——新版本执行过不兼容迁移时，旧版本可能无法启动，需从数据库备份恢复，或用 `./team-api migrate down` 手动回退迁移。
:::

## 下一步

- 公网暴露前配置 [Nginx 反向代理](/deploy/nginx)（流式接口需关闭缓冲）
- [systemd 进程守护](/deploy/systemd) · [Supervisor 进程守护](/deploy/supervisor) —— 进程托管进阶配置
- [运行配置 config.yaml](/config/config-yaml) —— 连接池调优、审计库拆分、Redis AOF 建议
- [源码编译](/deploy/source) —— 需要二次开发时的完整工具链
