---
title: 视频生成（通用任务）
---

# 视频生成（通用任务）

`POST /v1/video/generations` 是视频生成的**统一入口**：所有上游视频模型（可灵、Sora、Veo、豆包 Seedance、MiniMax 海螺、通义万相等）都使用同一套请求体，`model` 指定模型，`metadata` 携带各模型特有的参数，无需关心各家的协议差异。

视频生成为**异步任务**：提交后返回 `task_id`，凭 `task_id` 轮询状态与结果。

::: info 其他视频协议入口
- 已有基于 OpenAI 官方 SDK 的应用：[OpenAI Videos 协议](/api/videos-openai)（`/v1/videos`）
- 已有基于 MiniMax / 阿里 DashScope 官方 SDK 的应用：[MiniMax / DashScope 官方协议](/api/videos-minimax-dashscope)

三套入口的模型、调度与计费完全互通，任选其一即可。
:::

## 接口总览

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/v1/video/generations` | 提交视频生成任务 |
| `GET` | `/v1/video/generations/{task_id}` | 查询任务状态与结果 |

## 提交任务

```bash
POST /v1/video/generations
```

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `model` | string | ✅ | 视频模型名，如 `kling-v2-master`、`wan2.2-t2v-plus` |
| `prompt` | string | — | 文生视频描述（图生视频部分模型可省略） |
| `seconds` | string / number | — | 时长（秒），如 `"5"` / `"10"`；等价于 `metadata.duration` |
| `images` | array | — | 参考图 URL 数组，图生视频（i2v）时传入；`images[0]` 为首帧 |
| `metadata` | object | — | 模型参数集合，常用键见下表 |
| `size` | string | — | **已废弃**，请使用 `metadata.resolution` |
| `length` | integer | — | **已废弃**，请使用 `metadata.duration` |

### `metadata` 常用键

各模型消费的键不同，未识别的键会被忽略：

| 键 | 类型 | 说明 |
|----|------|------|
| `resolution` | string | 分辨率，如 `720p`、`1080p`（可灵 / Seedance / 万相） |
| `duration` | integer | 时长（秒），优先级低于顶层 `seconds` |
| `ratio` / `aspect_ratio` | string | 画面比例，如 `16:9`、`9:16` |
| `image` | string | 首帧图 URL（图生视频） |
| `image_tail` | string | 尾帧图 URL（可灵） |
| `negative_prompt` | string | 反向提示词（可灵 / 万相） |
| `mode` | string | 可灵生成模式：`std`（标准）/ `pro`（专业） |
| `cfg_scale` | number | 提示词相关性（可灵，0 – 1） |
| `sound` | string | 音频开关：`on` / `off`（可灵 / 万相 wan3.0） |
| `generate_audio` | boolean | 音频开关（Seedance 布尔形态） |
| `seed` | integer | 随机种子 |
| `prompt_extend` | boolean | 是否智能扩写提示词（万相 / Seedance） |
| `watermark` | boolean | 是否添加水印 |
| `camera_control` | object | 运镜控制（可灵） |

### 文生视频示例

```bash
curl -X POST https://your-domain/v1/video/generations \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kling-v2-master",
    "prompt": "城市夜景延时摄影，车流光轨，电影感",
    "seconds": "5",
    "metadata": { "aspect_ratio": "16:9", "mode": "pro" }
  }'
```

### 图生视频示例

```bash
curl -X POST https://your-domain/v1/video/generations \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "doubao-seedance-2-0-260128",
    "prompt": "让画面中的海浪动起来，慢镜头推进",
    "images": ["https://example.com/first-frame.png"],
    "seconds": "10",
    "metadata": { "resolution": "1080p", "ratio": "16:9" }
  }'
```

### 提交响应

```json
{
  "id": "task_9f2c7a1b3d5e4f6a8b0c1d2e3f4a5b6c",
  "status": "SUBMITTED",
  "model": "kling-v2-master",
  "created_at": 1730000000
}
```

## 查询任务

```bash
GET /v1/video/generations/{task_id}
```

### 响应

```json
{
  "id": "task_9f2c7a1b3d5e4f6a8b0c1d2e3f4a5b6c",
  "status": "SUCCESS",
  "progress": "100%",
  "model": "kling-v2-master",
  "url": "https://......mp4",
  "created_at": 1730000000,
  "completed_at": 1730000180
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 任务 ID，`task_` 前缀 |
| `status` | string | 任务状态，见下表 |
| `progress` | string | 进度（如 `"42%"`），部分上游无进度信息时缺省 |
| `model` | string | 模型名 |
| `url` | string | 生成成功时的视频下载地址（上游限时直链，建议及时转存） |
| `error` | string | 失败原因（`FAILURE` 时返回） |
| `created_at` / `completed_at` | integer | 提交 / 完成时间戳 |

### 状态机

| 状态 | 说明 |
|------|------|
| `NOT_START` / `SUBMITTED` / `QUEUED` | 已接收，等待上游调度 |
| `IN_PROGRESS` | 生成中 |
| `SUCCESS` | 成功，`url` 可用 |
| `FAILURE` | 失败，`error` 携带原因，预扣费用已退还 |

::: tip 轮询建议
建议 5 – 10 秒间隔轮询；视频任务通常 1 – 5 分钟完成。任务进入终态后即可停止轮询。
:::

## 计费说明

任务提交时按请求规格（模型单价 × 时长 / 分辨率参数倍率）**预扣**费用；网关后台轮询上游任务状态，成功后按真实用量结算，失败或超时自动全额退还预扣额。计费流水可在控制台「用量日志」中按任务 ID 检索。

## 支持的模型

支持的视频模型以控制台「模型配置」与 [`/v1/models`](/api/overview#模型列表) 为准。各模型族的默认清单与关键参数：

| 模型族 | 模型示例 | 关键参数 |
|--------|---------|---------|
| 可灵 Kling | `kling-v1` / `v1-6` / `v2-master` / `v2-5-turbo` / `v2-6` / `v3` / `kling-video-o1` | `mode`（std/pro）、`duration` 5/10 秒、`aspect_ratio`、`cfg_scale`、首尾帧图、`sound` |
| Sora | 渠道配置的 sora 系列模型 | `seconds`（4/8/12）、`size` |
| Gemini Veo | 渠道配置的 veo 系列模型 | `resolution`（480p/720p/1080p/4K）、`aspect_ratio`、时长 |
| 豆包 Seedance | `doubao-seedance-1-0-pro-250528` / `1-0-lite-t2v` / `1-0-lite-i2v` / `1-5-pro-251215` / `2-0-260128` / `2-0-fast-260128` | `resolution`、`ratio`、`duration`、`seed`、图生视频 `images[]` |
| MiniMax | `MiniMax-H3` / `H3-Max` / `MiniMax-Hailuo-2.3` / `2.3-Fast` / `02` | 缺省 768P / 6 秒 / 16:9 |
| 通义万相 Wan | `wan3.0-video` / `wan3.0-video-prime` / `wan2.7-t2v-2026-04-25` / `wan2.6-t2v` / `wan2.2-t2v-plus` / `wanx2.1-t2v-turbo` | `resolution`、`ratio`、`duration`、`negative_prompt`、`prompt_extend`、`watermark`、wan3.0 `audio` |

## 错误响应

错误结构与 OpenAI 一致（`{"error": {"type", "message", "code"}}`），常见错误：

| HTTP | 场景 |
|------|------|
| 400 | `model` 缺失、请求体非法、模型不支持任务式生成 |
| 402 | 余额不足 / Key 额度不足（预扣失败，未产生消费） |
| 403 | 租户未启用该模型 / 成员或 Key 无权使用 / IP 不在白名单 |
| 429 | 触发 QPS 或并发限制 |
| 503 | 该模型暂无可用渠道 |

完整错误码见[错误码说明](/api/error-codes)。
