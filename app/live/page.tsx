'use client'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { getWorldCupMatches, getLiveMatch, getDanmakuPool, type MatchStats } from '@/lib/services'

/* ===== Data Stream Canvas (Matrix-style waterfall) ===== */
function DataStreamCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return

    let animationId: number
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ΣΔΩαβγδεθηλμπρστφω░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼'
    const fontSize = 14
    let columns = 0
    const drops: number[] = []

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
      columns = Math.floor(canvas!.width / fontSize)
      drops.length = 0
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100
      }
    }

    function draw() {
      ctx!.fillStyle = 'rgba(10,10,15,0.05)'
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)

      ctx!.font = `${fontSize}px "JetBrains Mono", monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        // Fade gradient: brighter at head
        const alpha = Math.random() * 0.04 + 0.02
        ctx!.fillStyle = `rgba(0,240,255,${alpha})`
        ctx!.fillText(char, x, y)

        if (y > canvas!.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }

      animationId = requestAnimationFrame(draw)
    }

    resize()
    draw()

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}

/* ===== Flag Emoji ===== */
function getFlagEmoji(code: string) {
  const map: Record<string, string> = {
    QA: '🇶🇦',
    CH: '🇨🇭',
    BR: '🇧🇷',
    MA: '🇲🇦',
    HT: '🇭🇹',
    'GB-SCT': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    AU: '🇦🇺',
    TR: '🇹🇷',
    DE: '🇩🇪',
    CW: '🇨🇼',
    NL: '🇳🇱',
    JP: '🇯🇵',
    CI: '🇨🇮',
    EC: '🇪🇨',
    SE: '🇸🇪',
    TN: '🇹🇳',
  }
  return map[code] || '🏳️'
}

/* ===== Events ===== */
interface LiveEvent {
  id: number
  minute: number
  icon: string
  text: string
  type: 'goal' | 'card' | 'chance' | 'info' | 'ht' | 'ft' | 'commentary'
}

const eventStyles: Record<string, string> = {
  goal: 'border-l-emerald-500',
  card: 'border-l-amber-400',
  chance: 'border-l-blue-400',
  info: 'border-l-[var(--text-dim)]/30',
  ht: 'border-l-[var(--neon-cyan)]',
  ft: 'border-l-red-500',
  commentary: 'border-l-[var(--neon-cyan)]',
}
const eventTextColors: Record<string, string> = {
  goal: 'text-emerald-400 font-semibold',
  card: 'text-amber-300',
  chance: 'text-blue-300',
  info: 'text-[var(--text-dim)]/70',
  ht: 'text-[var(--neon-cyan)] font-semibold',
  ft: 'text-red-400 font-semibold',
  commentary: 'text-[var(--neon-cyan)] italic',
}

const commentaryTemplates = [
  (h: string, a: string, s: number) =>
    `开场阶段，${h}迅速进入状态，前场压迫感十足。${a}采取密集防守策略，伺机反击。`,
  (h: string, _a: string, _s: number) =>
    `${h}中场控制力明显占优，短传渗透打法让对手难以组织有效逼抢。`,
  (h: string, a: string, s: number) =>
    `半场数据：${h}射门${2 + Math.floor(s * 0.6)}次，${a}射门${1 + Math.floor(s * 0.25)}次。控球率差距明显，比赛悬念依然存在。`,
  (h: string, a: string, s: number) =>
    `比分${s > 1 ? '领先' : '接近'}，${a}被迫压上进攻，后防空虚。${h}反击中的速度优势将成为关键变量。`,
  (h: string, _a: string, s: number) =>
    `AI模型实时更新胜率：主场优势 +${8 + s * 2}%，角球转化率高达${14 + s}%，建议关注定位球战术。`,
  (h: string, _a: string, _s: number) =>
    `${h}的进攻方向明显偏向左路，边锋单场已完成多次成功过人。对方右路防守压力巨大。`,
  (_h: string, a: string, _s: number) =>
    `${a}这次定位球防守站位出现问题，被对方抓住了禁区前沿的空间。角球防守需要重点盯防高点。`,
  (h: string, a: string, s: number) =>
    `比赛进入最后阶段，${s > 1 ? h + '大概率锁定胜局' : '双方都有机会绝杀'}。体能下降导致阵型松散，容易出现一对一机会。`,
]

const seedCommentaryOrder = [0, 3, 1, 5, 2, 7, 4, 6]
let commentaryRotationIdx = 0
function getNextCommentaryTemplate() {
  const idx = seedCommentaryOrder[commentaryRotationIdx % seedCommentaryOrder.length]
  commentaryRotationIdx++
  return commentaryTemplates[idx]
}

/* ===== Typewriter Event ===== */
function TypewriterEvent({ event }: { event: LiveEvent }) {
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`flex gap-3 py-2.5 px-3 border-l-2 mb-1 rounded-r bg-[rgba(10,13,28,0.3)] transition-all duration-300 ${
        revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
      } ${eventStyles[event.type] || ''}`}
    >
      <span className="text-xs text-[var(--text-label)] min-w-[36px] font-mono pt-px">
        {event.minute}&apos;
      </span>
      <span className="text-xs w-5 text-center pt-px">{event.icon}</span>
      <span className={`text-sm leading-relaxed ${eventTextColors[event.type] || ''}`}>
        {event.text}
      </span>
    </div>
  )
}

function LiveContent() {
  const searchParams = useSearchParams()
  const matchId = searchParams.get('match')
  const match = getLiveMatch(matchId ?? '') || getWorldCupMatches()[0]
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [score, setScore] = useState({ home: 0, away: 0 })
  const [matchMinute, setMatchMinute] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [stats, setStats] = useState<MatchStats>({
    possession: [50, 50],
    shots: [0, 0],
    shotsOnTarget: [0, 0],
    corners: [0, 0],
    fouls: [0, 0],
    yellowCards: [0, 0],
  })
  const [danmaku, setDanmaku] = useState<{ id: number; text: string }[]>([])
  const [liveOdds, setLiveOdds] = useState({
    home: match.homeWin,
    draw: match.draw,
    away: match.awayWin,
  })
  const eventIdRef = useRef(1)
  const danmakuIdRef = useRef(1)
  const commentaryCountRef = useRef(0)
  const danmakuPoolRef = useRef<string[]>([])
  const danmakuIdxRef = useRef(0)

  const addEvent = useCallback(
    (text: string, type: LiveEvent['type'], icon: string, minute: number) => {
      const id = eventIdRef.current++
      setEvents((prev) => [{ id, minute, icon, text, type }, ...prev])
    },
    []
  )

  useEffect(() => {
    if (!isRunning) return
    const pool = getDanmakuPool()
    danmakuPoolRef.current = pool
    const timer = window.setInterval(() => {
      const pool = danmakuPoolRef.current
      if (pool.length === 0) return
      const text = pool[danmakuIdxRef.current % pool.length]
      danmakuIdxRef.current++
      setDanmaku((prev) => {
        const next = [{ id: danmakuIdRef.current++, text }, ...prev]
        return next.slice(0, 30)
      })
    }, 4500)
    return () => clearInterval(timer)
  }, [isRunning])

  useEffect(() => {
    if (!isRunning) return
    const timer = window.setInterval(() => {
      setMatchMinute((m) => {
        if (m >= 95) {
          setIsRunning(false)
          return 95
        }
        const next = m + Math.floor(Math.random() * 3) + 1
        const clamped = Math.min(next, 95)
        setStats((s) => ({
          possession: [
            Math.max(40, Math.min(70, s.possession[0] + (Math.random() - 0.48) * 3)),
            0,
          ] as [number, number],
          shots: [
            s.shots[0] + (Math.random() < 0.12 ? 1 : 0),
            s.shots[1] + (Math.random() < 0.08 ? 1 : 0),
          ],
          shotsOnTarget: [
            s.shotsOnTarget[0] + (Math.random() < 0.08 ? 1 : 0),
            s.shotsOnTarget[1] + (Math.random() < 0.05 ? 1 : 0),
          ],
          corners: [
            s.corners[0] + (Math.random() < 0.06 ? 1 : 0),
            s.corners[1] + (Math.random() < 0.04 ? 1 : 0),
          ],
          fouls: [
            s.fouls[0] + (Math.random() < 0.08 ? 1 : 0),
            s.fouls[1] + (Math.random() < 0.1 ? 1 : 0),
          ],
          yellowCards: [
            s.yellowCards[0] + (Math.random() < 0.03 ? 1 : 0),
            s.yellowCards[1] + (Math.random() < 0.04 ? 1 : 0),
          ],
        }))
        const rand = Math.random()
        const isHomeEvent = Math.random() > 0.35
        const actor = match[isHomeEvent ? 'home' : 'away']
        const opponent = match[isHomeEvent ? 'away' : 'home']
        if (rand < 0.06) {
          setScore((s) =>
            isHomeEvent ? { ...s, home: s.home + 1 } : { ...s, away: s.away + 1 }
          )
          const t = [
            `${clamped}' 进球！${actor} 禁区内抽射得分！`,
            `${clamped}' 进球！${actor} 头球攻门，门将毫无反应！`,
            `${clamped}' 进球！${actor} 远射世界波！`,
          ]
          addEvent(t[Math.floor(Math.random() * t.length)], 'goal', '⚽', clamped)
        } else if (rand < 0.12) {
          const t = [
            `${clamped}' ${actor} 禁区外远射，稍稍偏出`,
            `${clamped}' ${actor} 单刀机会，被门将出击化解`,
            `${clamped}' ${actor} 任意球攻门，${rand < 0.09 ? '击中横梁！' : '高出球门'}`,
          ]
          addEvent(t[Math.floor(Math.random() * t.length)], 'chance', '📊', clamped)
        } else if (rand < 0.18) {
          const t = [
            `${clamped}' 黄牌：${actor} 战术犯规阻止反击`,
            `${clamped}' 黄牌：${actor} 铲球动作过大`,
          ]
          addEvent(t[Math.floor(Math.random() * t.length)], 'card', '🟡', clamped)
        } else if (rand < 0.25) {
          const t = [
            `${clamped}' ${actor} 控球推进，组织阵地进攻`,
            `${clamped}' ${opponent} 获得角球机会`,
            `${clamped}' ${actor} 边路传中，被${opponent}后卫解围`,
          ]
          addEvent(t[Math.floor(Math.random() * t.length)], 'info', '📋', clamped)
        }
        if (clamped === 45) addEvent("45' 半场结束", 'ht', '⏸', 45)
        if (clamped >= 90 && m < 90) addEvent("90' 常规时间结束，进入补时", 'ft', '⏱', 90)
        if (
          clamped > 0 &&
          clamped % 8 === 0 &&
          clamped !== commentaryCountRef.current
        ) {
          commentaryCountRef.current = clamped
          addEvent(
            getNextCommentaryTemplate()(match.home, match.away, score.home - score.away + 1),
            'commentary',
            '🤖',
            clamped
          )
        }
        setLiveOdds(() => {
          const goalDiff = score.home - score.away
          const baseHome = match.homeWin + goalDiff * 8
          const baseDraw = match.draw - Math.abs(goalDiff) * 5
          const baseAway = match.awayWin - goalDiff * 8
          const total = baseHome + baseDraw + baseAway
          if (total <= 0) return { home: match.homeWin, draw: match.draw, away: match.awayWin }
          return {
            home: Math.round((baseHome / total) * 100),
            draw: Math.round((baseDraw / total) * 100),
            away: Math.round((baseAway / total) * 100),
          }
        })
        return clamped
      })
    }, 2500)
    return () => clearInterval(timer)
  }, [isRunning, match, score, addEvent])

  const possessionAway = Math.round(100 - stats.possession[0])

  return (
    <div className="max-w-[1240px] mx-auto px-6 py-8 flex flex-col gap-6 relative z-[1]">
      <DataStreamCanvas />

      {/* Scoreboard — laser panel */}
      <div className="laser-panel px-10 py-8 scanline-overlay">
        {!isRunning ? (
          <div className="flex items-center justify-center gap-16">
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-5xl border-2 border-[var(--neon-cyan)]/10"
                style={{ background: 'rgba(10,13,28,0.5)' }}
              >
                {getFlagEmoji(match.homeFlag)}
              </div>
              <div className="text-xl font-bold text-[var(--text-heading)]">{match.home}</div>
            </div>
            <div className="text-center">
              <div
                className="text-2xl font-bold text-[var(--text-dim)] mb-2"
                style={{ fontFamily: 'var(--font-orbitron)' }}
              >
                VS
              </div>
              <div className="text-sm text-[var(--text-body)] font-medium">
                比赛即将开始
              </div>
              <div className="text-xs text-[var(--text-label)] mt-1">
                AI 预测比分: {match.aiScore}
              </div>
              <button onClick={() => setIsRunning(true)} className="btn-laser mt-4">
                开始直播
              </button>
            </div>
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-5xl border-2 border-[var(--neon-cyan)]/10"
                style={{ background: 'rgba(10,13,28,0.5)' }}
              >
                {getFlagEmoji(match.awayFlag)}
              </div>
              <div className="text-xl font-bold text-[var(--text-heading)]">{match.away}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-16">
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-5xl border-2 border-[var(--neon-cyan)]/10"
                style={{ background: 'rgba(10,13,28,0.5)' }}
              >
                {getFlagEmoji(match.homeFlag)}
              </div>
              <div className="text-xl font-bold text-[var(--text-heading)]">{match.home}</div>
            </div>
            <div className="text-center">
              <div className="kpi-number" style={{ fontSize: '3.5rem' }}>
                {score.home} - {score.away}
              </div>
              <div className="text-sm text-[var(--neon-amber)] mt-2">
                <span
                  className="inline-block w-2 h-2 rounded-full animate-pulse mr-1"
                  style={{
                    background: 'var(--neon-amber)',
                    boxShadow: '0 0 6px rgba(245,158,11,0.5)',
                  }}
                />
                {matchMinute}&apos;
              </div>
              <div className="text-xs text-[var(--text-label)] mt-1">
                AI 预测比分: {match.aiScore}
              </div>
            </div>
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-5xl border-2 border-[var(--neon-cyan)]/10"
                style={{ background: 'rgba(10,13,28,0.5)' }}
              >
                {getFlagEmoji(match.awayFlag)}
              </div>
              <div className="text-xl font-bold text-[var(--text-heading)]">{match.away}</div>
            </div>
          </div>
        )}
      </div>

      {isRunning && (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-5 gap-3">
            <StatCard
              label="控球率"
              value={`${Math.round(stats.possession[0])}% · ${possessionAway}%`}
            />
            <StatCard
              label="射门 / 射正"
              value={`${stats.shots[0]} / ${stats.shots[1]}`}
              sub={`${stats.shotsOnTarget[0]} / ${stats.shotsOnTarget[1]}`}
            />
            <StatCard label="角球" value={`${stats.corners[0]} / ${stats.corners[1]}`} />
            <StatCard
              label="犯规 / 黄牌"
              value={`${stats.fouls[0]} / ${stats.fouls[1]}`}
              sub={`🟡 ${stats.yellowCards[0]} / ${stats.yellowCards[1]}`}
            />
            <StatCard
              label="AI 走势"
              value={`${match.home} ${liveOdds.home}%`}
              sub="主胜倾向"
              highlight
            />
          </div>

          {/* Events + Sidebar */}
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="terminal-panel max-h-[540px] overflow-y-auto">
                {events.length === 0 && (
                  <p className="text-[var(--text-dim)] text-center py-16">
                    等待直播数据流...
                  </p>
                )}
                {events.map((e) => (
                  <TypewriterEvent key={e.id} event={e} />
                ))}
              </div>
            </div>

            {/* Sidebar: Danmaku + Odds */}
            <div className="w-[300px] flex flex-col gap-4">
              <div className="laser-panel p-4 h-[240px] overflow-hidden">
                <h3 className="text-xs text-[var(--text-dim)] uppercase tracking-widest mb-3 text-center font-mono">
                  实时弹幕
                </h3>
                <div className="flex flex-col gap-1.5 font-mono text-[11px]">
                  {danmaku.slice(0, 18).map((d) => (
                    <div
                      key={d.id}
                      className="text-xs text-[var(--text-body)]/80 whitespace-nowrap overflow-hidden"
                    >
                      {d.text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="laser-panel p-4">
                <h3 className="text-xs text-[var(--text-dim)] uppercase tracking-widest mb-4 text-center font-mono">
                  实时胜率
                </h3>
                <div className="flex justify-center gap-6">
                  <OddsBlock label="主胜" value={liveOdds.home} />
                  <OddsBlock label="平局" value={liveOdds.draw} />
                  <OddsBlock label="客胜" value={liveOdds.away} />
                </div>
              </div>

              <div className="laser-panel p-4 border-[var(--neon-amber)]/20">
                <div className="text-[10px] text-[var(--neon-cyan)]/80 uppercase tracking-widest mb-2 font-mono">
                  AI 战术洞察
                </div>
                <p className="text-xs text-[var(--text-body)] italic leading-relaxed font-mono">
                  {match.home}
                  的进攻方向偏向左路，边锋持续制造威胁。{match.away}
                  右路防守压力大，建议下半场考虑变阵加强边路保护。
                </p>
                <div className="text-[10px] text-[var(--text-dim)]/60 mt-2 text-right font-mono">
                  基于 47 项实时指标 · 更新于 {matchMinute}&apos;
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string
  value: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <div className="laser-panel p-4 text-center">
      <div className="text-[10px] text-[var(--text-label)] uppercase tracking-widest mb-2 font-mono">
        {label}
      </div>
      <div
        className={`text-lg font-bold font-mono ${
          highlight ? 'kpi-number text-[1.2rem]' : 'text-[var(--text-heading)]'
        }`}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[10px] text-[var(--text-label)] mt-1 font-mono">{sub}</div>
      )}
    </div>
  )
}

function OddsBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="kpi-number" style={{ fontSize: '1.5rem' }}>
        {value}%
      </div>
      <div className="text-[10px] text-[var(--text-label)] uppercase tracking-wide mt-1 font-mono">
        {label}
      </div>
    </div>
  )
}

export default function LivePage() {
  useEffect(() => {
    document.title = 'Predict AI | 赛事直播'
  }, [])
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh] text-[var(--text-dim)]">
          加载中...
        </div>
      }
    >
      <LiveContent />
    </Suspense>
  )
}
