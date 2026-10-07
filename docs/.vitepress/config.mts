import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

const nav = [
  { text: '介绍', link: '/intro/', activeMatch: '/intro/' },
  { text: '部署', link: '/deploy/docker-compose', activeMatch: '/deploy/' },
  { text: '配置', link: '/config/config-yaml', activeMatch: '/config/' },
  { text: '使用指南', link: '/guide/admin', activeMatch: '/guide/' },
  { text: 'API', link: '/api/overview', activeMatch: '/api/' },
  {
    text: '帮助',
    activeMatch: '/(faq|troubleshooting|changelog)/',
    items: [
      { text: '常见问题', link: '/faq/' },
      { text: '排障指南', link: '/troubleshooting/' },
      { text: '更新日志', link: '/changelog' },
    ],
  },
  { text: '授权定价', link: '/pricing/', activeMatch: '/pricing/' },
]

const sidebar = {
  '/intro/': [
    {
      text: '简介',
      items: [
        { text: '项目介绍', link: '/intro/' },
        { text: '功能特性', link: '/intro/features' },
        { text: '架构概览', link: '/intro/architecture' },
      ],
    },
  ],
  '/deploy/': [
    {
      text: '部署方式',
      items: [
        { text: 'Docker Compose（推荐）', link: '/deploy/docker-compose' },
        { text: '二进制部署', link: '/deploy/binary' },
        { text: '源码编译', link: '/deploy/source' },
      ],
    },
    {
      text: '进阶',
      items: [
        { text: 'Nginx 反向代理', link: '/deploy/nginx' },
        { text: 'Supervisor 进程守护', link: '/deploy/supervisor' },
        { text: 'systemd 进程守护', link: '/deploy/systemd' },
        { text: '宝塔部署', link: '/deploy/baota' },
      ],
    },
  ],
  '/config/': [
    {
      text: '配置文件',
      items: [
        { text: '运行配置 config.yaml', link: '/config/config-yaml' },
        { text: '数据库映射 hack/config.yaml', link: '/config/hack-config-yaml' },
      ],
    },
    {
      text: '系统配置',
      items: [
        { text: '系统设置总览', link: '/config/settings-overview' },
        { text: '基础配置', link: '/config/settings-general' },
        { text: '第三方登录', link: '/config/settings-oauth' },
        { text: '邮件配置', link: '/config/settings-email' },
        { text: '安全配置', link: '/config/settings-security' },
        { text: '审计配置', link: '/config/settings-audit' },
        { text: '支付配置', link: '/config/settings-payment' },
        { text: '性能配置', link: '/config/settings-performance' },
        { text: '内容过滤', link: '/config/settings-content-filter' },
        { text: '渠道配置', link: '/config/settings-channel' },
        { text: '存储配置', link: '/config/settings-storage' },
        { text: '数据治理', link: '/config/settings-data-governance' },
        { text: '用户协议', link: '/config/settings-agreement' },
      ],
    },
  ],
  '/guide/': [
    {
      text: '管理后台',
      items: [
        { text: '功能总览', link: '/guide/admin/' },
        { text: '模型配置', link: '/guide/admin/models' },
        { text: '渠道配置', link: '/guide/admin/channels' },
        { text: '分组配置', link: '/guide/admin/model-groups' },
        { text: '租户管理', link: '/guide/admin/tenants' },
      ],
    },
    {
      text: '用户端',
      items: [
        { text: '功能总览', link: '/guide/tenant/' },
        { text: 'API Key 管理', link: '/guide/tenant/api-keys' },
        { text: '团队管理', link: '/guide/tenant/team' },
        { text: '项目管理', link: '/guide/tenant/projects' },
        { text: '请求审计日志', link: '/guide/tenant/request-audit-logs' },
        { text: '在线体验', link: '/guide/tenant/playground' },
      ],
    },
  ],
  '/api/': [
    {
      text: '开始使用',
      items: [{ text: 'API 概览', link: '/api/overview' }],
    },
    {
      text: '对话接口',
      items: [
        { text: '对话补全', link: '/api/chat-completions' },
        { text: 'Responses API', link: '/api/responses' },
        { text: 'Anthropic Claude 接口', link: '/api/anthropic' },
        { text: 'Gemini 接口', link: '/api/gemini' },
      ],
    },
    {
      text: '图像生成',
      items: [
        { text: '图像生成（同步 / 编辑）', link: '/api/images' },
        { text: '异步图像任务', link: '/api/images-async' },
      ],
    },
    {
      text: '视频生成',
      items: [
        { text: '视频生成（通用任务）', link: '/api/video-generations' },
        { text: 'OpenAI Videos 协议', link: '/api/videos-openai' },
        { text: 'MiniMax / DashScope 官方协议', link: '/api/videos-minimax-dashscope' },
      ],
    },
    {
      text: '更多能力',
      items: [
        { text: '向量嵌入', link: '/api/embeddings' },
        { text: '语音接口', link: '/api/audio' },
        { text: '重排序与内容审核', link: '/api/rerank-moderations' },
        { text: '实时通信 Realtime', link: '/api/realtime' },
        { text: '音乐生成 Suno', link: '/api/suno' },
      ],
    },
    {
      text: '参考',
      items: [{ text: '错误码说明', link: '/api/error-codes' }],
    },
  ],
  '/faq/': [
    {
      text: '常见问题',
      items: [{ text: 'FAQ', link: '/faq/' }],
    },
  ],
  '/troubleshooting/': [
    {
      text: '排障指南',
      items: [{ text: '排障总览', link: '/troubleshooting/' }],
    },
  ],
}

export default withMermaid(
  defineConfig({
  lang: 'zh-CN',
  title: 'Team-API 文档',
  description:
    'Team-API —— 多租户大模型 API 网关 SaaS 平台的部署、配置与使用文档',
  lastUpdated: true,
  markdown: {
    lineNumbers: true,
  },
  vite: {
    optimizeDeps: {
      // mermaid 的依赖（如 fastdom）为 CommonJS，若在服务启动后才被发现，
      // 会以原始 /@fs/ 路径下发导致 "does not provide an export named 'default'" 报错，
      // 启动时强制预构建可避免
      include: ['mermaid', 'fastdom'],
    },
  },
  head: [
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon.png' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Team-API 文档' }],
    [
      'meta',
      {
        property: 'og:description',
        content: '多租户大模型 API 网关 SaaS 平台的部署、配置与使用文档',
      },
    ],
  ],
  themeConfig: {
    nav,
    sidebar,
    outline: { level: [2, 3], label: '本页目录' },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/qianfree/team-api' },
    ],
    footer: {
      message: '基于 AGPL-3.0 许可发布',
      copyright: 'Copyright © 2026 Team-API',
    },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '最后更新' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
  },
  })
)
