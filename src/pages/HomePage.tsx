import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import StarBackground from '../components/StarBackground'
import { StarDisk, RuneSymbol } from '../components/RuneSymbol'
import { RitualButton } from '../components/RitualUI'
import { AstroRing, ConstellationLines } from '../components/DecorativeElements'
import { RUNES } from '../data/runes'
import { useState } from 'react'

export default function HomePage() {
  const navigate = useNavigate()
  const [dustParticles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 4 + Math.random() * 8,
      size: 1 + Math.random() * 2,
    }))
  )

  return (
    <div className="relative w-full h-full bg-abyss overflow-hidden">
      <StarBackground density={100} />

      {/* Constellation lines background */}
      <ConstellationLines className="opacity-[0.04]" />

      {/* Ambient fog */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1/3"
          style={{ background: 'linear-gradient(to top, rgba(11,13,16,0.9) 0%, transparent 100%)' }}
        />
        <motion.div
          className="absolute top-0 left-0 right-0 h-1/4"
          style={{ background: 'linear-gradient(to bottom, rgba(11,13,16,0.7) 0%, transparent 100%)' }}
        />
      </div>

      {/* Floating rune particles */}
      {RUNES.slice(0, 8).map((rune, i) => (
        <motion.div
          key={rune.id}
          className="absolute"
          style={{
            left: `${10 + (i * 11) % 80}%`,
            top: `${15 + (i * 17) % 60}%`,
            opacity: 0.12,
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, i % 2 === 0 ? 10 : -10, 0],
          }}
          transition={{ duration: 6 + i * 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <RuneSymbol rune={rune} size={28} />
        </motion.div>
      ))}

      {/* Central astronomical rings */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
        <AstroRing size={300} rings={3} />
        <AstroRing size={200} rings={2} />
        <StarDisk size={260} />
        <StarDisk size={160} />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 60, height: 60,
            background: 'radial-gradient(circle, rgba(184,154,99,0.25) 0%, rgba(184,154,99,0.05) 50%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Falling stardust */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        {dustParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`, top: -10,
              width: p.size, height: p.size,
              background: '#D8D4C8',
            }}
            animate={{
              y: ['0vh', '110vh'],
              opacity: [0, 0.8, 0.4, 0],
              x: [0, (Math.random() - 0.5) * 60],
            }}
            transition={{
              duration: p.duration, delay: p.delay,
              repeat: Infinity, ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="text-center"
        >
          {/* Decorative top line */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, rgba(184,154,99,0.3))' }} />
            <motion.div
              className="w-2 h-2 rotate-45"
              style={{ background: 'rgba(184,154,99,0.4)' }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, rgba(184,154,99,0.3))' }} />
          </div>

          <h1
            className="text-5xl font-bold tracking-[0.3em] mb-3"
            style={{
              color: '#D8D4C8',
              textShadow: '0 0 40px rgba(184,154,99,0.3), 0 2px 4px rgba(0,0,0,0.5)',
              fontFamily: '"Noto Serif SC", "STKaiti", serif',
            }}
          >
            星河图脉
          </h1>

          {/* Decorative bottom line */}
          <div className="flex items-center justify-center gap-4 mt-3 mb-4">
            <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, rgba(184,154,99,0.2))' }} />
            <div className="w-1 h-1 rotate-45" style={{ background: 'rgba(184,154,99,0.25)' }} />
            <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, rgba(184,154,99,0.2))' }} />
          </div>

          <motion.p
            className="text-base tracking-[0.2em]"
            style={{ color: '#B89A63', opacity: 0.7 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            「排列你的命运」
          </motion.p>
        </motion.div>

        {/* Main CTA */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.6, ease: 'easeOut' }}
        >
          <RitualButton variant="primary" onClick={() => navigate('/lore')}>
            进入观星仪式
          </RitualButton>
        </motion.div>

        {/* Secondary buttons */}
        <motion.div
          className="mt-8 flex flex-col gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          {['深层梦境', '失落星宫'].map((name) => (
            <RitualButton key={name} variant="secondary" disabled>
              {name} 敬请期待
            </RitualButton>
          ))}
        </motion.div>
      </div>

      {/* Bottom slogan */}
      <motion.p
        className="absolute bottom-8 left-0 right-0 text-center text-xs tracking-[0.2em] z-10"
        style={{ color: '#5E6B6E', opacity: 0.35 }}
        animate={{ opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        命运并非被预言，而是在排列中被重新书写
      </motion.p>
    </div>
  )
}
