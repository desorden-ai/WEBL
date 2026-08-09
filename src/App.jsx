import { useState } from 'react'
import Experience from './components/Experience.jsx'

export default function App() {
  const [started, setStarted] = useState(false)

  return (
    <main className="app-shell">
      {!started && (
        <section className="entry-screen" aria-label="Entrada al proyecto 3D">
          <button className="entry-button" type="button" onClick={() => setStarted(true)}>
            CARGAR PROYECTO
          </button>
        </section>
      )}

      {started && <Experience />}
    </main>
  )
}
