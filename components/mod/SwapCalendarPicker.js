import { fmtDate, isTestAccount, toLocalISO } from '../../lib/utils'
import { s } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function SwapCalendarPicker({ userId, form, setForm }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [mods, setMods]         = useState([])
  const [vacations, setVacations] = useState([])
  const [loading, setLoading]   = useState(true)
  const year = currentDate.getFullYear(), month = currentDate.getMonth()
  const isEvenMonth = (month+1)%2===0
  const DOW = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const today = new Date(); today.setHours(0,0,0,0)

  useEffect(() => { load() }, [month, year])

  async function load() {
    setLoading(true)
    const firstDay = toLocalISO(new Date(year,month,1))
    const lastDay  = toLocalISO(new Date(year,month+1,0))
    const [{data:m},{data:v}] = await Promise.all([
      supabase.from('profiles').select('id,name,shift,days_off,rotating_days_off,rotating_days_off_alt').eq('role','mod').neq('status','left').order('shift').order('name'),
      supabase.from('vacation_requests').select('user_id,start_date,end_date').eq('status','approved').lte('start_date',lastDay).gte('end_date',firstDay),
    ])
    setMods((m||[]).filter(x=>!isTestAccount(x))); setVacations(v||[]); setLoading(false)
  }

  function isOff(mod, d) {
    const dayName = d.toLocaleDateString('en-GB',{weekday:'long'})
    let daysOff = mod.days_off||[]
    if (mod.rotating_days_off) daysOff = isEvenMonth ? (mod.days_off||[]) : (mod.rotating_days_off_alt||[])
    return daysOff.includes(dayName)
  }
  function isOnVacation(modId, d) {
    const iso = toLocalISO(d)
    return vacations.some(v => v.user_id===modId && iso>=v.start_date && iso<=v.end_date)
  }

  function getDays() {
    const days=[]
    const last = new Date(year,month+1,0)
    for (let d=1; d<=last.getDate(); d++) days.push(new Date(year,month,d))
    return days
  }

  function handleClick(mod, d) {
    if (d < today || isOff(mod,d) || isOnVacation(mod.id,d)) return
    const iso = toLocalISO(d)
    if (mod.id === userId) setForm(f => ({ ...f, my_date: iso }))
    else setForm(f => ({ ...f, target_id: mod.id, their_date: iso }))
  }

  const days = getDays()
  const sorted = [...mods].sort((a,b) => (a.id===userId?-1:0) - (b.id===userId?-1:0))
  const targetName = mods.find(m=>m.id===form.target_id)?.name

  return (
    <div>
      <div style={{fontSize:'0.75rem', color:'#64748b', marginBottom:10}}>
        Click one of <strong style={{color:'#f1f5f9'}}>your</strong> working days to give it away, then click a working day of a <strong style={{color:'#f1f5f9'}}>colleague</strong> to take it.
      </div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
        <button style={s.filterBtn} onClick={()=>setCurrentDate(new Date(year,month-1,1))}>← Prev</button>
        <span style={{fontSize:'0.88rem', fontWeight:600, color:'#f1f5f9'}}>{MONTHS[month]} {year}</span>
        <button style={s.filterBtn} onClick={()=>setCurrentDate(new Date(year,month+1,1))}>Next →</button>
      </div>
      {loading ? <div style={s.empty}>Loading…</div> : (
        <div style={{overflowX:'auto', marginBottom:12}}>
          <table style={{...s.table, minWidth:900}}>
            <thead><tr>
              <th style={{...s.th, width:110, position:'sticky', left:0, background:'#0f1117', zIndex:1}}>Mod</th>
              {days.map((d,i) => (
                <th key={i} style={{...s.th, textAlign:'center', minWidth:32, padding:'0 2px 10px'}}>
                  <div style={{fontSize:'0.54rem', color:'#4a5568'}}>{DOW[(d.getDay()+6)%7]}</div>
                  <div style={{fontSize:'0.72rem'}}>{d.getDate()}</div>
                </th>
              ))}
            </tr></thead>
            <tbody>
              {sorted.map((mod,mi) => {
                const isMe = mod.id===userId
                return (
                  <tr key={mod.id} style={{background:isMe?'#3b82f611':mi%2===0?'transparent':'#0a0d1422'}}>
                    <td style={{...s.td, fontSize:'0.78rem', fontWeight:isMe?700:500, whiteSpace:'nowrap', position:'sticky', left:0, background:isMe?'#182238':mi%2===0?'#141820':'#111520', zIndex:1}}>
                      {isMe?'You':mod.name} <span style={{fontSize:'0.58rem', color:'#64748b'}}>({mod.shift?.split(' ')[0]||'—'})</span>
                    </td>
                    {days.map((d,i) => {
                      const iso = toLocalISO(d)
                      const off = isOff(mod,d), vac = isOnVacation(mod.id,d)
                      const past = d < today
                      const working = !off && !vac && !past
                      const selected = isMe ? iso===form.my_date : (mod.id===form.target_id && iso===form.their_date)
                      return (
                        <td key={i} onClick={()=>handleClick(mod,d)} style={{padding:'5px 2px', textAlign:'center', cursor:working?'pointer':'default', opacity:past?0.35:1}}>
                          {vac ? <div style={{fontSize:'0.52rem', fontWeight:700, color:'#a855f7'}}>VAC</div>
                            : off ? <div style={{fontSize:'0.52rem', fontWeight:700, color:'#be123c'}}>OFF</div>
                            : <div style={{width:15, height:15, borderRadius:5, margin:'0 auto', background:selected?'#3b82f6':'#3b82f622', border:selected?'1px solid #3b82f6':'1px solid #3b82f633'}}/>}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {(form.my_date || form.their_date) && (
        <div style={{fontSize:'0.8rem', color:'#94a3b8', marginBottom:4}}>
          {form.my_date && <>You give: <strong style={{color:'#f1f5f9'}}>{fmtDate(form.my_date)}</strong></>}
          {form.my_date && form.their_date && ' · '}
          {form.their_date && <>You take: <strong style={{color:'#f1f5f9'}}>{fmtDate(form.their_date)}</strong>{targetName?` from ${targetName}`:''}</>}
        </div>
      )}
    </div>
  )
}
