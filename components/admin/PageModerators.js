import { fmtDate, pillColor, toLocalISO } from '../../lib/utils'
import { DiscordIcon, TelegramIcon } from '../../lib/icons'
import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function PageModerators() {
  const [mods, setMods]             = useState([])
  const [formerMods, setFormerMods] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [tab, setTab]               = useState('active')
  const [form, setForm]             = useState({ name:'', full_name:'', nickname:'', email:'', password:'', shift:'', birthday:'', timezone:'UTC+1', discord_name:'', telegram_name:'', mod_group:'english' })
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState(null)
  const [editMod, setEditMod]       = useState(null)

  const SHIFTS    = ['Morning Shift','Afternoon Shift','Night Shift']
  const TIMEZONES = ['UTC-5','UTC-4','UTC-3','UTC-2','UTC-1','UTC+0','UTC+1','UTC+2','UTC+3','UTC+4','UTC+5','UTC+6']

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('profiles').select('*').eq('role','mod').order('name')
    setMods((data||[]).filter(m => m.status !== 'left'))
    setFormerMods((data||[]).filter(m => m.status === 'left'))
    setLoading(false)
  }

  async function createMod() {
    if (!form.name || !form.email || !form.password) { setError('Name, email and password are required.'); return }
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/admin?action=create_mod', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error)
      setShowForm(false)
      setForm({ name:'', full_name:'', nickname:'', email:'', password:'', shift:'', birthday:'', timezone:'UTC+1', discord_name:'', telegram_name:'', mod_group:'english' })
      load()
    } catch(e) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function saveMod() {
    await supabase.from('profiles').update({
      name: editMod.name, full_name: editMod.full_name, nickname: editMod.nickname,
      shift: editMod.shift, status: editMod.status, vacation_allowance: editMod.vacation_allowance,
      timezone: editMod.timezone, discord_name: editMod.discord_name, telegram_name: editMod.telegram_name,
      mod_group: editMod.mod_group, birthday: editMod.birthday,
      left_date: editMod.left_date||null, left_reason: editMod.left_reason||null,
    }).eq('id', editMod.id)
    setEditMod(null); load()
  }

  async function markAsLeft(mod) {
    await supabase.from('profiles').update({ status:'left', left_date: toLocalISO(new Date()) }).eq('id', mod.id)
    load()
  }

  async function reactivate(mod) {
    await supabase.from('profiles').update({ status:'active', left_date:null, left_reason:null }).eq('id', mod.id)
    load()
  }

  function ModCard({ m }) {
    return (
      <div style={{padding:'16px 0', borderBottom:'1px solid #1e2433'}}>
        <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
         <div style={{position:'relative', flexShrink:0}}>
  <div style={{width:34,height:34,borderRadius:'50%',overflow:'hidden'}}>
    {m.avatar_url
      ? <img src={m.avatar_url} alt={m.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
      : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',fontWeight:700,color:'#fff'}}>{(m.name||'?')[0].toUpperCase()}</div>
    }
  </div>
  <label style={{position:'absolute',bottom:-2,right:-2,width:14,height:14,borderRadius:'50%',background:'#3b82f6',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',border:'2px solid #141820'}}>
    <svg width="7" height="7" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
    <input type="file" accept="image/*" style={{display:'none'}} onChange={async e=>{
      const file = e.target.files[0]
      if (!file) return
      const ext = file.name.split('.').pop()
      const path = `${m.id}.${ext}`
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert:true })
      if (error) { alert(error.message); return }
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', m.id)
      load()
    }}/>
  </label>
</div>
          <div style={{flex:1, minWidth:160}}>
            <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
              <span style={{fontSize:'0.87rem', fontWeight:600}}>{m.name}</span>
              {m.nickname && <span style={{fontSize:'0.72rem', color:'#64748b'}}>"{m.nickname}"</span>}
              {m.mod_group==='russian' && <span style={{fontSize:'0.6rem', background:'#f59e0b22', color:'#f59e0b', padding:'1px 5px', borderRadius:3, fontWeight:700}}>RU</span>}
              <span style={{...sa.pill, background:pillColor(m.status||'active').bg, color:pillColor(m.status||'active').col}}>{m.status||'active'}</span>
            </div>
            <div style={{fontSize:'0.72rem', color:'#64748b', marginTop:3, display:'flex', gap:12, flexWrap:'wrap'}}>
              {m.full_name && <span>👤 {m.full_name}</span>}
              {m.email && <span>✉️ {m.email}</span>}
              {m.shift && <span>⏰ {m.shift}</span>}
              {m.last_seen && (
  <span style={{fontSize:'0.72rem', color: (new Date()-new Date(m.last_seen))<5*60*1000 ? '#34d399' : (new Date()-new Date(m.last_seen))<30*60*1000 ? '#f59e0b' : '#4a5568'}}>
    ● {(new Date()-new Date(m.last_seen))<60000 ? 'Just now' : (new Date()-new Date(m.last_seen))<3600000 ? `${Math.floor((new Date()-new Date(m.last_seen))/60000)}m ago` : `${Math.floor((new Date()-new Date(m.last_seen))/3600000)}h ago`}
  </span>
)}
              {m.timezone && <span>🌍 {m.timezone}</span>}
            </div>
            <div style={{fontSize:'0.72rem', color:'#64748b', marginTop:3, display:'flex', gap:12, flexWrap:'wrap'}}>
              {m.discord_name && <span style={{display:'flex', alignItems:'center', gap:4}}><DiscordIcon/>{m.discord_name}</span>}
              {m.telegram_name && <span style={{display:'flex', alignItems:'center', gap:4}}><TelegramIcon/>{m.telegram_name}</span>}
              {m.birthday && <span>🎂 {new Date(m.birthday).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>}
              <span>🏖️ {m.vacation_used||0}/{m.vacation_allowance||15} days used</span>
            </div>
            {m.status==='left' && m.left_date && <div style={{fontSize:'0.72rem', color:'#f87171', marginTop:3}}>Left on {fmtDate(m.left_date)}{m.left_reason?` · ${m.left_reason}`:''}</div>}
          </div>
          <div style={{display:'flex', gap:6}}>
            <button style={sa.btnSmBlue} onClick={()=>setEditMod({...m})}>Edit</button>
            {m.status!=='left'
              ? <button style={sa.btnSmRed} onClick={()=>markAsLeft(m)}>Mark as Left</button>
              : <button style={sa.btnSmGreen} onClick={()=>reactivate(m)}>Reactivate</button>
            }
          </div>
        </div>
        {editMod?.id === m.id && (
          <div style={{background:'#0f1117', borderRadius:10, padding:20, marginTop:12}}>
            <div style={sa.formGrid}>
              <div style={sa.formGroup}><label style={sa.label}>Username</label><input style={sa.input} value={editMod.name||''} onChange={e=>setEditMod(em=>({...em,name:e.target.value}))}/></div>
              <div style={sa.formGroup}><label style={sa.label}>Full Name</label><input style={sa.input} value={editMod.full_name||''} onChange={e=>setEditMod(em=>({...em,full_name:e.target.value}))}/></div>
              <div style={sa.formGroup}><label style={sa.label}>Nickname</label><input style={sa.input} value={editMod.nickname||''} onChange={e=>setEditMod(em=>({...em,nickname:e.target.value}))}/></div>
              <div style={sa.formGroup}><label style={sa.label}>Discord</label><input style={sa.input} value={editMod.discord_name||''} onChange={e=>setEditMod(em=>({...em,discord_name:e.target.value}))}/></div>
              <div style={sa.formGroup}><label style={sa.label}>Telegram</label><input style={sa.input} value={editMod.telegram_name||''} onChange={e=>setEditMod(em=>({...em,telegram_name:e.target.value}))}/></div>
              <div style={sa.formGroup}><label style={sa.label}>Timezone</label>
                <select style={sa.input} value={editMod.timezone||'UTC+1'} onChange={e=>setEditMod(em=>({...em,timezone:e.target.value}))}>
                  {TIMEZONES.map(tz=><option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
              <div style={sa.formGroup}><label style={sa.label}>Shift</label>
                <select style={sa.input} value={editMod.shift||''} onChange={e=>setEditMod(em=>({...em,shift:e.target.value}))}>
                  <option value="">No shift</option>
                  {SHIFTS.map(sh=><option key={sh} value={sh}>{sh}</option>)}
                </select>
              </div>
              <div style={sa.formGroup}><label style={sa.label}>Group</label>
                <select style={sa.input} value={editMod.mod_group||'english'} onChange={e=>setEditMod(em=>({...em,mod_group:e.target.value}))}>
                  <option value="english">English</option>
                  <option value="russian">Russian</option>
                </select>
              </div>
              <div style={sa.formGroup}><label style={sa.label}>Date of Birth</label><input style={sa.input} type="date" value={editMod.birthday||''} onChange={e=>setEditMod(em=>({...em,birthday:e.target.value}))}/></div>
              <div style={sa.formGroup}><label style={sa.label}>Vacation Allowance</label><input style={sa.input} type="number" value={editMod.vacation_allowance||15} onChange={e=>setEditMod(em=>({...em,vacation_allowance:+e.target.value}))}/></div>
              <div style={sa.formGroup}><label style={sa.label}>Status</label>
                <select style={sa.input} value={editMod.status||'active'} onChange={e=>setEditMod(em=>({...em,status:e.target.value}))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="left">Left</option>
                </select>
              </div>
              {editMod.status==='left' && <>
                <div style={sa.formGroup}><label style={sa.label}>Left Date</label><input style={sa.input} type="date" value={editMod.left_date||''} onChange={e=>setEditMod(em=>({...em,left_date:e.target.value}))}/></div>
                <div style={{...sa.formGroup, gridColumn:'span 2'}}><label style={sa.label}>Reason</label><input style={sa.input} value={editMod.left_reason||''} onChange={e=>setEditMod(em=>({...em,left_reason:e.target.value}))} placeholder="Optional…"/></div>
              </>}
            </div>
            <div style={{display:'flex', gap:8, marginTop:16}}>
              <button style={sa.btnSmGreen} onClick={saveMod}>Save Changes</button>
              <button style={sa.btnSmRed} onClick={()=>setEditMod(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) return <div style={sa.content}><div style={sa.empty}>Loading…</div></div>

  return (
    <div style={sa.content}>
      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Moderators</h1>
        <button style={sa.btnPrimary} onClick={()=>setShowForm(f=>!f)}>{showForm?'Cancel':'+ Add Moderator'}</button>
      </div>
      {showForm && (
        <div style={sa.card}>
          <div style={sa.cardHead}><span style={sa.cardTitle}>New Moderator</span></div>
          {error && <div style={sa.errorBox}>{error}</div>}
          <div style={sa.formGrid}>
            <div style={sa.formGroup}><label style={sa.label}>Username *</label><input style={sa.input} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="johndoe"/></div>
            <div style={sa.formGroup}><label style={sa.label}>Full Name</label><input style={sa.input} value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))} placeholder="John Doe"/></div>
            <div style={sa.formGroup}><label style={sa.label}>Nickname</label><input style={sa.input} value={form.nickname} onChange={e=>setForm(f=>({...f,nickname:e.target.value}))} placeholder="Johnny"/></div>
            <div style={sa.formGroup}><label style={sa.label}>Email *</label><input style={sa.input} type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="john@example.com"/></div>
            <div style={sa.formGroup}><label style={sa.label}>Password *</label><input style={sa.input} type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Temporary password"/></div>
            <div style={sa.formGroup}>
              <label style={{...sa.label, display:'flex', alignItems:'center', gap:4}}><DiscordIcon/> Discord</label>
              <input style={sa.input} value={form.discord_name} onChange={e=>setForm(f=>({...f,discord_name:e.target.value}))} placeholder="username"/>
            </div>
            <div style={sa.formGroup}>
              <label style={{...sa.label, display:'flex', alignItems:'center', gap:4}}><TelegramIcon/> Telegram</label>
              <input style={sa.input} value={form.telegram_name} onChange={e=>setForm(f=>({...f,telegram_name:e.target.value}))} placeholder="@username"/>
            </div>
            <div style={sa.formGroup}><label style={sa.label}>Shift</label>
              <select style={sa.input} value={form.shift} onChange={e=>setForm(f=>({...f,shift:e.target.value}))}>
                <option value="">Select shift…</option>
                {SHIFTS.map(sh=><option key={sh} value={sh}>{sh}</option>)}
              </select>
            </div>
            <div style={sa.formGroup}><label style={sa.label}>Timezone</label>
              <select style={sa.input} value={form.timezone} onChange={e=>setForm(f=>({...f,timezone:e.target.value}))}>
                {TIMEZONES.map(tz=><option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
            <div style={sa.formGroup}><label style={sa.label}>Group</label>
              <select style={sa.input} value={form.mod_group} onChange={e=>setForm(f=>({...f,mod_group:e.target.value}))}>
                <option value="english">English</option>
                <option value="russian">Russian</option>
              </select>
            </div>
            <div style={sa.formGroup}><label style={sa.label}>Date of Birth</label><input style={sa.input} type="date" value={form.birthday} onChange={e=>setForm(f=>({...f,birthday:e.target.value}))}/></div>
          </div>
          <button style={{...sa.btnPrimary,marginTop:16}} disabled={saving} onClick={createMod}>{saving?'Creating…':'Create Account'}</button>
        </div>
      )}
      <div style={{display:'flex', gap:6, marginBottom:16}}>
        <button style={{...sa.filterBtn,...(tab==='active'?sa.filterActive:{})}} onClick={()=>setTab('active')}>Active ({mods.length})</button>
        <button style={{...sa.filterBtn,...(tab==='former'?sa.filterActive:{})}} onClick={()=>setTab('former')}>Former ({formerMods.length})</button>
      </div>
      {tab==='active' && (
        <div style={sa.card}>
          <div style={sa.cardHead}><span style={sa.cardTitle}>Active Moderators</span><span style={sa.badge}>{mods.length}</span></div>
          {mods.length===0 ? <p style={sa.empty}>No active moderators.</p> : mods.map(m => <ModCard key={m.id} m={m}/>)}
        </div>
      )}
      {tab==='former' && (
        <div style={sa.card}>
          <div style={sa.cardHead}><span style={sa.cardTitle}>Former Moderators</span><span style={sa.badge}>{formerMods.length}</span></div>
          {formerMods.length===0 ? <p style={sa.empty}>No former moderators.</p> : formerMods.map(m => <ModCard key={m.id} m={m}/>)}
        </div>
      )}
    </div>
  )
}
