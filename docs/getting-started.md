---
title: 快速开始
---

# 快速开始

> 🚧 本章节编写中。目标：**5 分钟内**用 Docker Compose 把 Team-API 完整跑起来。

## 前置条件

- 已安装 Docker 20+ 与 Docker Compose v2
- 建议 2C4G 起步

## 启动

（规划：一条 `docker compose up -d` 拉起 PostgreSQL 15 + Redis 7 + team-api 完整栈，附 docker-compose.yml 与 .env 最小配置示例）

## 初始化

（规划：访问管理后台完成初始化 → 创建首个租户 → 配置第一个渠道 → 签发第一把 Key）

## 发起第一次调用

（规划：用 curl 或 OpenAI SDK 将 `base_url` 指向本地服务，验证对话补全链路）

```bash
curl http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## 下一步

- 生产环境部署：[部署章节](/deploy/docker-compose)
- 完整配置项：[运行配置 config.yaml](/config/config-yaml) · [系统设置](/config/settings-overview)
