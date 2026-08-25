<script setup lang="ts">
defineProps<{
  src: string
  url: string
  alt?: string
}>()
</script>

<template>
  <div class="browser">
    <div class="browser-bar">
      <span class="bdot"></span>
      <span class="bdot"></span>
      <span class="bdot"></span>
      <span class="browser-url">
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        {{ url }}
      </span>
    </div>
    <img :src="src" :alt="alt ?? url" loading="lazy" />
  </div>
</template>

<style scoped>
.browser {
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.browser-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  background: var(--vp-c-default-soft);
  border-bottom: 1px solid var(--vp-c-border);
}

.bdot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--vp-c-border);
  flex: none;
}

.browser-url {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 auto;
  padding: 3px 14px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 999px;
  max-width: 70%;
  white-space: nowrap;
  overflow: hidden;
  user-select: none;
}

img {
  display: block;
  width: 100%;
  height: auto;
}
</style>
