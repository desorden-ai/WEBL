import { useState } from 'react'
import Experience from './components/Experience.jsx'
import ProjectLoader from './components/ProjectLoader.jsx'
import ViewerErrorBoundary from './components/ViewerErrorBoundary.jsx'

export default function App() {
  const [started, setStarted] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [session, setSession] = useState(0)

  const startProject = () => {
    setReady(false)
    setFailed(false)
    setStarted(true)
  }

  const resetProject = () => {
    setStarted(false)
    setReady(false)
    setFailed(false)
    setSession((value) => value + 1)
  }

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
          <ViewerErrorBoundary
            key={session}
            onError={() => setFailed(true)}
            onReset={resetProject}
          >
            <Experience onReady={() => setReady(true)} />
          </ViewerErrorBoundary>
          <ProjectLoader visible={!ready && !failed} />
        </div>
      )}
    </main>
  )
}
