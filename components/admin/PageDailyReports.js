import { toLocalISO } from '../../lib/utils'
import { AdminReportModal } from './AdminReportModal'
import { AdminReportCard } from './AdminReportCard'
import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function PageDailyReports() {
  const [reports, setReports]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('today')
  const [modFilter, setModFilter] = useState('')
  const [mods, setMods]           = useState({})
  const [modsList, setModsList]   = useState([])
  const [selected, setSelected]   = useState(null)
  const [search, setSearch]       = useState('')

  useEffect(() => { load() }, [filter, modFilter])

  async function load() {
    setLoading(true)
    const now = new Date(); let q
    if (filter==='all') {
      q = supabase.from('daily_reports').select('*').order('created_at',{ascending:false})
    } else {
      let from
      if (filter==='today') { from=new Date(now); from.setHours(0,0,0,0) }
      else if (filter==='week') { from=new Date(now); from.setDate(now.getDate()-7) }
      else { from=new Date(now.getFullYear(),now.getMonth(),1) }
      q = supabase.from('daily_reports').select('*').gte('report_date', toLocalISO(from)).order('created_at',{ascending:false})
    }
    const [{ data:r },{ data:p }] = await Promise.all([
      q,
      supabase.from('profiles').select('id,name,avatar_url').eq('role','mod'),
    ])
    const map={}; (p||[]).forEach(x=>map[x.id]={name:x.name,avatar_url:x.avatar_url})
    setMods(map); setModsList(p||[])
    setReports(modFilter?(r||[]).filter(x=>x.user_id===modFilter):(r||[]))
    setLoading(false)
  }

  const filtered = search.trim()
    ? reports.filter(r => {
        const q = search.toLowerCase()
        try { const p=JSON.parse(r.pending_links||'[]'); if(p.some(t=>t.description?.toLowerCase().includes(q)||t.link?.toLowerCase().includes(q))) return true } catch(e){}
        try { const i=JSON.parse(r.important_links||'[]'); if(i.some(t=>t.description?.toLowerCase().includes(q)||t.link?.toLowerCase().includes(q))) return true } catch(e){}
        return [r.locked_blacktide_rl,r.locked_blacktide_hunt,r.skin_manipulation,r.free_coin_abuser,r.phone_abuser,r.referral_abuser,r.notes,mods[r.user_id]?.name]
          .some(f=>f&&f.toLowerCase().includes(q))
      })
    : reports

  return (
    <div style={sa.content}>
      {selected && <AdminReportModal report={selected} modName={mods[selected.user_id]?.name} onClose={()=>setSelected(null)} hideDevInfo/>}
      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Daily Reports</h1>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
          <select style={{...sa.input,padding:'6px 10px',fontSize:'0.78rem',minWidth:140}} value={modFilter} onChange={e=>setModFilter(e.target.value)}>
            <option value="">All Moderators</option>
            {modsList.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <div style={sa.filterRow}>
            {['today','week','month','all'].map(f=>(
              <button key={f} style={{...sa.filterBtn,...(filter===f?sa.filterActive:{})}} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
            ))}
          </div>
        </div>
      </div>
      <input style={{...sa.input, width:'100%', marginBottom:16}} placeholder="Search by mod name, UID, notes…" value={search} onChange={e=>setSearch(e.target.value)}/>
      {loading?<div style={sa.empty}>Loading…</div>:filtered.length===0?(
        <div style={sa.card}><p style={sa.empty}>No reports yet.</p></div>
      ):(
        <div style={sa.card}>
          {filtered.map(r=>(
            <AdminReportCard key={r.id} report={r} modName={mods[r.user_id]?.name} avatarUrl={mods[r.user_id]?.avatar_url} hideDevInfo onClick={()=>setSelected(r)}/>
          ))}
        </div>
      )}
    </div>
  )
}
