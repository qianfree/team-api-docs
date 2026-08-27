<template>
  <div class="dcard">
    <div class="dcard-bar">
      <span class="dot dot-red"></span>
      <span class="dot dot-yellow"></span>
      <span class="dot dot-green"></span>
      <span class="dcard-title">relaykit/dispatch — 调度内核</span>
    </div>
    <div class="dcard-body">
      <div class="line"><span class="cmt"># 多因子加权评分</span></div>
      <div class="line">
        <span class="fn">score</span> <span class="op">=</span> <span class="id">层级偏置</span> <span class="op">×</span> <span class="id">健康因子</span>
      </div>
      <div class="line ind">
        <span class="op">×</span> <span class="id">负载余量</span><span class="op">^γ</span> <span class="op">×</span> <span class="id">成本因子</span> <span class="op">×</span> <span class="id">爬坡</span> <span class="op">×</span> <span class="id">协议匹配</span>
      </div>
      <div class="line">
        <span class="fn">tier</span>&nbsp;&nbsp;<span class="op">=</span> <span class="str">主 1.0 / 备 0.15 / 兜底 0.02</span>
      </div>
      <div class="blank"></div>
      <div class="line"><span class="cmt"># HRW 一致性哈希选路，增删渠道仅极小比例重映射</span></div>
      <div class="line">
        <span class="fn">route</span> <span class="op">=</span> <span class="fn">HRW</span><span class="op">(</span><span class="str">会话键</span><span class="op">,</span> <span class="str">候选渠道集</span><span class="op">)</span>
      </div>
      <div class="blank"></div>
      <div class="line"><span class="cmt"># 会话亲和：长对话不跳渠道</span></div>
      <div class="line">
        <span class="fn">bind</span>&nbsp;&nbsp;<span class="op">=</span> <span class="str">会话键 → 渠道</span><span class="op">,</span> <span class="id">保持 30 min</span>
      </div>
      <div class="line">
        <span class="fn">guard</span> <span class="op">=</span> <span class="id">健康</span> <span class="op">&lt;</span> <span class="num">0.5</span> <span class="op">‖</span> <span class="id">容量</span> <span class="op">&lt;</span> <span class="num">10%</span> <span class="op">→</span> <span class="str">解绑重选</span>
      </div>
      <div class="line"><span class="cursor"></span></div>
    </div>
  </div>
</template>

<style scoped>
.dcard {
  border-radius: 12px;
  overflow: hidden;
  text-align: left;
  border: 1px solid #30363d;
  background: #0d1117;
  box-shadow: 0 16px 48px -16px rgba(15, 23, 42, 0.45);
}

.dcard-bar {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 14px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
}

.dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}
.dot-red { background: #ff5f57; }
.dot-yellow { background: #febc2e; }
.dot-green { background: #28c840; }

.dcard-title {
  margin-left: 8px;
  font-size: 12px;
  color: #8b949e;
  font-family: var(--vp-font-family-mono);
}

.dcard-body {
  padding: 16px 18px;
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  line-height: 1.9;
  overflow-x: auto;
}

.line {
  white-space: pre;
  color: #e6edf3;
}
.line.ind { padding-left: 58px; }
.blank { height: 8px; }

.fn { color: #2dd4bf; font-weight: 600; }
.cmt { color: #7ee787; }
.id { color: #79c0ff; }
.str { color: #a5d6ff; }
.op { color: #8b949e; }
.num { color: #d2a8ff; }

.cursor {
  display: inline-block;
  width: 8px;
  height: 16px;
  vertical-align: -2px;
  background: #e6edf3;
  animation: blink 1.1s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

@media (max-width: 640px) {
  .line.ind { padding-left: 14px; }
}
</style>
