// One admin menu entry with its pages as tabs. Only tabs the admin may see are passed in.
export function AdminHub({ tabs, tab, setTab, render }) {
  const active = tabs.some(t => t.id === tab) ? tab : tabs[0]?.id
  return (
    <div>
      {tabs.length > 1 && (
        <div style={{maxWidth:1100, margin:'0 auto', padding:'22px 36px 0'}}>
          <div style={{display:'flex', gap:4, borderBottom:'1px solid #1e2433', flexWrap:'wrap'}}>
            {tabs.map(t => (
              <button key={t.id} onClick={()=>setTab(t.id)}
                style={{background:'none', border:'none', borderBottom:`2px solid ${t.id===active?'#3b82f6':'transparent'}`, marginBottom:-1, padding:'10px 16px', cursor:'pointer', fontSize:'0.85rem', fontWeight:t.id===active?700:500, color:t.id===active?'#f1f5f9':'#64748b', fontFamily:'inherit'}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {render(active)}
    </div>
  )
}
