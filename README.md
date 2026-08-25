# Team-API 文档站

[Team-API](https://github.com/qianfree/team-api)（多租户大模型 API 网关 SaaS 平台）的官方文档站，基于 [VitePress](https://vitepress.dev/) 构建。

- 在线文档：<https://docs.team-api.net>
- 主仓库：<https://github.com/qianfree/team-api>
- 在线演示：<https://team-api.net>

## 本地开发

```bash
npm install
npm run docs:dev      # 开发服务器 http://localhost:5173
```

## 构建与预览

```bash
npm run docs:build    # 构建到 docs/.vitepress/dist
npm run docs:preview  # 本地预览构建产物
```

## 部署

推送到 `main` 分支后，GitHub Actions 自动构建并发布到 GitHub Pages（自定义域名见 `docs/public/CNAME`）。

构建产物同样兼容 Cloudflare Pages：构建命令 `npm run docs:build`，输出目录 `docs/.vitepress/dist`。

## 目录结构

```
docs/
├── .vitepress/     # 站点配置（导航 / 侧边栏 / 主题）
├── public/         # 静态资源（图片、CNAME）
├── index.md        # 首页
├── intro/          # 项目介绍 / 功能特性 / 架构概览
├── getting-started.md
├── deploy/         # 部署方式 / Nginx 反代 / 进程守护 / 宝塔
├── config/         # 环境变量与存储配置
├── guide/          # 管理后台 / 租户控制台 / 额度 / 计费
├── api/            # OpenAI 兼容 / Responses / Anthropic / Gemini 接口 / 错误码
├── faq/            # 常见问题
├── troubleshooting/ # 排障指南
├── pricing/        # 授权与定价
└── changelog.md    # 更新日志
```
