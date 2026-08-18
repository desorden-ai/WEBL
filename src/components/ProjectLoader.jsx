import { useEffect, useMemo, useRef, useState } from 'react'

const LETTERS = ['D', 'E', 'S', 'O', 'R', 'D', 'E', 'N']
const VIDEO_URL = '/cinematic/scroll-bg-720.mp4'
const FINAL_HOLD_MS = 650

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value))

export default function ProjectLoader({ visible, ready, onComplete }) {
  const [progress, setProgress] = useState(0)
  const [videoReady, setVideoReady] = useState(false)
  const [status, setStatus] = useState('PREPARANDO EXPERIENCIA')
  const completeRef = useRef(false)
  const blobUrlRef = useRef(null)
  const onCompleteRef = useRef(onComplete)

  onCompleteRef.current = onComplete

  const letterIndex = Math.min(
    LETTERS.length - 1,
    Math.floor((clamp(progress) / 100) * LETTERS.length),
  )

  const currentLetter = LETTERS[letterIndex]

  const percentLabel = useMemo(() => Math.round(clamp(progress)), [progress])

  useEffect(() => {
    if (!visible) return undefined

    const controller = new AbortController()
    let disposed = false

    const installBlob = async (blob) => {
      if (disposed) return

      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
      }

      const blobUrl = URL.createObjectURL(blob)
      blobUrlRef.current = blobUrl
      window.__DESORDEN_SCROLL_BLOB_URL__ = blobUrl

      const video = document.querySelector('video')
      if (video) {
        video.pause()
        video.src = blobUrl
        video.preload = 'auto'
        video.muted = true
        video.playsInline = true
        video.load()
      }

      window.dispatchEvent(
        new CustomEvent('desorden:video-preloaded', {
          detail: { url: blobUrl, source: VIDEO_URL },
        }),
      )

      setProgress(100)
      setVideoReady(true)
      setStatus('EXPERIENCIA LISTA')
    }

    const preload = async () => {
      try {
        setStatus('DESCARGANDO EXPERIENCIA')

        const response = await fetch(VIDEO_URL, {
          cache: 'force-cache',
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        if (!response.body) {
          const blob = await response.blob()
          await installBlob(blob)
          return
        }

        const total = Number(response.headers.get('content-length'))
        const reader = response.body.getReader()
        const chunks = []
        let loaded = 0

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          if (!value) continue

          chunks.push(value)
          loaded += value.byteLength

          if (Number.isFinite(total) && total > 0) {
            setProgress(clamp((loaded / total) * 100))
          }
        }

        await installBlob(new Blob(chunks, { type: 'video/mp4' }))
      } catch (error) {
        if (error?.name === 'AbortError') return

        console.warn('[DESORDEN] Streaming preload fallback:', error)
        setStatus('PREPARANDO EXPERIENCIA')
        setProgress(100)
        setVideoReady(true)
      }
    }

    preload()

    return () => {
      disposed = true
      controller.abort()
    }
  }, [visible])

  useEffect(() => {
    if (!visible || !ready || !videoReady || completeRef.current) return undefined

    completeRef.current = true
    const timer = window.setTimeout(() => onCompleteRef.current?.(), FINAL_HOLD_MS)

    return () => window.clearTimeout(timer)
  }, [ready, videoReady, visible])

  useEffect(() => {
    const cleanup = () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
        delete window.__DESORDEN_SCROLL_BLOB_URL__
      }
    }

    window.addEventListener('pagehide', cleanup, { once: true })
    return () => window.removeEventListener('pagehide', cleanup)
  }, [])

  return (
    <div
      className={`project-loader${visible ? ' is-visible' : ''}`}
      aria-live="polite"
      aria-hidden={!visible}
    >
      <div className="loader-stage" aria-hidden="true">
        <div className="letter-box" key={letterIndex}>
          <span className="letter-face">{currentLetter}</span>
        </div>
        <div className="letter-reflection">{currentLetter}</div>
      </div>

      <div className="loader-meta">
        <div className="loader-counter">{percentLabel}%</div>
        <div
          className="loader-bar-track"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={percentLabel}
          aria-label={`Carga de la experiencia: ${percentLabel}%`}
        >
          <div
            className="loader-bar-fill"
            style={{ transform: `scaleX(${clamp(progress) / 100})` }}
          />
        </div>
        <p className="loader-status">{status}</p>
      </div>
    </div>
  )
}
