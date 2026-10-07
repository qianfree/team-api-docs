---
title: Gemini 接口
---

# Gemini 接口

Team-API 原生支持 **Google Gemini API** 协议（`/v1beta`）。Gemini 官方 SDK（`google-genai` / `google-generativeai`）及任意 Gemini 兼容客户端，把网关地址当作 Google API 端点即可直连 —— 请求与响应均为 Gemini 原生格式。

上游渠道由平台的智能调度决定：`gemini-*` 模型名可路由到 Google 官方渠道，也可按配置映射到其他供应商渠道。

## 接入说明

| 项目 | 说明 |
|------|------|
| Base URL | `https://your-domain`（SDK 中作为 API 端点，接口路径为 `/v1beta/models/...`） |
| 认证方式 | `x-goog-api-key: sk-xxxx`、`?key=sk-xxxx` 查询参数（Gemini SDK 习惯），或 `Authorization: Bearer sk-xxxx` |
| API Key | 租户控制台「Key 管理」中签发，格式 `sk-` 前缀 |
| 响应格式 | 错误响应与 Gemini 结构一致：`{"error": {"code", "message", "status"}}` |

```bash
curl "https://your-domain/v1beta/models/gemini-2.5-flash:generateContent" \
  -H "x-goog-api-key: sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [
      {"role": "user", "parts": [{"text": "Hello, Gemini"}]}
    ]
  }'
```

## 接口总览

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/v1beta/models` | 获取模型列表（Gemini 格式） |
| `GET` | `/v1beta/models/{model}` | 获取模型详情 |
| `POST` | `/v1beta/models/{model}:generateContent` | 生成内容（非流式） |
| `POST` | `/v1beta/models/{model}:streamGenerateContent` | 生成内容（SSE 流式） |

## 模型列表

```bash
GET /v1beta/models
```

返回当前 Key 可用的模型列表，结构与 Google 官方一致（受租户启用、成员权限、Key 范围三层过滤）：

```json
{
  "models": [
    {
      "name": "models/gemini-2.5-flash",
      "displayName": "Gemini 2.5 Flash",
      "supportedGenerationMethods": ["generateContent", "countTokens"]
    }
  ]
}
```

模型详情：

```bash
GET /v1beta/models/{model}
```

## 生成内容

```bash
POST /v1beta/models/{model}:generateContent
```

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `contents` | array | ✅ | 对话内容数组，每条含 `role`（`user` / `model`）与 `parts` |
| `systemInstruction` | object | — | 系统指令，格式同 `contents` 单条 |
| `generationConfig` | object | — | 生成参数：`temperature` / `topP` / `topK` / `maxOutputTokens` / `stopSequences` / `responseMimeType` 等 |
| `safetySettings` | array | — | 安全策略配置 |
| `tools` | array | — | 工具定义（Function Calling / Google Search Grounding 等） |

`parts` 内支持多种模态：`text`（文本）、`inlineData`（内联 base64 图片 / 音频，视模型能力而定）。

```bash
curl "https://your-domain/v1beta/models/gemini-2.5-flash:generateContent" \
  -H "x-goog-api-key: sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "systemInstruction": {"parts": [{"text": "你是一个简洁的助手"}]},
    "contents": [{"role": "user", "parts": [{"text": "用一句话介绍 API 网关"}]}],
    "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1024}
  }'
```

### 非流式响应

```json
{
  "candidates": [
    {
      "content": {
        "role": "model",
        "parts": [{"text": "API 网关是客户端与大模型服务之间的统一入口。"}]
      },
      "finishReason": "STOP"
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 12,
    "candidatesTokenCount": 18,
    "totalTokenCount": 30
  },
  "modelVersion": "gemini-2.5-flash"
}
```

### 流式响应

```bash
POST /v1beta/models/{model}:streamGenerateContent
```

以 SSE 流式返回，每个事件为一个增量 `GenerateContentResponse` 分块：

```
data: {"candidates":[{"content":{"role":"model","parts":[{"text":"API"}]}}]}

data: {"candidates":[{"content":{"parts":[{"text":" 网关是……"}]},"finishReason":"STOP"}],"usageMetadata":{"totalTokenCount":30}}
```

流式结束时分块携带完整 `usageMetadata`，网关据此完成计费结算。

## 错误响应

错误结构与 Google 官方一致：

```json
{
  "error": {
    "code": 400,
    "message": "request body is empty",
    "status": "INVALID_ARGUMENT"
  }
}
```

`status` 常见取值：

| status | HTTP | 触发场景 |
|--------|------|---------|
| `INVALID_ARGUMENT` | 400 | 请求体缺失 / 参数非法 / 路径中无模型名 |
| `UNAUTHENTICATED` | 401 | Key 缺失、无效或已过期 |
| `PERMISSION_DENIED` | 403 | Key 被禁用、租户被停用、模型无权限 |
| `NOT_FOUND` | 404 | 模型不存在 |
| `RESOURCE_EXHAUSTED` | 429 | 触发限流或额度不足 |
| `INTERNAL` / `UNAVAILABLE` | 500 / 502 | 网关或上游异常 |

额度类错误的错误码语义见[错误码说明](/api/error-codes)。

## SDK 接入示例

### Python（google-genai）

```python
from google import genai

client = genai.Client(
    api_key="sk-xxxx",
    http_options={"base_url": "https://your-domain"},
)

resp = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Hello, Gemini",
)
print(resp.text)
```

### Node.js（@google/genai）

```javascript
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({
  apiKey: 'sk-xxxx',
  httpOptions: { baseUrl: 'https://your-domain' },
})

const resp = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'Hello, Gemini',
})
console.log(resp.text)
```

### 流式调用

```python
stream = client.models.generate_content_stream(
    model="gemini-2.5-flash",
    contents="写一首关于网关的诗",
)
for chunk in stream:
    print(chunk.text, end="", flush=True)
```

## 与其他协议的关系

- 同一把 Key 可同时调用[对话补全](/api/chat-completions)与 [Anthropic Claude 接口](/api/anthropic)；
- 路径中的模型名（`gemini-2.5-flash` 等）为平台对外模型名，经[管理后台 · 渠道配置](/guide/admin/channels)的模型映射解析到实际渠道 —— 用 Gemini 协议调用，不要求上游一定是 Google 渠道；
- 用量、计费、限额、审计行为与其他协议完全一致，均可在请求日志中按 Request ID 追踪。
