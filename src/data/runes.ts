export interface Rune {
  id: number
  name: string
  meaning: string
  element: string
  symbol: string // SVG path description
  polarity: 'yang' | 'yin'
}

export const RUNES: Rune[] = [
  { id: 1, name: '生', meaning: '生命与起源', element: '木', symbol: 'M0,-40 C10,-30 35,-10 40,0 C35,10 10,30 0,40 C-10,30 -35,10 -40,0 C-35,-10 -10,-30 0,-40z M0,-20 C5,-10 15,-5 20,0 C15,5 5,10 0,20 C-5,10 -15,5 -20,0 C-15,-5 -5,-10 0,-20z', polarity: 'yang' },
  { id: 2, name: '灭', meaning: '终结与轮回', element: '火', symbol: 'M-35,0 L35,0 M0,-35 L0,35 M-25,-25 L25,25 M-25,25 L25,-25', polarity: 'yin' },
  { id: 3, name: '连', meaning: '连接与羁绊', element: '水', symbol: 'M-35,-15 Q-20,-35 0,-15 Q20,5 35,-15 M-35,15 Q-20,-5 0,15 Q20,35 35,15', polarity: 'yang' },
  { id: 4, name: '孤', meaning: '孤独与内省', element: '土', symbol: 'M0,-40 L0,40 M-20,-20 L20,20 M-25,10 L25,10', polarity: 'yin' },
  { id: 5, name: '欲', meaning: '欲望与驱动', element: '火', symbol: 'M0,-35 C20,-20 35,0 20,20 C10,35 -10,35 -20,20 C-35,0 -20,-20 0,-35z M0,-15 C10,-5 15,10 5,15 C-5,20 -15,10 -15,0 C-15,-10 -10,-25 0,-15z', polarity: 'yang' },
  { id: 6, name: '轮', meaning: '轮回与因果', element: '木', symbol: 'M0,-35 C25,-25 35,0 25,25 C15,35 -15,35 -25,25 C-35,0 -25,-25 0,-35z M0,-18 C15,-10 18,10 0,18 C-18,10 -15,-10 0,-18z M0,-8 L0,8', polarity: 'yin' },
  { id: 7, name: '时', meaning: '时间与流逝', element: '水', symbol: 'M-30,-35 L30,-35 L30,-15 L-10,0 L30,15 L30,35 L-30,35 L-30,15 L10,0 L-30,-15z', polarity: 'yang' },
  { id: 8, name: '绪', meaning: '情绪与感知', element: '水', symbol: 'M-35,10 Q-20,-20 0,10 Q20,-20 35,10 M-35,-10 Q-20,10 0,-10 Q20,10 35,-10', polarity: 'yin' },
  { id: 9, name: '序', meaning: '秩序与规则', element: '金', symbol: 'M-30,-30 L30,-30 L30,30 L-30,30z M-20,-20 L20,-20 L20,20 L-20,20z M-10,-10 L10,-10 L10,10 L-10,10z', polarity: 'yang' },
  { id: 10, name: '沌', meaning: '混沌与可能', element: '土', symbol: 'M0,-35 C30,-30 40,10 15,25 C-10,40 -35,20 -30,-10 C-25,-30 -10,-38 0,-35z M-5,0 C15,-5 20,20 5,15 C-10,10 -15,5 -5,0z M-18,-8 C-5,-18 10,-15 12,-5', polarity: 'yin' },
  { id: 11, name: '光', meaning: '光明与启示', element: '火', symbol: 'M0,-40 L8,-15 L35,-15 L12,5 L22,30 L0,15 L-22,30 L-12,5 L-35,-15 L-8,-15z', polarity: 'yang' },
  { id: 12, name: '暗', meaning: '暗影与未知', element: '水', symbol: 'M-30,30 L30,30 L30,-30 L-30,-30z M-15,15 L15,15 L15,-15 L-15,-15z M-10,-25 L10,-25 L10,-20 L-10,-20z', polarity: 'yin' },
  { id: 13, name: '梦', meaning: '梦境与幻象', element: '木', symbol: 'M-25,-25 C-5,-40 25,-30 30,-10 C35,10 15,25 0,20 C-15,15 -25,5 -20,-10 M-35,10 Q-15,35 0,20 Q15,5 35,10', polarity: 'yin' },
  { id: 14, name: '醒', meaning: '觉醒与真相', element: '金', symbol: 'M0,-35 L15,-10 L40,-10 L20,5 L30,30 L0,15 L-30,30 L-20,5 L-40,-10 L-15,-10z M0,-5 L0,5', polarity: 'yang' },
  { id: 15, name: '爱', meaning: '爱与融合', element: '火', symbol: 'M0,35 C0,35 -35,5 -35,-10 C-35,-25 -20,-35 -10,-25 C-5,-15 0,0 0,0 C0,0 5,-15 10,-25 C20,-35 35,-25 35,-10 C35,5 0,35 0,35z', polarity: 'yang' },
  { id: 16, name: '离', meaning: '离别与放手', element: '金', symbol: 'M-35,-20 L35,20 M-35,20 L35,-20 M-15,-35 L-15,35 M15,-35 L15,35 M0,-25 L0,25', polarity: 'yin' },
  { id: 17, name: '空', meaning: '虚空与无限', element: '土', symbol: 'M-30,0 C-30,-20 -15,-30 0,-30 C15,-30 30,-20 30,0 C30,20 15,30 0,30 C-15,30 -30,20 -30,0z M-15,0 C-15,-10 -8,-15 0,-15 C8,-15 15,-10 15,0 C15,10 8,15 0,15 C-8,15 -15,10 -15,0z', polarity: 'yin' },
  { id: 18, name: '力', meaning: '力量与意志', element: '火', symbol: 'M-20,35 L0,-30 L20,35 M0,-35 L0,35 M-25,10 L25,10 M-25,-10 L25,-10', polarity: 'yang' },
  { id: 19, name: '知', meaning: '知识与智慧', element: '水', symbol: 'M-30,-25 L30,-25 M-30,-5 L30,-5 M-30,15 L30,15 M-15,-25 L-15,15 M15,-25 L15,15 M0,-35 L0,25', polarity: 'yang' },
  { id: 20, name: '命', meaning: '命运与定数', element: '木', symbol: 'M-25,-35 L25,-35 L25,35 L-25,35z M-15,-25 C15,-25 25,0 0,25 C-25,0 -15,-25 -15,-25z M-5,10 L5,10 L5,20 L-5,20z', polarity: 'yang' },
]

// Generate star path patterns based on date/time
export type StarPattern = 'spiral' | 'ring' | 'river' | 'fracture' | 'array'

export function getStarPattern(date?: Date): StarPattern {
  const d = date || new Date()
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000)
  const patterns: StarPattern[] = ['spiral', 'ring', 'river', 'fracture', 'array']
  return patterns[dayOfYear % patterns.length]
}

// Generate destiny title based on rune arrangement
export const DESTINY_TITLES = [
  '《坠入长夜的燃灯者》',
  '《被风带走名字的人》',
  '《站在归墟前的旅人》',
  '《深渊彼岸的守望者》',
  '《破碎星河中的织梦人》',
  '《逆流而上的寻光者》',
  '《沉默群星间的独语者》',
  '《轮回尽头的新生者》',
  '《混沌边缘的命名者》',
  '《永恒瞬间的见证者》',
]

export function getDestinyTitle(seed: number): string {
  return DESTINY_TITLES[seed % DESTINY_TITLES.length]
}
