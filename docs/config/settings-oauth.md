---
title: 第三方登录
---

# 第三方登录

**管理后台 → 系统设置 → 第三方登录**

允许租户用户使用 GitHub / Google 账号登录租户控制台，免去注册流程。

## 通用设置

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `oauth_auto_register` OAuth 自动注册 | 关 | 开启后，用户**首次**用 OAuth 登录时自动创建租户账号并直接登录；关闭时未绑定过 OAuth 的用户无法登录 |
| `oauth_tenant_code` OAuth 默认租户代码 | 空 | 自动注册的账号挂靠到哪个租户。填**已存在**的租户代码；租户不存在时自动注册会失败 |

::: warning
`oauth_auto_register` 开启但 `oauth_tenant_code` 留空或指向不存在的租户时，新用户 OAuth 登录会报错。请先在管理后台创建该租户再回来填写。
:::

## GitHub

| 配置项 | 说明 |
|---|---|
| `oauth_github_enabled` 启用 GitHub 登录 | 总开关。后端在发起授权时校验，关闭或凭据为空时接口返回「该 OAuth 供应商未启用」 |
| `oauth_github_client_id` Client ID | GitHub OAuth App 的 Client ID（敏感字段，回显掩码） |
| `oauth_github_client_secret` Client Secret | GitHub OAuth App 的 Client Secret（敏感字段） |

### 接入步骤

1. 在 [GitHub → Settings → Developer settings → OAuth Apps](https://github.com/settings/developers) 新建 OAuth App；
2. **Authorization callback URL** 填写：`https://<你的租户控制台域名>/api/tenant/oauth/github/callback`；
3. 把生成的 Client ID / Client Secret 填入本页并打开启用开关；
4. 国内服务器访问 GitHub 慢或超时的，需配置[渠道代理](/config/config-yaml#channel-proxy-url-出站代理)。

## Google

| 配置项 | 说明 |
|---|---|
| `oauth_google_enabled` 启用 Google 登录 | 总开关，行为同 GitHub |
| `oauth_google_client_id` Client ID | Google OAuth 客户端 ID（敏感字段） |
| `oauth_google_client_secret` Client Secret | Google OAuth 客户端密钥（敏感字段） |

### 接入步骤

1. 在 [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 创建 OAuth 客户端（Web 应用类型）；
2. **已获授权的重定向 URI** 填写：`https://<你的租户控制台域名>/api/tenant/oauth/google/callback`；
3. 填入凭据并启用。

::: tip
回调地址的域名必须与用户实际访问租户控制台的域名一致（HTTPS），否则 GitHub / Google 会拒绝回调。
:::
