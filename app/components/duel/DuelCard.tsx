'use client'

import { useState } from 'react'

interface DuelData {
  id: number
  challengerId: number
  challengerName: string
  opponentId: number
  opponentName: string
  matchId: string
  matchInfo: string
  stake: number
  challengerPick: string
  opponentPick: string
  result: string
  winnerId: number | null
  createdAt: string
  settledAt: string | null
}

interface Props {
  duel: DuelData
  currentUserId: number
  onAccept?: (duelId: number, pick: string) => void
}

export default function DuelCard({ duel, currentUserId, onAccept }: Props) {
  const [myPick, setMyPick] = useState('')
  const isChallenger = currentUserId === duel.challengerId
  const isPending = duel.result === 'pending'
  const isSettled = !isPending

  const resultLabel = () => {
    if (!isSettled) return null
    if (duel.result === 'draw') return { text: '平局', color: 'text-gray-400' }
    const won =
      (duel.result === 'challenger_win' && isChallenger) ||
      (duel.result === 'opponent_win' && !isChallenger)
    return won
      ? { text: `你赢了 +${duel.stake}分`, color: 'text-green-400' }
      : { text: `你输了 -${duel.stake}分`, color: 'text-red-400' }
  }

  const pickLabel = (p: string) => {
    if (p === 'home') return '主胜'
    if (p === 'draw') return '平局'
    if (p === 'away') return '客胜'
    return '待选择'
  }

  const result = resultLabel()

  return (
    <div className="bg-vault-surface-1 p-5 rounded-xl border border-vault-surface-3 hover:border-vault-gold-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-vault-gold-primary/10 text-vault-gold-primary border border-vault-gold-primary/20">
            {isPending ? '进行中' : '已结算'}
          </span>
          <span className="text-xs text-gray-400">{duel.createdAt?.slice(0, 10)}</span>
        </div>
        <span className="font-numeric text-sm text-vault-gold-primary font-semibold">
          赌注 {duel.stake} 分
        </span>
      </div>

      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="text-center flex-1">
          <div className="w-8 h-8 mx-auto rounded-full bg-vault-surface-2 border border-vault-surface-3 flex items-center justify-center text-xs text-gray-300">
            {duel.challengerName.charAt(0)}
          </div>
          <p className="text-xs text-gray-300 mt-1">{duel.challengerName}</p>
          <p className="text-xs text-vault-gold-dim mt-0.5">{pickLabel(duel.challengerPick)}</p>
        </div>
        <div className="text-center">
          <span className="text-lg font-bold text-vault-gold-glow">VS</span>
          {duel.matchInfo && <p className="text-xs text-gray-400 mt-0.5">{duel.matchInfo}</p>}
        </div>
        <div className="text-center flex-1">
          <div className="w-8 h-8 mx-auto rounded-full bg-vault-surface-2 border border-vault-surface-3 flex items-center justify-center text-xs text-gray-300">
            {duel.opponentName.charAt(0)}
          </div>
          <p className="text-xs text-gray-300 mt-1">{duel.opponentName}</p>
          <p className="text-xs text-vault-gold-dim mt-0.5">{pickLabel(duel.opponentPick)}</p>
        </div>
      </div>

      {result && <p className={`text-center text-sm font-semibold ${result.color}`}>{result.text}</p>}

      {isPending && !isChallenger && !duel.opponentPick && onAccept && (
        <div className="mt-3 pt-3 border-t border-vault-surface-2">
          <div className="flex gap-2 mb-2">
            {['home', 'draw', 'away'].map((p) => (
              <button
                key={p}
                onClick={() => setMyPick(p)}
                className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                  myPick === p
                    ? 'bg-vault-gold-primary text-vault-surface-0'
                    : 'bg-vault-surface-2 text-gray-400 border border-vault-surface-3'
                }`}
              >
                {pickLabel(p)}
              </button>
            ))}
          </div>
          <button
            onClick={() => myPick && onAccept(duel.id, myPick)}
            disabled={!myPick}
            className="w-full py-2 rounded-lg text-sm bg-vault-gold-primary text-vault-surface-0 font-semibold hover:bg-vault-gold-primary/80 disabled:opacity-50"
          >
            接受对战
          </button>
        </div>
      )}
    </div>
  )
}
