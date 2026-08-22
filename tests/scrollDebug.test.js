import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'

const SCROLL_PATH = new URL('../static/scroll.html', import.meta.url)
const html = await readFile(SCROLL_PATH, 'utf8')
const wrangler = JSON.parse(await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'))
const redirects = await readFile(new URL('../static/_redirects', import.meta.url), 'utf8')
const deployWorkflow = await readFile(new URL('../.github/workflows/deploy-webl-scroll.yml', import.meta.url), 'utf8')

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
  assert.doesNotMatch(html, /MIN_LOADER_MS|FINAL_HOLD_MS/)
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
  assert.match(html, /\.hint\{[^}]*color:#fff/)
  assert.doesNotMatch(html, />Desliza<|>Desplaza</)
  assert.match(html, /-webkit-tap-highlight-color:transparent/)
  assert.match(html, /\.client-logo-button\.is-selected::after\{[^}]*background:var\(--gold\)/)
  assert.match(html, /\.client-logo-button\[data-client="pugnator"\]::after\{[^}]*06-pugnator-castellet\.png/)
})

test('renders the final linked contact icon row', () => {
  assert.match(html, /class="contact-actions" aria-label="Contacte i xarxes socials"/)
  assert.match(html, /href="https:\/\/wa\.me\/34640925788"[^>]*aria-label="Obrir el WhatsApp de Desorden"/)
  assert.match(html, /href="https:\/\/www\.instagram\.com\/desorden\.cat\/"[^>]*aria-label="Obrir l’Instagram de Desorden"/)
  assert.match(html, /href="mailto:hola@desorden\.studio" aria-label="Enviar un correu/)
  assert.match(html, /\.contact-icon\{[^}]*width:52px;height:52px[^}]*border:0;background:transparent/)
  assert.match(html, /\.contact-icon svg\{width:30px;height:30px/)
})

test('increases section and project descriptions by twenty percent', () => {
  assert.match(html, /\.story-card p\{[^}]*font-size:clamp\(\.984rem,1\.44vw,1\.2rem\)/)
  assert.match(html, /\.project-info p\{[^}]*font-size:clamp\(1\.104rem,1\.74vw,1\.44rem\)/)
  assert.match(html, /@media\(max-width:700px\)[\s\S]*\.story-card p\{font-size:clamp\(\.936rem,4\.2vw,1\.128rem\)/)
})

test('uses real preload progress with letters only and explicit cookie choices', () => {
  assert.match(html, /\.letter-face\{[^}]*font-size:clamp\(59px,16\.8vw,90px\)[^}]*transform:scaleX\(1\.16\)/)
  assert.doesNotMatch(html, /loader-progressbar|loader-bar-track|loader-counter|loader-status/)
  assert.doesNotMatch(html, /displayLoadProgress|loaderTick|loaderStartedAt/)
  assert.match(html, /realLoadProgress=clamp01\(loaded\/total\);[\s\S]*paintLoader\(realLoadProgress\)/)
  assert.match(html, /id="btnRejectConsent"[^>]*>Rebutjar<\/button>/)
  assert.match(html, /id="btnAcceptConsent"[^>]*>Acceptar<\/button>/)
})

test('publishes the complete interface in Catalan and closes with Parlem without punctuation', () => {
  assert.match(html, /<html lang="ca">/)
  assert.match(html, /<title>Desorden Studio — Identitat i Producció Visual<\/title>/)
  assert.match(html, />Treballs realitzats<\/button>/)
  assert.match(html, /<h2>Parlem<\/h2>/)
  assert.doesNotMatch(html, /Hablemos\.?|<h2>Parlem\.<\/h2>/)
  assert.match(html, /Configuració de galetes/)
  assert.match(html, /Creació d’identitat visual corporativa i desenvolupament de marca\./)
})

test('adds method and studio sections without changing the visual identity', () => {
  assert.match(html, /DESORDEN_SCROLL_SECTIONS_V1/)
  assert.match(html, />Mètode<\/button>/)
  assert.match(html, />Estudi<\/button>/)
  assert.match(html, /Mètode de treball en tres fases/)
  assert.match(html, /<strong>Direcció<\/strong>/)
  assert.match(html, /<strong>Producció<\/strong>/)
  assert.match(html, /<strong>Lliurament<\/strong>/)
  assert.match(html, /Imatge, tecnologia<br>i criteri visual\./)
  assert.match(html, /--gold:#D49A36;/)
  assert.match(html, /--bg:#050505;/)
})

test('publishes canonical and social metadata for the public studio URL', () => {
  assert.match(html, /<meta name="description" content="DESORDEN combina/)
  assert.match(html, /<meta property="og:locale" content="ca_ES"/)
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.desorden\.cat\/"/)
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

test('maps both DESORDEN hostnames to WEBL and serves scroll at the root URL', () => {
  assert.deepEqual(wrangler.routes, [
    { pattern: 'desorden.cat/*', zone_name: 'desorden.cat' },
    { pattern: 'www.desorden.cat/*', zone_name: 'desorden.cat' },
  ])
  assert.equal(redirects.trim(), '/ /scroll 200')
  assert.match(deployWorkflow, /static\/_redirects/)
  assert.match(deployWorkflow, /wrangler\.jsonc/)
  assert.match(deployWorkflow, /Verify DESORDEN custom domains/)
})
