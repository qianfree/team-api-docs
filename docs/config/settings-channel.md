---
title: 渠道配置
---

# 渠道配置

**管理后台 → 系统设置 → 渠道配置**

上游渠道的全局运维策略：健康探测、自动禁用、调度路由、出站代理、图片异步化，以及跨协议转换（thinking 适配）的高级选项。

## 自动探测

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `channel_auto_test_enabled` 渠道自动探测 | 开 | 定期向**活跃**渠道发送测试请求，检测连通性并更新健康度（会消耗少量 Token）。已禁用的渠道不自动探测，由管理员手动测试确认后再启用 |

健康度数据用于渠道调度评分与监控大盘。Token 消耗敏感时可关闭，代价是故障渠道要等真实请求失败才暴露。

## 自动禁用

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `channel_auto_disable_enabled` 渠道自动禁用 | 关 | 渠道**熔断持续超过** `breaker.autoDisableAfterSeconds`（默认 10 分钟）未恢复时，自动把渠道置为禁用，不再参与调度 |
| `health_snapshot_retention_days` 健康快照保留天数 | `7` | 渠道健康度历史快照的保留天数（1–90 天），供健康趋势图回看 |

::: tip
自动禁用默认关闭——适合渠道少、管理员响应快的部署；渠道多、夜间无人值守的平台建议开启，避免坏渠道反复进出调度。被自动禁用的渠道修复后需**手动启用**。
:::

## 路由策略

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `channel_routing_policy` 路由策略覆盖（JSON） | 空 | 渠道调度引擎的策略参数，JSON 格式，**只覆盖想改的字段**，其余用内置默认值。保存时校验 JSON 合法性与取值范围，保存后 **30 秒内热生效** |

示例——调整次级渠道权重因子与熔断阈值：

```json
{
  "tierFactors": { "secondary": 0.3 },
  "breaker": { "failThreshold": 5 }
}
```

完整字段说明见主仓库 `docs/reference/渠道调度运维手册.md`。留空即全部使用默认策略。

## 代理设置

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `channel_proxy_url` 代理地址 | 空 | 全局出站代理，支持 `http://` 与 ` socks5://`（如 `http://127.0.0.1:7890`）。**在渠道编辑中勾选「使用代理」的渠道**才会经此代理转发 |

::: tip 与 config.yaml 的关系
config.yaml 中也有同名的 `channel_proxy_url`（见[运行配置](/config/config-yaml#channel-proxy-url-出站代理)），网关转发层读取的是配置文件值，约 10 秒热生效。两处保持一致以免困惑。
:::

国内服务器直连不了 Google / Anthropic 上游时：本页配代理地址 + 在对应渠道上勾选「使用代理」。

## 同步图片异步化

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `sync_image_async_enabled` 同步图片厂商异步化 | 关 | 同步阻塞返回的图片厂商（OpenAI / DALL·E 等）请求 `/v1/images/generations/async` 端点时，改由后台 worker 池异步处理：客户端提交即拿 `task_id`，轮询取图。关闭时该端点对同步厂商返回不支持 |
| `sync_image_rehost_url` 图片 URL 转存对象存储 | 关 | 上游返回**图片 URL** 时下载并转存到对象存储，返回 24 小时稳定链接（上游链接部分厂商约 1 小时就过期）；关闭则直接透传上游 URL。`b64_json` 格式的图片**始终转存** |

::: warning 前置依赖
两项都依赖[存储配置](/config/settings-storage)已配好可用的对象存储（OSS / S3 / COS / MinIO / R2），开启前先完成存储配置并点「测试连接」验证。转存的图片按[数据治理](/config/settings-data-governance)的 AI 图片保留天数自动清理。
:::

## 协议转换选项

OpenAI 入站请求转到 Claude / Gemini 上游时的**扩展思考（thinking）**适配——通过模型名后缀触发：

| 后缀 | 含义 |
|---|---|
| `-thinking` | 开启扩展思考 |
| `-nothinking` | 关闭思考（Gemini） |
| `-low` / `-medium` / `-high` | 按力度设定思考预算（effort） |

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `relay_claude_thinking_adapter_enabled` Claude thinking 后缀适配 | 开 | OpenAI 入站 × Claude 上游：把模型名后缀转换为 Claude 扩展思考请求（注入 thinking 配置） |
| `relay_claude_thinking_budget_percentage` Claude 思考预算比例 | `0.5` | 适配触发时按 `max_tokens` 的该比例确定 `budget_tokens`（下限 1024），范围 0.1–0.9 |
| `relay_gemini_thinking_adapter_enabled` Gemini thinking 后缀适配 | 开 | OpenAI 入站 × Gemini 上游：把 `-thinking` / `-nothinking` / effort 后缀映射到 Gemini `thinkingConfig` |
| `relay_gemini_thinking_budget_percentage` Gemini 思考预算比例 | `0.5` | 按 `maxOutputTokens` 的该比例确定 `thoughtBudget`（下限 128），范围 0.1–0.9 |
| `relay_gemini_thought_signature_enabled` Gemini thoughtSignature 透传 | 开 | Gemini 上游 function-call parts 附带的 `thoughtSignature` 绕过值原样回传，**多轮工具调用校验必需**，一般不要关闭 |
| `relay_gemini_safety_setting` Gemini 安全阈值（JSON） | 空 | 类别 → 伤害阈值映射，转换后的 Gemini 请求按此附带 `safetySettings`；留空不附带 |
| `relay_preserve_thinking_suffix_models` 保留 thinking 后缀的模型 | 空 | 逗号分隔的模型名列表（支持尾部 `*` 前缀匹配）。列表内模型发往上游时**保留** `-thinking` 等后缀（上游原生支持后缀语义时用）；留空则对所有模型剥离后缀 |

Gemini 安全阈值示例——只拦最高伤害：

```json
{
  "HARM_CATEGORY_HARASSMENT": "BLOCK_ONLY_HIGH",
  "HARM_CATEGORY_HATE_SPEECH": "BLOCK_ONLY_HIGH",
  "HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_ONLY_HIGH",
  "HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_ONLY_HIGH"
}
```

::: tip 什么情况需要动这些开关
- 上游是 **Claude / Gemini 官方或兼容 API**，且用户用 `-thinking` 后缀控制推理力度 → 保持默认（全开）即可；
- 某些中转商**自己识别**模型名后缀（如 `gemini-2.5-pro-thinking` 整个就是模型名）→ 把该模型加进「保留 thinking 后缀的模型」，避免后缀被剥掉后模型名对不上；
- 思考预算想更激进 → 上调预算比例（如 0.8，模型会把更多 token 用于思考）。
:::
