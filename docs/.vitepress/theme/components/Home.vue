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
  { title: 'OpenAI 兼容接口', desc: '改个地址和 Key 就能迁移' },
  { title: '多家格式直连', desc: 'Claude、Gemini 原生格式也支持' },
  { title: '实时计费', desc: '先扣后结、多退少补，不出错账' },
  { title: '流式输出', desc: '边生成边显示，不用等全文' },
  { title: '内容过滤', desc: '敏感词和违规内容可拦截' },
  { title: '第三方登录', desc: '支持 GitHub 等 OAuth 登录' },
  { title: '插件系统', desc: '缺什么功能，装个插件补上' },
  { title: '在线更新', desc: '升级版本不用停机' },
]
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <span class="badge">v0.2 已发布 · AGPL-3.0 开源</span>
      <h1 class="title">多租户大模型<br /><span class="title-accent">API 网关</span></h1>
      <p class="tagline">
        OpenAI、Claude、Gemini……25+ 家大模型，接到一个入口里，<br class="br-md" />
        给团队每人发一个 Key——能用什么、能花多少，都由你管。
      </p>
      <div class="actions">
        <a class="btn btn-primary" href="/deploy/docker-compose">快速开始</a>
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
        <span class="row-tag">{{ s.tag }}</span>
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
          <span class="check">✓</span>
          <div>
            <div class="more-title">{{ f.title }}</div>
            <div class="more-desc">{{ f.desc }}</div>
          </div>
        </div>
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
  max-width: 640px;
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

/* ---------- 展示图 ---------- */
.shot {
  margin: 0;
  border: 1px solid var(--vp-c-border);
  border-radius: 16px;
  overflow: hidden;
  background: var(--vp-c-bg-alt);
}

.shot img {
  display: block;
  width: 100%;
  height: auto;
}

/* ---------- 通用标题 ---------- */
.section-title {
  font-size: clamp(24px, 3.5vw, 32px);
  font-weight: 600;
  letter-spacing: -0.01em;
  text-align: center;
  color: var(--vp-c-text-1);
}

/* ---------- 更多能力 ---------- */
.more {
  padding: 88px 0 96px;
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

/* ---------- 响应式 ---------- */
@media (max-width: 960px) {
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
