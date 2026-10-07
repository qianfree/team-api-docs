---
title: Responses API
---

# Responses API

Team-API 支持OpenAI 新版 **Responses API**（`/v1/responses`），与传统的[对话补全接口](/api/chat-completions)相互独立：

- **有状态** —— 通过 `previous_response_id` 串联多轮对话，服务端维护上下文，客户端无需回传全量历史；
- **面向智能体** —— 内置工具（网页搜索、文件搜索等，视渠道能力）、推理模型参数、结构化事件流，是 OpenAI Agents SDK / Codex CLI 等新一代客户端的默认接口；
- **生命周期管理** —— 支持查询、取消、删除 Response，配合 `background` 后台模式实现异步任务。

鉴权、额度、计费与日志行为和其他端点完全一致。

## 接入说明

| 项目 | 说明 |
|------|------|
| Base URL | `https://your-domain`（SDK 中填 `https://your-domain/v1`） |
| 认证方式 | `Authorization: Bearer sk-xxxx` |
| 适用客户端 | OpenAI SDK（`client.responses.*`）、Agents SDK、Codex CLI 及任意 Responses 兼容客户端 |

## 接口总览

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/v1/responses` | 创建 Response（支持流式与 `background` 模式） |
| `POST` | `/v1/responses/compact` | 压缩会话上下文（Codex CLI 风格） |
| `GET` | `/v1/responses/{id}` | 查询 Response 详情 |
| `POST` | `/v1/responses/{id}/cancel` | 取消进行中的 Response |
| `DELETE` | `/v1/responses/{id}` | 删除 Response |

## 创建 Response

```bash
POST /v1/responses
```

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `model` | string | ✅ | 模型名 |
| `input` | string / array | ✅ | 输入内容：字符串，或消息 / 内容块数组 |
| `instructions` | string | — | 系统级指令（角色设定） |
| `previous_response_id` | string | — | 上一轮 Response ID，开启有状态多轮对话 |
| `stream` | boolean | — | `true` 时以 SSE 流式返回事件 |
| `background` | boolean | — | `true` 时立即返回，稍后凭 `id` 轮询结果 |
| `tools` | array | — | 工具定义（Function Calling 及内置工具，视渠道能力） |
| `tool_choice` | string / object | — | 工具选择策略 |
| `temperature` | number | — | 采样温度 |
| `top_p` | number | — | 核采样参数 |
| `max_output_tokens` | integer | — | 最大生成 Token 数 |
| `reasoning` | object | — | 推理模型参数（如 `{"effort": "high"}`，视模型支持） |
| `text` | object | — | 文本输出格式配置（如结构化 JSON） |
| `store` | boolean | — | 是否在服务端存储（默认行为以上游为准） |

```bash
curl https://your-domain/v1/responses \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "input": "讲一个冷笑话"
  }'
```

### 非流式响应

```json
{
  "id": "resp_xxxx",
  "object": "response",
  "status": "completed",
  "model": "gpt-4o",
  "output": [
    {
      "type": "message",
      "role": "assistant",
      "content": [{"type": "output_text", "text": "为什么程序员……"}]
    }
  ],
  "usage": {
    "input_tokens": 20,
    "output_tokens": 42,
    "total_tokens": 62
  }
}
```

`status` 取值与 OpenAI 官方一致：`completed` / `in_progress` / `failed` / `cancelled` / `incomplete`。

### 流式响应

`"stream": true` 时以 SSE 推送事件，先 `response.created`，内容以 `response.output_text.delta` 增量推送，最终 `response.completed` 携带完整 usage：

```
event: response.created
data: {"type":"response.created","response":{"id":"resp_xxxx","status":"in_progress"}}

event: response.output_text.delta
data: {"type":"response.output_text.delta","delta":"讲一个"}

event: response.output_text.delta
data: {"type":"response.output_text.delta","delta":"冷笑话……"}

event: response.completed
data: {"type":"response.completed","response":{"id":"resp_xxxx","status":"completed","usage":{"input_tokens":20,"output_tokens":42,"total_tokens":62}}}
```

流式结束时网关解析真实 usage 完成计费结算。

## 有状态多轮对话

传 `previous_response_id` 即可续接上一轮，服务端自动拼接上下文：

```bash
curl https://your-domain/v1/responses \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "previous_response_id": "resp_xxxx",
    "input": "再讲一个"
  }'
```

::: warning 有状态请求的渠道要求
`previous_response_id` 属于**有状态协议特性**，只有原生支持 Responses 协议的上游渠道才能服务。网关调度时会**优先选择声明支持 Responses 协议的渠道**，避免经对话补全转换后有状态特性丢失；若请求最终落在仅支持 chat 的渠道，将返回协议不匹配错误。无状态请求（不传 `previous_response_id`）则无此限制 —— 网关可自动转换到任意 chat 渠道。
:::

## 生命周期端点

三个生命周期端点均**无请求体、不计费**：网关经内部路由表（`response_id → 渠道`，创建请求直连转发时记录）还原原始渠道后，将请求透传上游并原样回传响应。

### 查询 Response

```bash
GET /v1/responses/{id}
```

`background` 模式下用于轮询任务结果，也可获取已存储 Response 的完整内容。

### 取消 Response

```bash
POST /v1/responses/{id}/cancel
```

取消进行中的 Response（如后台任务、长推理）。

### 删除 Response

```bash
DELETE /v1/responses/{id}
```

删除上游存储的 Response；删除成功后网关同步清理内部路由记录，该 `id` 不再可查询。

::: tip
路由记录未找到或已过期时，生命周期端点返回 **404** `Response not found`。直连转发（流式 / 非流式）创建的 Response 均会记录路由；请勿依赖生命周期端点访问未经网关转发的对象。
:::

## 会话压缩

```bash
POST /v1/responses/compact
```

对过长的会话上下文做压缩摘要（Codex CLI 风格端点），请求 / 响应格式与创建 Response 一致，用于长会话中控制上下文长度。走网关完整计费链路。

## SDK 接入示例

### Python

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://your-domain/v1",
    api_key="sk-xxxx",
)

resp = client.responses.create(
    model="gpt-4o",
    input="讲一个冷笑话",
)
print(resp.output_text)
```

### Node.js

```javascript
import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://your-domain/v1',
  apiKey: 'sk-xxxx',
})

const resp = await client.responses.create({
  model: 'gpt-4o',
  input: '讲一个冷笑话',
})
console.log(resp.output_text)
```

### 多轮（有状态）

```python
first = client.responses.create(model="gpt-4o", input="我叫小钱")
second = client.responses.create(
    model="gpt-4o",
    previous_response_id=first.id,
    input="我叫什么名字？",
)
print(second.output_text)
```

### 流式调用

```python
stream = client.responses.create(
    model="gpt-4o",
    input="写一首关于网关的诗",
    stream=True,
)
for event in stream:
    if event.type == "response.output_text.delta":
        print(event.delta, end="", flush=True)
```

## 与对话补全的区别

| | 对话补全 `/v1/chat/completions` | Responses `/v1/responses` |
|--|--------------------------------|---------------------------|
| 状态管理 | 客户端回传全量 `messages` | `previous_response_id` 服务端续接 |
| 输出结构 | `choices[].message` | `output[]` 内容块（可含推理、工具调用等多类型项） |
| 生命周期 | 无 | 查询 / 取消 / 删除 / 压缩 |
| 后台模式 | 无 | `background` 异步 + 轮询 |
| 适用场景 | 存量应用、简单对话 | 智能体、多轮工具调用、Codex / Agents SDK |

两者共用同一套 Key、额度与计费规则。对话补全接口见[对话补全](/api/chat-completions)。
