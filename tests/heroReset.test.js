import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const required = [
  'src/app/HeroExperience.tsx',
  'src/hero/Casa01HeroScene.tsx',
  'src/hero/camera/HeroCamera.tsx',
  'src/hero/camera/heroCameraPresets.ts',
  'src/hero/environment/HeroEnvironment.tsx',
  'src/hero/architecture/Casa01Architecture.tsx',
  'src/hero/lighting/HeroLighting.tsx',
  'src/hero/lighting/HeroAtmosphere.tsx',
];

const forbiddenLegacy = [
  'src/components/Scene.tsx',
  'src/components/Scene3D.tsx',
  'src/components/StudioUI.tsx',
  'src/components/HouseBlockout.tsx',
  'scripts/restoreCasa01Latest.mjs',
];

test('bosque exposes the hero-first runtime boundaries', () => {
  for (const path of required) {
    assert.equal(existsSync(join(root, path)), true, `missing ${path}`);
  }
});

test('bosque does not keep the previous runtime as an active foundation', () => {
  for (const path of forbiddenLegacy) {
    assert.equal(existsSync(join(root, path)), false, `legacy file still present: ${path}`);
  }

  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const scripts = Object.values(pkg.scripts).join(' ');
  assert.equal(scripts.includes('restoreCasa01Latest'), false);
  assert.equal(scripts.includes('generateExteriorGlb'), false);
});
