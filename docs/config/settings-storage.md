---
title: 存储配置
---

# 存储配置

**管理后台 → 系统设置 → 存储配置**

对象存储（S3 兼容）连接参数，用于存放文件附件、AI 生成图片的转存、数据导出文件等。**多实例部署必须使用对象存储**——本地磁盘只在单实例下可用。

## 连接配置

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `storage_provider` 存储供应商 | `minio` | `minio` / `s3`（AWS）/ `r2`（Cloudflare）/ `oss`（阿里云）/ `cos`（腾讯云）；后端另支持 `local`（本地磁盘，见文末） |
| `storage_bucket` 存储桶名称 | 空 | 提前在对应平台创建好的桶 |
| `storage_endpoint` 存储端点 | 空 | 各家格式见下表 |
| `storage_region` 存储区域 | 空 | AWS / OSS / COS 的 Region ID；**R2 固定填 `auto`**（界面选择 R2 时自动填入） |
| `storage_path_prefix` 路径前缀 | `team-api` | 桶内路径前缀，多套环境共用一个桶时用不同前缀隔离 |

各供应商端点格式：

| 供应商 | Endpoint 示例 | Region 示例 |
|---|---|---|
| AWS S3 | `https://s3.amazonaws.com` | `us-east-1` |
| MinIO | `http://127.0.0.1:9000`（自建地址） | 任意（如 `us-east-1`） |
| Cloudflare R2 | `https://<account_id>.r2.cloudflarestorage.com` | `auto` |
| 阿里云 OSS | `https://oss-cn-hangzhou.aliyuncs.com` | `oss-cn-hangzhou` |
| 腾讯云 COS | `https://cos.ap-guangzhou.myqcloud.com` | `ap-guangzhou` |

## 认证

| 配置项 | 说明 |
|---|---|
| `storage_access_key_id` Access Key ID | 敏感字段，掩码回显，保持不动即不修改 |
| `storage_access_key_secret` Access Key Secret | 敏感字段，同上 |
| `storage_use_ssl` 启用 SSL | 默认开。MinIO 自建无证书时可关闭 |

保存前先点页面底部的**「测试连接」**：会上传 → 下载 → 删除一张测试图片，全链路验证配置正确性。

## 桶权限建议

桶策略设为**私有**（禁止公开列举 / 读取），系统按需生成带签名的临时访问链接；AK/SK 只授予该桶的读写权限（RAM 子账号最小授权），不要使用全局管理密钥。

## 本地磁盘模式（单实例）

后端还支持 `local` 模式（不经过界面下拉，直接改库或 API 设置 `storage_provider=local`），对应参数：

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `storage_local_dir` 本地存储目录 | `./data/files` | 相对路径基于可执行文件目录 |

::: warning
`local` 模式仅适合**单实例**部署；多副本时不同实例磁盘不互通，会出现「图片时有时无」。生产环境请使用对象存储或为本地目录挂载共享卷（NFS / PVC）。
:::

## 存储被谁使用

| 功能 | 依赖 |
|---|---|
| AI 生成图片转存（[渠道配置的图片 URL 转存](/config/settings-channel#同步图片异步化)） | 必需 |
| 图片生成异步化（`/v1/images/generations/async`） | 必需 |
| 数据导出文件 | 降级可用（导出到本地） |
| 聊天附件 / 文件上传 | 降级到本地目录 |

未配置对象存储时相关功能自动降级或禁用，不影响网关核心转发。
