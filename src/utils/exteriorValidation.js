export function validateExteriorBounds(measured, expected, tolerance) {
  const checks = {
    width: Math.abs(measured.width - expected.width) <= tolerance.width,
    depth: Math.abs(measured.depth - expected.depth) <= tolerance.depth,
    height: Math.abs(measured.height - expected.height) <= tolerance.height,
    ground: Math.abs(measured.groundY - expected.groundY) <= tolerance.ground,
  }

  return {
    valid: Object.values(checks).every(Boolean),
    checks,
    measured,
    expected,
  }
}

export function formatExteriorValidationError(result) {
  const failed = Object.entries(result.checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name)
    .join(', ')

  return `DESWEB3D GLB contract mismatch: ${failed || 'unknown validation failure'}`
}
