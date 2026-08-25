---
title: OpenAI 兼容接口
---

# OpenAI 兼容接口

Team-API 对外暴露 **OpenAI 兼容 API**：现有基于 OpenAI SDK 或任意兼容客户端的应用，只需替换 `base_url` 与 `api_key` 即可无缝迁移。

OpenAI 新版 **Responses API**（`/v1/responses`，含生命周期管理）已独立成篇，见 [Responses API](/api/responses)；平台还提供 [Anthropic Claude 原生接口](/api/anthropic)与 [Gemini 原生接口](/api/gemini)，供 Claude / Gemini 系客户端直连。

## 接入说明

| 项目 | 说明 |
|------|------|
| Base URL | `https://your-domain`（SDK 中填 `https://your-domain/v1`） |
| 认证方式 | `Authorization: Bearer sk-xxxx` |
| API Key | 租户控制台「Key 管理」中签发，格式 `sk-` 前缀 |
| 响应格式 | 错误响应与 OpenAI 结构一致：`{"error": {"type", "message", "code"}}` |

最小请求示例：

```bash
curl https://your-domain/v1/chat/completions \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

::: tip
所有 AI 代理端点共用同一套 Key。除 `Authorization: Bearer` 外，也接受 `x-api-key`（Claude 客户端习惯）与 `x-goog-api-key`（Gemini 客户端习惯）请求头，方便不同生态的客户端零改造接入。
:::

## 接口总览

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/v1/chat/completions` | 对话补全（支持流式 SSE） |
| `POST` | `/v1/completions` | 文本补全（旧版接口） |
| `POST` | `/v1/embeddings` | 文本向量嵌入 |
| `POST` | `/v1/images/generations` | 图像生成（同步） |
| `POST` | `/v1/images/generations/async` | 图像生成（异步任务） |
| `GET` | `/v1/images/generations/async/{task_id}` | 查询异步图像任务 |
| `POST` | `/v1/images/edits` | 图像编辑 |
| `POST` | `/v1/audio/speech` | 文字转语音（TTS） |
| `POST` | `/v1/audio/transcriptions` | 语音转文字（STT） |
| `POST` | `/v1/audio/translations` | 语音翻译 |
| `POST` | `/v1/rerank` | 重排序 |
| `POST` | `/v1/moderations` | 内容审核 |
| `POST` | `/v1/video/generations` | 视频生成任务提交 |
| `GET` | `/v1/video/generations/{task_id}` | 查询视频生成任务 |
| `GET` | `/v1/realtime` | 实时通信（WebSocket） |
| `GET` | `/v1/models` | 获取可用模型列表 |
| `GET` | `/v1/models/{model_id}` | 获取模型详情 |

::: info
OpenAI 新版 **Responses API**（`/v1/responses` 创建 / 查询 / 取消 / 删除 / 会话压缩）与对话补全相互独立，接口细节见 [Responses API](/api/responses)。
:::

## 对话补全

```bash
POST /v1/chat/completions
```

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `model` | string | ✅ | 模型名，以 `/v1/models` 返回或控制台配置为准 |
| `messages` | array | ✅ | 消息数组，`role` 支持 `system` / `user` / `assistant` / `tool` |
| `stream` | boolean | — | `true` 时以 SSE 流式返回 |
| `temperature` | number | — | 采样温度，0 – 2 |
| `top_p` | number | — | 核采样参数 |
| `max_tokens` | integer | — | 最大生成 Token 数 |
| `tools` | array | — | 工具（Function Calling）定义 |
| `tool_choice` | string / object | — | 工具选择策略 |
| `response_format` | object | — | 输出格式，如 `{"type": "json_object"}` |
| `stop` | string / array | — | 停止序列 |
| `n` | integer | — | 生成候选数量 |
| `user` | string | — | 终端用户标识，用于审计追踪 |

多模态输入：`content` 传数组时可在 `image_url` 中携带图片（视模型能力而定）。

### 非流式响应

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
    "total_tokens": 16
  }
}
```

### 流式响应

`"stream": true` 时以 `text/event-stream` 返回，逐块推送 `chat.completion.chunk`：

```
data: {"id":"chatcmpl-xxxx","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}

data: {"id":"chatcmpl-xxxx","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-xxxx","object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

流式结束时会解析真实 usage 并完成计费结算，用量可在请求日志中查看。

## 文本补全（旧版）

```bash
POST /v1/completions
```

兼容旧版 OpenAI Completions 接口，参数与响应结构对齐 OpenAI 规范（`prompt` + `choices[].text`）。新应用建议使用对话补全或 [Responses API](/api/responses)。

## 向量嵌入

```bash
POST /v1/embeddings
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `model` | string | ✅ | 嵌入模型名，如 `text-embedding-3-small` |
| `input` | string / array | ✅ | 文本或文本数组 |
| `encoding_format` | string | — | `float`（默认）/ `base64` |

```bash
curl https://your-domain/v1/embeddings \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-3-small",
    "input": "Team-API 是多租户大模型 API 网关"
  }'
```

## 图像生成

### 同步生成

```bash
POST /v1/images/generations
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `model` | string | ✅ | 图像模型名 |
| `prompt` | string | ✅ | 图像描述 |
| `n` | integer | — | 生成数量，默认 1 |
| `size` | string | — | 尺寸，如 `1024x1024` |
| `response_format` | string | — | `url` / `b64_json` |

### 异步生成

耗时较长的图像模型可走异步任务，提交后立即返回 `task_id`，凭 `task_id` 轮询结果：

```bash
# 提交异步图像任务
curl -X POST https://your-domain/v1/images/generations/async \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{"model": "wanx2.1-t2i-turbo", "prompt": "一只在月球上骑自行车的熊猫"}'

# 查询任务
curl https://your-domain/v1/images/generations/async/{task_id} \
  -H "Authorization: Bearer sk-xxxx"
```

### 图像编辑

```bash
POST /v1/images/edits
```

`multipart/form-data` 请求，携带原图（`image`）与编辑指令（`prompt`），参数对齐 OpenAI 图像编辑接口。

## 语音接口

| 路径 | 说明 | 请求格式 |
|------|------|---------|
| `/v1/audio/speech` | 文字转语音（TTS） | JSON：`model` / `input` / `voice` / `response_format` |
| `/v1/audio/transcriptions` | 语音转文字（STT） | `multipart/form-data`：`file` / `model` / `language` |
| `/v1/audio/translations` | 语音翻译（译为英文） | `multipart/form-data`：`file` / `model` |

```bash
curl https://your-domain/v1/audio/speech \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts-1",
    "input": "今天天气怎么样？",
    "voice": "alloy"
  }' \
  --output speech.mp3
```

## 重排序

```bash
POST /v1/rerank
```

对一组文档按与查询的相关性重排，兼容 Cohere / Jina 风格请求：

```json
{
  "model": "rerank-v2",
  "query": "什么是多租户隔离？",
  "documents": ["行级租户隔离……", "双独立用户体系……"],
  "top_n": 3
}
```

## 内容审核

```bash
POST /v1/moderations
```

对输入文本进行违规内容审核，返回各类别的违规概率与判定结果：

```json
{
  "model": "text-moderation-latest",
  "input": "待审核文本"
}
```

## 视频生成

视频生成为异步任务接口，提交后返回 `task_id`，凭 `task_id` 轮询状态与结果：

```bash
# 提交视频生成任务
curl -X POST https://your-domain/v1/video/generations \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{"model": "wan2.2-t2v-plus", "prompt": "城市夜景延时摄影"}'

# 查询任务
curl https://your-domain/v1/video/generations/{task_id} \
  -H "Authorization: Bearer sk-xxxx"
```

任务状态为 `succeeded` 时，响应中返回生成视频的下载地址。支持的可视频模型以控制台渠道配置为准。

## 实时通信（Realtime）

```bash
GET /v1/realtime
```

WebSocket 端点，协议对齐 **OpenAI Realtime API**：连接后通过 JSON 事件帧双向通信（`session.update`、`input_audio_buffer.append`、`response.create` 等）。

- 浏览器客户端走 `Subprotocol: realtime`；
- 跨源浏览器连接受 `REALTIME_ALLOWED_ORIGINS` 环境变量白名单限制，非浏览器客户端（SDK / 服务端）不受影响；
- 鉴权与其他端点一致，使用 `Authorization: Bearer sk-xxxx`。

## 模型列表

```bash
GET /v1/models
GET /v1/models/{model_id}
```

返回当前 Key 可用的模型列表（受租户启用、成员权限、Key 范围三层过滤）：

```json
{
  "object": "list",
  "data": [
    {"id": "gpt-4o-mini", "object": "model", "owned_by": "system"},
    {"id": "claude-sonnet-4-5", "object": "model", "owned_by": "system"}
  ]
}
```

::: warning
即使上游是 Anthropic / Gemini 渠道，只要配置了对外模型名，就会出现在该列表中 —— 模型名与渠道解耦，详见[管理后台 · 渠道配置](/guide/admin/channels)。
:::

## 通用响应头

| 响应头 | 说明 |
|--------|------|
| `X-RateLimit-Limit` / `X-RateLimit-Remaining` / `X-RateLimit-Reset` | Key 级限流信息（QPS / 并发限额时返回） |
| `X-Request-Id` | 请求唯一标识，贯穿网关日志与计费流水，排障必备 |
| `Deprecation` / `Sunset` / `Link` | 模型标记弃用时返回下线日期与替代模型 |

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

错误结构与 OpenAI 一致：

```json
{
  "error": {
    "type": "quota_error",
    "message": "insufficient quota: project budget exceeded",
    "code": "quota_project_exceeded"
  }
}
```

各协议错误格式的差异（OpenAI / Claude / Gemini）与完整错误码见[错误码说明](/api/error-codes)。
