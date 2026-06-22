import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://motivated-fulfillment-production-1d77.up.railway.app'

  const routes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/lottery', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/lottery/deep', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/world-cup', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/live', priority: 0.8, changeFrequency: 'hourly' as const },
    { path: '/community', priority: 0.7, changeFrequency: 'daily' as const },
    { path: '/odds', priority: 0.7, changeFrequency: 'daily' as const },
    { path: '/leaderboard', priority: 0.6, changeFrequency: 'weekly' as const },
    { path: '/ai-chat', priority: 0.6, changeFrequency: 'weekly' as const },
    { path: '/news', priority: 0.6, changeFrequency: 'daily' as const },
    { path: '/member', priority: 0.6, changeFrequency: 'weekly' as const },
    { path: '/share', priority: 0.5, changeFrequency: 'weekly' as const },
    { path: '/login', priority: 0.4, changeFrequency: 'monthly' as const },
  ]

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))
}
