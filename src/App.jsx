import { useState } from 'react'
import Experience from './components/Experience.jsx'
import ProjectLoader from './components/ProjectLoader.jsx'

export default function App() {
  const [started, setStarted] = useState(false)
  const [ready, setReady] = useState(false)

  return (
    <main className="app-shell">
      {!started && (
        <section className="entry-screen" aria-label="Entrada al proyecto 3D">
          <button
            className="entry-button"
            type="button"
            onClick={() => {
              setReady(false)
              setStarted(true)
            }}
          >
            CARGAR PROYECTO
          </button>
        </section>
      )}

      {started && (
        <div className={`experience-shell${ready ? ' is-ready' : ''}`}>
          <Experience onReady={() => setReady(true)} />
          <ProjectLoader visible={!ready} />
        </div>
      )}
    </main>
  )
}
