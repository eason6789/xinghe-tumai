import { useState, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import StarBackground from '../components/StarBackground'
import { RuneSymbol, RuneGlow } from '../components/RuneSymbol'
import CameraShutter from '../components/CameraShutter'
import { RitualButton } from '../components/RitualUI'
import { RUNES, getStarPattern, type Rune } from '../data/runes'

interface PlacedRune {
  rune: Rune
  x: number
  y: number
  rotation: number
}

export default function ArrangementPage() {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const [placedRunes, setPlacedRunes] = useState<PlacedRune[]>(() => {
    const ids: number[] = JSON.parse(sessionStorage.getItem('selectedRunes') || '[]')
    const selectedRunes = ids.map((id) => RUNES.find((r) => r.id === id)!).filter(Boolean)
    return selectedRunes.map((rune, i) => ({
      rune,
      x: 40 + (i % 4) * 15,
      y: 25 + Math.floor(i / 4) * 20,
      rotation: Math.random() * 60 - 30,
    }))
  })

  const [dragging, setDragging] = useState<number | null>(null)
  const [rotating, setRotating] = useState<number | null>(null)
  const [shutterActive, setShutterActive] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const rotateRef = useRef<{ startAngle: number; origRotation: number } | null>(null)

  const pattern = useMemo(() => getStarPattern(), [])

  const getPosFromEvent = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    }
  }, [])

  const handleDragStart = (index: number, e: React.TouchEvent | React.MouseEvent) => {
    const pos = getPosFromEvent(e)
    dragRef.current = { startX: pos.x, startY: pos.y, origX: placedRunes[index].x, origY: placedRunes[index].y }
    setDragging(index)
  }

  const handleDragMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (dragging === null || !dragRef.current) return
    const pos = getPosFromEvent(e)
    const dx = pos.x - dragRef.current.startX
    const dy = pos.y - dragRef.current.startY
    setPlacedRunes((prev) => {
      const next = [...prev]
      next[dragging] = {
        ...next[dragging],
        x: Math.max(5, Math.min(95, dragRef.current!.origX + dx)),
        y: Math.max(5, Math.min(90, dragRef.current!.origY + dy)),
      }
      return next
    })
  }, [dragging, getPosFromEvent])

  const handleDragEnd = () => setDragging(null)

  const handleRotateStart = (index: number, e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation()
    const pos = getPosFromEvent(e)
    const rune = placedRunes[index]
    const angle = Math.atan2(pos.y - rune.y, pos.x - rune.x) * (180 / Math.PI)
    rotateRef.current = { startAngle: angle, origRotation: rune.rotation }
    setRotating(index)
  }

  const handleRotateMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (rotating === null || !rotateRef.current) return
    const pos = getPosFromEvent(e)
    const rune = placedRunes[rotating]
    const angle = Math.atan2(pos.y - rune.y, pos.x - rune.x) * (180 / Math.PI)
    const delta = angle - rotateRef.current.startAngle
    setPlacedRunes((prev) => {
      const next = [...prev]
      next[rotating] = { ...next[rotating], rotation: rotateRef.current!.origRotation + delta }
      return next
    })
  }, [rotating, getPosFromEvent, placedRunes])

  const handleRotateEnd = () => setRotating(null)

  const handleConfirm = () => {
    sessionStorage.setItem('placedRunes', JSON.stringify(placedRunes.map((p) => ({
      runeId: p.rune.id,
      x: p.x,
      y: p.y,
      rotation: p.rotation,
    }))))
    setShutterActive(true)
  }

  const handleShutterComplete = () => {
    navigate('/interpret')
  }

  // Star pattern decorations
  const patternElements = useMemo(() => {
    switch (pattern) {
      case 'spiral':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 400 400">
            <path d="M200,200 Q220,180 240,190 Q260,200 240,220 Q220,240 190,230 Q160,220 155,190 Q150,160 175,140 Q200,120 240,130 Q280,140 285,180 Q290,220 260,250 Q230,280 190,275" fill="none" stroke="#B89A63" strokeWidth="1" />
          </svg>
        )
      case 'ring':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="120" fill="none" stroke="#B89A63" strokeWidth="1" strokeDasharray="3 8" />
            <circle cx="200" cy="200" r="80" fill="none" stroke="#B89A63" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="40" fill="none" stroke="#B89A63" strokeWidth="0.5" strokeDasharray="2 6" />
          </svg>
        )
      case 'river':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 400 400">
            <path d="M50,200 Q100,150 150,200 Q200,250 250,200 Q300,150 350,200" fill="none" stroke="#B89A63" strokeWidth="1.5" />
            <path d="M50,220 Q100,170 150,220 Q200,270 250,220 Q300,170 350,220" fill="none" stroke="#B89A63" strokeWidth="0.5" strokeDasharray="2 4" />
          </svg>
        )
      case 'fracture':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 400 400">
            <path d="M100,100 L180,200 L150,300" fill="none" stroke="#B89A63" strokeWidth="1" />
            <path d="M300,80 L220,200 L280,320" fill="none" stroke="#B89A63" strokeWidth="1" />
            <path d="M200,60 L200,340" fill="none" stroke="#B89A63" strokeWidth="0.5" strokeDasharray="2 6" />
          </svg>
        )
      case 'array':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 400 400">
            <path d="M80,120 L320,120 L320,280 L80,280z" fill="none" stroke="#B89A63" strokeWidth="1" />
            <path d="M200,40 L200,360" fill="none" stroke="#B89A63" strokeWidth="0.5" />
            <path d="M40,200 L360,200" fill="none" stroke="#B89A63" strokeWidth="0.5" />
          </svg>
        )
    }
  }, [pattern])

  return (
    <div className="relative w-full h-full bg-abyss overflow-hidden">
      <StarBackground density={50} />

      {/* Star pattern background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {patternElements}
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/select')}
            className="text-stone/40 hover:text-stone/60 text-sm tracking-[0.15em] cursor-pointer"
          >
            ← 返回
          </button>
          <span className="text-gold/40 text-xs tracking-[0.2em]">排布命轨</span>
          <span className="text-stone/30 text-xs">{placedRunes.length} 枚符文</span>
        </div>
      </div>

      {/* Guidance - dismissible */}
      <motion.div
        className="absolute top-14 left-0 right-0 z-20 flex justify-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div
          className="mx-4 px-5 py-3 rounded-sm cursor-pointer"
          style={{
            background: 'rgba(11,13,16,0.85)',
            border: '0.5px solid rgba(184,154,99,0.15)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={(e) => {
            const el = e.currentTarget
            el.style.opacity = '0'
            el.style.transition = 'opacity 0.5s'
            setTimeout(() => el.remove(), 500)
          }}
        >
          <div className="flex flex-col gap-1.5 text-center">
            <p className="text-moon/60 text-xs tracking-[0.12em] leading-relaxed font-serif">
              拖拽符文<span className="text-gold/50">自由摆放</span> · 拖拽角落<span className="text-gold/50">旋转方向</span>
            </p>
            <p className="text-stone/30 text-[10px] tracking-[0.1em] font-serif">
              中心为命轨核心 · 底部为深渊潜意识区 · 随心排列即可
            </p>
          </div>
        </div>
      </motion.div>

      {/* Hint */}
      <div className="absolute top-32 left-0 right-0 text-center z-20">
        <motion.p
          className="text-moon/50 text-xs tracking-[0.15em]"
          animate={{ opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          倾听你的直觉，而非逻辑
        </motion.p>
      </div>

      {/* Central subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div
          className="rounded-full"
          style={{
            width: 120,
            height: 120,
            background: 'radial-gradient(circle, rgba(184,154,99,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Arrangement area */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-10"
        onTouchMove={(e) => { handleDragMove(e); handleRotateMove(e) }}
        onMouseMove={(e) => { handleDragMove(e); handleRotateMove(e) }}
        onTouchEnd={() => { handleDragEnd(); handleRotateEnd() }}
        onMouseUp={() => { handleDragEnd(); handleRotateEnd() }}
        onTouchCancel={() => { handleDragEnd(); handleRotateEnd() }}
        style={{ touchAction: 'none' }}
      >
        {/* Drop zone indicator */}
        <div className="absolute top-[85%] left-1/2 -translate-x-1/2 pointer-events-none">
          <div
            className="rounded-full"
            style={{
              width: 80,
              height: 40,
              border: '0.5px dashed rgba(184,154,99,0.15)',
              borderRadius: '40px',
            }}
          />
          <p className="text-center text-stone/30 text-[10px] tracking-[0.2em] mt-1">深渊区</p>
        </div>

        {placedRunes.map((placed, index) => (
          <motion.div
            key={placed.rune.id}
            className="absolute cursor-grab active:cursor-grabbing"
            style={{
              left: `${placed.x}%`,
              top: `${placed.y}%`,
              transform: `translate(-50%, -50%) rotate(${placed.rotation}deg)`,
              zIndex: dragging === index ? 30 : 10,
            }}
            onTouchStart={(e) => handleDragStart(index, e)}
            onMouseDown={(e) => handleDragStart(index, e)}
          >
            <RuneSymbol rune={placed.rune} size={36} glowing />
            <RuneGlow x={40} y={40} size={80} />

            {/* Rotation handle */}
            <div
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: 'rgba(184,154,99,0.1)', border: '0.5px solid rgba(184,154,99,0.3)' }}
              onTouchStart={(e) => handleRotateStart(index, e)}
              onMouseDown={(e) => handleRotateStart(index, e)}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B89A63" strokeWidth="1.5">
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Confirm button */}
      <motion.div
        className="absolute bottom-8 left-0 right-0 flex justify-center z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <RitualButton variant="primary" onClick={handleConfirm}>
          解读命轨
        </RitualButton>
      </motion.div>

      {/* Camera shutter transition */}
      <CameraShutter active={shutterActive} onComplete={handleShutterComplete} />
    </div>
  )
}
