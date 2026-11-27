import { SHIFT_COLORS, fmtHourShort, isTestAccount, toLocalISO, swapRole } from '../../lib/utils'
import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function AdminPageCalendar() {
  const [mods, setMods]           = useState([])
  const [vacations, setVacations] = useState([])
  const [swaps, setSwaps]         = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading]     = useState(true)
  const [birthdays, setBirthdays] = useState([])
  const [overrides, setOverrides] = useState([])

  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const isEvenMonth = (month + 1) % 2 === 0

  const DAYS_OF_WEEK = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const MONTH_NAMES  = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const SHIFT_COLOR = SHIFT_COLORS

  useEffect(() => { load() }, [month, year])

  async function load() {
  setLoading(true)
  const firstDay = toLocalISO(new Date(year, month, 1))
  const lastDay  = toLocalISO(new Date(year, month + 1, 0))
  const [{ data:m },{ data:v },{ data:sw },{ data:bd },{ data:ov }] = await Promise.all([
    supabase.from('profiles').select('id,name,shift,days_off,rotating_days_off,rotating_days_off_alt,mod_group,birthday').eq('role','mod').neq('status','left').order('name'),
    supabase.from('vacation_requests').select('id,user_id,start_date,end_date').eq('status','approved').lte('start_date',lastDay).gte('end_date',firstDay),
    supabase.from('shift_swaps').select('id,requester_id,target_id,swap_date,target_date').eq('status','approved').or(`and(swap_date.gte.${firstDay},swap_date.lte.${lastDay}),and(target_date.gte.${firstDay},target_date.lte.${lastDay})`),
    supabase.from('profiles').select('id,birthday').eq('role','mod').not('birthday','is',null),
    supabase.from('shift_overrides').select('*'),
  ])
  setMods((m||[]).filter(x=>!isTestAccount(x))); setVacations(v||[]); setSwaps(sw||[])
  setBirthdays(bd||[])
  setOverrides(ov||[])
  setLoading(false)
}

  function getDays() {
    const days = []
    const last = new Date(year, month + 1, 0)
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d))
    return days
  }

  function isOff(mod, date) {
    const dayName = date.toLocaleDateString('en-GB',{weekday:'long'})
    let daysOff = mod.days_off || []
    if (mod.rotating_days_off) {
      daysOff = isEvenMonth ? (mod.days_off||[]) : (mod.rotating_days_off_alt||[])
    }
    return daysOff.includes(dayName)
  }

  function isOnVacation(modId, date) {
    const d = toLocalISO(date)
    return vacations.some(v => v.user_id===modId && d>=v.start_date && d<=v.end_date)
  }

  function getCell(mod, date) {
    const isBirthday = birthdays.some(b => {
      if (!b.birthday || b.id !== mod.id) return false
      const bd = new Date(b.birthday)
      return bd.getMonth()===date.getMonth() && bd.getDate()===date.getDate()
    })
    if (isBirthday)                  return { label:'🎂', color:'#f472b6', bg:'#f472b618' }
    if (isOnVacation(mod.id, date))  return { label:'VAC', color:'#a855f7', bg:'#a855f718' }
    const swap = swapRole(swaps, mod.id, toLocalISO(date))      // 'out' = gave the day away, 'in' = works an extra day
    if (swap === 'out')              return { label:'SWAP', color:'#cbd5e1', bg:'#cbd5e118' }
    if (swap !== 'in' && isOff(mod, date)) return { label:'OFF', color:'#be123c', bg:'#be123c33' }
    const dayName = date.toLocaleDateString('en-GB',{weekday:'long'})
    const override = overrides.find(o => o.user_id===mod.id && o.day_of_week===dayName)
    if (override) {
      const color = SHIFT_COLOR[override.shift] || '#94a3b8'
      const label = override.start_time && override.end_time
        ? `${fmtHourShort(override.start_time)}-${fmtHourShort(override.end_time)}`
        : override.shift?.split(' ')[0]||'—'
      return { label, color, bg: color+'15', swapIn: swap==='in' }
    }
    const color = SHIFT_COLOR[mod.shift] || '#94a3b8'
    return { label: mod.shift?.split(' ')[0]||'—', color, bg: color+'15', swapIn: swap==='in' }
  }

  const days  = getDays()
  const today = new Date()

  const englishMods   = mods.filter(m => m.mod_group !== 'russian')
  const russianMods   = mods.filter(m => m.mod_group === 'russian')
  const nightMods     = englishMods.filter(m => m.shift === 'Night Shift')
  const morningMods   = englishMods.filter(m => m.shift === 'Morning Shift')
  const afternoonMods = englishMods.filter(m => m.shift === 'Afternoon Shift')

  function ShiftCalendar({ title, accent, rows }) {
    if (rows.length === 0) return null
    return (
      <div style={{marginBottom:40}}>
        <div style={{fontSize:'0.78rem', fontWeight:700, color:accent, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14, display:'flex', alignItems:'center', gap:10}}>
          <div style={{height:1, width:20, background:accent+'66'}}/>
          {title}
          <div style={{flex:1, height:1, background:accent+'22'}}/>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{...sa.table, minWidth:900}}>
            <thead>
              <tr>
                <th style={{...sa.th, width:120, paddingRight:16, position:'sticky', left:0, background:'#0f1117', zIndex:1}}>Mod</th>
                {days.map((d,i) => (
                  <th key={i} style={{...sa.th, textAlign:'center', minWidth:38, padding:'0 2px 12px', color:d.toDateString()===today.toDateString()?'#60a5fa':'#4a5568', fontWeight:d.toDateString()===today.toDateString()?700:400}}>
                    <div style={{fontSize:'0.57rem', marginBottom:2}}>{DAYS_OF_WEEK[(d.getDay()+6)%7]}</div>
                    <div style={{fontSize:'0.75rem', background:d.toDateString()===today.toDateString()?'#3b82f6':'transparent', color:d.toDateString()===today.toDateString()?'#fff':'inherit', borderRadius:'50%', width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto'}}>{d.getDate()}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((mod,mi) => (
                <tr key={mod.id} style={{background: mi%2===0?'transparent':'#0a0d1422'}}>
                  <td style={{...sa.td, fontWeight:500, fontSize:'0.82rem', paddingRight:16, whiteSpace:'nowrap', position:'sticky', left:0, background: mi%2===0?'#141820':'#111520', zIndex:1}}>
                    {mod.name}
                  </td>
                  {days.map((d,i) => {
                    const cell = getCell(mod, d)
                    const isToday = d.toDateString()===today.toDateString()
                    const isWeekend = d.getDay()===0||d.getDay()===6
                    const isWorking = cell.label!=='OFF'&&cell.label!=='VAC'&&cell.label!=='SWAP'&&cell.label!=='🎂'&&!cell.label?.includes('-')
                    return (
                      <td key={i} title={`${mod.name} · ${d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})} · ${isWorking?(cell.swapIn?'Working an extra day (swap)':'Working'):cell.label}`} style={{padding:'6px 1px', textAlign:'center', borderBottom:'1px solid #0f1117', borderLeft:d.getDay()===1?'1px solid #1e2433':'none', background:isToday?'#1e2a44':isWeekend?'#0d1018':'transparent'}}>
                      {isWorking
                        ? (cell.swapIn
                          ? <div style={{width:8, height:8, borderRadius:'50%', border:'2px solid #cbd5e1', boxSizing:'border-box', margin:'0 auto'}}/>
                          : <div style={{width:5, height:5, borderRadius:'50%', background:'#334155', margin:'0 auto'}}/>)
                        : <div style={{fontSize:'0.56rem', fontWeight:700, color:cell.color, background:cell.color+'2e', padding:'3px 0', borderRadius:4, textTransform:'uppercase'}}>{cell.label}</div>
                      }
                    </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (loading) return <div style={sa.content}><div style={sa.empty}>Loading…</div></div>

  return (
    <div style={{padding:'32px 24px', width:'100%', boxSizing:'border-box'}}>
      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Team Calendar</h1>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <button style={sa.filterBtn} onClick={()=>setCurrentDate(new Date(year,month-1,1))}>← Prev</button>
          <span style={{fontSize:'0.95rem', fontWeight:600, color:'#f1f5f9', minWidth:160, textAlign:'center'}}>{MONTH_NAMES[month]} {year}</span>
          <button style={sa.filterBtn} onClick={()=>setCurrentDate(new Date(year,month+1,1))}>Next →</button>
        </div>
      </div>
      <div style={{display:'flex', gap:16, flexWrap:'wrap', marginBottom:24}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:5,height:5,borderRadius:'50%',background:'#334155'}}/><span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Working</span></div>
        <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:10,height:10,borderRadius:2,background:'#be123c'}}/><span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Day Off</span></div>
        <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:10,height:10,borderRadius:2,background:'#a855f7'}}/><span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Vacation</span></div>
        <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:10,height:10,borderRadius:2,background:'#cbd5e1'}}/><span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Swapped away</span></div>
        <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:10,height:10,borderRadius:'50%',border:'2px solid #cbd5e1',boxSizing:'border-box'}}/><span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Extra day (swap)</span></div>
        <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:'0.72rem'}}>🎂</span><span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Birthday</span></div>
      </div>
      <div style={{fontSize:'0.75rem', color:'#64748b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16}}>🇬🇧 English Tickets</div>
      <ShiftCalendar title="Night Shift · 12 AM–9 AM Lisbon time"     accent={SHIFT_COLORS['Night Shift']} rows={nightMods}/>
      <ShiftCalendar title="Morning Shift · 9 AM–5 PM Lisbon time"   accent={SHIFT_COLORS['Morning Shift']} rows={morningMods}/>
      <ShiftCalendar title="Afternoon Shift · 5 PM–12 AM Lisbon time" accent={SHIFT_COLORS['Afternoon Shift']} rows={afternoonMods}/>
      {russianMods.length > 0 && (
        <>
          <div style={{fontSize:'0.75rem', color:'#f59e0b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', margin:'24px 0 16px'}}>🇷🇺 Russian Tickets</div>
          <ShiftCalendar title="Schedule" accent='#94a3b8' rows={russianMods}/>
        </>
      )}
    </div>
  )
}
