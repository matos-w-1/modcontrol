// Internal test accounts: hidden from every calendar view (still manageable
// under Moderators / Shift Schedule). Add more names here if needed.
const TEST_ACCOUNT_NAMES = ['test', 'test account']

// One palette for every calendar: shifts and statuses use clearly different colors.
export const SHIFT_COLORS = { 'Morning Shift':'#3b82f6', 'Afternoon Shift':'#ef4444', 'Night Shift':'#22c55e' }

export function isTestAccount(p) { return TEST_ACCOUNT_NAMES.includes((p?.name || '').trim().toLowerCase()) }

// Tells the admins' Telegram chat that something new needs them. Fire-and-forget: it never blocks or breaks the page.
export function notifyAdmins(event, id) {
  try { fetch('/api/telegram', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ event, id }) }).catch(()=>{}) } catch(e) {}
}

export function fmtTime(iso) { if (!iso) return '—'; return new Date(iso).toLocaleTimeString('en-US',{ hour:'numeric', minute:'2-digit', hour12:true }) }

export function fmtHourShort(t) {
  // "17:00" or "17:00:00" -> "5PM"
  const h = parseInt(String(t).slice(0,2),10)
  if (isNaN(h)) return String(t)
  return `${h%12===0?12:h%12}${h>=12 && h<24 ? 'PM' : 'AM'}`
}

export function fmtDate(d)   { if (!d) return '—'; return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) }

// Converts a Date to 'YYYY-MM-DD' using its LOCAL calendar date, not UTC.
// date.toISOString() converts to UTC first, which silently shifts the date
// by a day for anyone in a timezone ahead of UTC (e.g. Portugal in summer) —
// that was causing vacation/calendar days to be off by one.
export function toLocalISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export function elapsed(from) {
  if (!from) return '—'
  const mins = Math.floor((Date.now() - new Date(from)) / 60000)
  const h = Math.floor(mins / 60), m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

// Counts days in [start,end] that are NOT one of this mod's recurring
// weekly days off (accounts for rotating_days_off_alt on odd months,
// same rule the calendar view uses) — used for vacation-day counting,
// since a fixed Mon-Fri assumption is wrong for mods who work weekends.
export function workingDaysInRange(start, end, profile) {
  let count = 0
  const cur = new Date(start)
  const last = new Date(end)
  while (cur <= last) {
    const isEvenMonth = (cur.getMonth()+1) % 2 === 0
    const offNames = profile?.rotating_days_off
      ? (isEvenMonth ? (profile.days_off||[]) : (profile.rotating_days_off_alt||[]))
      : (profile?.days_off||[])
    const dayName = cur.toLocaleDateString('en-GB',{weekday:'long'})
    if (!offNames.includes(dayName)) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

export function formatHours(minutes) { const h=Math.floor(minutes/60), m=minutes%60; return m>0?`${h}h ${m}m`:`${h}h` }

export function getWeekRange() {
  const now=new Date(), monday=new Date(now)
  monday.setDate(now.getDate()-((now.getDay()+6)%7)); monday.setHours(0,0,0,0)
  const sunday=new Date(monday); sunday.setDate(monday.getDate()+6); sunday.setHours(23,59,59,999)
  return { monday, sunday }
}

export function pillColor(status) {
  const map = { pending:{bg:'#f59e0b22',col:'#f59e0b'}, approved:{bg:'#34d39922',col:'#34d399'}, declined:{bg:'#f8717122',col:'#f87171'}, working:{bg:'#34d39922',col:'#34d399'}, lunch:{bg:'#f59e0b22',col:'#f59e0b'}, done:{bg:'#94a3b822',col:'#94a3b8'}, active:{bg:'#34d39922',col:'#34d399'}, inactive:{bg:'#f8717122',col:'#f87171'}, left:{bg:'#f8717122',col:'#f87171'} }
  return map[status] || {bg:'#94a3b822',col:'#94a3b8'}
}
