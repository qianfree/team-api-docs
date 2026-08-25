---
title: 系统设置总览
---

# 系统设置总览

**系统设置**是管理后台的全局配置中心：**管理后台 → 系统设置**，左侧为 12 个分类菜单，右侧编辑对应配置项，修改后点击「保存设置」即生效——**无需重启进程**。

它与 [运行配置 config.yaml](/config/config-yaml) 的分工：

| | 系统设置（本章节） | config.yaml 配置文件 |
|---|---|---|
| **管什么** | 业务运营：注册、登录、邮件、支付、限流、渠道调度、存储…… | 基础设施：监听端口、数据库连接、Redis、JWT / 加密密钥、日志 |
| **怎么改** | 管理后台界面修改，保存即热生效 | SSH 编辑文件，重启进程生效 |
| **存哪里** | PostgreSQL `sys_options` 表 | 服务器本地文件 |

## 运行机制

### 配置的存储与读取

每个配置项由后端**注册表**（schema）统一定义：键名、类型（string / int / float / bool / json）、默认值、所属分类、校验规则、是否敏感、是否公开。读取链路：

```
业务代码 → 配置服务 → L1 进程内存缓存 → L2 Redis → PostgreSQL(sys_options)
```

数据库中没有的键自动使用注册表默认值，因此**全新安装无需逐项配置**，只改关心的项即可。

### 保存即生效

点击「保存设置」后：

1. 逐项校验（类型、取值范围、枚举值，部分分类还有跨字段校验），任何一项不合法整批拒绝；
2. 写入 `sys_options` 表；
3. 清理本实例缓存，并通过 Redis Pub/Sub **广播到所有实例**失效各自的内存缓存——多实例部署下全部节点同步生效。

绝大多数配置**秒级生效**，个别有短暂延迟（各配置页中有标注）：

| 配置 | 生效延迟 |
|---|---|
| 渠道路由策略 | 保存后 30 秒内 |
| 渠道代理地址 | 约 10 秒（本地缓存 TTL） |
| 限流阈值（QPS / 并发） | 约 5 秒（限流配置快照） |

### 敏感字段

密码、密钥类字段（SMTP 密码、Client Secret、Access Key 等）回显为掩码 `******`。**保持掩码原样保存即表示「不修改」**，只有填入新值才会覆盖。

### 公开配置

标注为公开的配置项（站点名称、开放注册、维护模式、Turnstile 站点密钥等）会通过公开接口暴露给未登录的租户端页面使用——登录页的注册开关、维护横幅、人机验证组件都依赖它们。

## 分类总览

| 分类 | 内容概要 | 配置项数 |
|---|---|---|
| [基础配置](/config/settings-general) | 站点信息、注册策略与防刷、维护模式 | 13 |
| [第三方登录](/config/settings-oauth) | GitHub / Google OAuth 登录接入 | 8 |
| [邮件配置](/config/settings-email) | SMTP 发件服务器 | 6 |
| [安全配置](/config/settings-security) | 会话、登录防爆破、密码策略、人机验证 | 11 |
| [审计配置](/config/settings-audit) | 请求审计级别与留存 | 3 |
| [支付配置](/config/settings-payment) | 充值面额、折扣、汇率、支付说明 | 7 |
| [性能配置](/config/settings-performance) | 四级 QPS 限流、并发、超时、缓存、沙箱 | 17 |
| [内容过滤](/config/settings-content-filter) | 敏感词过滤策略 | 4 |
| [渠道配置](/config/settings-channel) | 渠道探测 / 禁用、路由策略、代理、协议转换 | 14 |
| [存储配置](/config/settings-storage) | S3 / MinIO / R2 / OSS / COS 对象存储 | 9 |
| [数据治理](/config/settings-data-governance) | 各类日志与文件的保留周期 | 8 |
| [用户协议](/config/settings-agreement) | 用户协议开关 | 1 |

## 通过 API 修改（自动化）

系统设置均有对应的管理端 API（需管理员登录态）：

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/admin/settings/categories` | 分类列表 |
| `GET` | `/api/admin/settings/{category}` | 读取某分类全部配置项（含 schema 与当前值） |
| `PUT` | `/api/admin/settings/{category}` | 批量保存，body 为 `{"settings": {"键": "值", ...}}` |

适合用脚本 / IaC 批量初始化配置。

## 部署环境变量

少量行为由**环境变量**控制（与系统设置、配置文件无关），仅在进程启动时读取：

| 变量 | 说明 |
|---|---|
| `INIT_ADMIN_USERNAME` / `INIT_ADMIN_PASSWORD` | 首次启动且系统无管理员时自动创建管理员（已有管理员则跳过），见 [Docker Compose 部署](/deploy/docker-compose#首次初始化) |
| `GF_GCFG_PATH` | 指定 config.yaml 的绝对路径（GoFrame 约定），见 [二进制部署](/deploy/binary) |
| `TZ` | 进程时区（容器部署建议设为 `Asia/Shanghai`） |

## 下一步

按分类逐页了解每项配置的作用，或从 [基础配置](/config/settings-general) 开始按顺序阅读。
