---
title: Anthropic Claude 接口
---

# Anthropic Claude 接口

Team-API 原生支持 **Anthropic Messages API** 协议（`POST /v1/messages`）。Claude 官方 SDK、Claude Code 及任意 Anthropic 兼容客户端，把 `base_url` 指向 Team-API 实例即可直连 —— 请求与响应均为 Claude 原生格式，**无需任何协议转换**。

上游渠道由平台的智能调度决定：同一模型名可路由到 Claude 官方渠道，也可按配置映射到其他供应商渠道。

## 接入说明

| 项目 | 说明 |
|------|------|
| Base URL | `https://your-domain`（SDK 中填 `https://your-domain`，SDK 自动拼接 `/v1/messages`） |
| 认证方式 | `x-api-key: sk-xxxx`（Claude 客户端习惯）或 `Authorization: Bearer sk-xxxx` |
| API Key | 租户控制台「Key 管理」中签发，格式 `sk-` 前缀 |
| 响应格式 | 错误响应与 Claude 结构一致：`{"type": "error", "error": {"type", "message"}}` |

```bash
curl https://your-domain/v1/messages \
  -H "x-api-key: sk-xxxx" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-5",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello, Claude"}]
  }'
```

::: tip
`anthropic-version` 请求头可传可不传，网关不做版本拦截。请求体中声明的模型名经过平台模型映射解析到实际渠道，与渠道类型解耦。
:::

## 接口总览

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/v1/messages` | 创建消息（支持流式 SSE） |

## 创建消息

```bash
POST /v1/messages
```

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `model` | string | ✅ | 模型名，如 `claude-sonnet-4-5`（按平台模型映射解析） |
| `messages` | array | ✅ | 消息数组，`role` 为 `user` / `assistant`，首条必须为 `user` |
| `max_tokens` | integer | ✅ | 最大生成 Token 数 |
| `system` | string / array | — | 系统提示词 |
| `temperature` | number | — | 采样温度，0 – 1 |
| `top_p` | number | — | 核采样参数（与 `top_k` 二选一） |
| `top_k` | integer | — | Top-K 采样 |
| `stop_sequences` | array | — | 自定义停止序列 |
| `stream` | boolean | — | `true` 时以 SSE 流式返回 |
| `tools` | array | — | 工具定义（`name` / `description` / `input_schema`） |
| `tool_choice` | object | — | 工具选择策略：`auto` / `any` / `tool` |
| `metadata` | object | — | 请求元数据 |

`content` 既可以是纯字符串，也可以是内容块数组（`text` / `image` / `tool_use` / `tool_result`），支持视觉输入与工具调用循环。

### 非流式响应

```json
{
  "id": "msg_xxxx",
  "type": "message",
  "role": "assistant",
  "model": "claude-sonnet-4-5",
  "content": [
    {"type": "text", "text": "Hello! How can I help you today?"}
  ],
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 12,
    "output_tokens": 15
  }
}
```

`stop_reason` 取值与 Claude 官方一致：`end_turn` / `max_tokens` / `stop_sequence` / `tool_use`。

### 流式响应

`"stream": true` 时以 `text/event-stream` 返回，事件序列与 Claude 官方协议一致：

```
event: message_start
data: {"type":"message_start","message":{"id":"msg_xxx","role":"assistant","usage":{"input_tokens":12,"output_tokens":1}}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hello"}}

event: content_block_stop
data: {"type":"content_block_stop","index":0}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":15}}

event: message_stop
data: {"type":"message_stop"}
```

工具调用场景下会推送 `input_json_delta` 增量，流式结束时网关解析真实 usage 完成计费结算。

## 错误响应

错误结构与 Claude 官方一致：

```json
{
  "type": "error",
  "error": {
    "type": "authentication_error",
    "message": "invalid API key"
  }
}
```

`error.type` 常见取值：

| 类型 | HTTP | 触发场景 |
|------|------|---------|
| `invalid_request_error` | 400 | 请求体缺失 / 参数非法 / `max_tokens` 未填 |
| `authentication_error` | 401 | Key 缺失、无效或已过期 |
| `permission_error` | 403 | Key 被禁用、租户被停用、项目非活跃、模型无权限 |
| `not_found_error` | 404 | 模型不存在 |
| `rate_limit_error` | 429 | 触发限流 |
| `api_error` | 500 / 502 | 网关或上游异常 |

额度类错误（钱包 / 套餐 / 成员 / 项目 / Key 任一层不足）同样以 Claude 格式返回，错误码语义见[错误码说明](/api/error-codes)。

## SDK 接入示例

### Python

```python
import anthropic

client = anthropic.Anthropic(
    base_url="https://your-domain",
    api_key="sk-xxxx",
)

message = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello, Claude"}],
)
print(message.content[0].text)
```

### Node.js

```javascript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  baseURL: 'https://your-domain',
  apiKey: 'sk-xxxx',
})

const message = await client.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello, Claude' }],
})
console.log(message.content[0].text)
```

### Claude Code

Claude Code 通过环境变量指向自建网关：

```bash
export ANTHROPIC_BASE_URL=https://your-domain
export ANTHROPIC_AUTH_TOKEN=sk-xxxx
claude
```

### 流式调用

```python
with client.messages.stream(
    max_tokens=1024,
    messages=[{"role": "user", "content": "写一首关于网关的诗"}],
    model="claude-sonnet-4-5",
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

## 与其他协议的关系

- 同一把 Key 可同时调用 [OpenAI 兼容接口](/api/openai-compatible)、本接口与 [Gemini 接口](/api/gemini)；
- `model` 名为平台对外模型名，经[管理后台 · 渠道配置](/guide/admin/channels)的模型映射解析到实际渠道 —— 用 Claude 协议调用，不要求上游一定是 Anthropic 渠道；
- 用量、计费、限额、审计行为与 OpenAI 协议完全一致，均可在请求日志中按 Request ID 追踪。
