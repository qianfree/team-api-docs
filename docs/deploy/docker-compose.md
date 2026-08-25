---
title: Docker Compose 部署
---

# Docker Compose 部署（推荐）

Docker Compose 是官方推荐的部署方式：一条命令拉起 PostgreSQL + Redis + Team-API 完整栈，无需手动安装数据库和编译环境，升级也只是拉取新镜像。**只需要两个文件**（`docker-compose.yaml` 与 `config.yaml`），无需克隆整个仓库。

三种部署方式对比：

| 方式 | 适用场景 | 特点 |
|------|---------|------|
| **Docker Compose（本页）** | 标准生产部署 | 全栈一键编排，升级回滚简单 |
| [二进制部署](/deploy/binary) | 无 Docker 环境的服务器 | 单文件二进制 + 外部数据库，systemd 托管 |
| [源码编译](/deploy/source) | 二次开发、自定义构建 | 完整工具链，可改代码后构建 |

## 环境要求

- **Docker 20.10+ 与 Docker Compose v2**（即 `docker compose` 子命令，旧版 `docker-compose` 独立二进制不再推荐）
- 硬件建议 **2 核 4G 起步，磁盘 20G+**（含数据库与日志空间）
- 放行 **18888 端口**（应用监听端口，可自行修改映射）
- 架构支持 **linux/amd64、linux/arm64**（官方镜像为多架构镜像，树莓派 / ARM 服务器可直接使用）

::: tip 国内镜像加速
官方镜像托管在 Docker Hub（`qian5/team-api`）。国内拉取缓慢时可配置 Docker 镜像加速器，或使用代理拉取后 `docker tag`。
:::

## 快速部署

### 1. 创建部署目录并下载配置文件

```bash
mkdir team-api && cd team-api

# 下载编排文件与示例配置
curl -O https://raw.githubusercontent.com/qianfree/team-api/main/manifest/docker/docker-compose.yaml
curl -o config.yaml https://raw.githubusercontent.com/qianfree/team-api/main/manifest/docker/config.example.yaml
```

编排文件包含三个服务：

| 服务 | 镜像 | 说明 |
|------|------|------|
| `postgres` | `postgres:18-alpine` | 业务主库，数据落在 `postgres_data` 卷 |
| `redis` | `redis:7-alpine` | 额度账本与缓存，已开启 AOF 持久化（`--appendonly yes`） |
| `app` | `qian5/team-api` | Team-API 网关，前端已嵌入镜像，监听 `18888` |

### 2. 修改 `config.yaml`

编辑 `config.yaml`，至少修改以下四处（文件内有 `请修改` 标注）：

```yaml
# 1. 数据库连接 —— 密码与 docker-compose.yaml 中的 POSTGRES_PASSWORD 保持一致
database:
  default:
    link: "pgsql:team_api:你的强密码@tcp(postgres:5432)/team_api?sslmode=disable"

# 2. Redis 密码 —— 与 docker-compose.yaml 中 --requirepass 保持一致
redis:
  default:
    address: "redis:6379"
    pass: "你的Redis密码"

# 3. JWT 密钥 —— 用于签发登录会话令牌
jwt:
  secret: "随机强密钥"            # 如：openssl rand -hex 32 生成

# 4. 加密密钥 —— 必填！用于加密存储 API Key、渠道密钥等敏感字段
crypto:
  encryptionKey: "64位十六进制密钥"  # openssl rand -hex 32 生成
```

::: warning 务必备份加密密钥
`crypto.encryptionKey` 用于 AES-256 加密存储租户 API Key 原值、上游渠道密钥等敏感数据。**密钥丢失后这些数据将无法解密**，只能全部重新录入。请将 `config.yaml`（连同数据库）纳入备份。
:::

### 3. 同步修改 `docker-compose.yaml` 中的密码

两处密码必须与 `config.yaml` 一致，否则应用连不上数据库：

```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: 你的强密码   # 与 database.default.link 中一致

redis:
  command: redis-server --appendonly yes --requirepass 你的Redis密码
```

::: tip 关于数据库版本
编排内置 PostgreSQL 18（默认启用 SCRAM-SHA-256 认证与数据校验和）。若已有自建 PostgreSQL 15+ 实例，可从 `docker-compose.yaml` 中删掉 `postgres` 服务，把 `database.default.link` 指向外部实例，效果等同。
:::

### 4. 启动

```bash
docker compose up -d
```

首次启动会依次拉取镜像、创建数据卷、等待数据库与 Redis 健康检查通过后再启动应用。应用启动时会**自动执行数据库迁移**（Goose 版本化管理），无需手动建表。

### 5. 验证

```bash
# 查看三个容器状态（应均为 healthy / running）
docker compose ps

# 健康检查接口，返回 {"status":"ok","version":"..."}
curl http://localhost:18888/api/health

# 跟踪启动日志
docker compose logs -f app
```

## 首次初始化

首次部署时数据库中没有管理员账号，系统会自动进入**初始化模式**——除初始化接口外所有请求被拦截。两种方式完成初始化：

**方式一：初始化向导（推荐）**

浏览器访问 `http://<服务器IP>:18888`，会自动跳转到 `/setup` 向导，按提示创建管理员账号即可。完成后系统立即正常运行。

**方式二：环境变量自动初始化**

适合无人值守部署。在 `docker-compose.yaml` 的 `app.environment` 中添加：

```yaml
    environment:
      TZ: Asia/Shanghai
      INIT_ADMIN_USERNAME: admin@example.com
      INIT_ADMIN_PASSWORD: "强密码"
```

应用启动时检测到这两个变量且系统中无管理员，会自动创建账号（已有管理员时跳过，不会覆盖）。

初始化完成后：

- **管理后台**：`http://<服务器IP>:18888/admin/`
- **租户控制台**：`http://<服务器IP>:18888/`

后续的租户创建、渠道配置、Key 签发等操作见[管理后台](/guide/admin/)与[租户控制台](/guide/tenant/)。

## 数据持久化

三个数据卷由 Docker 管理，删除容器不丢数据（`docker volume ls` 中的实际名称带项目名前缀，如 `team-api_postgres_data`）：

| 卷 | 内容 | 说明 |
|----|------|------|
| `postgres_data` | PostgreSQL 数据目录 | 业务数据与计费流水，**必须备份** |
| `redis_data` | Redis AOF 文件 | 额度账本权威状态，计费相关已开启 AOF |
| `app_logs` | 应用日志 | 按天轮转，单文件 100MB / 保留 30 天（见 `config.yaml` 中 `logger`） |

### 备份与恢复

```bash
# 备份数据库（建议加入 cron 定时执行）
docker compose exec -T postgres pg_dump -U team_api team_api | gzip > backup-$(date +%F).sql.gz

# 恢复
gunzip -c backup-2026-01-01.sql.gz | docker compose exec -T postgres psql -U team_api team_api
```

::: warning
`docker compose down -v` 会**同时删除数据卷**，执行前请确认已备份。
:::

## 版本升级与回滚

### 升级

镜像标签约定：`latest`（最新稳定版）、`0.2`（次版本线）、`0.2.12`（精确版本）。生产环境建议**锁定精确版本**，避免 `latest` 意外升级。

```bash
# 指定版本（写入 .env 或导出环境变量均可）
echo "VERSION=0.2.12" >> .env

docker compose pull app     # 只更新应用镜像
docker compose up -d        # 重建 app 容器
```

新版本启动时会自动执行增量数据库迁移，完成后即可正常服务。

::: tip 管理后台的更新入口
管理后台左上角 Logo / 版本号处同样有「检查更新」入口，窗口内会标注当前部署模式。Docker 模式**不支持在线更新**，窗口会直接提示执行上面的 `docker compose pull && docker compose up -d`；只有[二进制部署](/deploy/binary)支持在界面内一键在线更新与回滚。
:::

::: tip 为什么只 `pull app`
`docker compose pull` 不带参数会把 PostgreSQL、Redis 镜像一并更新。数据库大版本升级可能引入不兼容变更（如认证插件、默认参数），官方建议**只在需要时手动升级数据库镜像**，日常升级仅更新 `app`。
:::

### 回滚

```bash
# 1. 回滚前先备份数据库（见上一节）

# 2. 改回旧版本号并重启
echo "VERSION=0.2.11" >> .env
docker compose up -d
```

数据库迁移由 Goose 按版本顺序向前执行，**回滚应用版本不会自动回滚数据库结构**。若新版本已执行了不兼容的迁移，旧版本可能无法启动——这就是回滚前务必备份的原因。也可以手动回退迁移（谨慎操作）：

```bash
docker compose exec app ./team-api migrate status   # 查看迁移版本
docker compose exec app ./team-api migrate down     # 回退上一次迁移
```

## 从源码构建镜像

适合修改过代码或无法访问 Docker Hub 的场景：

```bash
git clone https://github.com/qianfree/team-api.git
cd team-api

# 方式一：compose 直接构建并启动
docker compose --profile build up -d --build

# 方式二：构建镜像推送到自己的 Registry
docker build -t your-registry/team-api:v0.2.12 \
  --build-arg VERSION=v0.2.12 \
  -f manifest/docker/Dockerfile .
```

镜像为多阶段构建（bun 编译前端 → Go 编译后端 → Alpine 运行），支持两个构建参数加速国内构建：

| 构建参数 | 默认值 | 说明 |
|---------|--------|------|
| `GOPROXY` | `https://goproxy.cn,direct` | Go 模块代理 |
| `BUN_CONFIG_REGISTRY` | `https://registry.npmmirror.com` | 前端 npm 镜像 |

海外服务器可显式覆盖：`--build-arg GOPROXY=https://proxy.golang.org,direct --build-arg BUN_CONFIG_REGISTRY=https://registry.npmjs.org`。

## 常用运维命令

| 命令 | 作用 |
|------|------|
| `docker compose ps` | 查看服务状态 |
| `docker compose logs -f app` | 跟踪应用日志 |
| `docker compose restart app` | 重启应用 |
| `docker compose down` | 停止并移除容器（数据卷保留） |
| `docker compose up -d` | 启动 / 应用编排变更 |
| `docker compose exec postgres psql -U team_api` | 进入数据库终端 |

## 下一步

- 公网暴露前配置 [Nginx 反向代理](/deploy/nginx)（流式接口需关闭缓冲），面板用户见[宝塔部署](/deploy/baota)
- [运行配置 config.yaml](/config/config-yaml) · [系统设置总览](/config/settings-overview)
- [管理后台](/guide/admin/) —— 创建租户、配置渠道、签发 Key
