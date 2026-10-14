import { useEffect, useRef, useState } from 'react'

// Shows a message and a short confetti burst when a week, month or phase is finished.
// If the phone asks for reduced motion, only the message is shown.
export function Celebrations() {
  const [message, setMessage] = useState<string | null>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let timer = 0
    const onCelebrate = (e: Event) => {
      setMessage((e as CustomEvent<string>).detail)
      clearTimeout(timer)
      timer = window.setTimeout(() => setMessage(null), 4000)
      if (canvas.current && !matchMedia('(prefers-reduced-motion: reduce)').matches) burst(canvas.current)
    }
    window.addEventListener('sdej-celebrate', onCelebrate)
    return () => {
      window.removeEventListener('sdej-celebrate', onCelebrate)
      clearTimeout(timer)
    }
  }, [])

  return (
    <>
      <canvas ref={canvas} className="confetti" aria-hidden="true" />
      {message && <div className="toast" role="status">🎉 {message}</div>}
    </>
  )
}

/** About 2.5 seconds of falling paper, drawn on a full-screen canvas. */
function burst(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width = innerWidth
  canvas.height = innerHeight
  const css = getComputedStyle(document.documentElement)
  const colors = ['--accent', '--warn', '--danger', '--text'].map((v) => css.getPropertyValue(v).trim() || '#2dd4bf')
  const pieces = Array.from({ length: 140 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 80,
    y: canvas.height / 3,
    vx: (Math.random() - 0.5) * 12,
    vy: Math.random() * -12 - 4,
    size: 5 + Math.random() * 5,
    spin: Math.random() * Math.PI,
    color: colors[Math.floor(Math.random() * colors.length)],
  }))
  const start = performance.now()

  function frame(now: number) {
    ctx!.clearRect(0, 0, canvas.width, canvas.height)
    for (const p of pieces) {
      p.vy += 0.35 // gravity
      p.vx *= 0.99 // air
      p.x += p.vx
      p.y += p.vy
      p.spin += 0.2
      ctx!.save()
      ctx!.translate(p.x, p.y)
      ctx!.rotate(p.spin)
      ctx!.fillStyle = p.color
      ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
      ctx!.restore()
    }
    if (now - start < 2500) requestAnimationFrame(frame)
    else ctx!.clearRect(0, 0, canvas.width, canvas.height)
  }
  requestAnimationFrame(frame)
}
