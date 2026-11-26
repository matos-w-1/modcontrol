import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function AdminPageProfile({ userId, profile, onRefresh }) {
  const [form, setForm] = useState({ name:'', full_name:'' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    if (profile) setForm({ name: profile.name||'', full_name: profile.full_name||'' })
  }, [profile])

  async function save() {
    setSaving(true)
    await supabase.from('profiles').update({ name: form.name, full_name: form.full_name }).eq('id', userId)
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2000); onRefresh()
  }

  async function uploadAvatar(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingAvatar(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert:true })
    if (error) { alert(error.message); setUploadingAvatar(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', userId)
    setUploadingAvatar(false)
    onRefresh()
  }

  return (
    <div style={sa.content}>
      <h1 style={{...sa.pageTitle, marginBottom:16}}>My Profile</h1>

      <div style={{...sa.card, display:'flex', alignItems:'center', gap:20, flexWrap:'wrap', paddingTop:20}}>
        <div style={{position:'relative', flexShrink:0}}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" style={{width:72, height:72, borderRadius:'50%', objectFit:'cover', border:'2px solid #1e2433'}}/>
          ) : (
            <div style={{width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', fontWeight:800, color:'#fff'}}>
              {(profile?.name||'?')[0].toUpperCase()}
            </div>
          )}
          <label style={{position:'absolute', bottom:0, right:0, width:22, height:22, borderRadius:'50%', background:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'2px solid #141820'}}>
            {uploadingAvatar
              ? <span style={{fontSize:'0.6rem', color:'#fff'}}>…</span>
              : <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            }
            <input type="file" accept="image/*" style={{display:'none'}} onChange={uploadAvatar}/>
          </label>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:'1.1rem', fontWeight:700, color:'#f1f5f9', marginBottom:4}}>{profile?.name}</div>
          {profile?.full_name && <div style={{fontSize:'0.82rem', color:'#64748b'}}>{profile.full_name}</div>}
          <span style={{fontSize:'0.72rem', color:'#f87171', background:'#f8717122', padding:'3px 10px', borderRadius:20, fontWeight:600, marginTop:6, display:'inline-block'}}>Administrator</span>
        </div>
      </div>

      <div style={sa.card}>
        <div style={sa.cardHead}><span style={sa.cardTitle}>Edit Information</span></div>
        <div style={sa.formGrid}>
          <div style={sa.formGroup}><label style={sa.label}>Display Name</label><input style={sa.input} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div style={sa.formGroup}><label style={sa.label}>Full Name</label><input style={sa.input} value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))}/></div>
        </div>
        <button style={{...sa.btnPrimary, marginTop:20}} disabled={saving} onClick={save}>
          {saved?'✓ Saved':saving?'Saving…':'Save Changes'}
        </button>
      </div>
    </div>
  )
}
