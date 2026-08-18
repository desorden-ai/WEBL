import { useState } from 'react'
import Experience from './components/Experience.jsx'
import ProjectLoader from './components/ProjectLoader.jsx'
import StoryOverlays from './components/StoryOverlays.jsx'
import ViewerErrorBoundary from './components/ViewerErrorBoundary.jsx'

export default function App() {
  const [started, setStarted] = useState(false)
  const [experienceReady, setExperienceReady] = useState(false)
  const [loaderFinished, setLoaderFinished] = useState(false)
  const [failed, setFailed] = useState(false)
  const [session, setSession] = useState(0)

  const startProject = () => {
    setExperienceReady(false)
    setLoaderFinished(false)
    setFailed(false)
    setStarted(true)
  }

  const resetProject = () => {
    setStarted(false)
    setExperienceReady(false)
    setLoaderFinished(false)
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
        <div className={`experience-shell${loaderFinished ? ' is-ready' : ''}`}>
          <ViewerErrorBoundary
            key={session}
            onError={() => setFailed(true)}
            onReset={resetProject}
          >
            <Experience onReady={() => setExperienceReady(true)} />
          </ViewerErrorBoundary>

          {loaderFinished && <StoryOverlays />}

          <ProjectLoader
            visible={!loaderFinished && !failed}
            ready={experienceReady}
            onComplete={() => setLoaderFinished(true)}
          />
        </div>
      )}
    </main>
  )
}
