import { motion } from 'framer-motion'
import { type Rune } from '../data/runes'

export function RuneSymbol({ rune, size = 40, glowing = false, className = '' }: {
  rune: Rune
  size?: number
  glowing?: boolean
  className?: string
}) {
  return (
    <motion.svg
      width={size * 2}
      height={size * 2}
      viewBox="-50 -50 100 100"
      className={className}
      animate={glowing ? {
        filter: ['drop-shadow(0 0 4px rgba(184,154,99,0.4))', 'drop-shadow(0 0 12px rgba(184,154,99,0.8))', 'drop-shadow(0 0 4px rgba(184,154,99,0.4))'],
      } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <circle cx="0" cy="0" r="48" fill="none" stroke="rgba(184,154,99,0.15)" strokeWidth="1" />
      <circle cx="0" cy="0" r="42" fill="none" stroke="rgba(184,154,99,0.08)" strokeWidth="0.5" strokeDasharray="4 6" />
      <path
        d={rune.symbol}
        fill="none"
        stroke="#B89A63"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />
      <text
        x="0"
        y="58"
        textAnchor="middle"
        fill="#D8D4C8"
        fontSize="12"
        fontWeight="300"
        letterSpacing="4"
        opacity="0.7"
      >
        {rune.name}
      </text>
    </motion.svg>
  )
}

export function RuneGlow({ x, y, size = 80 }: { x: number; y: number; size?: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none rounded-full"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        background: 'radial-gradient(circle, rgba(184,154,99,0.2) 0%, rgba(184,154,99,0.05) 40%, transparent 70%)',
      }}
      animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.1, 0.9] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export function StarDisk({ size = 200, className = '' }: { size?: number; className?: string }) {
  return (
    <motion.div
      className={`absolute rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, rgba(184,154,99,0.08) 0%, rgba(43,74,70,0.05) 40%, transparent 65%)`,
        border: '1px solid rgba(184,154,99,0.12)',
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
    >
      {/* Inner rings */}
      <div
        className="absolute rounded-full"
        style={{
          width: '70%', height: '70%', top: '15%', left: '15%',
          border: '0.5px solid rgba(184,154,99,0.08)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: '40%', height: '40%', top: '30%', left: '30%',
          border: '0.5px dashed rgba(184,154,99,0.06)',
        }}
      />
    </motion.div>
  )
}
