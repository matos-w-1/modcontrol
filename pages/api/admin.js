import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  'https://vqoxhaggxgwfktuvtoyw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxb3hoYWdneGd3Zmt0dXZ0b3l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTI5ODExNCwiZXhwIjoyMDk2ODc0MTE0fQ.hq0gA0e7LeqdOUpoycN5865vs0xX3fhlG5HEvs3WDnA',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { action, email, password, name, shift, userId } = req.body

  try {
    if (action === 'create') {
      const response = await fetch('https://vqoxhaggxgwfktuvtoyw.supabase.co/auth/v1/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxb3hoYWdneGd3Zmt0dXZ0b3l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTI5ODExNCwiZXhwIjoyMDk2ODc0MTE0fQ.hq0gA0e7LeqdOUpoycN5865vs0xX3fhlG5HEvs3WDnA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxb3hoYWdneGd3Zmt0dXZ0b3l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTI5ODExNCwiZXhwIjoyMDk2ODc0MTE0fQ.hq0gA0e7LeqdOUpoycN5865vs0xX3fhlG5HEvs3WDnA'
        },
        body: JSON.stringify({
          email, password, email_confirm: true,
          user_metadata: { name, shift }
        })
      })
      const user = await response.json()
      if (!user.id) return res.status(400).json({ error: user.msg || user.error || 'Failed to create user' })

      await supabaseAdmin.from('profiles').upsert({
        id: user.id, name, shift, role: 'moderator',
        status: 'active', vacation_used: 0, vacation_allowance: 15
      })
      return res.status(200).json({ success: true })
    }

    if (action === 'delete') {
      await fetch(`https://vqoxhaggxgwfktuvtoyw.supabase.co/auth/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxb3hoYWdneGd3Zmt0dXZ0b3l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTI5ODExNCwiZXhwIjoyMDk2ODc0MTE0fQ.hq0gA0e7LeqdOUpoycN5865vs0xX3fhlG5HEvs3WDnA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxb3hoYWdneGd3Zmt0dXZ0b3l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTI5ODExNCwiZXhwIjoyMDk2ODc0MTE0fQ.hq0gA0e7LeqdOUpoycN5865vs0xX3fhlG5HEvs3WDnA'
        }
      })
      await supabaseAdmin.from('profiles').delete().eq('id', userId)
      return res.status(200).json({ success: true })
    }

    if (action === 'update_password') {
      const response = await fetch(`https://vqoxhaggxgwfktuvtoyw.supabase.co/auth/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxb3hoYWdneGd3Zmt0dXZ0b3l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTI5ODExNCwiZXhwIjoyMDk2ODc0MTE0fQ.hq0gA0e7LeqdOUpoycN5865vs0xX3fhlG5HEvs3WDnA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxb3hoYWdneGd3Zmt0dXZ0b3l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTI5ODExNCwiZXhwIjoyMDk2ODc0MTE0fQ.hq0gA0e7LeqdOUpoycN5865vs0xX3fhlG5HEvs3WDnA'
        },
        body: JSON.stringify({ password })
      })
      const data = await response.json()
      if (data.error) return res.status(400).json({ error: data.error })
      return res.status(200).json({ success: true })
    }

    res.status(400).json({ error: 'Unknown action' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}