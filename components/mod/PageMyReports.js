import { ReportModal } from './ReportModal'
import { ReportCard } from './ReportCard'
import { s } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function PageMyReports({ userId, profile }) {
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    supabase.from('daily_reports').select('*').eq('user_id',userId).order('created_at',{ascending:false})
      .then(({data})=>{setReports(data||[]);setLoading(false)})
  },[])

  const filtered = search.trim()
    ? reports.filter(r => {
        const q = search.toLowerCase()
        try { const p=JSON.parse(r.pending_links||'[]'); if(p.some(t=>t.description?.toLowerCase().includes(q)||t.link?.toLowerCase().includes(q))) return true } catch(e){}
        try { const i=JSON.parse(r.important_links||'[]'); if(i.some(t=>t.description?.toLowerCase().includes(q)||t.link?.toLowerCase().includes(q))) return true } catch(e){}
        return [r.locked_blacktide_rl,r.locked_blacktide_hunt,r.skin_manipulation,r.free_coin_abuser,r.phone_abuser,r.referral_abuser,r.notes,r.dev_notes]
          .some(f=>f&&f.toLowerCase().includes(q))
      })
    : reports

  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>My Reports</h1>
      {selected && <ReportModal report={selected} modName="Me" onClose={()=>setSelected(null)}/>}
      <input style={{...s.input, width:'100%', marginBottom:16}} placeholder="Search by UID, description, notes…" value={search} onChange={e=>setSearch(e.target.value)}/>
      {loading?<div style={s.empty}>Loading…</div>:filtered.length===0?(
        <div style={s.card}><p style={s.empty}>No reports found.</p></div>
      ):(
        <div style={s.card}>
          {filtered.map(r=>(
            <ReportCard key={r.id} report={r} modName="Me" avatarUrl={profile?.avatar_url} hideDevInfo onClick={()=>setSelected(r)}/>
          ))}
        </div>
      )}
    </div>
  )
}
