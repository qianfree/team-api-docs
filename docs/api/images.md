---
title: 图像生成（同步 / 编辑）
---

# 图像生成（同步 / 编辑）

图像生成提供两种调用方式：

- **同步接口** `POST /v1/images/generations`：请求阻塞直到生成完成，一次性返回图片结果，适合交互式场景；
- **异步任务** `POST /v1/images/generations/async`：提交后立即返回 `task_id`，轮询取结果，适合耗时较长的模型，见[异步图像任务](/api/images-async)。

图像编辑 `POST /v1/images/edits` 在原图基础上按指令修改，也属于同步接口。

::: warning 哪些模型必须走异步
部分模型（阿里 wanx 系列、qwen-image、flux、SD 等异步族）上游本身就是任务式接口，**无法**通过同步端点一次性返回，调用同步端点会被拦截并提示改走异步端点。判定规则见[异步图像任务 · 模型分流](/api/images-async#模型分流)。
:::

## 接入说明

| 项目 | 说明 |
|------|------|
| Base URL | `https://your-domain/v1` |
| 认证 | `Authorization: Bearer sk-xxxx` |
| 请求格式 | `application/json`（编辑接口亦支持 `multipart/form-data`） |
| 响应格式 | 图片以 `url` 或 `b64_json` 返回，结构对齐 OpenAI Images API |

## 图像生成

```bash
POST /v1/images/generations
```

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `model` | string | ✅ | 图像模型名，如 `gpt-image-1`、`dall-e-3`、`seedream-4.0`、`qwen-image-2.0` |
| `prompt` | string | ✅ | 图像描述 |
| `n` | integer | — | 生成数量，默认 1 |
| `size` | string | — | 尺寸，如 `1024x1024`、`1792x1024`；各模型支持的档位不同 |
| `quality` | string | — | 质量档位，如 `standard` / `hd`（dall-e-3）、`high` / `medium` / `low`（gpt-image） |
| `style` | string | — | 风格，如 `vivid` / `natural`（dall-e-3） |
| `response_format` | string | — | `url`（默认）/ `b64_json`；gpt-image 系列仅支持 `b64_json` |
| `output_format` | string | — | 输出文件格式：`png` / `jpeg` / `webp` |
| `output_compression` | integer | — | 输出压缩率 0 – 100（jpeg / webp） |
| `background` | string | — | 背景透明度：`transparent` / `opaque` |
| `moderation` | string | — | 内容审核力度：`low` / `auto` |
| `watermark` | boolean | — | 是否添加水印（部分国内模型支持） |
| `partial_images` | integer | — | 流式返回的中间图数量（gpt-image） |
| `stream` | boolean | — | `true` 时以 SSE 逐帧返回中间图（gpt-image） |
| `user` | string | — | 终端用户标识，用于审计追踪 |

::: tip 参数透传
网关按 OpenAI Images 协议解析请求并转换为目标渠道格式；上表未覆盖的模型特有参数（如火山 seedream 的 `sequential_image_generation`、Gemini 的 `aspect_ratio` 等）以各渠道协议为准，详见下文[模型适配说明](#模型适配说明)。
:::

### 响应

```json
{
  "created": 1730000000,
  "data": [
    {
      "url": "https://......png",
      "revised_prompt": "a panda riding a bicycle on the moon"
    }
  ],
  "size": "1024x1024",
  "usage": {
    "total_tokens": 1234,
    "input_tokens": 30,
    "output_tokens": 1204,
    "input_tokens_details": {"text_tokens": 30, "image_tokens": 0}
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `created` | integer | 时间戳 |
| `data[]` | array | 图片数组：`url`（下载地址）或 `b64_json`（base64），`revised_prompt` 为改写后的提示词（dall-e-3），`content_type` 为 MIME 类型 |
| `usage` | object | Token 计量（gpt-image 系列返回；dall-e 系列按次计费、无此字段） |

请求示例：

```bash
curl https://your-domain/v1/images/generations \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-1",
    "prompt": "一只在月球上骑自行车的熊猫，电影感光效",
    "size": "1024x1024",
    "n": 1
  }'
```

## 图像编辑

```bash
POST /v1/images/edits
```

在原图基础上按指令编辑，支持 `multipart/form-data`（文件上传）或 JSON（base64）两种编码：

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `model` | string | ✅ | 支持编辑的模型，如 `gpt-image-1`、`qwen-image-edit` |
| `prompt` | string | ✅ | 编辑指令 |
| `image` | file / string | ✅ | 原图：multipart 文件或 JSON base64 |
| `images` | array | — | 多张参考图（JSON base64 数组） |
| `mask` | file / string | — | 遮罩图：透明区域（alpha 为 0）表示需要重绘的部分 |
| `input_fidelity` | string | — | 输入保真度：`high` / `low`，控制对原图的还原程度 |
| `n` / `size` / `quality` / `response_format` 等 | — | — | 与图像生成一致 |

```bash
curl https://your-domain/v1/images/edits \
  -H "Authorization: Bearer sk-xxxx" \
  -F model="gpt-image-1" \
  -F image="@original.png" \
  -F prompt="把背景换成雪山"
```

::: warning
阿里 wanx 图像编辑族（`wanx-image-inpainting`、`wanx2.1-image-edit`、`qwen-image-edit` 等）属异步族模型，请走[异步图像任务](/api/images-async)端点。
:::

## 模型适配说明

网关按渠道类型将统一请求转换为各上游的原生协议，主要差异如下：

| 模型族 | 上游协议 | 参数差异说明 |
|--------|---------|------------|
| `gpt-image-1` / `gpt-image-2` | OpenAI Images | 仅返回 `b64_json`；Token 计量；`stream` 支持 SSE 中间图 |
| `dall-e-2` / `dall-e-3` | OpenAI Images | 按次计费；`size` / `quality` / `style` 档位见 OpenAI 规范 |
| Gemini 内生图（`gemini-2.5-flash-image` 等） | generateContent | `size` 自动换算为 `aspect_ratio`（如 `1024x1024` → `1:1`）；暂不支持 `n > 1`；亦可在对话接口用 `image_config` 控制 |
| `imagen-*` | Gemini predict | 按上游原生参数转换 |
| `qwen-image-2*`、`z-image*`、`wan2.6-t2i*`、`wan2.7-image*` | 阿里 multimodal-generation | 同步返回；支持中文提示词 |
| `wanx*`、`qwen-image(-plus)`、`flux-*`、`sd-*`、`wan2.2-t2i` | 阿里 image-synthesis（异步） | **必须走异步端点**，见[异步图像任务](/api/images-async) |
| `seedream-*`（火山） | Ark Images | OpenAI 风格参数直传 |
| 即梦（Jimeng） | 即梦兼容网关 | 支持中文提示词与水印控制 |
| `image-01`（MiniMax） | MiniMax Images | `size` 自动换算为 `aspect_ratio` |

支持的具体模型以控制台「模型配置」与 [`/v1/models`](/api/overview#模型列表) 返回为准。

## SDK 接入示例

### Python

```python
from openai import OpenAI

client = OpenAI(base_url="https://your-domain/v1", api_key="sk-xxxx")

resp = client.images.generate(
    model="gpt-image-1",
    prompt="一只在月球上骑自行车的熊猫",
    size="1024x1024",
    n=1,
)
print(resp.data[0].url or resp.data[0].b64_json[:32])
```

### Node.js

```javascript
import OpenAI from 'openai'

const client = new OpenAI({ baseURL: 'https://your-domain/v1', apiKey: 'sk-xxxx' })

const resp = await client.images.generate({
  model: 'gpt-image-1',
  prompt: '一只在月球上骑自行车的熊猫',
  size: '1024x1024',
})
console.log(resp.data[0].url ?? resp.data[0].b64_json.slice(0, 32))
```

### 图像编辑（文件上传）

```python
resp = client.images.edit(
    model="gpt-image-1",
    image=open("original.png", "rb"),
    prompt="把背景换成雪山",
)
```

## 错误响应

错误结构与 OpenAI 一致。异步族模型误调同步端点时返回 400，提示改用异步端点；完整错误码见[错误码说明](/api/error-codes)。
