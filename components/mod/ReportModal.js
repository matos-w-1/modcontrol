import { fmtDate } from '../../lib/utils'

export function ReportModal({ report, modName, onClose }) {
  function IDList({ val }) {
    if (!val) return <span style={{color:'#4a5568'}}>—</span>
    const ids = val.split(/[\n,\s]+/).filter(Boolean)
    if (ids.length === 0) return <span style={{color:'#4a5568'}}>—</span>
    return <>{ids.map((id,i)=><div key={i} style={{fontSize:'0.82rem',padding:'2px 0'}}>{id}</div>)}</>
  }
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={onClose}>
      <div style={{background:'#141820',border:'1px solid #1e2433',borderRadius:16,width:'100%',maxWidth:680,maxHeight:'88vh',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:'18px 24px',borderBottom:'1px solid #1e2433',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:'0.95rem',fontWeight:700,color:'#f1f5f9'}}>{modName||'Report'} — {fmtDate(report.report_date)}</div>
            <div style={{fontSize:'0.75rem',color:'#64748b',marginTop:2}}>{report.shift}</div>
          </div>
          <span style={{color:'#4a5568',cursor:'pointer',fontSize:'1.2rem',padding:4}} onClick={onClose}>✕</span>
        </div>
        <div style={{padding:'20px 24px',overflowY:'auto',flex:1}}>
        
         {(report.pending_links||report.important_links)&&(
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
    {report.pending_links&&(()=>{
      try {
        const tickets = JSON.parse(report.pending_links)
        if (Array.isArray(tickets) && tickets.length>0) return (
          <div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}>
            <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:6}}>🔗 Pending</div>
            {tickets.map((t,i)=>(
              <a key={i} href={t.link} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:6,padding:'6px 8px',borderRadius:6,background:'#141820',border:'1px solid #1e2433',marginBottom:6,textDecoration:'none',cursor:'pointer'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#3b82f6'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='#1e2433'}>
                <span style={{fontSize:'0.78rem',color:'#60a5fa',flex:1}}>{t.description||t.link}</span>
                <svg width="10" height="10" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            ))}
          </div>
        )
      } catch(e) {}
      return null
    })()}
    {report.important_links&&(()=>{
      try {
        const tickets = JSON.parse(report.important_links)
        if (Array.isArray(tickets) && tickets.length>0) return (
          <div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}>
            <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:6}}>⭐ Important</div>
            {tickets.map((t,i)=>(
              <a key={i} href={t.link} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:6,padding:'6px 8px',borderRadius:6,background:'#141820',border:'1px solid #1e2433',marginBottom:6,textDecoration:'none',cursor:'pointer'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#f59e0b'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='#1e2433'}>
                <span style={{fontSize:'0.78rem',color:'#f59e0b',flex:1}}>{t.description||t.link}</span>
                <svg width="10" height="10" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            ))}
          </div>
        )
      } catch(e) {}
      return null
    })()}
  </div>
)}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            {[
              ['🔒 Blacktide — Rustyloot',report.locked_blacktide_rl],
              ['🔒 Blacktide — Hunt',report.locked_blacktide_hunt],
              ['🔒 Skin Manip. (RL)',report.skin_manipulation],
              ['⚠️ Free Coin (RL)',report.free_coin_abuser],
              ['⚠️ Phone (Hunt)',report.phone_abuser],
              ['⚠️ Referral (Hunt)',report.referral_abuser],
            ].map(([label,val])=>(
              <div key={label} style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}>
                <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:6}}>{label}</div>
                <IDList val={val}/>
              </div>
            ))}
          </div>
          {(report.has_bug||report.has_exploit)&&(
            <div style={{background:'#f8717108',border:'1px solid #f8717133',borderRadius:8,padding:'10px 14px',marginBottom:12}}>
              <div style={{fontSize:'0.72rem',color:'#f87171',marginBottom:6,fontWeight:600}}>
                {report.has_bug?'🐛 Bug reported':''}{report.has_bug&&report.has_exploit?' · ':''}{report.has_exploit?'⚠️ Exploit reported':''}
                {report.dev_resolved&&<span style={{marginLeft:8,color:'#34d399'}}>✓ Resolved</span>}
              </div>
              {report.dev_notes&&<div style={{fontSize:'0.83rem',color:'#94a3b8'}}>{report.dev_notes}</div>}
            </div>
          )}
          {report.notes&&<div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}>
            <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:4}}>📝 Notes</div>
            <div style={{fontSize:'0.83rem',color:'#94a3b8'}}>{report.notes}</div>
          </div>}
        </div>
      </div>
    </div>
  )
}
