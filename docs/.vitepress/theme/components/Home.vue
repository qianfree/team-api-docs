<script setup lang="ts">
const stats = [
  { num: '25+', label: '家大模型，全都接好了' },
  { num: '5', label: '层额度管控，花超自动停' },
  { num: '2', label: '套后台，平台和客户各用各的' },
  { num: '1', label: '个 Key，所有模型通用' },
]

const showcases: {
  tag: string
  title: string
  desc: string
  points: string[]
  img: string
  alt: string
}[] = [
  {
    tag: '统一接入',
    title: '一个 Key，用遍所有大模型',
    desc: '不用挨家注册、挨家充值。25+ 家大模型都接在一个入口后面，代码里只留一个地址、一个 Key。',
    points: [
      '兼容 OpenAI 接口格式，老代码改个地址就能迁过来',
      'Claude、Gemini 等原生格式也支持直连',
      '渠道变慢或出故障自动换一家，调用方无感知',
    ],
    img: '/material/一个key调用所有模型.jpg',
    alt: '一把钥匙连接所有大模型的示意图',
  },
  {
    tag: '团队管理',
    title: '谁能用什么、能花多少，你说了算',
    desc: '给每个成员发自己的 Key，配各自的额度。额度花完自动停，调高预算自动恢复，不用人工封号解号。',
    points: [
      '老板、管理员、成员三种身份，各自看到的不一样',
      '成员、项目、Key 都能单独限额，花超自动停',
      '可以限制某个 Key 只能用便宜模型，成本管得住',
    ],
    img: '/material/三层权限管理.jpg',
    alt: '成员、应用、密钥三层权限管理的示意图',
  },
  {
    tag: '双端架构',
    title: '两套后台：你管平台，客户管自己',
    desc: '你在自己的后台管渠道和定价，客户在他们的后台管成员和账单。两套账号互不相通，数据完全隔离。',
    points: [
      '平台后台：管渠道、模型、定价、订单、监控',
      '客户后台：管自己的成员、Key、账单、套餐',
      '账号体系完全独立，客户看不到你的渠道和成本',
    ],
    img: '/material/双端界面.jpg',
    alt: '管理端与租户端两套系统并存的示意图',
  },
  {
    tag: '异步生图',
    title: '画图不用干等几十秒',
    desc: '提交画图任务立刻拿到一个任务号，先去干别的，回头拿任务号取图就行。失败自动换渠道重试，队列满了直接退钱。',
    points: [
      '提交即返回任务号，不用挂着连接傻等',
      '生成失败自动换渠道重试，尽量让你拿到图',
      '服务重启时没完成的任务自动退款，不白花钱',
    ],
    img: '/material/图片生成同步转异步.jpg',
    alt: '图片生成从同步等待改为异步取图的示意图',
  },
  {
    tag: '日志排障',
    title: '出了问题，一查到底',
    desc: '每次调用从进来到出去，每一步都有记录：发给了哪家、来回说了什么、花了多久。对话内容默认打码保存，隐私不外泄。',
    points: [
      '一次请求的完整来回，每一步报文都能看',
      '手机号、身份证、密钥等敏感信息自动打码',
      '平台和客户各记一份，客户自己定记录的详细程度',
    ],
    img: '/material/监控-渠道完整追踪链路.jpg',
    alt: '一次请求在渠道间完整追踪链路的示意图',
  },
  {
    tag: '实时监控',
    title: '系统跑成什么样，一眼看清',
    desc: '多少人在用、流量走了哪家、成功率高不高，打开监控页一眼看完。渠道出问题自动告警，修好了自动恢复。',
    points: [
      '实时看到并发、流量、成功率、延迟',
      '「这次请求为什么走了这家渠道」有答案，不用猜',
      '渠道故障自动告警、自动隔离，恢复后自动拉回',
    ],
    img: '/material/监控-全链路可视化.jpg',
    alt: '全链路监控数据可视化的示意图',
  },
]

const moreFeatures = [
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h12m0 0-3-3m3 3-3 3"/><path d="M20 16H8m0 0 3-3m-3 3 3 3"/></svg>',
    title: 'OpenAI 兼容接口',
    desc: '改个地址和 Key 就能迁移',
  },
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l2.92-2.92a5 5 0 0 0-7.07-7.07L11.75 5.2"/><path d="M14 11a5 5 0 0 0-7.54-.54L3.54 13.4a5 5 0 0 0 7.07 7.07l1.64-1.65"/></svg>',
    title: '多家格式直连',
    desc: 'Claude、Gemini 原生格式也支持',
  },
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M9 9.5 12 13l3-3.5M12 13v4.5M9.5 14.5h5"/></svg>',
    title: '实时计费',
    desc: '先扣后结、多退少补，不出错账',
  },
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4.6 13.2h6L9.4 22l8.5-11.2h-6L13 2z"/></svg>',
    title: '流式输出',
    desc: '边生成边显示，不用等全文',
  },
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 2.8v5.4c0 4.4-3 7.3-7 8.8-4-1.5-7-4.4-7-8.8V5.8L12 3z"/><path d="m9 11.6 2.1 2.1L15.4 9.4"/></svg>',
    title: '内容过滤',
    desc: '敏感词和违规内容可拦截',
  },
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M3.5 19.5c.6-3.6 2.6-5.2 5.5-5.2s4.9 1.6 5.5 5.2"/><path d="M18 5.5v6M15 8.5h6"/></svg>',
    title: '第三方登录',
    desc: '支持 GitHub 等 OAuth 登录',
  },
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12l8-4.5M12 12v9M12 12 4 7.5"/></svg>',
    title: '插件系统',
    desc: '缺什么功能，装个插件补上',
  },
  {
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>',
    title: '在线更新',
    desc: '升级版本不用停机',
  },
]
</script>

<template>
  <div class="home">
    <!-- 沉浸式 Hero：全屏背景 + 左侧大文字 + 右侧若隐若现的艺术图 -->
    <section class="hero">
      <div class="hero-bg" aria-hidden="true">
        <div class="g-grid"></div>
        <div class="g-glow g-glow-a"></div>
        <div class="g-glow g-glow-b"></div>
        <img
          class="g-art"
          src="/material/一个key调用所有模型.jpg"
          alt=""
          loading="eager"
          decoding="async"
        />
        <div class="g-seat"></div>
      </div>

      <div class="hero-inner">
        <span class="badge rise">
          <span class="badge-dot"></span>
          v0.2 已发布 · AGPL-3.0 开源
        </span>
        <h1 class="title rise d1">
          多租户大模型<br /><span class="title-accent">API 网关</span>
        </h1>
        <p class="tagline rise d2">
          OpenAI、Claude、Gemini……25+ 家大模型，接到一个入口里。<br class="br-md" />
          给团队每人发一个 Key——能用什么、能花多少，都由你管。
        </p>
        <div class="actions rise d3">
          <a class="btn btn-primary" href="/deploy/docker-compose">快速开始</a>
          <a
            class="btn btn-ghost"
            href="https://team-api.net"
            target="_blank"
            rel="noopener noreferrer"
          >在线演示 ↗</a>
        </div>
      </div>
    </section>

    <div class="shell">
      <!-- 数据指标带 -->
      <section class="stats">
        <div class="stats-grid">
          <div v-for="s in stats" :key="s.label" class="stat">
            <div class="stat-num">{{ s.num }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>
      </section>

      <!-- 核心能力标题 -->
      <section class="core-head">
        <h2 class="section-title">它能帮你做什么</h2>
        <p class="section-sub">从接入、管钱到排障，六件事一次说清楚</p>
      </section>

      <!-- 功能展示：左文右图交替 -->
      <section
        v-for="(s, i) in showcases"
        :key="s.title"
        class="showcase"
        :class="{ reverse: i % 2 === 1, 'showcase-divider': i > 0, 'showcase-first': i === 0 }"
      >
        <div class="showcase-text">
          <span class="row-tag">{{ i < 9 ? '0' : '' }}{{ i + 1 }} · {{ s.tag }}</span>
          <h2 class="row-title">{{ s.title }}</h2>
          <p class="row-desc">{{ s.desc }}</p>
          <ul class="row-points">
            <li v-for="p in s.points" :key="p">{{ p }}</li>
          </ul>
        </div>
        <div class="showcase-visual">
          <figure class="shot">
            <img :src="s.img" :alt="s.alt" loading="lazy" decoding="async" />
          </figure>
        </div>
      </section>

      <!-- 更多能力 -->
      <section class="more">
        <h2 class="section-title">更多开箱能力</h2>
        <div class="more-grid">
          <div v-for="f in moreFeatures" :key="f.title" class="more-item">
            <span class="icon-chip" v-html="f.icon"></span>
            <div>
              <div class="more-title">{{ f.title }}</div>
              <div class="more-desc">{{ f.desc }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 收尾 CTA -->
      <section class="endcta">
        <h2 class="endcta-title">把 25+ 家大模型，一次接进来</h2>
        <p class="endcta-sub">Docker Compose 五分钟部署 · AGPL-3.0 开源 · 数据全程在你自己的服务器上</p>
        <div class="actions">
          <a class="btn btn-invert" href="/deploy/docker-compose">快速开始</a>
          <a
            class="btn btn-outline-light"
            href="https://github.com/qianfree/team-api"
            target="_blank"
            rel="noopener noreferrer"
          >GitHub ↗</a>
        </div>
      </section>
    </div>

  </div>
</template>

<style scoped>
.home {
  /* Hero 需要通到视口边缘，容器职责下放给各区块（.shell） */
}

.shell {
  max-width: 1376px;
  margin: 0 auto;
  padding: 0 32px;
}

/* ================== 沉浸式 Hero ================== */
.hero {
  position: relative;
  display: flex;
  align-items: center;
  /* 视口高度减去导航栏；窄屏内容更高时自然撑开 */
  min-height: calc(100vh - var(--vp-nav-height));
  min-height: calc(100svh - var(--vp-nav-height));
  overflow: hidden;
}

/* 背景层栈：网格 → 光晕 → 艺术图 → 底部渐隐 */
.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.g-grid,
.g-glow,
.g-art,
.g-seat {
  position: absolute;
}

/* 网格纹理：自左上角向四周渐隐 */
.g-grid {
  inset: 0;
  background-image:
    linear-gradient(var(--ta-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--ta-grid) 1px, transparent 1px);
  background-size: 52px 52px;
  -webkit-mask-image: radial-gradient(80% 90% at 22% 8%, #000 25%, transparent 78%);
  mask-image: radial-gradient(80% 90% at 22% 8%, #000 25%, transparent 78%);
}

/* 主光晕：贴着艺术图后方，让深色图与浅色页面的过渡融进青绿雾气里 */
.g-glow-a {
  top: -26%;
  right: -14%;
  width: min(1280px, 92vw);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(
    closest-side,
    rgba(45, 212, 191, var(--ta-halo-a)) 8%,
    rgba(45, 212, 191, 0) 76%
  );
}

/* 副光晕：左上冷色点缀，平衡画面 */
.g-glow-b {
  top: -24%;
  left: -16%;
  width: 720px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(
    closest-side,
    rgba(56, 189, 248, var(--ta-halo-b)),
    rgba(56, 189, 248, 0) 70%
  );
}

/* 艺术图：右侧大面积羽化，若隐若现地浮出背景 */
.g-art {
  top: 50%;
  right: -4%;
  transform: translateY(-50%);
  width: min(58vw, 1020px);
  opacity: var(--ta-art-opacity);
  object-fit: cover;
  /* 羽化足够宽，避免出现可辨识的遮罩轮廓（“聚光灯”感） */
  -webkit-mask-image: radial-gradient(62% 62% at 50% 46%, #000 18%, transparent 70%);
  mask-image: radial-gradient(62% 62% at 50% 46%, #000 18%, transparent 70%);
  animation: artIn 1.2s cubic-bezier(0.22, 0.61, 0.36, 1) both;
  animation-delay: 0.25s;
}

@keyframes artIn {
  from { opacity: 0; transform: translateY(-50%) scale(1.05); }
}

/* 底部渐隐：让首屏无缝沉入页面底色 */
.g-seat {
  left: 0;
  right: 0;
  bottom: -1px;
  height: 170px;
  background: linear-gradient(to top, var(--vp-c-bg) 8%, transparent);
}

/* ---------- 文案列 ---------- */
.hero-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1376px;
  margin: 0 auto;
  padding: 110px 32px 96px;
  text-align: left;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 22%, transparent);
  border-radius: 999px;
  backdrop-filter: blur(4px);
}

.badge-dot {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--vp-c-brand-3);
  position: relative;
}

.badge-dot::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px solid var(--vp-c-brand-3);
  opacity: 0;
  animation: ping 2.2s ease-out infinite;
}

@keyframes ping {
  0% { transform: scale(0.5); opacity: 0.7; }
  70%, 100% { transform: scale(1.3); opacity: 0; }
}

.title {
  margin: 26px 0 0;
  font-size: clamp(44px, 5.4vw, 74px);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.025em;
  color: var(--vp-c-text-1);
}

.title-accent {
  background: linear-gradient(135deg, var(--vp-c-brand-3), var(--ta-accent-deep));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.tagline {
  margin: 24px 0 0;
  max-width: 520px;
  font-size: 17px;
  line-height: 1.85;
  color: var(--vp-c-text-2);
}

.actions {
  margin-top: 36px;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

/* ---------- 按钮 ---------- */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 46px;
  padding: 0 26px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  /* 覆盖 .vp-doc a 的 underline（scoped 属性选择器优先级更高） */
  text-decoration: none;
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
  background: color-mix(in srgb, var(--vp-c-bg) 72%, transparent);
  backdrop-filter: blur(6px);
}
.btn-ghost:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.btn-invert {
  background: #fff;
  color: #0f172a;
  box-shadow: 0 4px 16px rgba(2, 6, 23, 0.35);
}
.btn-invert:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(2, 6, 23, 0.45);
}

.btn-outline-light {
  border: 1px solid rgba(240, 253, 250, 0.32);
  color: #f0fdfa;
}
.btn-outline-light:hover {
  border-color: rgba(240, 253, 250, 0.65);
  background: rgba(240, 253, 250, 0.08);
}

.endcta .btn-invert {
  border: none;
}

/* ---------- 入场动画 ---------- */
.rise {
  animation: rise 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}
.d1 { animation-delay: 0.08s; }
.d2 { animation-delay: 0.16s; }
.d3 { animation-delay: 0.24s; }

@keyframes rise {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .rise,
  .badge-dot::after,
  .g-art {
    animation: none;
  }
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
  background: linear-gradient(180deg, var(--ta-stat-from), var(--ta-stat-to));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.stat-label {
  margin-top: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

/* ---------- 核心能力标题 ---------- */
.core-head {
  padding: 84px 0 0;
  text-align: center;
}

.section-sub {
  margin: 12px auto 0;
  max-width: 560px;
  font-size: 15px;
  line-height: 1.7;
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

.showcase-first {
  padding-top: 44px;
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
  font-variant-numeric: tabular-nums;
  color: var(--vp-c-brand-1);
}

.row-title {
  border: none;
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

/* ---------- 展示图 ---------- */
.shot {
  margin: 0;
  border: 1px solid var(--vp-c-border);
  border-radius: 16px;
  overflow: hidden;
  background: var(--vp-c-bg-alt);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 24px 48px -24px rgba(15, 23, 42, 0.22);
  transition: transform 0.35s ease, border-color 0.35s ease;
}

.shot:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 28%, transparent);
}

.shot img {
  display: block;
  width: 100%;
  height: auto;
}

/* ---------- 通用标题 ---------- */
.section-title {
  border: none;
  font-size: clamp(24px, 3.5vw, 32px);
  font-weight: 600;
  letter-spacing: -0.01em;
  text-align: center;
  color: var(--vp-c-text-1);
}

/* ---------- 更多能力（卡片网格） ---------- */
.more {
  padding: 88px 0 0;
  border-top: 1px solid var(--vp-c-border);
}

.more-grid {
  margin-top: 44px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding-bottom: 88px;
}

.more-item {
  display: flex;
  gap: 13px;
  align-items: flex-start;
  padding: 18px 16px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-border);
  border-radius: 14px;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.more-item:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
  box-shadow: 0 10px 24px -12px rgba(15, 23, 42, 0.14);
}

.icon-chip {
  flex: none;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 9%, transparent);
  border-radius: 10px;
}

.icon-chip :deep(svg) {
  width: 19px;
  height: 19px;
}

.more-title {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.more-desc {
  margin-top: 3px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

/* ---------- 收尾 CTA ---------- */
.endcta {
  position: relative;
  overflow: hidden;
  margin-bottom: 104px;
  padding: 80px 32px;
  text-align: center;
  border-radius: 26px;
  background:
    radial-gradient(480px 340px at 84% -60px, rgba(45, 212, 191, 0.26), rgba(45, 212, 191, 0) 68%),
    radial-gradient(560px 400px at 6% calc(100% + 60px), rgba(56, 189, 248, 0.13), rgba(56, 189, 248, 0) 64%),
    linear-gradient(165deg, #122c47, #0b1120);
}

.endcta::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(240, 253, 250, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(240, 253, 250, 0.05) 1px, transparent 1px);
  background-size: 52px 52px;
  -webkit-mask-image: radial-gradient(70% 90% at 50% 0%, #000 30%, transparent 80%);
  mask-image: radial-gradient(70% 90% at 50% 0%, #000 30%, transparent 80%);
  pointer-events: none;
}

.endcta-title,
.endcta-sub,
.endcta .actions {
  position: relative;
}

.endcta-title {
  /* 关键：抵消 .vp-doc h2 的边框与内边距，否则深色面板上会浮出一条浅色线 */
  border: none;
  padding-top: 0;
  margin: 0;
  font-size: clamp(24px, 3.5vw, 32px);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #f0fdfa;
}

.endcta-sub {
  margin: 14px auto 0;
  max-width: 560px;
  font-size: 14.5px;
  line-height: 1.8;
  color: rgba(203, 213, 225, 0.85);
}

/* ---------- 响应式 ---------- */
@media (max-width: 1150px) {
  .more-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .g-art {
    width: 62vw;
    opacity: calc(var(--ta-art-opacity) * 0.85);
  }
}

@media (max-width: 960px) {
  .shell {
    padding: 0 24px;
  }
  .showcase {
    grid-template-columns: 1fr;
    gap: 36px;
    padding: 64px 0;
  }
  .showcase-first {
    padding-top: 36px;
  }
  .showcase.reverse .showcase-text {
    order: 1;
  }
  .showcase.reverse .showcase-visual {
    order: 2;
  }
}

@media (max-width: 860px) {
  .hero {
    min-height: 0;
    padding-top: 32px;
  }
  .hero-inner {
    padding: 72px 24px 56px;
    text-align: center;
  }
  .tagline {
    margin-left: auto;
    margin-right: auto;
  }
  .actions {
    justify-content: center;
  }
  .g-glow-b {
    display: none;
  }
  /* 艺术图退为低透明度水印，核心区域推出文案行，只留边缘雾气 */
  .g-art {
    top: auto;
    bottom: -14%;
    right: -26%;
    width: 124vw;
    transform: none;
    opacity: calc(var(--ta-art-opacity) * 0.24);
    -webkit-mask-image: radial-gradient(48% 44% at 55% 52%, #000 16%, transparent 64%);
    mask-image: radial-gradient(48% 44% at 55% 52%, #000 16%, transparent 64%);
  }
  /* 手机上加深底部渐隐，接住更靠近指标带的画面 */
  .g-seat {
    height: 220px;
  }
  @keyframes artIn {
    from { opacity: 0; }
  }
}

@media (max-width: 640px) {
  .shell {
    padding: 0 20px;
  }
  .br-md {
    display: none;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px 16px;
  }
  .endcta {
    padding: 64px 24px;
    border-radius: 20px;
  }
}

@media (max-width: 520px) {
  .more-grid {
    grid-template-columns: 1fr;
  }
}
</style>
