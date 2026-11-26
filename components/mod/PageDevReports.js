import { ReportModal } from './ReportModal'
import { ReportCard } from './ReportCard'
import { s } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function PageDevReports({ userId }) {
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('open')
  const [mods, setMods]         = useState({})
  const [selected, setSelected] = useState(null)
  const [search, setSearch]     = useState('')

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    const [{ data:r },{ data:p }] = await Promise.all([
      supabase.from('daily_reports').select('*').or('has_bug.eq.true,has_exploit.eq.true').order('created_at',{ascending:false}),
      supabase.from('profiles').select('id,name,avatar_url').eq('role','mod'),
    ])
    const map={}; (p||[]).forEach(x=>map[x.id]={name:x.name,avatar_url:x.avatar_url})
    setMods(map)
    const filtered = filter==='open'?(r||[]).filter(x=>!x.dev_resolved):filter==='resolved'?(r||[]).filter(x=>x.dev_resolved):(r||[])
    setReports(filtered)
    setLoading(false)
  }

  const filtered = search.trim()
    ? reports.filter(r => {
        const q = search.toLowerCase()
        return [r.dev_notes, r.notes, mods[r.user_id]?.name].some(f=>f&&f.toLowerCase().includes(q))
      })
    : reports

  return (
    <div style={s.content}>
      {selected && <ReportModal report={selected} modName={mods[selected.user_id]?.name} onClose={()=>setSelected(null)}/>}
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Dev Reports</h1>
        <div style={s.filterRow}>
          {['open','resolved','all'].map(f=>(
            <button key={f} style={{...s.filterBtn,...(filter===f?s.filterActive:{})}} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
          ))}
        </div>
      </div>
      <input style={{...s.input, width:'100%', marginBottom:16}} placeholder="Search by mod name, description…" value={search} onChange={e=>setSearch(e.target.value)}/>
      {loading?<div style={s.empty}>Loading…</div>:filtered.length===0?(
        <div style={s.card}><p style={s.empty}>No dev reports yet.</p></div>
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
