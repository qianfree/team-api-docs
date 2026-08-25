---
title: 源码编译
---

# 源码编译

适合需要**二次开发**（修改业务逻辑、增删功能）或**自定义构建**（私有化定制、CI 集成）的用户。只需部署官方版本的话，优先选择 [Docker Compose](/deploy/docker-compose) 或[二进制部署](/deploy/binary)。

技术栈：后端 Go 1.25 + GoFrame v2，前端 Vue 3 + Vite（管理后台与租户控制台两个独立 SPA），构建统一走 Makefile。

## 环境要求

| 工具 | 版本 | 用途 |
|------|------|------|
| Go | 1.25+ | 后端编译与运行 |
| Bun | 1+ | 前端依赖安装与构建（两个控制台均使用 `bun.lock`） |
| GNU Make | 3.8+ | 一键构建流程 |
| GoFrame CLI（`gf`） | 最新 | 热重载开发（`make run`）与代码生成，可选但推荐 |
| Git | 任意 | 获取源码 |
| PostgreSQL / Redis | 15+ / 7+ | 运行依赖，可用 Docker 起本地实例（见下） |

安装 GoFrame CLI：

```bash
go install github.com/gogf/gf/cmd/gf/v2@latest
```

## 获取源码

```bash
git clone https://github.com/qianfree/team-api.git
cd team-api
```

仓库无子模块，普通 `git clone` 即可。

## 准备基础设施

本地开发需要 PostgreSQL 与 Redis。官方 `manifest/docker/docker-compose.yaml` 面向完整部署（未向宿主机暴露数据库端口），开发时推荐单独写一个仅含基础设施的 `docker-compose.dev.yaml`：

```yaml
services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_USER: team_api
      POSTGRES_PASSWORD: team_api_dev
      POSTGRES_DB: team_api
    ports:
      - "5432:5432"      # 暴露给宿主机上的本地后端
    volumes:
      - pg_dev_data:/var/lib/postgresql

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass redis_dev
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data

volumes:
  pg_dev_data:
  redis_dev_data:
```

```bash
docker compose -f docker-compose.dev.yaml up -d
```

已有数据库实例（云服务、自建）的话直接复用，跳过本节。

## 配置

GoFrame 在源码目录下优先读取 `manifest/config/config.yaml`：

```bash
cp manifest/config/config.example.yaml manifest/config/config.yaml
```

按上一节的本地基础设施修改连接信息：

```yaml
database:
  default:
    link: "pgsql:team_api:team_api_dev@tcp(127.0.0.1:5432)/team_api?sslmode=disable"

redis:
  default:
    address: "127.0.0.1:6379"
    pass: "redis_dev"

jwt:
  secret: "本地开发密钥"

crypto:
  encryptionKey: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"  # 本地开发可用示例值
```

完整配置项说明见 [运行配置 config.yaml](/config/config-yaml)。

## 数据库迁移

迁移脚本在 `migrations/` 目录，由 [Goose](https://github.com/pressly/goose) 版本化管理。**三种执行方式**：

```bash
# 方式一：启动应用时自动执行（最常用——开发时直接启动即可，空库自动建表）
go run main.go

# 方式二：Makefile（在项目根目录 .env 中写 DB_URL）
make migrate-up        # 前进 / status 查看 / down 回退 / reset 重置

# 方式三：编译后的二进制内置 migrate 子命令
go run main.go migrate status
```

Makefile 依赖的 `.env` 格式（与 `.env` 三选一的配置方式见 Makefile 注释）：

```bash
DB_URL="host=127.0.0.1 port=5432 user=team_api password=team_api_dev dbname=team_api sslmode=disable"
```

## 开发模式

### 后端热重载

```bash
make run        # 等同 gf run main.go，改代码自动重编译重启
```

服务监听 `http://127.0.0.1:18888`。此时是**非 embedweb 构建**，浏览器直接访问根路径看到的是项目介绍页（landing page），属正常现象——前端由开发服务器承载。

### 前端开发服务器

两个控制台分别启动（各自代理 `/api` 到本地 18888，租户端额外代理 `/v1`）：

```bash
# 终端一：管理后台 → http://localhost:4001
cd web/admin && bun install && bun dev

# 终端二：租户控制台 → http://localhost:4002
cd web/tenant && bun install && bun dev
```

开发时浏览器访问 `4001` / `4002` 端口，而非 `18888`。

## 生产构建

```bash
# 仅构建后端二进制（前端不嵌入，适合前端由 Nginx / CDN 独立托管）
make build

# 前后端一体：先构建前端，再以 embedweb 标签嵌入二进制（单文件部署形态）
make build-all
```

产物为项目根目录的 `team-api`（Windows 下 `team-api.exe`），版本号取自 `git describe --tags` 并通过 ldflags 注入。`make build-all` 产物与官方 Release 等价，后续按[二进制部署](/deploy/binary)的方式运行即可。

### 交叉编译

在任意平台上构建其他目标平台的二进制：

```bash
make build-all GOOS=linux  GOARCH=amd64   # Linux x86_64 服务器
make build-all GOOS=linux  GOARCH=arm64   # ARM 服务器 / 树莓派
make build-all GOOS=darwin GOARCH=arm64   # macOS Apple Silicon
make build-all GOOS=windows GOARCH=amd64  # Windows
```

### 构建加速说明

Makefile 默认面向国内网络：`GOPROXY=https://goproxy.cn,direct`、Bun 走 npmmirror。海外环境显式覆盖：

```bash
make build-all GOPROXY=https://proxy.golang.org,direct BUN_REGISTRY=https://registry.npmjs.org
```

## 代码生成

项目遵循 GoFrame 工程规范，API、数据访问层与服务接口由 CLI 生成，改表或加接口后重新生成：

```bash
make ctrl      # gf gen ctrl    —— 由 API 定义生成控制器骨架
make dao       # gf gen dao     —— 由数据表生成 dao/do/entity
make service   # gf gen service —— 由逻辑层生成服务接口
```

## 构建 Docker 镜像

```bash
# 构建 + 启动（多阶段：bun 前端 → Go 编译 → Alpine 运行时）
make docker-rebuild

# 或直接用 compose 的 build profile
docker compose --profile build up -d --build
```

构建参数（`GOPROXY`、`BUN_CONFIG_REGISTRY`）与镜像结构详见 [Docker Compose 部署 · 从源码构建镜像](/deploy/docker-compose#从源码构建镜像)。

## 下一步

- [二进制部署](/deploy/binary) —— `make build-all` 产物的运行与 systemd 托管
- [管理后台](/guide/admin/) · [租户控制台](/guide/tenant/) —— 初始化后的功能使用说明
- [架构概览](/intro/architecture) —— 改代码前建议先读的核心模块与计费链路
