import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://vqoxhaggxgwfktuvtoyw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxb3hoYWdneGd3Zmt0dXZ0b3l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTI5ODExNCwiZXhwIjoyMDk2ODc0MTE0fQ.hq0gA0e7LeqdOUpoycN5865vs0xX3fhlG5HEvs3WDnA'
)

export default async function handler(req, res) {
  const { action } = req.query

  if (req.method === 'GET' && action === 'approvals') {
    const [{ data: v }, { data: sw }, { data: profs }] = await Promise.all([
      supabase.from('vacation_requests').select('id,user_id,start_date,end_date,days_requested,status,admin_notes,submitted_at,validation_warnings').eq('status','pending').order('submitted_at'),
      supabase.from('shift_swaps').select('id,requester_id,target_id,swap_date,status,notes').eq('status','pending_admin'),
      supabase.from('profiles').select('id,name,vacation_used,vacation_pending,vacation_allowance,shift'),
    ])
    return res.status(200).json({ vacations: v||[], swaps: sw||[], profiles: profs||[] })
  }

  if (req.method === 'POST' && action === 'decide_vacation') {
    const { id, decision, notes, user_id, days_requested, vacation_used, vacation_pending } = req.body
    if (decision === 'approved') {
      await supabase.from('profiles').update({
        vacation_used: (vacation_used||0) + days_requested,
        vacation_pending: Math.max(0, (vacation_pending||0) - days_requested),
      }).eq('id', user_id)
    } else {
      await supabase.from('profiles').update({
        vacation_pending: Math.max(0, (vacation_pending||0) - days_requested),
      }).eq('id', user_id)
    }
    await supabase.from('vacation_requests').update({
      status: decision, admin_notes: notes||'', reviewed_at: new Date().toISOString()
    }).eq('id', id)
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'POST' && action === 'decide_swap') {
    const { id, decision } = req.body
    await supabase.from('shift_swaps').update({ status: decision, admin_response: decision }).eq('id', id)
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'POST' && action === 'create_mod') {
  const { name, full_name, nickname, email, password, shift, birthday, timezone, discord_name, telegram_name, mod_group } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' })
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (authError) return res.status(500).json({ error: authError.message })
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: authData.user.id, name, full_name: full_name||null, nickname: nickname||null,
    email, role: 'mod', shift: shift||null, birthday: birthday||null,
    timezone: timezone||'UTC+1', discord_name: discord_name||null,
    telegram_name: telegram_name||null, mod_group: mod_group||'english',
    status: 'active', vacation_allowance: 15, vacation_used: 0, vacation_pending: 0,
    created_at: new Date().toISOString(),
  })
  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id)
    return res.status(500).json({ error: profileError.message })
  }
  return res.status(200).json({ ok: true, id: authData.user.id })
}

  return res.status(400).json({ error: 'Unknown action' })
}