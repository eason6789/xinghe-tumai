import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const KEYFRAMES = ['/kf1-shutter.jpg', '/kf2-vortex.jpg', '/kf3-flash.jpg', '/kf4-reveal.jpg']

export default function CameraShutter({
  active,
  onComplete,
}: {
  active: boolean
  onComplete: () => void
}) {
  const [phase, setPhase] = useState<'idle' | 'shutter' | 'vortex' | 'flash' | 'reveal'>('idle')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)

  // Preload keyframe images
  useEffect(() => {
    KEYFRAMES.forEach((url) => {
      const img = new Image()
      img.src = url
      imagesRef.current.push(img)
    })
  }, [])

  // Canvas crossfade rendering
  useEffect(() => {
    if (!active || phase === 'idle') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    startTimeRef.current = performance.now()

    const render = (now: number) => {
      const elapsed = now - startTimeRef.current
      const totalDuration = 3400

      if (elapsed > totalDuration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        return
      }

      // Determine which two keyframes to blend
      let kfIndex = 0
      let nextKfIndex = 1
      let blendProgress = 0

      if (elapsed < 900) {
        kfIndex = 0; nextKfIndex = 0; blendProgress = 0
      } else if (elapsed < 2500) {
        kfIndex = 0; nextKfIndex = 1
        blendProgress = (elapsed - 900) / 1600
      } else if (elapsed < 2900) {
        kfIndex = 1; nextKfIndex = 2
        blendProgress = (elapsed - 2500) / 400
      } else {
        kfIndex = 2; nextKfIndex = 3
        blendProgress = (elapsed - 2900) / 500
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw base keyframe
      const baseImg = imagesRef.current[kfIndex]
      if (baseImg && baseImg.complete) {
        drawCover(ctx, baseImg, canvas.width, canvas.height)
      }

      // Blend next keyframe
      if (nextKfIndex !== kfIndex) {
        const nextImg = imagesRef.current[nextKfIndex]
        if (nextImg && nextImg.complete) {
          ctx.globalAlpha = Math.min(1, blendProgress)
          drawCover(ctx, nextImg, canvas.width, canvas.height)
          ctx.globalAlpha = 1
        }
      }

      // Add overlay effects based on phase
      if (elapsed < 900) {
        // Shutter vignette
        const vignetteProgress = elapsed / 900
        const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.height * 0.35 * (1 - vignetteProgress * 0.6),
          canvas.width / 2, canvas.height / 2, canvas.height * 1.2)
        gradient.addColorStop(0, 'transparent')
        gradient.addColorStop(0.5, `rgba(11,13,16,${vignetteProgress * 0.5})`)
        gradient.addColorStop(1, 'rgba(11,13,16,0.95)')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      if (elapsed >= 900 && elapsed < 2500) {
        // Vortex center glow
        const vp = (elapsed - 900) / 1600
        const glow = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 5,
          canvas.width / 2, canvas.height / 2, 60 + vp * 40)
        glow.addColorStop(0, `rgba(184,154,99,${0.6 - vp * 0.5})`)
        glow.addColorStop(1, 'transparent')
        ctx.fillStyle = glow
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      if (elapsed >= 2500 && elapsed < 2900) {
        // Flash overlay
        const fp = (elapsed - 2500) / 400
        const flashAlpha = fp < 0.3 ? fp / 0.3 * 0.9 : (1 - fp) / 0.7 * 0.9
        ctx.fillStyle = `rgba(216,212,200,${flashAlpha})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // "命轨已成" text
        if (fp > 0.1 && fp < 0.6) {
          ctx.fillStyle = `rgba(11,13,16,${0.8 * Math.sin(fp * Math.PI)})`
          ctx.font = 'bold 28px "Noto Serif SC", serif'
          ctx.textAlign = 'center'
          ctx.letterSpacing = '0.4em'
          ctx.fillText('命轨已成', canvas.width / 2, canvas.height / 2)
        }
      }

      if (elapsed >= 2900) {
        // Fade to black
        const rp = (elapsed - 2900) / 500
        ctx.fillStyle = `rgba(11,13,16,${rp})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, phase])

  useEffect(() => {
    if (!active) {
      setPhase('idle')
      return
    }
    const t1 = setTimeout(() => setPhase('shutter'), 50)
    const t2 = setTimeout(() => setPhase('vortex'), 900)
    const t3 = setTimeout(() => setPhase('flash'), 2500)
    const t4 = setTimeout(() => setPhase('reveal'), 2900)
    const t5 = setTimeout(() => onComplete(), 3400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5) }
  }, [active, onComplete])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[100] bg-abyss"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const imgRatio = img.naturalWidth / img.naturalHeight
  const canvasRatio = w / h
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
  if (imgRatio > canvasRatio) {
    sw = img.naturalHeight * canvasRatio
    sx = (img.naturalWidth - sw) / 2
  } else {
    sh = img.naturalWidth / canvasRatio
    sy = (img.naturalHeight - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h)
}
