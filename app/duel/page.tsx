'use client'

import { useState, useEffect, useCallback } from 'react'
import DuelCreate from '@/app/components/duel/DuelCreate'
import DuelCard from '@/app/components/duel/DuelCard'
import DuelHistory from '@/app/components/duel/DuelHistory'
import { useToast } from '@/app/components/Toast'

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

export default function DuelPage() {
  const [duels, setDuels] = useState<DuelData[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number>(1)
  const { showToast } = useToast()

  const fetchDuels = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/duel')
      const json = await res.json()
      if (json.code === 0) {
        setDuels(json.data)
      } else if (json.code === -1) {
        // not authenticated - show empty
        setDuels([])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDuels()
  }, [fetchDuels])

  // Try to detect current user from leaderboard
  useEffect(() => {
    fetch('/api/leaderboard?type=accuracy&limit=1')
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data.myRank) {
          // We can't get userId from this API easily, let's use 1 as default
        }
      })
      .catch(() => {})
  }, [])

  const handleCreate = async (data: {
    opponentId: number
    matchId: string
    matchInfo: string
    stake: number
    pick: string
  }) => {
    try {
      const res = await fetch('/api/duel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.code === 0) {
        showToast('对战邀请已发送！', 'success')
        setShowCreate(false)
        fetchDuels()
      } else {
        showToast(json.message || '创建失败', 'error')
      }
    } catch {
      showToast('网络错误', 'error')
    }
  }

  const handleAccept = async (duelId: number, pick: string) => {
    try {
      const res = await fetch(`/api/duel/${duelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', pick }),
      })
      const json = await res.json()
      if (json.code === 0) {
        showToast('已接受对战！', 'success')
        fetchDuels()
      } else {
        showToast(json.message || '操作失败', 'error')
      }
    } catch {
      showToast('网络错误', 'error')
    }
  }

  const activeDuels = duels.filter((d) => d.result === 'pending')
  const historyDuels = duels.filter((d) => d.result !== 'pending')

  return (
    <div className="min-h-screen bg-vault-surface-0">
      <div className="max-w-[900px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-vault-gold-primary/15 border border-vault-gold-primary/30 text-vault-gold-primary text-xs font-semibold uppercase tracking-wider mb-4">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            对战模式
          </div>
          <h1 className="text-3xl font-serif text-gray-300 mb-2">1v1 预测对决</h1>
          <p className="text-sm text-gray-400">挑战好友，押注积分，证明你的预测实力</p>
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-5 py-2 rounded-lg text-sm bg-vault-gold-primary text-vault-surface-0 font-semibold hover:bg-vault-gold-primary/80"
          >
            {showCreate ? '取消' : '+ 发起对战'}
          </button>
        </div>

        {showCreate && (
          <div className="mb-6">
            <DuelCreate onCreate={handleCreate} onCancel={() => setShowCreate(false)} />
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-vault-surface-1 rounded-xl animate-pulse border border-vault-surface-3" />
            ))}
          </div>
        ) : duels.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">⚔️</p>
            <p>暂无对战记录</p>
            <p className="text-sm mt-2">发起一场对战，与好友一决高下</p>
          </div>
        ) : (
          <>
            {/* Active Duels */}
            {activeDuels.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-serif text-gray-300 mb-4">
                  进行中 ({activeDuels.length})
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {activeDuels.map((d) => (
                    <DuelCard
                      key={d.id}
                      duel={d}
                      currentUserId={currentUserId}
                      onAccept={handleAccept}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* History */}
            {historyDuels.length > 0 && (
              <section>
                <h2 className="text-lg font-serif text-gray-300 mb-4">
                  历史对战 ({historyDuels.length})
                </h2>
                <DuelHistory duels={historyDuels} currentUserId={currentUserId} />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
