<script setup lang="ts">
import BrowserFrame from './BrowserFrame.vue'

const consoles = [
  {
    route: '/api/admin/*',
    name: '管理端 · 平台运营',
    tech: 'Arco Design Vue · 40+ 模块',
    src: '/images/admin_dashboard.png',
    url: 'https://team-api.net/admin/',
    alt: 'Team-API 管理后台 — 总览仪表盘',
  },
  {
    route: '/api/tenant/*',
    name: '租户端 · 客户组织',
    tech: 'Naive UI + TailwindCSS · 近 40 模块',
    src: '/images/tenant_playground_chat.png',
    url: 'https://team-api.net',
    alt: 'Team-API 租户控制台 — 在线对话 Playground',
  },
]
</script>

<template>
  <div class="dual">
    <div v-for="(c, i) in consoles" :key="c.route" class="console-block">
      <div v-if="i === 1" class="dual-divider">
        <span class="divider-line"></span>
        <span class="divider-text">JWT · 会话 · 权限模型互不相通</span>
        <span class="divider-line"></span>
      </div>
      <div class="console-head">
        <span class="route">{{ c.route }}</span>
        <span class="cname">{{ c.name }}</span>
        <span class="tech">{{ c.tech }}</span>
      </div>
      <BrowserFrame :src="c.src" :url="c.url" :alt="c.alt" img-height="212px" />
    </div>
  </div>
</template>

<style scoped>
.dual {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.console-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.route {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 25%, transparent);
  border-radius: 6px;
  padding: 2px 8px;
}

.cname {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.tech {
  margin-left: auto;
  font-size: 12px;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}

.dual-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 18px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--vp-c-border);
}

.divider-text {
  flex: none;
  font-size: 12px;
  color: var(--vp-c-text-3);
}
</style>
