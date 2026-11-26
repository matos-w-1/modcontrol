import { fmtDate } from '../../lib/utils'
import { AdminDevNotes } from './AdminDevNotes'
import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function AdminPageDevReports() {
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('open')
  const [mods, setMods]         = useState({})
  const [selected, setSelected] = useState(null)

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

  async function resolve(id) {
    await supabase.from('daily_reports').update({ dev_resolved:true }).eq('id',id)
    setSelected(null); load()
  }

  return (
    <div style={sa.content}>
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>{setSelected(null);load()}}>
          <div style={{background:'#141820',border:'1px solid #1e2433',borderRadius:16,width:'100%',maxWidth:560,display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'18px 24px',borderBottom:'1px solid #1e2433',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:'0.95rem',fontWeight:700,color:'#f1f5f9'}}>{mods[selected.user_id]?.name} — {fmtDate(selected.report_date)}</div>
                <div style={{display:'flex',gap:8,marginTop:4}}>
                  {selected.has_bug&&<span style={{fontSize:'0.68rem',fontWeight:700,padding:'2px 8px',borderRadius:20,background:'#f8717122',color:'#f87171'}}>🐛 Bug</span>}
                  {selected.has_exploit&&<span style={{fontSize:'0.68rem',fontWeight:700,padding:'2px 8px',borderRadius:20,background:'#f59e0b22',color:'#f59e0b'}}>⚠️ Exploit</span>}
                  {selected.dev_resolved&&<span style={{fontSize:'0.68rem',fontWeight:700,padding:'2px 8px',borderRadius:20,background:'#34d39922',color:'#34d399'}}>✓ Resolved</span>}
                </div>
              </div>
              <span style={{color:'#4a5568',cursor:'pointer',fontSize:'1.2rem'}} onClick={()=>{setSelected(null);load()}}>✕</span>
            </div>
            <div style={{padding:'20px 24px'}}>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:6}}>Mod Description</div>
                <div style={{background:'#0f1117',borderRadius:8,padding:'10px 14px',fontSize:'0.85rem',color:'#94a3b8',lineHeight:1.6,minHeight:60}}>
                  {selected.dev_notes||<span style={{color:'#4a5568'}}>No description provided.</span>}
                </div>
              </div>
              <AdminDevNotes reportId={selected.id} initialNotes={selected.admin_dev_notes}/>
              {!selected.dev_resolved && (
                <button style={{...sa.btnApprove, width:'100%', marginTop:12, display:'flex', justifyContent:'center'}} onClick={()=>resolve(selected.id)}>
                  ✓ Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Dev Reports</h1>
        <div style={sa.filterRow}>
          {['open','resolved','all'].map(f=>(
            <button key={f} style={{...sa.filterBtn,...(filter===f?sa.filterActive:{})}} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
          ))}
        </div>
      </div>
      {loading?<div style={sa.empty}>Loading…</div>:reports.length===0?(
        <div style={sa.card}><p style={sa.empty}>No dev reports yet.</p></div>
      ):(
        <div style={sa.card}>
          {reports.map(r=>(
            <div key={r.id} onClick={()=>setSelected(r)} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:10,background:'#0f1117',border:'1px solid #1e2433',cursor:'pointer',marginBottom:8}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#334155'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#1e2433'}>
              {mods[r.user_id]?.avatar_url
                ? <img src={mods[r.user_id].avatar_url} alt="" style={{width:32,height:32,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>
                : <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',fontWeight:700,color:'#fff',flexShrink:0}}>{(mods[r.user_id]?.name||'?')[0].toUpperCase()}</div>
              }
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                  <span style={{fontSize:'0.85rem',fontWeight:600,color:'#f1f5f9'}}>{mods[r.user_id]?.name||'Unknown'}</span>
                  <span style={{fontSize:'0.72rem',color:'#64748b'}}>{fmtDate(r.report_date)} · {r.shift}</span>
                  {r.has_bug&&<span style={{fontSize:'0.63rem',fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#f8717122',color:'#f87171'}}>🐛 Bug</span>}
                  {r.has_exploit&&<span style={{fontSize:'0.63rem',fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#f59e0b22',color:'#f59e0b'}}>⚠️ Exploit</span>}
                  {r.dev_resolved&&<span style={{fontSize:'0.63rem',fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#34d39922',color:'#34d399'}}>✓ Resolved</span>}
                </div>
                {r.dev_notes&&<div style={{fontSize:'0.73rem',color:'#64748b',marginTop:2}}>{r.dev_notes.slice(0,80)}{r.dev_notes.length>80?'…':''}</div>}
              </div>
              <svg width="14" height="14" fill="none" stroke="#4a5568" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
