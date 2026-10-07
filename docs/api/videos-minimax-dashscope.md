---
title: MiniMax / DashScope 官方协议
---

# MiniMax / DashScope 官方协议

针对已在使用 **MiniMax 官方视频 API** 或 **阿里 DashScope 视频生成 API** 的应用，平台原生了这两套官方协议 —— 官方 SDK 只需把 `base_url` 指向网关即可直连，请求 / 响应格式与官方完全一致，鉴权换用平台 `sk-` Key。

- MiniMax 官方协议：**v2**（H3 / H3-Max 系列，`content[]` 多模态请求体）与 **v1**（海螺 Hailuo 2.x 系列，扁平字段请求体）
- DashScope 官方协议：通义万相 wan2.x / wan3.0 系列（`input` / `parameters` 请求体）

::: info
三套视频入口（[通用任务](/api/video-generations)、[OpenAI Videos](/api/videos-openai)、本页官方协议）背后的模型、调度与计费完全互通。新应用建议使用通用任务接口；本页面向已有官方 SDK 代码的迁移场景。
:::

## MiniMax v2 协议（H3 系列）

### 提交任务

```bash
POST /v2/video_generation
```

```json
{
  "model": "MiniMax-H3",
  "content": [
    {"type": "text", "text": "海浪拍打礁石，慢镜头。"},
    {"type": "image_url", "image_url": {"url": "https://example.com/first-frame.png"}, "role": "first_frame"}
  ],
  "resolution": "768P",
  "duration": 6,
  "ratio": "16:9"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `model` | string | ✅ | 模型名，如 `MiniMax-H3`、`MiniMax-H3-Max` |
| `content` | array | ✅ | 多模态内容数组：`{"type": "text", "text": ...}` 文本项与 `{"type": "image_url", "image_url": {"url": ...}, "role": "first_frame"}` 首帧图项；**必须含非空 text 项** |
| `resolution` | string | ✅ | 分辨率档位，如 `768P` / `2K` / `480P` |
| `duration` | integer | ✅ | 时长（秒），正整数（兼容数字字符串） |
| `ratio` | string | — | 画面比例，如 `16:9` / `9:16`；**纯文生视频时必填**（不能为 `adaptive`） |
| `aigc_watermark` | boolean | — | 是否添加 AIGC 水印 |

::: warning
`callback_url` 会被网关剥离：平台按自身任务体系轮询计费，上游回调携带的上游 task_id 与网关公开 ID 不互通。
:::

**响应**（官方形态，`task_id` 为平台公开任务 ID）：

```json
{"task_id": "task_9f2c7a1b3d5e4f6a8b0c1d2e3f4a5b6c"}
```

### 查询任务

```bash
GET /v2/query/video_generation/{task_id}
```

```json
{
  "task": {
    "id": "task_9f2c...",
    "model": "MiniMax-H3",
    "status": "succeeded",
    "task_type": "generation",
    "modality": "video",
    "content": {"url": "https://......mp4"},
    "resolution": "768P",
    "duration": 6,
    "ratio": "16:9",
    "created_at": 1730000000,
    "updated_at": 1730000120
  }
}
```

- 状态机：`queued` → `running` → `succeeded` / `failed`（上游取消的任务回放为 `failed`）；
- `content.url` 为上游限时直链，建议及时转存；
- `usage` / `resolution` / `duration` / `ratio` 从最近一次上游查询回放，任务提交后首拍轮询前（≤ 15 秒）可能缺失。

### 取消任务

```bash
DELETE /v2/video_generation/{task_id}
```

- 仅支持取消**排队中**（queued）的任务：网关调用上游 DELETE，上游确认后才返回成功：

```json
{"task_id": "task_xxx", "action": "cancelled", "status": "cancelled"}
```

- 运行中 / 终态任务返回 400 `task_not_cancellable`；**不支持删除任务记录**（平台保留任务数据用于计费与审计）；
- 取消确认后，本地状态由轮询在下一拍（≤ 15 秒）收敛为 failed，预扣费用随之退还。

## MiniMax v1 协议（海螺系列）

海螺 Hailuo 2.x 及旧型号（T2V / I2V / S2V-01，传入即转发）走 v1 扁平字段协议，文生 / 图生 / 首尾帧 / 主体参考四种形态共用端点：

### 提交任务

```bash
POST /v1/video_generation
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `model` | string | ✅ | 模型名，如 `MiniMax-Hailuo-2.3`、`MiniMax-Hailuo-2.3-Fast`、`MiniMax-Hailuo-02` |
| `prompt` | string | 见注 | 文生视频描述；与 `first_frame_image` / `subject_reference` 至少传其一 |
| `first_frame_image` | string | 见注 | 首帧图（图生视频），支持 URL 或 data URI |
| `last_frame_image` | string | — | 尾帧图（仅 Hailuo-02 支持） |
| `subject_reference` | string | 见注 | 主体参考（S2V-01 系列） |
| `duration` | integer | — | 时长（秒），默认 6；768P 支持 10 |
| `resolution` | string | — | 分辨率，Hailuo 2.x 默认 `768P`（支持 `1080P`），旧型号默认 `720P` |
| `prompt_optimizer` | boolean | — | 提示词智能优化 |
| `fast_pretreatment` | boolean | — | 快速预处理 |
| `aigc_watermark` | boolean | — | 是否添加 AIGC 水印 |

**响应**（官方 `{task_id, base_resp}` 信封形态）：

```json
{"task_id": "task_9f2c...", "base_resp": {"status_code": 0, "status_msg": "success"}}
```

### 查询任务

```bash
GET /v1/query/video_generation?task_id={task_id}
```

```json
{
  "task_id": "task_9f2c...",
  "status": "Success",
  "file_id": "xxxx",
  "video_width": 1280,
  "video_height": 720,
  "download_url": "https://......mp4",
  "base_resp": {"status_code": 0, "status_msg": "success"}
}
```

- 状态机：`Preparing` / `Queueing` / `Processing` → `Success` / `Fail`；
- **网关增补字段** `download_url`：官方流程需「file_id → files/retrieve → 下载链接」二跳，网关在轮询时代取并回放到查询响应（官方 SDK 忽略未知字段，不影响兼容）；失败时增补 `error` 字段；
- v1 上游无取消能力，不提供 DELETE 端点（v2 的 DELETE 对 v1 任务返回 400）。

## DashScope 协议（通义万相）

### 提交任务

```bash
POST /v1/services/aigc/video-generation/video-synthesis
```

```json
{
  "model": "wan2.2-t2v-plus",
  "input": {
    "prompt": "城市夜景延时摄影，车流光轨",
    "negative_prompt": "模糊、低质量",
    "media": [{"type": "image", "url": "https://example.com/first-frame.png"}]
  },
  "parameters": {
    "resolution": "1080P",
    "ratio": "16:9",
    "duration": 5,
    "prompt_extend": true,
    "watermark": false
  }
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `model` | string | ✅ | 模型名，如 `wan3.0-video`、`wan2.2-t2v-plus`、`wan2.6-t2v` |
| `input.prompt` | string | 见注 | 提示词；与 `input.media` 至少传其一 |
| `input.negative_prompt` | string | — | 反向提示词 |
| `input.audio_url` | string | — | 参考音频 URL（音频参考生成） |
| `input.media` | array | 见注 | 参考媒体数组 `[{"type": "image", "url": ...}]`，图生视频 |
| `parameters.resolution` | string | — | 分辨率，如 `1080P` / `720P` |
| `parameters.ratio` | string | — | 画面比例，如 `16:9` / `9:16` |
| `parameters.size` | string | — | 尺寸（与 resolution 二选一的厂商词汇） |
| `parameters.duration` | integer | — | 时长（秒）；wan3.0 支持 `-1` 表示智能时长 |
| `parameters.audio` | boolean | — | wan3.0：输出是否包含音频 |
| `parameters.seed` | integer | — | 随机种子 |
| `parameters.prompt_extend` | boolean | — | 是否智能扩写提示词 |
| `parameters.watermark` | boolean | — | 是否添加水印 |

**响应**（官方 DashScope 形态）：

```json
{"output": {"task_status": "PENDING", "task_id": "task_9f2c..."}, "request_id": "req_xxx"}
```

### 查询任务

```bash
GET /v1/tasks/{task_id}
```

```json
{
  "output": {
    "task_id": "task_9f2c...",
    "task_status": "SUCCEEDED",
    "submit_time": "2025-01-01 10:00:00.000",
    "end_time": "2025-01-01 10:02:30.000",
    "orig_prompt": "城市夜景延时摄影",
    "video_url": "https://......mp4"
  },
  "usage": {"video_count": 1, "video_duration": 5.0},
  "request_id": "req_xxx"
}
```

- 状态机：`PENDING` → `RUNNING` → `SUCCEEDED` / `FAILED`；
- 响应优先回放缓存的上游查询数据（含 `usage` / 时间线，保真度最高），`task_status` 以平台状态为准；失败时 `output.code` / `output.message` 携带原因；
- 仅服务阿里平台任务，其他平台的任务 ID 查询返回 404。

## SDK 接入示例

### MiniMax 官方 SDK（Python）

```python
from minimax import MiniMax

client = MiniMax(base_url="https://your-domain", api_key="sk-xxxx")

resp = client.video_generation(
    model="MiniMax-H3",
    prompt="海浪拍打礁石，慢镜头。",
    resolution="768P",
    duration=6,
    ratio="16:9",
)
print(resp.task_id)
```

### 阿里 DashScope SDK（Python）

```python
import dashscope

dashscope.base_http_api_url = "https://your-domain"
dashscope.api_key = "sk-xxxx"

rsp = dashscope.VideoSynthesis.call(
    model="wan2.2-t2v-plus",
    prompt="城市夜景延时摄影，车流光轨",
    parameters={"resolution": "1080P", "ratio": "16:9"},
)
print(rsp.output.task_id)
```

::: tip
SDK 版本不同方法名可能有差异（如 `video_generation` / `query_video_generation`），核心是 `base_url` 与 `api_key` 指向网关；请求体格式以官方 SDK 文档与本页字段为准。
:::

## 错误响应

MiniMax 端点错误为 OpenAI 风格（`{"error": {"type", "message", "code"}}`，与官方 v2 一致）；DashScope 端点错误为 DashScope 官方格式。特有错误码：

| HTTP | `error.code` | 端点 | 说明 |
|------|-------------|------|------|
| 400 | `task_not_cancellable` | MiniMax v2 DELETE | 任务运行中 / 已终态 / v1 任务不可取消 |
| 400 | — | 各提交端点 | 必填字段缺失（`model` / `content` / `resolution` / `duration` 等） |

其余通用错误码（余额、限流、渠道不可用等）见[错误码说明](/api/error-codes)。
