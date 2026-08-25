---
title: 安全配置
---

# 安全配置

**管理后台 → 系统设置 → 安全配置**

账号与会话层面的安全策略：多端会话上限、登录防爆破、密码强度、人机验证。

## 会话管理

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `max_sessions_per_user` 租户用户最大会话数 | `10` | 单个租户用户同时在线的会话数上限（多标签页 / 多设备），超出时最早的会话被踢下线，范围 1–100 |
| `admin_max_sessions` 管理员最大会话数 | `5` | 单个管理员账号的会话上限，范围 1–50 |

::: warning 生效值以配置文件为准
当前版本会话上限的**实际生效值**读取自 [config.yaml 的 `jwt.adminMaxSessions` / `jwt.tenantMaxSessions`](/config/config-yaml#jwt-登录会话)。本页两项与配置文件语义相同，修改前请先同步更新配置文件，避免界面与实际行为不一致。
:::

## 登录安全

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `login_max_attempts` 登录最大尝试次数 | `5` | 连续密码错误的次数上限，达到后触发锁定，范围 1–30 |
| `login_lockout_minutes` 登录锁定时长（分钟） | `30` | 触发锁定后该账号在此时长内禁止再试，范围 1–1440 |

组合起来就是防暴力破解策略：默认「连错 5 次锁 30 分钟」。锁定按账号计，攻击者换 IP 也绕不开；需要更严格可将锁定时长上调到数小时。

## 密码策略

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `password_min_length` 密码最小长度 | `8` | 创建账号 / 修改密码时的最小长度校验，范围 6–32 |

::: tip
只约束长度，不含复杂度（大小写 / 符号）要求。内部运营平台可上调到 12。
:::

## 滑块验证码

登录、注册、重置密码时必须完成滑块验证。

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `captcha_expire_seconds` 验证码有效期（秒） | `300` | 滑块验证通过结果的有效期，过期需重新滑一次，范围 60–600 |

## Turnstile 人机验证

集成 [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) 替代 / 加强滑块验证，防止自动化攻击。

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `turnstile_enabled` 启用 Turnstile | 关 | 开启后登录 / 注册等表单改用 Turnstile 组件 |
| `turnstile_site_key` Site Key | 空 | Turnstile Widget 的站点密钥（公开，前端渲染组件用） |
| `turnstile_secret_key` Secret Key | 空 | 服务端校验用的密钥（敏感字段） |

接入：Cloudflare Dashboard → Turnstile → Add site，域名填控制台域名，把 Site Key / Secret Key 填入本页并启用。

## 登录通知

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `new_device_notification` 新设备登录通知 | 开 | 预留项：检测到新设备登录时邮件提醒用户（当前版本暂未接入生效） |

## 注册禁用词

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `register_forbidden_words` 禁用词列表 | `admin,system,root,api,test,administrator,管理员,系统` | 组织名称、组织代码、用户名中**包含**任一禁用词时禁止注册（不区分大小写），逗号分隔 |

用于防止用户注册 `admin`、`管理员` 等易混淆名称实施钓鱼。按需追加自有品牌词、客服 impersonation 词（如 `官方`、`客服`、`support`）。
