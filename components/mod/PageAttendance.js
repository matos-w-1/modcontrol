import { fmtDate, fmtTime } from '../../lib/utils'
import { s } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function PageAttendance({ userId }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('week')

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    const now = new Date(); let from
    if (filter==='today') { from=new Date(now); from.setHours(0,0,0,0) }
    else if (filter==='week') { from=new Date(now); from.setDate(now.getDate()-7) }
    else { from=new Date(now.getFullYear(),now.getMonth(),1) }
    const {data} = await supabase.from('attendance').select('*').eq('user_id',userId).gte('clock_in',from.toISOString()).order('clock_in',{ascending:false})
    setRecords(data||[]); setLoading(false)
  }

  function duration(ci,co) {
    if (!co) return <span style={{color:'#34d399'}}>Active</span>
    const mins=Math.round((new Date(co)-new Date(ci))/60000), h=Math.floor(mins/60), m=mins%60
    return `${h}h ${m}m`
  }

  return (
    <div style={s.content}>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>My Attendance</h1>
        <div style={s.filterRow}>
          {['today','week','month'].map(f=>(
            <button key={f} style={{...s.filterBtn,...(filter===f?s.filterActive:{})}} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
          ))}
        </div>
      </div>
      <div style={s.card}>
        {loading?<div style={s.empty}>Loading…</div>:records.length===0?<div style={s.empty}>No records.</div>:(
          <div style={{overflowX:'auto'}}>
            <table style={s.table}>
              <thead><tr>{['Date','Clock In','Lunch Start','Lunch End','Clock Out','Duration','Status'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {records.map(r=>(
                  <tr key={r.id}>
                    <td style={s.td}>{fmtDate(r.clock_in)}</td>
                    <td style={s.td}>{fmtTime(r.clock_in)}</td>
                    <td style={s.td}>{fmtTime(r.lunch_start)}</td>
                    <td style={s.td}>{fmtTime(r.lunch_end)}</td>
                    <td style={s.td}>{fmtTime(r.clock_out)}</td>
                    <td style={s.td}>{duration(r.clock_in,r.clock_out)}</td>
                    <td style={s.td}><span style={{fontSize:'0.72rem',fontWeight:600,padding:'3px 10px',borderRadius:20,background:r.status==='working'?'#34d39922':r.status==='lunch'?'#f59e0b22':'#94a3b822',color:r.status==='working'?'#34d399':r.status==='lunch'?'#f59e0b':'#94a3b8'}}>{r.status||'done'}</span></td>
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
