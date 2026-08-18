#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const token = process.argv[index];
  if (!token.startsWith('--')) continue;
  const [key, inlineValue] = token.slice(2).split('=', 2);
  const next = process.argv[index + 1];
  const value = inlineValue ?? (next && !next.startsWith('--') ? process.argv[++index] : 'true');
  args.set(key, value);
}

if (!args.has('source')) {
  throw new Error('Missing required --source /path/to/SOL_SCROLL_SOURCE_4K.mp4');
}
const source = resolve(args.get('source'));
const output = resolve(args.get('output') ?? '/tmp/webl-scroll-benchmark');
const sourceFrameStart = Number(args.get('start-frame') ?? 64);
const sourceFrameEnd = Number(args.get('end-frame') ?? 240);
const fps = Number(args.get('fps') ?? 24);
const crf = Number(args.get('crf') ?? 20);
const preset = args.get('preset') ?? 'medium';
const resolutions = (args.get('resolutions') ?? '720x1280,1080x1920').split(',');
const gops = (args.get('gops') ?? '1,2,4,6,8').split(',').map(Number);
const includeWebp = args.get('include-webp') === 'true';

const run = (command, commandArgs, options = {}) => {
  const result = spawnSync(command, commandArgs, { encoding: 'utf8', stdio: options.capture ? 'pipe' : 'inherit' });
  if (result.status !== 0) {
    throw new Error(`${command} failed (${result.status}): ${result.stderr || ''}`.trim());
  }
  return result.stdout?.trim() ?? '';
};

run('ffmpeg', ['-version'], { capture: true });
run('ffprobe', ['-version'], { capture: true });
mkdirSync(output, { recursive: true });

const probeVideo = file => {
  const raw = run('ffprobe', [
    '-v', 'error', '-count_frames', '-select_streams', 'v:0',
    '-show_entries', 'stream=codec_name,width,height,avg_frame_rate,nb_read_frames,bit_rate:format=duration,size,bit_rate',
    '-of', 'json', file,
  ], { capture: true });
  const data = JSON.parse(raw);
  const keyframes = run('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0', '-skip_frame', 'nokey',
    '-show_entries', 'frame=pts_time', '-of', 'csv=p=0', file,
  ], { capture: true }).split('\n').filter(Boolean).length;
  return { ...data.streams[0], ...data.format, keyframes };
};

const rows = [];
for (const resolution of resolutions) {
  const match = /^(\d+)x(\d+)$/.exec(resolution);
  if (!match) throw new Error(`Invalid resolution: ${resolution}`);
  const [, width, height] = match;
  const filter = [
    `trim=start_frame=${sourceFrameStart - 1}:end_frame=${sourceFrameEnd}`,
    `setpts=N/(${fps}*TB)`,
    `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
    `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black`,
  ].join(',');

  for (const gop of gops) {
    const file = join(output, `scroll-${width}x${height}-g${gop}-crf${crf}.mp4`);
    const startedAt = performance.now();
    run('ffmpeg', [
      '-y', '-hide_banner', '-loglevel', 'error', '-i', source,
      '-vf', filter, '-an', '-c:v', 'libx264', '-preset', preset, '-crf', String(crf),
      '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', String(fps),
      '-g', String(gop), '-keyint_min', String(gop), '-sc_threshold', '0',
      '-movflags', '+faststart', file,
    ]);
    rows.push({
      variant: basename(file),
      resolution: `${width}x${height}`,
      gop,
      quality: `CRF ${crf}`,
      encodeSeconds: Number(((performance.now() - startedAt) / 1000).toFixed(3)),
      ...probeVideo(file),
    });
  }

  if (includeWebp) {
    const directory = join(output, `webp-${width}x${height}-q82`);
    mkdirSync(directory, { recursive: true });
    const startedAt = performance.now();
    run('ffmpeg', [
      '-y', '-hide_banner', '-loglevel', 'error', '-i', source,
      '-vf', filter, '-fps_mode', 'passthrough', '-c:v', 'libwebp',
      '-quality', '82', '-compression_level', '6', join(directory, 'frame_%03d.webp'),
    ]);
    const frames = readdirSync(directory).filter(name => name.endsWith('.webp'));
    rows.push({
      variant: basename(directory), resolution: `${width}x${height}`, gop: null,
      quality: 'WebP Q82', encodeSeconds: Number(((performance.now() - startedAt) / 1000).toFixed(3)),
      size: frames.reduce((sum, name) => sum + statSync(join(directory, name)).size, 0),
      nb_read_frames: frames.length, avg_frame_rate: `${fps}/1`, keyframes: frames.length,
    });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  source,
  sourceFrames: { start: sourceFrameStart, end: sourceFrameEnd },
  settings: { fps, crf, preset, resolutions, gops, includeWebp },
  variants: rows,
};
writeFileSync(join(output, 'benchmark.json'), `${JSON.stringify(report, null, 2)}\n`);
console.table(rows.map(row => ({
  variant: row.variant,
  resolution: row.resolution,
  gop: row.gop ?? '-',
  quality: row.quality,
  bytes: Number(row.size),
  frames: Number(row.nb_read_frames),
  fps: row.avg_frame_rate,
  bitrate: Number(row.bit_rate ?? 0),
  keyframes: row.keyframes,
  encodeSeconds: row.encodeSeconds,
})));
console.log(`Report: ${join(output, 'benchmark.json')}`);
