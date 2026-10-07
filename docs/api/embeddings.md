---
title: 向量嵌入
---

# 向量嵌入

`POST /v1/embeddings` 将文本转换为向量，用于检索、聚类与 RAG 场景。完整兼容 OpenAI Embeddings 协议。

## 接入说明

| 项目 | 说明 |
|------|------|
| 路径 | `POST /v1/embeddings` |
| 认证 | `Authorization: Bearer sk-xxxx` |
| 流式 | 不支持 |

## 请求参数

```bash
POST /v1/embeddings
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `model` | string | ✅ | 嵌入模型名，如 `text-embedding-3-small`、`bge-m3` |
| `input` | string / array | ✅ | 文本或文本数组（单数组元素计数上限以模型为准） |
| `encoding_format` | string | — | `float`（默认）/ `base64` |
| `dimensions` | integer | — | 输出维度（支持降维的模型，如 text-embedding-3 系列） |
| `user` | string | — | 终端用户标识，用于审计追踪 |

```bash
curl https://your-domain/v1/embeddings \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-3-small",
    "input": "Team-API 是多租户大模型 API 网关"
  }'
```

## 响应

```json
{
  "object": "list",
  "data": [
    {"object": "embedding", "index": 0, "embedding": [0.0023, -0.0091, "..."]}
  ],
  "model": "text-embedding-3-small",
  "usage": {"prompt_tokens": 14, "total_tokens": 14}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `data[]` | array | 嵌入结果：`index` 为输入序号，`embedding` 为向量（`encoding_format` 为 `base64` 时为 base64 字符串） |
| `usage` | object | 按 Token 计费 |

## SDK 接入示例

### Python

```python
from openai import OpenAI

client = OpenAI(base_url="https://your-domain/v1", api_key="sk-xxxx")

resp = client.embeddings.create(
    model="text-embedding-3-small",
    input=["第一段文本", "第二段文本"],
)
print(resp.data[0].embedding[:5])
```

### Node.js

```javascript
import OpenAI from 'openai'

const client = new OpenAI({ baseURL: 'https://your-domain/v1', apiKey: 'sk-xxxx' })

const resp = await client.embeddings.create({
  model: 'text-embedding-3-small',
  input: ['第一段文本', '第二段文本'],
})
console.log(resp.data[0].embedding.slice(0, 5))
```

## 错误响应

错误结构与 OpenAI 一致，见[错误码说明](/api/error-codes)。
