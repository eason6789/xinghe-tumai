import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import StarBackground from '../components/StarBackground'
import { RuneSymbol } from '../components/RuneSymbol'
import { RitualButton } from '../components/RitualUI'
import { RUNES, getDestinyTitle } from '../data/runes'
import type { Rune } from '../data/runes'

interface PlacedRuneData {
  runeId: number
  x: number
  y: number
  rotation: number
}

const ELEMENT_GENERATES: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' }
const ELEMENT_CONTROLS: Record<string, string> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' }

function computeLocalAnalysis(placed: PlacedRuneData[]) {
  const runes = placed.map((p) => RUNES.find((r) => r.id === p.runeId)!).filter(Boolean)
  const seed = placed.reduce((sum, p) => sum + p.runeId * 7 + Math.floor(p.x * 31) + Math.floor(p.y * 17), 0)
  const destinyTitle = getDestinyTitle(seed)

  const centerRune = placed.reduce((a, b) => {
    const da = Math.abs(a.x - 50) + Math.abs(a.y - 50)
    const db = Math.abs(b.x - 50) + Math.abs(b.y - 50)
    return da < db ? a : b
  })
  const centerRuneObj = RUNES.find((r) => r.id === centerRune.runeId)!

  const farRune = placed.reduce((a, b) => {
    const da = Math.abs(a.x - 50) + Math.abs(a.y - 50)
    const db = Math.abs(b.x - 50) + Math.abs(b.y - 50)
    return da > db ? a : b
  })
  const farRuneObj = RUNES.find((r) => r.id === farRune.runeId)!

  const yinCount = runes.filter((r) => r.polarity === 'yin').length
  const yangCount = runes.filter((r) => r.polarity === 'yang').length
  const elements = [...new Set(runes.map((r) => r.element))]

  const runeAnalysis = placed.map((p) => {
    const rune = RUNES.find((r) => r.id === p.runeId)!
    const distFromCenter = Math.sqrt((p.x - 50) ** 2 + (p.y - 50) ** 2)
    let zone = '命轨核心区'
    if (distFromCenter > 40) zone = '深渊边缘区'
    else if (distFromCenter > 25) zone = '外围影响区'
    else if (distFromCenter > 12) zone = '近核区'

    let direction = ''
    if (p.y < 35) direction = '上方（意识层）'
    else if (p.y > 65) direction = '下方（潜意识层）'
    if (p.x < 35) direction += direction ? '·左侧（过往）' : '左侧（过往）'
    else if (p.x > 65) direction += direction ? '·右侧（未来）' : '右侧（未来）'

    return {
      rune,
      x: p.x, y: p.y, rotation: p.rotation,
      zone, direction: direction || '中心',
    }
  })

  // Spatial relations
  interface SpatialRel {
    runeA: string; runeB: string
    spatial: { distance: number; description: string }
    rotation: { diff: number; alignment: string }
    element: string
  }
  const spatialRelations: SpatialRel[] = []
  for (let i = 0; i < runeAnalysis.length; i++) {
    for (let j = i + 1; j < runeAnalysis.length; j++) {
      const a = runeAnalysis[i]
      const b = runeAnalysis[j]
      const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
      const angleDiff = Math.abs(a.rotation - b.rotation)
      const normalizedAngle = Math.min(angleDiff, 360 - angleDiff)

      let spatialDesc = ''
      if (dist < 10) spatialDesc = '紧密相邻，能量强烈共振'
      else if (dist < 20) spatialDesc = '近距呼应，彼此影响显著'
      else if (dist < 35) spatialDesc = '中距相望，存在微妙的牵引'
      else spatialDesc = '遥距对峙，各自守护一方领域'

      let alignment = ''
      if (normalizedAngle < 15) alignment = '方向几乎一致，形成合力'
      else if (normalizedAngle < 45) alignment = '方向略有偏差，产生互补张力'
      else if (normalizedAngle < 90) alignment = '方向差异明显，构成复杂对话'
      else if (normalizedAngle < 135) alignment = '方向大幅偏离，暗藏内在冲突'
      else alignment = '方向几乎相反，呈现对立统一'

      let elementRel = ''
      if (a.rune.element === b.rune.element) elementRel = '同元素叠加——力量被放大或内耗'
      else if (ELEMENT_GENERATES[a.rune.element] === b.rune.element)
        elementRel = `${a.rune.name}(${a.rune.element})生${b.rune.name}(${b.rune.element})——前者滋养后者`
      else if (ELEMENT_GENERATES[b.rune.element] === a.rune.element)
        elementRel = `${b.rune.name}(${b.rune.element})生${a.rune.name}(${a.rune.element})——后者滋养前者`
      else if (ELEMENT_CONTROLS[a.rune.element] === b.rune.element)
        elementRel = `${a.rune.name}(${a.rune.element})克${b.rune.name}(${b.rune.element})——前者约束后者`
      else if (ELEMENT_CONTROLS[b.rune.element] === a.rune.element)
        elementRel = `${b.rune.name}(${b.rune.element})克${a.rune.name}(${a.rune.element})——后者约束前者`
      else elementRel = '五行无直接生克——各行其道'

      spatialRelations.push({
        runeA: a.rune.name,
        runeB: b.rune.name,
        spatial: { distance: Math.round(dist * 10) / 10, description: spatialDesc },
        rotation: { diff: Math.round(normalizedAngle), alignment },
        element: elementRel,
      })
    }
  }

  const runesSummary = `共${runes.length}枚符文，阴${yinCount}阳${yangCount}。核心符文「${centerRuneObj.name}」，最远符文「${farRuneObj.name}」。五行涵盖${elements.join('、')}。`

  return { destinyTitle, centerRune: centerRuneObj, farRune: farRuneObj, yinDominant: yinCount >= yangCount, elements, runes, runeAnalysis, spatialRelations, runesSummary }
}

function parseSections(content: string) {
  const titles: Record<string, string> = {
    '人生基调': '',
    '近期星轨': '',
    '阻塞与执念': '',
    '天赋与隐藏力量': '',
    '行动指引': '',
    '命运箴言': '',
  }
  // Split by 【...】
  const parts = content.split(/【(.+?)】/)
  for (let i = 1; i < parts.length; i += 2) {
    const key = parts[i].trim()
    const text = (parts[i + 1] || '').trim()
    for (const title of Object.keys(titles)) {
      if (key.includes(title)) {
        titles[title] = text
      }
    }
  }
  return titles
}

export default function InterpretationPage() {
  const navigate = useNavigate()
  const [revealed, setRevealed] = useState(0)
  const [llmContent, setLlmContent] = useState<string | null>(null)
  const [llmLoading, setLlmLoading] = useState(false)
  const [llmError, setLlmError] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const placedData: PlacedRuneData[] = JSON.parse(sessionStorage.getItem('placedRunes') || '[]')
  const local = useMemo(() => computeLocalAnalysis(placedData), [placedData])

  // Call LLM API
  useEffect(() => {
    let cancelled = false
    async function fetchInterpretation() {
      setLlmLoading(true)
      try {
        const resp = await fetch('/xinghe-tumai/api/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            runeAnalysis: local.runeAnalysis.map((item) => ({
              rune: { name: item.rune.name, element: item.rune.element, polarity: item.rune.polarity, meaning: item.rune.meaning },
              x: item.x, y: item.y, rotation: item.rotation,
              zone: item.zone, direction: item.direction,
            })),
            spatialRelations: local.spatialRelations,
            runesSummary: local.runesSummary,
          }),
        })
        if (!resp.ok) throw new Error('API error')
        const data = await resp.json()
        if (!cancelled) setLlmContent(data.content)
      } catch {
        if (!cancelled) setLlmError(true)
      } finally {
        if (!cancelled) setLlmLoading(false)
      }
    }
    fetchInterpretation()
    return () => { cancelled = true }
  }, [placedData])

  const sections = useMemo(() => {
    if (llmContent) {
      const parsed = parseSections(llmContent)
      return [
        { title: 'Ⅰ  人生基调', content: parsed['人生基调'] || llmContent.slice(0, 200) },
        { title: 'Ⅱ  近期星轨', content: parsed['近期星轨'] || '' },
        { title: 'Ⅲ  阻塞与执念', content: parsed['阻塞与执念'] || '' },
        { title: 'Ⅳ  天赋与隐藏力量', content: parsed['天赋与隐藏力量'] || '' },
        { title: 'Ⅴ  行动指引', content: parsed['行动指引'] || '' },
        { title: 'Ⅵ  命运箴言', content: parsed['命运箴言'] || '' },
      ]
    }
    // Fallback: very minimal placeholder while loading
    return [
      { title: 'Ⅰ  人生基调', content: '' },
      { title: 'Ⅱ  近期星轨', content: '' },
      { title: 'Ⅲ  阻塞与执念', content: '' },
      { title: 'Ⅳ  天赋与隐藏力量', content: '' },
      { title: 'Ⅴ  行动指引', content: '' },
      { title: 'Ⅵ  命运箴言', content: '' },
    ]
  }, [llmContent])

  useEffect(() => {
    const timers = [0, 800, 1600].map((delay, i) =>
      setTimeout(() => setRevealed(i), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (llmContent || llmError) {
      // Reveal sections gradually after content arrives
      const timers = [0, 600, 1200, 1800, 2400, 3000].map((delay, i) =>
        setTimeout(() => setRevealed((prev) => Math.max(prev, i + 3)), delay)
      )
      return () => timers.forEach(clearTimeout)
    }
  }, [llmContent, llmError])

  useEffect(() => {
    if (llmContent || llmError) {
      const t = setTimeout(() => setShowDetails(true), 3600)
      return () => clearTimeout(t)
    }
  }, [llmContent, llmError])

  return (
    <div className="relative w-full min-h-dvh bg-abyss overflow-y-auto scrollbar-hide flex flex-col items-center">
      <StarBackground density={50} />

      <div className="relative z-10 w-full max-w-lg mx-auto px-6 py-10 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigate('/arrange')}
            className="text-stone/40 hover:text-stone/60 text-sm tracking-[0.15em] cursor-pointer transition-colors"
          >
            ← 返回
          </button>
          <span className="text-gold/40 text-xs tracking-[0.2em]">命轨解读</span>
          <div className="w-12" />
        </div>

        {/* Destiny title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={revealed >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <p className="text-gold/40 text-xs tracking-[0.3em] mb-4 font-serif">你的命轨之名</p>
          <h2
            className="text-3xl font-bold tracking-[0.2em] leading-relaxed"
            style={{
              color: '#D8D4C8',
              textShadow: '0 0 30px rgba(184,154,99,0.3)',
              fontFamily: '"Noto Serif SC", serif',
            }}
          >
            {local.destinyTitle}
          </h2>
        </motion.div>

        {/* Rune array summary + Mini arrangement map */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0 }}
          animate={revealed >= 1 ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            {local.runes.map((rune: Rune) => (
              <div key={rune.id} className="opacity-70">
                <RuneSymbol rune={rune} size={22} />
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <div
              className="relative rounded-sm overflow-hidden"
              style={{
                width: 180, height: 180,
                background: 'radial-gradient(ellipse at center, rgba(184,154,99,0.06) 0%, rgba(11,13,16,0.9) 70%)',
                border: '0.5px solid rgba(184,154,99,0.12)',
              }}
            >
              <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: 'rgba(184,154,99,0.06)' }} />
              <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: 'rgba(184,154,99,0.06)' }} />
              <div
                className="absolute rounded-full"
                style={{
                  left: '50%', top: '50%', width: 3, height: 3,
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(184,154,99,0.2)',
                }}
              />
              {local.runeAnalysis.map((item) => {
                const isCenter = item.zone === '命轨核心区'
                return (
                  <div
                    key={item.rune.id}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                    }}
                  >
                    <div
                      className="rounded-full"
                      style={{
                        width: isCenter ? 10 : 7,
                        height: isCenter ? 10 : 7,
                        background: isCenter ? 'rgba(184,154,99,0.7)' : 'rgba(184,154,99,0.35)',
                        boxShadow: isCenter ? '0 0 6px rgba(184,154,99,0.4)' : 'none',
                      }}
                    />
                    <span
                      className="text-[8px] mt-0.5 font-serif"
                      style={{ color: isCenter ? '#B89A63' : 'rgba(216,212,200,0.4)' }}
                    >
                      {item.rune.name}
                    </span>
                  </div>
                )
              })}
              <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[8px] text-stone/30 font-serif">意识层</span>
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] text-stone/30 font-serif">潜意识</span>
            </div>
          </div>
          <p className="text-center text-stone/35 text-[10px] tracking-[0.12em] mt-2 font-serif">你的命轨排布阵列</p>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="flex items-center gap-4 mb-10"
          initial={{ opacity: 0 }}
          animate={revealed >= 1 ? { opacity: 0.3 } : {}}
        >
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(184,154,99,0.3))' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(184,154,99,0.4)' }} />
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(184,154,99,0.3))' }} />
        </motion.div>

        {/* LLM Loading state */}
        {llmLoading && (
          <motion.div
            className="flex flex-col items-center gap-6 py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Spinning ring */}
            <motion.div
              className="w-16 h-16 rounded-full border border-gold/15 relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <motion.div
                className="absolute top-0 left-1/2 w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2"
                style={{ background: '#B89A63' }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <div className="text-center">
              <p className="text-gold/50 text-sm tracking-[0.2em] font-serif mb-2">星轨正在解读你的命轨...</p>
              <p className="text-stone/30 text-[10px] tracking-[0.1em] font-serif">大模型正在分析符文间的位置、方向与元素关系</p>
            </div>
          </motion.div>
        )}

        {/* LLM Error state */}
        {llmError && !llmContent && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-stone/40 text-sm tracking-[0.1em] font-serif">
              星轨解读服务暂时不可用
            </p>
            <p className="text-stone/30 text-xs tracking-[0.08em] mt-2 font-serif">
              请确保服务器已配置 DEEPSEEK_API_KEY 环境变量
            </p>
            <button
              className="mt-6 text-gold/50 text-xs tracking-[0.15em] cursor-pointer hover:text-gold/70 transition-colors"
              onClick={() => window.location.reload()}
            >
              重新尝试
            </button>
          </motion.div>
        )}

        {/* Reading sections */}
        {llmContent && (
          <div className="space-y-8">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={revealed >= i + 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <h3 className="text-sm tracking-[0.2em] mb-3 font-serif" style={{ color: '#B89A63' }}>
                  {section.title}
                </h3>
                <p className="text-sm leading-loose tracking-[0.06em] text-moon/60 font-serif whitespace-pre-line">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* ===== DETAILED ANALYSIS SECTIONS ===== */}
        {(llmContent || llmError) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={showDetails ? { opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 my-12 opacity-20">
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(184,154,99,0.3))' }} />
              <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(184,154,99,0.4)' }} />
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(184,154,99,0.3))' }} />
            </div>

            <p className="text-center text-gold/30 text-[10px] tracking-[0.25em] mb-8 font-serif">详 解 命 轨</p>

            {/* Per-rune analysis */}
            <h3 className="text-sm tracking-[0.2em] mb-6 font-serif" style={{ color: '#B89A63' }}>
              符文详解
            </h3>
            <div className="space-y-4 mb-12">
              {local.runeAnalysis.map((item) => (
                <motion.div
                  key={item.rune.id}
                  className="flex items-start gap-4 p-3 rounded-sm"
                  style={{
                    background: 'rgba(11,13,16,0.5)',
                    border: '0.5px solid rgba(184,154,99,0.08)',
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={showDetails ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 * item.rune.id }}
                >
                  <div className="shrink-0 mt-0.5">
                    <RuneSymbol rune={item.rune} size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gold/80 text-sm font-serif tracking-[0.15em]">{item.rune.name}</span>
                      <span className="text-[10px] tracking-[0.1em] px-1.5 py-0.5 rounded-full font-serif"
                        style={{
                          color: item.rune.polarity === 'yang' ? 'rgba(196,90,60,0.6)' : 'rgba(94,107,110,0.6)',
                          background: item.rune.polarity === 'yang' ? 'rgba(196,90,60,0.08)' : 'rgba(94,107,110,0.08)',
                        }}
                      >
                        {item.rune.polarity === 'yang' ? '阳' : '阴'}
                      </span>
                      <span className="text-[10px] text-stone/40 font-serif">{item.rune.element}属性</span>
                    </div>
                    <p className="text-moon/50 text-xs leading-relaxed tracking-[0.06em] font-serif">
                      {item.rune.meaning}
                    </p>
                    <p className="text-stone/40 text-[10px] tracking-[0.08em] mt-1 font-serif">
                      {item.zone}{item.direction ? ` · ${item.direction}` : ''} · 旋转{Math.round(item.rotation)}°
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Spatial relationships */}
            <h3 className="text-sm tracking-[0.2em] mb-6 font-serif" style={{ color: '#B89A63' }}>
              符间空间与元素关系
            </h3>
            <div className="space-y-3 mb-12">
              {local.spatialRelations.map((rel, i) => (
                <motion.div
                  key={`${rel.runeA}-${rel.runeB}`}
                  className="flex flex-col gap-1 px-4 py-3 rounded-sm"
                  style={{
                    background: 'rgba(11,13,16,0.4)',
                    border: '0.5px solid rgba(184,154,99,0.06)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={showDetails ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.05 * i }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gold/70 text-sm font-serif tracking-[0.12em] shrink-0">{rel.runeA} ↔ {rel.runeB}</span>
                    <span className="text-stone/30 text-[10px]">距离 {rel.spatial.distance}%</span>
                  </div>
                  <span className="text-moon/40 text-xs leading-relaxed tracking-[0.06em] font-serif">
                    {rel.spatial.description} · {rel.rotation.alignment}（旋转差 {rel.rotation.diff}°）· {rel.element}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Array pattern */}
            <h3 className="text-sm tracking-[0.2em] mb-6 font-serif" style={{ color: '#B89A63' }}>
              阵列格局
            </h3>
            <motion.div
              className="p-5 rounded-sm"
              style={{
                background: 'linear-gradient(180deg, rgba(11,13,16,0.6) 0%, rgba(20,18,14,0.4) 100%)',
                border: '0.5px solid rgba(184,154,99,0.1)',
              }}
              initial={{ opacity: 0 }}
              animate={showDetails ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
            >
              <p className="text-moon/50 text-xs leading-loose tracking-[0.06em] font-serif mb-3">
                命轨核心为「{local.centerRune.name}」——「{local.centerRune.meaning}」是你此生阵列的中心引力源。所有符文的排布都围绕这个核心展开，它决定了你整个命轨的基调与方向。
              </p>
              <p className="text-moon/50 text-xs leading-loose tracking-[0.06em] font-serif mb-3">
                最远的符文「{local.farRune.name}」位于阵列边缘，代表你尚未完全接纳的力量。「{local.farRune.meaning}」这股能量正在从远方靠近，它的到来将扰动你现有的命轨格局。
              </p>
              <p className="text-moon/50 text-xs leading-loose tracking-[0.06em] font-serif">
                你选择了 {local.runes.length} 枚符文，其中阴符 {local.runes.filter((r: Rune) => r.polarity === 'yin').length} 枚、阳符 {local.runes.filter((r: Rune) => r.polarity === 'yang').length} 枚。
                {local.yinDominant
                  ? '阴性能量居于主导——你的命轨更倾向于内省、感知与接纳。这不是柔弱，而是如深海般的力量。'
                  : '阳性能量居于主导——你的命轨更倾向于行动、表达与创造。这不是鲁莽，而是如火焰般的生命力。'}
                五行涵盖{local.elements.join('、')}{local.elements.length > 3 ? '，元素多元意味着你的命运纹理比常人更加复杂' : '，元素集中意味着你的命运方向清晰而专注'}。
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          className="flex flex-col items-center gap-4 mt-14"
          initial={{ opacity: 0 }}
          animate={revealed >= 9 ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <RitualButton variant="primary" onClick={() => navigate('/share')}>
            生成命运长卷
          </RitualButton>
          <button
            className="text-stone/40 text-xs tracking-[0.15em] hover:text-stone/40 transition-colors cursor-pointer pt-2"
            onClick={() => { sessionStorage.clear(); navigate('/') }}
          >
            重新构筑命轨
          </button>
        </motion.div>
      </div>
    </div>
  )
}
