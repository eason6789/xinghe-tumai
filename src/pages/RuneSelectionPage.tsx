import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import StarBackground from '../components/StarBackground'
import { StarDisk, RuneSymbol, RuneGlow } from '../components/RuneSymbol'
import { RitualButton } from '../components/RitualUI'
import { RUNES } from '../data/runes'

export default function RuneSelectionPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const toggleRune = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 9) {
        next.add(id)
      }
      return next
    })
  }

  // Arrange 20 runes in a circle
  const positions = useMemo(() =>
    RUNES.map((_, i) => {
      const angle = (i / RUNES.length) * Math.PI * 2 - Math.PI / 2
      const radius = 130 + Math.sin(i * 1.7) * 20
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        angle,
      }
    }), []
  )

  const handleConfirm = () => {
    if (selected.size < 5) return
    sessionStorage.setItem('selectedRunes', JSON.stringify([...selected]))
    navigate('/arrange')
  }

  return (
    <div className="relative w-full h-full bg-abyss overflow-hidden">
      <StarBackground density={70} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/lore')}
            className="text-stone/40 hover:text-stone/60 text-sm tracking-[0.15em] cursor-pointer"
          >
            ← 返回
          </button>
          <span className="text-gold/40 text-xs tracking-[0.2em]">选择符文</span>
          <span className="text-stone/40 text-xs">{selected.size}/9</span>
        </div>
      </div>

      {/* Hint */}
      <motion.div
        className="absolute top-16 left-0 right-0 text-center z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-moon/50 text-xs tracking-[0.15em] leading-relaxed">
          「不要思考。」<br />
          <span className="opacity-60">选择最让你产生感应的符。</span>
        </p>
      </motion.div>

      {/* Central star disk */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <StarDisk size={200} />
        <StarDisk size={100} />
      </div>

      {/* Runes arranged in circle */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
        <div className="relative" style={{ width: 340, height: 340 }}>
          {RUNES.map((rune, i) => {
            const pos = positions[i]
            const isSelected = selected.has(rune.id)
            const isHovered = hoveredId === rune.id

            return (
              <motion.div
                key={rune.id}
                className="absolute cursor-pointer"
                style={{
                  left: `calc(50% + ${pos.x}px)`,
                  top: `calc(50% + ${pos.y}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{
                  scale: isSelected ? 1.2 : 1,
                  y: isSelected ? -4 : 0,
                }}
                whileHover={{ scale: 1.1 }}
                onHoverStart={() => setHoveredId(rune.id)}
                onHoverEnd={() => setHoveredId(null)}
                onClick={() => toggleRune(rune.id)}
              >
                <RuneSymbol rune={rune} size={isSelected ? 34 : 30} glowing={isSelected} />
                {(isSelected || isHovered) && (
                  <RuneGlow x={isSelected ? 38 : 32} y={isSelected ? 38 : 32} size={90} />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Selected count & confirm */}
      <AnimatePresence>
        {selected.size >= 5 && (
          <motion.div
            className="absolute bottom-10 left-0 right-0 flex flex-col items-center z-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            <p className="text-gold/50 text-xs tracking-[0.2em] mb-4">
              已感应 {selected.size} 枚符文
            </p>
            <RitualButton variant="primary" onClick={handleConfirm}>
              构筑命轨阵列
            </RitualButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Min hint */}
      {selected.size > 0 && selected.size < 5 && (
        <motion.p
          className="absolute bottom-10 left-0 right-0 text-center text-stone/30 text-xs tracking-[0.15em] z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          至少选择 5 枚符文（还需 {5 - selected.size} 枚）
        </motion.p>
      )}
    </div>
  )
}
