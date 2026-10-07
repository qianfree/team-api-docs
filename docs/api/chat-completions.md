---
title: 对话补全
---

# 对话补全

`POST /v1/chat/completions` 是最常用的对话接口，完整兼容 OpenAI Chat Completions 协议：支持流式 SSE、多模态输入（图片 / 音频 / 文件）、工具调用（Function Calling）与结构化输出。基于 OpenAI SDK 的应用只需替换 `base_url` 与 `api_key` 即可迁移。

## 接入说明

| 项目 | 说明 |
|------|------|
| 路径 | `POST /v1/chat/completions` |
| 认证 | `Authorization: Bearer sk-xxxx`（兼容 `x-api-key` / `x-goog-api-key`） |
| 模型名 | 以 [`/v1/models`](/api/overview#模型列表) 返回或控制台配置为准 |
| 流式 | `"stream": true` 时以 `text/event-stream` 返回 |

```bash
curl https://your-domain/v1/chat/completions \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `model` | string | ✅ | 模型名 |
| `messages` | array | ✅ | 消息数组，`role` 支持 `system` / `user` / `assistant` / `tool` |
| `stream` | boolean | — | `true` 时以 SSE 流式返回 |
| `stream_options` | object | — | 流式选项，`{"include_usage": true}` 在最后一帧附带 usage |
| `max_tokens` | integer | — | 最大生成 Token 数（旧字段） |
| `max_completion_tokens` | integer | — | 最大生成 Token 数（新字段，优先于 `max_tokens`） |
| `temperature` | number | — | 采样温度，0 – 2 |
| `top_p` | number | — | 核采样参数 |
| `top_k` | integer | — | Top-K 采样（部分模型支持） |
| `n` | integer | — | 生成候选数量 |
| `stop` | string / array | — | 停止序列，最多 4 个 |
| `presence_penalty` | number | — | 存在惩罚，-2 – 2 |
| `frequency_penalty` | number | — | 频率惩罚，-2 – 2 |
| `seed` | integer | — | 采样种子，尽量（不保证）可复现 |
| `tools` | array | — | 工具（Function Calling）定义，见[工具调用](#工具调用) |
| `tool_choice` | string / object | — | 工具选择策略：`none` / `auto` / `required` 或指定函数 |
| `parallel_tool_calls` | boolean | — | 是否允许并行工具调用 |
| `response_format` | object | — | 输出格式，如 `{"type": "json_object"}`、`{"type": "json_schema", "json_schema": {...}}` |
| `logprobs` | boolean | — | 是否返回对数概率 |
| `top_logprobs` | integer | — | 每个位置返回的最可能 Token 数（0 – 20） |
| `reasoning_effort` | string | — | 推理模型的思考力度：`low` / `medium` / `high` |
| `logit_bias` | object | — | 指定 Token 的偏好偏置 |
| `user` | string | — | 终端用户标识，用于审计追踪 |
| `image_config` | object | — | 内生图模型（如 Gemini 原生生图）的图片配置：`aspect_ratio`、`image_size` |

::: tip 透传字段
除上表常用字段外，请求体中的 `service_tier`、`modalities`、`audio`、`store`、`web_search_options`、`prediction`、`metadata`、`verbosity`、`prompt_cache_key` 等字段会按 OpenAI 协议透传给支持它们的渠道。
:::

### 消息格式

`messages[].content` 支持两种形态：

**纯文本**（string）：

```json
{"role": "user", "content": "你好"}
```

**多模态内容块数组**（视模型能力而定）：

```json
{
  "role": "user",
  "content": [
    {"type": "text", "text": "这张图里有什么？"},
    {"type": "image_url", "image_url": {"url": "https://example.com/cat.png"}},
    {"type": "input_audio", "input_audio": {"data": "<base64>", "format": "wav"}},
    {"type": "file", "file": {"file_data": "<base64>", "filename": "doc.pdf"}}
  ]
}
```

| 内容块类型 | 字段 | 说明 |
|-----------|------|------|
| `text` | `text` | 文本 |
| `image_url` | `image_url.url` / `image_url.detail` | 图片 URL 或 base64 Data URI；`detail` 可选 `low` / `high` / `auto` |
| `input_audio` | `input_audio.data` / `input_audio.format` | base64 音频，`format` 如 `wav` / `mp3` |
| `file` | `file.file_data` / `file.filename` | base64 文件附件 |

推理模型（DeepSeek-R1、o 系列等）的思考内容通过响应中的 `reasoning_content` 字段返回。

## 非流式响应

```json
{
  "id": "chatcmpl-xxxx",
  "object": "chat.completion",
  "created": 1730000000,
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {"role": "assistant", "content": "Hello! How can I help?"},
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 7,
    "total_tokens": 16,
    "prompt_tokens_details": {"cached_tokens": 0, "audio_tokens": 0, "image_tokens": 0},
    "completion_tokens_details": {"reasoning_tokens": 0}
  }
}
```

`usage` 中的 `*_details` 为 Token 细分（缓存命中、音频、图片、推理等），与平台计费口径一致，详见用量日志。

## 流式响应

`"stream": true` 时以 `text/event-stream` 返回，逐块推送 `chat.completion.chunk`：

```
data: {"id":"chatcmpl-xxxx","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}

data: {"id":"chatcmpl-xxxx","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-xxxx","object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

设置 `stream_options: {"include_usage": true}` 时，`[DONE]` 前的最后一个 chunk 会携带完整 `usage`。流式结束时会解析真实 usage 并完成计费结算，用量可在请求日志中查看。

## 工具调用

```json
{
  "model": "gpt-4o-mini",
  "messages": [{"role": "user", "content": "北京今天天气怎么样？"}],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "查询指定城市的天气",
        "parameters": {
          "type": "object",
          "properties": {
            "city": {"type": "string", "description": "城市名"}
          },
          "required": ["city"]
        }
      }
    }
  ],
  "tool_choice": "auto"
}
```

模型决定调用工具时，响应 `choices[0].finish_reason` 为 `"tool_calls"`，`message.tool_calls` 携带函数名与参数；把执行结果以 `role: "tool"` 消息回传即可继续对话：

```json
{"role": "tool", "tool_call_id": "call_xxx", "content": "{\"temp\": 25, \"cond\": \"晴\"}"}
```

## 文本补全（旧版）

```bash
POST /v1/completions
```

兼容旧版 OpenAI Completions 接口：`prompt`（string 或数组）替代 `messages`，响应为 `choices[].text`，支持 SSE 流式。参数与响应结构对齐 OpenAI 规范（`echo`、`suffix`、`best_of` 等旧字段同样兼容）。新应用建议使用对话补全或 [Responses API](/api/responses)。

## SDK 接入示例

### Python

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://your-domain/v1",
    api_key="sk-xxxx",
)

resp = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(resp.choices[0].message.content)
```

### Node.js

```javascript
import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://your-domain/v1',
  apiKey: 'sk-xxxx',
})

const resp = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello!' }],
})
console.log(resp.choices[0].message.content)
```

### 流式调用

```python
stream = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "写一首关于网关的诗"}],
    stream=True,
)
for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="", flush=True)
```

## 错误响应

错误结构与 OpenAI 一致，完整错误码见[错误码说明](/api/error-codes)：

```json
{
  "error": {
    "type": "quota_error",
    "message": "insufficient quota: project budget exceeded",
    "code": "quota_project_exceeded"
  }
}
```
