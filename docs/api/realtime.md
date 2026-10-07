---
title: 实时通信 Realtime
---

# 实时通信 Realtime

`GET /v1/realtime` 是 WebSocket 端点，协议对齐 **OpenAI Realtime API**：连接后通过 JSON 事件帧双向通信，支持语音与文本的实时多模态对话（听感延迟低，适合语音助手、实时字幕等场景）。

## 连接方式

```bash
GET /v1/realtime    # WebSocket 升级
```

| 项目 | 说明 |
|------|------|
| 子协议 | `Sec-WebSocket-Protocol: realtime`（浏览器客户端） |
| 鉴权 | 与其他端点一致：`Authorization: Bearer sk-xxxx` 请求头 |
| 模型 | 连接后通过 `session.update` 事件的 `session.model` 指定 |

::: warning 浏览器直连的限制
浏览器 WebSocket API 无法自定义 `Authorization` 请求头，而平台的 Key 认证只接受请求头（`?key=` 查询参数仅对 `/v1beta/*` 路径生效，也不支持子协议传 Key）。因此**浏览器客户端无法携带 Key 直连**本端点，推荐两种做法：

1. 由自建后端建立 WebSocket 连接并注入鉴权头，浏览器连自建后端（体验场等平台内场景即此模式）；
2. 在可信反代（如 Nginx）上按来源注入鉴权头后转发。
:::

## 跨源限制（浏览器客户端）

为防跨站 WebSocket 劫持（CSWSH），浏览器连接受 `Origin` 校验：

- **同源**请求（`Origin` 与站点域名一致）：放行；
- **跨源**请求：须命中服务端环境变量 `REALTIME_ALLOWED_ORIGINS` 白名单（逗号分隔，如租户控制台 / 体验场域名），否则握手被拒；
- **无 `Origin` 头**的客户端（SDK / CLI / 服务端）：不受限制。

跨源接入需管理员在网关环境变量中配置 `REALTIME_ALLOWED_ORIGINS`。

## 事件帧

协议与 OpenAI Realtime API 一致，常用事件：

| 方向 | 事件 | 说明 |
|------|------|------|
| 客户端 → 服务端 | `session.update` | 更新会话配置（`session.model`、音色、工具、输出格式等） |
| 客户端 → 服务端 | `input_audio_buffer.append` | 追加音频块（base64 PCM16） |
| 客户端 → 服务端 | `input_audio_buffer.commit` | 提交音频缓冲，触发识别 |
| 客户端 → 服务端 | `response.create` | 主动触发模型响应 |
| 客户端 → 服务端 | `conversation.item.create` | 注入对话项（文本 / 已有音频） |
| 服务端 → 客户端 | `session.created` / `session.updated` | 会话创建 / 配置更新确认 |
| 服务端 → 客户端 | `input_audio_buffer.speech_started` / `speech_stopped` | 检测到用户开始 / 停止说话 |
| 服务端 → 客户端 | `conversation.item.input_audio_transcription.completed` | 输入语音转写结果 |
| 服务端 → 客户端 | `response.audio_transcript.delta` | 响应文本增量 |
| 服务端 → 客户端 | `response.audio.delta` | 响应音频增量（base64） |
| 服务端 → 客户端 | `response.done` | 响应完成，携带 usage |

## 计费

Realtime 会话按**会话累计 usage** 计费：连接建立时按 0 输入 Token 预扣，会话结束（断开或超时）后按 `response.done` 事件汇总的真实 Token 用量结算（含输入音频 / 输入文本 / 输出音频 / 输出文本细分）。用量可在请求日志中查看。

## SDK 接入示例

::: tip
OpenAI 官方 SDK 未内置 Realtime 客户端，以下使用原生 WebSocket；亦可使用 `@openai/realtime-api` 等社区客户端，改 endpoint 即可。
:::

### Node.js（原生 WebSocket）

```javascript
import WebSocket from 'ws'

const ws = new WebSocket('wss://your-domain/v1/realtime', {
  headers: { Authorization: 'Bearer sk-xxxx' },
})

ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'session.update',
    session: { model: 'gpt-4o-realtime-preview', modalities: ['text', 'audio'] },
  }))
})

ws.on('message', (raw) => {
  const event = JSON.parse(raw.toString())
  if (event.type === 'response.audio_transcript.delta') {
    process.stdout.write(event.delta)
  }
})
```

## 错误响应

握手失败以 HTTP 状态码返回（401 鉴权失败 / 403 Origin 不在白名单）；会话内错误通过 `error` 事件帧下发。完整错误码见[错误码说明](/api/error-codes)。
