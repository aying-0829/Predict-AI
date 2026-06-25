// Next.js instrumentation hook — runs on server startup
// Imports the internal task scheduler to replace Railway external cron

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./app/api/cron/scheduler')
  }
}
