<template>
  <div class="terminal">
    <div class="term-bar">
      <span class="dot dot-red"></span>
      <span class="dot dot-yellow"></span>
      <span class="dot dot-green"></span>
      <span class="term-title">bash — team-api</span>
    </div>
    <div class="term-body">
      <div class="line">
        <span class="prompt">$</span>
        <span class="cmd">curl</span>
        <span class="url">https://your-domain/v1/chat/completions</span>
        <span class="op">\</span>
      </div>
      <div class="line ind"><span class="key">-H</span> <span class="str">"Authorization: Bearer sk-ta-••••"</span> <span class="op">\</span></div>
      <div class="line ind"><span class="key">-H</span> <span class="str">"Content-Type: application/json"</span> <span class="op">\</span></div>
      <div class="line ind"><span class="key">-d</span> <span class="str">'{"model":"claude-sonnet-5",</span></div>
      <div class="line ind2"><span class="str">"messages":[{"role":"user","content":"介绍一下 Team-API"}]}'</span></div>
      <div class="blank"></div>
      <div class="line"><span class="op">{</span></div>
      <div class="line j2"><span class="key">"id"</span><span class="op">:</span> <span class="str">"chatcmpl-m3x8k2a1"</span><span class="op">,</span></div>
      <div class="line j2"><span class="key">"object"</span><span class="op">:</span> <span class="str">"chat.completion"</span><span class="op">,</span></div>
      <div class="line j2"><span class="key">"created"</span><span class="op">:</span> <span class="num">1756204812</span><span class="op">,</span></div>
      <div class="line j2"><span class="key">"model"</span><span class="op">:</span> <span class="str">"claude-sonnet-5"</span><span class="op">,</span></div>
      <div class="line j2"><span class="key">"choices"</span><span class="op">:</span> <span class="op">[{</span></div>
      <div class="line j4"><span class="key">"index"</span><span class="op">:</span> <span class="num">0</span><span class="op">,</span></div>
      <div class="line j4"><span class="key">"message"</span><span class="op">:</span> <span class="op">{</span><span class="key">"role"</span><span class="op">:</span><span class="str">"assistant"</span><span class="op">,</span><span class="key">"content"</span><span class="op">:</span><span class="str">"Team-API 是多租户大模型 API 网关"</span><span class="op">},</span></div>
      <div class="line j4"><span class="key">"finish_reason"</span><span class="op">:</span> <span class="str">"stop"</span></div>
      <div class="line j2"><span class="op">}],</span></div>
      <div class="line j2"><span class="key">"usage"</span><span class="op">:</span> <span class="op">{</span><span class="key">"prompt_tokens"</span><span class="op">:</span><span class="num">21</span><span class="op">,</span><span class="key">"completion_tokens"</span><span class="op">:</span><span class="num">98</span><span class="op">,</span><span class="key">"total_tokens"</span><span class="op">:</span><span class="num">119</span><span class="op">}</span></div>
      <div class="line"><span class="op">}</span></div>
      <div class="line"><span class="cursor"></span></div>
    </div>
  </div>
</template>

<style scoped>
.terminal {
  border-radius: 12px;
  overflow: hidden;
  text-align: left;
  border: 1px solid #30363d;
  background: #0d1117;
  box-shadow: 0 16px 48px -16px rgba(15, 23, 42, 0.45);
}

.term-bar {
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

.term-title {
  margin-left: 8px;
  font-size: 12px;
  color: #8b949e;
  font-family: var(--vp-font-family-mono);
}

.term-body {
  padding: 16px 18px;
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  line-height: 1.85;
  overflow-x: auto;
}

.line {
  white-space: pre;
  color: #e6edf3;
}
.line.ind { padding-left: 14px; }
.line.ind2 { padding-left: 28px; }
/* JSON 缩进：按 12.5px 等宽字体的 2ch / 4ch 对齐 */
.line.j2 { padding-left: 15px; }
.line.j4 { padding-left: 30px; }
.blank { height: 10px; }

.prompt { color: #2dd4bf; margin-right: 6px; }
.cmd { color: #e6edf3; font-weight: 600; margin-right: 8px; }
.url { color: #39c5cf; }
.key { color: #79c0ff; }
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
</style>
