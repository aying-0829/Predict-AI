'use client'

import { PlayCircle, Clock, TelevisionSimple } from 'phosphor-react'
import { VIDEO_ITEMS } from './data'

export default function VideoTab() {
  return (
    <div className="laser-panel">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border-laser)]">
        <TelevisionSimple size={18} className="text-[var(--neon-cyan)]" />
        <span className="text-sm font-bold text-[var(--text-heading)]">比赛视频</span>
        <span className="text-[10px] text-[var(--text-dim)] ml-auto">
          {VIDEO_ITEMS.length} 个视频
        </span>
      </div>

      {/* Video list */}
      <div className="divide-y divide-[var(--border-laser)]/20">
        {VIDEO_ITEMS.map((video, i) => (
          <div
            key={i}
            className="flex gap-4 p-4 cursor-pointer hover:bg-[rgba(0,240,255,0.03)] transition-colors items-center"
          >
            {/* Thumbnail placeholder */}
            <div
              className="w-40 h-24 rounded-lg flex-shrink-0 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(0,240,255,0.08), rgba(255,0,170,0.05))`,
                border: '1px solid var(--border-laser)',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                >
                  <PlayCircle size={22} weight="fill" className="text-[var(--neon-cyan)]" />
                </div>
              </div>
              {/* Duration badge */}
              <div
                className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono"
                style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}
              >
                {video.duration}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-[var(--text-heading)] mb-1.5 line-clamp-2 leading-snug">
                {video.title}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--text-label)]">{video.source}</span>
                <span className="text-[var(--text-dim)]/30">·</span>
                <Clock size={10} className="text-[var(--text-dim)]" />
                <span className="text-[10px] text-[var(--text-dim)]">{video.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
