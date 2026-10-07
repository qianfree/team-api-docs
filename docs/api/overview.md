---
title: API 概览
---

# API 概览

Team-API 对外暴露**多协议的大模型代理 API**：对话、图像生成、视频生成、语音、音乐生成等能力统一通过平台 API Key 调用，网关负责渠道调度、计费与审计。

现有基于 OpenAI SDK 或任意兼容客户端的应用，只需替换 `base_url` 与 `api_key` 即可无缝迁移；Claude / Gemini 系客户端也可以使用各自的原生协议直连。

## 接入说明

| 项目 | 说明 |
|------|------|
| Base URL | `https://your-domain`（OpenAI SDK 中填 `https://your-domain/v1`） |
| 认证方式 | `Authorization: Bearer sk-xxxx`（推荐），兼容写法见下文 |
| API Key | 租户控制台「Key 管理」中签发，格式 `sk-` 前缀 |
| 错误格式 | 与所调用协议的原生结构一致（OpenAI / Claude / Gemini），见[错误码说明](/api/error-codes) |

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

### 认证方式

所有 AI 代理端点共用同一套 Key，支持以下请求头（按优先级依次尝试）：

| 请求头 / 参数 | 说明 |
|------|------|
| `Authorization: Bearer sk-xxxx` | 标准方式，OpenAI 生态客户端默认 |
| `x-goog-api-key: sk-xxxx` | Gemini 客户端习惯（优先级最高） |
| `x-api-key: sk-xxxx` | Claude 客户端习惯 |
| `?key=sk-xxxx` | 仅 `/v1beta/*`（Gemini）路径接受，供 Gemini SDK 使用 |

::: tip
无论使用哪种认证头，Key 均为平台签发的 `sk-` Key。请求失败时的错误格式与所调用的协议保持一致：`/v1/messages` 返回 Claude 格式错误，`/v1beta/*` 返回 Gemini 格式错误，其余端点返回 OpenAI 格式错误。
:::

### 权限与配额

Key 的可用模型受三层过滤：**租户启用模型 → 成员权限 → Key 范围**（可在签发 Key 时限定可访问模型）。此外每个 Key 可独立配置 QPS 限制、并发限制、IP 白名单与总额度，超限时会返回相应错误码。

## 接口总览

### 对话与文本

| 方法 | 路径 | 说明 | 文档 |
|------|------|------|------|
| `POST` | `/v1/chat/completions` | 对话补全（支持流式 SSE、多模态、工具调用） | [对话补全](/api/chat-completions) |
| `POST` | `/v1/completions` | 文本补全（旧版接口） | [对话补全](/api/chat-completions) |
| `POST` | `/v1/responses` | OpenAI Responses API（含生命周期管理） | [Responses API](/api/responses) |
| `POST` | `/v1/messages` | Claude Messages 原生协议 | [Anthropic 接口](/api/anthropic) |
| `POST` | `/v1/messages/count_tokens` | Claude Token 计数（本地估算、免费） | [Anthropic 接口](/api/anthropic) |
| `POST` | `/v1beta/models/{model}:generateContent` | Gemini 原生协议（非流式 / 流式） | [Gemini 接口](/api/gemini) |

### 图像生成

| 方法 | 路径 | 说明 | 文档 |
|------|------|------|------|
| `POST` | `/v1/images/generations` | 图像生成（同步阻塞返回） | [图像生成](/api/images) |
| `POST` | `/v1/images/edits` | 图像编辑 | [图像生成](/api/images) |
| `POST` | `/v1/images/generations/async` | 图像生成（异步任务提交） | [异步图像任务](/api/images-async) |
| `GET` | `/v1/images/generations/async/{task_id}` | 查询异步图像任务 | [异步图像任务](/api/images-async) |

### 视频生成

视频生成为**提交任务 + 轮询结果**的异步模式，提供四套协议入口：

| 方法 | 路径 | 说明 | 文档 |
|------|------|------|------|
| `POST` | `/v1/video/generations` | 通用视频任务（统一请求体） | [视频生成（通用任务）](/api/video-generations) |
| `GET` | `/v1/video/generations/{task_id}` | 查询通用视频任务 | [视频生成（通用任务）](/api/video-generations) |
| `POST` | `/v1/videos` | OpenAI Videos 官方协议（官方 SDK 直连） | [OpenAI Videos 协议](/api/videos-openai) |
| `GET` | `/v1/videos/{video_id}` | OpenAI Videos 任务查询 | [OpenAI Videos 协议](/api/videos-openai) |
| `GET` | `/v1/videos/{video_id}/content` | OpenAI Videos 成品下载 | [OpenAI Videos 协议](/api/videos-openai) |
| `DELETE` | `/v1/videos/{video_id}` | OpenAI Videos 任务删除 | [OpenAI Videos 协议](/api/videos-openai) |
| `POST` | `/v2/video_generation` | MiniMax 官方协议 v2（H3 系列） | [MiniMax / DashScope 协议](/api/videos-minimax-dashscope) |
| `GET` | `/v2/query/video_generation/{task_id}` | MiniMax v2 任务查询 | [MiniMax / DashScope 协议](/api/videos-minimax-dashscope) |
| `DELETE` | `/v2/video_generation/{task_id}` | MiniMax v2 任务取消（仅排队中） | [MiniMax / DashScope 协议](/api/videos-minimax-dashscope) |
| `POST` | `/v1/video_generation` | MiniMax 官方协议 v1（海螺系列） | [MiniMax / DashScope 协议](/api/videos-minimax-dashscope) |
| `GET` | `/v1/query/video_generation?task_id=` | MiniMax v1 任务查询 | [MiniMax / DashScope 协议](/api/videos-minimax-dashscope) |
| `POST` | `/v1/services/aigc/video-generation/video-synthesis` | 阿里 DashScope 官方协议（万相） | [MiniMax / DashScope 协议](/api/videos-minimax-dashscope) |
| `GET` | `/v1/tasks/{task_id}` | DashScope 任务查询 | [MiniMax / DashScope 协议](/api/videos-minimax-dashscope) |

### 更多能力

| 方法 | 路径 | 说明 | 文档 |
|------|------|------|------|
| `POST` | `/v1/embeddings` | 文本向量嵌入 | [向量嵌入](/api/embeddings) |
| `POST` | `/v1/audio/speech` | 文字转语音（TTS） | [语音接口](/api/audio) |
| `POST` | `/v1/audio/transcriptions` | 语音转文字（STT） | [语音接口](/api/audio) |
| `POST` | `/v1/audio/translations` | 语音翻译 | [语音接口](/api/audio) |
| `POST` | `/v1/rerank` | 重排序 | [重排序与内容审核](/api/rerank-moderations) |
| `POST` | `/v1/moderations` | 内容审核 | [重排序与内容审核](/api/rerank-moderations) |
| `GET` | `/v1/realtime` | 实时通信（WebSocket） | [实时通信 Realtime](/api/realtime) |
| `POST` | `/suno/submit/{action}` | Suno 音乐 / 歌词生成 | [音乐生成 Suno](/api/suno) |
| `POST` | `/suno/fetch` | Suno 任务查询 | [音乐生成 Suno](/api/suno) |
| `GET` | `/suno/fetch/{task_id}` | Suno 任务查询（路径参数） | [音乐生成 Suno](/api/suno) |

### 模型与元信息

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/v1/models` | 获取当前 Key 可用的模型列表 |
| `GET` | `/v1/models/{model_id}` | 获取模型详情 |
| `GET` | `/v1beta/models` | Gemini 格式模型列表 |

## 协议选择

| 场景 | 推荐协议 | 说明 |
|------|---------|------|
| 通用应用 / OpenAI SDK 生态 | OpenAI 兼容（`/v1/chat/completions`） | 覆盖最广，所有渠道模型均可通过统一模型名调用 |
| 新一代 Agent / 多轮工具编排 | OpenAI Responses（`/v1/responses`） | 服务端会话状态、后台任务、生命周期管理 |
| Claude Code / Claude 系客户端 | Claude 原生（`/v1/messages`） | 客户端零改造，错误格式同构 |
| Gemini 系客户端 | Gemini 原生（`/v1beta/*`） | 官方 SDK 改 base_url 直连 |
| 视频 / 音乐等长耗时生成 | 各任务型端点 | 提交任务 + 轮询，见对应文档 |

::: info
无论上游渠道是哪家供应商，只要配置了对外模型名，该模型即可在任意协议端点调用 —— 模型名与渠道解耦，网关自动完成协议转换与调度，详见[管理后台 · 渠道配置](/guide/admin/channels)。
:::

## 模型列表

### 获取模型列表

```bash
GET /v1/models
```

返回当前 Key 可用的模型列表（受租户启用、成员权限、Key 范围三层过滤）：

```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4o-mini",
      "object": "model",
      "owned_by": "platform",
      "model_name": "GPT-4o mini",
      "category": "chat",
      "context_window": 128000,
      "max_output_tokens": 16384,
      "capabilities": { "vision": true, "function_call": true },
      "modalities": { "input": ["text", "image"], "output": ["text"] }
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 调用时使用的模型名 |
| `object` | string | 恒为 `model` |
| `owned_by` | string | 恒为 `platform`（模型由平台统一对外） |
| `model_name` | string | 展示名称 |
| `category` | string | 模型分类，如 `chat` / `image` / `video` / `embedding` |
| `context_window` | integer | 上下文窗口（Token） |
| `max_output_tokens` | integer | 最大输出 Token 数 |
| `capabilities` | object | 能力开关（视觉、工具调用等），以控制台配置为准 |
| `modalities` | object | 输入 / 输出模态列表 |

### 获取模型详情

```bash
GET /v1/models/{model_id}
```

在列表字段基础上额外返回 `description`（描述）、`status`（状态）与 `deprecated`（是否已标记弃用）。模型不存在返回 404 `model_not_found`，无权访问返回 403 `permission_denied`。

## 通用响应头

| 响应头 | 说明 |
|--------|------|
| `X-RateLimit-Limit` / `X-RateLimit-Remaining` / `X-RateLimit-Reset` | Key 级限流信息（触发 QPS / 并发限额时返回） |
| `X-Request-Id` | 请求唯一标识，贯穿网关日志与计费流水，排障必备 |
| `Deprecation` / `Sunset` / `Link` | 模型标记弃用时返回下线日期与替代模型 |

## 下一步

- 快速跑通对话：[对话补全](/api/chat-completions)
- 画图 / 生成视频：[图像生成](/api/images)、[视频生成（通用任务）](/api/video-generations)
- 排查调用问题：[错误码说明](/api/error-codes)
