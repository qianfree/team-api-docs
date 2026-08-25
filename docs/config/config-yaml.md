---
title: 运行配置 config.yaml
---

# 运行配置 config.yaml

`config.yaml` 是 Team-API 的**运行时配置文件**，由 GoFrame 配置组件（`g.Cfg`）加载，负责基础设施层的设置：服务监听、日志、数据库连接、Redis、JWT 密钥、字段加密密钥等。

它与「系统配置」的分工：

| | `config.yaml` 配置文件 | 系统配置（管理后台） |
|---|---|---|
| **管什么** | 基础设施：端口、数据库、Redis、密钥、日志 | 业务运营：限流、计费、通知、内容过滤等 |
| **改起来** | 编辑文件后重启进程 | 后台界面修改，实时热生效 |
| **存哪里** | 服务器文件 | 数据库 `sys_options` 表 |

::: tip
业务层面的可调参数（渠道调度策略、限流阈值、邮件发件箱、数据保留天数等）不在这份文件里——它们在管理后台「系统设置」界面中修改，实时生效，详见[系统设置总览](/config/settings-overview)。
:::

## 配置文件放在哪

GoFrame 按以下顺序搜索配置文件（找到即止）：

| 部署方式 | 推荐位置 |
|---|---|
| Docker Compose | 部署目录的 `config.yaml`，挂载进容器（见 [Docker Compose 部署](/deploy/docker-compose)） |
| 二进制部署 | 二进制同级目录 `config/config.yaml`（见 [二进制部署](/deploy/binary)） |
| 源码运行 | `manifest/config/config.yaml`（模板：`config.example.yaml`） |

也可用环境变量 `GF_GCFG_PATH` 直接指定配置文件绝对路径。

## 最小可用配置

只有 4 项是**必须修改**的，其余保持模板默认即可跑起来：

```yaml
database:
  default:
    link: "pgsql:team_api:你的数据库密码@tcp(127.0.0.1:5432)/team_api?sslmode=disable"

redis:
  default:
    address: "127.0.0.1:6379"

jwt:
  secret: "随机强密钥"              # openssl rand -hex 32 生成

crypto:
  encryptionKey: "64位十六进制密钥"  # openssl rand -hex 32 生成
```

其中 `jwt.secret` 与 `crypto.encryptionKey` 未配置或格式非法时**程序会直接拒绝启动**（避免带着弱密钥上线）。

## 完整配置示例

以下是全部配置项的完整示例（合并自官方模板，可直接复制后按需删改）：

```yaml
# ── 服务 ──────────────────────────────────────────────
server:
  address:                 ":18888"
  openapiPath:             "/api.json"
  swaggerPath:             "/swagger"
  serverAgent:             "team-api"
  dumpRouterMap:           false
  accessLogEnabled:        true
  errorLogEnabled:         true
  gracefulShutdownTimeout: 30

# ── 日志 ──────────────────────────────────────────────
logger:
  level:                "all"
  stdout:               true
  ctxKeys:              ["RequestId"]
  path:                 "/app/logs"
  file:                 "{Y-m-d}.log"
  rotateSize:           "100MB"
  rotateExpire:         "1d"
  rotateBackupLimit:    30
  rotateBackupExpire:   "30d"
  rotateBackupCompress: 9

# ── 数据库（PostgreSQL）──────────────────────────────
database:
  default:
    type:        "pgsql"
    link:        "pgsql:team_api:密码@tcp(127.0.0.1:5432)/team_api?sslmode=disable"
    timezone:    "Asia/Shanghai"
    debug:       false
    dryRun:      false
    maxIdle:     10
    maxOpen:     100
    maxLifetime: "30s"

  # 审计日志独立库（可选，见下文「审计库分流」）
  # audit:
  #   type:        "pgsql"
  #   link:        "pgsql:team_api:密码@tcp(127.0.0.1:5432)/team-api-audit?sslmode=disable"
  #   timezone:    "Asia/Shanghai"
  #   maxIdle:     10
  #   maxOpen:     50
  #   maxLifetime: "5m"

# ── Redis ─────────────────────────────────────────────
redis:
  default:
    address: "127.0.0.1:6379"
    pass:    ""
    db:      0

# ── 缓存 ──────────────────────────────────────────────
cache:
  default:
    adapter: "redis"

# ── JWT 认证 ──────────────────────────────────────────
jwt:
  secret:              "openssl rand -hex 32 生成"
  accessTokenExpire:   "12h"
  refreshTokenExpire:  "7d"
  issuer:              "team-api"
  adminMaxSessions:    5
  tenantMaxSessions:   10

# ── 字段加密 ──────────────────────────────────────────
crypto:
  encryptionKey: "openssl rand -hex 32 生成"

# ── 演示模式（只读）──────────────────────────────────
demo:
  enabled: false
  message: "演示环境，数据不可修改"

# ── 出站代理（国内访问 Google/Anthropic 等上游）──────
channel_proxy_url: ""

# ── 在线更新源覆盖（可选）────────────────────────────
update:
  api_base: ""
```

下面按配置块逐一讲解。

## server — 服务

| 配置项 | 默认 / 示例 | 说明 |
|---|---|---|
| `address` | `":18888"` | 监听地址与端口。`:18888` 表示所有网卡；只监听本机改 `127.0.0.1:18888` |
| `openapiPath` | `"/api.json"` | OpenAPI 文档 JSON 路径，留空关闭 |
| `swaggerPath` | `"/swagger"` | Swagger UI 路径，留空关闭 |
| `serverAgent` | `"team-api"` | 服务标识，出现在响应头 `Server` 与日志中 |
| `dumpRouterMap` | `false` | 启动时是否打印完整路由表（排障用） |
| `accessLogEnabled` | `true` | 是否记录访问日志 |
| `errorLogEnabled` | `true` | 是否记录错误日志 |
| `gracefulShutdownTimeout` | `30` | 收到退出信号后等待存量请求完成的秒数，超时强制断开 |

::: warning 不要给 server 设置写超时
`writeTimeout` / `readTimeout` 保持默认 `0` 即可。流式 SSE 响应（对话打字机效果）没有固定时长，设置写超时会导致长对话输出被中途掐断。
:::

## logger — 日志

| 配置项 | 默认 / 示例 | 说明 |
|---|---|---|
| `level` | `"all"` | 日志级别：`all` / `debug` / `info` / `notice` / `warning` / `error` / `critical`，输出该级别及更严重级别 |
| `stdout` | `true` | 是否同时输出到控制台（Docker 下 `docker compose logs` 能看到的关键） |
| `ctxKeys` | `["RequestId"]` | 从请求上下文提取并附加到每条日志的字段，用于全链路追踪 |
| `path` | `"/app/logs"` | 日志落盘目录；**留空则只输出 stdout 不落盘**。Docker 部署建议指向挂载卷 |
| `file` | `"{Y-m-d}.log"` | 日志文件名，支持日期模板变量 |
| `rotateSize` | `"100MB"` | 单文件超过该大小触发轮转 |
| `rotateExpire` | `"1d"` | 按时间轮转（与大小轮转先到先触发） |
| `rotateBackupLimit` | `30` | 轮转后最多保留的备份文件数 |
| `rotateBackupExpire` | `"30d"` | 备份文件超期自动删除 |
| `rotateBackupCompress` | `9` | 备份 gzip 压缩级别，`0` 不压缩 |

::: tip 按级别分文件
GoFrame 支持在同一 `logger` 下定义命名日志分组（如 `logger1` / `logger2` 分别写 `info.log` 与 `error.log`）。Team-API 默认模板把全部日志写到一个文件按天轮转；开发环境可参考源码仓库 `manifest/config/config.yaml` 中的分组写法。
:::

## database — 数据库

PostgreSQL 是唯一支持的数据库（15+）。分为两个**分组（group）**：

| 分组 | 必填 | 用途 |
|---|---|---|
| `default` | ✅ | 业务主库：租户、渠道、计费、额度等全部业务表 |
| `audit` | ❌ | 审计独立库（可选），见下方「审计库分流」 |

每个分组的参数：

| 配置项 | 默认 / 示例 | 说明 |
|---|---|---|
| `type` | `"pgsql"` | 数据库类型，固定 `pgsql` |
| `link` | 见下方格式 | 连接串，格式 `pgsql:用户名:密码@tcp(主机:端口)/库名?参数` |
| `timezone` | `"Asia/Shanghai"` | 数据库会话时区，影响时间字段的读写格式 |
| `debug` | `false` | 开发排障用：打印每条执行的 SQL |
| `dryRun` | `false` | 只构建 SQL 不执行（危险，仅调试用） |
| `maxIdle` | `10` | 连接池最大空闲连接数 |
| `maxOpen` | `100` | 连接池最大打开连接数 |
| `maxLifetime` | `"30s"` | 连接最长复用时间，超时后重建 |

::: tip 密码含特殊字符时
`link` 中的密码若含 `@` `:` `/` 等字符容易解析出错，可改用拆分写法，效果等同：

```yaml
database:
  default:
    type: "pgsql"
    host: "127.0.0.1"
    port: "5432"
    user: "team_api"
    pass: "p@ss:word/!"
    name: "team_api"
    timezone: "Asia/Shanghai"
```
:::

::: details sslmode 参数
`link` 末尾的 `?sslmode=disable` 表示不加密数据库连接。同机 / 内网部署可用 `disable`；跨公网连数据库应改为 `require` 或 `verify-full` 并配置证书。
:::

### 审计库分流（database.audit）

大模型请求审计表 `aud_request_logs` 的写入量远大于其他表（每笔调用一条，含请求响应体）。配置 `audit` 分组后：

- `aud_request_logs` **单独写入审计库**，与业务主库彻底隔离；
- 其余 `aud_*` 审计表（操作审计等）仍在主库；
- 审计库需要**手动执行建表脚本**（主仓库 `docs/audit-db-schema.sql`），应用启动迁移只管主库；
- 配了独立审计库时，审计日志按审计规则**完整记录不截断**；未配置时受主库审计级别（`audit_level` 系统配置）控制。

适用场景：多实例部署日志量大、需要给审计数据单独配置保留策略或归档到低成本存储。

## redis — 缓存与额度账本

| 配置项 | 默认 / 示例 | 说明 |
|---|---|---|
| `address` | `"127.0.0.1:6379"` | Redis 地址，格式 `host:port` |
| `pass` | 空 | Redis 密码（`requirepass`），无密码留空或省略 |
| `db` | `0` | 选择的逻辑库编号 |

Redis 在 Team-API 中不只是缓存，还承担：

- **钱包 / 额度的权威状态**：扣费、预扣等原子操作在 Redis 完成，再由后台任务定期物化回 PostgreSQL（所以生产环境务必开启 AOF 持久化，丢 Redis 等于丢账）；
- **系统配置与业务缓存**（L2 层）；
- **分布式锁与跨实例事件广播**（配置变更失效通知等）。

## cache — 缓存适配器

```yaml
cache:
  default:
    adapter: "redis"
```

| 配置项 | 说明 |
|---|---|
| `adapter` | 缓存后端，固定 `"redis"`。Team-API 使用「进程内存（L1）+ Redis（L2）」双层缓存，多实例部署时靠 Redis Pub/Sub 广播 L1 失效事件保证一致性 |

该项保持默认即可，无需修改。

## jwt — 登录会话

| 配置项 | 默认 / 示例 | 说明 |
|---|---|---|
| `secret` | **必填** | JWT 签名密钥。未配置时程序拒绝启动。**修改后所有已登录会话立即全部失效**（用户需要重新登录） |
| `accessTokenExpire` | `"12h"`（未配置时 `30m`） | 访问令牌有效期，Go 的时长格式（`30m` / `12h` / `720h`） |
| `refreshTokenExpire` | `"7d"`（未配置时 `7d`） | 刷新令牌有效期，格式支持 `h` / `d` |
| `issuer` | `"team-api"` | 令牌签发者标识（`iss` 声明） |
| `adminMaxSessions` | `5` | 管理后台单账号最大并发会话数，超出踢掉最早的会话 |
| `tenantMaxSessions` | `10` | 租户控制台单用户最大并发会话数 |

管理后台与租户控制台是**两套独立的用户体系**，会话上限也分别设置。

## crypto — 字段加密密钥

| 配置项 | 说明 |
|---|---|
| `encryptionKey` | **必填**。AES-256-GCM 密钥，32 字节以 hex 编码 = **64 个十六进制字符**。生成命令：`openssl rand -hex 32` |

用于加密存储数据库中的敏感字段：

- 上游**渠道密钥**（`chn_channel_keys.encrypted_key`）
- 租户 **API Key 原值**（`api_keys.encrypted_key`）

启动时会校验密钥格式，缺失或长度不对直接退出。**该密钥丢失后已加密数据无法解密**，渠道密钥和 API Key 只能全部重新录入——请将 `config.yaml` 与数据库一起纳入备份。

## demo — 演示模式

| 配置项 | 默认 | 说明 |
|---|---|---|
| `enabled` | `false` | 开启后**拦截所有写操作**，全站只读，前端显示水印 |
| `message` | `"演示环境，数据不可修改"` | 拦截写操作时返回的提示文案 |

搭建公开演示站时使用。注意演示模式**只能在配置文件里设置**（管理后台改不了自己，避免演示模式下把自己锁死）。修改后重启生效。

## channel_proxy_url — 出站代理

```yaml
channel_proxy_url: "http://127.0.0.1:7897"
```

Team-API 作为客户端访问上游大模型（Google、Anthropic 等）时使用的 HTTP 代理。国内服务器无法直连这些上游时配置，支持 `http://` 与 `socks5://`。留空表示直连。

- 只影响**网关转发请求的上游方向**，不影响用户访问 Team-API 自身；
- 修改后约 **10 秒内自动生效**，无需重启。

## update — 在线更新源（可选）

| 配置项 | 说明 |
|---|---|
| `api_base` | 检查更新的 API 基地址。默认官方 GitHub API，留空即可。内网 / 无法访问 GitHub 的环境可指向自建发布服务器或镜像 |

仅[二进制部署](/deploy/binary)的「在线更新」功能使用；Docker 部署通过拉取镜像升级，不涉及此项。

## 低频可选配置

以下配置项模板中没有列出，按需添加：

### email.smtp — 监控告警邮件

```yaml
email:
  smtp:
    host: "smtp.example.com"
    port: 465
    username: "alert@example.com"
    password: "授权码"
    from: "alert@example.com"
```

监控告警引擎给管理员发告警邮件时使用。**注意**：验证码、通知等业务邮件的发件箱在管理后台「系统配置 → 邮件」中设置（存数据库），与此处独立。

### sandbox — Playground 沙箱额度

```yaml
sandbox:
  sandbox_default_quota: 100
```

租户控制台 Playground（调试对话）的默认沙箱额度，小于等于 0 时取默认值 `100`。

## 生产环境检查清单

部署上线前过一遍：

- [ ] `jwt.secret` 与 `crypto.encryptionKey` 均已用 `openssl rand -hex 32` 重新生成，且**已离线备份**
- [ ] 数据库、Redis 密码均为强密码，与 `docker-compose.yaml` 中的设置一致
- [ ] `logger.path` 指向持久化目录（Docker 下为挂载卷），轮转策略符合磁盘预算
- [ ] Redis 已开启 AOF 持久化（额度账本在 Redis）
- [ ] 公网直连数据库的场景改用 `sslmode=require`
- [ ] 需要审计合规时评估配置 `database.audit` 独立审计库

## 下一步

- [数据库映射配置 hack/config.yaml](/config/hack-config-yaml) —— 二次开发时的代码生成配置
- [系统设置总览](/config/settings-overview) —— 管理后台可热修改的业务配置
- [存储配置](/config/settings-storage) —— 对象存储（文件 / 图片）接入
