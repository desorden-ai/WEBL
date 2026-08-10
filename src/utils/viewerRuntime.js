export function detectWebGLSupport(documentRef = globalThis.document) {
  if (!documentRef?.createElement) return false

  try {
    const canvas = documentRef.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2')
      || canvas.getContext('webgl')
      || canvas.getContext('experimental-webgl'),
    )
  } catch {
    return false
  }
}

export function reportViewerFailure(code, error) {
  const detail = {
    code,
    message: error?.message ?? null,
    timestamp: new Date().toISOString(),
  }

  console.error('DESWEB3D viewer failure', detail, error ?? '')

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('desweb3d:viewer-failure', { detail }))
  }
}
