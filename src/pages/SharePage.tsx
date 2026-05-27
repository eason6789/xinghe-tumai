import { useRef, useMemo, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toPng } from 'html-to-image'
import StarBackground from '../components/StarBackground'
import { RuneSymbol } from '../components/RuneSymbol'
import { RitualButton } from '../components/RitualUI'
import { RUNES, getDestinyTitle } from '../data/runes'

export default function SharePage() {
  const navigate = useNavigate()
  const cardRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const placedData = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('placedRunes') || '[]') }
    catch { return [] }
  }, [])

  const runes = placedData.map((p: { runeId: number }) => RUNES.find((r) => r.id === p.runeId)!).filter(Boolean)
  const seed = placedData.reduce((sum: number, p: { runeId: number; x: number; y: number }) =>
    sum + p.runeId * 7 + Math.floor(p.x * 31) + Math.floor(p.y * 17), 0)
  const destinyTitle = getDestinyTitle(seed)

  const centerRune = useMemo(() => {
    const c = placedData.reduce((a: any, b: any) => {
      const da = Math.abs(a.x - 50) + Math.abs(a.y - 50)
      const db = Math.abs(b.x - 50) + Math.abs(b.y - 50)
      return da < db ? a : b
    }, placedData[0])
    return RUNES.find((r) => r.id === c?.runeId)
  }, [placedData])

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return
    setGenerating(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: '#0B0D10',
        pixelRatio: 2,
        quality: 0.95,
      })
      setImageUrl(dataUrl)
    } catch (e) {
      console.error('Failed to generate image:', e)
    }
    setGenerating(false)
  }, [])

  const saveImage = () => {
    if (!imageUrl) return
    const link = document.createElement('a')
    link.download = `星河图脉-${destinyTitle.replace(/[《》]/g, '')}.png`
    link.href = imageUrl
    link.click()
  }

  return (
    <div className="relative w-full h-full bg-abyss overflow-y-auto scrollbar-hide">
      <StarBackground density={40} />

      <div className="relative z-10 max-w-lg mx-auto px-6 py-10 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate('/interpret')}
            className="text-stone/40 hover:text-stone/60 text-sm tracking-[0.15em] cursor-pointer transition-colors"
          >
            ← 返回
          </button>
          <span className="text-gold/40 text-xs tracking-[0.2em]">命运长卷</span>
          <div className="w-12" />
        </div>

        {/* The share card */}
        <motion.div
          ref={cardRef}
          className="relative mx-auto max-w-sm rounded-lg overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(11,13,16,1) 0%, rgba(20,18,14,0.95) 50%, rgba(11,13,16,1) 100%)',
            border: '0.5px solid rgba(184,154,99,0.2)',
            padding: '36px 28px',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Top decorative line */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(184,154,99,0.25))' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(184,154,99,0.35)' }} />
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(184,154,99,0.25))' }} />
          </div>

          {/* Title */}
          <h2
            className="text-center text-2xl font-bold tracking-[0.25em] mb-2"
            style={{ color: '#D8D4C8', fontFamily: '"Noto Serif SC", serif', textShadow: '0 0 20px rgba(184,154,99,0.2)' }}
          >
            星河图脉
          </h2>
          <p className="text-center text-gold/45 text-xs tracking-[0.3em] mb-6">命轨解读</p>

          {/* Destiny name */}
          <h3 className="text-center text-xl tracking-[0.15em] mb-8" style={{ color: '#B89A63', fontFamily: '"Noto Serif SC", serif' }}>
            {destinyTitle}
          </h3>

          {/* Mini rune array */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {runes.map((rune: any) => (
              <div key={rune.id} className="scale-75">
                <RuneSymbol rune={rune} size={24} />
              </div>
            ))}
          </div>

          {/* Key insight */}
          <div className="text-center mb-6 px-4">
            <p className="text-moon/50 text-xs leading-relaxed tracking-[0.08em] font-serif">
              {centerRune
                ? `你的命轨核心为「${centerRune.name}」——${centerRune.meaning}。\n这是你灵魂深处最古老的回响。`
                : '你的命轨正在星河中缓缓展开。'}
            </p>
          </div>

          {/* Bottom line */}
          <div className="flex items-center justify-center gap-4 mt-6 mb-2">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(184,154,99,0.25))' }} />
            <div className="text-[10px] tracking-[0.3em] opacity-25" style={{ color: '#5E6B6E' }}>星河图脉</div>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(184,154,99,0.25))' }} />
          </div>
        </motion.div>

        {/* Action buttons */}
        <div className="flex flex-col items-center gap-4 mt-10">
          {!imageUrl ? (
            <RitualButton variant="primary" onClick={generateImage} disabled={generating}>
              {generating ? '生成中...' : '导出为图片'}
            </RitualButton>
          ) : (
            <div className="flex flex-col items-center gap-5 w-full">
              <motion.img
                src={imageUrl} alt="命运长卷"
                className="max-w-full rounded-lg shadow-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              />
              <div className="flex gap-4">
                <RitualButton variant="primary" onClick={saveImage}>保存到相册</RitualButton>
                <RitualButton variant="secondary" onClick={() => setImageUrl(null)}>重新生成</RitualButton>
              </div>
            </div>
          )}

          <button
            className="mt-4 text-stone/40 text-xs tracking-[0.15em] hover:text-stone/40 transition-colors cursor-pointer"
            onClick={() => { sessionStorage.clear(); navigate('/') }}
          >
            重新构筑命轨
          </button>
        </div>
      </div>
    </div>
  )
}
