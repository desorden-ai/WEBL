# WEBL / DESORDEN Scroll — media benchmark

Date: 2026-08-18  
Branch: `SOL`  
Source: `SOL_SCROLL_SOURCE_4K.mp4` (2160×3840, 240 frames, 24 fps)  
Runtime asset: `static/cinematic/scroll-bg-720.mp4` (source frames 64–240)

## Decision

Keep the current MP4-only architecture and its complete streaming preload into a Blob.
Do not add R2, a custom Range Worker, an All-Intra runtime asset, or a complete frame sequence at this stage.

The deployed asset is only 2.75 MB and is fully downloaded before interaction starts. Range delivery therefore cannot improve scrub once interaction is enabled. The current GOP 6 already limits the maximum decode lead-in to five frames while retaining substantially better compression than GOP 1 or GOP 2.

## Measured variants

All derived MP4 variants use H.264 High, yuv420p, CRF 20, preset medium, 177 frames and 24 fps. SSIM is measured against the same master frames scaled to each target resolution. Encode times are local wall-clock measurements and are environment-specific.

| Variant | Resolution | GOP | Size | Bitrate | Keyframes | Encode | SSIM | Approx. local seek |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Current runtime, CRF 22 | 720×1280 | 6 | 2,748,631 B | 2,978,415 bps | 30 | n/a | 0.990925 | 78.52 ms |
| CRF 20 | 720×1280 | 1 | 7,798,884 B | 8,458,008 bps | 177 | 2.901 s | 0.989921 | 73.29 ms |
| CRF 20 | 720×1280 | 2 | 6,696,172 B | 7,261,444 bps | 89 | 2.251 s | 0.992934 | 84.20 ms |
| CRF 20 | 720×1280 | 4 | 4,266,258 B | 4,624,672 bps | 45 | 2.467 s | 0.992364 | 77.30 ms |
| CRF 20 | 720×1280 | 6 | 3,473,356 B | 3,764,527 bps | 30 | 2.675 s | 0.992262 | 75.04 ms |
| CRF 20 | 720×1280 | 8 | 3,145,167 B | 3,408,508 bps | 23 | 2.445 s | 0.992163 | 81.10 ms |
| CRF 20 | 1080×1920 | 1 | 14,898,968 B | 16,159,750 bps | 177 | 2.414 s | 0.992175 | 111.68 ms |
| CRF 20 | 1080×1920 | 2 | 12,781,566 B | 13,862,479 bps | 89 | 2.890 s | 0.993969 | 113.14 ms |
| CRF 20 | 1080×1920 | 4 | 8,407,166 B | 9,116,498 bps | 45 | 3.047 s | 0.993306 | 119.73 ms |
| CRF 20 | 1080×1920 | 6 | 6,988,833 B | 7,577,920 bps | 30 | 3.680 s | 0.993202 | 122.90 ms |
| CRF 20 | 1080×1920 | 8 | 6,436,061 B | 6,978,224 bps | 23 | 3.443 s | 0.993133 | 116.38 ms |

The local seek figure is an approximate FFmpeg process wall time averaged over eleven positions. It is useful only as a relative sanity check; it is not a browser or mobile-device latency measurement.

## Frame sequence

| Variant | Frames | Compressed size | Encode | Full decoded RGBA memory |
|---|---:|---:|---:|---:|
| WebP Q82, 720×1280 | 177 | 8,607,604 B | 19.744 s | 652,492,800 B |
| WebP Q82, 1080×1920 | 177 | 15,574,280 B | 37.570 s | 1,468,108,800 B |

A frame implementation would require windowed prefetch and strict ImageBitmap disposal. Loading all frames is rejected for mobile. Even with a small window, it adds request orchestration, fallback logic and cache invalidation without a measured benefit over the current 2.75 MB fully preloaded MP4.

## Cloudflare observations

The current Worker Static Assets response provides `Content-Type`, `ETag`, `CF-Cache-Status` and conditional `304`. Requests with closed, open, suffix and invalid `Range` headers returned the full object with `200`, not `206` or `416`. This is acceptable only because the current frontend intentionally downloads the complete object into a Blob before enabling interaction.

Do not add immutable caching to `scroll-bg-720.mp4` while that stable filename can be overwritten. If the asset grows enough to justify partial delivery, use a fingerprinted filename and test a dedicated R2 candidate Worker with correct `206`, `416`, `Content-Range`, `Content-Length`, `Accept-Ranges`, `HEAD`, ETag and conditional behavior before changing production.

## Component decisions

| Component | Decision | Technical reason |
|---|---|---|
| H.264 All-Intra | DISCARD | 720p rises to 7.80 MB (+184% vs current) for no meaningful local seek win. |
| WebP sequence | DISCARD | 8.61 MB at 720p plus request, decode and memory complexity. |
| Manifest | ADAPT | Useful only if a future fingerprinted multi-asset delivery strategy is adopted. |
| R2 | DISCARD | No benefit while one 2.75 MB file is fully preloaded; it adds storage and operations. |
| Worker Range | DISCARD | Not used by the Blob preload; production support would require a separate validated Worker. |
| Edge Cache | ADOPT | Already active through Worker Static Assets (`CF-Cache-Status: HIT`, ETag/304). |
| deploy.sh | DISCARD | Duplicates the existing GitHub Actions + Wrangler deployment path. |
| optimize.sh | DISCARD | Duplicates Node/workflow orchestration and is less portable. |
| optimize.mjs | ADAPT | Retained as a reproducible benchmark utility with safe defaults and no runtime mutation. |

## Reproduction

```bash
npm run benchmark:scroll -- \
  --source /path/to/SOL_SCROLL_SOURCE_4K.mp4 \
  --output /tmp/webl-scroll-benchmark \
  --include-webp
```
