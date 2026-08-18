import { useState } from 'react'
import Experience from './components/Experience.jsx'
import ProjectLoader from './components/ProjectLoader.jsx'
import StoryOverlays from './components/StoryOverlays.jsx'
import ViewerErrorBoundary from './components/ViewerErrorBoundary.jsx'

export default function App() {
  const [experienceReady, setExperienceReady] = useState(false)
  const [loaderFinished, setLoaderFinished] = useState(false)
  const [failed, setFailed] = useState(false)
  const [session, setSession] = useState(0)

  const resetProject = () => {
    setExperienceReady(false)
    setLoaderFinished(false)
    setFailed(false)
    setSession((value) => value + 1)
  }

  return (
    <main className="app-shell">
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
    </main>
  )
}
