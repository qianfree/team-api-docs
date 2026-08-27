// 用真实视口截取页面（比 CLI --screenshot 的窗口钳制更可靠）
// 用法: node scripts/shot.mjs <url> <out.png> [width] [height] [fullPage]
import puppeteer from 'puppeteer-core'

const [url, out, w = '1440', h = '960', full = ''] = process.argv.slice(2)

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 1 })
await page.goto(url, { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 2000))

// fullPage 模式下先滚到底再回顶，触发 loading="lazy" 的图片加载
if (full === 'full') {
  await page.evaluate(async () => {
    const step = window.innerHeight
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
    }
    window.scrollTo(0, 0)
  })
  await new Promise((r) => setTimeout(r, 1500))
}

await page.screenshot({ path: out, fullPage: full === 'full' })
await browser.close()
console.log('saved', out)
