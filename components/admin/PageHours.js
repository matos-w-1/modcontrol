import { fmtDate, fmtTime, formatHours } from '../../lib/utils'
import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function PageHours() {
  const [mods, setMods]         = useState([])
  const [selected, setSelected] = useState('')
  const [month, setMonth]       = useState(new Date().getMonth())
  const [year, setYear]         = useState(new Date().getFullYear())
  const [records, setRecords]   = useState([])
  const [loading, setLoading]   = useState(false)
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

  useEffect(() => { supabase.from('profiles').select('id,name').eq('role','mod').neq('status','left').order('name').then(({data})=>setMods(data||[])) }, [])
  useEffect(() => { if(selected) load() }, [selected, month, year])

  async function load() {
    setLoading(true)
    const from = new Date(year, month, 1).toISOString()
    const to   = new Date(year, month+1, 0, 23, 59, 59).toISOString()
    const { data } = await supabase.from('attendance').select('*').eq('user_id', selected).gte('clock_in', from).lte('clock_in', to).order('clock_in')
    setRecords(data||[]); setLoading(false)
  }

  const totalMins = records.filter(r=>r.clock_out).reduce((acc,r)=>acc+Math.round((new Date(r.clock_out)-new Date(r.clock_in))/60000),0)
  const diff = totalMins - 35*60
  const byDay = {}
  records.forEach(r => {
    const day = new Date(r.clock_in).toLocaleDateString('en-GB',{day:'2-digit',month:'short'})
    if (!byDay[day]) byDay[day] = 0
    if (r.clock_out) byDay[day] += Math.round((new Date(r.clock_out)-new Date(r.clock_in))/60000)
  })

  return (
    <div style={sa.content}>
      <h1 style={sa.pageTitle}>Hours & Attendance</h1>
      <div style={{display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center'}}>
        <select style={{...sa.input, minWidth:160}} value={selected} onChange={e=>setSelected(e.target.value)}>
          <option value="">Select moderator…</option>
          {mods.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select style={{...sa.input, minWidth:130}} value={month} onChange={e=>setMonth(+e.target.value)}>
          {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
        </select>
        <select style={{...sa.input, minWidth:90}} value={year} onChange={e=>setYear(+e.target.value)}>
          {[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {!selected && <div style={sa.card}><p style={sa.empty}>Select a moderator to view their hours.</p></div>}
      {selected && !loading && <>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20}}>
          {[
            { label:'Total Hours', val:formatHours(totalMins), col:'#60a5fa' },
            { label:'Target', val:'35h', col:'#94a3b8' },
            { label:'vs Target', val:(diff>=0?'+':'')+formatHours(Math.abs(diff)), col:diff>=0?'#34d399':'#f87171' },
            { label:'Days Worked', val:Object.keys(byDay).length, col:'#8b5cf6' },
          ].map(item=>(
            <div key={item.label} style={sa.statCard}>
              <span style={{...sa.statNum, color:item.col, fontSize:'1.5rem'}}>{item.val}</span>
              <span style={sa.statLabel}>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={sa.card}>
          <div style={sa.cardHead}><span style={sa.cardTitle}>Daily Breakdown — {MONTHS[month]} {year}</span></div>
          {Object.keys(byDay).length === 0 ? <p style={sa.empty}>No records.</p> : (
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              {Object.entries(byDay).map(([day, mins]) => {
                const pct = Math.min(100, Math.round((mins/480)*100))
                return (
                  <div key={day} style={{display:'grid', gridTemplateColumns:'80px 1fr 60px', gap:12, alignItems:'center'}}>
                    <span style={{fontSize:'0.78rem', color:'#94a3b8'}}>{day}</span>
                    <div style={sa.barTrack}><div style={{...sa.barFill, width:`${pct}%`, background:'linear-gradient(90deg,#3b82f6,#60a5fa)'}}/></div>
                    <span style={{fontSize:'0.72rem', color:'#64748b', textAlign:'right'}}>{formatHours(mins)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div style={sa.card}>
          <div style={sa.cardHead}><span style={sa.cardTitle}>Session Log</span></div>
          <div style={{overflowX:'auto'}}>
            <table style={sa.table}>
              <thead><tr>{['Date','Clock In','Lunch','Clock Out','Duration'].map(h=><th key={h} style={sa.th}>{h}</th>)}</tr></thead>
              <tbody>
                {records.map(r => {
                  const mins = r.clock_out ? Math.round((new Date(r.clock_out)-new Date(r.clock_in))/60000) : null
                  const lunchMins = r.lunch_start && r.lunch_end ? Math.round((new Date(r.lunch_end)-new Date(r.lunch_start))/60000) : null
                  return (
                    <tr key={r.id}>
                      <td style={sa.td}>{fmtDate(r.clock_in)}</td>
                      <td style={sa.td}>{fmtTime(r.clock_in)}</td>
                      <td style={sa.td}>{lunchMins ? <span style={{color:lunchMins>30?'#f87171':'#94a3b8'}}>{lunchMins}m</span> : '—'}</td>
                      <td style={sa.td}>{fmtTime(r.clock_out)}</td>
                      <td style={sa.td}>{mins ? formatHours(mins) : <span style={{color:'#34d399'}}>Active</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </>}
    </div>
  )
}
