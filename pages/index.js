import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      if (profile?.role === 'admin') router.push('/admin')
      else router.push('/dashboard')
    } catch (err) {
      setError('Error: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0efed',fontFamily:'system-ui,sans-serif'}}>
      <div style={{background:'#fff',border:'0.5px solid rgba(0,0,0,0.1)',borderRadius:12,padding:32,width:360}}>
        <h1 style={{fontSize:18,fontWeight:500,marginBottom:4}}>🛡️ ModControl</h1>
        <p style={{fontSize:12,color:'#888',marginBottom:24}}>Sign in to your account</p>
        <form onSubmit={handleLogin}>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:500,color:'#666',display:'block',marginBottom:4}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              style={{width:'100%',padding:'8px 10px',borderRadius:8,border:'0.5px solid rgba(0,0,0,0.2)',fontSize:13,fontFamily:'inherit'}}
              placeholder="email@example.com" />
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,fontWeight:500,color:'#666',display:'block',marginBottom:4}}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
              style={{width:'100%',padding:'8px 10px',borderRadius:8,border:'0.5px solid rgba(0,0,0,0.2)',fontSize:13,fontFamily:'inherit'}} />
          </div>
          {error && <div style={{background:'#fcebeb',color:'#791f1f',padding:'7px 10px',borderRadius:8,fontSize:11,marginBottom:12}}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{width:'100%',padding:'9px',borderRadius:8,background:'#185FA5',color:'#fff',border:'none',fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:'inherit',opacity:loading?0.6:1}}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}