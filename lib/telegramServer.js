// Server-side helpers for Telegram alerts (used only by pages/api/*).
// Environment variables (set in Vercel, never in the code):
//   TELEGRAM_BOT_TOKEN      token from @BotFather
//   TELEGRAM_ADMIN_CHAT_ID  id of the admin chat that receives the alerts
import { supabase } from './supabase'
import { lisbonParts, lisbonOffsetMs } from './shiftTime'

export const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://staff.terrypoker.pro'
export const SHIFT_START_HOUR = { 'Night Shift': 0, 'Morning Shift': 9, 'Afternoon Shift': 17 }
export const LATE_AFTER_MIN = 15      // "late" / "no clock in" threshold
export const NO_CLOCK_OUT_AFTER_MIN = 30   // minutes after the shift end

export const esc = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_ADMIN_CHAT_ID
  if (!token || !chat) return false
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: text.slice(0, 4000), parse_mode: 'HTML', disable_web_page_preview: true }),
    })
    return r.ok
  } catch (e) { return false }
}

// "Send each alert only once". Uses the table telegram_alerts (key is the primary key).
// If the table does not exist yet it falls back to a per-server memory, which is good enough for a test.
const mem = globalThis.__tgSent || (globalThis.__tgSent = new Map())
export async function once(key) {
  const { error } = await supabase.from('telegram_alerts').insert({ key })
  if (!error) return true
  if (error.code === '23505') return false        // already sent
  if (mem.has(key)) return false                  // table missing: remember in memory instead
  mem.set(key, Date.now())
  return true
}

export async function nameOf(id) {
  const { data } = await supabase.from('profiles').select('name,shift').eq('id', id).single()
  return data || { name: 'Unknown', shift: '' }
}

// ---------- Lisbon time helpers ----------
export function lisbonDate(date) {
  const p = lisbonParts(date)
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`
}
// Lisbon wall-clock time on a 'YYYY-MM-DD' date -> real Date
export function lisbonWall(dateStr, hour, minute = 0) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const guess = new Date(Date.UTC(y, m - 1, d, hour, minute, 0))
  let t = new Date(guess.getTime() - lisbonOffsetMs(guess))
  t = new Date(guess.getTime() - lisbonOffsetMs(t))
  return t
}
export function addDays(dateStr, n) {
  const t = new Date(dateStr + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + n)
  return t.toISOString().slice(0, 10)
}
export const fmtLisbon = d => d ? new Date(d).toLocaleTimeString('en-US', { timeZone: 'Europe/Lisbon', hour: 'numeric', minute: '2-digit', hour12: true }) : '—'
export const fmtDay = iso => iso ? new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }) : '—'
export const fmtMins = m => { m = Math.round(m); const h = Math.floor(m / 60), r = m % 60; return h > 0 ? `${h}h ${r}m` : `${r}m` }

// ---------- Who is supposed to work on a given day ----------
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Returns { shift, start } (start = real Date) if this mod is expected to work on dateStr, else null.
// Same rules as the calendars: days off (with monthly rotation), approved vacation, approved swaps, day overrides.
export function expectedShift(mod, dateStr, { vacs = [], swaps = [], overrides = [] }) {
  if (vacs.some(v => v.user_id === mod.id && dateStr >= v.start_date && dateStr <= v.end_date)) return null
  const gaveAway = swaps.some(sw => (sw.requester_id === mod.id && sw.swap_date === dateStr) || (sw.target_id === mod.id && sw.target_date === dateStr))
  if (gaveAway) return null
  const extra = swaps.some(sw => (sw.requester_id === mod.id && sw.target_date === dateStr) || (sw.target_id === mod.id && sw.swap_date === dateStr))
  const dayName = DAY_NAMES[new Date(dateStr + 'T12:00:00Z').getUTCDay()]
  if (!extra) {
    const evenMonth = Number(dateStr.slice(5, 7)) % 2 === 0
    const daysOff = mod.rotating_days_off ? (evenMonth ? mod.days_off : mod.rotating_days_off_alt) : mod.days_off
    if ((daysOff || []).includes(dayName)) return null
  }
  const ov = overrides.find(o => o.user_id === mod.id && o.day_of_week === dayName)
  const shift = ov?.shift || mod.shift
  let h = SHIFT_START_HOUR[shift], m = 0
  const t = /^(\d{1,2}):(\d{2})/.exec(ov?.start_time || '')
  if (t) { h = Number(t[1]); m = Number(t[2]) }
  if (h === undefined) return null
  return { shift, start: lisbonWall(dateStr, h, m) }
}
