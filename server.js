import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'

app.use(express.json({ limit: '50kb' }))

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')))

const ELEMENT_GENERATES = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' }
const ELEMENT_CONTROLS = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' }

function computeSpatialRelations(runeAnalysis) {
  const relations = []
  for (let i = 0; i < runeAnalysis.length; i++) {
    for (let j = i + 1; j < runeAnalysis.length; j++) {
      const a = runeAnalysis[i]
      const b = runeAnalysis[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const angleBetween = Math.abs(a.rotation - b.rotation)
      const normalizedAngle = Math.min(angleBetween, 360 - angleBetween)

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

      relations.push({
        runeA: a.rune.name,
        runeB: b.rune.name,
        spatial: { distance: Math.round(dist * 10) / 10, description: spatialDesc },
        rotation: { diff: Math.round(normalizedAngle), alignment },
        element: elementRel,
      })
    }
  }
  return relations
}

function buildPrompt(runeAnalysis, spatialRelations, runesSummary) {
  const runeDetails = runeAnalysis.map((item) =>
    `- 【${item.rune.name}】（${item.rune.element}·${item.rune.polarity === 'yang' ? '阳' : '阴'}）位置(x:${Math.round(item.x)}, y:${Math.round(item.y)}) 旋转${Math.round(item.rotation)}° → ${item.meaning}。位于${item.zone}，方向：${item.direction}`
  ).join('\n')

  const relationDetails = spatialRelations.map((rel) =>
    `- ${rel.runeA} ↔ ${rel.runeB}：空间${rel.spatial.description}（距离${rel.spatial.distance}），旋转角度差${rel.rotation.diff}°（${rel.rotation.alignment}），五行：${rel.element}`
  ).join('\n')

  return `你是一位精通东方命理学与星象学的古老智者。用户在"河图星脉"仪式中选择了符文并进行了空间排布，现在请你解读这份命轨。

## 符文排布数据
${runeDetails}

## 符间空间与元素关系
${relationDetails}

## 命轨概况
${runesSummary}

## 解读要求

请你基于以上数据，生成一份深刻、诗意且个性化的命轨解读。必须包含以下六个部分，每个部分100-200字：

1. **人生基调**：以最靠近中心的符文为核心，结合其意义、元素和旋转方向，描述用户此生的根本课题与灵魂底色。旋转角度暗示了用户对待命运的姿态——接近水平（0°/180°）代表平稳接纳，接近垂直（90°/270°）代表与命运张力对抗，偏斜则代表在接纳与对抗之间的微妙平衡。

2. **近期星轨**：关注最远离中心的符文——它代表即将到来的能量。根据它相对于中心的位置（上方=意识/未来、下方=潜意识/过去、左侧=过往影响、右侧=未来趋势），预测未来30日的运势变化。

3. **阻塞与执念**：分析阵列中五行相克或方向相悖的符文对——这些是用户当前的内在冲突。具体指出是哪些符文的什么关系导致了阻滞，以及用户为何难以调和这些力量。

4. **天赋与隐藏力量**：聚焦五行相生的符文对和方向一致的符文组合——这些是用户的优势与天赋。说明哪些元素和符文的组合赋予了用户什么样的独特能力。

5. **行动指引**：基于整个阵列的格局，给出具体的生活建议。指出哪些元素的人与活动该接近，哪些该暂时远离。给出1-2条与符文排布直接相关的具体行动。

6. **命运箴言**：用一句诗意而有力的话总结这份命轨。这句话应该呼应阵列中最突出的空间关系或元素组合。

## 格式
请直接按以下格式输出：

【人生基调】
（内容）

【近期星轨】
（内容）

【阻塞与执念】
（内容）

【天赋与隐藏力量】
（内容）

【行动指引】
（内容）

【命运箴言】
（内容）`
}

app.post('/api/interpret', async (req, res) => {
  try {
    const { runeAnalysis, spatialRelations, runesSummary } = req.body

    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' })
    }

    const prompt = buildPrompt(runeAnalysis, spatialRelations, runesSummary)

    const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一位精通东方命理学与星象学的古老智者，你的解读深刻、诗意、直指人心。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.85,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('DeepSeek API error:', response.status, errText)
      return res.status(response.status).json({ error: 'LLM API error', detail: errText })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    res.json({ content })
  } catch (err) {
    console.error('Interpret error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  if (!DEEPSEEK_API_KEY) {
    console.warn('WARNING: DEEPSEEK_API_KEY not set. /api/interpret will fail.')
  }
})
