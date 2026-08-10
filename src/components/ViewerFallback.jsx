const COPY = {
  'webgl-unavailable': {
    label: 'VISOR 3D NO DISPONIBLE',
    detail: 'Este navegador no tiene WebGL activo. Activa la aceleración gráfica o abre la web en un navegador actualizado.',
  },
  'startup-timeout': {
    label: 'LA ESCENA TARDA DEMASIADO',
    detail: 'No se ha podido iniciar el modelo 3D. Comprueba la conexión y vuelve a intentarlo.',
  },
  'context-lost': {
    label: 'SE HA INTERRUMPIDO EL VISOR 3D',
    detail: 'El dispositivo ha detenido la aceleración gráfica. Cierra otras aplicaciones y vuelve a intentarlo.',
  },
  'viewer-error': {
    label: 'NO SE HA PODIDO CARGAR EL PROYECTO',
    detail: 'La vista 3D no está disponible en este momento. Puedes volver al inicio y reintentar la carga.',
  },
}

export default function ViewerFallback({ reason = 'viewer-error', onReset }) {
  const content = COPY[reason] ?? COPY['viewer-error']

  return (
    <section className="viewer-error" role="alert">
      <div className="viewer-error__content">
        <img
          className="viewer-error__image"
          src="/fallback/exterior-fallback.svg"
          alt="Vista previa del edificio residencial"
        />
        <p className="viewer-error__label">{content.label}</p>
        <p className="viewer-error__detail">{content.detail}</p>
        <button className="viewer-error__button" type="button" onClick={onReset}>
          VOLVER
        </button>
      </div>
    </section>
  )
}
