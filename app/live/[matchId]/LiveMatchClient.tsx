'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

/* ================================================================
   Types
   ================================================================ */
interface MatchData {
  id: number
  source_id: number
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  home_scorers: string
  away_scorers: string
  status: string
  group_name: string
  stadium: string
  match_date: string
  match_time: string
  time_elapsed: string
  matchday: number | null
  match_type: string
  finished: number
}

/* ================================================================
   Flag Emoji Map
   ================================================================ */
const FLAG_EMOJI: Record<string, string> = {
  'morocco': '\u{1F1F2}\u{1F1E6}', 'senegal': '\u{1F1F8}\u{1F1F3}',
  'nigeria': '\u{1F1F3}\u{1F1EC}', 'ghana': '\u{1F1EC}\u{1F1ED}',
  'tunisia': '\u{1F1F9}\u{1F1F3}', 'cameroon': '\u{1F1E8}\u{1F1F2}',
  'egypt': '\u{1F1EA}\u{1F1EC}', 'algeria': '\u{1F1E9}\u{1F1FF}',
  'south africa': '\u{1F1FF}\u{1F1E6}',
  'c\u00F4te d\'ivoire': '\u{1F1E8}\u{1F1EE}', 'ivory coast': '\u{1F1E8}\u{1F1EE}',
  'japan': '\u{1F1EF}\u{1F1F5}', 'south korea': '\u{1F1F0}\u{1F1F7}',
  'korea republic': '\u{1F1F0}\u{1F1F7}',
  'iran': '\u{1F1EE}\u{1F1F7}', 'saudi arabia': '\u{1F1F8}\u{1F1E6}',
  'qatar': '\u{1F1F6}\u{1F1E6}', 'australia': '\u{1F1E6}\u{1F1FA}',
  'china': '\u{1F1E8}\u{1F1F3}', 'uzbekistan': '\u{1F1FA}\u{1F1FF}',
  'united arab emirates': '\u{1F1E6}\u{1F1EA}', 'iraq': '\u{1F1EE}\u{1F1F6}',
  'jordan': '\u{1F1EF}\u{1F1F4}',
  'england': '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}',
  'france': '\u{1F1EB}\u{1F1F7}', 'germany': '\u{1F1E9}\u{1F1EA}',
  'spain': '\u{1F1EA}\u{1F1F8}', 'portugal': '\u{1F1F5}\u{1F1F9}',
  'italy': '\u{1F1EE}\u{1F1F9}', 'netherlands': '\u{1F1F3}\u{1F1F1}',
  'belgium': '\u{1F1E7}\u{1F1EA}', 'croatia': '\u{1F1ED}\u{1F1F7}',
  'switzerland': '\u{1F1E8}\u{1F1ED}', 'denmark': '\u{1F1E9}\u{1F1F0}',
  'sweden': '\u{1F1F8}\u{1F1EA}', 'poland': '\u{1F1F5}\u{1F1F1}',
  'serbia': '\u{1F1F7}\u{1F1F8}', 'austria': '\u{1F1E6}\u{1F1F9}',
  'ukraine': '\u{1F1FA}\u{1F1E6}', 'turkey': '\u{1F1F9}\u{1F1F7}',
  'czech republic': '\u{1F1E8}\u{1F1FF}', 'norway': '\u{1F1F3}\u{1F1F4}',
  'scotland': '\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}',
  'wales': '\u{1F3F4}\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}',
  'hungary': '\u{1F1ED}\u{1F1FA}', 'romania': '\u{1F1F7}\u{1F1F4}',
  'greece': '\u{1F1EC}\u{1F1F7}', 'slovakia': '\u{1F1F8}\u{1F1F0}',
  'slovenia': '\u{1F1F8}\u{1F1EE}',
  'republic of ireland': '\u{1F1EE}\u{1F1EA}', 'ireland': '\u{1F1EE}\u{1F1EA}',
  'bosnia and herzegovina': '\u{1F1E7}\u{1F1E6}',
  'argentina': '\u{1F1E6}\u{1F1F7}', 'brazil': '\u{1F1E7}\u{1F1F7}',
  'uruguay': '\u{1F1FA}\u{1F1FE}', 'colombia': '\u{1F1E8}\u{1F1F4}',
  'chile': '\u{1F1E8}\u{1F1F1}', 'peru': '\u{1F1F5}\u{1F1EA}',
  'ecuador': '\u{1F1EA}\u{1F1E8}', 'paraguay': '\u{1F1F5}\u{1F1FE}',
  'venezuela': '\u{1F1FB}\u{1F1EA}', 'bolivia': '\u{1F1E7}\u{1F1F4}',
  'united states': '\u{1F1FA}\u{1F1F8}', 'usa': '\u{1F1FA}\u{1F1F8}',
  'mexico': '\u{1F1F2}\u{1F1FD}', 'canada': '\u{1F1E8}\u{1F1E6}',
  'costa rica': '\u{1F1E8}\u{1F1F7}', 'panama': '\u{1F1F5}\u{1F1E6}',
  'jamaica': '\u{1F1EF}\u{1F1F2}', 'honduras': '\u{1F1ED}\u{1F1F3}',
  'el salvador': '\u{1F1F8}\u{1F1FB}', 'haiti': '\u{1F1ED}\u{1F1F9}',
  'new zealand': '\u{1F1F3}\u{1F1FF}',
}

function getFlagEmoji(name: string): string {
  const key = name.toLowerCase().trim()
  return FLAG_EMOJI[key] || '\u{1F3F3}\uFE0F'
}

/* ================================================================
   Status helpers
   ================================================================ */
function statusLabel(s: string, te: string): string {
  if (s === 'finished') return '\u5DF2\u7ED3\u675F'
  if (s === 'live') return `\u8FDB\u884C\u4E2D ${te}'`
  return '\u5373\u5C06\u5F00\u59CB'
}

function statusColor(s: string): string {
  if (s === 'finished') return 'text-[var(--text-dim)]'
  if (s === 'live') return 'text-emerald-400'
  return 'text-amber-400'
}

/* ================================================================
   Scorers parser
   ================================================================ */
function parseScorers(raw: string): string[] {
  if (!raw || raw === 'null' || raw === '[]') return []
  return raw.split(',').map((s) => s.trim()).filter((s) => s.length > 0 && s !== 'null')
}

/* ================================================================
   Main Component
   ================================================================ */
type TabId = 'info' | 'scorers' | 'analysis'

export default function LiveMatchClient({
  match,
  allMatches,
}: {
  match: MatchData
  allMatches: MatchData[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>('info')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterGroup, setFilterGroup] = useState<string>('all')

  const groups = useMemo(() => {
    const gs = new Set(allMatches.map((m) => m.group_name).filter(Boolean))
    return Array.from(gs).sort()
  }, [allMatches])

  const filteredMatches = useMemo(() => {
    return allMatches.filter((m) => {
      if (filterGroup !== 'all' && m.group_name !== filterGroup) return false
      if (filterStatus === 'finished' && !m.finished) return false
      if (filterStatus === 'live' && m.status !== 'live') return false
      if (filterStatus === 'upcoming' && (m.finished || m.status === 'live')) return false
      return true
    })
  }, [allMatches, filterGroup, filterStatus])

  const handleMatchChange = (id: number) => {
    router.push(`/live/${id}`)
  }

  const showScore =
    match.home_score !== null &&
    match.away_score !== null &&
    match.status !== 'scheduled'

  return (
    <div className="max-w-[960px] mx-auto px-6 py-6 flex flex-col gap-5 relative z-[1]">
      {/* Match Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0">
          <select
            value={match.id}
            onChange={(e) => handleMatchChange(Number(e.target.value))}
            className="w-full bg-[rgba(10,13,28,0.8)] border border-[var(--neon-cyan)]/20 text-[var(--text-body)] text-sm px-4 py-2.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-[var(--neon-cyan)]/50"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27%3E%3Cpath d=%27M2 4l4 4 4-4%27 fill=%27none%27 stroke=%27%2300f0ff%27 stroke-width=%271.5%27/%3E%3C/svg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              paddingRight: '36px',
            }}
          >
            {filteredMatches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.home_team} vs {m.away_team}
                {m.finished ? ` (${m.home_score}-${m.away_score})` : ''}
                {m.status === 'live' ? ' [LIVE]' : ''}
                {' \u2014 '}{m.group_name}
              </option>
            ))}
          </select>
        </div>
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="bg-[rgba(10,13,28,0.8)] border border-[var(--neon-cyan)]/15 text-[var(--text-body)] text-xs px-3 py-2.5 rounded-lg cursor-pointer focus:outline-none"
        >
          <option value="all">{'\u5168\u90E8\u7EC4\u522B'}</option>
          {groups.map((g) => (
            <option key={g} value={g}>{g} {'\u7EC4'}</option>
          ))}
        </select>
        <div className="flex rounded-lg overflow-hidden border border-[var(--neon-cyan)]/15">
          {(['all', 'finished', 'live', 'upcoming'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-2.5 transition-colors ${
                filterStatus === s
                  ? 'bg-[var(--neon-cyan)]/15 text-[var(--neon-cyan)]'
                  : 'bg-transparent text-[var(--text-dim)] hover:text-[var(--text-body)]'
              }`}
            >
              {s === 'all' ? '\u5168\u90E8' : s === 'finished' ? '\u5DF2\u7ED3\u675F' : s === 'live' ? '\u8FDB\u884C\u4E2D' : '\u5373\u5C06\u5F00\u59CB'}
            </button>
          ))}
        </div>
      </div>

      {/* Scoreboard */}
      <div className="laser-panel px-10 py-8 scanline-overlay">
        <div className="flex items-center justify-center gap-12 md:gap-20">
          <div className="text-center flex-shrink-0">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-5xl border-2 border-[var(--neon-cyan)]/10"
              style={{ background: 'rgba(10,13,28,0.5)' }}
            >
              {getFlagEmoji(match.home_team)}
            </div>
            <div className="text-lg md:text-xl font-bold text-[var(--text-heading)] truncate max-w-[120px]">
              {match.home_team}
            </div>
          </div>

          <div className="text-center flex-shrink-0">
            {showScore ? (
              <>
                <div className="kpi-number text-4xl md:text-5xl">
                  {match.home_score} - {match.away_score}
                </div>
                <div className={`text-sm mt-2 font-mono ${statusColor(match.status)}`}>
                  {statusLabel(match.status, match.time_elapsed)}
                </div>
              </>
            ) : (
              <>
                <div
                  className="text-2xl font-bold text-[var(--text-dim)] mb-2"
                  style={{ fontFamily: 'var(--font-orbitron)' }}
                >
                  VS
                </div>
                <div className={`text-sm font-medium font-mono ${statusColor(match.status)}`}>
                  {match.match_time || 'TBD'}
                </div>
              </>
            )}
          </div>

          <div className="text-center flex-shrink-0">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-5xl border-2 border-[var(--neon-cyan)]/10"
              style={{ background: 'rgba(10,13,28,0.5)' }}
            >
              {getFlagEmoji(match.away_team)}
            </div>
            <div className="text-lg md:text-xl font-bold text-[var(--text-heading)] truncate max-w-[120px]">
              {match.away_team}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-5 text-xs text-[var(--text-label)] font-mono">
          <span>{match.group_name}</span>
          <span>{'\u00B7'}</span>
          <span>{match.stadium || 'TBD'}</span>
          <span>{'\u00B7'}</span>
          <span>{match.match_date} {match.match_time}</span>
          {match.matchday ? <><span>{'\u00B7'}</span><span>Matchday {match.matchday}</span></> : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--neon-cyan)]/10">
        {([
          ['info', '\u4FE1\u606F'],
          ['scorers', '\u8FDB\u7403\u8005'],
          ['analysis', '\u5206\u6790'],
        ] as [TabId, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === id
                ? 'border-[var(--neon-cyan)] text-[var(--neon-cyan)]'
                : 'border-transparent text-[var(--text-dim)] hover:text-[var(--text-body)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="laser-panel p-6 min-h-[200px]">
        {activeTab === 'info' && <InfoTab match={match} />}
        {activeTab === 'scorers' && <ScorersTab match={match} />}
        {activeTab === 'analysis' && <AnalysisTab match={match} allMatches={allMatches} />}
      </div>
    </div>
  )
}

/* ================================================================
   Info Tab
   ================================================================ */
function InfoTab({ match }: { match: MatchData }) {
  const rows: [string, string][] = [
    ['\u4E3B\u961F', match.home_team],
    ['\u5BA2\u961F', match.away_team],
  ]
  if (match.home_score !== null && match.away_score !== null) {
    rows.push(['\u6BD4\u5206', `${match.home_score} - ${match.away_score}`])
  }
  rows.push(
    ['\u7EC4\u522B', match.group_name],
    ['\u573A\u9986', match.stadium || '-'],
    ['\u65E5\u671F', `${match.match_date} ${match.match_time}`],
    ['\u72B6\u6001', match.status === 'finished' ? '\u5DF2\u7ED3\u675F' : match.status === 'live' ? '\u8FDB\u884C\u4E2D' : '\u5373\u5C06\u5F00\u59CB'],
  )
  if (match.time_elapsed && match.status === 'live') {
    rows.push(['\u6BD4\u8D5B\u65F6\u95F4', `${match.time_elapsed}'`])
  }
  if (match.matchday) {
    rows.push(['\u6BD4\u8D5B\u65E5', `\u7B2C ${match.matchday} \u8F6E`])
  }
  rows.push(['\u8D5B\u4E8B\u7C7B\u578B', match.match_type])

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between border-b border-[var(--neon-cyan)]/5 pb-2">
          <span className="text-[var(--text-label)] text-sm">{label}</span>
          <span className="text-[var(--text-body)] text-sm font-medium">{value}</span>
        </div>
      ))}
    </div>
  )
}

/* ================================================================
   Scorers Tab
   ================================================================ */
function ScorersTab({ match }: { match: MatchData }) {
  const homeScorers = parseScorers(match.home_scorers)
  const awayScorers = parseScorers(match.away_scorers)

  if (homeScorers.length === 0 && awayScorers.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-dim)] text-sm">
        {match.finished ? '\u6682\u65E0\u8FDB\u7403\u8005\u6570\u636E' : '\u6BD4\u8D5B\u5C1A\u672A\u5F00\u59CB'}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-bold text-[var(--text-heading)] mb-3 flex items-center gap-2">
          <span className="text-xl">{getFlagEmoji(match.home_team)}</span>
          {match.home_team}
          {match.home_score !== null && (
            <span className="text-[var(--neon-cyan)] ml-auto">{match.home_score}</span>
          )}
        </h3>
        {homeScorers.length > 0 ? (
          <ul className="space-y-1.5">
            {homeScorers.map((s, i) => (
              <li key={i} className="text-sm text-[var(--text-body)] flex items-center gap-2 pl-2 border-l-2 border-emerald-500/30">
                <span className="text-emerald-400 text-xs">{'\u26BD'}</span>
                {s}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-[var(--text-dim)]">-</p>
        )}
      </div>
      <div>
        <h3 className="text-sm font-bold text-[var(--text-heading)] mb-3 flex items-center gap-2">
          <span className="text-xl">{getFlagEmoji(match.away_team)}</span>
          {match.away_team}
          {match.away_score !== null && (
            <span className="text-[var(--neon-cyan)] ml-auto">{match.away_score}</span>
          )}
        </h3>
        {awayScorers.length > 0 ? (
          <ul className="space-y-1.5">
            {awayScorers.map((s, i) => (
              <li key={i} className="text-sm text-[var(--text-body)] flex items-center gap-2 pl-2 border-l-2 border-emerald-500/30">
                <span className="text-emerald-400 text-xs">{'\u26BD'}</span>
                {s}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-[var(--text-dim)]">-</p>
        )}
      </div>
    </div>
  )
}

/* ================================================================
   Analysis Tab
   ================================================================ */
interface TeamRecord { wins: number; draws: number; losses: number; gf: number; ga: number }

function AnalysisTab({
  match,
  allMatches,
}: {
  match: MatchData
  allMatches: MatchData[]
}) {
  function computeForm(team: string): TeamRecord {
    const record: TeamRecord = { wins: 0, draws: 0, losses: 0, gf: 0, ga: 0 }
    for (const m of allMatches) {
      if (!m.finished || (m.home_score === null || m.away_score === null)) continue
      if (m.home_team.toLowerCase() === team.toLowerCase()) {
        record.gf += m.home_score!
        record.ga += m.away_score!
        if (m.home_score! > m.away_score!) record.wins++
        else if (m.home_score! === m.away_score!) record.draws++
        else record.losses++
      } else if (m.away_team.toLowerCase() === team.toLowerCase()) {
        record.gf += m.away_score!
        record.ga += m.home_score!
        if (m.away_score! > m.home_score!) record.wins++
        else if (m.away_score! === m.home_score!) record.draws++
        else record.losses++
      }
    }
    return record
  }

  const homeForm = computeForm(match.home_team)
  const awayForm = computeForm(match.away_team)
  const homeTotal = homeForm.wins + homeForm.draws + homeForm.losses
  const awayTotal = awayForm.wins + awayForm.draws + awayForm.losses

  const h2h = allMatches.filter(
    (m) =>
      m.finished &&
      ((m.home_team.toLowerCase() === match.home_team.toLowerCase() &&
        m.away_team.toLowerCase() === match.away_team.toLowerCase()) ||
       (m.home_team.toLowerCase() === match.away_team.toLowerCase() &&
        m.away_team.toLowerCase() === match.home_team.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <FormCard team={match.home_team} flag={getFlagEmoji(match.home_team)} form={homeForm} total={homeTotal} />
        <FormCard team={match.away_team} flag={getFlagEmoji(match.away_team)} form={awayForm} total={awayTotal} />
      </div>

      {h2h.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[var(--text-heading)] mb-3">
            Head to Head ({h2h.length} {'\u573A'})
          </h3>
          <div className="space-y-2">
            {h2h.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2 px-3 rounded bg-[rgba(10,13,28,0.3)] text-sm">
                <span className="text-[var(--text-body)]">
                  {m.home_team} {m.home_score} - {m.away_score} {m.away_team}
                </span>
                <span className="text-[var(--text-dim)] text-xs">{m.match_date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {homeTotal === 0 && awayTotal === 0 && (
        <p className="text-center text-[var(--text-dim)] text-sm py-4">
          {'\u6682\u65E0\u5386\u53F2\u6570\u636E\u53EF\u4F9B\u5206\u6790'}
        </p>
      )}
    </div>
  )
}

function FormCard({ team, flag, form, total }: { team: string; flag: string; form: TeamRecord; total: number }) {
  if (total === 0) {
    return (
      <div className="text-center py-4 text-[var(--text-dim)] text-sm">
        <span className="text-2xl">{flag}</span>
        <p className="mt-1">{team}</p>
        <p className="text-xs mt-1">{'\u6682\u65E0\u6BD4\u8D5B\u8BB0\u5F55'}</p>
      </div>
    )
  }
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{flag}</span>
        <span className="text-sm font-bold text-[var(--text-heading)]">{team}</span>
      </div>
      <div className="flex gap-3 mb-3">
        <StatBadge label={'\u80DC'} value={form.wins} color="text-emerald-400" />
        <StatBadge label={'\u5E73'} value={form.draws} color="text-amber-400" />
        <StatBadge label={'\u8D1F'} value={form.losses} color="text-red-400" />
      </div>
      <div className="text-xs text-[var(--text-dim)] space-y-1">
        <div>{'\u8FDB\u7403'}: {form.gf} / {'\u5931\u7403'}: {form.ga}</div>
        <div>{'\u51C0\u80DC\u7403'}: {form.gf - form.ga > 0 ? '+' : ''}{form.gf - form.ga}</div>
      </div>
    </div>
  )
}

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
      <div className="text-[10px] text-[var(--text-label)] uppercase">{label}</div>
    </div>
  )
}
