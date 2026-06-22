'use client'

import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  silent?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // silent 模式静默降级
      if (this.props.silent) return null
      // fallback 显式传入 null 时也静默降级
      if (this.props.fallback === null) return null
      // 自定义 fallback
      if (this.props.fallback !== undefined) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-glass)] min-h-[200px]">
          <div className="text-4xl mb-4 text-[var(--neon-cyan)]">!</div>
          <h3 className="text-[var(--neon-cyan)] font-semibold mb-2">组件渲染异常</h3>
          <p className="text-[var(--text-dim)] text-sm mb-4 max-w-md text-center">
            {this.state.error?.message || '发生了未知错误'}
          </p>
          <button
            onClick={this.handleRetry}
            className="neon-btn"
          >
            重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
