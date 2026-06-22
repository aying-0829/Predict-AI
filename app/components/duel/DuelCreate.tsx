'use client'

import { useState } from 'react'

interface Props {
  onCreate: (data: { opponentId: number; matchId: string; matchInfo: string; stake: number; pick: string }) => void
  onCancel: () => void
}

export default function DuelCreate({ onCreate, onCancel }: Props) {
  const [opponentQuery, setOpponentQuery] = useState('')
  const [opponentId, setOpponentId] = useState<number | null>(null)
  const [opponentName, setOpponentName] = useState('')
  const [matchId, setMatchId] = useState('')
  const [matchInfo, setMatchInfo] = useState('')
  const [stake, setStake] = useState(10)
  const [pick, setPick] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ id: number; username: string }>>([])
  const [searching, setSearching] = useState(false)

  const handleSearchOpponent = async () => {
    if (!opponentQuery.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`/api/leaderboard?type=accuracy&limit=10`)
      const data = await res.json()
      if (data.code === 0) {
        const filtered = data.data.list.filter((u: { username: string }) =>
          u.username.toLowerCase().includes(opponentQuery.toLowerCase())
        )
        setSearchResults(filtered)
      }
    } catch {
      // ignore
    } finally {
      setSearching(false)
    }
  }

  const handleSubmit = () => {
    if (!opponentId || !matchId) return
    onCreate({ opponentId, matchId, matchInfo, stake, pick })
  }

  return (
    <div className="bg-vault-surface-1 p-6 rounded-xl border border-vault-surface-3 space-y-4">
      <h3 className="text-lg font-serif text-gray-300">发起对战</h3>

      {/* 搜索对手 */}
      <div>
        <label className="text-xs text-gray-400 mb-1 block">搜索对手</label>
        <div className="flex gap-2">
          <input
            value={opponentQuery}
            onChange={(e) => setOpponentQuery(e.target.value)}
            placeholder="输入用户名搜索..."
            className="flex-1 p-2 border border-vault-surface-3 rounded-lg text-sm text-gray-300 bg-vault-surface-2 focus:outline-none focus:border-vault-gold-primary"
          />
          <button
            onClick={handleSearchOpponent}
            disabled={searching}
            className="px-4 py-2 rounded-lg text-sm bg-vault-gold-primary text-vault-surface-0 font-semibold hover:bg-vault-gold-primary/80 disabled:opacity-50"
          >
            {searching ? '搜索中...' : '搜索'}
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="mt-2 bg-vault-surface-2 rounded-lg border border-vault-surface-3 max-h-40 overflow-y-auto">
            {searchResults.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setOpponentId(u.id)
                  setOpponentName(u.username)
                  setSearchResults([])
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-vault-surface-3 transition-colors ${
                  opponentId === u.id ? 'text-vault-gold-primary' : 'text-gray-300'
                }`}
              >
                {u.username}
              </button>
            ))}
          </div>
        )}
        {opponentName && (
          <p className="text-xs text-vault-gold-primary mt-1">已选择对手: {opponentName}</p>
        )}
      </div>

      {/* 比赛信息 */}
      <div>
        <label className="text-xs text-gray-400 mb-1 block">比赛 ID</label>
        <input
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
          placeholder="如 s1, worldcup-01"
          className="w-full p-2 border border-vault-surface-3 rounded-lg text-sm text-gray-300 bg-vault-surface-2 focus:outline-none focus:border-vault-gold-primary"
        />
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-1 block">比赛描述</label>
        <input
          value={matchInfo}
          onChange={(e) => setMatchInfo(e.target.value)}
          placeholder="如 巴西 vs 阿根廷"
          className="w-full p-2 border border-vault-surface-3 rounded-lg text-sm text-gray-300 bg-vault-surface-2 focus:outline-none focus:border-vault-gold-primary"
        />
      </div>

      {/* 预测选择 */}
      <div>
        <label className="text-xs text-gray-400 mb-1 block">你的预测</label>
        <div className="flex gap-2">
          {['home', 'draw', 'away'].map((p) => (
            <button
              key={p}
              onClick={() => setPick(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pick === p
                  ? 'bg-vault-gold-primary text-vault-surface-0'
                  : 'bg-vault-surface-2 text-gray-400 border border-vault-surface-3 hover:border-vault-gold-primary'
              }`}
            >
              {p === 'home' ? '主胜' : p === 'draw' ? '平局' : '客胜'}
            </button>
          ))}
        </div>
      </div>

      {/* 赌注 */}
      <div>
        <label className="text-xs text-gray-400 mb-1 block">积分赌注</label>
        <div className="flex gap-2">
          {[5, 10, 20, 50, 100].map((s) => (
            <button
              key={s}
              onClick={() => setStake(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                stake === s
                  ? 'bg-vault-gold-primary text-vault-surface-0'
                  : 'bg-vault-surface-2 text-gray-400 border border-vault-surface-3 hover:border-vault-gold-primary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg text-sm border border-vault-surface-3 text-gray-400 hover:text-gray-300"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          disabled={!opponentId || !matchId}
          className="flex-1 py-2 rounded-lg text-sm bg-vault-gold-primary text-vault-surface-0 font-semibold hover:bg-vault-gold-primary/80 disabled:opacity-50"
        >
          发起对战
        </button>
      </div>
    </div>
  )
}
