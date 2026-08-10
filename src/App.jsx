import { useCallback, useEffect, useState } from 'react'
import Experience from './components/Experience.jsx'
import ProjectLoader from './components/ProjectLoader.jsx'
import ViewerFallback from './components/ViewerFallback.jsx'
import ViewerErrorBoundary from './components/ViewerErrorBoundary.jsx'
import { detectWebGLSupport, reportViewerFailure } from './utils/viewerRuntime.js'

const VIEWER_START_TIMEOUT_MS = 15000

export default function App() {
  const [started, setStarted] = useState(false)
  const [ready, setReady] = useState(false)
  const [failure, setFailure] = useState(null)
  const [session, setSession] = useState(0)

  const failProject = useCallback((code, error) => {
    reportViewerFailure(code, error)
    setFailure(code)
  }, [])

  const startProject = () => {
    setReady(false)
    setFailure(null)
    setStarted(true)

    if (!detectWebGLSupport()) {
      failProject('webgl-unavailable')
    }
  }

  const resetProject = () => {
    setStarted(false)
    setReady(false)
    setFailure(null)
    setSession((value) => value + 1)
  }

  useEffect(() => {
    if (!started || ready || failure) return undefined

    const timeout = window.setTimeout(() => {
      failProject('startup-timeout')
    }, VIEWER_START_TIMEOUT_MS)

    return () => window.clearTimeout(timeout)
  }, [failProject, failure, ready, started])

  return (
    <main className="app-shell">
      {!started && (
        <section className="entry-screen" aria-label="Entrada al proyecto 3D">
          <button className="entry-button" type="button" onClick={startProject}>
            CARGAR PROYECTO
          </button>
        </section>
      )}

      {started && (
        <div className={`experience-shell${ready ? ' is-ready' : ''}`}>
          {failure ? (
            <ViewerFallback reason={failure} onReset={resetProject} />
          ) : (
            <ViewerErrorBoundary
              key={session}
              onError={(error) => failProject('viewer-error', error)}
              onReset={resetProject}
            >
              <Experience
                onReady={() => setReady(true)}
                onFailure={(error) => failProject('context-lost', error)}
              />
            </ViewerErrorBoundary>
          )}
          <ProjectLoader visible={!ready && !failure} />
        </div>
      )}
    </main>
  )
}
