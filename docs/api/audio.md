---
title: 语音接口
---

# 语音接口

语音接口覆盖三个方向，均兼容 OpenAI Audio 协议：

| 路径 | 说明 | 请求格式 |
|------|------|---------|
| `/v1/audio/speech` | 文字转语音（TTS） | JSON |
| `/v1/audio/transcriptions` | 语音转文字（STT） | `multipart/form-data` |
| `/v1/audio/translations` | 语音翻译（译为英文） | `multipart/form-data` |

## 文字转语音

```bash
POST /v1/audio/speech
```

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `model` | string | ✅ | TTS 模型名，如 `tts-1`、`tts-1-hd`、`gpt-4o-mini-tts` |
| `input` | string | ✅ | 待合成文本（长度上限以模型为准，tts-1 系列为 4096 字符） |
| `voice` | string | — | 音色：`alloy` / `echo` / `fable` / `onyx` / `nova` / `shimmer` 等 |
| `instructions` | string | — | 语音风格指令（gpt-4o-mini-tts，如「用新闻主播的语气」） |
| `response_format` | string | — | 输出格式：`mp3`（默认）/ `opus` / `aac` / `flac` / `wav` / `pcm` |
| `speed` | number | — | 语速 0.25 – 4.0，默认 1.0 |

### 响应

返回**二进制音频流**（`Content-Type` 与 `response_format` 对应），直接落盘即可：

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

## 语音转文字

```bash
POST /v1/audio/transcriptions
```

`multipart/form-data` 请求：

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `file` | file | ✅ | 音频文件（mp3 / mp4 / wav / m4a / webm 等，≤ 25MB） |
| `model` | string | ✅ | STT 模型名，如 `whisper-1` |
| `language` | string | — | 源语言 ISO-639-1（如 `zh`），缺省自动检测 |
| `prompt` | string | — | 提示词，可用于纠正专有名词的写法 |
| `response_format` | string | — | `json`（默认）/ `text` / `verbose_json` |
| `timestamp_granularities[]` | array | — | 时间戳粒度：`word` / `segment`（需 `verbose_json`） |

### 响应

```json
{
  "text": "今天天气怎么样？",
  "language": "zh",
  "duration": 3.2,
  "words": [{"word": "今天", "start": 0.0, "end": 0.5}],
  "segments": [{"id": 0, "seek": 0, "start": 0.0, "end": 3.2, "text": "今天天气怎么样？"}]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `text` | string | 识别文本 |
| `language` | string | 检测到的语言 |
| `duration` | number | 音频时长（秒） |
| `words[]` | array | 词级时间戳（需请求 `timestamp_granularities[]: ["word"]`） |
| `segments[]` | array | 分段时间戳 |

## 语音翻译

```bash
POST /v1/audio/translations
```

请求参数与语音转文字一致（`language` 除外 —— 恒翻译为英文）。响应 `{"text": "..."}`。

```bash
curl https://your-domain/v1/audio/translations \
  -H "Authorization: Bearer sk-xxxx" \
  -F file="@audio.mp3" \
  -F model="whisper-1"
```

## SDK 接入示例

### Python

```python
from openai import OpenAI

client = OpenAI(base_url="https://your-domain/v1", api_key="sk-xxxx")

# TTS
with client.audio.speech.with_streaming_response.create(
    model="tts-1",
    voice="alloy",
    input="你好，世界",
) as resp:
    resp.stream_to_file("speech.mp3")

# STT
with open("audio.mp3", "rb") as f:
    transcript = client.audio.transcriptions.create(model="whisper-1", file=f)
print(transcript.text)
```

### Node.js

```javascript
import OpenAI from 'openai'
import fs from 'fs'

const client = new OpenAI({ baseURL: 'https://your-domain/v1', apiKey: 'sk-xxxx' })

// TTS
const speech = await client.audio.speech.create({
  model: 'tts-1',
  voice: 'alloy',
  input: '你好，世界',
})
fs.writeFileSync('speech.mp3', Buffer.from(await speech.arrayBuffer()))

// STT
const transcript = await client.audio.transcriptions.create({
  model: 'whisper-1',
  file: fs.createReadStream('audio.mp3'),
})
console.log(transcript.text)
```

## 错误响应

错误结构与 OpenAI 一致，见[错误码说明](/api/error-codes)。
