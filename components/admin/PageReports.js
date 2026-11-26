import { formatHours, getWeekRange } from '../../lib/utils'
import { weeklyTargetMins } from '../../lib/shiftTime'
import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function PageReports() {
  const [vacStats, setVacStats] = useState([])
  const [attStats, setAttStats] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { monday } = getWeekRange()
    const [{ data:profs }, { data:att }] = await Promise.all([
      supabase.from('profiles').select('id,name,shift,vacation_used,vacation_pending,vacation_allowance').eq('role','mod').neq('status','left'),
      supabase.from('attendance').select('user_id,clock_in,clock_out').gte('clock_in',monday.toISOString()).not('clock_out','is',null),
    ])
    setVacStats((profs||[]).map(p=>({ name:p.name, allowance:p.vacation_allowance||15, used:p.vacation_used||0, pending:p.vacation_pending||0, remaining:(p.vacation_allowance||15)-(p.vacation_used||0)-(p.vacation_pending||0) })))
    const profMap={}, targetMap={}; (profs||[]).forEach(p=>{ profMap[p.id]=p.name; targetMap[p.id]=weeklyTargetMins(p.shift) })
    const map={}
    ;(att||[]).forEach(r=>{
      const name=profMap[r.user_id]||r.user_id
      const mins=Math.round((new Date(r.clock_out)-new Date(r.clock_in))/60000)
      if(!map[name]) map[name]={name,minutes:0,sessions:0,target:targetMap[r.user_id]||35*60}
      map[name].minutes+=mins; map[name].sessions++
    })
    setAttStats(Object.values(map).sort((a,b)=>b.minutes-a.minutes))
    setLoading(false)
  }

  if (loading) return <div style={sa.content}><div style={sa.empty}>Loading…</div></div>

  return (
    <div style={sa.content}>
      <h1 style={sa.pageTitle}>Reports</h1>
      <div style={sa.card}>
        <div style={sa.cardHead}><span style={sa.cardTitle}>Vacation Report</span></div>
        <div style={{overflowX:'auto'}}>
          <table style={sa.table}>
            <thead><tr>{['Moderator','Allowance','Used','Pending','Remaining'].map(h=><th key={h} style={sa.th}>{h}</th>)}</tr></thead>
            <tbody>
              {vacStats.map(r=>(
                <tr key={r.name}>
                  <td style={sa.td}>{r.name}</td>
                  <td style={sa.td}>{r.allowance}</td>
                  <td style={{...sa.td,color:'#f87171'}}>{r.used}</td>
                  <td style={{...sa.td,color:'#f59e0b'}}>{r.pending}</td>
                  <td style={{...sa.td,color:'#34d399',fontWeight:600}}>{r.remaining}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={sa.card}>
        <div style={sa.cardHead}><span style={sa.cardTitle}>Weekly Hours Report</span></div>
        {attStats.length===0 ? <p style={sa.empty}>No attendance this week.</p> : (
          <div style={{overflowX:'auto'}}>
            <table style={sa.table}>
              <thead><tr>{['Moderator','Sessions','Total Hours','Target','vs Target'].map(h=><th key={h} style={sa.th}>{h}</th>)}</tr></thead>
              <tbody>
                {attStats.map(r=>{
                  const diff=r.minutes-r.target
                  return (
                    <tr key={r.name}>
                      <td style={sa.td}>{r.name}</td>
                      <td style={sa.td}>{r.sessions}</td>
                      <td style={sa.td}>{formatHours(r.minutes)}</td>
                      <td style={sa.td}>{formatHours(r.target)}</td>
                      <td style={{...sa.td,color:diff>=0?'#34d399':'#f87171'}}>{diff>=0?'+':''}{formatHours(Math.abs(diff))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
