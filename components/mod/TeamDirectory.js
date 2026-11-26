import { SHIFT_COLORS, isTestAccount } from '../../lib/utils'
import { s } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function TeamDirectory() {
  const [mods, setMods]     = useState([])
  const [search, setSearch] = useState('')
  useEffect(()=>{
    supabase.from('profiles').select('id,name,full_name,nickname,shift,timezone,discord_name,telegram_name,days_off,rotating_days_off,rotating_days_off_alt,mod_group,status,avatar_url').eq('role','mod').neq('status','left').order('name')
      .then(({data})=>setMods((data||[]).filter(x=>!isTestAccount(x))))
  },[])
  const SHIFT_COLOR = SHIFT_COLORS
  const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  const filtered=mods.filter(m=>m.name?.toLowerCase().includes(search.toLowerCase())||m.full_name?.toLowerCase().includes(search.toLowerCase())||m.discord_name?.toLowerCase().includes(search.toLowerCase()))
  // Days off that apply this month (handles monthly rotation)
  const isEvenMonth = (new Date().getMonth() + 1) % 2 === 0
  const daysOffNow = m => m.rotating_days_off ? (isEvenMonth ? (m.days_off||[]) : (m.rotating_days_off_alt||[])) : (m.days_off||[])
  // Grouped by shift instead of one long list by name
  const SHIFT_ORDER = [
    { key:'Morning Shift',   label:'Morning',   hours:'9 AM–5 PM' },
    { key:'Afternoon Shift', label:'Afternoon', hours:'5 PM–12 AM' },
    { key:'Night Shift',     label:'Night',     hours:'12 AM–9 AM' },
    { key:null,              label:'No shift',  hours:'' },
  ]
  const groups = SHIFT_ORDER.map(g => ({ ...g, mods: filtered.filter(m => g.key ? m.shift === g.key : !['Morning Shift','Afternoon Shift','Night Shift'].includes(m.shift)) })).filter(g => g.mods.length > 0)
  return (
    <div style={s.card}>
      <div style={s.cardHead}><span style={s.cardTitle}>Team Directory</span><span style={s.chip}>{mods.length} mods</span></div>
      <input style={{...s.input,marginBottom:16,width:'100%'}} placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
      {groups.map(g => (
      <div key={g.label} style={{marginBottom:18}}>
        <div style={{display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:`2px solid ${(g.key?SHIFT_COLOR[g.key]:'#94a3b8')}55`}}>
          <span style={{width:10, height:10, borderRadius:3, background:g.key?SHIFT_COLOR[g.key]:'#94a3b8'}}/>
          <span style={{fontSize:'0.82rem', fontWeight:700, color:'#f1f5f9', textTransform:'uppercase', letterSpacing:'0.05em'}}>{g.label}</span>
          {g.hours && <span style={{fontSize:'0.72rem', color:'#64748b'}}>{g.hours} (Lisbon time)</span>}
          <span style={{marginLeft:'auto', fontSize:'0.72rem', color:'#64748b'}}>{g.mods.length} {g.mods.length===1?'mod':'mods'}</span>
        </div>
      {g.mods.map(m=>{
        const shiftColor=SHIFT_COLOR[m.shift]||'#94a3b8', daysOff=daysOffNow(m)
        return (
 <div key={m.id} style={{padding:'12px 0',borderBottom:'1px solid #1e2433'}}>
  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
    <div style={{width:36,height:36,borderRadius:'50%',flexShrink:0,overflow:'hidden'}}>
      {m.avatar_url
        ? <img src={m.avatar_url} alt={m.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.9rem',fontWeight:700,color:'#fff'}}>{m.name[0].toUpperCase()}</div>
      }
    </div>
    <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                  <span style={{fontSize:'0.87rem',fontWeight:600,color:'#f1f5f9'}}>{m.name}</span>
                  {m.nickname&&<span style={{fontSize:'0.72rem',color:'#64748b'}}>"{m.nickname}"</span>}
                  {m.mod_group==='russian'&&<span style={{fontSize:'0.6rem',background:'#f59e0b22',color:'#f59e0b',padding:'1px 5px',borderRadius:3,fontWeight:700}}>RU</span>}
                  {m.timezone&&<span style={{fontSize:'0.68rem',color:'#64748b'}}>🌍 {m.timezone}</span>}
                </div>
                {m.full_name&&<div style={{fontSize:'0.72rem',color:'#64748b',marginTop:2}}>{m.full_name}</div>}
                <div style={{display:'flex',gap:12,marginTop:4,flexWrap:'wrap'}}>
                  {m.discord_name&&<span style={{display:'flex',alignItems:'center',gap:4,fontSize:'0.72rem',color:'#94a3b8'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>{m.discord_name}</span>}
                  {m.telegram_name&&<span style={{display:'flex',alignItems:'center',gap:4,fontSize:'0.72rem',color:'#94a3b8'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="#26A5E4"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>{m.telegram_name}</span>}
                </div>
              </div>
              <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                {DAYS.map(d=>(
                  <div key={d} style={{fontSize:'0.6rem',fontWeight:700,padding:'3px 5px',borderRadius:4,background:daysOff.includes(d)?'#be123c33':shiftColor+'15',color:daysOff.includes(d)?'#be123c':shiftColor,textTransform:'uppercase'}}>{d.slice(0,2)}</div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
      </div>
      ))}
    </div>
  )
}
