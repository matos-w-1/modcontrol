import { fmtDate } from '../../lib/utils'
import { s } from '../../lib/styles'
import { useState } from 'react'

export function VacationDatePicker({ profile, myRequests, selectedDays, setSelectedDays, onChange }) {
  const [viewDate, setViewDate] = useState(new Date())
  const year = viewDate.getFullYear(), month = viewDate.getMonth()
  const DOW = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const isEvenMonth = (month+1)%2===0
  const today = new Date(); today.setHours(0,0,0,0)

  const offNames = profile?.rotating_days_off
    ? (isEvenMonth ? (profile.days_off||[]) : (profile.rotating_days_off_alt||[]))
    : (profile?.days_off||[])

  function toISO(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
  function isDayOff(d) { return offNames.includes(d.toLocaleDateString('en-GB',{weekday:'long'})) }
  function isRequested(d) {
    const iso = toISO(d)
    return (myRequests||[]).some(r => r.status!=='declined' && iso>=r.start_date && iso<=r.end_date)
  }

  function getCells() {
    const first = new Date(year, month, 1)
    const last  = new Date(year, month+1, 0)
    const pad = (first.getDay()+6)%7
    const cells = []
    for (let i=0;i<pad;i++) cells.push(null)
    for (let d=1; d<=last.getDate(); d++) cells.push(new Date(year,month,d))
    return cells
  }

  function toggleDay(d) {
    const iso = toISO(d)
    setSelectedDays(days => days.includes(iso) ? days.filter(x=>x!==iso) : [...days, iso].sort())
    onChange?.()
  }

  const cells = getCells()

  return (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:'0.75rem', color:'#64748b', marginBottom:10}}>Click any days you want off — they don't need to be consecutive.</div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
        <button style={s.filterBtn} onClick={()=>setViewDate(new Date(year,month-1,1))}>← Prev</button>
        <span style={{fontSize:'0.88rem', fontWeight:600, color:'#f1f5f9'}}>{MONTHS[month]} {year}</span>
        <button style={s.filterBtn} onClick={()=>setViewDate(new Date(year,month+1,1))}>Next →</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:4}}>
        {DOW.map(d => <div key={d} style={{textAlign:'center', fontSize:'0.62rem', fontWeight:700, color:'#4a5568', textTransform:'uppercase'}}>{d}</div>)}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4}}>
        {cells.map((d,i) => {
          if (!d) return <div key={i}/>
          const past = d < today
          const off = isDayOff(d)
          const requested = isRequested(d)
          const iso = toISO(d)
          const selected = selectedDays.includes(iso)
          const disabled = past || off
          let style = { background:'transparent', color:'#cbd5e1', border:'1px solid transparent' }
          if (off)       style = { background:'#f8717118', color:'#f87171', border:'1px solid #f8717133' }
          if (requested) style = { background:'#34d39918', color:'#34d399', border:'1px solid #34d39933' }
          if (selected)  style = { background:'#3b82f6', color:'#fff', border:'1px solid #3b82f6' }
          return (
            <div key={i} onClick={()=>!disabled && toggleDay(d)}
              style={{textAlign:'center', padding:'8px 0', borderRadius:8, fontSize:'0.78rem', fontWeight:selected?700:500,
                cursor:disabled?'not-allowed':'pointer', opacity:past?0.3:1, ...style}}>
              {d.getDate()}
            </div>
          )
        })}
      </div>
      <div style={{display:'flex', gap:16, flexWrap:'wrap', marginTop:14}}>
        <div style={{display:'flex', alignItems:'center', gap:6}}><div style={{width:10,height:10,borderRadius:3,background:'#be123c'}}/><span style={{fontSize:'0.72rem', color:'#94a3b8'}}>Your day off</span></div>
        <div style={{display:'flex', alignItems:'center', gap:6}}><div style={{width:10,height:10,borderRadius:3,background:'#34d399'}}/><span style={{fontSize:'0.72rem', color:'#94a3b8'}}>Already requested</span></div>
        <div style={{display:'flex', alignItems:'center', gap:6}}><div style={{width:10,height:10,borderRadius:3,background:'#3b82f6'}}/><span style={{fontSize:'0.72rem', color:'#94a3b8'}}>Selected</span></div>
      </div>
      {selectedDays.length>0 && (
        <div style={{marginTop:10, fontSize:'0.8rem', color:'#94a3b8'}}>
          Selected ({selectedDays.length} day{selectedDays.length===1?'':'s'}): <strong style={{color:'#f1f5f9'}}>{selectedDays.map(d=>fmtDate(d)).join(', ')}</strong>
        </div>
      )}
    </div>
  )
}
