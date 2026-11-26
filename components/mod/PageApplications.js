import { fmtDate } from '../../lib/utils'
import { s } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function PageApplications({ userId }) {
  const [apps, setApps]       = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')
  const [search, setSearch]   = useState('')

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('applications').select('*').eq('submitted_by', userId).order('created_at',{ascending:false})
    const filtered = filter==='all' ? data : (data||[]).filter(a=>a.status===filter)
    setApps(filtered||[])
    setLoading(false)
  }

  const filtered = search.trim()
    ? apps.filter(a => {
        const q = search.toLowerCase()
        return [a.applicant_name, a.applicant_discord, a.applicant_telegram, a.message].some(f=>f&&f.toLowerCase().includes(q))
      })
    : apps

  const typeColor   = { staff:'#3b82f6', dev:'#8b5cf6' }
  const statusColor = { pending:'#f59e0b', accepted:'#34d399', declined:'#f87171' }

  return (
    <div style={s.content}>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Applications</h1>
        <div style={s.filterRow}>
          {['all','pending','accepted','declined'].map(f=>(
            <button key={f} style={{...s.filterBtn,...(filter===f?s.filterActive:{})}} onClick={()=>setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <input style={{...s.input, width:'100%', marginBottom:16}} placeholder="Search by name, discord, telegram…" value={search} onChange={e=>setSearch(e.target.value)}/>
      {loading?<div style={s.empty}>Loading…</div>:filtered.length===0?(
        <div style={s.card}><p style={s.empty}>No applications yet.</p></div>
      ):(
        <div style={s.card}>
          {filtered.map(a=>(
            <div key={a.id} style={{padding:'12px 0', borderBottom:'1px solid #1e2433'}}>
              <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                    <span style={{fontSize:'0.87rem', fontWeight:600, color:'#f1f5f9'}}>{a.applicant_name}</span>
                    <span style={{fontSize:'0.68rem', fontWeight:700, padding:'2px 8px', borderRadius:20, background:(typeColor[a.type]||'#94a3b8')+'22', color:typeColor[a.type]||'#94a3b8'}}>{a.type?.toUpperCase()}</span>
                    <span style={{fontSize:'0.68rem', fontWeight:700, padding:'2px 8px', borderRadius:20, background:(statusColor[a.status]||'#94a3b8')+'22', color:statusColor[a.status]||'#94a3b8'}}>{a.status}</span>
                  </div>
                  <div style={{fontSize:'0.75rem', color:'#64748b'}}>
                    {a.applicant_discord&&<span style={{marginRight:12}}>💬 {a.applicant_discord}</span>}
                    {a.applicant_telegram&&<span style={{marginRight:12}}>✈️ {a.applicant_telegram}</span>}
                    {fmtDate(a.created_at)}
                  </div>
                  {a.message&&<div style={{fontSize:'0.78rem', color:'#94a3b8', marginTop:4}}>{a.message}</div>}
                  {a.admin_notes&&<div style={{fontSize:'0.75rem', color:'#60a5fa', marginTop:4}}>Admin: {a.admin_notes}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
