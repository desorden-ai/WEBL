import { useProgress } from '@react-three/drei'

export default function ProjectLoader({ visible }) {
  const { active, progress, loaded, total } = useProgress()
  const hasTransfers = total > 0
  const safeProgress = Number.isFinite(progress) ? Math.round(progress) : 0

  return (
    <div className={`project-loader${visible ? ' is-visible' : ''}`} aria-live="polite" aria-hidden={!visible}>
      <div className="project-loader__content">
        <p className="project-loader__label">
          {active ? 'CARGANDO MODELO' : 'PREPARANDO ESCENA'}
        </p>

        {hasTransfers && (
          <>
            <div
              className="project-loader__track"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={safeProgress}
              aria-label="Carga del proyecto 3D"
            >
              <span className="project-loader__bar" style={{ transform: `scaleX(${safeProgress / 100})` }} />
            </div>
            <p className="project-loader__meta">
              {safeProgress}% · {loaded}/{total}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
