import { formatHours } from '../../lib/utils'
import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function PageAttendanceReport() {
  const [data, setData]     = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth]   = useState(new Date().getMonth())
  const [year, setYear]     = useState(new Date().getFullYear())
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

  useEffect(() => { load() }, [month, year])

  async function load() {
    setLoading(true)
    const from = new Date(year, month, 1)
    const to   = new Date(year, month+1, 0)
    const workingDays = Array.from({length:to.getDate()},(_,i)=>new Date(year,month,i+1)).filter(d=>d.getDay()!==0&&d.getDay()!==6).length

    const [{ data:mods },{ data:att }] = await Promise.all([
      supabase.from('profiles').select('id,name,shift,days_off').eq('role','mod').eq('status','active'),
      supabase.from('attendance').select('user_id,clock_in,clock_out,lunch_start,lunch_end').gte('clock_in', from.toISOString()).lte('clock_in', to.toISOString()),
    ])

    const result = (mods||[]).map(mod => {
      const sessions = (att||[]).filter(a=>a.user_id===mod.id)
      const daysWorked = new Set(sessions.map(a=>new Date(a.clock_in).toDateString())).size
      const totalMins = sessions.filter(a=>a.clock_out).reduce((acc,a)=>acc+Math.round((new Date(a.clock_out)-new Date(a.clock_in))/60000),0)
      const lateSessions = sessions.filter(a=>{
        const hour = new Date(a.clock_in).getHours()
        const shiftStart = mod.shift==='Morning Shift'?9:mod.shift==='Afternoon Shift'?17:0
        return Math.abs(hour-shiftStart) > 0
      }).length
      const lunchOver = sessions.filter(a=>{
        if (!a.lunch_start||!a.lunch_end) return false
        return Math.round((new Date(a.lunch_end)-new Date(a.lunch_start))/60000) > 30
      }).length
      const daysOff = (mod.days_off||[]).length
      const expectedDays = workingDays - Math.round(workingDays/7*daysOff)
      const missingDays = Math.max(0, expectedDays - daysWorked)

      return { ...mod, daysWorked, totalMins, lateSessions, lunchOver, missingDays, expectedDays }
    })

    setData(result); setLoading(false)
  }

  return (
    <div style={sa.content}>
      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Attendance Report</h1>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <select style={{...sa.input, minWidth:130}} value={month} onChange={e=>setMonth(+e.target.value)}>
            {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
          </select>
          <select style={{...sa.input, minWidth:90}} value={year} onChange={e=>setYear(+e.target.value)}>
            {[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div style={sa.card}>
        {loading?<div style={sa.empty}>Loading…</div>:(
          <div style={{overflowX:'auto'}}>
            <table style={sa.table}>
              <thead>
                <tr>
                  {['Moderator','Shift','Days Worked','Expected','Missing','Total Hours','Late Clock-ins','Lunch Over 30m'].map(h=>(
                    <th key={h} style={sa.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map(m=>(
                  <tr key={m.id}>
                    <td style={sa.td}>{m.name}</td>
                    <td style={sa.td}><span style={{fontSize:'0.75rem', color:'#64748b'}}>{m.shift?.replace(' Shift','')}</span></td>
                    <td style={sa.td}><span style={{fontWeight:600, color:'#f1f5f9'}}>{m.daysWorked}</span></td>
                    <td style={sa.td}>{m.expectedDays}</td>
                    <td style={sa.td}>
                      <span style={{fontWeight:600, color:m.missingDays>0?'#f87171':'#34d399'}}>
                        {m.missingDays>0?`-${m.missingDays}`:'✓'}
                      </span>
                    </td>
                    <td style={sa.td}>{formatHours(m.totalMins)}</td>
                    <td style={sa.td}>
                      <span style={{color:m.lateSessions>0?'#f59e0b':'#64748b'}}>{m.lateSessions}</span>
                    </td>
                    <td style={sa.td}>
                      <span style={{color:m.lunchOver>0?'#f87171':'#64748b'}}>{m.lunchOver}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
