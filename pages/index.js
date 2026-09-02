import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  async function handleLogin(e) {
  e.preventDefault()
  setLoading(true)
  setError('')
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  } catch (err) {
    setError(err.message)
    setLoading(false)
  }
}

  return (
    <>
      <style>{`*{box-sizing:border-box}body{margin:0}`}</style>
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.logoRow}>
            <div style={s.logoIcon}>M</div>
            <div>
              <div style={s.logoText}>ModControl</div>
              <div style={s.logoSub}>Moderator Management System</div>
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input
                style={s.input} type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input
                style={s.input} type="password" required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error && <div style={s.errorBox}>{error}</div>}
            <button style={{...s.btn, opacity: loading ? 0.6 : 1}} type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

const s = {
  page:    { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f1117', fontFamily:"'Inter',system-ui,sans-serif" },
  card:    { background:'#141820', border:'1px solid #1e2433', borderRadius:16, padding:'36px 32px', width:'100%', maxWidth:380 },
  logoRow: { display:'flex', alignItems:'center', gap:12, marginBottom:32 },
  logoIcon:{ width:40, height:40, background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color:'#fff' },
  logoText:{ fontSize:'1rem', fontWeight:700, color:'#f8fafc', letterSpacing:'-0.02em' },
  logoSub: { fontSize:'0.7rem', color:'#4a5568', marginTop:2 },
  field:   { marginBottom:16 },
  label:   { display:'block', fontSize:'0.75rem', fontWeight:500, color:'#94a3b8', marginBottom:6 },
  input:   { width:'100%', background:'#0f1117', border:'1px solid #2d3748', borderRadius:8, padding:'10px 12px', color:'#e2e8f0', fontSize:'0.875rem', outline:'none', fontFamily:'inherit' },
  errorBox:{ background:'#dc262622', border:'1px solid #dc262644', color:'#f87171', fontSize:'0.8rem', padding:'10px 12px', borderRadius:8, marginBottom:14 },
  btn:     { width:'100%', padding:'11px', borderRadius:9, background:'linear-gradient(135deg,#3b82f6,#2563eb)', color:'#fff', border:'none', fontSize:'0.875rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' },
}
