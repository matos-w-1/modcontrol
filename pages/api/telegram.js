// Alerts for things that happen in the browser. The browser only says "this event happened for this id";
// the text is built here from the database, so nobody can use this route to send arbitrary messages,
// and every event is sent only once.
import { supabase } from '../../lib/supabase'
import { SITE, esc, sendTelegram, once, nameOf, fmtDay } from '../../lib/telegramServer'

const RECENT_MS = 36 * 3600000     // ignore old ids (stops replays)
const recent = iso => !iso || Date.now() - new Date(iso).getTime() < RECENT_MS

export default async function handler(req, res) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_ADMIN_CHAT_ID) return res.status(503).json({ error: 'Telegram is not configured yet.' })

  // Open /api/telegram?test=1 in the browser to check that the bot works
  if (req.method === 'GET') {
    if (!req.query.test) return res.status(405).json({ error: 'Method not allowed' })
    if (!(await once('test:' + Math.floor(Date.now() / 60000)))) return res.status(429).json({ error: 'Wait a minute before testing again.' })
    const ok = await sendTelegram('✅ <b>RollTwo Staff</b>\nTelegram alerts are working.')
    return res.status(ok ? 200 : 502).json({ ok })
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { event, id } = req.body || {}
  if (!event || !id) return res.status(400).json({ error: 'Missing event or id' })
  const skip = why => res.status(200).json({ ok: false, skipped: why })
  const done = async (text, topic) => { const ok = await sendTelegram(text, topic); return res.status(ok ? 200 : 502).json({ ok }) }

  try {
    if (event === 'vacation_request') {
      const { data: v } = await supabase.from('vacation_requests').select('*').eq('id', id).single()
      if (!v || v.status !== 'pending') return skip('not pending')
      if (!recent(v.submitted_at)) return skip('too old')
      if (!(await once('vac:' + id))) return skip('already sent')
      const mod = await nameOf(v.user_id)
      const same = v.start_date === v.end_date
      return done(
        `🌴 <b>New vacation request</b>\n<b>${esc(mod.name)}</b>${mod.shift ? ' · ' + esc(mod.shift) : ''}\n` +
        `${same ? fmtDay(v.start_date) : fmtDay(v.start_date) + ' → ' + fmtDay(v.end_date)} · ${esc(v.days_requested)} day(s)\n\nReview: ${SITE}/dashboard`, 'requests')
    }

    if (event === 'swap_pending_admin') {
      const { data: sw } = await supabase.from('shift_swaps').select('*').eq('id', id).single()
      if (!sw || sw.status !== 'pending_admin') return skip('not awaiting admin')
      if (!(await once('swap:' + id))) return skip('already sent')
      const [a, b] = await Promise.all([nameOf(sw.requester_id), nameOf(sw.target_id)])
      return done(
        `🔄 <b>Shift swap awaiting your approval</b>\n<b>${esc(a.name)}</b> gives ${fmtDay(sw.swap_date)}\n<b>${esc(b.name)}</b> gives ${fmtDay(sw.target_date)}\n` +
        (sw.notes ? `Note: ${esc(sw.notes)}\n` : '') + `\nReview: ${SITE}/dashboard`, 'requests')
    }

    if (event === 'application') {
      const { data: a } = await supabase.from('applications').select('*').eq('id', id).single()
      if (!a || a.status !== 'pending') return skip('not pending')
      if (!recent(a.created_at)) return skip('too old')
      if (!(await once('app:' + id))) return skip('already sent')
      const by = a.submitted_by ? await nameOf(a.submitted_by) : null
      return done(
        `📝 <b>New application</b>${a.type ? ' (' + esc(a.type) + ')' : ''}\n<b>${esc(a.applicant_name)}</b>` +
        (by ? `\nSubmitted by ${esc(by.name)}` : '') + `\n\nReview: ${SITE}/dashboard`, 'requests')
    }

    if (event === 'dev_issue') {
      const { data: d } = await supabase.from('dev_issues').select('*').eq('id', id).single()
      if (!d) return skip('not found')
      if (!recent(d.created_at)) return skip('too old')
      if (!(await once('issue:' + id))) return skip('already sent')
      const by = await nameOf(d.user_id)
      return done(
        `🛠 <b>New dev issue</b>${d.priority && d.priority !== 'normal' ? ' · ' + esc(String(d.priority).toUpperCase()) : ''}\n<b>${esc(d.title)}</b>\nFrom ${esc(by.name)}` +
        (d.description ? `\n${esc(String(d.description).slice(0, 300))}` : '') + `\n\nReview: ${SITE}/dashboard`, 'reports')
    }

    if (event === 'report_flag') {
      const { data: r } = await supabase.from('daily_reports').select('*').eq('id', id).single()
      if (!r || !(r.has_bug || r.has_exploit)) return skip('no flag')
      if (!recent(r.created_at || (r.report_date ? r.report_date + 'T23:59:00Z' : null))) return skip('too old')
      if (!(await once('rep:' + id))) return skip('already sent')
      const by = await nameOf(r.user_id)
      const flags = [r.has_exploit ? 'EXPLOIT' : null, r.has_bug ? 'BUG' : null].filter(Boolean).join(' + ')
      return done(
        `🚨 <b>Daily report flagged: ${flags}</b>\n<b>${esc(by.name)}</b>${r.shift ? ' · ' + esc(r.shift) : ''}\n` +
        (r.dev_notes ? `${esc(String(r.dev_notes).slice(0, 400))}\n` : '') + `\nReview: ${SITE}/dashboard`, 'reports')
    }

    return res.status(400).json({ error: 'Unknown event' })
  } catch (e) {
    return res.status(500).json({ error: 'Could not send the alert.' })
  }
}
