export const LUNCH_LIMIT_MIN = 30  // same limit used by the attendance report

export const LUNCH_WARN_MIN  = 25  // first heads-up, 5 minutes before the limit

export let _audioCtx = null

// Must be called from a click handler so the browser allows sound later.
export function unlockLunchAlerts() {
  try {
    if (typeof window === 'undefined') return
    const AC = window.AudioContext || window.webkitAudioContext
    if (AC) {
      if (!_audioCtx) _audioCtx = new AC()
      if (_audioCtx.state === 'suspended') _audioCtx.resume()
    }
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  } catch (e) {}
}

// kind 'warn'  -> soft double beep (5 minutes left)
// kind 'alarm' -> loud two-tone alarm (lunch is over)
export function playBeep(kind = 'warn') {
  try {
    unlockLunchAlerts()
    if (!_audioCtx) return
    if (_audioCtx.state === 'suspended') _audioCtx.resume()
    if (kind === 'alarm') {
      for (let i = 0; i < 8; i++) {
        const t0 = _audioCtx.currentTime + i * 0.22
        const osc = _audioCtx.createOscillator()
        const gain = _audioCtx.createGain()
        osc.type = 'square'
        osc.frequency.value = i % 2 === 0 ? 1175 : 880
        gain.gain.setValueAtTime(0.0001, t0)
        gain.gain.exponentialRampToValueAtTime(0.7, t0 + 0.01)
        gain.gain.setValueAtTime(0.7, t0 + 0.16)
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2)
        osc.connect(gain); gain.connect(_audioCtx.destination)
        osc.start(t0); osc.stop(t0 + 0.22)
      }
    } else {
      for (let i = 0; i < 2; i++) {
        const t0 = _audioCtx.currentTime + i * 0.35
        const osc = _audioCtx.createOscillator()
        const gain = _audioCtx.createGain()
        osc.type = 'sine'; osc.frequency.value = 880
        gain.gain.setValueAtTime(0.0001, t0)
        gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25)
        osc.connect(gain); gain.connect(_audioCtx.destination)
        osc.start(t0); osc.stop(t0 + 0.3)
      }
    }
  } catch (e) {}
}

export function lunchMinutesSince(from) {
  if (!from) return 0
  return Math.max(0, Math.floor((Date.now() - new Date(from)) / 60000))
}

export const SHIFT_END_HOUR = { 'Night Shift':9, 'Morning Shift':17, 'Afternoon Shift':24 }  // wall-clock hours in Lisbon time

export const SHIFT_WARN_MIN = 10  // soft heads-up this many minutes before the shift ends

// Shift hours are Lisbon time (Europe/Lisbon: UTC+1 in summer, UTC+0 in winter), so the
// end of a shift follows the clock change by itself and does not depend on the mod's computer.
export const SHIFT_TZ = 'Europe/Lisbon'

export function lisbonParts(date) {
  const f = new Intl.DateTimeFormat('en-GB', { timeZone: SHIFT_TZ, hourCycle:'h23', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit' })
  const o = {}
  f.formatToParts(date).forEach(p => { if (p.type !== 'literal') o[p.type] = Number(p.value) })
  return o
}

// Offset of Lisbon from UTC (in ms) at a given instant: 0 in winter, 3600000 in summer.
export function lisbonOffsetMs(date) {
  const p = lisbonParts(date)
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(date.getTime() / 1000) * 1000
}

// When does the shift that started at `clockIn` end?
export function shiftEndFor(clockIn, shift) {
  const endHour = SHIFT_END_HOUR[shift]
  if (endHour === undefined) return null
  const start = new Date(clockIn)
  const p = lisbonParts(start)                                  // the clock-in day, as a Lisbon calendar date
  const guess = new Date(Date.UTC(p.year, p.month - 1, p.day, endHour, 0, 0))   // end hour read as if it were UTC (hour 24 = next midnight)
  let end = new Date(guess.getTime() - lisbonOffsetMs(guess))   // convert Lisbon wall time -> real instant
  end = new Date(guess.getTime() - lisbonOffsetMs(end))         // second pass, right at a clock change
  if (end <= start) end = new Date(end.getTime() + 86400000)
  return end
}

// Lunch can only be started from LUNCH_EDGE_MIN minutes after the shift starts
// until LUNCH_EDGE_MIN minutes before it ends. Returns an error message, or null if allowed.
const LUNCH_EDGE_MIN = 60

export function lunchWindowError(clockIn, shift) {
  if (!clockIn) return null
  const t = n => n.toLocaleTimeString('en-US',{ hour:'numeric', minute:'2-digit', hour12:true})
  const now = new Date()
  const opens = new Date(new Date(clockIn).getTime() + LUNCH_EDGE_MIN * 60000)
  if (now < opens) return `Lunch is only allowed from 1 hour after your shift starts. You can start lunch from ${t(opens)}.`
  const end = shiftEndFor(clockIn, shift)
  if (end) {
    const closes = new Date(end.getTime() - LUNCH_EDGE_MIN * 60000)
    if (now > closes) return `Lunch is not allowed in the last hour of your shift (it closed at ${t(closes)}).`
  }
  return null
}

export function fmtMinutes(m) { const h = Math.floor(m / 60), r = m % 60; return h > 0 ? `${h}h ${r}m` : `${r}m` }

// Weekly hours target depends on the shift length (5 days a week): Night 9h, Morning 8h, Afternoon 7h.
export const SHIFT_WEEKLY_TARGET_H = { 'Night Shift': 45, 'Morning Shift': 40, 'Afternoon Shift': 35 }
export function weeklyTargetMins(shift) { return (SHIFT_WEEKLY_TARGET_H[shift] || 35) * 60 }
