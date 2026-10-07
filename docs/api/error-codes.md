---
title: 错误码说明
---

# 错误码说明

AI 代理端点（`/v1/*`、`/v1beta/*`、`/v2/*`、`/suno/*`）的错误响应**与所调用协议的原生格式保持一致**，便于各生态客户端按习惯解析；平台级错误（余额、权限、限流等）会被转换为对应供应商的错误类型。

## 错误格式对照

### OpenAI 格式（默认）

`/v1/*`、`/v2/*`、`/suno/*` 端点：

```json
{
  "error": {
    "type": "invalid_request_error",
    "message": "余额不足，请联系管理员充值",
    "param": null,
    "code": null
  }
}
```

### Claude 格式

`/v1/messages` 端点：

```json
{
  "type": "error",
  "error": {
    "type": "authentication_error",
    "message": "余额不足，请联系管理员充值"
  }
}
```

### Gemini 格式

`/v1beta/*` 端点：

```json
{
  "error": {
    "code": 400,
    "message": "请求参数错误",
    "status": "INVALID_ARGUMENT"
  }
}
```

Gemini 格式的 `error.status` 使用 Google 规范值：`INVALID_ARGUMENT`（400 参数错误）、`UNAUTHENTICATED`（401 认证失败）、`PERMISSION_DENIED`（403 无权限）、`RESOURCE_EXHAUSTED`（429 限流 / 额度不足）、`INTERNAL`（500 内部错误）、`UNAVAILABLE`（503 服务不可用）。

## 错误类型总表

平台级错误在三种协议下的 `error.type` 取值一致：

| 场景 | `error.type` | HTTP | 说明与排查 |
|------|-------------|------|-----------|
| API Key 缺失 / 无效 / 过期 | `authentication_error` | 401 | 检查 `Authorization: Bearer sk-xxx` 是否正确、Key 是否已过期 |
| Key 已禁用 / 租户被停用 / 项目停用 | `permission_error` | 403 | 联系管理员启用 Key 或租户 |
| 无权使用该模型 | `permission_error` | 403 | 模型受「租户 → 成员 → Key」三层过滤，确认各层均已授权 |
| Key 为只读（`read_only`）| `permission_error` | 403 | 只读 Key 不能发起生成类请求 |
| IP 不在 Key 白名单 | `permission_error` | 403 | 核对 Key 配置的 IP 白名单（支持 CIDR） |
| 余额不足 / 额度耗尽 | `insufficient_quota` | 402 | 预扣失败，未产生消费；充值或调整额度后重试 |
| 请求参数错误 | `invalid_request_error` | 400 | 缺少必填字段、格式非法、模型不支持该参数 |
| 请求频率超限 | `rate_limit_error` | 429 | 触发 Key / 用户 / 租户级 QPS 或并发限额，响应头附 `X-RateLimit-*` |
| 没有可用渠道 | `server_error` | 503 | 模型未配置渠道或渠道全部不可用，联系管理员 |
| 上游供应商错误 | 原样透传上游错误类型 | 上游状态码 | 错误体保持上游原文，便于对齐供应商文档排障 |
| 平台内部错误 | `internal_error` | 500 | 携带 `X-Request-Id` 联系管理员排查 |

::: tip 上游错误透传
上游供应商（OpenAI / Anthropic / 阿里等）返回的错误**原样透传**，不做二次包装 —— 错误类型、状态码与官方文档一致。平台自身的网关错误（鉴权、额度、调度）才使用上表的平台错误类型。
:::

## 额度类错误细分

额度体系分层（Key 额度 → 用户余额 → 租户余额 → 项目预算），402 错误的 `message` 会说明具体层级：

| `message` 关键词 | 层级 |
|----------------|------|
| `API key quota exceeded` | Key 独立额度耗尽 |
| `insufficient balance` | 钱包余额不足 |
| `project budget exceeded` | 项目预算超支 |
| `insufficient quota` | 其他额度限制 |

异步任务（图像 / 视频 / 音乐）的计费为**提交时预扣、终态结算**：预扣失败返回 402（无消费）；任务失败或超时自动全额退还预扣额。

## 任务类接口特有错误码

图像与视频任务端点在通用错误之外，可能返回以下 `error.code`：

| HTTP | `error.code` | 端点 | 说明 |
|------|-------------|------|------|
| 400 | `image_async_disabled` | `POST /v1/images/generations/async` | 该同步模型未开启异步化，改用同步端点 |
| 400 | `file_id_not_supported` | `POST /v1/videos` | `input_reference.file_id` 不支持，改用文件上传或 `image_url` |
| 400 | `video_not_deletable` | `DELETE /v1/videos/{id}` | 仅终态（completed / failed）视频可删除 |
| 400 | `billing_pending` | `DELETE /v1/videos/{id}` | 计费未结算，稍后重试 |
| 400 | `video_not_ready` | `GET /v1/videos/{id}/content` | 视频尚未完成，不能下载 |
| 400 | `content_not_available` | `GET /v1/videos/{id}/content` | 该任务无成品直链 |
| 400 | `task_not_cancellable` | `DELETE /v2/video_generation/{id}` | 仅排队中的 MiniMax v2 任务可取消 |

## 排障指引

每个响应都携带 `X-Request-Id` 响应头，异步任务还可在查询响应中拿到 `task_` / `video_` 前缀的任务 ID。排障时：

1. **取 `X-Request-Id`**：控制台「请求审计日志」按请求 ID 检索，可看到完整的请求 / 响应体、命中的渠道与转发链路；
2. **任务类问题取任务 ID**：「异步任务」列表可看到上游任务状态、进度与结算记录；
3. **渠道侧问题**：管理端「渠道监控 / 渠道调试日志」可查看上游原始交互。

相关文档：[请求审计日志](/guide/tenant/request-audit-logs)、[渠道配置](/guide/admin/channels)。
