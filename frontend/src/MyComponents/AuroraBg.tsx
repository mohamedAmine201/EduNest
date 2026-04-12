// AuroraBg.tsx
import { useEffect, useRef } from 'react'

const lightBlobs = [
  { x: 0.15, y: 0.3,  r: 0.38, hue: 255, sat: 60, light: 65 },
  { x: 0.7,  y: 0.2,  r: 0.32, hue: 46,  sat: 75, light: 60 },
  { x: 0.5,  y: 0.75, r: 0.42, hue: 240, sat: 55, light: 72 },
  { x: 0.85, y: 0.6,  r: 0.28, hue: 55,  sat: 65, light: 68 },
]

const darkBlobs = [
  { x: 0.15, y: 0.3,  r: 0.40, hue: 46,  sat: 80, light: 55 }, // amber glow
  { x: 0.7,  y: 0.2,  r: 0.35, hue: 240, sat: 60, light: 35 }, // deep indigo
  { x: 0.5,  y: 0.75, r: 0.45, hue: 50,  sat: 70, light: 45 }, // warm gold
  { x: 0.85, y: 0.6,  r: 0.30, hue: 260, sat: 55, light: 40 }, // muted violet
]

const AuroraBg = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const speeds = lightBlobs.map(() => ({
      dx: (Math.random() - 0.5) * 0.0003,
      dy: (Math.random() - 0.5) * 0.0003,
    }))

    // positions are shared/mutable across theme switches
    const positions = lightBlobs.map(b => ({ x: b.x, y: b.y }))

    let rafId: number
    const draw = (t: number) => {
      const { width: w, height: h } = canvas
      const isDark = document.documentElement.classList.contains('dark')
      const blobs = isDark ? darkBlobs : lightBlobs
      const opacity = isDark ? 0.45 : 0.50

      ctx.clearRect(0, 0, w, h)

      blobs.forEach((b, i) => {
        positions[i].x += speeds[i].dx
        positions[i].y += speeds[i].dy
        if (positions[i].x < 0 || positions[i].x > 1) speeds[i].dx *= -1
        if (positions[i].y < 0 || positions[i].y > 1) speeds[i].dy *= -1

        const pulse = Math.sin(t * 0.0008 + i * 1.2) * 0.04
        const grad = ctx.createRadialGradient(
          positions[i].x * w, positions[i].y * h, 0,
          positions[i].x * w, positions[i].y * h, (b.r + pulse) * Math.max(w, h)
        )
        grad.addColorStop(0, `hsla(${b.hue}, ${b.sat}%, ${b.light}%, ${opacity})`)
        grad.addColorStop(1, `hsla(${b.hue}, ${b.sat}%, ${b.light}%, 0)`)
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      })

      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}

export default AuroraBg