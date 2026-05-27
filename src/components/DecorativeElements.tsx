import { motion } from 'framer-motion'

/** Ornamental title frame with top/bottom lines and diamond markers */
export function TitleFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`text-center ${className}`}>
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="h-px flex-1 max-w-16"
          style={{ background: 'linear-gradient(to right, transparent, rgba(184,154,99,0.25))' }} />
        <div className="w-1.5 h-1.5 rotate-45" style={{ background: 'rgba(184,154,99,0.35)' }} />
        <div className="h-px flex-1 max-w-16"
          style={{ background: 'linear-gradient(to left, transparent, rgba(184,154,99,0.25))' }} />
      </div>
      {children}
      <div className="flex items-center justify-center gap-3 mt-3">
        <div className="h-px flex-1 max-w-16"
          style={{ background: 'linear-gradient(to right, transparent, rgba(184,154,99,0.25))' }} />
        <div className="w-1 h-1 rotate-45" style={{ background: 'rgba(184,154,99,0.25)' }} />
        <div className="h-px flex-1 max-w-16"
          style={{ background: 'linear-gradient(to left, transparent, rgba(184,154,99,0.25))' }} />
      </div>
    </div>
  )
}

/** Ornamental section divider */
export function SectionDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex-1 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(184,154,99,0.2))' }} />
      <motion.div
        className="w-1.5 h-1.5 rotate-45 shrink-0"
        style={{ background: 'rgba(184,154,99,0.35)' }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <div className="flex-1 h-px"
        style={{ background: 'linear-gradient(to left, transparent, rgba(184,154,99,0.2))' }} />
    </div>
  )
}

/** Corner decorations for cards and panels */
export function CornerDecorations({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Top-left */}
      <div className="absolute top-0 left-0 w-3 h-3"
        style={{ borderTop: '0.5px solid rgba(184,154,99,0.25)', borderLeft: '0.5px solid rgba(184,154,99,0.25)' }} />
      {/* Top-right */}
      <div className="absolute top-0 right-0 w-3 h-3"
        style={{ borderTop: '0.5px solid rgba(184,154,99,0.25)', borderRight: '0.5px solid rgba(184,154,99,0.25)' }} />
      {/* Bottom-left */}
      <div className="absolute bottom-0 left-0 w-3 h-3"
        style={{ borderBottom: '0.5px solid rgba(184,154,99,0.25)', borderLeft: '0.5px solid rgba(184,154,99,0.25)' }} />
      {/* Bottom-right */}
      <div className="absolute bottom-0 right-0 w-3 h-3"
        style={{ borderBottom: '0.5px solid rgba(184,154,99,0.25)', borderRight: '0.5px solid rgba(184,154,99,0.25)' }} />
    </div>
  )
}

/** Spinning astronomical ring decoration */
export function AstroRing({ size = 200, rings = 2 }: { size?: number; rings?: number }) {
  return (
    <div className="absolute flex items-center justify-center pointer-events-none" style={{ width: size, height: size }}>
      {Array.from({ length: rings }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size * (1 - i * 0.25),
            height: size * (1 - i * 0.25),
            border: `${i === 0 ? '1px' : '0.5px'} solid rgba(184,154,99,${0.12 - i * 0.03})`,
            ...(i === 1 ? { borderStyle: 'dashed' } : {}),
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 80 + i * 40, repeat: Infinity, ease: 'linear' }}
        />
      ))}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.15,
          height: size * 0.15,
          background: 'radial-gradient(circle, rgba(184,154,99,0.2) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

/** Constellation line pattern SVG */
export function ConstellationLines({ className = '' }: { className?: string }) {
  return (
    <svg className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 400 600" preserveAspectRatio="none"
      style={{ opacity: 0.06 }}
    >
      {/* Horizontal constellation */}
      <path d="M50,200 L120,180 L180,220 L250,170 L320,210 L380,190"
        fill="none" stroke="#B89A63" strokeWidth="0.8" />
      <path d="M120,180 L180,220 L250,170" fill="none" stroke="#B89A63" strokeWidth="0.8" />
      {/* Vertical constellation */}
      <path d="M200,100 L180,170 L220,250 L170,330 L210,420 L190,500"
        fill="none" stroke="#B89A63" strokeWidth="0.6" />
      {/* Diagonal */}
      <path d="M100,400 L160,330 L220,350 L280,280 L340,300"
        fill="none" stroke="#B89A63" strokeWidth="0.5" strokeDasharray="3 6" />
      {/* Nodes */}
      {[[50,200],[120,180],[180,220],[250,170],[320,210],[380,190],
        [200,100],[180,170],[220,250],[170,330],[210,420],[190,500],
        [100,400],[160,330],[280,280],[340,300]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.5" fill="#B89A63" opacity="0.6" />
      ))}
    </svg>
  )
}
