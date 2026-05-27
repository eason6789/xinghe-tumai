import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface RitualInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'date'
  className?: string
}

export function RitualInput({ value, onChange, placeholder, type = 'text', className = '' }: RitualInputProps) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const baseStyles: React.CSSProperties = {
    width: '100%',
    background: 'linear-gradient(180deg, rgba(11,13,16,0.9) 0%, rgba(20,18,14,0.8) 100%)',
    border: focused
      ? '0.5px solid rgba(184,154,99,0.5)'
      : '0.5px solid rgba(184,154,99,0.15)',
    borderRadius: 2,
    padding: '14px 16px',
    color: value ? '#D8D4C8' : undefined,
    fontSize: '14px',
    letterSpacing: '0.1em',
    outline: 'none',
    transition: 'all 0.6s ease',
    boxShadow: focused
      ? '0 0 0 1px rgba(184,154,99,0.1), inset 0 0 20px rgba(184,154,99,0.04)'
      : 'inset 0 1px 3px rgba(0,0,0,0.3)',
    fontFamily: '"Noto Serif SC", "STKaiti", serif',
  }

  return (
    <div className={`relative ${className}`}>
      {/* Top carved line */}
      <motion.div
        className="absolute top-0 left-3 right-3 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(184,154,99,0.15), transparent)' }}
        animate={{ opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />
      {/* Bottom carved line */}
      <motion.div
        className="absolute bottom-0 left-3 right-3 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(184,154,99,0.1), transparent)' }}
      />

      {/* Corner decorations */}
      <motion.div
        className="absolute top-1 left-1 w-2 h-2 pointer-events-none"
        style={{
          borderTop: '0.5px solid rgba(184,154,99,0.2)',
          borderLeft: '0.5px solid rgba(184,154,99,0.2)',
        }}
        animate={{ opacity: focused ? 1 : 0.3 }}
        transition={{ duration: 0.8 }}
      />
      <motion.div
        className="absolute bottom-1 right-1 w-2 h-2 pointer-events-none"
        style={{
          borderBottom: '0.5px solid rgba(184,154,99,0.2)',
          borderRight: '0.5px solid rgba(184,154,99,0.2)',
        }}
        animate={{ opacity: focused ? 1 : 0.3 }}
        transition={{ duration: 0.8 }}
      />

      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={baseStyles}
        className="placeholder:text-stone/35"
      />

      {/* Focus glow */}
      <motion.div
        className="absolute inset-0 rounded-[2px] pointer-events-none"
        style={{
          boxShadow: '0 0 30px rgba(184,154,99,0.08)',
          opacity: 0,
        }}
        animate={{ opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      />
    </div>
  )
}

interface RitualSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
}

export function RitualSelect({ value, onChange, options, placeholder, className = '' }: RitualSelectProps) {
  const [open, setOpen] = useState(false)

  const triggerStyles: React.CSSProperties = {
    width: '100%',
    background: 'linear-gradient(180deg, rgba(11,13,16,0.9) 0%, rgba(20,18,14,0.8) 100%)',
    border: open
      ? '0.5px solid rgba(184,154,99,0.5)'
      : '0.5px solid rgba(184,154,99,0.15)',
    borderRadius: 2,
    padding: '14px 16px',
    color: value ? '#D8D4C8' : undefined,
    fontSize: '14px',
    letterSpacing: '0.1em',
    outline: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.5s ease',
    fontFamily: '"Noto Serif SC", "STKaiti", serif',
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        style={triggerStyles}
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
      >
        <span className={value ? 'text-moon/80' : 'text-stone/35'}>
          {value || placeholder}
        </span>
        <motion.svg
          width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="rgba(184,154,99,0.4)" strokeWidth="1.5"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </button>

      <motion.div
        className="absolute left-0 right-0 z-40 overflow-hidden"
        style={{
          top: '100%',
          marginTop: 4,
          background: 'linear-gradient(180deg, rgba(15,14,12,0.98) 0%, rgba(11,13,16,0.98) 100%)',
          border: '0.5px solid rgba(184,154,99,0.2)',
          borderRadius: 2,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className="w-full text-left px-4 py-3 text-sm tracking-[0.1em] transition-colors cursor-pointer hover:bg-gold/5"
            style={{
              color: value === opt.value ? '#B89A63' : 'rgba(216,212,200,0.6)',
              borderBottom: '0.5px solid rgba(184,154,99,0.06)',
              fontFamily: '"Noto Serif SC", "STKaiti", serif',
            }}
            onClick={() => {
              onChange(opt.value)
              setOpen(false)
            }}
          >
            {opt.label}
            {value === opt.value && (
              <span className="float-right text-gold/40 text-xs">◆</span>
            )}
          </button>
        ))}
      </motion.div>
    </div>
  )
}

interface RitualButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
}

export function RitualButton({ children, onClick, variant = 'primary', disabled, className = '', type = 'button' }: RitualButtonProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      border: disabled ? '0.5px solid rgba(94,107,110,0.2)' : '0.5px solid rgba(184,154,99,0.3)',
      color: disabled ? '#5E6B6E' : '#D8D4C8',
      background: disabled ? 'transparent' : 'rgba(184,154,99,0.06)',
      padding: '14px 40px',
      borderRadius: 9999,
      fontSize: '16px',
      letterSpacing: '0.1em',
      fontFamily: '"Noto Serif SC", "STKaiti", serif',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      fontWeight: 400,
    },
    secondary: {
      border: '0.5px solid rgba(184,154,99,0.2)',
      color: 'rgba(184,154,99,0.7)',
      background: 'transparent',
      padding: '10px 32px',
      borderRadius: 9999,
      fontSize: '13px',
      letterSpacing: '0.08em',
      fontFamily: '"Noto Serif SC", "STKaiti", serif',
      cursor: 'pointer',
    },
    ghost: {
      border: 'none',
      color: 'rgba(94,107,110,0.6)',
      background: 'transparent',
      padding: '8px 16px',
      fontSize: '12px',
      letterSpacing: '0.15em',
      fontFamily: '"Noto Serif SC", "STKaiti", serif',
      cursor: 'pointer',
    },
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden ${className}`}
      style={variantStyles[variant]}
      whileHover={disabled ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.98, y: 0 }}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
