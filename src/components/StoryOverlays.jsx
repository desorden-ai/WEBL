import { useEffect, useRef } from 'react'

const clamp01 = (value) => Math.min(1, Math.max(0, value))

const STORIES = [
  {
    start: 0.05,
    end: 0.25,
    tag: 'DESORDEN STUDIO',
    title: 'Impacto visual directo al grano.',
    body: 'Historias diseñadas para atrapar en los primeros segundos.',
    align: 'left',
  },
  {
    start: 0.3,
    end: 0.55,
    tag: 'PRODUCCIÓN',
    title: 'Cinematografía vertical & ritmo milimétrico.',
    body: 'Cada frame cuenta, cada transición tiene un porqué.',
    align: 'right',
  },
  {
    start: 0.6,
    end: 0.85,
    tag: 'IDENTIDAD',
    title: 'Rompe el feed. Destaca del resto.',
    body: 'Contenido premium creado para generar retención y marca.',
    align: 'left',
  },
]

export default function StoryOverlays() {
  const refs = useRef([])

  useEffect(() => {
    const setProgress = (value) => {
      const globalProgress = clamp01(Number(value) || 0)

      refs.current.forEach((card, index) => {
        if (!card) return

        const story = STORIES[index]
        const local = (globalProgress - story.start) / (story.end - story.start)
        const edge = 0.23
        const enter = clamp01(local / edge)
        const exit = clamp01((1 - local) / edge)
        const intensity = Math.min(enter, exit)

        const opacity = intensity
        const y = (1 - intensity) * 44
        const blur = (1 - intensity) * 10
        const scale = 0.97 + intensity * 0.03

        card.style.setProperty('--story-opacity', opacity.toFixed(3))
        card.style.setProperty('--story-y', `${y.toFixed(2)}px`)
        card.style.setProperty('--story-blur', `${blur.toFixed(2)}px`)
        card.style.setProperty('--story-scale', scale.toFixed(4))
      })
    }

    const handleCustomProgress = (event) => setProgress(event.detail?.progress)

    let raf = 0
    const handleScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight
        if (maxScroll > 0) setProgress(window.scrollY / maxScroll)
      })
    }

    window.DESORDEN_STORY = { setProgress }
    window.addEventListener('desorden:scroll-progress', handleCustomProgress)
    window.addEventListener('scroll', handleScroll, { passive: true })
    setProgress(0)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('desorden:scroll-progress', handleCustomProgress)
      window.removeEventListener('scroll', handleScroll)
      if (window.DESORDEN_STORY?.setProgress === setProgress) {
        delete window.DESORDEN_STORY
      }
    }
  }, [])

  return (
    <div className="story-overlays" aria-hidden="true">
      {STORIES.map((story, index) => (
        <article
          key={story.tag}
          ref={(node) => { refs.current[index] = node }}
          className={`story-card${story.align === 'right' ? ' story-card--right' : ''}`}
          data-start={story.start}
          data-end={story.end}
        >
          <span className="tag">{story.tag}</span>
          <h2>{story.title}</h2>
          <p>{story.body}</p>
        </article>
      ))}
    </div>
  )
}
