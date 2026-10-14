// Browser features used by focus mode. Every call is wrapped in try/catch,
// because older phones may not support them. The timer works without them.

/** A soft two-note chime, made with Web Audio (no sound file needed). */
export function chime() {
  try {
    const ctx = new AudioContext()
    ;[660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const t = ctx.currentTime + i * 0.3
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.15, t + 0.03) // gentle fade in
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4) // long soft fade out
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 1.5)
    })
    setTimeout(() => ctx.close(), 2500)
  } catch {
    // no audio: fine
  }
}

export const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window

/** Show a notification. On phones this must go through the service worker. */
export async function notify(title: string, body: string) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) await reg.showNotification(title, { body, icon: `${import.meta.env.BASE_URL}pwa-192.png`, tag: 'focus' })
    else new Notification(title, { body })
  } catch {
    // notifications blocked: the chime still plays
  }
}

/** Keep the screen awake. Returns a function that lets it sleep again. */
export async function keepAwake(): Promise<() => void> {
  try {
    const lock = await navigator.wakeLock?.request('screen')
    return () => void lock?.release().catch(() => {})
  } catch {
    return () => {}
  }
}
