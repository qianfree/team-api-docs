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
      <div class="line ind"><span class="key">-d</span> <span class="str">'{"model":"claude-sonnet-5","stream":true,</span></div>
      <div class="line ind2"><span class="str">"messages":[{"role":"user","content":"介绍一下 Team-API"}]}'</span></div>
      <div class="blank"></div>
      <div class="line"><span class="sse">data:</span> <span class="json">{"choices":[{"delta":{"content":"多租户大模型 API 网关…"}}]}</span></div>
      <div class="line"><span class="sse">data:</span> <span class="json">{"usage":{"prompt_tokens":21,"total_tokens":128}}</span></div>
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
.blank { height: 10px; }

.prompt { color: #2dd4bf; margin-right: 6px; }
.cmd { color: #e6edf3; font-weight: 600; margin-right: 8px; }
.url { color: #39c5cf; }
.key { color: #79c0ff; }
.str { color: #a5d6ff; }
.op { color: #8b949e; }
.sse { color: #d2a8ff; }
.json { color: #e6edf3; }

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
