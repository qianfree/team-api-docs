---
title: 错误码说明
---

# 错误码说明

> 🚧 本章节编写中。完整错误码表将整理自主仓库 API 定义。

## 规划结构

- **HTTP 状态码语义** —— 400 / 401 / 403 / 429 / 500 / 502 / 504 在网关场景下的含义
- **业务错误码总表** —— 错误码 / 触发原因 / 排查建议
- **额度类错误** —— 各层额度不足的区分与提示
- **渠道类错误** —— 上游故障、无可用渠道等
- **错误响应格式** —— 与 OpenAI 兼容的错误结构示例

```json
{
  "error": {
    "message": "insufficient quota: project budget exceeded",
    "type": "quota_error",
    "code": "quota_project_exceeded"
  }
}
```
