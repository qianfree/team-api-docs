---
title: OpenAI Videos 协议
---

# OpenAI Videos 协议

`/v1/videos` 系列端点完整实现 **OpenAI 官方 Videos API 协议**：基于官方 OpenAI SDK（Python / Node.js）的应用只需替换 `base_url` 与 `api_key`，即可通过 `client.videos.*` 调用平台接入的全部视频模型（可灵、Sora、Veo、豆包 Seedance、MiniMax 海螺、通义万相等）。

与[通用任务接口](/api/video-generations)的关系：同一套模型、调度与计费，仅入口协议不同 —— 官方 SDK 用户零改造，裸 HTTP 用户建议用通用接口。

## 接口总览

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/v1/videos` | 创建视频生成任务（multipart 或 JSON） |
| `GET` | `/v1/videos/{video_id}` | 查询视频任务 |
| `GET` | `/v1/videos/{video_id}/content` | 下载成品视频（`?variant=video`） |
| `DELETE` | `/v1/videos/{video_id}` | 删除已完结的视频任务 |

## 创建视频

```bash
POST /v1/videos
```

官方 SDK 一律发送 `multipart/form-data`，裸 HTTP 客户端可用 JSON —— 两种编码等价支持。

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `model` | string | ✅ | 视频模型名 |
| `prompt` | string | ✅ | 视频描述 |
| `seconds` | string / number | — | 时长（秒），官方形态为字符串 `"4"` / `"8"` / `"12"`；不做档位白名单，各模型时长档直接透传 |
| `size` | string | — | 分辨率。**值原样透传**：请直接传目标供应商的原生词汇（如 MiniMax 的 `768P` / `2K`，通用 `1280x720`） |
| `aspect_ratio` | string | — | 画面比例（协议扩展字段），如 `16:9` / `9:16` |
| `sound` | string / boolean | — | 音频开关：`"on"` / `"off"` 或 `true` / `false`（协议扩展字段） |
| `generate_audio` | boolean | — | 音频开关的布尔写法，`sound` 缺省时生效 |
| `input_reference` | file / object | — | 参考图：multipart 文件 part（≤ 6MB），或 JSON 对象 `{"image_url": "https://... 或 data:..."}`；作为首帧图生成视频 |

::: warning
`input_reference.file_id`（引用已上传文件）不支持 —— 平台未提供 Files API，请直接上传文件或使用 `image_url`，否则返回 400 `file_id_not_supported`。二次创作（remix）暂不支持。
:::

### JSON 示例

```bash
curl -X POST https://your-domain/v1/videos \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kling-v2-master",
    "prompt": "海浪拍打礁石，慢镜头",
    "seconds": "5",
    "aspect_ratio": "16:9"
  }'
```

### 响应（Video 对象）

```json
{
  "id": "video_9f2c7a1b3d5e4f6a8b0c1d2e3f4a5b6c",
  "object": "video",
  "created_at": 1730000000,
  "completed_at": null,
  "status": "queued",
  "progress": 0,
  "model": "kling-v2-master",
  "prompt": "海浪拍打礁石，慢镜头",
  "seconds": "5",
  "size": null,
  "error": null,
  "remixed_from_video_id": null,
  "expires_at": null
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 视频 ID，`video_` 前缀 |
| `object` | string | 恒为 `video` |
| `status` | string | `queued` / `in_progress` / `completed` / `failed` |
| `progress` | integer | 进度百分比 0 – 100（上游无进度信息时按状态给出粗粒度值） |
| `error` | object | 失败时的错误对象 `{code, message}`；成功时为 `null` |
| `created_at` / `completed_at` | integer / null | 创建 / 完成时间戳 |

::: info 错误分两层
请求层错误（参数、鉴权、额度）返回 HTTP 错误状态码 + OpenAI 格式错误体；**生成层失败返回 HTTP 200**，通过 `status: "failed"` + 内嵌 `error` 对象表达 —— 与官方行为一致，客户端应以 `status` 字段判断结果。
:::

## 查询视频

```bash
GET /v1/videos/{video_id}
```

返回最新 [Video 对象](#响应-video-对象)。任务处于非终态（`queued` / `in_progress`）时，响应附带建议轮询间隔头：

```
openai-poll-after-ms: 2000
```

官方 SDK 的 `wait()` / `poll()` 会优先读取该头，无需手动轮询。

## 下载成品

```bash
GET /v1/videos/{video_id}/content?variant=video
```

- 仅 `completed` 状态可下载（其余返回 400 `video_not_ready`）；
- 网关从上游回源拉流并转发二进制（`video/mp4`），**不透出上游 CDN 直链**，整体超时 120 秒；
- 仅支持官方默认 `variant=video`，缩略图等资产第三方上游暂无。

```bash
curl https://your-domain/v1/videos/{video_id}/content?variant=video \
  -H "Authorization: Bearer sk-xxxx" \
  --output video.mp4
```

## 删除视频

```bash
DELETE /v1/videos/{video_id}
```

对齐官方语义「永久删除已完成 / 失败的视频及其资产」：

- 仅**终态**（completed / failed）可删，进行中任务返回 400 `video_not_deletable`；
- 计费尚未结算的任务返回 400 `billing_pending`，稍后重试即可；
- 网关侧软删除（保留计费与审计记录），删除后查询与下载均按 404 处理（幂等）。

```json
{"id": "video_xxx", "object": "video.deleted", "deleted": true}
```

## SDK 接入示例

::: tip
Videos API 需要 openai-python / openai-node 的较新版本（v1.x 后期起内置 `client.videos`），请升级 SDK 后使用。
:::

### Python

```python
from openai import OpenAI

client = OpenAI(base_url="https://your-domain/v1", api_key="sk-xxxx")

video = client.videos.create(
    model="kling-v2-master",
    prompt="海浪拍打礁石，慢镜头",
    seconds="5",
)

# 等待生成完成（自动按 openai-poll-after-ms 轮询）
video = client.videos.wait(video.id)

# 下载成品
with client.videos.content(video.id) as content:
    with open("video.mp4", "wb") as f:
        for chunk in content:
            f.write(chunk)
```

### Node.js

```javascript
import OpenAI from 'openai'
import fs from 'fs'

const client = new OpenAI({ baseURL: 'https://your-domain/v1', apiKey: 'sk-xxxx' })

let video = await client.videos.create({
  model: 'kling-v2-master',
  prompt: '海浪拍打礁石，慢镜头',
  seconds: '5',
})

video = await client.videos.wait(video.id)

const stream = await client.videos.content(video.id)
await stream.pipe(fs.createWriteStream('video.mp4'))
```

## 错误码

| HTTP | `error.code` | 说明 |
|------|-------------|------|
| 400 | `file_id_not_supported` | `input_reference.file_id` 不支持，请改用文件上传或 `image_url` |
| 400 | `video_not_deletable` | 仅终态视频可删除 |
| 400 | `billing_pending` | 计费未结算，稍后重试删除 |
| 400 | `video_not_ready` / `content_not_available` | 视频未完成 / 该任务无成品直链 |
| 400 | `unsupported_variant` | 仅支持 `variant=video` |

其余通用错误码见[错误码说明](/api/error-codes)。
