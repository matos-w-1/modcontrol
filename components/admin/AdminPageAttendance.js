import { fmtDate, fmtTime, formatHours, getWeekRange, pillColor } from '../../lib/utils'
import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function AdminPageAttendance() {
  const [records, setRecords]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('today')
  const [modFilter, setModFilter] = useState('')
  const [mods, setMods]           = useState([])

  useEffect(() => { supabase.from('profiles').select('id,name').eq('role','mod').then(({data})=>setMods(data||[])) }, [])
  useEffect(() => { load() }, [filter, modFilter])

  async function load() {
    setLoading(true)
    const now = new Date(); let from
    if (filter==='today') { from=new Date(now); from.setHours(0,0,0,0) }
    else if (filter==='week') { const {monday}=getWeekRange(); from=monday }
    else { from=new Date(now.getFullYear(),now.getMonth(),1) }
    let q = supabase.from('attendance').select('*, profiles(name,role)').gte('clock_in',from.toISOString()).order('clock_in',{ascending:false})
    if (modFilter) q = q.eq('user_id', modFilter)
    const { data } = await q
    setRecords((data||[]).filter(r=>r.profiles?.role!=='admin'))
    setLoading(false)
  }

  function duration(ci,co) {
    if (!co) return <span style={{color:'#34d399'}}>Active</span>
    return formatHours(Math.round((new Date(co)-new Date(ci))/60000))
  }

  return (
    <div style={sa.content}>
      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Attendance Logs</h1>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <select style={{...sa.input, padding:'6px 10px', fontSize:'0.78rem'}} value={modFilter} onChange={e=>setModFilter(e.target.value)}>
            <option value="">All Moderators</option>
            {mods.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <div style={sa.filterRow}>
            {['today','week','month'].map(f=>(
              <button key={f} style={{...sa.filterBtn,...(filter===f?sa.filterActive:{})}} onClick={()=>setFilter(f)}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={sa.card}>
        {loading ? <div style={sa.empty}>Loading…</div> : records.length===0 ? <p style={sa.empty}>No records.</p> : (
          <div style={{overflowX:'auto'}}>
            <table style={sa.table}>
              <thead><tr>{['Moderator','Date','Clock In','Lunch Start','Lunch End','Clock Out','Duration','Status'].map(h=><th key={h} style={sa.th}>{h}</th>)}</tr></thead>
              <tbody>
                {records.map(r=>(
                  <tr key={r.id}>
                    <td style={sa.td}>{r.profiles?.name}</td>
                    <td style={sa.td}>{fmtDate(r.clock_in)}</td>
                    <td style={sa.td}>{fmtTime(r.clock_in)}</td>
                    <td style={sa.td}>{fmtTime(r.lunch_start)}</td>
                    <td style={sa.td}>{fmtTime(r.lunch_end)}</td>
                    <td style={sa.td}>{fmtTime(r.clock_out)}</td>
                    <td style={sa.td}>{duration(r.clock_in,r.clock_out)}</td>
                    <td style={sa.td}><span style={{...sa.pill, background:pillColor(r.status).bg, color:pillColor(r.status).col}}>{r.status||'done'}</span></td>
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
