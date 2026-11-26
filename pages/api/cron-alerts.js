// Scheduled Telegram alerts. Called every ~10 minutes by .github/workflows/telegram-alerts.yml
// with the header  Authorization: Bearer <CRON_SECRET>  (CRON_SECRET is set in Vercel and in GitHub secrets).
//   - mod did not clock in (15+ min after the expected start)
//   - mod still clocked in 30+ min after the shift end
//   - mod still on lunch after the 30 min limit
//   - daily summary of the previous day (sent once, shortly after midnight, Lisbon time)
import { supabase } from '../../lib/supabase'
import { isTestAccount } from '../../lib/utils'
import { shiftEndFor, lisbonParts, LUNCH_LIMIT_MIN } from '../../lib/shiftTime'
import {
  SITE, LATE_AFTER_MIN, NO_CLOCK_OUT_AFTER_MIN, esc, sendTelegram, once,
  lisbonDate, lisbonWall, addDays, fmtLisbon, fmtMins, fmtDay, expectedShift,
} from '../../lib/telegramServer'

const MIN = 60000
const isActive = p => p.role === 'mod' && !['left', 'inactive'].includes(p.status) && !isTestAccount(p)

async function loadMods() {
  const { data } = await supabase.from('profiles')
    .select('id,name,role,status,shift,days_off,rotating_days_off,rotating_days_off_alt')
  return (data || []).filter(isActive)
}
async function loadSchedule(dates) {
  const from = dates[0], to = dates[dates.length - 1]
  const [{ data: vacs }, { data: swaps }, { data: overrides }] = await Promise.all([
    supabase.from('vacation_requests').select('user_id,start_date,end_date').eq('status', 'approved').lte('start_date', to).gte('end_date', from),
    supabase.from('shift_swaps').select('requester_id,target_id,swap_date,target_date').eq('status', 'approved'),
    supabase.from('shift_overrides').select('*'),
  ])
  return { vacs: vacs || [], swaps: swaps || [], overrides: overrides || [] }
}

async function checkNoClockIn(now, mods) {
  const today = lisbonDate(now)
  const sched = await loadSchedule([today])
  const since = new Date(now.getTime() - 30 * 3600000).toISOString()
  const { data: att } = await supabase.from('attendance').select('user_id,clock_in').gte('clock_in', since)
  let sent = 0
  for (const mod of mods) {
    const exp = expectedShift(mod, today, sched)
    if (!exp) continue
    const late = (now - exp.start) / MIN
    if (late < LATE_AFTER_MIN || late > 240) continue
    const clocked = (att || []).some(a => a.user_id === mod.id && new Date(a.clock_in) >= new Date(exp.start.getTime() - 120 * MIN))
    if (clocked) continue
    if (!(await once(`noin:${mod.id}:${today}`))) continue
    await sendTelegram(`⏰ <b>${esc(mod.name)}</b> has not clocked in\n${esc(exp.shift)} started at ${fmtLisbon(exp.start)} (${fmtMins(late)} ago)`, 'attendance')
    sent++
  }
  return sent
}

async function checkOpenSessions(now, mods) {
  const byId = Object.fromEntries(mods.map(m => [m.id, m]))
  const { data: open } = await supabase.from('attendance').select('id,user_id,clock_in,lunch_start,lunch_end,status').is('clock_out', null)
  let sent = 0
  for (const a of open || []) {
    const mod = byId[a.user_id]; if (!mod) continue
    // lunch longer than the limit
    if (a.status === 'lunch' && a.lunch_start && !a.lunch_end) {
      const mins = (now - new Date(a.lunch_start)) / MIN
      if (mins >= LUNCH_LIMIT_MIN && await once('lunch:' + a.id)) {
        await sendTelegram(`🍽 <b>${esc(mod.name)}</b> is over the lunch limit\nOn lunch for ${fmtMins(mins)} (limit ${LUNCH_LIMIT_MIN}m), since ${fmtLisbon(a.lunch_start)}`, 'attendance')
        sent++
      }
    }
    // still clocked in after the shift ended
    const end = shiftEndFor(a.clock_in, mod.shift)
    if (end) {
      const over = (now - end) / MIN
      if (over >= NO_CLOCK_OUT_AFTER_MIN && await once('noout:' + a.id)) {
        await sendTelegram(`🕒 <b>${esc(mod.name)}</b> has not clocked out\n${esc(mod.shift)} ended at ${fmtLisbon(end)} (${fmtMins(over)} ago). Clocked in at ${fmtLisbon(a.clock_in)}.`, 'attendance')
        sent++
      }
    }
  }
  return sent
}

async function dailySummary(now, mods) {
  const lp = lisbonParts(now)
  if (lp.hour >= 9 || (lp.hour === 0 && lp.minute < 15)) return 0          // only between 00:15 and 09:00 Lisbon time
  const day = addDays(lisbonDate(now), -1)
  if (!(await once('summary:' + day))) return 0

  const from = lisbonWall(day, 0), to = lisbonWall(addDays(day, 1), 0)
  const sched = await loadSchedule([day])
  const [{ data: att }, { count: vacPending }, { count: swapPending }, { count: appPending }] = await Promise.all([
    supabase.from('attendance').select('user_id,clock_in,clock_out,lunch_minutes,total_hours').gte('clock_in', from.toISOString()).lt('clock_in', to.toISOString()).order('clock_in'),
    supabase.from('vacation_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('shift_swaps').select('id', { count: 'exact', head: true }).eq('status', 'pending_admin'),
    supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])
  const byId = Object.fromEntries(mods.map(m => [m.id, m]))
  const rows = (att || []).filter(a => byId[a.user_id])
  const lines = []
  let totalH = 0, lateCount = 0
  for (const a of rows) {
    const mod = byId[a.user_id]
    const exp = expectedShift(mod, day, sched)
    const late = exp ? Math.round((new Date(a.clock_in) - exp.start) / MIN) : 0
    const flags = []
    if (late > LATE_AFTER_MIN && late < 360) { flags.push(`late ${late}m`); lateCount++ }
    if ((a.lunch_minutes || 0) > LUNCH_LIMIT_MIN) flags.push(`lunch ${a.lunch_minutes}m`)
    if (!a.clock_out) flags.push('no clock out')
    totalH += Number(a.total_hours || 0)
    lines.push(`• <b>${esc(mod.name)}</b> ${fmtLisbon(a.clock_in)}–${a.clock_out ? fmtLisbon(a.clock_out) : '?'}` +
      (a.total_hours ? ` · ${Number(a.total_hours).toFixed(1)}h` : '') + (flags.length ? ` ⚠️ ${flags.join(', ')}` : ''))
  }
  const worked = new Set(rows.map(a => a.user_id))
  const noShows = mods.filter(m => expectedShift(m, day, sched) && !worked.has(m.id)).map(m => m.name)
  let text = `📊 <b>Daily summary · ${fmtDay(day)}</b>\n${worked.size} mods worked · ${totalH.toFixed(1)}h total` +
    (lateCount ? ` · ${lateCount} late` : '') + '\n\n' + (lines.join('\n') || 'Nobody clocked in.')
  if (noShows.length) text += `\n\n❌ <b>Did not show up</b>: ${noShows.map(esc).join(', ')}`
  const pend = [vacPending && `${vacPending} vacation`, swapPending && `${swapPending} swap`, appPending && `${appPending} application`].filter(Boolean)
  text += `\n\n${pend.length ? '📥 Pending: ' + pend.join(', ') : '📥 Nothing pending'}\n${SITE}/dashboard`
  await sendTelegram(text, 'reports')
  return 1
}

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET
  if (!secret) return res.status(503).json({ error: 'CRON_SECRET is not set.' })
  if (req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: 'Unauthorized' })
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_ADMIN_CHAT_ID) return res.status(503).json({ error: 'Telegram is not configured yet.' })
  try {
    const now = new Date()
    const mods = await loadMods()
    const noClockIn = await checkNoClockIn(now, mods)
    const open = await checkOpenSessions(now, mods)
    const summary = await dailySummary(now, mods)
    return res.status(200).json({ ok: true, noClockIn, open, summary })
  } catch (e) {
    return res.status(500).json({ error: 'Job failed', detail: String(e?.message || e) })
  }
}
