import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chunkRoot = path.join(root, '.studio', 'latest');
const targets = [
  'src/components/house/Casa01Interior.tsx',
  'src/components/house/Casa01Shell.tsx',
  'src/components/ui/Casa01Controls.tsx',
  'src/components/ui/Casa01Header.tsx',
  'src/components/ui/Casa01SpecsModal.tsx',
  'src/utils/textureGenerator.ts',
];

for (const target of targets) {
  const dir = path.join(chunkRoot, target.replaceAll('/', '__'));
  const entries = (await fs.readdir(dir)).filter((name) => name.endsWith('.gz.b64')).sort();
  if (!entries.length) throw new Error(`Missing Studio source chunks for ${target}`);
  const encoded = (await Promise.all(entries.map((name) => fs.readFile(path.join(dir, name), 'utf8')))).join('');
  const bytes = gunzipSync(Buffer.from(encoded, 'base64'));
  const output = path.join(root, target);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, bytes);
}
