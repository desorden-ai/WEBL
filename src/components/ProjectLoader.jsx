import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'

const LETTERS = ['D', 'E', 'S', 'O', 'R', 'D', 'E', 'N']
const STEP = 100 / LETTERS.length
const MIN_VISUAL_MS = 1600
const FINAL_HOLD_MS = 260

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value))

export default function ProjectLoader({ visible, ready, onComplete }) {
  const { progress, total } = useProgress()
  const [displayProgress, setDisplayProgress] = useState(0)
  const realProgressRef = useRef(0)
  const readyRef = useRef(false)
  const completeRef = useRef(false)
  const onCompleteRef = useRef(onComplete)

  onCompleteRef.current = onComplete
  readyRef.current = ready
  realProgressRef.current = ready
    ? 100
    : total > 0 && Number.isFinite(progress)
      ? clamp(progress)
      : 0

  useEffect(() => {
    if (!visible) {
      setDisplayProgress(0)
      completeRef.current = false
      return undefined
    }

    const startedAt = performance.now()
    let frameId = 0
    let holdTimer = 0

    const tick = (now) => {
      const timeCap = clamp(((now - startedAt) / MIN_VISUAL_MS) * 100)
      const allowedProgress = Math.min(realProgressRef.current, timeCap)

      setDisplayProgress((current) => {
        const gap = allowedProgress - current
        if (gap <= 0) return current
        if (gap < 0.12) return allowedProgress
        return Math.min(allowedProgress, current + Math.max(0.35, gap * 0.22))
      })

      if (
        readyRef.current
        && realProgressRef.current >= 100
        && timeCap >= 100
        && !completeRef.current
      ) {
        completeRef.current = true
        setDisplayProgress(100)
        holdTimer = window.setTimeout(() => onCompleteRef.current?.(), FINAL_HOLD_MS)
        return
      }

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frameId)
      if (holdTimer) window.clearTimeout(holdTimer)
    }
  }, [visible])

  const letterIndex = Math.min(LETTERS.length - 1, Math.floor(displayProgress / STEP))
  const letter = LETTERS[letterIndex]
  const roundedProgress = Math.round(displayProgress)

  return (
    <div
      className={`project-loader${visible ? ' is-visible' : ''}`}
      aria-live="polite"
      aria-hidden={!visible}
    >
      <div
        className="project-loader__letter"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={roundedProgress}
        aria-label={`Carga de la experiencia: ${roundedProgress}%`}
      >
        {letter}
      </div>
    </div>
  )
}
