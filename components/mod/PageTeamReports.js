import { toLocalISO } from '../../lib/utils'
import { ReportModal } from './ReportModal'
import { ReportCard } from './ReportCard'
import { s } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function PageTeamReports() {
  const [reports, setReports]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('today')
  const [modFilter, setModFilter] = useState('')
  const [search, setSearch]       = useState('')
  const [mods, setMods]           = useState({})
  const [modsList, setModsList]   = useState([])
  const [selected, setSelected]   = useState(null)

  useEffect(() => { load() }, [filter, modFilter])

  async function load() {
    setLoading(true)
    const now = new Date(); let from
    if (filter==='today') { from=new Date(now); from.setHours(0,0,0,0) }
else if (filter==='week') { from=new Date(now); from.setDate(now.getDate()-7) }
else if (filter==='month') { from=new Date(now.getFullYear(),now.getMonth(),1) }
else { from=new Date(2024,0,1) }
    const [{ data:r },{ data:p }] = await Promise.all([
      supabase.from('daily_reports').select('*').gte('report_date', toLocalISO(from)).order('created_at',{ascending:false}),
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
        const fields = [
          r.locked_blacktide_rl, r.locked_blacktide_hunt, r.skin_manipulation,
          r.free_coin_abuser, r.phone_abuser, r.referral_abuser,
          r.pending_links, r.important_links, r.notes, r.dev_notes,
          mods[r.user_id]?.name
        ]
        return fields.some(f => f && f.toLowerCase().includes(q))
      })
    : reports

  return (
    <div style={s.content}>
      {selected && <ReportModal report={selected} modName={mods[selected.user_id]?.name} onClose={()=>setSelected(null)}/>}
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Team Reports</h1>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
          <select style={{...s.input,padding:'6px 10px',fontSize:'0.78rem',minWidth:140}} value={modFilter} onChange={e=>setModFilter(e.target.value)}>
            <option value="">All Moderators</option>
            {modsList.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <div style={s.filterRow}>
           {['today','week','month','all'].map(f=>(
  <button key={f} style={{...s.filterBtn,...(filter===f?s.filterActive:{})}} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
))}
          </div>
        </div>
      </div>
      <input style={{...s.input, width:'100%', marginBottom:16}} placeholder="Search by UID, mod name, notes…" value={search} onChange={e=>setSearch(e.target.value)}/>
      {loading?<div style={s.empty}>Loading…</div>:filtered.length===0?(
        <div style={s.card}><p style={s.empty}>No reports found.</p></div>
      ):(
        <div style={s.card}>
          {filtered.map(r=>(
            <ReportCard key={r.id} report={r} modName={mods[r.user_id]?.name} avatarUrl={mods[r.user_id]?.avatar_url} onClick={()=>setSelected(r)}/>
          ))}
        </div>
      )}
    </div>
  )
}
