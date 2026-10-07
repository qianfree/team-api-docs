<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { Directive } from 'vue'

/* ==================== 数据 ==================== */

const heroChips = [
  '永久授权 · 一次性买断',
  '不续费 · 无停机',
  '购买的是权利，不是功能解锁',
]

type Plan = {
  key: string
  name: string
  badge: string
  cur: string
  num: string
  note: string
  tagline: string
  yes: string[]
  no: string[]
  cta: { label: string; href: string; primary: boolean }
}

/* reactive：价格数字入场时做滚动动画（count-up） */
const plans = reactive<Plan[]>([
  {
    key: 'community',
    name: '社区版',
    badge: '',
    cur: '',
    num: '免费',
    note: 'AGPL-3.0 开源许可',
    tagline: '面向个人学习、内部项目与开源生态',
    yes: [
      '永久使用、修改、内部使用',
      '以自有产品形态对外服务（须履行开源义务）',
      '社区群互助',
    ],
    no: [
      '闭源修改（修改后须开源）',
      '改名 / 去品牌',
      '集成进自有产品',
      '多站点部署（限 1 个生产站点）',
    ],
    cta: { label: '查看部署文档', href: '/deploy/docker-compose', primary: false },
  },
  {
    key: 'enterprise',
    name: '企业版',
    badge: '最受欢迎',
    cur: '¥',
    num: '6,980',
    note: '一次性 · 永久授权',
    tagline: '闭源自用 + 单站点对外着陆',
    yes: [
      '闭源修改，不履行开源义务',
      '改名 / 去品牌，使用自有品牌',
      '自有产品单站点对外运营',
      '测试 / 预发 / 灾备不占部署额度',
    ],
    no: [
      '集成进自有产品',
      '多站点部署（限 1 个生产站点）',
      '转售与再分发',
    ],
    cta: { label: '联系购买', href: '#contact', primary: true },
  },
  {
    key: 'flagship',
    name: '旗舰版',
    badge: '全权益',
    cur: '¥',
    num: '29,800',
    note: '一次性 · 永久授权',
    tagline: '多站点部署 + 集成进自有产品',
    yes: [
      '含企业版全部权益',
      '生产部署数量不限',
      '集成进自有产品（含对外销售的自有产品）',
      '可提供集成实施服务（最终使用者各自持证）',
    ],
    no: ['转售 Team-API 本体 SaaS', '再分发软件本体'],
    cta: { label: '联系购买', href: '#contact', primary: true },
  },
])

type Cell = { k: 'y' | 'n' | 't'; v: string }
const y = (v = ''): Cell => ({ k: 'y', v })
const n = (v = ''): Cell => ({ k: 'n', v })
const t = (v: string): Cell => ({ k: 't', v })

const compareHead = [
  { name: '权益', price: '' },
  { name: '社区版', price: '免费' },
  { name: '企业版', price: '¥6,980' },
  { name: '旗舰版', price: '¥29,800' },
]

const compareRows: { label: string; cells: Cell[] }[] = [
  { label: '授权性质', cells: [t('AGPL-3.0'), t('永久授权'), t('永久授权')] },
  { label: '闭源修改（免开源义务）', cells: [n('须开源'), y(), y()] },
  { label: '改名 / 去品牌', cells: [n(), y(), y()] },
  { label: '自有产品对外运营', cells: [y('带开源义务'), y('单站点'), y('不限站点')] },
  { label: '生产部署数量', cells: [t('1'), t('1'), y('不限')] },
  { label: '集成进自有产品', cells: [n(), n(), y()] },
  { label: '转售 team-api 本体 SaaS', cells: [n('须开源'), n(), n()] },
  { label: '再分发软件本体', cells: [n(), n(), n()] },
]

const choices = [
  { scene: '个人学习、内部项目，接受 AGPL 开源义务', plan: '社区版', href: '' },
  { scene: '闭源自用，或以自有产品形态单站点对外运营', plan: '企业版', href: '#contact' },
  { scene: '多站点部署，或将 Team-API 集成进自有产品', plan: '旗舰版', href: '#contact' },
]

type Edition = {
  key: string
  name: string
  price: string
  tagline: string
  grants: string[]
  bans: string[]
  note?: { type: 'info' | 'warn'; title: string; html: string }
  rules?: { title: string; items: string[] }[]
}

const editions: Edition[] = [
  {
    key: 'community',
    name: '社区版',
    price: '免费 · AGPL-3.0',
    tagline: '开源自用',
    grants: [
      '永久使用、修改、内部使用',
      '以自有产品形态对外提供服务（须履行 AGPL 开源义务）',
    ],
    bans: [
      '修改后分发软件本体而不以 AGPL-3.0 开源修改内容',
      '修改后通过网络对外提供修改版服务而不向用户开放修改后源代码',
      '移除或篡改 Team-API 品牌标识与版权声明',
    ],
    note: {
      type: 'info',
      title: '关于开源义务的触发条件',
      html: '<p>AGPL 的开源义务由<strong>分发软件本体</strong>或<strong>对外提供网络服务</strong>触发——<strong>纯内部使用（仅员工访问）不触发</strong>开源义务。</p><p>但 AGPL 第 13 条对「内部网络访问」的解释在实践中存在灰区，合规要求严格的组织（金融、国企、大型企业法务）通常按最坏解释处理；购买任一商业版本即可<strong>一次性消除该不确定性</strong>。</p>',
    },
  },
  {
    key: 'enterprise',
    name: '企业版',
    price: '¥6,980 · 永久授权',
    tagline: '闭源自用 + 单站点对外着陆',
    grants: [
      '闭源修改：修改后不履行 AGPL 开源义务',
      '改名 / 去品牌：在自有产品上使用自有品牌标识',
      '自有产品对外运营：作为自有产品 / 业务的后端基础设施，面向公众提供单个站点的服务',
      '永久使用，无续费强制',
    ],
    bans: [
      '转售 Team-API 本体 SaaS：不得让第三方直接获得 Team-API 实例的账号 / API Key / 控制台',
      '集成：Team-API 需作为独立系统部署与使用，不得作为组件嵌入其他项目',
      '再分发：不得将软件本体（二进制或源码）以任何形式交付第三方',
      '多站点部署：仅限 1 个生产环境对外（测试 / 预发 / 灾备不占用额度）',
      '注册 team-api 或与之近似的商标，或宣称拥有本项目著作权',
    ],
    rules: [
      {
        title: '判定规则：对外运营 vs 转售本体 SaaS',
        items: [
          '第三方拿到的是「被许可方自有产品的访问凭证」→ 属对外运营，企业版可用',
          '第三方拿到的是「Team-API 实例的访问凭证」（账号 / API Key / 控制台）→ 属转售本体 SaaS，不在标准授权范围内',
        ],
      },
    ],
  },
  {
    key: 'flagship',
    name: '旗舰版',
    price: '¥29,800 · 永久授权',
    tagline: '多站点部署 + 集成进自有产品',
    grants: [
      '企业版全部权益',
      '不限生产部署数量（超出企业版单站限制的部分无需单独付费）',
      '集成权：可将 Team-API 集成进自有产品或项目（含对外销售的自有产品）',
      '集成实施服务：可以集成商身份对外提供实施、部署、对接服务（前提：最终使用者各自取得授权）',
    ],
    bans: [
      '转售 Team-API 本体 SaaS：不得让第三方直接获得 Team-API 实例的账号 / API Key / 控制台',
      '再分发：不得将软件本体打包交付第三方而使第三方无需单独取得授权',
      '注册 team-api 或与之近似的商标，或宣称拥有本项目著作权',
    ],
    rules: [
      {
        title: '判定规则：集成服务 vs 再分发',
        items: [
          '需要（集成商实施，每个最终用户各自持证）→ 属集成服务，旗舰版可用',
          '不需要（打包卖断，最终用户无需再取得授权）→ 属再分发，不在标准授权范围内',
        ],
      },
    ],
  },
]

const ipRows: [string, string][] = [
  ['授权性质', '授予的是使用权 + 特定范围的义务豁免，不是所有权转移'],
  ['著作权', '无论客户如何修改、改名、部署，著作权始终归 qianfree'],
  ['商标权', 'team-api 名称与标识的商标权始终归 qianfree，不因授权而转移'],
  ['「改名权」的准确含义', '允许在自有产品上使用自有品牌，不等于获得 team-api 商标的任何权利'],
  ['署名保留', '商业授权豁免的是开源义务，不豁免署名：不得删除原始版权声明与许可声明'],
  ['禁止抢注', '不得就 team-api 或与之近似的名称 / 标识申请商标、域名或著作权登记'],
  ['终止后果', '协议终止后须停止使用并销毁授权范围外的副本；著作权与商标权不受影响'],
]

const deliverables = [
  { name: '商业授权协议', desc: '双方签署，支持电子签，权利依据' },
  { name: '授权证书', desc: '盖章 PDF，内部审计 / 合规证明' },
  { name: '软件镜像', desc: 'Docker 镜像 / 二进制' },
  { name: '校验值清单', desc: 'SHA256 / 镜像 digest，供应链安全核验' },
  { name: '第三方组件声明', desc: 'THIRD_PARTY_NOTICES，开源合规审查' },
  { name: '部署文档', desc: '随镜像提供，安装与配置' },
]

const flowSteps = ['联系商务', '确认版本与授权信息', '签署协议', '确认付款', '交付']

const supportYes = [
  '可自托管的完整软件（永久授权）',
  '授权期内发布的所有版本更新',
  '完整的部署文档与使用文档',
  '软件自身可复现缺陷的修复支持',
  '社区群互助',
]

const supportNo = [
  'SLA / 服务可用性承诺',
  '响应时间与解决时限承诺（支持按「尽力而为」原则提供）',
  '更新频率、新功能与新模型适配的时间承诺',
  '上游大模型服务商接口变更导致的适配义务',
  '定制开发（可单独报价、双方同意后进行）',
  '现场实施与运维代管',
]

const faqs = [
  {
    q: '只在公司内部使用，需要购买商业授权吗？',
    a: '<p>不一定。AGPL 的开源义务由<strong>分发</strong>或<strong>对外网络服务</strong>触发，纯内部使用（仅员工访问）不触发开源义务，可放心使用社区版。</p><p>但 AGPL 对「内部网络访问」的解释存在灰区，合规要求严格的组织（金融 / 国企 / 大厂法务）通常按最坏解释处理——购买任一商业版本可消除该不确定性，并获得闭源修改与改名权利。</p>',
  },
  {
    q: '不续费会怎样？',
    a: '<p><strong>没有任何影响。</strong>商业授权为永久授权，不续费可继续使用已购版本的所有功能；续费只决定能否获取后续新版本。</p>',
  },
  {
    q: '测试 / 预发 / 灾备环境算部署数量吗？',
    a: '<p>不算。「1 个生产站点」指对外提供服务的生产环境；测试、预发布、灾备环境不占用该额度。</p>',
  },
  {
    q: '我想把 Team-API 做成自己的 SaaS 卖账号，或打包进自己的产品卖，可以吗？',
    a: '<p>分两种情况：</p><p><strong>集成进自有产品</strong>（含对外销售的自有产品）→ 旗舰版支持；若以集成商身份对外实施，最终使用者需各自取得授权。</p><p><strong>转售 Team-API 本体 SaaS</strong>（第三方直接获得实例账号 / Key / 控制台）或<strong>打包卖断式再分发</strong> → 不在标准授权范围内，请<a href="#contact">联系我们</a>单独沟通专项授权。</p>',
  },
]

/* ==================== 交互 ==================== */

const QQ = '406615373'
const qqCopied = ref(false)
let qqTimer: number | undefined

function copyQQ() {
  const done = () => {
    qqCopied.value = true
    window.clearTimeout(qqTimer)
    qqTimer = window.setTimeout(() => (qqCopied.value = false), 1600)
  }
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(QQ).then(done).catch(() => fallbackCopy(done))
  } else {
    fallbackCopy(done)
  }
}

function fallbackCopy(done: () => void) {
  const ta = document.createElement('textarea')
  ta.value = QQ
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  try {
    document.execCommand('copy')
    done()
  } catch {
    /* 忽略：复制失败不影响展示 */
  }
  document.body.removeChild(ta)
}

/* 价格数字滚动动画（尊重 prefers-reduced-motion；SSR 直接展示最终值） */
function countUp(idx: number, target: number, dur = 1100) {
  plans[idx].num = '0'
  const start = performance.now()
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / dur)
    const eased = 1 - Math.pow(1 - p, 3)
    plans[idx].num = Math.round(target * eased).toLocaleString('en-US')
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  countUp(1, 6980)
  countUp(2, 29800, 1300)
})

/* 定价卡片鼠标追光：把指针坐标写入 CSS 变量，供卡片高光使用 */
function onPlanMove(e: MouseEvent) {
  const card = (e.target as HTMLElement).closest('.plan')
  if (!(card instanceof HTMLElement)) return
  const r = card.getBoundingClientRect()
  card.style.setProperty('--mx', `${e.clientX - r.left}px`)
  card.style.setProperty('--my', `${e.clientY - r.top}px`)
}

/* 滚动渐入：元素顶部进入视口 92% 线时加 .is-in；数值为延迟毫秒数（用于同级错峰）。
   用 rAF 节流的滚动检测而非 IntersectionObserver —— 锚点跳转会瞬间越过中间区块，
   IO 对「被跳过」的元素不会触发，导致其停留在隐藏态；滚动检测则天然覆盖跳转场景。 */
const revealEls: HTMLElement[] = []
let revealRaf = 0
let revealBound = false

function checkReveals() {
  const line = window.innerHeight * 0.92
  for (let i = revealEls.length - 1; i >= 0; i--) {
    if (revealEls[i].getBoundingClientRect().top < line) {
      revealEls[i].classList.add('is-in')
      revealEls.splice(i, 1)
    }
  }
  if (!revealEls.length && revealBound) {
    window.removeEventListener('scroll', onRevealScroll, { passive: true })
    window.removeEventListener('resize', onRevealScroll)
    revealBound = false
  }
}

function onRevealScroll() {
  if (revealRaf) return
  revealRaf = requestAnimationFrame(() => {
    revealRaf = 0
    checkReveals()
  })
}

const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    el.classList.add('reveal')
    if (binding.value) el.style.setProperty('--rd', `${binding.value}ms`)
    revealEls.push(el)
    if (!revealBound) {
      window.addEventListener('scroll', onRevealScroll, { passive: true })
      window.addEventListener('resize', onRevealScroll)
      revealBound = true
    }
    checkReveals()
  },
  unmounted(el) {
    const i = revealEls.indexOf(el)
    if (i >= 0) revealEls.splice(i, 1)
  },
}
</script>

<template>
  <div class="pricing">
    <!-- ==================== Hero ==================== -->
    <section class="p-hero">
      <div class="hero-bg" aria-hidden="true">
        <div class="g-grid"></div>
        <div class="g-glow g-glow-a"></div>
        <div class="g-glow g-glow-b"></div>
        <div class="g-noise"></div>
        <div class="g-seat"></div>
      </div>
      <div class="p-hero-inner">
        <span class="badge rise">
          <span class="badge-dot"></span>
          开源 + 商业双轨 · AGPL-3.0
        </span>
        <h1 class="title rise d1">授权与<span class="title-accent">定价</span></h1>
        <p class="tagline rise d2">
          社区版 AGPL-3.0 免费自用；商业版一次性永久授权，免除开源义务。
        </p>
        <div class="chips rise d3">
          <span v-for="c in heroChips" :key="c" class="chip">{{ c }}</span>
        </div>
      </div>
    </section>

    <div class="shell">
      <!-- ==================== 定价卡片 ==================== -->
      <section class="sec sec-plans">
        <div class="plans-glow" aria-hidden="true"></div>
        <div v-reveal class="plans-grid" @mousemove="onPlanMove">
          <div
            v-for="p in plans"
            :key="p.key"
            class="plan"
            :class="{ featured: p.key === 'enterprise' }"
          >
            <div v-if="p.key === 'enterprise'" class="comet" aria-hidden="true"></div>
            <span v-if="p.badge" class="plan-badge">{{ p.badge }}</span>
            <div class="plan-name">{{ p.name }}</div>
            <div class="plan-tagline">{{ p.tagline }}</div>
            <div class="price-row">
              <span v-if="p.cur" class="price-cur">{{ p.cur }}</span>
              <span class="price-num" :class="{ grad: p.cur }">{{ p.num }}</span>
            </div>
            <div class="price-note">{{ p.note }}</div>
            <ul class="feat-list">
              <li v-for="f in p.yes" :key="f" class="f-yes">{{ f }}</li>
              <li v-for="f in p.no" :key="f" class="f-no">{{ f }}</li>
            </ul>
            <a
              class="btn plan-cta"
              :class="p.cta.primary ? 'btn-primary' : 'btn-ghost'"
              :href="p.cta.href"
            >{{ p.cta.label }}</a>
          </div>
        </div>
      </section>

      <!-- ==================== 对比表 ==================== -->
      <section id="compare" class="sec sec-lined">
        <div v-reveal class="sec-head">
          <span class="eyebrow">对比</span>
          <h2 class="section-title">版本权益对比</h2>
          <p class="section-sub">企业版与旗舰版的差异只有两条——部署数量与集成权；转售与再分发不属于任何标准版本</p>
        </div>
        <div v-reveal="80" class="compare-wrap">
          <table class="compare">
            <thead>
              <tr>
                <th v-for="(h, i) in compareHead" :key="h.name" :class="{ hl: i === 2 }">
                  <div class="th-name">
                    {{ h.name }}
                    <span v-if="i === 2" class="th-tag">推荐</span>
                  </div>
                  <div v-if="h.price" class="th-price">{{ h.price }}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in compareRows" :key="row.label">
                <th scope="row">{{ row.label }}</th>
                <td v-for="(c, i) in row.cells" :key="i" :class="{ hl: i === 1 }">
                  <span v-if="c.k === 'y'" class="cell cell-y">✓<template v-if="c.v"> {{ c.v }}</template></span>
                  <span v-else-if="c.k === 'n'" class="cell cell-n">✕<template v-if="c.v"> {{ c.v }}</template></span>
                  <span v-else class="cell cell-t">{{ c.v }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ==================== 如何选择 ==================== -->
      <section class="sec sec-lined">
        <div v-reveal class="sec-head">
          <span class="eyebrow">选型</span>
          <h2 class="section-title">如何选择</h2>
        </div>
        <div v-reveal="80" class="choose-grid">
          <div v-for="c in choices" :key="c.scene" class="choose-item">
            <div class="choose-scene">{{ c.scene }}</div>
            <a v-if="c.href" class="pill" :href="c.href">{{ c.plan }} →</a>
            <span v-else class="pill pill-neutral">{{ c.plan }}</span>
          </div>
        </div>
      </section>

      <!-- ==================== 版本详解 ==================== -->
      <section id="editions" class="sec sec-lined">
        <div v-reveal class="sec-head">
          <span class="eyebrow">详解</span>
          <h2 class="section-title">各版本权益与边界</h2>
          <p class="section-sub">以下边界条款将原文写入商业授权协议，并在授权证书上重申</p>
        </div>
        <article v-for="(e, i) in editions" :key="e.key" v-reveal="i * 100" class="edition">
          <div class="ed-head">
            <h3 class="ed-name">{{ e.name }}</h3>
            <span class="ed-price">{{ e.price }}</span>
            <span class="ed-tag">{{ e.tagline }}</span>
          </div>
          <div class="ed-grid">
            <div class="panel panel-yes">
              <div class="panel-title">授予的权利</div>
              <ul class="feat-list">
                <li v-for="g in e.grants" :key="g" class="f-yes">{{ g }}</li>
              </ul>
            </div>
            <div class="panel panel-no">
              <div class="panel-title">禁止的行为</div>
              <ul class="feat-list">
                <li v-for="b in e.bans" :key="b" class="f-no">{{ b }}</li>
              </ul>
            </div>
          </div>
          <div v-if="e.note" class="note" :class="e.note.type === 'warn' ? 'note-warn' : 'note-info'">
            <div class="note-title">{{ e.note.title }}</div>
            <div class="note-body" v-html="e.note.html"></div>
          </div>
          <details v-for="r in e.rules" :key="r.title" class="rule">
            <summary>{{ r.title }}</summary>
            <ul>
              <li v-for="(item, j) in r.items" :key="j">{{ item }}</li>
            </ul>
          </details>
        </article>
        <div v-reveal class="note note-warn note-wide">
          <div class="note-title">关于转售与再分发</div>
          <div class="note-body">
            <p><strong>转售 Team-API 本体 SaaS</strong> 与<strong>再分发软件本体</strong>均不在上述任何标准版本授权范围内。如有此类需求，请<a href="#contact">联系我们</a>单独沟通专项授权。</p>
          </div>
        </div>
      </section>

      <!-- ==================== 版权与商标 ==================== -->
      <section class="sec sec-lined">
        <div v-reveal class="sec-head">
          <span class="eyebrow">归属</span>
          <h2 class="section-title">版权与商标归属</h2>
          <p class="section-sub">所有版本通用 · 核心条款</p>
        </div>
        <div v-reveal="60" class="note note-warn note-wide">
          <div class="note-title">核心条款</div>
          <div class="note-body">
            <p>本项目的著作权、商标权及其他知识产权<strong>始终归作者（qianfree）所有</strong>。任何档次的商业授权均属「使用许可（License）」，<strong>不构成著作权转让</strong>。</p>
          </div>
        </div>
        <div v-reveal="120" class="ip-wrap">
          <table class="ip-table">
            <tbody>
              <tr v-for="[k, v] in ipRows" :key="k">
                <th scope="row">{{ k }}</th>
                <td>{{ v }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ==================== 交付内容 ==================== -->
      <section id="delivery" class="sec sec-lined">
        <div v-reveal class="sec-head">
          <span class="eyebrow">交付</span>
          <h2 class="section-title">商业授权交付内容</h2>
          <p class="section-sub">购买商业授权后，您将获得以下交付物（可作为验收清单）</p>
        </div>
        <div v-reveal="60" class="delivery-grid">
          <div v-for="d in deliverables" :key="d.name" class="d-item">
            <div class="d-name">{{ d.name }}</div>
            <div class="d-desc">{{ d.desc }}</div>
          </div>
        </div>
        <div v-reveal="140" class="flow">
          <div v-for="(s, i) in flowSteps" :key="s" class="step">
            <div class="step-num">{{ i + 1 }}</div>
            <div class="step-label">{{ s }}</div>
          </div>
        </div>
      </section>

      <!-- ==================== 支持边界 ==================== -->
      <section class="sec sec-lined">
        <div v-reveal class="sec-head">
          <span class="eyebrow">边界</span>
          <h2 class="section-title">支持与服务边界</h2>
          <p class="section-sub">为保持项目可持续的轻量运营模式，我们明确公示支持边界——先写清楚，避免预期错配</p>
        </div>
        <div v-reveal="60" class="support-grid">
          <div class="panel panel-yes">
            <div class="panel-title">我们提供</div>
            <ul class="feat-list">
              <li v-for="s in supportYes" :key="s" class="f-yes">{{ s }}</li>
            </ul>
          </div>
          <div class="panel panel-no">
            <div class="panel-title">我们不提供</div>
            <ul class="feat-list">
              <li v-for="s in supportNo" :key="s" class="f-no">{{ s }}</li>
            </ul>
          </div>
        </div>
        <p v-reveal="120" class="support-order">遇到问题请按顺序：<strong>查文档</strong> → <strong>问社区群</strong> → <strong>邮件联系</strong>。多数问题在前两步即可解决。</p>
      </section>

      <!-- ==================== FAQ ==================== -->
      <section id="faq" class="sec sec-lined">
        <div v-reveal class="sec-head">
          <span class="eyebrow">FAQ</span>
          <h2 class="section-title">常见问题</h2>
        </div>
        <div v-reveal="80" class="faq-list">
          <details v-for="f in faqs" :key="f.q" class="faq">
            <summary>{{ f.q }}</summary>
            <div class="faq-a" v-html="f.a"></div>
          </details>
        </div>
      </section>

      <!-- ==================== 联系与购买 ==================== -->
      <section id="contact" class="sec sec-lined contact-sec">
        <div v-reveal class="contact">
          <div class="aurora a1" aria-hidden="true"></div>
          <div class="aurora a2" aria-hidden="true"></div>
          <div class="contact-head">
            <h2 class="contact-title">联系与购买</h2>
            <p class="contact-sub">说明来意与目标版本，我们会提供协议模板与授权信息确认表</p>
          </div>
          <div class="contact-grid">
            <a
              class="channel"
              href="https://github.com/qianfree/team-api/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div class="channel-label">GitHub Issues</div>
              <div class="channel-value">github.com/qianfree/team-api/issues ↗</div>
              <div class="channel-desc">适合需求沟通与方案讨论</div>
            </a>
            <div class="channel">
              <div class="channel-label">QQ</div>
              <div class="channel-value">
                {{ QQ }}
                <button class="copy-btn" type="button" @click="copyQQ">
                  {{ qqCopied ? '已复制 ✓' : '复制' }}
                </button>
              </div>
              <div class="channel-desc">添加时请注明「商业授权」</div>
            </div>
          </div>
          <p class="contact-note">本页价格为人民币一次性永久授权价格，最终条款以双方签署的商业授权协议为准。</p>
        </div>
      </section>
    </div>

    <div class="foot-rule"></div>
  </div>
</template>

<style scoped>
/* 彗星光边角度变量（不支持 @property 的浏览器退化为静态渐变边框） */
@property --pr-ang {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.pricing {
  /* 是 / 否 指示色（浅色） */
  --p-yes: #059669;
  --p-yes-bg: rgba(5, 150, 105, 0.09);
  --p-no: #dc2626;
  --p-no-bg: rgba(220, 38, 38, 0.08);
  /* 玻璃卡片顶部高光线（浅色） */
  --glass-hi: rgba(255, 255, 255, 0.6);
  /* 鼠标追光（浅色） */
  --spot: rgba(45, 212, 191, 0.12);
  /* 价格数字渐变（浅色） */
  --pn-from: #0f766e;
  --pn-to: #14b8a6;
  /* 分区辉光（浅色） */
  --sec-glow: rgba(20, 184, 166, 0.09);
}

.dark .pricing {
  --p-yes: #34d399;
  --p-yes-bg: rgba(52, 211, 153, 0.12);
  --p-no: #fb7185;
  --p-no-bg: rgba(251, 113, 133, 0.1);
  --glass-hi: rgba(255, 255, 255, 0.08);
  --spot: rgba(45, 212, 191, 0.16);
  --pn-from: #5eead4;
  --pn-to: #2dd4bf;
  --sec-glow: rgba(20, 184, 166, 0.16);
}

.pricing :where(a) {
  text-decoration: none;
}

.shell {
  max-width: 1376px;
  margin: 0 auto;
  padding: 0 32px;
}

/* ==================== 滚动渐入 ==================== */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.75s cubic-bezier(0.22, 0.61, 0.36, 1),
    transform 0.75s cubic-bezier(0.22, 0.61, 0.36, 1);
  transition-delay: var(--rd, 0ms);
}

.reveal.is-in {
  opacity: 1;
  transform: none;
}

/* ==================== 彗星光边（旋转渐变描边） ==================== */
.comet {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.5px;
  pointer-events: none;
  background: conic-gradient(
    from var(--pr-ang, 0deg),
    transparent 0deg,
    rgba(45, 212, 191, 0.95) 55deg,
    #0d9488 95deg,
    transparent 140deg
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  animation: cometSpin 5.5s linear infinite;
}

@keyframes cometSpin {
  to { --pr-ang: 360deg; }
}

/* ==================== Hero ==================== */
.p-hero {
  position: relative;
  overflow: hidden;
  padding: 76px 32px 28px;
  text-align: center;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-bg .g-grid,
.hero-bg .g-glow,
.hero-bg .g-noise,
.hero-bg .g-seat {
  position: absolute;
}

.hero-bg .g-grid {
  /* 外扩一格，让平移动画首尾无缝衔接（52px = 一个网格周期） */
  inset: -52px;
  background-image:
    linear-gradient(var(--ta-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--ta-grid) 1px, transparent 1px);
  background-size: 52px 52px;
  -webkit-mask-image: radial-gradient(70% 90% at 50% 0%, #000 20%, transparent 80%);
  mask-image: radial-gradient(70% 90% at 50% 0%, #000 20%, transparent 80%);
  animation: gridPan 70s linear infinite;
}

@keyframes gridPan {
  to { transform: translate(52px, 52px); }
}

.hero-bg .g-glow {
  border-radius: 50%;
}

.hero-bg .g-glow-a {
  top: -46%;
  left: 50%;
  width: min(1150px, 110vw);
  aspect-ratio: 1;
  background: radial-gradient(
    closest-side,
    rgba(45, 212, 191, var(--ta-halo-a)) 6%,
    rgba(45, 212, 191, 0) 72%
  );
  animation: glowDriftA 18s ease-in-out infinite alternate;
}

.hero-bg .g-glow-b {
  top: -30%;
  left: -12%;
  width: 620px;
  aspect-ratio: 1;
  background: radial-gradient(
    closest-side,
    rgba(56, 189, 248, var(--ta-halo-b)),
    rgba(56, 189, 248, 0) 70%
  );
  animation: glowDriftB 14s ease-in-out infinite alternate;
}

@keyframes glowDriftA {
  from { transform: translateX(-54%) translateY(0) scale(1); }
  to { transform: translateX(-46%) translateY(28px) scale(1.07); }
}

@keyframes glowDriftB {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(60px, 36px) scale(1.12); }
}

/* 细腻噪点，压住大面积渐变的塑料感 */
.hero-bg .g-noise {
  inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.55'/></svg>");
  opacity: 0.05;
}

.hero-bg .g-seat {
  left: 0;
  right: 0;
  bottom: -1px;
  height: 140px;
  background: linear-gradient(to top, var(--vp-c-bg) 8%, transparent);
}

.p-hero-inner {
  position: relative;
  z-index: 1;
  max-width: 780px;
  margin: 0 auto;
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
  margin: 22px 0 0;
  font-size: clamp(38px, 5vw, 58px);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--vp-c-text-1);
}

/* 标题流光：渐变高光循环扫过 */
.title-accent {
  background: linear-gradient(
    110deg,
    #14b8a6 25%,
    #5eead4 42%,
    #99f6e4 50%,
    #5eead4 58%,
    #0d9488 75%
  );
  background-size: 220% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: textShimmer 6.5s linear infinite;
}

@keyframes textShimmer {
  to { background-position: -220% center; }
}

.tagline {
  margin: 16px auto 0;
  max-width: 620px;
  font-size: 16px;
  line-height: 1.8;
  color: var(--vp-c-text-2);
}

.chips {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background: color-mix(in srgb, var(--vp-c-bg) 72%, transparent);
  border: 1px solid var(--vp-c-border);
  border-radius: 999px;
  backdrop-filter: blur(6px);
  transition: border-color 0.25s, color 0.25s;
}

.chip:hover {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
  color: var(--vp-c-text-1);
}

/* ---------- 按钮 ---------- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  color: #fff;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
}

/* 主按钮扫光 */
.btn-primary::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 38%,
    rgba(255, 255, 255, 0.35) 50%,
    transparent 62%
  );
  transform: translateX(-130%);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #0d9488, #0f766e);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.4);
}

.btn-primary:hover::after {
  transform: translateX(130%);
  transition: transform 0.7s ease;
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

/* ==================== 通用区块 ==================== */
.sec {
  padding-top: 72px;
  position: relative;
}

/* 分区线：中间实、两端渐隐 */
.sec-lined {
  margin-top: 72px;
}

.sec-lined::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--vp-c-border) 15%,
    var(--vp-c-border) 85%,
    transparent
  );
}

section[id] {
  scroll-margin-top: 88px;
}

.sec-head {
  text-align: center;
  margin-bottom: 40px;
}

.eyebrow {
  display: inline-block;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  background: linear-gradient(120deg, var(--vp-c-brand-3), var(--ta-accent-deep));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.section-title {
  border: none;
  padding-top: 0;
  margin: 10px 0 0;
  font-size: clamp(24px, 3.5vw, 32px);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
}

.section-sub {
  margin: 12px auto 0;
  max-width: 580px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

/* ==================== 定价卡片 ==================== */
.sec-plans {
  /* 首屏直达定价卡片：Hero 已收紧留白，这里同步压缩顶部间距 */
  padding-top: 40px;
}

.plans-glow {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: min(1060px, 100%);
  height: 440px;
  background: radial-gradient(closest-side, var(--sec-glow), transparent 72%);
  pointer-events: none;
}

.plans-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 1160px;
  margin: 0 auto;
}

.plan {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 30px 26px 24px;
  background: color-mix(in srgb, var(--vp-c-bg-alt) 86%, transparent);
  backdrop-filter: blur(10px);
  border: 1px solid var(--vp-c-border);
  border-radius: 18px;
  box-shadow: inset 0 1px 0 var(--glass-hi);
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

/* 鼠标追光：radial 高光跟随指针 */
.plan::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    260px circle at var(--mx, 50%) var(--my, 50%),
    var(--spot),
    transparent 65%
  );
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.plan:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 32%, transparent);
  box-shadow:
    inset 0 1px 0 var(--glass-hi),
    0 16px 36px -18px rgba(15, 23, 42, 0.24);
}

.plan:hover::after {
  opacity: 1;
}

.plan.featured {
  padding: 34px 26px 28px;
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-brand-1) 5%, transparent), transparent 46%),
    color-mix(in srgb, var(--vp-c-bg-alt) 88%, transparent);
  box-shadow:
    inset 0 1px 0 var(--glass-hi),
    0 22px 60px -22px rgba(13, 148, 136, 0.55);
}

.plan.featured:hover {
  transform: translateY(-4px);
  box-shadow:
    inset 0 1px 0 var(--glass-hi),
    0 26px 70px -22px rgba(13, 148, 136, 0.65);
}

.plan-badge {
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  border-radius: 999px;
  white-space: nowrap;
  animation: badgePulse 2.6s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% { box-shadow: 0 4px 12px rgba(13, 148, 136, 0.35); }
  50% { box-shadow: 0 4px 24px rgba(13, 148, 136, 0.65); }
}

.plan-name {
  font-size: 17px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.plan-tagline {
  margin-top: 4px;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.price-row {
  margin-top: 18px;
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price-cur {
  font-size: 20px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.price-num {
  font-size: 40px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--vp-c-text-1);
  font-variant-numeric: tabular-nums;
}

.price-num.grad {
  background: linear-gradient(180deg, var(--pn-from), var(--pn-to));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.price-note {
  margin-top: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

/* ---------- 是 / 否 列表 ---------- */
.feat-list {
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 9px;
  flex: 1;
}

.feat-list li {
  position: relative;
  padding: 2px 0 2px 26px;
  font-size: 14px;
  line-height: 1.6;
}

.f-yes {
  color: var(--vp-c-text-1);
}

.f-no {
  color: var(--vp-c-text-2);
}

.f-yes::before,
.f-no::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 700;
}

.f-yes::before {
  content: '✓';
  background: var(--p-yes-bg);
  color: var(--p-yes);
}

.f-no::before {
  content: '✕';
  background: var(--p-no-bg);
  color: var(--p-no);
}

.plan-cta {
  margin-top: 24px;
  width: 100%;
  height: 44px;
}

/* ==================== 对比表 ==================== */
.compare-wrap {
  overflow-x: auto;
  border: 1px solid var(--vp-c-border);
  border-radius: 16px;
  background: color-mix(in srgb, var(--vp-c-bg-alt) 86%, transparent);
  backdrop-filter: blur(10px);
  box-shadow: inset 0 1px 0 var(--glass-hi);
}

.compare {
  /* 覆盖 .vp-doc table 的 display:block / margin（会把内部列退化成内容宽度，
     表格整体收缩靠左）；恢复真实表格布局后 fixed 才能均分列宽 */
  display: table;
  margin: 0;
  width: 100%;
  min-width: 680px;
  border-collapse: collapse;
  /* fixed 布局：首列定宽、版本三列均分剩余宽度，任何屏宽下都均匀铺开 */
  table-layout: fixed;
}

.compare thead th:first-child {
  width: 28%;
}

.compare th,
.compare td {
  border-bottom: 1px solid var(--vp-c-border);
  padding: 13px 18px;
}

.compare tbody tr:last-child th,
.compare tbody tr:last-child td {
  border-bottom: none;
}

.compare thead th {
  text-align: center;
  padding-top: 18px;
  padding-bottom: 16px;
  vertical-align: top;
}

.th-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.th-tag {
  padding: 1px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  border-radius: 999px;
}

.th-price {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 600;
  background: linear-gradient(120deg, var(--pn-from), var(--pn-to));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-variant-numeric: tabular-nums;
}

.compare tbody th {
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  width: 27%;
  background: color-mix(in srgb, var(--vp-c-bg) 55%, transparent);
}

.compare tbody td {
  text-align: center;
}

.compare .hl {
  background: color-mix(in srgb, var(--vp-c-brand-1) 6%, transparent);
}

.compare thead .hl {
  box-shadow: inset 0 2.5px 0 0 var(--vp-c-brand-2);
}

.compare tbody tr:hover th,
.compare tbody tr:hover td:not(.hl) {
  background: color-mix(in srgb, var(--vp-c-brand-1) 3%, transparent);
}

.cell {
  font-size: 14px;
  white-space: nowrap;
}

.cell-y {
  color: var(--p-yes);
  font-weight: 600;
}

.cell-n {
  color: var(--p-no);
}

.cell-t {
  color: var(--vp-c-text-1);
}

/* ==================== 如何选择 ==================== */
.choose-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.choose-item {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
  padding: 22px 22px 20px;
  background: color-mix(in srgb, var(--vp-c-bg-alt) 86%, transparent);
  border: 1px solid var(--vp-c-border);
  border-radius: 14px;
  box-shadow: inset 0 1px 0 var(--glass-hi);
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.choose-item:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 32%, transparent);
  box-shadow:
    inset 0 1px 0 var(--glass-hi),
    0 12px 28px -16px rgba(15, 23, 42, 0.2);
}

.choose-scene {
  font-size: 14.5px;
  line-height: 1.7;
  color: var(--vp-c-text-1);
}

.pill {
  align-self: flex-start;
  padding: 5px 13px;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 25%, transparent);
  border-radius: 999px;
  transition: all 0.2s;
}

a.pill:hover {
  background: color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent);
  border-color: var(--vp-c-brand-1);
}

.pill-neutral {
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-border);
}

/* ==================== 版本详解 ==================== */
.edition {
  padding: 8px 0 40px;
}

.edition + .edition {
  border-top: 1px dashed var(--vp-c-border);
  padding-top: 36px;
}

.ed-head {
  display: flex;
  align-items: baseline;
  gap: 14px;
  flex-wrap: wrap;
}

.ed-name {
  border: none;
  padding: 0;
  margin: 0;
  font-size: 21px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.ed-price {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  font-variant-numeric: tabular-nums;
}

.ed-tag {
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.ed-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* ---------- 授予 / 禁止 面板 ---------- */
.panel {
  padding: 20px 22px;
  background: color-mix(in srgb, var(--vp-c-bg-alt) 86%, transparent);
  border: 1px solid var(--vp-c-border);
  border-radius: 14px;
  box-shadow: inset 0 1px 0 var(--glass-hi);
}

.panel-yes {
  border-top: 3px solid var(--p-yes);
}

.panel-no {
  border-top: 3px solid var(--p-no);
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}

.panel .feat-list {
  margin-top: 12px;
}

/* ---------- 提示框 ---------- */
.note {
  margin-top: 16px;
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid;
}

.note-info {
  background: color-mix(in srgb, var(--vp-c-brand-1) 5%, transparent);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 22%, transparent);
}

.note-warn {
  background: color-mix(in srgb, #d97706 6%, transparent);
  border-color: color-mix(in srgb, #d97706 30%, transparent);
}

.dark .note-warn {
  background: rgba(217, 119, 6, 0.09);
  border-color: rgba(245, 158, 11, 0.28);
}

.note-wide {
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.note-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 6px;
}

.note-body {
  font-size: 14px;
  line-height: 1.75;
  color: var(--vp-c-text-2);
}

.note-body :deep(p) {
  margin: 0 0 8px;
}

.note-body :deep(p:last-child) {
  margin-bottom: 0;
}

.note-body :deep(a) {
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

/* ---------- 判定规则 ---------- */
.rule {
  margin-top: 16px;
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.rule summary {
  padding: 13px 18px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  cursor: pointer;
  list-style: none;
  position: relative;
  padding-right: 44px;
}

.rule summary::-webkit-details-marker {
  display: none;
}

.rule summary::after {
  content: '+';
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  font-weight: 400;
  color: var(--vp-c-brand-1);
  transition: transform 0.2s;
}

.rule[open] summary::after {
  transform: translateY(-50%) rotate(45deg);
}

.rule ul {
  margin: 0;
  padding: 0 18px 14px 36px;
  display: grid;
  gap: 8px;
}

.rule li {
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

/* ==================== 版权归属表 ==================== */
.ip-wrap {
  border: 1px solid var(--vp-c-border);
  border-radius: 16px;
  background: color-mix(in srgb, var(--vp-c-bg-alt) 86%, transparent);
  box-shadow: inset 0 1px 0 var(--glass-hi);
  overflow: hidden;
}

.ip-table {
  /* 同 .compare：覆盖 .vp-doc table 的 display:block / margin */
  display: table;
  margin: 0;
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.ip-table th,
.ip-table td {
  padding: 13px 20px;
  border-bottom: 1px solid var(--vp-c-border);
  text-align: left;
  font-size: 14px;
  line-height: 1.65;
}

.ip-table tr:last-child th,
.ip-table tr:last-child td {
  border-bottom: none;
}

.ip-table th {
  width: 24%;
  font-weight: 600;
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--vp-c-bg) 55%, transparent);
}

.ip-table td {
  color: var(--vp-c-text-2);
}

.ip-wrap + .note {
  margin-top: 16px;
}

/* ==================== 交付内容 ==================== */
.delivery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.d-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 18px;
  background: color-mix(in srgb, var(--vp-c-bg-alt) 86%, transparent);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  position: relative;
  padding-left: 26px;
  box-shadow: inset 0 1px 0 var(--glass-hi);
  transition: border-color 0.25s, transform 0.25s;
}

.d-item:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
}

.d-item::before {
  content: '';
  position: absolute;
  left: 14px;
  top: 23px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--vp-c-brand-3);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--vp-c-brand-3) 18%, transparent);
}

.d-name {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.d-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.flow {
  position: relative;
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

/* 连接线：首末圆点中心之间的一条渐隐线 */
.flow::before {
  content: '';
  position: absolute;
  top: 17px;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--vp-c-brand-2) 45%, transparent) 18%,
    color-mix(in srgb, var(--vp-c-brand-2) 45%, transparent) 82%,
    transparent
  );
}

.step {
  text-align: center;
}

.step-num {
  position: relative;
  width: 34px;
  height: 34px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(13, 148, 136, 0.3);
}

.step-label {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

/* ==================== 支持边界 ==================== */
.support-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.support-order {
  margin: 24px 0 0;
  text-align: center;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.support-order strong {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

/* ==================== FAQ ==================== */
.faq-list {
  max-width: 860px;
  margin: 0 auto;
  display: grid;
  gap: 12px;
}

.faq {
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--vp-c-bg-alt) 86%, transparent);
  box-shadow: inset 0 1px 0 var(--glass-hi);
  transition: border-color 0.2s;
}

.faq[open] {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 32%, transparent);
}

.faq summary {
  padding: 16px 52px 16px 20px;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  cursor: pointer;
  list-style: none;
  position: relative;
}

.faq summary::-webkit-details-marker {
  display: none;
}

.faq summary::after {
  content: '+';
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  font-weight: 400;
  color: var(--vp-c-brand-1);
  transition: transform 0.2s;
}

.faq[open] summary::after {
  transform: translateY(-50%) rotate(45deg);
}

.faq-a {
  padding: 0 20px 18px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--vp-c-text-2);
}

.faq-a :deep(p) {
  margin: 0 0 10px;
}

.faq-a :deep(p:last-child) {
  margin-bottom: 0;
}

.faq-a :deep(strong) {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.faq-a :deep(a) {
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

/* ==================== 联系与购买 ==================== */
.contact {
  position: relative;
  overflow: hidden;
  padding: 64px 40px 48px;
  border-radius: 26px;
  background:
    radial-gradient(480px 340px at 84% -60px, rgba(45, 212, 191, 0.26), rgba(45, 212, 191, 0) 68%),
    radial-gradient(560px 400px at 6% calc(100% + 60px), rgba(56, 189, 248, 0.13), rgba(56, 189, 248, 0) 64%),
    linear-gradient(165deg, #122c47, #0b1120);
}

.contact::before {
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

/* 动态极光：两团模糊光斑缓慢漂移 */
.aurora {
  position: absolute;
  border-radius: 50%;
  filter: blur(46px);
  pointer-events: none;
}

.aurora.a1 {
  width: 460px;
  height: 300px;
  top: -90px;
  right: -70px;
  background: radial-gradient(closest-side, rgba(45, 212, 191, 0.4), transparent 70%);
  animation: auroraA 13s ease-in-out infinite alternate;
}

.aurora.a2 {
  width: 520px;
  height: 340px;
  bottom: -120px;
  left: -90px;
  background: radial-gradient(closest-side, rgba(56, 189, 248, 0.24), transparent 70%);
  animation: auroraB 16s ease-in-out infinite alternate;
}

@keyframes auroraA {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(-46px, 30px) scale(1.12); }
}

@keyframes auroraB {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(52px, -34px) scale(1.08); }
}

.contact-head {
  position: relative;
  text-align: center;
}

.contact-title {
  border: none;
  padding: 0;
  margin: 0;
  font-size: clamp(24px, 3.5vw, 32px);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #f0fdfa;
}

.contact-sub {
  margin: 12px auto 0;
  max-width: 520px;
  font-size: 14.5px;
  line-height: 1.8;
  color: rgba(203, 213, 225, 0.85);
}

.contact-grid {
  position: relative;
  margin-top: 36px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.channel {
  display: block;
  padding: 22px 24px;
  border: 1px solid rgba(240, 253, 250, 0.16);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(6px);
  transition: border-color 0.2s, background 0.2s, transform 0.2s;
}

.channel:hover {
  border-color: rgba(45, 212, 191, 0.45);
  background: rgba(15, 23, 42, 0.5);
  transform: translateY(-2px);
}

.channel-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(94, 234, 212, 0.9);
}

.channel-value {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #f0fdfa;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.copy-btn {
  padding: 4px 12px;
  font-size: 12.5px;
  font-weight: 500;
  color: #0f172a;
  background: #5eead4;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}

.copy-btn:hover {
  background: #99f6e4;
  box-shadow: 0 0 14px rgba(94, 234, 212, 0.45);
}

.channel-desc {
  margin-top: 8px;
  font-size: 13px;
  color: rgba(148, 163, 184, 0.9);
}

.contact-note {
  position: relative;
  margin: 28px 0 0;
  text-align: center;
  font-size: 12.5px;
  color: rgba(148, 163, 184, 0.75);
}

/* ==================== 页脚收尾 ==================== */
.foot-rule {
  height: 96px;
}

/* ==================== 降级：减少动态效果 ==================== */
@media (prefers-reduced-motion: reduce) {
  .rise,
  .badge-dot::after,
  .title-accent,
  .comet,
  .plan-badge,
  .hero-bg .g-grid,
  .hero-bg .g-glow-a,
  .hero-bg .g-glow-b,
  .aurora {
    animation: none;
  }

  .btn-primary::after {
    display: none;
  }

  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

/* ==================== 响应式 ==================== */
@media (max-width: 1100px) {
  .plans-grid {
    grid-template-columns: 1fr;
    max-width: 560px;
  }

  .plan-badge {
    left: 26px;
    transform: none;
  }
}

@media (max-width: 960px) {
  .shell {
    padding: 0 24px;
  }

  .p-hero {
    padding: 56px 24px 20px;
  }

  .ed-grid,
  .support-grid,
  .contact-grid {
    grid-template-columns: 1fr;
  }

  .choose-grid {
    grid-template-columns: 1fr;
  }

  .flow {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }

  .flow::before {
    display: none;
  }

  .delivery-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .shell {
    padding: 0 20px;
  }

  .contact {
    padding: 48px 24px 36px;
    border-radius: 20px;
  }
}
</style>
