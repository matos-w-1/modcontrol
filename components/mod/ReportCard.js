import { fmtDate } from '../../lib/utils'

export function ReportCard({ report, modName, avatarUrl, onClick }) {
  return (
    <div onClick={onClick} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:10,background:'#0f1117',border:'1px solid #1e2433',cursor:'pointer',marginBottom:8}}
      onMouseEnter={e=>e.currentTarget.style.borderColor='#334155'}
      onMouseLeave={e=>e.currentTarget.style.borderColor='#1e2433'}>
      {avatarUrl
        ? <img src={avatarUrl} alt="" style={{width:32,height:32,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>
        : <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',fontWeight:700,color:'#fff',flexShrink:0}}>{(modName||'?')[0].toUpperCase()}</div>
      }
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          {modName && <span style={{fontSize:'0.85rem',fontWeight:600,color:'#f1f5f9'}}>{modName}</span>}
          <span style={{fontSize:'0.72rem',color:'#64748b'}}>{report.shift}</span>
          <span style={{fontSize:'0.72rem',color:'#4a5568'}}>{fmtDate(report.report_date)}</span>
          {report.has_bug&&<span style={{fontSize:'0.63rem',fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#f8717122',color:'#f87171'}}>🐛 Bug</span>}
          {report.has_exploit&&<span style={{fontSize:'0.63rem',fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#f59e0b22',color:'#f59e0b'}}>⚠️ Exploit</span>}
        </div>
         <div style={{fontSize:'0.73rem',color:'#64748b',marginTop:2}}>
  {(()=>{
    let parts = []
    try { const p=JSON.parse(report.pending_links||'[]'); if(p.length>0) parts.push(`${p.length} pending`) } catch(e){}
    try { const i=JSON.parse(report.important_links||'[]'); if(i.length>0) parts.push(`${i.length} important`) } catch(e){}
    if(report.notes) parts.push('📝 notes')
    return parts.length>0 ? parts.join(' · ') : 'No highlights'
  })()}
</div>
      </div>
      <svg width="14" height="14" fill="none" stroke="#4a5568" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
    </div>
  )
}
