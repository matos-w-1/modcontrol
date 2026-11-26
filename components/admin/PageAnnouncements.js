import { fmtDate } from '../../lib/utils'
import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function PageAnnouncements({ adminId }) {
  const [announcements, setAnnouncements] = useState([])
  const [form, setForm]   = useState({ title:'', body:'', type:'info', expires_at:'' })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)

  useEffect(() => { load() }, [])
  async function load() {
    const { data } = await supabase.from('announcements').select('*').order('created_at',{ascending:false})
    setAnnouncements(data||[])
  }
  async function create() {
    if (!form.title||!form.body) return
    setSaving(true)
    await supabase.from('announcements').insert({...form, created_by:adminId, expires_at:form.expires_at||null})
    setForm({title:'',body:'',type:'info',expires_at:''}); setShowForm(false); setSaving(false); load()
  }
  async function toggle(id, active) { await supabase.from('announcements').update({active}).eq('id',id); load() }
  async function remove(id) { await supabase.from('announcements').delete().eq('id',id); load() }

  const typeColor = { info:'#3b82f6', warning:'#f59e0b', success:'#34d399', danger:'#f87171' }

  return (
    <div style={sa.content}>
      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Announcements</h1>
        <button style={sa.btnPrimary} onClick={()=>setShowForm(f=>!f)}>{showForm?'Cancel':'+ New'}</button>
      </div>
      {showForm && (
        <div style={sa.card}>
          <div style={sa.formGrid}>
            <div style={{...sa.formGroup, gridColumn:'span 2'}}><label style={sa.label}>Title</label><input style={sa.input} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Title…"/></div>
            <div style={{...sa.formGroup, gridColumn:'span 2'}}><label style={sa.label}>Body</label><textarea style={{...sa.input, minHeight:80, resize:'vertical'}} value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} placeholder="Content…"/></div>
            <div style={sa.formGroup}><label style={sa.label}>Type</label>
              <select style={sa.input} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                {['info','warning','success','danger'].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div style={sa.formGroup}><label style={sa.label}>Expires at (optional)</label><input style={sa.input} type="datetime-local" value={form.expires_at} onChange={e=>setForm(f=>({...f,expires_at:e.target.value}))}/></div>
          </div>
          <button style={{...sa.btnPrimary, marginTop:16}} disabled={saving} onClick={create}>{saving?'Publishing…':'Publish'}</button>
        </div>
      )}
      {announcements.length===0?<div style={sa.card}><p style={sa.empty}>No announcements yet.</p></div>:announcements.map(a=>{
        const color=typeColor[a.type]||'#3b82f6'
        return (
          <div key={a.id} style={{...sa.card, border:`1px solid ${color}33`, opacity:a.active?1:0.5}}>
            <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12}}>
              <div style={{flex:1}}>
                <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                  <span style={{fontSize:'0.68rem', fontWeight:700, padding:'2px 8px', borderRadius:20, background:color+'22', color}}>{a.type.toUpperCase()}</span>
                  {!a.active&&<span style={{fontSize:'0.68rem', color:'#4a5568'}}>Inactive</span>}
                </div>
                <div style={{fontSize:'0.9rem', fontWeight:600, color:'#f1f5f9', marginBottom:4}}>{a.title}</div>
                <div style={{fontSize:'0.82rem', color:'#94a3b8'}}>{a.body}</div>
                <div style={{fontSize:'0.7rem', color:'#4a5568', marginTop:8}}>{fmtDate(a.created_at)}</div>
              </div>
              <div style={{display:'flex', gap:6}}>
                <button style={a.active?sa.btnSmRed:sa.btnSmGreen} onClick={()=>toggle(a.id,!a.active)}>{a.active?'Deactivate':'Activate'}</button>
                <button style={sa.btnSmRed} onClick={()=>remove(a.id)}>Delete</button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
