import { motion } from 'framer-motion'
import type { FC } from 'react'

interface MusicToggleProps {
  playing: boolean
  onClick: () => void
}

export const MusicToggle: FC<MusicToggleProps> = ({ playing, onClick }) => (
  <button
    onClick={onClick}
    className="fixed top-4 right-4 z-[200] w-9 h-9 flex items-center justify-center rounded-full cursor-pointer"
    style={{
      background: 'rgba(11,13,16,0.7)',
      border: '0.5px solid rgba(184,154,99,0.2)',
      backdropFilter: 'blur(8px)',
    }}
    aria-label={playing ? '暂停音乐' : '播放音乐'}
  >
    <motion.svg
      width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke={playing ? '#B89A63' : 'rgba(94,107,110,0.5)'}
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      animate={{ rotate: playing ? 360 : 0 }}
      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
    >
      {/* Music note */}
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
      {/* Mute slash when paused */}
      {!playing && (
        <motion.line x1="3" y1="3" x2="21" y2="21"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.svg>
  </button>
)
