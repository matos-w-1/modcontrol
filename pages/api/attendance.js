import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  'https://vqoxhaggxgwfktuvtoyw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxb3hoYWdneGd3Zmt0dXZ0b3l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTI5ODExNCwiZXhwIjoyMDk2ODc0MTE0fQ.hq0gA0e7LeqdOUpoycN5865vs0xX3fhlG5HEvs3WDnA'
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { action } = req.query
  const { user_id } = req.body
  
  console.log('ACTION:', action, 'USER:', user_id)
  
  if (!user_id) return res.status(400).json({ error: 'user_id required' })

  const { data: profile, error: profileErr } = await supabaseAdmin.from('profiles').select('id,role,status').eq('id', user_id).single()
  
  console.log('PROFILE:', JSON.stringify({ profile, profileErr }))
  
  if (!profile) return res.status(404).json({ error: 'Profile not found' })
  if (profile.role === 'admin') return res.status(200).json({ ok: true, skipped: true })
  if (profile.status === 'inactive') return res.status(403).json({ error: 'Account is inactive' })

  const now = new Date().toISOString()

  const { data: open, error: openErr } = await supabaseAdmin.from('attendance')
    .select('*').eq('user_id', user_id).is('clock_out', null)
    .order('clock_in', { ascending: false }).limit(1).maybeSingle()

  console.log('OPEN SESSION:', JSON.stringify({ open, openErr }))

  if (action === 'clock_in') {
    if (open) return res.status(409).json({ error: 'Already clocked in' })
    const { error } = await supabaseAdmin.from('attendance').insert({
      user_id, clock_in: now, status: 'working', created_at: now
    })
    console.log('CLOCK IN ERROR:', JSON.stringify(error))
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  if (!open) return res.status(409).json({ error: 'Not clocked in' })

  if (action === 'lunch_start') {
    if (open.lunch_start) return res.status(409).json({ error: 'Lunch already started' })
    const { error } = await supabaseAdmin.from('attendance')
      .update({ lunch_start: now, status: 'lunch' }).eq('id', open.id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  if (action === 'lunch_end') {
    if (!open.lunch_start) return res.status(409).json({ error: 'Lunch not started' })
    if (open.lunch_end) return res.status(409).json({ error: 'Lunch already ended' })
    const lunchMins = Math.round((new Date(now) - new Date(open.lunch_start)) / 60000)
    const { error } = await supabaseAdmin.from('attendance')
      .update({ lunch_end: now, lunch_minutes: lunchMins, status: 'working' }).eq('id', open.id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  if (action === 'clock_out') {
    const totalMins = Math.round((new Date(now) - new Date(open.clock_in)) / 60000)
    const lunchMins = open.lunch_minutes || 0
    const workedMins = totalMins - lunchMins
    const { error } = await supabaseAdmin.from('attendance').update({
      clock_out: now,
      status: 'done',
      total_hours: parseFloat((workedMins / 60).toFixed(2)),
      lunch_minutes: lunchMins,
    }).eq('id', open.id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(400).json({ error: `Unknown action: ${action}` })
}