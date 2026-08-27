<script setup lang="ts">
const layers = [
  { name: '租户钱包', sub: '货币池 · 充值余额消费', chip: '租户' },
  { name: '套餐额度', sub: '资源池 · 有效期内多项目共享', chip: '订阅' },
  { name: '成员额度', sub: 'fixed / periodic · 周期型到期自动重置', chip: '个人' },
  { name: '项目预算', sub: '触顶自动封停 · 调高预算即恢复', chip: '项目' },
  { name: 'API Key 额度', sub: '独立额度 · QPS · IP 白名单', chip: '应用' },
]
</script>

<template>
  <div class="qstack">
    <div class="qstack-top">
      <span class="arrow">请求进入 ↓</span>
      <span class="top-note">一次调用，逐层校验</span>
    </div>
    <div class="funnel">
      <div
        v-for="(l, i) in layers"
        :key="l.name"
        class="layer"
        :style="{ width: 100 - i * 7 + '%' }"
      >
        <span class="layer-idx">{{ i + 1 }}</span>
        <div class="layer-main">
          <div class="layer-name">{{ l.name }}</div>
          <div class="layer-sub">{{ l.sub }}</div>
        </div>
        <span class="layer-chip">{{ l.chip }}</span>
      </div>
    </div>
    <div class="qstack-bottom">任一层不足 → 拒绝调用并返回明确错误码</div>
  </div>
</template>

<style scoped>
.qstack {
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  background: var(--vp-c-bg);
  padding: 20px 22px 16px;
}

.qstack-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.arrow {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.top-note {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.funnel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.layer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 22%, transparent);
  background: color-mix(in srgb, var(--vp-c-brand-1) 5%, var(--vp-c-bg));
  border-radius: 10px;
  transition: transform 0.2s;
}

.layer:hover {
  transform: translateX(4px);
}

.layer-idx {
  flex: none;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: var(--vp-c-brand-1);
  border-radius: 50%;
}

.layer-main {
  flex: 1;
  min-width: 0;
}

.layer-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  white-space: nowrap;
}

.layer-sub {
  margin-top: 1px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-chip {
  flex: none;
  padding: 2px 9px;
  font-size: 11px;
  color: var(--vp-c-brand-1);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
  border-radius: 999px;
  white-space: nowrap;
}

.qstack-bottom {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed var(--vp-c-border);
  text-align: center;
  font-size: 12.5px;
  color: var(--vp-c-text-2);
}

@media (max-width: 640px) {
  .layer-sub {
    white-space: normal;
  }
}
</style>
