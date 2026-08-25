<script setup lang="ts">
import HomeTerminal from './HomeTerminal.vue'
import BrowserFrame from './BrowserFrame.vue'

const stats = [
  { num: '25+', label: '大模型供应商统一接入' },
  { num: '5', label: '层额度精细管控' },
  { num: '2', label: '套独立运营控制台' },
  { num: '1', label: '个 OpenAI 兼容入口' },
]

const showcases: {
  tag: string
  title: string
  desc: string
  points: string[]
  visual: 'terminal' | 'monitor' | 'request-log' | 'playground'
}[] = [
  {
    tag: '接口兼容',
    title: 'OpenAI 兼容，即刻迁移',
    desc: '对外暴露 OpenAI 兼容接口，现有应用替换 base_url 与 api_key 即可无缝迁移。',
    points: [
      '/v1/chat/completions 等标准路径',
      '流式 SSE 与 WebSocket 实时通信',
      '对话 / 嵌入 / 图像 / 语音全覆盖',
    ],
    visual: 'terminal',
  },
  {
    tag: '智能调度',
    title: '渠道调度与故障转移',
    desc: '按优先级与权重分发流量，上游异常自动切换到可用渠道，健康状态实时监控，业务零感知。',
    points: [
      '优先级 / 权重路由',
      '自动故障转移',
      '渠道健康监控与告警',
      '会话级渠道亲和',
    ],
    visual: 'monitor',
  },
  {
    tag: '全链路可观测',
    title: '每一次调用都有迹可循',
    desc: '请求日志、操作审计、监控告警三位一体，Request ID 贯穿「客户端 → 网关 → 上游」全链路。',
    points: [
      '全量请求日志，多维筛选',
      'Request ID 全链路追踪',
      '用量统计与成本核算',
    ],
    visual: 'request-log',
  },
  {
    tag: '多租户',
    title: '给团队一个独立控制台',
    desc: '每个租户拥有独立的团队、成员、项目与 Key 管理体系，行级数据隔离；在线 Playground 开箱即用。',
    points: [
      '团队协作与角色权限',
      '项目预算与 Key 额度',
      '在线对话 / 图像 Playground',
    ],
    visual: 'playground',
  },
]

const visuals = {
  monitor: {
    src: '/images/admin_channel_monitor.png',
    url: 'https://team-api.net/admin/',
    alt: 'Team-API 管理后台 — 渠道监控',
  },
  'request-log': {
    src: '/images/admin_request_log.png',
    url: 'https://team-api.net/admin/',
    alt: 'Team-API 管理后台 — 请求日志',
  },
  playground: {
    src: '/images/tenant_playground_chat.png',
    url: 'https://team-api.net',
    alt: 'Team-API 租户控制台 — 在线对话 Playground',
  },
} as const

const moreFeatures = [
  { title: '多租户架构', desc: '行级隔离，双独立用户体系' },
  { title: '25+ 供应商', desc: 'OpenAI / Claude / Gemini / DeepSeek / 通义 / 智谱…' },
  { title: '五层额度模型', desc: '钱包 → 套餐 → 成员 → 项目 → Key' },
  { title: '实时计费引擎', desc: '预扣 → 结算 → 退款，并发安全' },
  { title: '监控告警', desc: '渠道健康与业务指标告警' },
  { title: '操作审计', desc: '全部管理操作留痕可查' },
  { title: '插件系统', desc: '可扩展的插件机制' },
  { title: '在线更新', desc: '版本升级不停服' },
]
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <span class="badge">v0.2 已发布 · AGPL-3.0 开源</span>
      <h1 class="title">多租户大模型<br /><span class="title-accent">API 网关</span></h1>
      <p class="tagline">
        统一接入 OpenAI、Claude、Gemini 等 25+ 大模型供应商，<br class="br-md" />
        计费、限流、监控与多租户管理，一站具备。
      </p>
      <div class="actions">
        <a class="btn btn-primary" href="/getting-started">快速开始</a>
        <a
          class="btn btn-ghost"
          href="https://team-api.net"
          target="_blank"
          rel="noopener noreferrer"
        >在线演示 ↗</a>
      </div>
    </section>

    <!-- 数据指标带 -->
    <section class="stats">
      <div class="stats-grid">
        <div v-for="s in stats" :key="s.label" class="stat">
          <div class="stat-num">{{ s.num }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>
    </section>

    <!-- 功能展示：左文右图交替 -->
    <section
      v-for="(s, i) in showcases"
      :key="s.title"
      class="showcase"
      :class="{ reverse: i % 2 === 1, 'showcase-divider': i > 0 }"
    >
      <div class="showcase-text">
        <span class="row-tag">{{ s.tag }}</span>
        <h2 class="row-title">{{ s.title }}</h2>
        <p class="row-desc">{{ s.desc }}</p>
        <ul class="row-points">
          <li v-for="p in s.points" :key="p">{{ p }}</li>
        </ul>
      </div>
      <div class="showcase-visual">
        <HomeTerminal v-if="s.visual === 'terminal'" />
        <BrowserFrame
          v-else
          :src="visuals[s.visual].src"
          :url="visuals[s.visual].url"
          :alt="visuals[s.visual].alt"
        />
      </div>
    </section>

    <!-- 更多能力 -->
    <section class="more">
      <h2 class="section-title">更多开箱能力</h2>
      <div class="more-grid">
        <div v-for="f in moreFeatures" :key="f.title" class="more-item">
          <span class="check">✓</span>
          <div>
            <div class="more-title">{{ f.title }}</div>
            <div class="more-desc">{{ f.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <h2 class="section-title">5 分钟，部署你自己的大模型网关</h2>
      <p class="section-sub">一条 docker compose 命令，接入你的第一个渠道。</p>
      <div class="actions">
        <a class="btn btn-primary" href="/getting-started">快速开始</a>
        <a
          class="btn btn-ghost"
          href="https://team-api.net"
          target="_blank"
          rel="noopener noreferrer"
        >在线演示 ↗</a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  /* 与顶部导航栏容器对齐：VPNavBar 同为 calc(--vp-layout-max-width - 64px) 居中 */
  max-width: 1376px;
  margin: 0 auto;
  padding: 0 32px;
}

/* ---------- Hero ---------- */
.hero {
  text-align: center;
  padding: 80px 0 64px;
  background: radial-gradient(
    56% 44% at 50% 0%,
    color-mix(in srgb, var(--vp-c-brand-1) 7%, transparent),
    transparent 72%
  );
}

.badge {
  display: inline-block;
  padding: 5px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 22%, transparent);
  border-radius: 999px;
}

.title {
  margin: 22px 0 0;
  font-size: clamp(36px, 6.5vw, 58px);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
}

.title-accent {
  color: var(--vp-c-brand-1);
}

.tagline {
  margin: 20px auto 0;
  max-width: 620px;
  font-size: 17px;
  line-height: 1.8;
  color: var(--vp-c-text-2);
}

.actions {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

/* ---------- 按钮（对齐主项目 .btn-primary 渐变 + 发光阴影） ---------- */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  color: #fff;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
}
.btn-primary:hover {
  background: linear-gradient(135deg, #0d9488, #0f766e);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.4);
}

.btn-ghost {
  border: 1px solid var(--vp-c-border);
  color: var(--vp-c-text-1);
}
.btn-ghost:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

/* ---------- 指标带 ---------- */
.stats {
  border-top: 1px solid var(--vp-c-border);
  border-bottom: 1px solid var(--vp-c-border);
  padding: 40px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.stat {
  text-align: center;
}

.stat-num {
  font-size: 38px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--vp-c-brand-1);
}

.stat-label {
  margin-top: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

/* ---------- 功能展示行 ---------- */
.showcase {
  display: grid;
  grid-template-columns: 5fr 6fr;
  gap: clamp(40px, 6vw, 80px);
  align-items: center;
  padding: 80px 0;
}

.showcase-divider {
  border-top: 1px solid var(--vp-c-border);
}

.showcase.reverse .showcase-text {
  order: 2;
}
.showcase.reverse .showcase-visual {
  order: 1;
}

.row-tag {
  display: inline-block;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--vp-c-brand-1);
}

.row-title {
  margin: 10px 0 0;
  font-size: clamp(22px, 3vw, 28px);
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.3;
  color: var(--vp-c-text-1);
}

.row-desc {
  margin: 14px 0 0;
  font-size: 15px;
  line-height: 1.8;
  color: var(--vp-c-text-2);
}

.row-points {
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}

.row-points li {
  position: relative;
  padding: 5px 0 5px 26px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-1);
}

.row-points li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.showcase-visual {
  filter: drop-shadow(0 16px 32px rgba(15, 23, 42, 0.1));
}

/* ---------- 通用标题 ---------- */
.section-title {
  font-size: clamp(24px, 3.5vw, 32px);
  font-weight: 600;
  letter-spacing: -0.01em;
  text-align: center;
  color: var(--vp-c-text-1);
}

.section-sub {
  margin: 14px auto 0;
  max-width: 560px;
  font-size: 15px;
  line-height: 1.7;
  text-align: center;
  color: var(--vp-c-text-2);
}

/* ---------- 更多能力 ---------- */
.more {
  padding: 88px 0 0;
  border-top: 1px solid var(--vp-c-border);
}

.more-grid {
  margin-top: 44px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 48px;
}

.more-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px 0;
}

.check {
  flex: none;
  width: 20px;
  height: 20px;
  margin-top: 1px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
  border-radius: 50%;
}

.more-title {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.more-desc {
  margin-top: 2px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

/* ---------- CTA ---------- */
.cta {
  margin-top: 88px;
  padding: 80px 24px;
  text-align: center;
  border-top: 1px solid var(--vp-c-border);
  background: radial-gradient(
    50% 60% at 50% 100%,
    color-mix(in srgb, var(--vp-c-brand-1) 6%, transparent),
    transparent 75%
  );
}

/* ---------- 响应式 ---------- */
@media (max-width: 960px) {
  .showcase {
    grid-template-columns: 1fr;
    gap: 36px;
    padding: 64px 0;
  }
  .showcase.reverse .showcase-text {
    order: 1;
  }
  .showcase.reverse .showcase-visual {
    order: 2;
  }
  .more-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .home {
    padding: 0 20px;
  }
  .hero {
    padding: 56px 0 48px;
  }
  .br-md {
    display: none;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px 16px;
  }
}
</style>
