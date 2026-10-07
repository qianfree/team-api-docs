---
title: 异步图像任务
---

# 异步图像任务

`POST /v1/images/generations/async` 提交图像生成任务后**立即返回** `task_id`，客户端凭 `task_id` 轮询结果，不必保持长连接。适合两类场景：

1. **异步族模型**（阿里 wanx / qwen-image / flux / SD 等）—— 上游本身就是任务式接口，这是它们唯一的调用方式；
2. **同步模型的异步化** —— 生图耗时较长（10 – 60s）的同步模型（gpt-image、seedream 等）由平台包装成可轮询任务，释放客户端连接。

## 接口总览

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/v1/images/generations/async` | 提交异步图像任务 |
| `GET` | `/v1/images/generations/async/{task_id}` | 查询任务状态与结果 |

## 提交任务

```bash
POST /v1/images/generations/async
```

### 请求参数

参数与[同步图像生成](/api/images#请求参数)一致（`model`、`prompt`、`n`、`size`、`negative_prompt` 透传项以模型为准），`stream` 字段会被剥离（任务恒为非流式）：

```bash
curl -X POST https://your-domain/v1/images/generations/async \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{"model": "wanx2.1-t2i-turbo", "prompt": "一只在月球上骑自行车的熊猫", "size": "1024x1024"}'
```

### 响应

```json
{
  "id": "task_9f2c7a1b3d5e4f6a8b0c1d2e3f4a5b6c",
  "status": "SUBMITTED",
  "model": "wanx2.1-t2i-turbo",
  "created_at": 1730000000
}
```

`status` 为 `SUBMITTED`（异步族，已提交上游）或 `QUEUED`（同步模型包装，已入平台执行队列）。提交即返回，后续状态通过查询获取。

## 查询任务

```bash
GET /v1/images/generations/async/{task_id}
```

### 响应

```json
{
  "id": "task_9f2c7a1b3d5e4f6a8b0c1d2e3f4a5b6c",
  "status": "SUCCESS",
  "progress": "100%",
  "model": "wanx2.1-t2i-turbo",
  "url": "https://......png",
  "data": [
    {"url": "https://......png"},
    {"url": "https://......png"}
  ],
  "created_at": 1730000000,
  "completed_at": 1730000042
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 任务 ID，`task_` 前缀 |
| `status` | string | 任务状态，见下文状态机 |
| `progress` | string | 进度（如 `"42%"`），无进度信息的模型可能缺省 |
| `model` | string | 模型名 |
| `url` | string | 生成成功时的图片地址（多图时为首图） |
| `data[]` | array | **同步模型包装任务专有**：完整图片数组（`url` / `b64_json`），与同步端点响应结构一致 |
| `error` | string | 失败原因（`status` 为 `FAILURE` 时返回） |
| `created_at` / `completed_at` | integer | 提交 / 完成时间戳 |

### 状态机

| 状态 | 说明 |
|------|------|
| `NOT_START` / `SUBMITTED` / `QUEUED` | 已接收：已提交上游或排队等待执行 |
| `IN_PROGRESS` | 生成中 |
| `SUCCESS` | 成功，`url` / `data[]` 可用 |
| `FAILURE` | 失败，`error` 携带原因，预扣费用已退还 |

::: tip 轮询建议
建议 2 – 5 秒间隔轮询；图片任务通常 10 – 60 秒完成。任务进入终态（`SUCCESS` / `FAILURE`）后即可停止轮询，平台侧轮询结算由网关自动完成，不影响结果获取。
:::

## 模型分流

提交时按模型自动分流，判定规则如下：

| 模型族 | 走向 | 说明 |
|--------|------|------|
| 阿里异步族：`wanx-*`、`qwen-image`、`qwen-image-plus`、`wan2.2-t2i-*`、`flux-*`、`stable-diffusion-xl` 等 | 真·异步任务 | 上游任务式接口，提交拿上游任务 ID 后轮询 |
| 阿里同步 multimodal 族：`qwen-image-2*`、`z-image*`、`wan2.6-t2i*`、`wan2.7-image*` | 平台包装异步 | 恒定支持：由后台 worker 池执行同步调用，任务状态 `QUEUED` → `SUCCESS`/`FAILURE` |
| 其他同步厂商（OpenAI gpt-image、Gemini imagen、火山 seedream、即梦、MiniMax 等） | 平台包装异步 | 受系统设置「同步图片异步化」（`sync_image_async_enabled`）控制；未开启时返回 400 `image_async_disabled`，此时请改用[同步端点](/api/images) |

### 同步模型包装的存储要求

包装任务的结果若为 base64（`response_format: "b64_json"` 或 gpt-image 系列恒返回 b64），需要平台配置对象存储（OSS / S3 / COS）保存后转存出可下载 URL：

- 未配置存储且请求必然产生 b64 结果时，提交阶段直接返回 503 并提示联系管理员配置存储；
- `url` 透传模式（未开启 re-host 的 `response_format: url` 请求）不受影响。

## 错误响应

错误结构与 OpenAI 一致。特有错误码：

| HTTP | `error.code` | 说明 |
|------|-------------|------|
| 400 | `image_async_disabled` | 该同步模型未开启异步化，请改调 `POST /v1/images/generations` |
| 503 | — | 平台未配置对象存储且请求需要存储（见上文） |

其余通用错误码见[错误码说明](/api/error-codes)。
