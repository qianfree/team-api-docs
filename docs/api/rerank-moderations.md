---
title: 重排序与内容审核
---

# 重排序与内容审核

两个文本增强接口，常用于 RAG 检索优化与内容合规：

- **重排序** `POST /v1/rerank`：按与查询的相关性对文档重排，兼容 Cohere / Jina 风格；
- **内容审核** `POST /v1/moderations`：识别文本中的违规内容，兼容 OpenAI Moderations 协议。

## 重排序

```bash
POST /v1/rerank
```

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `model` | string | ✅ | 重排模型名，如 `rerank-v2`、`bge-reranker-v2-m3` |
| `query` | string | ✅ | 查询文本 |
| `documents` | array | ✅ | 待重排的文档数组（字符串或对象） |
| `top_n` | integer | — | 返回前 N 条结果，默认全部 |
| `return_documents` | boolean | — | 结果中是否附带原文，默认 `true` |
| `max_chunks_per_doc` | integer | — | 单文档最大分块数 |
| `overlap_tokens` | integer | — | 分块重叠 Token 数 |

```bash
curl https://your-domain/v1/rerank \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "rerank-v2",
    "query": "什么是多租户隔离？",
    "documents": [
      "Team-API 通过行级租户隔离保证数据安全……",
      "双独立用户体系指管理端与租户端账号分离……"
    ],
    "top_n": 2
  }'
```

### 响应

```json
{
  "results": [
    {"index": 0, "relevance_score": 0.95, "document": "Team-API 通过行级租户隔离保证数据安全……"},
    {"index": 1, "relevance_score": 0.42, "document": "双独立用户体系指管理端与租户端账号分离……"}
  ],
  "usage": {"prompt_tokens": 210, "total_tokens": 210, "search_units": 1},
  "meta": {"billed_units": {"search_documents": 2}}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `results[]` | array | 按 `relevance_score` 降序排列；`index` 为原文档下标 |
| `usage` | object | Token 计量；`search_units` 为按文档数计费的检索单元 |
| `meta.billed_units` | object | 计费单元细分（Cohere 风格） |

## 内容审核

```bash
POST /v1/moderations
```

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `model` | string | — | 审核模型，如 `text-moderation-latest`（缺省用渠道默认） |
| `input` | string / array | ✅ | 待审核文本（单条或数组） |

```bash
curl https://your-domain/v1/moderations \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{"model": "text-moderation-latest", "input": "待审核文本"}'
```

### 响应

```json
{
  "id": "modr-xxxx",
  "model": "text-moderation-latest",
  "results": [
    {
      "flagged": false,
      "categories": {"violence": false, "hate": false, "sexual": false},
      "category_scores": {"violence": 0.0001, "hate": 0.0002, "sexual": 0.0001}
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `results[].flagged` | boolean | 是否命中违规 |
| `results[].categories` | object | 各类别命中布尔值（violence / hate / sexual / self-harm 等） |
| `results[].category_scores` | object | 各类别违规概率 0 – 1 |

## SDK 接入示例

### Python

```python
from openai import OpenAI

client = OpenAI(base_url="https://your-domain/v1", api_key="sk-xxxx")

# 重排序（OpenAI SDK 未内置 rerank，直接走 HTTP）
import httpx
resp = httpx.post(
    "https://your-domain/v1/rerank",
    headers={"Authorization": "Bearer sk-xxxx"},
    json={"model": "rerank-v2", "query": "什么是多租户隔离？", "documents": ["……"]},
)
print(resp.json()["results"])

# 内容审核
mod = client.moderations.create(model="text-moderation-latest", input="待审核文本")
print(mod.results[0].flagged)
```

## 错误响应

错误结构与 OpenAI 一致，见[错误码说明](/api/error-codes)。
