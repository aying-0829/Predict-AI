'use client'

interface LoadingProps {
  rows?: number
  className?: string
}

export function Loading({ rows = 3, className = '' }: LoadingProps) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-[rgba(0,229,255,0.08)] rounded"
          style={{ width: `${85 - i * 12}%` }}
        />
      ))}
    </div>
  )
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#0c0c18] border border-[rgba(0,229,255,0.1)] rounded-xl p-5 ${className}`}>
      <div className="h-4 bg-[rgba(0,229,255,0.08)] rounded w-1/3 mb-3" />
      <div className="h-3 bg-[rgba(0,229,255,0.08)] rounded w-2/3 mb-2" />
      <div className="h-3 bg-[rgba(0,229,255,0.08)] rounded w-1/2" />
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      <div className="flex gap-4 mb-3">
        {Array.from({ length: cols }).map((_, ci) => (
          <div key={ci} className="h-4 bg-[rgba(0,229,255,0.08)] rounded flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} className="flex gap-4 mb-2">
          {Array.from({ length: cols }).map((_, ci) => (
            <div key={ci} className="h-3 bg-[rgba(0,229,255,0.08)]/60 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
