import { access, mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const rawDir = path.join(root, 'src', 'assets', 'raw');
const outputDir = path.join(root, 'public', 'models');
const outputModel = path.join(outputDir, 'mansion.glb');
const manifestFile = path.join(root, 'public', '3d-manifest.json');
const force = process.argv.includes('--force');

const manifest = (enabled) => ({
  enabled,
  model: 'models/mansion.glb',
  decoderPath: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/',
  generatedAt: new Date().toISOString(),
});

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function writeManifest(enabled) {
  await writeFile(manifestFile, `${JSON.stringify(manifest(enabled), null, 2)}\n`, 'utf8');
}

async function findSourceModel() {
  let entries;
  try {
    entries = await readdir(rawDir, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === 'ENOENT') return null;
    throw error;
  }

  const glbs = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.glb'))
    .map((entry) => entry.name)
    .sort();

  if (!glbs.length) return null;
  if (glbs.includes('mansion.glb')) return path.join(rawDir, 'mansion.glb');
  if (glbs.length === 1) return path.join(rawDir, glbs[0]);

  throw new Error(
    `Hay ${glbs.length} GLB en src/assets/raw y ninguno se llama mansion.glb. Renombra el modelo canónico a mansion.glb para evitar una selección ambigua.`
  );
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const sourceModel = await findSourceModel();
  if (!sourceModel) {
    const hasOptimizedModel = await exists(outputModel);
    await writeManifest(hasOptimizedModel);
    console.log(
      hasOptimizedModel
        ? '[3D] No hay GLB fuente; se reutiliza public/models/mansion.glb existente.'
        : '[3D] No hay GLB fuente. Runtime 3D progresivo desactivado; build cinematográfico continúa.'
    );
    return;
  }

  const outputExists = await exists(outputModel);
  let needsBuild = force || !outputExists;

  if (!needsBuild) {
    const [sourceStats, outputStats] = await Promise.all([stat(sourceModel), stat(outputModel)]);
    needsBuild = sourceStats.mtimeMs > outputStats.mtimeMs;
  }

  if (needsBuild) {
    console.log(`[3D] Optimizando ${path.relative(root, sourceModel)} → public/models/mansion.glb`);
    const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const result = spawnSync(
      command,
      [
        '--yes',
        '@gltf-transform/cli@4.4.2',
        'optimize',
        sourceModel,
        outputModel,
        '--compress',
        'draco',
        '--texture-compress',
        'webp',
      ],
      { stdio: 'inherit' }
    );

    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(`glTF Transform terminó con código ${result.status ?? 'desconocido'}.`);
    }
  } else {
    console.log('[3D] mansion.glb optimizado ya está actualizado; se omite recompresión.');
  }

  await writeManifest(true);
  console.log('[3D] Runtime progresivo habilitado en 3d-manifest.json.');
}

main().catch(async (error) => {
  console.error('[3D] Error en pipeline de modelos:', error);
  try {
    await writeManifest(false);
  } catch {
    // Preserve the original failure.
  }
  process.exitCode = 1;
});
