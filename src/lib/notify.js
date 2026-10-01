export function beep(freq = 880, ms = 0.35) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.value = 0.04
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms)
    osc.stop(ctx.currentTime + ms + 0.05)
    setTimeout(() => ctx.close(), 500)
  } catch {
    // ignore
  }
}

export function vibrate(pattern = [40, 30, 40]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // ignore
  }
}

export function notifyPulse({ title = 'Scriba', body = '', freq = 880 } = {}) {
  beep(freq)
  vibrate()
  if (typeof document !== 'undefined' && document.hidden && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, { body, silent: true })
    } catch {
      // ignore
    }
  }
}
