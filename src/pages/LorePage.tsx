import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import StarBackground from '../components/StarBackground'
import { RitualInput, RitualButton } from '../components/RitualUI'

const PAGES = [
  {
    title: '归墟纪 · 序章',
    text: '灾难降临后的第七夜，\n人类第一次听见了星辰的低语。',
    sub: '— 远古残卷所载',
  },
  {
    title: '古符秘录',
    text: '它们并非凡物。\n它们是世界失落的规则碎片，\n散落于归墟洞庭深处。',
    sub: '— 观星者手记 · 其三',
  },
]

export default function LorePage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(0)
  const [name, setName] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const isInfoPage = currentPage >= PAGES.length
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)

  const nextPage = useCallback(() => {
    if (currentPage < PAGES.length) setCurrentPage((p) => p + 1)
  }, [currentPage])

  const prevPage = useCallback(() => {
    if (currentPage > 0) setCurrentPage((p) => p - 1)
  }, [currentPage])

  // Scroll-to-navigate
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let accumDelta = 0
    const handleWheel = (e: WheelEvent) => {
      accumDelta += e.deltaY
      if (Math.abs(accumDelta) > 60) {
        if (accumDelta > 0 && !isInfoPage) nextPage()
        else if (accumDelta < 0) prevPage()
        accumDelta = 0
      }
    }
    el.addEventListener('wheel', handleWheel, { passive: true })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [currentPage, isInfoPage, nextPage, prevPage])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    touchStartTime.current = Date.now()
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = touchStartY.current - e.changedTouches[0].clientY
    const dt = Date.now() - touchStartTime.current
    if (Math.abs(dy) > 40 && dt < 500) {
      if (dy > 0 && !isInfoPage) nextPage()
      else if (dy < 0) prevPage()
    }
  }

  const handleSubmit = () => {
    sessionStorage.setItem('userName', name || '未名旅人')
    navigate('/select')
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-abyss overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <StarBackground density={60} />

      {/* Ambient overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(11,13,16,0.85) 100%)' }}
      />

      {/* Progress dots */}
      <div className="absolute top-8 left-0 right-0 flex justify-center gap-2.5 z-20">
        {[...PAGES, 'input'].map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { if (i <= currentPage) setCurrentPage(i) }}
            className="rounded-full transition-all duration-500 cursor-pointer"
            style={{
              width: i === currentPage ? 18 : 6,
              height: 6,
              background: i === currentPage ? '#B89A63' : i < currentPage ? 'rgba(184,154,99,0.3)' : 'rgba(94,107,110,0.2)',
            }}
          />
        ))}
      </div>

      {/* Scroll hint */}
      {!isInfoPage && (
        <motion.div
          className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-2 z-20"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="flex flex-col items-center gap-1">
            <motion.div
              className="w-4 h-6 rounded-full flex items-start justify-center"
              style={{ border: '0.5px solid rgba(184,154,99,0.3)' }}
            >
              <motion.div
                className="w-1 h-1.5 rounded-full mt-1"
                style={{ background: 'rgba(184,154,99,0.4)' }}
                animate={{ y: [0, 6, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          </div>
          <span className="text-stone/40 text-[10px] tracking-[0.2em]">滑动或滚动翻阅</span>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {!isInfoPage ? (
          <motion.div
            key={`lore-${currentPage}`}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Decorative ancient compass ring */}
            <motion.div
              className="w-20 h-20 rounded-full mb-10 relative"
              style={{
                background: 'radial-gradient(circle, rgba(184,154,99,0.08) 0%, transparent 70%)',
                border: '0.5px solid rgba(184,154,99,0.15)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute inset-3 rounded-full border border-gold/5" />
              <motion.div
                className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full -translate-x-1/2 -translate-y-1/2"
                style={{ background: 'rgba(184,154,99,0.4)' }}
                animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </motion.div>

            <p className="text-gold/40 text-[11px] tracking-[0.3em] mb-5 font-serif">
              {PAGES[currentPage].title}
            </p>

            <div className="text-center whitespace-pre-line leading-relaxed text-base tracking-[0.08em] text-moon/80 mb-8 font-serif">
              {PAGES[currentPage].text}
            </div>

            <p className="text-stone/30 text-[11px] tracking-[0.15em] italic font-serif">
              {PAGES[currentPage].sub}
            </p>

            <div className="mt-14 flex gap-4 items-center">
              {currentPage > 0 && (
                <button
                  onClick={prevPage}
                  className="text-stone/40 hover:text-stone/45 text-sm tracking-[0.15em] cursor-pointer transition-colors"
                >
                  ← 上一页
                </button>
              )}
              <RitualButton onClick={nextPage} variant="primary">
                {currentPage < PAGES.length - 1 ? '继续前行' : '开启仪式'}
              </RitualButton>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="info-input"
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6 overflow-y-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-gold/40 text-[11px] tracking-[0.3em] mb-10 font-serif">— 留下你的名字 —</p>

            <div className="w-full max-w-xs flex flex-col gap-5">
              <RitualInput
                value={name}
                onChange={(v) => setName(v)}
                placeholder="你的名字"
              />
            </div>

            <div className="mt-10 flex flex-col items-center gap-4">
              <RitualButton onClick={handleSubmit} variant="primary">
                开始构筑命轨
              </RitualButton>
              <button
                onClick={prevPage}
                className="text-stone/40 text-xs tracking-[0.15em] hover:text-stone/40 transition-colors cursor-pointer"
              >
                返回前页
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
