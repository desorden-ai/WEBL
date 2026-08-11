import assert from 'node:assert/strict'
import test from 'node:test'

import { PROJECT } from '../src/config/project.js'
import {
  formatExteriorValidationError,
  validateExteriorBounds,
} from '../src/utils/exteriorValidation.js'

const expected = {
  width: 10.8,
  depth: 9.6,
  height: 6.9,
  groundY: 0,
}

const tolerance = {
  width: 0.25,
  depth: 0.25,
  height: 0.25,
  ground: 0.05,
}

test('keeps the exterior GLB disabled until explicit visual approval', () => {
  assert.equal(PROJECT.runtime.useApprovedExteriorModel, false)
})

test('accepts an exterior that matches the canonical envelope', () => {
  const result = validateExteriorBounds(expected, expected, tolerance)

  assert.equal(result.valid, true)
  assert.deepEqual(result.checks, {
    width: true,
    depth: true,
    height: true,
    ground: true,
  })
})

test('accepts measurements exactly on every tolerance boundary', () => {
  const measured = {
    width: expected.width + tolerance.width,
    depth: expected.depth - tolerance.depth,
    height: expected.height + tolerance.height,
    groundY: expected.groundY - tolerance.ground,
  }

  assert.equal(validateExteriorBounds(measured, expected, tolerance).valid, true)
})

test('rejects an exterior outside the dimensional tolerance', () => {
  const measured = {
    ...expected,
    width: expected.width + tolerance.width + 0.01,
  }
  const result = validateExteriorBounds(measured, expected, tolerance)

  assert.equal(result.valid, false)
  assert.equal(result.checks.width, false)
  assert.match(formatExteriorValidationError(result), /width/)
})

test('rejects a model whose base is below the ground tolerance', () => {
  const measured = {
    ...expected,
    groundY: expected.groundY - tolerance.ground - 0.01,
  }
  const result = validateExteriorBounds(measured, expected, tolerance)

  assert.equal(result.valid, false)
  assert.equal(result.checks.ground, false)
  assert.match(formatExteriorValidationError(result), /ground/)
})
