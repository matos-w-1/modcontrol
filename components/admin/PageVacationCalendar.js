import { fmtDate, isTestAccount, toLocalISO } from '../../lib/utils'
import { AddVacationPanel } from './AddVacationPanel'
import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function PageVacationCalendar() {
  const [vacations, setVacations] = useState([])
  const [mods, setMods]           = useState({})
  const [month, setMonth]         = useState(new Date().getMonth())
  const [year, setYear]           = useState(new Date().getFullYear())
  const [showAdd, setShowAdd]     = useState(false)
  const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December']

  useEffect(()=>{load()},[month,year])

  // Remove an approved vacation (added by mistake) and give the days back.
  async function removeVacation(vac) {
    const name = mods[vac.user_id]?.name || 'this moderator'
    if (!window.confirm(`Delete ${name}'s vacation ${fmtDate(vac.start_date)} → ${fmtDate(vac.end_date)} (${vac.days_requested} days)? The days will be given back.`)) return
    const { data: prof } = await supabase.from('profiles').select('vacation_used').eq('id', vac.user_id).single()
    await supabase.from('vacation_requests').delete().eq('id', vac.id)
    await supabase.from('profiles').update({ vacation_used: Math.max(0, (prof?.vacation_used||0) - (vac.days_requested||0)) }).eq('id', vac.user_id)
    load()
  }

  async function load() {
    const from=toLocalISO(new Date(year,month,1)), to=toLocalISO(new Date(year,month+1,0))
    const [{data:v},{data:p}]=await Promise.all([
      supabase.from('vacation_requests').select('*').eq('status','approved').lte('start_date',to).gte('end_date',from).order('start_date'),
      supabase.from('profiles').select('id,name,avatar_url,days_off,rotating_days_off,rotating_days_off_alt,vacation_used,vacation_allowance').eq('role','mod').neq('status','left'),
    ])
    const testIds=new Set((p||[]).filter(isTestAccount).map(x=>x.id))
    const map={}; (p||[]).filter(x=>!isTestAccount(x)).forEach(x=>map[x.id]=x)
    setMods(map); setVacations((v||[]).filter(x=>!testIds.has(x.user_id) && map[x.user_id]))
  }

  const daysInMonth=new Date(year,month+1,0).getDate()
  const days=Array.from({length:daysInMonth},(_,i)=>i+1)
  function isOnVac(vac,day) { const d=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`; return d>=vac.start_date&&d<=vac.end_date }

  return (
    <div style={sa.content}>
      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Vacation Calendar</h1>
        <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
          <button style={sa.btnPrimary} onClick={()=>setShowAdd(v=>!v)}>{showAdd?'Close':'+ Add vacation'}</button>
          <button style={sa.filterBtn} onClick={()=>{const d=new Date(year,month-1,1);setMonth(d.getMonth());setYear(d.getFullYear())}}>← Prev</button>
          <span style={{fontSize:'0.9rem', fontWeight:600, color:'#f1f5f9', minWidth:140, textAlign:'center'}}>{MONTHS[month]} {year}</span>
          <button style={sa.filterBtn} onClick={()=>{const d=new Date(year,month+1,1);setMonth(d.getMonth());setYear(d.getFullYear())}}>Next →</button>
        </div>
      </div>
      {showAdd && <AddVacationPanel mods={Object.values(mods).sort((a,b)=>(a.name||'').localeCompare(b.name||''))} onDone={()=>{ setShowAdd(false); load() }} onCancel={()=>setShowAdd(false)}/>}
      {vacations.length===0?<div style={sa.card}><p style={sa.empty}>No approved vacations this month.</p></div>:(
        <div style={sa.card}>
          <div style={{overflowX:'auto'}}>
            <table style={{...sa.table, minWidth:800}}>
              <thead><tr>
                <th style={{...sa.th, width:130}}>Moderator</th>
                {days.map(d=>{
                  const date=new Date(year,month,d), isToday=new Date().toDateString()===date.toDateString(), isWeekend=date.getDay()===0||date.getDay()===6
                  return <th key={d} style={{...sa.th, textAlign:'center', minWidth:28, padding:'0 1px 10px', color:isToday?'#60a5fa':isWeekend?'#4a5568':'#64748b', fontSize:'0.65rem'}}>{d}</th>
                })}
                <th style={sa.th}></th>
              </tr></thead>
              <tbody>
                {vacations.map(vac=>{
                  const mod=mods[vac.user_id]
                  return (
                    <tr key={vac.id}>
                      <td style={{...sa.td, fontWeight:500, fontSize:'0.82rem', whiteSpace:'nowrap'}}>
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          {mod?.avatar_url?<img src={mod.avatar_url} alt="" style={{width:22,height:22,borderRadius:'50%',objectFit:'cover'}}/>:<div style={{width:22,height:22,borderRadius:'50%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.65rem',fontWeight:700,color:'#fff'}}>{(mod?.name||'?')[0].toUpperCase()}</div>}
                          {mod?.name||'Unknown'}
                        </div>
                      </td>
                      {days.map(d=>(
                        <td key={d} style={{padding:'4px 1px', textAlign:'center', borderBottom:'1px solid #0f1117'}}>
                          {isOnVac(vac,d)&&<div style={{width:'100%', height:8, background:'#a855f766', borderRadius:2}}/>}
                        </td>
                      ))}
                      <td style={{padding:'4px 6px', borderBottom:'1px solid #0f1117', whiteSpace:'nowrap'}}>
                        <span style={{fontSize:'0.7rem', color:'#64748b', marginRight:8}}>{vac.days_requested}d</span>
                        <button style={sa.btnSmRed} onClick={()=>removeVacation(vac)} title="Delete this vacation and give the days back">Delete</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
