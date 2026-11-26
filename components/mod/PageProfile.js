import { SHIFT_COLORS, fmtDate } from '../../lib/utils'
import { s } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function PageProfile({ userId, profile, onRefresh }) {
  const [form, setForm] = useState({
    name: '', full_name: '', birthday: '', timezone: 'UTC+1',
    discord_name: '', telegram_name: '', start_date: '', languages_spoken: [],
  })
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const TIMEZONES = ['UTC-5','UTC-4','UTC-3','UTC-2','UTC-1','UTC+0','UTC+1','UTC+2','UTC+3','UTC+4','UTC+5','UTC+6']
  const LANGUAGES = ['English','Portuguese','Russian','Spanish','French','German','Italian']
  const SHIFT_COLOR = SHIFT_COLORS
  const shiftColor = SHIFT_COLOR[profile?.shift] || '#94a3b8'
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

  useEffect(() => {
    if(profile) setForm({
      name:             profile.name||'',
      full_name:        profile.full_name||'',
      birthday:         profile.birthday||'',
      timezone:         profile.timezone||'UTC+1',
      discord_name:     profile.discord_name||'',
      telegram_name:    profile.telegram_name||'',
      start_date:       profile.start_date||'',
      languages_spoken: profile.languages_spoken||[],
    })
  }, [profile])

  function toggleLanguage(lang) {
    setForm(f => ({
      ...f,
      languages_spoken: f.languages_spoken.includes(lang)
        ? f.languages_spoken.filter(l => l !== lang)
        : [...f.languages_spoken, lang]
    }))
  }

  async function save() {
    setSaving(true)
    await supabase.from('profiles').update({
      name:             form.name,
      full_name:        form.full_name,
      birthday:         form.birthday||null,
      timezone:         form.timezone,
      discord_name:     form.discord_name,
      telegram_name:    form.telegram_name,
      start_date:       form.start_date||null,
      languages_spoken: form.languages_spoken,
    }).eq('id', userId)
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
    <div style={s.content}>
     <h1 style={{...s.pageTitle, marginBottom:16}}>My Profile</h1>

      {/* Header */}
      <div style={{...s.card, display:'flex', alignItems:'center', gap:20, flexWrap:'wrap', paddingTop:20}}>
        {/* Avatar */}
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
          {profile?.full_name && <div style={{fontSize:'0.82rem', color:'#64748b', marginBottom:6}}>{profile.full_name}</div>}
          <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
            {profile?.shift && <span style={{fontSize:'0.75rem', background:shiftColor+'22', color:shiftColor, padding:'3px 10px', borderRadius:20, fontWeight:600}}>{profile.shift}</span>}
            {profile?.mod_group==='russian' && <span style={{fontSize:'0.68rem', background:'#f59e0b22', color:'#f59e0b', padding:'2px 8px', borderRadius:4, fontWeight:700}}>🇷🇺 Russian</span>}
            {profile?.timezone && <span style={{fontSize:'0.75rem', color:'#64748b'}}>🌍 {profile.timezone}</span>}
            <span style={{fontSize:'0.75rem', background:profile?.status==='active'?'#34d39922':'#f8717122', color:profile?.status==='active'?'#34d399':'#f87171', padding:'3px 10px', borderRadius:20, fontWeight:600}}>{profile?.status||'active'}</span>
          </div>
          <div style={{display:'flex', gap:16, marginTop:6, flexWrap:'wrap'}}>
            {profile?.discord_name && <span style={{fontSize:'0.75rem', color:'#94a3b8', display:'flex', alignItems:'center', gap:4}}><svg width="12" height="12" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>{profile.discord_name}</span>}
            {profile?.telegram_name && <span style={{fontSize:'0.75rem', color:'#94a3b8', display:'flex', alignItems:'center', gap:4}}><svg width="12" height="12" viewBox="0 0 24 24" fill="#26A5E4"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>{profile.telegram_name}</span>}
            {profile?.start_date && <span style={{fontSize:'0.75rem', color:'#64748b'}}>📅 Since {fmtDate(profile.start_date)}</span>}
            {(profile?.languages_spoken||[]).length>0 && <span style={{fontSize:'0.75rem', color:'#64748b'}}>🗣️ {profile.languages_spoken.join(', ')}</span>}
          </div>
        </div>
      </div>

      {/* Vacation Balance */}
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>Vacation Balance</span></div>
        <div style={s.vacRow}>
          <div style={s.vacItem}><div style={s.vacNum}>{profile?.vacation_allowance??15}</div><div style={s.vacLabel}>Allowance</div></div>
          <div style={s.vacItem}><div style={{...s.vacNum,color:'#f87171'}}>{profile?.vacation_used??0}</div><div style={s.vacLabel}>Used</div></div>
          <div style={s.vacItem}><div style={{...s.vacNum,color:'#f59e0b'}}>{profile?.vacation_pending??0}</div><div style={s.vacLabel}>Pending</div></div>
          <div style={s.vacItem}><div style={{...s.vacNum,color:'#34d399'}}>{(profile?.vacation_allowance??15)-(profile?.vacation_used??0)-(profile?.vacation_pending??0)}</div><div style={s.vacLabel}>Remaining</div></div>
        </div>
      </div>

      {/* Edit Info */}
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>Edit Information</span></div>
        <div style={s.formGrid}>
          <div style={s.formGroup}><label style={s.label}>Display Name</label><input style={s.input} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div style={s.formGroup}><label style={s.label}>Full Name</label><input style={s.input} value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))}/></div>
          <div style={s.formGroup}><label style={s.label}>Date of Birth</label><input style={s.input} type="date" value={form.birthday} onChange={e=>setForm(f=>({...f,birthday:e.target.value}))}/></div>
          <div style={s.formGroup}><label style={s.label}>Start Date</label><input style={s.input} type="date" value={form.start_date} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))}/></div>
          <div style={s.formGroup}><label style={s.label}>Timezone</label>
            <select style={s.input} value={form.timezone} onChange={e=>setForm(f=>({...f,timezone:e.target.value}))}>
              {TIMEZONES.map(tz=><option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <div style={s.formGroup}>
            <label style={{...s.label, display:'flex', alignItems:'center', gap:4}}><svg width="12" height="12" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg> Discord</label>
            <input style={s.input} value={form.discord_name} onChange={e=>setForm(f=>({...f,discord_name:e.target.value}))} placeholder="username"/>
          </div>
          <div style={s.formGroup}>
            <label style={{...s.label, display:'flex', alignItems:'center', gap:4}}><svg width="12" height="12" viewBox="0 0 24 24" fill="#26A5E4"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> Telegram</label>
            <input style={s.input} value={form.telegram_name} onChange={e=>setForm(f=>({...f,telegram_name:e.target.value}))} placeholder="@username"/>
          </div>
        </div>

        <div style={{marginTop:16}}>
          <label style={s.label}>Languages Spoken</label>
          <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:8}}>
            {LANGUAGES.map(lang => {
              const selected = form.languages_spoken.includes(lang)
              return (
                <div key={lang} onClick={()=>toggleLanguage(lang)} style={{padding:'5px 12px', borderRadius:20, cursor:'pointer', fontSize:'0.78rem', fontWeight:600, border:`1px solid ${selected?'#3b82f6':'#2d3748'}`, background:selected?'#3b82f622':'transparent', color:selected?'#60a5fa':'#64748b'}}>
                  {lang}
                </div>
              )
            })}
          </div>
        </div>

        <button style={{...s.btnPrimary, marginTop:20}} disabled={saving} onClick={save}>
          {saved?'✓ Saved':saving?'Saving…':'Save Changes'}
        </button>
      </div>

      {/* Shift Schedule */}
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>Shift Information</span></div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6}}>
          {DAYS.map(day => {
            const isEvenMonth = (new Date().getMonth() + 1) % 2 === 0
            let daysOff = profile?.days_off || []
            if (profile?.rotating_days_off) {
              daysOff = isEvenMonth ? (profile?.days_off||[]) : (profile?.rotating_days_off_alt||[])
            }
            const isOff   = daysOff.includes(day)
            const isToday = new Date().toLocaleDateString('en-GB',{weekday:'long'}) === day
            return (
              <div key={day} style={{textAlign:'center', padding:'10px 4px', borderRadius:8, background:isOff?'#f8717115':isToday?'#3b82f620':'#0f1117', border:`1px solid ${isOff?'#f8717133':isToday?'#3b82f644':'#1e2433'}`}}>
                <div style={{fontSize:'0.65rem', color:isOff?'#f87171':isToday?'#60a5fa':'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4}}>{day.slice(0,3)}</div>
                <div style={{fontSize:'0.7rem', fontWeight:600, color:isOff?'#be123c':isToday?'#60a5fa':'#94a3b8'}}>{isOff?'OFF':profile?.shift?.split(' ')[0]||'—'}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
