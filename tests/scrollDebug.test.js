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
  assert.match(html, /filter:brightness\(\.942\) saturate\(\.78\) grayscale\(\.08\) contrast\(1\.12\)/)
  assert.match(html, /const MIN_LOADER_MS=1800;/)
  assert.match(html, /html,body\{[^}]*overflow:hidden;[^}]*overscroll-behavior:none/)
  assert.match(html, /const SCROLL_DEBUG=urlParams\.get\('scroll-debug'\)==='1'\|\|urlParams\.get\('debug'\)==='1';/)
  assert.match(html, /@media\(min-width:769px\) and \(hover:hover\) and \(pointer:fine\)/)
  assert.match(html, /card\.setAttribute\('aria-hidden',String\(!active\)\);/)
  assert.match(html, /const REDUCED_MOTION=window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches;/)
  assert.doesNotMatch(html, /class="hud"/)
  assert.doesNotMatch(html, /Frame master/)
  assert.doesNotMatch(html, /requestFullscreen|navigationUI/)
})

test('keeps vertical scrub available above copy and the project marquee', () => {
  assert.match(html, /\.story-overlays\{[^}]*touch-action:none/)
  assert.match(html, /\.marquee-slider\{[^}]*touch-action:none/)
  assert.match(html, /window\.addEventListener\('pointermove',[\s\S]*\{capture:true,passive:false\}\)/)
  assert.match(html, /pointerMode=pointerStartedInMarquee&&Math\.abs\(totalX\)>Math\.abs\(totalY\)\?'horizontal':'vertical'/)
  assert.doesNotMatch(html, /sticky\.addEventListener\('pointerdown'/)
  assert.doesNotMatch(html, /<h2>Trabajos realizados\.<\/h2>/)
  assert.match(html, /filter:brightness\(0\) saturate\(0\) invert\(68%\)/)
})

test('renders the minimal initial cue and clean selected-logo feedback', () => {
  assert.match(html, /class="hint" aria-hidden="true"><svg[^>]*viewBox="0 0 40 24"/)
  assert.match(html, /@keyframes hint-pop/)
  assert.doesNotMatch(html, />Desliza<|>Desplaza</)
  assert.match(html, /-webkit-tap-highlight-color:transparent/)
  assert.match(html, /\.client-logo-button\.is-selected\{[^}]*filter:brightness\(0\) saturate\(100%\)/)
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
