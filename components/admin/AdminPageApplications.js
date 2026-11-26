import { fmtDate } from '../../lib/utils'
import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function AdminPageApplications({ adminId }) {
  const [apps, setApps]       = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('pending')
  const [selected, setSelected] = useState(null)
  const [adminNote, setAdminNote] = useState('')
  const [mods, setMods]       = useState({})

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    const [{ data:a }, { data:p }] = await Promise.all([
      supabase.from('applications').select('*').order('created_at', {ascending:false}),
      supabase.from('profiles').select('id,name').eq('role','mod'),
    ])
    const map={}; (p||[]).forEach(x=>map[x.id]=x.name)
    setMods(map)
    const filtered = filter==='all' ? a : (a||[]).filter(x=>x.status===filter)
    setApps(filtered||[])
    setLoading(false)
  }

  async function decide(id, status) {
    await supabase.from('applications').update({
      status, admin_notes: adminNote, reviewed_at: new Date().toISOString(), reviewed_by: adminId
    }).eq('id', id)
    setSelected(null); setAdminNote(''); load()
  }

  const typeColor = { staff:'#3b82f6', dev:'#8b5cf6' }
  const statusColor = { pending:'#f59e0b', accepted:'#34d399', declined:'#f87171' }

  return (
    <div style={sa.content}>
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setSelected(null)}>
          <div style={{background:'#141820',border:'1px solid #1e2433',borderRadius:16,width:'100%',maxWidth:560,maxHeight:'88vh',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'18px 24px',borderBottom:'1px solid #1e2433',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:'0.95rem',fontWeight:700,color:'#f1f5f9'}}>{selected.applicant_name}</div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4}}>
                  <span style={{fontSize:'0.68rem',fontWeight:700,padding:'2px 8px',borderRadius:20,background:(typeColor[selected.type]||'#94a3b8')+'22',color:typeColor[selected.type]||'#94a3b8'}}>{selected.type.toUpperCase()}</span>
                  <span style={{fontSize:'0.68rem',fontWeight:700,padding:'2px 8px',borderRadius:20,background:(statusColor[selected.status]||'#94a3b8')+'22',color:statusColor[selected.status]||'#94a3b8'}}>{selected.status}</span>
                </div>
              </div>
              <span style={{color:'#4a5568',cursor:'pointer',fontSize:'1.2rem'}} onClick={()=>setSelected(null)}>✕</span>
            </div>
            <div style={{padding:'20px 24px',overflowY:'auto',flex:1}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                {selected.applicant_discord&&<div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}><div style={{fontSize:'0.68rem',color:'#4a5568',marginBottom:4}}>Discord</div><div style={{fontSize:'0.85rem',color:'#f1f5f9'}}>{selected.applicant_discord}</div></div>}
                {selected.applicant_telegram&&<div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}><div style={{fontSize:'0.68rem',color:'#4a5568',marginBottom:4}}>Telegram</div><div style={{fontSize:'0.85rem',color:'#f1f5f9'}}>{selected.applicant_telegram}</div></div>}
              </div>
              {selected.message&&<div style={{background:'#0f1117',borderRadius:8,padding:'12px 14px',marginBottom:16}}>
                <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:6}}>Message</div>
                <div style={{fontSize:'0.85rem',color:'#e2e8f0',lineHeight:1.6}}>{selected.message}</div>
              </div>}
              <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:16}}>Submitted by <strong style={{color:'#94a3b8'}}>{mods[selected.submitted_by]||'Unknown'}</strong> · {fmtDate(selected.created_at)}</div>
              {selected.admin_notes&&<div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px',marginBottom:16}}>
                <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:4}}>Admin Notes</div>
                <div style={{fontSize:'0.83rem',color:'#94a3b8'}}>{selected.admin_notes}</div>
              </div>}
              {selected.status==='pending' && (
                <div>
                  <label style={sa.label}>Admin Notes (optional)</label>
                  <textarea style={{...sa.input, width:'100%', minHeight:70, resize:'vertical', marginTop:6, marginBottom:12}} value={adminNote} onChange={e=>setAdminNote(e.target.value)} placeholder="Add notes…"/>
                  <div style={{display:'flex', gap:8}}>
                    <button style={{...sa.btnApprove, flex:1}} onClick={()=>decide(selected.id,'accepted')}>✓ Accept</button>
                    <button style={{...sa.btnReject, flex:1}} onClick={()=>decide(selected.id,'declined')}>✕ Decline</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Applications</h1>
        <div style={sa.filterRow}>
          {['pending','accepted','declined','all'].map(f=>(
            <button key={f} style={{...sa.filterBtn,...(filter===f?sa.filterActive:{})}} onClick={()=>setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading?<div style={sa.empty}>Loading…</div>:apps.length===0?(
        <div style={sa.card}><p style={sa.empty}>No applications.</p></div>
      ):apps.map(a=>(
        <div key={a.id} onClick={()=>{setSelected(a);setAdminNote(a.admin_notes||'')}} style={{...sa.card, cursor:'pointer', padding:'14px 18px'}}
          onMouseEnter={e=>e.currentTarget.style.borderColor='#334155'}
          onMouseLeave={e=>e.currentTarget.style.borderColor='#1e2433'}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{flex:1}}>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                <span style={{fontSize:'0.87rem', fontWeight:600, color:'#f1f5f9'}}>{a.applicant_name}</span>
                <span style={{fontSize:'0.68rem', fontWeight:700, padding:'2px 8px', borderRadius:20, background:(typeColor[a.type]||'#94a3b8')+'22', color:typeColor[a.type]||'#94a3b8'}}>{a.type.toUpperCase()}</span>
                <span style={{fontSize:'0.68rem', fontWeight:700, padding:'2px 8px', borderRadius:20, background:(statusColor[a.status]||'#94a3b8')+'22', color:statusColor[a.status]||'#94a3b8'}}>{a.status}</span>
              </div>
              <div style={{fontSize:'0.75rem', color:'#64748b'}}>
                {a.applicant_discord&&<span style={{marginRight:12}}>💬 {a.applicant_discord}</span>}
                Submitted by {mods[a.submitted_by]||'Unknown'} · {fmtDate(a.created_at)}
              </div>
            </div>
            <svg width="14" height="14" fill="none" stroke="#4a5568" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      ))}
    </div>
  )
}
