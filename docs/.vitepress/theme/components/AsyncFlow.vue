<script setup lang="ts">
const steps = [
  {
    status: 'QUEUED',
    code: 'POST /v1/images/generations/async',
    sub: '提交即建任务返回 task_id，不等上游；队列满直接退款并返回 429',
  },
  {
    status: 'RUNNING',
    code: 'worker 池 · 100 并发 · 队列 1000',
    sub: '长连接由 worker 持有，三层并发控制，失败自动换次选渠道',
  },
  {
    status: 'SUCCEEDED',
    code: 'GET /v1/images/generations/async/{task_id}',
    sub: '产物 re-host 对象存储，多图以 data 数组返回，失败自动退款',
  },
]
</script>

<template>
  <div class="aflow">
    <div class="steps">
      <div v-for="(s, i) in steps" :key="s.status" class="step">
        <div class="marker">
          <span class="mnum">{{ i + 1 }}</span>
          <span v-if="i < steps.length - 1" class="mline"></span>
        </div>
        <div class="sbody">
          <div class="shead">
            <span class="chip" :class="'chip-' + s.status.toLowerCase()">{{ s.status }}</span>
            <code>{{ s.code }}</code>
          </div>
          <div class="ssub">{{ s.sub }}</div>
        </div>
      </div>
    </div>
    <div class="aflow-foot">
      <span v-for="t in ['按次计价 · 多图不加价', '停机精确退款', '同一框架承载视频 / 音乐']" :key="t" class="tag">{{ t }}</span>
    </div>
  </div>
</template>

<style scoped>
.aflow {
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  background: var(--vp-c-bg);
  padding: 22px 22px 16px;
}

.steps {
  display: flex;
  flex-direction: column;
}

.step {
  display: flex;
  gap: 14px;
}

.marker {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mnum {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: var(--vp-c-brand-1);
  border-radius: 50%;
}

.mline {
  flex: 1;
  width: 2px;
  min-height: 18px;
  margin: 4px 0;
  background: color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
}

.sbody {
  flex: 1;
  min-width: 0;
  padding-bottom: 18px;
}

.step:last-child .sbody {
  padding-bottom: 4px;
}

.shead {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.chip {
  flex: none;
  padding: 2px 9px;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--vp-font-family-mono);
  border-radius: 999px;
  letter-spacing: 0.04em;
}
.chip-queued {
  color: #b45309;
  background: color-mix(in srgb, #f59e0b 14%, transparent);
  border: 1px solid color-mix(in srgb, #f59e0b 35%, transparent);
}
.chip-running {
  color: #1d4ed8;
  background: color-mix(in srgb, #3b82f6 12%, transparent);
  border: 1px solid color-mix(in srgb, #3b82f6 35%, transparent);
}
.chip-succeeded {
  color: #047857;
  background: color-mix(in srgb, #10b981 12%, transparent);
  border: 1px solid color-mix(in srgb, #10b981 35%, transparent);
}

/* 暗色模式下加深浅色 chips 的文字对比度 */
:root.dark .chip-queued { color: #fbbf24; }
:root.dark .chip-running { color: #60a5fa; }
:root.dark .chip-succeeded { color: #34d399; }

code {
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  color: var(--vp-c-brand-1);
  word-break: break-all;
}

.ssub {
  margin-top: 5px;
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--vp-c-text-2);
}

.aflow-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed var(--vp-c-border);
}

.tag {
  padding: 3px 10px;
  font-size: 11.5px;
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-border);
  border-radius: 999px;
  white-space: nowrap;
}
</style>
