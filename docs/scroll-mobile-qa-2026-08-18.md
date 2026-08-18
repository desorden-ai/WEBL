# WEBL `/scroll` — mobile QA trace protocol

Date: 2026-08-18
Branch: `SOL`
Scope: measurement only; no runtime constants, media pipeline or production deployment changed.

## QA mode

The instrumentation is disabled by default and activates only when the exact query parameter `scroll-debug=1` is present. It does not send data to an external service. The current report is available as `window.DESORDEN_SCROLL_QA.getReport()` and through the on-screen **Copiar JSON** / **Descargar** controls.

Use identifying query parameters so every export is self-describing:

```text
/scroll?reset-consent=1&scroll-debug=1&qa-device=Pixel%208&qa-browser=Chrome%20139&qa-network=WiFi
```

Supported context fields are `qa-device`, `qa-browser`, `qa-network` and `qa-notes`. They are metadata only and do not change the runtime.

## Preview without production deployment

From a clean `SOL` checkout:

```bash
npm ci
npx vite --host 0.0.0.0
```

Open `http://<computer-LAN-IP>:5173/scroll.html?...` from a device on the same network. Confirm that the device loads the 2,748,631-byte MP4 and that the QA panel says `Scroll QA · local`. Production uses the extensionless `/scroll` route; the local Vite server uses `/scroll.html`. A Cloudflare preview may be substituted only after explicit deployment authorization.

## Device matrix

Run at least three captures per condition:

| Platform | Minimum evidence | Conditions |
|---|---|---|
| Android | Physical model, Android version, Chrome version | Wi-Fi and throttled mobile preload |
| iPhone | Physical model, iOS version, Safari version | Wi-Fi and throttled mobile preload |

Record whether `requestVideoFrameCallback` is supported. `performance.memory` is Chromium-specific and measures JavaScript heap only; an `unsupported` result on Safari is expected and must not be converted into an estimated value.

## Trace sequence

1. Start with cleared site data or `reset-consent=1`. Begin capture before accepting consent so preload timing is included.
2. Accept either valid consent choice. Wait until the video is visible and the loader has closed.
3. Make one slow full forward scrub and one slow full reverse scrub.
4. Make ten short alternating gestures, changing direction within 300 ms, then stop at an intermediate frame for two seconds.
5. Make one fast full forward scrub and immediately reverse to the first frame.
6. Watch for black frames, frozen frames or wrong-direction movement. Press **Marcar negro** at the moment of any black screen; describe other visual anomalies in `qa-notes`.
7. Export the JSON. Repeat twice without reloading, then reload for the next independent capture.
8. For the slow-network condition, throttle only the initial preload. On Android use remote Chrome DevTools network throttling; on iPhone use a documented Network Link Conditioner profile. Record the chosen profile in `qa-network` and do not infer bandwidth from its name alone.

The JSON separates:

- event delivery: `inputHandlerDelayMs`;
- JavaScript scheduling: `inputToRafMs`, `rafIntervalMs` and `longFrames`;
- seek/decode completion: `seekDurationMs` and media event counters;
- compositor-visible video response: `assignmentToVisibleMs` and `inputToVisibleMs`, only when `requestVideoFrameCallback` is available;
- seek cadence: `seekAssignmentIntervalMs`, `seekAssignmentHz` and `seekAssignments`;
- media health: `waiting`, `stalled`, readiness anomalies and `playbackQuality`;
- approximate memory: peak/delta JavaScript heap when the browser exposes it;
- preload: bytes, duration, estimated observed throughput and fallback status.

## Evidence rules and decision gate

Do not label the current scrub mobile-safe until both physical platforms have reproducible captures. Desktop emulation is useful only to verify that the collector works.

A trace is a candidate PASS when it has no black/frozen frames, no post-preload `waiting` or `stalled` events, no stuck direction reversal, and its p95 input-to-visible response remains stable across the three runs. Treat these timing bands as investigation triggers, not synthetic pass claims:

- input handler or input-to-rAF p95 above 33 ms: inspect main-thread scheduling before the media pipeline;
- seek p95 or assignment-to-visible p95 above 100 ms: compare a 720p GOP 4/GOP 6 candidate on the same device and gesture script;
- long rAF intervals above 50 ms in more than 1% of active samples: capture a browser performance trace and isolate scripting/style work;
- increasing JS heap across repeated forward/reverse cycles: repeat with browser memory tooling; the built-in number does not include the decoder's full native allocation.

Only one change should be tested after a bottleneck is isolated. Preserve the current constants and MP4 Blob preload for the baseline capture.

## Collector smoke result

This is a functional collector check, not mobile performance evidence.

| Field | Result |
|---|---|
| Device / browser | Windows 10 desktop, Codex in-app Chromium 151.0.0.0 |
| Viewport | 1280×720, DPR 1.5 |
| Delivery | Local Vite server, loopback, cached 2,748,631-byte MP4 |
| Method | Three keyboard inputs (`forward → reverse → forward`) with 120 ms between direction changes |
| Input handler p95 | 0.4 ms |
| Input → rAF p95 | 17.4 ms |
| Seek p95 | 169.6 ms across 9 assignments |
| Assignment → visible p95 | 124.8 ms using `requestVideoFrameCallback` |
| Input → first visible update p95 | 145.2 ms across 3 inputs |
| rAF interval p95 / long intervals | 19.4 ms / 1 interval above 50 ms out of 59 active samples |
| Media events | 9 `seeking`, 9 `seeked`, 0 `waiting`, 0 `stalled` |
| Frame health | 60 total, 0 dropped, 0 corrupted |
| Direction / visual | 1 rapid reversal detected; 0 manually marked black frames |
| JS heap | 11,513,489 B first; 11,874,973 B peak; +361,484 B delta (6 samples) |
| Preload | 51.3 ms on loopback; not representative of mobile network delivery |

The relatively high desktop seek/visible percentiles demonstrate why a real-device baseline is still required; they do not by themselves identify decode, GPU/compositor scheduling or the MP4 as the cause.
