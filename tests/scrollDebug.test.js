import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'

const SCROLL_PATH = new URL('../static/scroll.html', import.meta.url)
const html = await readFile(SCROLL_PATH, 'utf8')

test('keeps the standalone inline runtime syntactically valid', () => {
  const match = html.match(/<script>([\s\S]*?)<\/script>/)
  assert.ok(match, 'scroll.html must contain its inline runtime')
  assert.doesNotThrow(() => new vm.Script(match[1]))
})

test('keeps the validated locked-scroll runtime constants and framing', () => {
  assert.match(html, /const DAMPING_MS=78;/)
  assert.match(html, /const SEEK_INTERVAL_MS=28;/)
  assert.match(html, /const TOUCH_TRAVEL_SCREENS=2\.5463;/)
  assert.match(html, /const WHEEL_TRAVEL_PX=1851\.7;/)
  assert.match(html, /const KEY_STEP=\.07776;/)
  assert.match(html, /object-fit:contain;object-position:center bottom/)
  assert.match(html, /html,body\{[^}]*overflow:hidden;[^}]*overscroll-behavior:none/)
  assert.match(html, /const isMobileDevice=window\.matchMedia\('\(pointer:coarse\)'\)\.matches&&!window\.matchMedia\('\(hover:hover\)'\)\.matches;/)
  assert.doesNotMatch(html, /class="hud"/)
  assert.doesNotMatch(html, /Frame master/)
  assert.doesNotMatch(html, /requestFullscreen|navigationUI/)
})

test('gates QA instrumentation behind scroll-debug=1', () => {
  assert.match(html, /urlParams\.get\('scroll-debug'\)==='1'/)
  assert.match(html, /const scrollQa=SCROLL_DEBUG\?createScrollDebug\(\):null;/)
  assert.match(html, /window\.DESORDEN_SCROLL_QA=api;/)
  assert.match(html, /schema:'desorden-scroll-qa\/v1'/)
})

test('captures the required browser timing and media signals without external telemetry', () => {
  for (const signal of [
    'inputHandlerDelayMs',
    'inputToRafMs',
    'seekDurationMs',
    'assignmentToVisibleMs',
    'inputToVisibleMs',
    'getVideoPlaybackQuality',
    "'seeking','waiting','stalled'",
    'performance.memory (JS heap only)',
  ]) {
    assert.ok(html.includes(signal), `missing QA signal: ${signal}`)
  }
  assert.doesNotMatch(html, /sendBeacon\(|XMLHttpRequest\(|fetch\([^)]*scroll-debug/)
})
