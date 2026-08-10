import assert from 'node:assert/strict'
import test from 'node:test'

import { detectWebGLSupport } from '../src/utils/viewerRuntime.js'

test('detects an available WebGL2 context', () => {
  const documentRef = {
    createElement: () => ({
      getContext: (type) => (type === 'webgl2' ? {} : null),
    }),
  }

  assert.equal(detectWebGLSupport(documentRef), true)
})

test('rejects a browser without a WebGL context', () => {
  const documentRef = {
    createElement: () => ({ getContext: () => null }),
  }

  assert.equal(detectWebGLSupport(documentRef), false)
})

test('fails safely when context creation throws', () => {
  const documentRef = {
    createElement: () => ({
      getContext: () => {
        throw new Error('context blocked')
      },
    }),
  }

  assert.equal(detectWebGLSupport(documentRef), false)
})
