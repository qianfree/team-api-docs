---
title: 音乐生成 Suno
---

# 音乐生成 Suno

`/suno/*` 系列端点代理 **Suno 音乐生成**协议：提交音乐 / 歌词生成任务后返回 `task_id`，轮询取结果。请求体按 Suno 协议透传，已有 Suno 接入代码只需替换地址与鉴权。

## 接口总览

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/suno/submit/music` | 提交音乐生成任务 |
| `POST` | `/suno/submit/lyrics` | 提交歌词生成任务 |
| `POST` | `/suno/fetch` | 查询任务（body 传 `task_id`） |
| `GET` | `/suno/fetch/{task_id}` | 查询任务（路径参数） |

## 提交任务

```bash
POST /suno/submit/{music|lyrics}
```

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `model` | string | ✅ | 模型标识：`suno_music`（音乐）/ `suno_lyrics`（歌词） |
| `prompt` | string | — | 创作描述：歌词主题、纯音乐氛围等 |
| `tags` | string | — | 音乐风格标签（音乐任务），如 `pop, electronic` |
| `title` | string | — | 歌曲标题 |
| `mv` | string | — | 生成模型版本，缺省 `chirp-v3-0` |
| `instrumental` | boolean | — | 是否纯音乐（音乐任务） |

其余 Suno 协议字段（`make_instrumental`、`wait_audio`、`style` 等）原样透传上游。

```bash
# 生成音乐
curl -X POST https://your-domain/suno/submit/music \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "suno_music",
    "prompt": "一首关于夏天海边的轻快歌曲",
    "tags": "pop, acoustic",
    "instrumental": false
  }'

# 生成歌词
curl -X POST https://your-domain/suno/submit/lyrics \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{"model": "suno_lyrics", "prompt": "写一段关于远行的歌词"}'
```

### 提交响应

```json
{
  "id": "task_9f2c7a1b3d5e4f6a8b0c1d2e3f4a5b6c",
  "status": "SUBMITTED",
  "model": "suno_music",
  "created_at": 1730000000
}
```

## 查询任务

两种等价方式：

```bash
# 方式一：body 传 task_id
curl -X POST https://your-domain/suno/fetch \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{"task_id": "task_9f2c..."}'

# 方式二：路径参数
curl https://your-domain/suno/fetch/task_9f2c... \
  -H "Authorization: Bearer sk-xxxx"
```

### 响应

```json
{
  "id": "task_9f2c7a1b3d5e4f6a8b0c1d2e3f4a5b6c",
  "status": "SUCCESS",
  "progress": "100%",
  "model": "suno_music",
  "url": "https://......mp3",
  "created_at": 1730000000,
  "completed_at": 1730000090
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 任务 ID，`task_` 前缀 |
| `status` | string | 任务状态，见下表 |
| `progress` | string | 进度：排队阶段缺省，生成中 `50%`，完成 `100%` |
| `model` | string | `suno_music` / `suno_lyrics` |
| `url` | string | 生成成功时的音频地址（多段音频时为首段） |
| `error` | string | 失败原因（`FAILURE` 时返回） |

### 状态机

与平台通用任务状态机一致，上游 Suno 状态自动映射：

| 状态 | 对应上游状态 |
|------|------------|
| `SUBMITTED` / `QUEUED` | `submitted` / `queueing` |
| `IN_PROGRESS` | `processing` |
| `SUCCESS` | `success` |
| `FAILURE` | `failed`（`error` 携带原因，预扣费用退还） |

## 计费说明

音乐 / 歌词任务按次计费：提交时预扣，网关后台轮询上游，成功结算、失败退还。计费流水可在控制台「用量日志」中按任务 ID 检索。

## 错误响应

错误结构与 OpenAI 一致，见[错误码说明](/api/error-codes)。上游拒绝（配额、内容策略等）时错误信息原样透传。
