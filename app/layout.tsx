import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Orbitron, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Header from './components/Header'
import { ToastProvider } from './components/Toast'
import { SearchProvider } from './components/search/SearchProvider'
import { I18nProvider } from '@/lib/i18n'
import { ErrorBoundary } from './components/ErrorBoundary'

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-orbitron',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Predict AI',
    default: 'Predict AI - 体育赛事AI预测平台',
  },
  description:
    '基于AI的足球赛事预测、即时比分、世界杯分析。深度学习模型驱动的体育赛事智能预测平台。',
  keywords: [
    'AI预测',
    '双色球',
    '大乐透',
    '福彩3D',
    '竞彩足球',
    '世界杯',
    'AI选号',
    '赛事预测',
    '概率预测',
    '体育预测',
    '足球预测',
  ],
  manifest: '/manifest.json',
  openGraph: {
    title: 'Predict AI - 体育赛事AI预测平台',
    description:
      '基于AI的足球赛事预测、即时比分、世界杯分析。深度学习模型驱动的体育赛事智能预测平台。',
    url: 'https://motivated-fulfillment-production-1d77.up.railway.app',
    siteName: 'Predict AI',
    locale: 'zh_CN',
    type: 'website',
    images: [
      {
        url: 'https://motivated-fulfillment-production-1d77.up.railway.app/icon.svg',
        width: 512,
        height: 512,
        alt: 'Predict AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Predict AI - 体育赛事AI预测平台',
    description:
      '基于AI的足球赛事预测、即时比分、世界杯分析。深度学习模型驱动的体育赛事智能预测平台。',
    images: ['https://motivated-fulfillment-production-1d77.up.railway.app/icon.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-CN"
      className={`scroll-smooth dark ${orbitron.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Predict AI" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'PREDICT AI',
              description: 'AI-powered sports and lottery prediction platform',
              url: 'https://motivated-fulfillment-production-1d77.up.railway.app',
              applicationCategory: 'SportsApplication',
            }),
          }}
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-[var(--neon-cyan)] focus:text-black focus:rounded-lg"
        >
          跳转到主要内容
        </a>
        <ToastProvider>
          <I18nProvider>
            <SearchProvider>
              <Header />
              <ErrorBoundary silent>
                <main id="main-content" role="main" className="relative z-[1]">
                  {children}
                </main>
              </ErrorBoundary>
              {/* 激光蚀刻风格 Footer */}
              <footer className="relative text-xs text-center py-8 border-t border-[var(--border-laser)] bg-[rgba(10,10,15,0.95)] text-[var(--text-dim)] z-[1]">
                <div className="max-w-5xl mx-auto px-6">
                  <p className="tracking-wider font-mono text-[10px] uppercase mb-1 text-[var(--text-label)]">
                    <span className="text-[var(--neon-cyan)]">/</span> DISCLAIMER
                  </p>
                  <p>本工具仅供娱乐参考，不构成投注建议。AI 预测基于历史数据统计模型，不保证准确性。</p>
                  <p className="mt-2 font-orbitron text-[11px] tracking-[0.2em] text-[var(--text-label)]">
                    &copy; 2026 PREDICT AI{' '}
                    <span className="text-[var(--neon-cyan)]">//</span> ALL RIGHTS RESERVED
                  </p>
                </div>
              </footer>
            </SearchProvider>
          </I18nProvider>
        </ToastProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) { console.log('SW registered:', registration.scope); },
                    function(err) { console.log('SW registration failed:', err); }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
