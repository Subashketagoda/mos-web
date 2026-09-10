// instrumentation.ts
// Next.js automatic server hook: launches the real-time push daemon on server start

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.GITHUB_PAGES !== 'true') {
    try {
      const { startPushBridge } = await import('./lib/pushBridge');
      startPushBridge();
    } catch (err) {
      console.warn('Push bridge startup notice:', err);
    }
  }
}
