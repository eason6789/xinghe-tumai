import { useEffect, useRef, useCallback } from 'react'

interface Star {
  x: number; y: number; r: number; opacity: number; speed: number; drift: number; phase: number
}

export default function StarBackground({ density = 80 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const nebulaRef = useRef<{ x: number; y: number; r: number; color: string; alpha: number }[]>([])
  const animRef = useRef<number>(0)

  const init = useCallback((width: number, height: number) => {
    const stars: Star[] = []
    for (let i = 0; i < density; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.3 + 0.05,
        drift: Math.random() * 0.5 - 0.25,
        phase: Math.random() * Math.PI * 2,
      })
    }
    starsRef.current = stars

    // Nebula patches - subtle colored glows
    const nebulae: { x: number; y: number; r: number; color: string; alpha: number }[] = []
    for (let i = 0; i < 4; i++) {
      nebulae.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.min(width, height) * (0.2 + Math.random() * 0.35),
        color: i % 2 === 0 ? '184,154,99' : '43,74,70',
        alpha: 0.015 + Math.random() * 0.025,
      })
    }
    nebulaRef.current = nebulae
  }, [density])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      init(canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    let time = 0
    const animate = () => {
      time += 0.005
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw nebula patches
      for (const neb of nebulaRef.current) {
        const gradient = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.r)
        gradient.addColorStop(0, `rgba(${neb.color},${neb.alpha * 1.5})`)
        gradient.addColorStop(0.5, `rgba(${neb.color},${neb.alpha * 0.5})`)
        gradient.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = gradient
        ctx.fillRect(neb.x - neb.r, neb.y - neb.r, neb.r * 2, neb.r * 2)
      }

      // Draw stars
      for (const star of starsRef.current) {
        star.y += star.speed
        star.x += Math.sin(time + star.phase) * star.drift * 0.3
        if (star.y > canvas.height + 5) { star.y = -5; star.x = Math.random() * canvas.width }
        if (star.x > canvas.width + 5) star.x = -5
        if (star.x < -5) star.x = canvas.width + 5

        const twinkle = 0.5 + 0.5 * Math.sin(time * 3 + star.phase)
        const alpha = star.opacity * (0.6 + 0.4 * twinkle)

        // Star glow
        if (star.r > 0.8) {
          const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 4)
          glow.addColorStop(0, `rgba(184,154,99,${alpha * 0.2})`)
          glow.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = glow
          ctx.fillRect(star.x - star.r * 4, star.y - star.r * 4, star.r * 8, star.r * 8)
        }

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(216,212,200,${alpha})`
        ctx.fill()

        // Cross-shaped sparkle for largest stars
        if (star.r > 1.2 && twinkle > 0.85) {
          ctx.strokeStyle = `rgba(216,212,200,${alpha * 0.5})`
          ctx.lineWidth = 0.3
          ctx.beginPath()
          ctx.moveTo(star.x - star.r * 3, star.y)
          ctx.lineTo(star.x + star.r * 3, star.y)
          ctx.moveTo(star.x, star.y - star.r * 3)
          ctx.lineTo(star.x, star.y + star.r * 3)
          ctx.stroke()
        }
      }

      animRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [init])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
}
