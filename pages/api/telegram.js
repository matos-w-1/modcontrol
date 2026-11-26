// Sends alerts to the admins' Telegram chat.
// Needs two environment variables (set them in Vercel, never in the code):
//   TELEGRAM_BOT_TOKEN      - token from @BotFather
//   TELEGRAM_ADMIN_CHAT_ID  - id of the admin group / chat that should receive the alerts
//
// The browser can only say "this event happened for this id". The text of the
// message is built here from the database, so nobody can use this route to
// send arbitrary messages, and each event is only sent once.
import { supabase } from '../../lib/supabase'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT  = process.env.TELEGRAM_ADMIN_CHAT_ID
const SITE  = process.env.NEXT_PUBLIC_SITE_URL || 'https://staff.terrypoker.pro'

// Best-effort memory of what was already sent (per server instance)
const sent = globalThis.__tgSent || (globalThis.__tgSent = new Map())
function firstTime(key, ttlMs) {
  const now = Date.now()
  for (const [k, t] of sent) if (now - t > 3600000) sent.delete(k)
  const last = sent.get(key)
  if (last && now - last < ttlMs) return false
  sent.set(key, now)
  return true
}

const esc = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const day = iso => iso ? new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }) : '—'

async function send(text) {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT, text, parse_mode: 'HTML', disable_web_page_preview: true }),
  })
  return r.ok
}

async function nameOf(id) {
  const { data } = await supabase.from('profiles').select('name,shift').eq('id', id).single()
  return data || { name: 'Unknown', shift: '' }
}

export default async function handler(req, res) {
  if (!TOKEN || !CHAT) return res.status(503).json({ error: 'Telegram is not configured yet.' })

  // Open /api/telegram?test=1 in the browser to check that the bot works
  if (req.method === 'GET') {
    if (!req.query.test) return res.status(405).json({ error: 'Method not allowed' })
    if (!firstTime('test', 60000)) return res.status(429).json({ error: 'Wait a minute before testing again.' })
    const ok = await send('✅ <b>RollTwo Staff</b>\nTelegram alerts are working.')
    return res.status(ok ? 200 : 502).json({ ok })
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { event, id } = req.body || {}
  if (!event || !id) return res.status(400).json({ error: 'Missing event or id' })

  try {
    if (event === 'vacation_request') {
      const { data: v } = await supabase.from('vacation_requests').select('*').eq('id', id).single()
      if (!v || v.status !== 'pending') return res.status(200).json({ ok: false, skipped: 'not pending' })
      if (Date.now() - new Date(v.submitted_at).getTime() > 15 * 60000) return res.status(200).json({ ok: false, skipped: 'too old' })
      if (!firstTime('vac:' + id, 3600000)) return res.status(200).json({ ok: false, skipped: 'already sent' })
      const mod = await nameOf(v.user_id)
      const same = v.start_date === v.end_date
      const ok = await send(
        `🌴 <b>New vacation request</b>\n` +
        `<b>${esc(mod.name)}</b>${mod.shift ? ' · ' + esc(mod.shift) : ''}\n` +
        `${same ? day(v.start_date) : day(v.start_date) + ' → ' + day(v.end_date)} · ${esc(v.days_requested)} day(s)\n\n` +
        `Review: ${SITE}/dashboard`
      )
      return res.status(ok ? 200 : 502).json({ ok })
    }

    if (event === 'swap_pending_admin') {
      const { data: sw } = await supabase.from('shift_swaps').select('*').eq('id', id).single()
      if (!sw || sw.status !== 'pending_admin') return res.status(200).json({ ok: false, skipped: 'not awaiting admin' })
      if (!firstTime('swap:' + id, 3600000)) return res.status(200).json({ ok: false, skipped: 'already sent' })
      const [a, b] = await Promise.all([nameOf(sw.requester_id), nameOf(sw.target_id)])
      const ok = await send(
        `🔄 <b>Shift swap awaiting your approval</b>\n` +
        `<b>${esc(a.name)}</b> gives ${day(sw.swap_date)}\n` +
        `<b>${esc(b.name)}</b> gives ${day(sw.target_date)}\n` +
        (sw.notes ? `Note: ${esc(sw.notes)}\n` : '') +
        `\nReview: ${SITE}/dashboard`
      )
      return res.status(ok ? 200 : 502).json({ ok })
    }

    return res.status(400).json({ error: 'Unknown event' })
  } catch (e) {
    return res.status(500).json({ error: 'Could not send the alert.' })
  }
}
