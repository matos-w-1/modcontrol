import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://vqoxhaggxgwfktuvtoyw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxb3hoYWdneGd3Zmt0dXZ0b3l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTI5ODExNCwiZXhwIjoyMDk2ODc0MTE0fQ.hq0gA0e7LeqdOUpoycN5865vs0xX3fhlG5HEvs3WDnA'
)

const Icon = {
  dash:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  check:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  mods:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  clock:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  report: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  logout: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  shifts: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  cal:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  bell:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  swap:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  log:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>,
}

async function logAction(adminId, action, targetId, targetName, details) {
  await supabase.from('admin_log').insert({ admin_id:adminId, action, target_id:targetId||null, target_name:targetName||null, details:details||null })
}

function fmtDate(d)   { if (!d) return '—'; return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) }
function fmtTime(iso) { if (!iso) return '—'; return new Date(iso).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }) }
function formatHours(minutes) { const h=Math.floor(minutes/60), m=minutes%60; return m>0?`${h}h ${m}m`:`${h}h` }
function getWeekRange() {
  const now=new Date(), monday=new Date(now)
  monday.setDate(now.getDate()-((now.getDay()+6)%7)); monday.setHours(0,0,0,0)
  const sunday=new Date(monday); sunday.setDate(monday.getDate()+6); sunday.setHours(23,59,59,999)
  return { monday, sunday }
}
function pillColor(status) {
  const map = { pending:{bg:'#f59e0b22',col:'#f59e0b'}, approved:{bg:'#34d39922',col:'#34d399'}, declined:{bg:'#f8717122',col:'#f87171'}, working:{bg:'#34d39922',col:'#34d399'}, lunch:{bg:'#f59e0b22',col:'#f59e0b'}, done:{bg:'#94a3b822',col:'#94a3b8'}, active:{bg:'#34d39922',col:'#34d399'}, inactive:{bg:'#f8717122',col:'#f87171'}, left:{bg:'#f8717122',col:'#f87171'} }
  return map[status] || {bg:'#94a3b822',col:'#94a3b8'}
}

const DiscordIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
const TelegramIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="#26A5E4"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>

function ReportModal({ report, modName, onClose, onResolve, isAdmin, hideDevInfo }) {
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
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
            {[['Total',report.total_tickets],['Replies',report.mod_tickets],['Pending',report.pending_tickets],['Important',report.important_tickets]].map(([label,val])=>(
              <div key={label} style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}>
                <div style={{fontSize:'0.68rem',color:'#4a5568',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>{label}</div>
                <div style={{fontSize:'1.3rem',fontWeight:700,color:'#f1f5f9'}}>{val||0}</div>
              </div>
            ))}
          </div>
          {(report.pending_links||report.important_links)&&(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              {report.pending_links&&<div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}>
                <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:6}}>🔗 Pending Links</div>
                {report.pending_links.split(/\n/).filter(Boolean).map((link,i)=>(
                  <a key={i} href={link} target="_blank" rel="noreferrer" style={{display:'block',fontSize:'0.78rem',color:'#60a5fa',marginBottom:4,wordBreak:'break-all'}}>{link}</a>
                ))}
              </div>}
              {report.important_links&&<div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}>
                <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:6}}>🔗 Important Links</div>
                {report.important_links.split(/\n/).filter(Boolean).map((link,i)=>(
                  <a key={i} href={link} target="_blank" rel="noreferrer" style={{display:'block',fontSize:'0.78rem',color:'#f59e0b',marginBottom:4,wordBreak:'break-all'}}>{link}</a>
                ))}
              </div>}
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
          {!hideDevInfo && (report.has_bug||report.has_exploit)&&(
  <div style={{background:'#f8717108',border:'1px solid #f8717133',borderRadius:8,padding:'10px 14px',marginBottom:12}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
      <div style={{fontSize:'0.72rem',color:'#f87171',fontWeight:600}}>
        {report.has_bug?'🐛 Bug reported':''}{report.has_bug&&report.has_exploit?' · ':''}{report.has_exploit?'⚠️ Exploit reported':''}
        {report.dev_resolved&&<span style={{marginLeft:8,color:'#34d399'}}>✓ Resolved</span>}
      </div>
      {!report.dev_resolved && onResolve && <button style={s.btnApprove} onClick={()=>onResolve(report.id)}>Mark Resolved</button>}
    </div>
    {isAdmin
      ? <AdminDevNotes reportId={report.id} initialNotes={report.dev_notes}/>
      : report.dev_notes&&<div style={{fontSize:'0.83rem',color:'#94a3b8'}}>{report.dev_notes}</div>
    }
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

function ReportCard({ report, modName, avatarUrl, onClick, hideDevInfo }) {
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
          {report.dev_resolved&&<span style={{fontSize:'0.63rem',fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#34d39922',color:'#34d399'}}>✓ Resolved</span>}
        </div>
        <div style={{fontSize:'0.73rem',color:'#64748b',marginTop:2}}>
          {report.total_tickets} tickets · {report.mod_tickets} replies · {report.pending_tickets} pending · {report.important_tickets} important
        </div>
      </div>
      <svg width="14" height="14" fill="none" stroke="#4a5568" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
    </div>
  )
}

function Layout({ profile, page, setPage, onLogout, children }) {
  const [showUserMenu, setShowUserMenu] = useState(false)

const NAV_GROUPS = [
  { label:'Overview',      items:[{ id:'dashboard',       label:'Dashboard',          icon:Icon.dash }] },
  { label:'Management',    items:[{ id:'approvals',       label:'Approvals',          icon:Icon.check },{ id:'moderators',     label:'Moderators',         icon:Icon.mods },{ id:'applications',   label:'Applications',       icon:Icon.check }] },
  { label:'Team',          items:[{ id:'hours',           label:'Hours & Attendance', icon:Icon.clock },{ id:'attendancereport',label:'Attendance Report',  icon:Icon.report },{ id:'rotating',       label:'Rotating Days Off',  icon:Icon.shifts },{ id:'modnotes',       label:'Mod Notes',          icon:Icon.report }] },
  { label:'Scheduling',    items:[{ id:'attendance',      label:'Attendance Logs',    icon:Icon.clock },{ id:'shifts',         label:'Shift Schedule',     icon:Icon.shifts },{ id:'calendar',       label:'Calendar',           icon:Icon.cal },{ id:'vacationcal',    label:'Vacation Calendar',  icon:Icon.cal },{ id:'swapmanager',    label:'Swap Manager',       icon:Icon.swap }] },
  { label:'Communication', items:[{ id:'announcements',   label:'Announcements',      icon:Icon.bell },{ id:'alertsend',      label:'Send Alert',         icon:Icon.bell }] },
  { label:'Reports',       items:[{ id:'reports',         label:'Reports',            icon:Icon.report },{ id:'dailyreports',   label:'Daily Reports',      icon:Icon.report },{ id:'devreports',     label:'Dev Reports',        icon:Icon.report }] },
  { label:'Audit',         items:[{ id:'adminlog',        label:'Activity Log',       icon:Icon.log }] },
]

  return (
    <div style={s.root}>
      <aside style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div>
              <span style={{fontSize:'1.1rem', fontWeight:800, color:'#f8fafc', letterSpacing:'-0.02em'}}>ROLLTWO</span>
              <div style={{fontSize:'0.68rem', color:'#4a5568', marginTop:1, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:600}}>Admin Panel</div>
            </div>
          </div>
        </div>
        <nav style={s.nav}>
          {NAV_GROUPS.map(group => (
            <div key={group.label} style={{marginBottom:8}}>
              <div style={{fontSize:'0.62rem', fontWeight:700, color:'#2d3748', textTransform:'uppercase', letterSpacing:'0.1em', padding:'8px 12px 4px'}}>{group.label}</div>
              {group.items.map(item => (
                <div key={item.id} style={{...s.navItem,...(page===item.id?s.navActive:{})}} onClick={() => setPage(item.id)}>
                  {item.icon}<span style={{flex:1}}>{item.label}</span>
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div style={{padding:'8px', borderTop:'1px solid #1e2433', position:'relative'}}>
          {showUserMenu && (
            <div style={{position:'absolute', bottom:'100%', left:8, right:8, background:'#1a1f2e', border:'1px solid #2d3748', borderRadius:10, padding:6, marginBottom:4, zIndex:100}}>
              <div style={{padding:'6px 10px 8px', borderBottom:'1px solid #1e2433', marginBottom:4}}>
                <div style={{fontSize:'0.82rem', fontWeight:600, color:'#f1f5f9'}}>{profile?.name}</div>
                <div style={{fontSize:'0.7rem', color:'#4a5568', marginTop:1}}>Administrator</div>
              </div>
              <div onClick={onLogout} style={{display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:6, cursor:'pointer', fontSize:'0.82rem', color:'#f87171'}}
                onMouseEnter={e=>e.currentTarget.style.background='#0f1117'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <span>🚪</span> Sign Out
              </div>
            </div>
          )}
          <div style={{display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, cursor:'pointer', background:showUserMenu?'#1e2433':'transparent'}}
            onClick={()=>setShowUserMenu(m=>!m)}
            onMouseEnter={e=>{ if(!showUserMenu) e.currentTarget.style.background='#1a1f2e' }}
            onMouseLeave={e=>{ if(!showUserMenu) e.currentTarget.style.background='transparent' }}>
            <div style={{width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#f59e0b,#ef4444)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:700, color:'#fff', flexShrink:0}}>
              {(profile?.name||'A')[0].toUpperCase()}
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:'0.8rem', fontWeight:600, color:'#f1f5f9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{profile?.name}</div>
              <div style={{fontSize:'0.68rem', color:'#4a5568'}}>Administrator</div>
            </div>
            <span style={{fontSize:'0.6rem', color:'#4a5568'}}>{showUserMenu?'▲':'▼'}</span>
          </div>
        </div>
      </aside>
      <main style={s.main}>{children}</main>
    </div>
  )
}

function AdminBirthdayList() {
  const [people, setPeople] = useState([])
  useEffect(() => {
    supabase.from('profiles').select('id,name,birthday,avatar_url').eq('role','mod').not('birthday','is',null)
      .then(({data}) => {
        const today = new Date(); today.setHours(0,0,0,0)
        const enriched = (data||[]).map(p => {
          const bday = new Date(p.birthday)
          const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
          if (next < today) next.setFullYear(today.getFullYear()+1)
          return { ...p, daysUntil: Math.ceil((next-today)/86400000), nextBirthday: next }
        }).sort((a,b) => a.daysUntil - b.daysUntil).slice(0,8)
        setPeople(enriched)
      })
  }, [])
  return people.length === 0 ? <p style={s.empty}>No birthdays coming up.</p> : (
    <>
      {people.map(p => (
        <div key={p.id} style={{display:'flex', alignItems:'center', gap:12, padding:'8px 0', borderBottom:'1px solid #1e2433'}}>
          <div style={{width:32,height:32,borderRadius:'50%',flexShrink:0,overflow:'hidden'}}>
            {p.avatar_url
              ? <img src={p.avatar_url} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',fontWeight:700,color:'#fff'}}>{p.name[0].toUpperCase()}</div>
            }
          </div>
          <span style={{flex:1, fontSize:'0.85rem', fontWeight:500}}>{p.name}</span>
          <span style={{fontSize:'0.75rem', color:'#64748b'}}>{p.nextBirthday.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>
          <span style={{fontSize:'0.72rem', fontWeight:600, padding:'3px 10px', borderRadius:20, background: p.daysUntil===0?'#f59e0b22':'#3b82f622', color: p.daysUntil===0?'#f59e0b':'#60a5fa'}}>
            {p.daysUntil===0 ? '🎉 Today!' : p.daysUntil===1 ? 'Tomorrow' : `In ${p.daysUntil} days`}
          </span>
        </div>
      ))}
    </>
  )
}

function PageDashboard({ onDuty, weeklyHours, upcomingLeave, pendingCount }) {
  const online  = onDuty.filter(r => r.status !== 'lunch')
  const onLunch = onDuty.filter(r => r.status === 'lunch')
  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>Dashboard</h1>
      <div style={s.statRow}>
        {[
          { num:online.length,   label:'Online',            col:'#34d399' },
          { num:onLunch.length,  label:'On Lunch',          col:'#f59e0b' },
          { num:onDuty.length,   label:'Total On Duty',     col:'#60a5fa' },
          { num:pendingCount,    label:'Pending Approvals', col:'#f87171' },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <span style={{...s.statNum, color:st.col}}>{st.num}</span>
            <span style={s.statLabel}>{st.label}</span>
          </div>
        ))}
      </div>
      <div style={s.twoCol}>
        <div style={s.card}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>Who's On Duty</span>
            <span style={s.liveChip}><span style={s.liveDot}/>LIVE</span>
          </div>
          {onDuty.length === 0 ? <p style={s.empty}>No moderators on duty.</p> : onDuty.map(r => {
  const lastSeen = r.profiles?.last_seen ? new Date(r.profiles.last_seen) : null
  const minsAgo = lastSeen ? Math.floor((new Date()-lastSeen)/60000) : null
  const isActive = minsAgo !== null && minsAgo < 5
  return (
    <div key={r.id} style={s.dutyRow}>
      <span style={{...s.dot, background: r.status==='lunch'?'#f59e0b':'#34d399'}}/>
      <span style={{flex:1, fontSize:'0.85rem'}}>{r.profiles?.name}</span>
      <span style={{fontSize:'0.72rem', color:'#64748b'}}>{r.status==='lunch'?'Lunch':'Working'} · since {fmtTime(r.clock_in)}</span>
      {lastSeen && (
        <span style={{fontSize:'0.68rem', fontWeight:600, padding:'2px 8px', borderRadius:20, background:isActive?'#34d39922':'#f59e0b22', color:isActive?'#34d399':'#f59e0b'}}>
          {isActive ? '● Active' : `${minsAgo}m ago`}
        </span>
      )}
    </div>
  )
})}
        </div>
        <div style={s.card}>
          <div style={s.cardHead}><span style={s.cardTitle}>Upcoming Leave</span><span style={s.chip}>Next 14 days</span></div>
          {upcomingLeave.length === 0 ? <p style={s.empty}>No approved leave upcoming.</p> : upcomingLeave.map(r => (
            <div key={r.id} style={s.dutyRow}>
              <span style={{flex:1, fontSize:'0.85rem'}}>{r.profiles?.name}</span>
              <span style={{fontSize:'0.75rem', color:'#60a5fa'}}>{fmtDate(r.start_date)} → {fmtDate(r.end_date)}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>Weekly Hours</span><span style={s.chip}>Target: 35h</span></div>
        {weeklyHours.length === 0 ? <p style={s.empty}>No records this week.</p> : weeklyHours.map(mod => {
          const pct = Math.min(100, Math.round((mod.minutes/(35*60))*100))
          const over = mod.minutes > 35*60
          return (
            <div key={mod.name} style={s.hoursRow}>
              <span style={s.hoursName}>{mod.name}</span>
              <div style={s.barTrack}><div style={{...s.barFill, width:`${pct}%`, background: over?'linear-gradient(90deg,#f59e0b,#fbbf24)':'linear-gradient(90deg,#3b82f6,#60a5fa)'}}/></div>
              <span style={{fontSize:'0.72rem', color: over?'#f59e0b':'#64748b', textAlign:'right', minWidth:48}}>{formatHours(mod.minutes)}</span>
            </div>
          )
        })}
      </div>
      <div style={s.card}>
        <div style={s.cardHead}>
          <span style={s.cardTitle}>🎂 Upcoming Birthdays</span>
          <span style={s.chip}>Next 30 days</span>
        </div>
        <AdminBirthdayList />
      </div>
    </div>
  )
}

function VacationHistory({ profiles }) {
  const [history, setHistory] = useState([])
  useEffect(() => {
    supabase.from('vacation_requests')
      .select('id,user_id,start_date,end_date,days_requested,status,admin_notes,reviewed_at')
      .in('status',['approved','declined'])
      .order('reviewed_at', { ascending: false })
      .limit(20)
      .then(({data}) => setHistory(data||[]))
  }, [])
  if (history.length === 0) return <p style={s.empty}>No vacation history yet.</p>
  const statusCol = { approved:'#34d399', declined:'#f87171' }
  return history.map(r => {
    const profile = profiles[r.user_id]
    return (
      <div key={r.id} style={s.approvalBlock}>
        <div style={s.approvalTop}>
          <div>
            <div style={s.approvalName}>{profile?.name || r.user_id}</div>
            <div style={s.approvalMeta}>
              {fmtDate(r.start_date)} → {fmtDate(r.end_date)} · {r.days_requested} days
              {r.admin_notes && ` · ${r.admin_notes}`}
            </div>
          </div>
          <span style={{...s.pill, background:(statusCol[r.status]||'#94a3b8')+'22', color:statusCol[r.status]||'#94a3b8'}}>{r.status}</span>
        </div>
      </div>
    )
  })
}

function PageApprovals({ onCountChange }) {
  const [vacations, setVacations] = useState([])
  const [allSwaps, setAllSwaps]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [notes, setNotes]         = useState({})
  const [profiles, setProfiles]   = useState({})

  useEffect(() => { load() }, [])

  async function load() {
    const res = await fetch('/api/admin?action=approvals')
    const body = await res.json()
    const profileMap = {}
    ;(body.profiles||[]).forEach(p => { profileMap[p.id] = p })
    setProfiles(profileMap)
    setVacations(body.vacations || [])
    setAllSwaps(body.allSwaps || [])
    onCountChange?.((body.vacations||[]).length + (body.allSwaps||[]).filter(r=>r.status==='pending'||r.status==='pending_admin').length)
    setLoading(false)
  }

  async function decideVacation(r, decision) {
    const profile = profiles[r.user_id]
    await fetch('/api/admin?action=decide_vacation', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id:r.id, decision, notes:notes[r.id]||'', user_id:r.user_id, days_requested:r.days_requested, vacation_used:profile?.vacation_used, vacation_pending:profile?.vacation_pending })
    })
    load()
  }

  async function decideSwap(id, decision) {
    await fetch('/api/admin?action=decide_swap', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id, decision })
    })
    load()
  }

  if (loading) return <div style={s.content}><div style={s.empty}>Loading…</div></div>

  const pendingSwaps = allSwaps.filter(r => r.status === 'pending' || r.status === 'pending_admin')
  const historySwaps = allSwaps.filter(r => r.status === 'approved' || r.status === 'declined')

  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>Approvals</h1>
      <div style={s.card}>
        <div style={s.cardHead}>
          <span style={s.cardTitle}>Vacation Requests</span>
          <span style={s.badge}>{vacations.length}</span>
        </div>
        {vacations.length === 0
          ? <p style={s.empty}>No pending vacation requests.</p>
          : vacations.map(r => {
            const profile = profiles[r.user_id]
            const remaining = (profile?.vacation_allowance||15)-(profile?.vacation_used||0)-(profile?.vacation_pending||0)
            return (
              <div key={r.id} style={s.approvalBlock}>
                <div style={s.approvalTop}>
                  <div>
                    <div style={s.approvalName}>{profile?.name || r.user_id}</div>
                    <div style={s.approvalMeta}>{fmtDate(r.start_date)} → {fmtDate(r.end_date)} · {r.days_requested} days · Balance: {remaining} remaining</div>
                    {r.validation_warnings?.length > 0 && r.validation_warnings.map((w,i) => <div key={i} style={s.warnBox}>{w}</div>)}
                  </div>
                  <div style={{display:'flex', gap:8, flexShrink:0}}>
                    <button style={s.btnApprove} onClick={() => decideVacation(r,'approved')}>Approve</button>
                    <button style={s.btnReject}  onClick={() => decideVacation(r,'declined')}>Decline</button>
                  </div>
                </div>
                <input style={{...s.input, marginTop:10, width:'100%'}} placeholder="Admin note (optional)…" value={notes[r.id]||''} onChange={e => setNotes(n=>({...n,[r.id]:e.target.value}))}/>
              </div>
            )
          })
        }
      </div>
      <div style={s.card}>
        <div style={s.cardHead}>
          <span style={s.cardTitle}>Shift Swap Requests</span>
          <span style={s.badge}>{pendingSwaps.length}</span>
        </div>
        {pendingSwaps.length === 0
          ? <p style={s.empty}>No pending swap requests.</p>
          : pendingSwaps.map(r => {
            const requester = profiles[r.requester_id]
            const target    = profiles[r.target_id]
            const isPendingAdmin = r.status === 'pending_admin'
            return (
              <div key={r.id} style={s.approvalBlock}>
                <div style={s.approvalTop}>
                  <div>
                    <div style={s.approvalName}>{requester?.name} ↔ {target?.name}</div>
                    <div style={s.approvalMeta}>{requester?.shift} ↔ {target?.shift} · {fmtDate(r.swap_date)}</div>
                    {r.notes && <div style={{fontSize:'0.78rem', color:'#94a3b8', marginTop:4}}>{r.notes}</div>}
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <span style={{...s.pill, background: isPendingAdmin?'#60a5fa22':'#f59e0b22', color: isPendingAdmin?'#60a5fa':'#f59e0b'}}>
                      {isPendingAdmin ? 'Awaiting Admin' : 'Awaiting Target'}
                    </span>
                    {isPendingAdmin && (
                      <>
                        <button style={s.btnApprove} onClick={() => decideSwap(r.id,'approved')}>Approve</button>
                        <button style={s.btnReject}  onClick={() => decideSwap(r.id,'declined')}>Decline</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
      <div style={{display:'flex', alignItems:'center', gap:12, margin:'28px 0 16px'}}>
        <div style={{flex:1, height:1, background:'#1e2433'}}/>
        <span style={{fontSize:'0.72rem', color:'#4a5568', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em'}}>History</span>
        <div style={{flex:1, height:1, background:'#1e2433'}}/>
      </div>
      <div style={{...s.card, background:'#0f1117', border:'1px solid #1a2030'}}>
        <div style={s.cardHead}><span style={{...s.cardTitle, color:'#64748b'}}>Vacation Requests</span></div>
        <VacationHistory profiles={profiles}/>
      </div>
      <div style={{...s.card, background:'#0f1117', border:'1px solid #1a2030'}}>
        <div style={s.cardHead}><span style={{...s.cardTitle, color:'#64748b'}}>Shift Swaps</span></div>
        {historySwaps.length === 0
          ? <p style={s.empty}>No swap history yet.</p>
          : historySwaps.map(r => {
            const requester = profiles[r.requester_id]
            const target    = profiles[r.target_id]
            const statusCol = { approved:'#34d399', declined:'#f87171' }
            return (
              <div key={r.id} style={{...s.approvalBlock, opacity:0.7}}>
                <div style={s.approvalTop}>
                  <div>
                    <div style={s.approvalName}>{requester?.name} ↔ {target?.name}</div>
                    <div style={s.approvalMeta}>{requester?.shift} ↔ {target?.shift} · {fmtDate(r.swap_date)}</div>
                  </div>
                  <span style={{...s.pill, background:(statusCol[r.status]||'#94a3b8')+'22', color:statusCol[r.status]||'#94a3b8'}}>{r.status}</span>
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

function PageModerators() {
  const [mods, setMods]             = useState([])
  const [formerMods, setFormerMods] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [tab, setTab]               = useState('active')
  const [form, setForm]             = useState({ name:'', full_name:'', nickname:'', email:'', password:'', shift:'', birthday:'', timezone:'UTC+1', discord_name:'', telegram_name:'', mod_group:'english' })
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState(null)
  const [editMod, setEditMod]       = useState(null)

  const SHIFTS    = ['Morning Shift','Afternoon Shift','Night Shift']
  const TIMEZONES = ['UTC-5','UTC-4','UTC-3','UTC-2','UTC-1','UTC+0','UTC+1','UTC+2','UTC+3','UTC+4','UTC+5','UTC+6']

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('profiles').select('*').eq('role','mod').order('name')
    setMods((data||[]).filter(m => m.status !== 'left'))
    setFormerMods((data||[]).filter(m => m.status === 'left'))
    setLoading(false)
  }

  async function createMod() {
    if (!form.name || !form.email || !form.password) { setError('Name, email and password are required.'); return }
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/admin?action=create_mod', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error)
      setShowForm(false)
      setForm({ name:'', full_name:'', nickname:'', email:'', password:'', shift:'', birthday:'', timezone:'UTC+1', discord_name:'', telegram_name:'', mod_group:'english' })
      load()
    } catch(e) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function saveMod() {
    await supabase.from('profiles').update({
      name: editMod.name, full_name: editMod.full_name, nickname: editMod.nickname,
      shift: editMod.shift, status: editMod.status, vacation_allowance: editMod.vacation_allowance,
      timezone: editMod.timezone, discord_name: editMod.discord_name, telegram_name: editMod.telegram_name,
      mod_group: editMod.mod_group, birthday: editMod.birthday,
      left_date: editMod.left_date||null, left_reason: editMod.left_reason||null,
    }).eq('id', editMod.id)
    setEditMod(null); load()
  }

  async function markAsLeft(mod) {
    await supabase.from('profiles').update({ status:'left', left_date: new Date().toISOString().split('T')[0] }).eq('id', mod.id)
    load()
  }

  async function reactivate(mod) {
    await supabase.from('profiles').update({ status:'active', left_date:null, left_reason:null }).eq('id', mod.id)
    load()
  }

  function ModCard({ m }) {
    return (
      <div style={{padding:'16px 0', borderBottom:'1px solid #1e2433'}}>
        <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
          <div style={{width:34,height:34,borderRadius:'50%',flexShrink:0,overflow:'hidden'}}>
            {m.avatar_url
              ? <img src={m.avatar_url} alt={m.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',fontWeight:700,color:'#fff'}}>{(m.name||'?')[0].toUpperCase()}</div>
            }
          </div>
          <div style={{flex:1, minWidth:160}}>
            <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
              <span style={{fontSize:'0.87rem', fontWeight:600}}>{m.name}</span>
              {m.nickname && <span style={{fontSize:'0.72rem', color:'#64748b'}}>"{m.nickname}"</span>}
              {m.mod_group==='russian' && <span style={{fontSize:'0.6rem', background:'#f59e0b22', color:'#f59e0b', padding:'1px 5px', borderRadius:3, fontWeight:700}}>RU</span>}
              <span style={{...s.pill, background:pillColor(m.status||'active').bg, color:pillColor(m.status||'active').col}}>{m.status||'active'}</span>
            </div>
            <div style={{fontSize:'0.72rem', color:'#64748b', marginTop:3, display:'flex', gap:12, flexWrap:'wrap'}}>
              {m.full_name && <span>👤 {m.full_name}</span>}
              {m.email && <span>✉️ {m.email}</span>}
              {m.shift && <span>⏰ {m.shift}</span>}
              {m.last_seen && (
  <span style={{fontSize:'0.72rem', color: (new Date()-new Date(m.last_seen))<5*60*1000 ? '#34d399' : (new Date()-new Date(m.last_seen))<30*60*1000 ? '#f59e0b' : '#4a5568'}}>
    ● {(new Date()-new Date(m.last_seen))<60000 ? 'Just now' : (new Date()-new Date(m.last_seen))<3600000 ? `${Math.floor((new Date()-new Date(m.last_seen))/60000)}m ago` : `${Math.floor((new Date()-new Date(m.last_seen))/3600000)}h ago`}
  </span>
)}
              {m.timezone && <span>🌍 {m.timezone}</span>}
            </div>
            <div style={{fontSize:'0.72rem', color:'#64748b', marginTop:3, display:'flex', gap:12, flexWrap:'wrap'}}>
              {m.discord_name && <span style={{display:'flex', alignItems:'center', gap:4}}><DiscordIcon/>{m.discord_name}</span>}
              {m.telegram_name && <span style={{display:'flex', alignItems:'center', gap:4}}><TelegramIcon/>{m.telegram_name}</span>}
              {m.birthday && <span>🎂 {new Date(m.birthday).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>}
              <span>🏖️ {m.vacation_used||0}/{m.vacation_allowance||15} days used</span>
            </div>
            {m.status==='left' && m.left_date && <div style={{fontSize:'0.72rem', color:'#f87171', marginTop:3}}>Left on {fmtDate(m.left_date)}{m.left_reason?` · ${m.left_reason}`:''}</div>}
          </div>
          <div style={{display:'flex', gap:6}}>
            <button style={s.btnSmBlue} onClick={()=>setEditMod({...m})}>Edit</button>
            {m.status!=='left'
              ? <button style={s.btnSmRed} onClick={()=>markAsLeft(m)}>Mark as Left</button>
              : <button style={s.btnSmGreen} onClick={()=>reactivate(m)}>Reactivate</button>
            }
          </div>
        </div>
        {editMod?.id === m.id && (
          <div style={{background:'#0f1117', borderRadius:10, padding:20, marginTop:12}}>
            <div style={s.formGrid}>
              <div style={s.formGroup}><label style={s.label}>Username</label><input style={s.input} value={editMod.name||''} onChange={e=>setEditMod(em=>({...em,name:e.target.value}))}/></div>
              <div style={s.formGroup}><label style={s.label}>Full Name</label><input style={s.input} value={editMod.full_name||''} onChange={e=>setEditMod(em=>({...em,full_name:e.target.value}))}/></div>
              <div style={s.formGroup}><label style={s.label}>Nickname</label><input style={s.input} value={editMod.nickname||''} onChange={e=>setEditMod(em=>({...em,nickname:e.target.value}))}/></div>
              <div style={s.formGroup}><label style={s.label}>Discord</label><input style={s.input} value={editMod.discord_name||''} onChange={e=>setEditMod(em=>({...em,discord_name:e.target.value}))}/></div>
              <div style={s.formGroup}><label style={s.label}>Telegram</label><input style={s.input} value={editMod.telegram_name||''} onChange={e=>setEditMod(em=>({...em,telegram_name:e.target.value}))}/></div>
              <div style={s.formGroup}><label style={s.label}>Timezone</label>
                <select style={s.input} value={editMod.timezone||'UTC+1'} onChange={e=>setEditMod(em=>({...em,timezone:e.target.value}))}>
                  {TIMEZONES.map(tz=><option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
              <div style={s.formGroup}><label style={s.label}>Shift</label>
                <select style={s.input} value={editMod.shift||''} onChange={e=>setEditMod(em=>({...em,shift:e.target.value}))}>
                  <option value="">No shift</option>
                  {SHIFTS.map(sh=><option key={sh} value={sh}>{sh}</option>)}
                </select>
              </div>
              <div style={s.formGroup}><label style={s.label}>Group</label>
                <select style={s.input} value={editMod.mod_group||'english'} onChange={e=>setEditMod(em=>({...em,mod_group:e.target.value}))}>
                  <option value="english">English</option>
                  <option value="russian">Russian</option>
                </select>
              </div>
              <div style={s.formGroup}><label style={s.label}>Date of Birth</label><input style={s.input} type="date" value={editMod.birthday||''} onChange={e=>setEditMod(em=>({...em,birthday:e.target.value}))}/></div>
              <div style={s.formGroup}><label style={s.label}>Vacation Allowance</label><input style={s.input} type="number" value={editMod.vacation_allowance||15} onChange={e=>setEditMod(em=>({...em,vacation_allowance:+e.target.value}))}/></div>
              <div style={s.formGroup}><label style={s.label}>Status</label>
                <select style={s.input} value={editMod.status||'active'} onChange={e=>setEditMod(em=>({...em,status:e.target.value}))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="left">Left</option>
                </select>
              </div>
              {editMod.status==='left' && <>
                <div style={s.formGroup}><label style={s.label}>Left Date</label><input style={s.input} type="date" value={editMod.left_date||''} onChange={e=>setEditMod(em=>({...em,left_date:e.target.value}))}/></div>
                <div style={{...s.formGroup, gridColumn:'span 2'}}><label style={s.label}>Reason</label><input style={s.input} value={editMod.left_reason||''} onChange={e=>setEditMod(em=>({...em,left_reason:e.target.value}))} placeholder="Optional…"/></div>
              </>}
            </div>
            <div style={{display:'flex', gap:8, marginTop:16}}>
              <button style={s.btnSmGreen} onClick={saveMod}>Save Changes</button>
              <button style={s.btnSmRed} onClick={()=>setEditMod(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) return <div style={s.content}><div style={s.empty}>Loading…</div></div>

  return (
    <div style={s.content}>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Moderators</h1>
        <button style={s.btnPrimary} onClick={()=>setShowForm(f=>!f)}>{showForm?'Cancel':'+ Add Moderator'}</button>
      </div>
      {showForm && (
        <div style={s.card}>
          <div style={s.cardHead}><span style={s.cardTitle}>New Moderator</span></div>
          {error && <div style={s.errorBox}>{error}</div>}
          <div style={s.formGrid}>
            <div style={s.formGroup}><label style={s.label}>Username *</label><input style={s.input} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="johndoe"/></div>
            <div style={s.formGroup}><label style={s.label}>Full Name</label><input style={s.input} value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))} placeholder="John Doe"/></div>
            <div style={s.formGroup}><label style={s.label}>Nickname</label><input style={s.input} value={form.nickname} onChange={e=>setForm(f=>({...f,nickname:e.target.value}))} placeholder="Johnny"/></div>
            <div style={s.formGroup}><label style={s.label}>Email *</label><input style={s.input} type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="john@example.com"/></div>
            <div style={s.formGroup}><label style={s.label}>Password *</label><input style={s.input} type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Temporary password"/></div>
            <div style={s.formGroup}>
              <label style={{...s.label, display:'flex', alignItems:'center', gap:4}}><DiscordIcon/> Discord</label>
              <input style={s.input} value={form.discord_name} onChange={e=>setForm(f=>({...f,discord_name:e.target.value}))} placeholder="username"/>
            </div>
            <div style={s.formGroup}>
              <label style={{...s.label, display:'flex', alignItems:'center', gap:4}}><TelegramIcon/> Telegram</label>
              <input style={s.input} value={form.telegram_name} onChange={e=>setForm(f=>({...f,telegram_name:e.target.value}))} placeholder="@username"/>
            </div>
            <div style={s.formGroup}><label style={s.label}>Shift</label>
              <select style={s.input} value={form.shift} onChange={e=>setForm(f=>({...f,shift:e.target.value}))}>
                <option value="">Select shift…</option>
                {SHIFTS.map(sh=><option key={sh} value={sh}>{sh}</option>)}
              </select>
            </div>
            <div style={s.formGroup}><label style={s.label}>Timezone</label>
              <select style={s.input} value={form.timezone} onChange={e=>setForm(f=>({...f,timezone:e.target.value}))}>
                {TIMEZONES.map(tz=><option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
            <div style={s.formGroup}><label style={s.label}>Group</label>
              <select style={s.input} value={form.mod_group} onChange={e=>setForm(f=>({...f,mod_group:e.target.value}))}>
                <option value="english">English</option>
                <option value="russian">Russian</option>
              </select>
            </div>
            <div style={s.formGroup}><label style={s.label}>Date of Birth</label><input style={s.input} type="date" value={form.birthday} onChange={e=>setForm(f=>({...f,birthday:e.target.value}))}/></div>
          </div>
          <button style={{...s.btnPrimary,marginTop:16}} disabled={saving} onClick={createMod}>{saving?'Creating…':'Create Account'}</button>
        </div>
      )}
      <div style={{display:'flex', gap:6, marginBottom:16}}>
        <button style={{...s.filterBtn,...(tab==='active'?s.filterActive:{})}} onClick={()=>setTab('active')}>Active ({mods.length})</button>
        <button style={{...s.filterBtn,...(tab==='former'?s.filterActive:{})}} onClick={()=>setTab('former')}>Former ({formerMods.length})</button>
      </div>
      {tab==='active' && (
        <div style={s.card}>
          <div style={s.cardHead}><span style={s.cardTitle}>Active Moderators</span><span style={s.badge}>{mods.length}</span></div>
          {mods.length===0 ? <p style={s.empty}>No active moderators.</p> : mods.map(m => <ModCard key={m.id} m={m}/>)}
        </div>
      )}
      {tab==='former' && (
        <div style={s.card}>
          <div style={s.cardHead}><span style={s.cardTitle}>Former Moderators</span><span style={s.badge}>{formerMods.length}</span></div>
          {formerMods.length===0 ? <p style={s.empty}>No former moderators.</p> : formerMods.map(m => <ModCard key={m.id} m={m}/>)}
        </div>
      )}
    </div>
  )
}

function PageAttendance() {
  const [records, setRecords]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('today')
  const [modFilter, setModFilter] = useState('')
  const [mods, setMods]           = useState([])

  useEffect(() => { supabase.from('profiles').select('id,name').eq('role','mod').then(({data})=>setMods(data||[])) }, [])
  useEffect(() => { load() }, [filter, modFilter])

  async function load() {
    setLoading(true)
    const now = new Date(); let from
    if (filter==='today') { from=new Date(now); from.setHours(0,0,0,0) }
    else if (filter==='week') { const {monday}=getWeekRange(); from=monday }
    else { from=new Date(now.getFullYear(),now.getMonth(),1) }
    let q = supabase.from('attendance').select('*, profiles(name,role)').gte('clock_in',from.toISOString()).order('clock_in',{ascending:false})
    if (modFilter) q = q.eq('user_id', modFilter)
    const { data } = await q
    setRecords((data||[]).filter(r=>r.profiles?.role!=='admin'))
    setLoading(false)
  }

  function duration(ci,co) {
    if (!co) return <span style={{color:'#34d399'}}>Active</span>
    return formatHours(Math.round((new Date(co)-new Date(ci))/60000))
  }

  return (
    <div style={s.content}>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Attendance Logs</h1>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <select style={{...s.input, padding:'6px 10px', fontSize:'0.78rem'}} value={modFilter} onChange={e=>setModFilter(e.target.value)}>
            <option value="">All Moderators</option>
            {mods.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <div style={s.filterRow}>
            {['today','week','month'].map(f=>(
              <button key={f} style={{...s.filterBtn,...(filter===f?s.filterActive:{})}} onClick={()=>setFilter(f)}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={s.card}>
        {loading ? <div style={s.empty}>Loading…</div> : records.length===0 ? <p style={s.empty}>No records.</p> : (
          <div style={{overflowX:'auto'}}>
            <table style={s.table}>
              <thead><tr>{['Moderator','Date','Clock In','Lunch Start','Lunch End','Clock Out','Duration','Status'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {records.map(r=>(
                  <tr key={r.id}>
                    <td style={s.td}>{r.profiles?.name}</td>
                    <td style={s.td}>{fmtDate(r.clock_in)}</td>
                    <td style={s.td}>{fmtTime(r.clock_in)}</td>
                    <td style={s.td}>{fmtTime(r.lunch_start)}</td>
                    <td style={s.td}>{fmtTime(r.lunch_end)}</td>
                    <td style={s.td}>{fmtTime(r.clock_out)}</td>
                    <td style={s.td}>{duration(r.clock_in,r.clock_out)}</td>
                    <td style={s.td}><span style={{...s.pill, background:pillColor(r.status).bg, color:pillColor(r.status).col}}>{r.status||'done'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function PageShifts() {
  const [mods, setMods]       = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView]       = useState('schedule')
  const [editMod, setEditMod] = useState(null)

  const DAYS        = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  const SHIFTS      = ['Morning Shift','Afternoon Shift','Night Shift']
  const SHIFT_TIMES = { 'Morning Shift':'09:00–17:00','Afternoon Shift':'17:00–00:00','Night Shift':'00:00–09:00' }
  const SHIFT_COLOR = { 'Morning Shift':'#3b82f6','Afternoon Shift':'#8b5cf6','Night Shift':'#06b6d4' }

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('profiles').select('id,name,shift,status,days_off,mod_group,rotating_days_off,rotating_days_off_alt').eq('role','mod').order('name')
    setMods(data || []); setLoading(false)
  }

  async function saveEdit() {
    await supabase.from('profiles').update({ shift:editMod.shift, days_off:editMod.days_off, mod_group:editMod.mod_group }).eq('id', editMod.id)
    setEditMod(null); load()
  }

  function toggleDayOff(day) {
    const current = editMod.days_off || []
    setEditMod(e => ({...e, days_off: current.includes(day) ? current.filter(d=>d!==day) : [...current, day]}))
  }

  function getCellContent(mod, day) {
    const isEvenMonth = (new Date().getMonth() + 1) % 2 === 0
    let daysOff = mod.days_off || []
    if (mod.rotating_days_off) {
      daysOff = isEvenMonth ? (mod.days_off || []) : (mod.rotating_days_off_alt || [])
    }
    if (daysOff.includes(day)) return { label:'OFF', color:'#f87171', bg:'#f8717118' }
    const color = SHIFT_COLOR[mod.shift] || '#94a3b8'
    return { label: mod.shift?.split(' ')[0] || '—', color, bg: color+'18' }
  }

  function ShiftTable({ title, rows, accent }) {
    return (
      <div style={{...s.card, marginBottom:20}}>
        <div style={s.cardHead}><span style={{...s.cardTitle, color:accent||'#f1f5f9'}}>{title}</span></div>
        <div style={{overflowX:'auto'}}>
          <table style={{...s.table, minWidth:700}}>
            <thead><tr>
              <th style={{...s.th, width:130, paddingRight:16}}>Moderator</th>
              {DAYS.map(d=><th key={d} style={{...s.th, textAlign:'center', minWidth:70}}>{d.slice(0,3).toUpperCase()}</th>)}
            </tr></thead>
            <tbody>
              {rows.map(mod=>(
                <tr key={mod.id}>
                  <td style={{...s.td, fontWeight:500, paddingRight:16, whiteSpace:'nowrap'}}>{mod.name}</td>
                  {DAYS.map(day=>{
                    const cell = getCellContent(mod, day)
                    return (
                      <td key={day} style={{...s.td, textAlign:'center', padding:'8px 4px'}}>
                        <div style={{background:cell.bg, color:cell.color, fontSize:'0.68rem', fontWeight:700, padding:'5px 4px', borderRadius:6, textTransform:'uppercase', letterSpacing:'0.03em'}}>
                          {cell.label}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (loading) return <div style={s.content}><div style={s.empty}>Loading…</div></div>

  const englishMods  = mods.filter(m => m.mod_group !== 'russian')
  const russianMods  = mods.filter(m => m.mod_group === 'russian')
  const nightEn      = englishMods.filter(m => m.shift === 'Night Shift')
  const morningEn    = englishMods.filter(m => m.shift === 'Morning Shift')
  const afternoonEn  = englishMods.filter(m => m.shift === 'Afternoon Shift')

  return (
    <div style={s.content}>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Shift Schedule</h1>
        <div style={s.filterRow}>
          <button style={{...s.filterBtn,...(view==='schedule'?s.filterActive:{})}} onClick={()=>setView('schedule')}>Weekly View</button>
          <button style={{...s.filterBtn,...(view==='edit'?s.filterActive:{})}} onClick={()=>setView('edit')}>Edit Shifts</button>
        </div>
      </div>
      {view==='schedule' && (
        <>
          <div style={{fontSize:'0.75rem', color:'#64748b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12}}>🇬🇧 English Moderators</div>
          {nightEn.length>0     && <ShiftTable title={`Night Shift · ${SHIFT_TIMES['Night Shift']} UTC+1`}     rows={nightEn}     accent='#06b6d4'/>}
          {morningEn.length>0   && <ShiftTable title={`Morning Shift · ${SHIFT_TIMES['Morning Shift']} UTC+1`}   rows={morningEn}   accent='#3b82f6'/>}
          {afternoonEn.length>0 && <ShiftTable title={`Afternoon Shift · ${SHIFT_TIMES['Afternoon Shift']} UTC+1`} rows={afternoonEn} accent='#8b5cf6'/>}
          {russianMods.length>0 && (
            <>
              <div style={{fontSize:'0.75rem', color:'#f59e0b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', margin:'24px 0 12px'}}>🇷🇺 Russian Moderators</div>
              <ShiftTable title='Schedule' rows={russianMods} accent='#f59e0b'/>
            </>
          )}
        </>
      )}
      {view==='edit' && (
        <div style={s.card}>
          <div style={s.cardHead}><span style={s.cardTitle}>Edit Moderator Schedules</span></div>
          {mods.map(m=>(
            <div key={m.id} style={{...s.dutyRow, flexWrap:'wrap', gap:12, padding:'14px 0'}}>
              <div style={s.modAvatar}>{m.name[0].toUpperCase()}</div>
              <div style={{flex:1, minWidth:100}}>
                <div style={{display:'flex', alignItems:'center', gap:6}}>
                  <span style={{fontSize:'0.87rem', fontWeight:500}}>{m.name}</span>
                  {m.mod_group==='russian' && <span style={{fontSize:'0.6rem', background:'#f59e0b22', color:'#f59e0b', padding:'1px 5px', borderRadius:3, fontWeight:700}}>RU</span>}
                </div>
                <div style={{fontSize:'0.72rem', color:'#64748b'}}>{m.shift||'No shift'} · Off: {(m.days_off||[]).join(', ')||'None'}</div>
              </div>
              {editMod?.id===m.id ? (
                <div style={{width:'100%', background:'#0f1117', borderRadius:8, padding:16, marginTop:8}}>
                  <div style={{marginBottom:12}}>
                    <label style={s.label}>Shift</label>
                    <select style={{...s.input, marginTop:4}} value={editMod.shift||''} onChange={e=>setEditMod(em=>({...em,shift:e.target.value}))}>
                      <option value="">No shift</option>
                      {SHIFTS.map(sh=><option key={sh} value={sh}>{sh}</option>)}
                    </select>
                  </div>
                  <div style={{marginBottom:12}}>
                    <label style={s.label}>Days Off</label>
                    <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:6}}>
                      {DAYS.map(day=>{
                        const isOff=(editMod.days_off||[]).includes(day)
                        return <button key={day} onClick={()=>toggleDayOff(day)} style={{padding:'5px 10px', borderRadius:6, fontSize:'0.75rem', fontWeight:600, cursor:'pointer', border:'1px solid', background:isOff?'#f8717122':'#1e2433', color:isOff?'#f87171':'#94a3b8', borderColor:isOff?'#f8717144':'#2d3748'}}>{day.slice(0,3)}</button>
                      })}
                    </div>
                  </div>
                  <div style={{marginBottom:12}}>
                    <label style={s.label}>Group</label>
                    <select style={{...s.input, marginTop:4}} value={editMod.mod_group||'english'} onChange={e=>setEditMod(em=>({...em,mod_group:e.target.value}))}>
                      <option value="english">English</option>
                      <option value="russian">Russian</option>
                    </select>
                  </div>
                  <div style={{display:'flex', gap:8}}>
                    <button style={s.btnSmGreen} onClick={saveEdit}>Save</button>
                    <button style={s.btnSmRed} onClick={()=>setEditMod(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button style={s.btnSmBlue} onClick={()=>setEditMod({...m})}>Edit</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PageReports() {
  const [vacStats, setVacStats] = useState([])
  const [attStats, setAttStats] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { monday } = getWeekRange()
    const [{ data:profs }, { data:att }] = await Promise.all([
      supabase.from('profiles').select('id,name,vacation_used,vacation_pending,vacation_allowance').eq('role','mod'),
      supabase.from('attendance').select('user_id,clock_in,clock_out').gte('clock_in',monday.toISOString()).not('clock_out','is',null),
    ])
    setVacStats((profs||[]).map(p=>({ name:p.name, allowance:p.vacation_allowance||15, used:p.vacation_used||0, pending:p.vacation_pending||0, remaining:(p.vacation_allowance||15)-(p.vacation_used||0)-(p.vacation_pending||0) })))
    const profMap={}; (profs||[]).forEach(p=>{ profMap[p.id]=p.name })
    const map={}
    ;(att||[]).forEach(r=>{
      const name=profMap[r.user_id]||r.user_id
      const mins=Math.round((new Date(r.clock_out)-new Date(r.clock_in))/60000)
      if(!map[name]) map[name]={name,minutes:0,sessions:0}
      map[name].minutes+=mins; map[name].sessions++
    })
    setAttStats(Object.values(map).sort((a,b)=>b.minutes-a.minutes))
    setLoading(false)
  }

  if (loading) return <div style={s.content}><div style={s.empty}>Loading…</div></div>

  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>Reports</h1>
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>Vacation Report</span></div>
        <div style={{overflowX:'auto'}}>
          <table style={s.table}>
            <thead><tr>{['Moderator','Allowance','Used','Pending','Remaining'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {vacStats.map(r=>(
                <tr key={r.name}>
                  <td style={s.td}>{r.name}</td>
                  <td style={s.td}>{r.allowance}</td>
                  <td style={{...s.td,color:'#f87171'}}>{r.used}</td>
                  <td style={{...s.td,color:'#f59e0b'}}>{r.pending}</td>
                  <td style={{...s.td,color:'#34d399',fontWeight:600}}>{r.remaining}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>Weekly Hours Report</span></div>
        {attStats.length===0 ? <p style={s.empty}>No attendance this week.</p> : (
          <div style={{overflowX:'auto'}}>
            <table style={s.table}>
              <thead><tr>{['Moderator','Sessions','Total Hours','vs Target'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {attStats.map(r=>{
                  const diff=r.minutes-(35*60)
                  return (
                    <tr key={r.name}>
                      <td style={s.td}>{r.name}</td>
                      <td style={s.td}>{r.sessions}</td>
                      <td style={s.td}>{formatHours(r.minutes)}</td>
                      <td style={{...s.td,color:diff>=0?'#34d399':'#f87171'}}>{diff>=0?'+':''}{formatHours(Math.abs(diff))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function PageDailyReports() {
  const [reports, setReports]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('today')
  const [modFilter, setModFilter] = useState('')
  const [mods, setMods]           = useState({})
  const [modsList, setModsList]   = useState([])
  const [selected, setSelected]   = useState(null)

  useEffect(() => { load() }, [filter, modFilter])

  async function load() {
    setLoading(true)
    const now = new Date(); let from
    if (filter==='today') { from=new Date(now); from.setHours(0,0,0,0) }
    else if (filter==='week') { from=new Date(now); from.setDate(now.getDate()-7) }
    else { from=new Date(now.getFullYear(),now.getMonth(),1) }
    const [{ data:r },{ data:p }] = await Promise.all([
      supabase.from('daily_reports').select('*').gte('report_date', from.toISOString().split('T')[0]).order('report_date',{ascending:false}),
      supabase.from('profiles').select('id,name,avatar_url').eq('role','mod'),
    ])
    const map={}; (p||[]).forEach(x=>map[x.id]={name:x.name,avatar_url:x.avatar_url})
    setMods(map); setModsList(p||[])
    setReports(modFilter?(r||[]).filter(x=>x.user_id===modFilter):(r||[]))
    setLoading(false)
  }

  return (
    <div style={s.content}>
{selected && <ReportModal report={selected} modName={mods[selected.user_id]?.name} onClose={()=>setSelected(null)} hideDevInfo/>}
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Daily Reports</h1>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
          <select style={{...s.input,padding:'6px 10px',fontSize:'0.78rem',minWidth:140}} value={modFilter} onChange={e=>setModFilter(e.target.value)}>
            <option value="">All Moderators</option>
            {modsList.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <div style={s.filterRow}>
            {['today','week','month'].map(f=>(
              <button key={f} style={{...s.filterBtn,...(filter===f?s.filterActive:{})}} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
            ))}
          </div>
        </div>
      </div>
      {loading?<div style={s.empty}>Loading…</div>:reports.length===0?(
        <div style={s.card}><p style={s.empty}>No reports yet.</p></div>
      ):(
        <div style={s.card}>
          {reports.map(r=>(
            <ReportCard key={r.id} report={r} modName={mods[r.user_id]?.name} avatarUrl={mods[r.user_id]?.avatar_url} hideDevInfo onClick={()=>setSelected(r)}/>
          ))}
        </div>
      )}
    </div>
  )
}

function AdminDevNotes({ reportId, initialNotes }) {
  const [notes, setNotes] = useState(initialNotes||'')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  async function save() {
    setSaving(true)
    await supabase.from('daily_reports').update({ admin_dev_notes: notes }).eq('id', reportId)
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2000)
  }

  return (
    <div>
      <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:6}}>Admin Notes</div>
      <textarea style={{width:'100%', background:'#0f1117', border:'1px solid #2d3748', borderRadius:8, padding:'8px 10px', color:'#e2e8f0', fontSize:'0.82rem', outline:'none', fontFamily:'inherit', resize:'vertical', minHeight:80, marginBottom:8}} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add admin notes on this bug/exploit…"/>
      <button style={{...s.btnPrimary, padding:'6px 14px', fontSize:'0.78rem'}} disabled={saving} onClick={save}>
        {saved?'✓ Saved':saving?'Saving…':'Save Notes'}
      </button>
    </div>
  )
}

function PageDevReports() {
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
    <div style={s.content}>
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
                <button style={{...s.btnApprove, width:'100%', marginTop:12, display:'flex', justifyContent:'center'}} onClick={()=>resolve(selected.id)}>
                  ✓ Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Dev Reports</h1>
        <div style={s.filterRow}>
          {['open','resolved','all'].map(f=>(
            <button key={f} style={{...s.filterBtn,...(filter===f?s.filterActive:{})}} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
          ))}
        </div>
      </div>
      {loading?<div style={s.empty}>Loading…</div>:reports.length===0?(
        <div style={s.card}><p style={s.empty}>No dev reports yet.</p></div>
      ):(
        <div style={s.card}>
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


function PageCalendar() {
  const [mods, setMods]           = useState([])
  const [vacations, setVacations] = useState([])
  const [swaps, setSwaps]         = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading]     = useState(true)

  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const isEvenMonth = (month + 1) % 2 === 0

  const DAYS_OF_WEEK = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const MONTH_NAMES  = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const SHIFT_COLOR  = { 'Morning Shift':'#3b82f6','Afternoon Shift':'#8b5cf6','Night Shift':'#06b6d4' }

  useEffect(() => { load() }, [month, year])

  async function load() {
    setLoading(true)
    const firstDay = new Date(year, month, 1).toISOString().split('T')[0]
    const lastDay  = new Date(year, month + 1, 0).toISOString().split('T')[0]
    const [{ data:m },{ data:v },{ data:sw }] = await Promise.all([
      supabase.from('profiles').select('id,name,shift,days_off,rotating_days_off,rotating_days_off_alt,mod_group').eq('role','mod').neq('status','left').order('name'),
      supabase.from('vacation_requests').select('id,user_id,start_date,end_date').eq('status','approved').lte('start_date',lastDay).gte('end_date',firstDay),
      supabase.from('shift_swaps').select('id,requester_id,target_id,swap_date').eq('status','approved').gte('swap_date',firstDay).lte('swap_date',lastDay),
    ])
    setMods(m||[]); setVacations(v||[]); setSwaps(sw||[])
    setLoading(false)
  }

  function getDays() {
    const days = []
    const last = new Date(year, month + 1, 0)
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d))
    return days
  }

  function isOff(mod, date) {
    const dayName = date.toLocaleDateString('en-GB',{weekday:'long'})
    let daysOff = mod.days_off || []
    if (mod.rotating_days_off) {
      daysOff = isEvenMonth ? (mod.days_off||[]) : (mod.rotating_days_off_alt||[])
    }
    return daysOff.includes(dayName)
  }

  function isOnVacation(modId, date) {
    const d = date.toISOString().split('T')[0]
    return vacations.some(v => v.user_id===modId && d>=v.start_date && d<=v.end_date)
  }

  function hasSwap(modId, date) {
    const d = date.toISOString().split('T')[0]
    return swaps.some(sw => sw.swap_date===d && (sw.requester_id===modId||sw.target_id===modId))
  }

  function getCell(mod, date) {
    if (isOnVacation(mod.id, date)) return { label:'VAC', color:'#34d399', bg:'#34d39918' }
    if (hasSwap(mod.id, date))      return { label:'SWAP', color:'#f59e0b', bg:'#f59e0b18' }
    if (isOff(mod, date))           return { label:'OFF', color:'#f87171', bg:'#f8717118' }
    const color = SHIFT_COLOR[mod.shift] || '#94a3b8'
    return { label: mod.shift?.split(' ')[0]||'—', color, bg: color+'15' }
  }

  const days  = getDays()
  const today = new Date()

  const englishMods   = mods.filter(m => m.mod_group !== 'russian')
  const russianMods   = mods.filter(m => m.mod_group === 'russian')
  const nightMods     = englishMods.filter(m => m.shift === 'Night Shift')
  const morningMods   = englishMods.filter(m => m.shift === 'Morning Shift')
  const afternoonMods = englishMods.filter(m => m.shift === 'Afternoon Shift')

  function ShiftCalendar({ title, accent, rows }) {
    if (rows.length === 0) return null
    return (
      <div style={{marginBottom:40}}>
        <div style={{fontSize:'0.78rem', fontWeight:700, color:accent, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14, display:'flex', alignItems:'center', gap:10}}>
          <div style={{height:1, width:20, background:accent+'66'}}/>
          {title}
          <div style={{flex:1, height:1, background:accent+'22'}}/>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{...s.table, minWidth:900}}>
            <thead>
              <tr>
                <th style={{...s.th, width:120, paddingRight:16, position:'sticky', left:0, background:'#0f1117', zIndex:1}}>Mod</th>
                {days.map((d,i) => (
                  <th key={i} style={{...s.th, textAlign:'center', minWidth:38, padding:'0 2px 12px', color:d.toDateString()===today.toDateString()?'#60a5fa':'#4a5568', fontWeight:d.toDateString()===today.toDateString()?700:400}}>
                    <div style={{fontSize:'0.57rem', marginBottom:2}}>{DAYS_OF_WEEK[(d.getDay()+6)%7]}</div>
                    <div style={{fontSize:'0.75rem', background:d.toDateString()===today.toDateString()?'#3b82f6':'transparent', color:d.toDateString()===today.toDateString()?'#fff':'inherit', borderRadius:'50%', width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto'}}>{d.getDate()}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((mod,mi) => (
                <tr key={mod.id} style={{background: mi%2===0?'transparent':'#0a0d1422'}}>
                  <td style={{...s.td, fontWeight:500, fontSize:'0.82rem', paddingRight:16, whiteSpace:'nowrap', position:'sticky', left:0, background: mi%2===0?'#141820':'#111520', zIndex:1}}>
                    {mod.name}{mod.rotating_days_off&&<span style={{fontSize:'0.6rem',color:'#4a5568',marginLeft:4}}>↻</span>}
                  </td>
                  {days.map((d,i) => {
                    const cell = getCell(mod, d)
                    const isToday = d.toDateString()===today.toDateString()
                    const isWeekend = d.getDay()===0||d.getDay()===6
                    const isWorking = cell.label!=='OFF'&&cell.label!=='VAC'&&cell.label!=='SWAP'
                    return (
                      <td key={i} style={{padding:'6px 2px', textAlign:'center', borderBottom:'1px solid #0f1117', background:isToday?'#1e2433':isWeekend?'#0d1018':'transparent'}}>
                        {isWorking
                          ? <div style={{width:8, height:8, borderRadius:'50%', background:cell.color, margin:'0 auto', opacity:0.75}}/>
                          : <div style={{fontSize:'0.58rem', fontWeight:700, color:cell.color, background:cell.color+'18', padding:'3px 3px', borderRadius:5, textTransform:'uppercase', border:`1px solid ${cell.color}33`}}>{cell.label}</div>
                        }
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (loading) return <div style={s.content}><div style={s.empty}>Loading…</div></div>

  return (
    <div style={{padding:'32px 24px', width:'100%', boxSizing:'border-box'}}>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Team Calendar</h1>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <button style={s.filterBtn} onClick={()=>setCurrentDate(new Date(year,month-1,1))}>← Prev</button>
          <span style={{fontSize:'0.95rem', fontWeight:600, color:'#f1f5f9', minWidth:160, textAlign:'center'}}>{MONTH_NAMES[month]} {year}</span>
          <button style={s.filterBtn} onClick={()=>setCurrentDate(new Date(year,month+1,1))}>Next →</button>
        </div>
      </div>
      <div style={{display:'flex', gap:16, flexWrap:'wrap', marginBottom:24}}>
        {Object.entries(SHIFT_COLOR).map(([shift,color])=>(
          <div key={shift} style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:10,height:10,borderRadius:2,background:color}}/>
            <span style={{fontSize:'0.72rem',color:'#94a3b8'}}>{shift}</span>
          </div>
        ))}
        <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:10,height:10,borderRadius:2,background:'#f87171'}}/><span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Day Off</span></div>
        <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:10,height:10,borderRadius:2,background:'#34d399'}}/><span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Vacation</span></div>
        <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:10,height:10,borderRadius:2,background:'#f59e0b'}}/><span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Swap</span></div>
        <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:'0.72rem',color:'#64748b'}}>↻ Rotating</span></div>
      </div>
      <div style={{fontSize:'0.75rem', color:'#64748b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16}}>🇬🇧 English Moderators</div>
      <ShiftCalendar title="Night Shift · 00:00–09:00 UTC+1"     accent='#06b6d4' rows={nightMods}/>
      <ShiftCalendar title="Morning Shift · 09:00–17:00 UTC+1"   accent='#3b82f6' rows={morningMods}/>
      <ShiftCalendar title="Afternoon Shift · 17:00–00:00 UTC+1" accent='#8b5cf6' rows={afternoonMods}/>
      {russianMods.length > 0 && (
        <>
          <div style={{fontSize:'0.75rem', color:'#f59e0b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', margin:'24px 0 16px'}}>🇷🇺 Russian Moderators</div>
          <ShiftCalendar title="Schedule" accent='#f59e0b' rows={russianMods}/>
        </>
      )}
    </div>
  )
}

function PageHours() {
  const [mods, setMods]         = useState([])
  const [selected, setSelected] = useState('')
  const [month, setMonth]       = useState(new Date().getMonth())
  const [year, setYear]         = useState(new Date().getFullYear())
  const [records, setRecords]   = useState([])
  const [loading, setLoading]   = useState(false)
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

  useEffect(() => { supabase.from('profiles').select('id,name').eq('role','mod').order('name').then(({data})=>setMods(data||[])) }, [])
  useEffect(() => { if(selected) load() }, [selected, month, year])

  async function load() {
    setLoading(true)
    const from = new Date(year, month, 1).toISOString()
    const to   = new Date(year, month+1, 0, 23, 59, 59).toISOString()
    const { data } = await supabase.from('attendance').select('*').eq('user_id', selected).gte('clock_in', from).lte('clock_in', to).order('clock_in')
    setRecords(data||[]); setLoading(false)
  }

  const totalMins = records.filter(r=>r.clock_out).reduce((acc,r)=>acc+Math.round((new Date(r.clock_out)-new Date(r.clock_in))/60000),0)
  const diff = totalMins - 35*60
  const byDay = {}
  records.forEach(r => {
    const day = new Date(r.clock_in).toLocaleDateString('en-GB',{day:'2-digit',month:'short'})
    if (!byDay[day]) byDay[day] = 0
    if (r.clock_out) byDay[day] += Math.round((new Date(r.clock_out)-new Date(r.clock_in))/60000)
  })

  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>Hours & Attendance</h1>
      <div style={{display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center'}}>
        <select style={{...s.input, minWidth:160}} value={selected} onChange={e=>setSelected(e.target.value)}>
          <option value="">Select moderator…</option>
          {mods.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select style={{...s.input, minWidth:130}} value={month} onChange={e=>setMonth(+e.target.value)}>
          {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
        </select>
        <select style={{...s.input, minWidth:90}} value={year} onChange={e=>setYear(+e.target.value)}>
          {[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {!selected && <div style={s.card}><p style={s.empty}>Select a moderator to view their hours.</p></div>}
      {selected && !loading && <>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20}}>
          {[
            { label:'Total Hours', val:formatHours(totalMins), col:'#60a5fa' },
            { label:'Target', val:'35h', col:'#94a3b8' },
            { label:'vs Target', val:(diff>=0?'+':'')+formatHours(Math.abs(diff)), col:diff>=0?'#34d399':'#f87171' },
            { label:'Days Worked', val:Object.keys(byDay).length, col:'#8b5cf6' },
          ].map(item=>(
            <div key={item.label} style={s.statCard}>
              <span style={{...s.statNum, color:item.col, fontSize:'1.5rem'}}>{item.val}</span>
              <span style={s.statLabel}>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={s.card}>
          <div style={s.cardHead}><span style={s.cardTitle}>Daily Breakdown — {MONTHS[month]} {year}</span></div>
          {Object.keys(byDay).length === 0 ? <p style={s.empty}>No records.</p> : (
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              {Object.entries(byDay).map(([day, mins]) => {
                const pct = Math.min(100, Math.round((mins/480)*100))
                return (
                  <div key={day} style={{display:'grid', gridTemplateColumns:'80px 1fr 60px', gap:12, alignItems:'center'}}>
                    <span style={{fontSize:'0.78rem', color:'#94a3b8'}}>{day}</span>
                    <div style={s.barTrack}><div style={{...s.barFill, width:`${pct}%`, background:'linear-gradient(90deg,#3b82f6,#60a5fa)'}}/></div>
                    <span style={{fontSize:'0.72rem', color:'#64748b', textAlign:'right'}}>{formatHours(mins)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div style={s.card}>
          <div style={s.cardHead}><span style={s.cardTitle}>Session Log</span></div>
          <div style={{overflowX:'auto'}}>
            <table style={s.table}>
              <thead><tr>{['Date','Clock In','Lunch','Clock Out','Duration'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {records.map(r => {
                  const mins = r.clock_out ? Math.round((new Date(r.clock_out)-new Date(r.clock_in))/60000) : null
                  const lunchMins = r.lunch_start && r.lunch_end ? Math.round((new Date(r.lunch_end)-new Date(r.lunch_start))/60000) : null
                  return (
                    <tr key={r.id}>
                      <td style={s.td}>{fmtDate(r.clock_in)}</td>
                      <td style={s.td}>{fmtTime(r.clock_in)}</td>
                      <td style={s.td}>{lunchMins ? <span style={{color:lunchMins>30?'#f87171':'#94a3b8'}}>{lunchMins}m</span> : '—'}</td>
                      <td style={s.td}>{fmtTime(r.clock_out)}</td>
                      <td style={s.td}>{mins ? formatHours(mins) : <span style={{color:'#34d399'}}>Active</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </>}
    </div>
  )
}


function PageRotating() {
  const [mods, setMods]     = useState([])
  const [saving, setSaving] = useState(null)
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  const isEvenMonth = (new Date().getMonth()+1) % 2 === 0

  useEffect(() => {
    supabase.from('profiles').select('id,name,shift,days_off,rotating_days_off,rotating_days_off_alt').eq('role','mod').eq('rotating_days_off',true).order('name')
      .then(({data})=>setMods(data||[]))
  }, [])

  async function save(mod) {
    setSaving(mod.id)
    await supabase.from('profiles').update({ days_off:mod.days_off, rotating_days_off_alt:mod.rotating_days_off_alt }).eq('id', mod.id)
    setSaving(null)
  }

  function toggleDay(modId, field, day) {
    setMods(ms => ms.map(m => {
      if (m.id !== modId) return m
      const current = m[field] || []
      return {...m, [field]: current.includes(day) ? current.filter(d=>d!==day) : [...current, day]}
    }))
  }

  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>Rotating Days Off</h1>
      <div style={{...s.card, background:'#3b82f608', border:'1px solid #3b82f633', marginBottom:20}}>
        <div style={{fontSize:'0.82rem', color:'#94a3b8'}}>
          Current month is <strong style={{color:'#60a5fa'}}>{isEvenMonth?'Even':'Odd'}</strong> — mods are on their <strong style={{color:'#60a5fa'}}>{isEvenMonth?'Even (primary)':'Odd (alternate)'}</strong> schedule.
        </div>
      </div>
      {mods.length === 0 ? <div style={s.card}><p style={s.empty}>No mods with rotating days off.</p></div> : mods.map(mod => (
        <div key={mod.id} style={s.card}>
          <div style={s.cardHead}><span style={s.cardTitle}>{mod.name}</span><span style={{fontSize:'0.75rem', color:'#64748b'}}>{mod.shift}</span></div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
            {[
              { label:'Even months (primary)', field:'days_off', accent:'#3b82f6' },
              { label:'Odd months (alternate)', field:'rotating_days_off_alt', accent:'#8b5cf6' },
            ].map(({label, field, accent}) => (
              <div key={field}>
                <div style={{fontSize:'0.75rem', color:accent, fontWeight:600, marginBottom:10}}>{label}</div>
                <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                  {DAYS.map(day => {
                    const isOff = (mod[field]||[]).includes(day)
                    return <button key={day} onClick={()=>toggleDay(mod.id, field, day)} style={{padding:'5px 10px', borderRadius:6, fontSize:'0.75rem', fontWeight:600, cursor:'pointer', border:'1px solid', background:isOff?accent+'22':'#1e2433', color:isOff?accent:'#94a3b8', borderColor:isOff?accent+'44':'#2d3748'}}>{day.slice(0,3)}</button>
                  })}
                </div>
              </div>
            ))}
          </div>
          <button style={{...s.btnPrimary, marginTop:16, padding:'7px 16px', fontSize:'0.78rem'}} disabled={saving===mod.id} onClick={()=>save(mod)}>
            {saving===mod.id?'Saving…':'Save Changes'}
          </button>
        </div>
      ))}
    </div>
  )
}


function PageModNotes({ adminId }) {
  const [mods, setMods]         = useState([])
  const [selected, setSelected] = useState('')
  const [notes, setNotes]       = useState([])
  const [newNote, setNewNote]   = useState('')
  const [saving, setSaving]     = useState(false)

  useEffect(() => { supabase.from('profiles').select('id,name,avatar_url').eq('role','mod').order('name').then(({data})=>setMods(data||[])) }, [])
  useEffect(() => { if(selected) loadNotes() }, [selected])

  async function loadNotes() {
    const { data } = await supabase.from('mod_notes').select('*').eq('user_id', selected).order('created_at', {ascending:false})
    setNotes(data||[])
  }

  async function addNote() {
    if (!newNote.trim()) return
    setSaving(true)
    await supabase.from('mod_notes').insert({ user_id:selected, note:newNote, created_by:adminId })
    setNewNote(''); loadNotes(); setSaving(false)
  }

  async function deleteNote(id) {
    await supabase.from('mod_notes').delete().eq('id', id)
    loadNotes()
  }

  const mod = mods.find(m=>m.id===selected)

  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>Mod Notes</h1>
      <select style={{...s.input, minWidth:200, marginBottom:20}} value={selected} onChange={e=>setSelected(e.target.value)}>
        <option value="">Select moderator…</option>
        {mods.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
      {!selected && <div style={s.card}><p style={s.empty}>Select a moderator to view internal notes.</p></div>}
      {selected && <>
        <div style={s.card}>
          <div style={s.cardHead}>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              {mod?.avatar_url ? <img src={mod.avatar_url} alt="" style={{width:32,height:32,borderRadius:'50%',objectFit:'cover'}}/> : <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',fontWeight:700,color:'#fff'}}>{(mod?.name||'?')[0].toUpperCase()}</div>}
              <span style={s.cardTitle}>{mod?.name} — Internal Notes</span>
            </div>
            <span style={{fontSize:'0.72rem', color:'#f87171', background:'#f8717122', padding:'3px 8px', borderRadius:4}}>🔒 Admin only</span>
          </div>
          <textarea style={{...s.input, width:'100%', minHeight:80, resize:'vertical', marginBottom:10}} value={newNote} onChange={e=>setNewNote(e.target.value)} placeholder="Add an internal note…"/>
          <button style={s.btnPrimary} disabled={saving||!newNote.trim()} onClick={addNote}>{saving?'Saving…':'Add Note'}</button>
        </div>
        {notes.map(note=>(
          <div key={note.id} style={{...s.card, padding:'14px 18px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:'0.85rem', color:'#e2e8f0', lineHeight:1.6, marginBottom:6}}>{note.note}</div>
                <div style={{fontSize:'0.72rem', color:'#4a5568'}}>{fmtDate(note.created_at)}</div>
              </div>
              <button onClick={()=>deleteNote(note.id)} style={{background:'#f8717122',color:'#f87171',border:'1px solid #f8717133',padding:'4px 10px',borderRadius:6,cursor:'pointer',fontSize:'0.72rem'}}>Delete</button>
            </div>
          </div>
        ))}
      </>}
    </div>
  )
}


function PageAnnouncements({ adminId }) {
  const [announcements, setAnnouncements] = useState([])
  const [form, setForm]   = useState({ title:'', body:'', type:'info', expires_at:'' })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)

  useEffect(() => { load() }, [])
  async function load() {
    const { data } = await supabase.from('announcements').select('*').order('created_at',{ascending:false})
    setAnnouncements(data||[])
  }
  async function create() {
    if (!form.title||!form.body) return
    setSaving(true)
    await supabase.from('announcements').insert({...form, created_by:adminId, expires_at:form.expires_at||null})
    setForm({title:'',body:'',type:'info',expires_at:''}); setShowForm(false); setSaving(false); load()
  }
  async function toggle(id, active) { await supabase.from('announcements').update({active}).eq('id',id); load() }
  async function remove(id) { await supabase.from('announcements').delete().eq('id',id); load() }

  const typeColor = { info:'#3b82f6', warning:'#f59e0b', success:'#34d399', danger:'#f87171' }

  return (
    <div style={s.content}>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Announcements</h1>
        <button style={s.btnPrimary} onClick={()=>setShowForm(f=>!f)}>{showForm?'Cancel':'+ New'}</button>
      </div>
      {showForm && (
        <div style={s.card}>
          <div style={s.formGrid}>
            <div style={{...s.formGroup, gridColumn:'span 2'}}><label style={s.label}>Title</label><input style={s.input} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Title…"/></div>
            <div style={{...s.formGroup, gridColumn:'span 2'}}><label style={s.label}>Body</label><textarea style={{...s.input, minHeight:80, resize:'vertical'}} value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} placeholder="Content…"/></div>
            <div style={s.formGroup}><label style={s.label}>Type</label>
              <select style={s.input} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                {['info','warning','success','danger'].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div style={s.formGroup}><label style={s.label}>Expires at (optional)</label><input style={s.input} type="datetime-local" value={form.expires_at} onChange={e=>setForm(f=>({...f,expires_at:e.target.value}))}/></div>
          </div>
          <button style={{...s.btnPrimary, marginTop:16}} disabled={saving} onClick={create}>{saving?'Publishing…':'Publish'}</button>
        </div>
      )}
      {announcements.length===0?<div style={s.card}><p style={s.empty}>No announcements yet.</p></div>:announcements.map(a=>{
        const color=typeColor[a.type]||'#3b82f6'
        return (
          <div key={a.id} style={{...s.card, border:`1px solid ${color}33`, opacity:a.active?1:0.5}}>
            <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12}}>
              <div style={{flex:1}}>
                <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                  <span style={{fontSize:'0.68rem', fontWeight:700, padding:'2px 8px', borderRadius:20, background:color+'22', color}}>{a.type.toUpperCase()}</span>
                  {!a.active&&<span style={{fontSize:'0.68rem', color:'#4a5568'}}>Inactive</span>}
                </div>
                <div style={{fontSize:'0.9rem', fontWeight:600, color:'#f1f5f9', marginBottom:4}}>{a.title}</div>
                <div style={{fontSize:'0.82rem', color:'#94a3b8'}}>{a.body}</div>
                <div style={{fontSize:'0.7rem', color:'#4a5568', marginTop:8}}>{fmtDate(a.created_at)}</div>
              </div>
              <div style={{display:'flex', gap:6}}>
                <button style={a.active?s.btnSmRed:s.btnSmGreen} onClick={()=>toggle(a.id,!a.active)}>{a.active?'Deactivate':'Activate'}</button>
                <button style={s.btnSmRed} onClick={()=>remove(a.id)}>Delete</button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PageAlertSend({ adminId }) {
  const [mods, setMods]     = useState([])
  const [form, setForm]     = useState({ user_id:'', title:'', body:'' })
  const [saving, setSaving] = useState(false)
  const [sent, setSent]     = useState(false)
  const [history, setHistory] = useState([])

  useEffect(() => {
    supabase.from('profiles').select('id,name').eq('role','mod').order('name').then(({data})=>setMods(data||[]))
    loadHistory()
  }, [])

  async function loadHistory() {
    const { data } = await supabase.from('mod_alerts').select('*').order('sent_at',{ascending:false}).limit(20)
    setHistory(data||[])
  }

  async function send() {
    if (!form.user_id||!form.title) return
    setSaving(true)
    await supabase.from('mod_alerts').insert({...form, sent_by:adminId})
    setForm({user_id:'',title:'',body:''}); setSaving(false); setSent(true); setTimeout(()=>setSent(false),2000); loadHistory()
  }

  const modMap={}; mods.forEach(m=>modMap[m.id]=m.name)

  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>Send Alert to Mod</h1>
      <div style={s.card}>
        <div style={s.formGrid}>
          <div style={s.formGroup}><label style={s.label}>Moderator</label>
            <select style={s.input} value={form.user_id} onChange={e=>setForm(f=>({...f,user_id:e.target.value}))}>
              <option value="">Select…</option>
              {mods.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div style={s.formGroup}><label style={s.label}>Title</label><input style={s.input} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Alert title…"/></div>
          <div style={{...s.formGroup, gridColumn:'span 2'}}><label style={s.label}>Message (optional)</label><textarea style={{...s.input, minHeight:70, resize:'vertical'}} value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} placeholder="Details…"/></div>
        </div>
        <button style={{...s.btnPrimary, marginTop:16}} disabled={saving||!form.user_id||!form.title} onClick={send}>
          {sent?'✓ Sent!':saving?'Sending…':'Send Alert'}
        </button>
      </div>
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>Recent Alerts</span></div>
        {history.length===0?<p style={s.empty}>No alerts sent.</p>:history.map(a=>(
          <div key={a.id} style={{padding:'10px 0', borderBottom:'1px solid #1e2433', display:'flex', alignItems:'center', gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontSize:'0.85rem', fontWeight:500, color:'#f1f5f9'}}>{a.title}</div>
              <div style={{fontSize:'0.72rem', color:'#64748b', marginTop:2}}>To: {modMap[a.user_id]||'Unknown'} · {fmtDate(a.sent_at)}</div>
            </div>
            <span style={{fontSize:'0.68rem', padding:'2px 8px', borderRadius:20, background:a.read?'#34d39922':'#f59e0b22', color:a.read?'#34d399':'#f59e0b'}}>{a.read?'Read':'Unread'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PageSwapManager({ adminId }) {
  const [swaps, setSwaps]   = useState([])
  const [debts, setDebts]   = useState([])
  const [mods, setMods]     = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    const [{ data:sw },{ data:db },{ data:p }] = await Promise.all([
      supabase.from('shift_swaps').select('*').order('created_at',{ascending:false}),
      supabase.from('swap_debts').select('*').order('created_at',{ascending:false}),
      supabase.from('profiles').select('id,name'),
    ])
    const map={}; (p||[]).forEach(x=>map[x.id]=x.name)
    setMods(map); setDebts(db||[])
    setSwaps(filter==='all'?sw||[]:(sw||[]).filter(s=>s.status===filter))
    setLoading(false)
  }

  async function settle(id) {
    await supabase.from('swap_debts').update({ settled:true, settled_at:new Date().toISOString() }).eq('id', id)
    load()
  }

  const statusColor = { pending:'#f59e0b', pending_admin:'#60a5fa', approved:'#34d399', declined:'#f87171' }
  const openDebts = debts.filter(d=>!d.settled)

  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>Swap Manager</h1>
      {openDebts.length>0&&(
        <div style={{...s.card, border:'1px solid #f59e0b44', background:'#f59e0b06'}}>
          <div style={s.cardHead}><span style={s.cardTitle}>⚖️ Open Swap Debts</span><span style={s.badge}>{openDebts.length}</span></div>
          {openDebts.map(d=>(
            <div key={d.id} style={{display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid #1e2433'}}>
              <div style={{flex:1}}>
                <div style={{fontSize:'0.85rem', fontWeight:500}}><strong style={{color:'#f87171'}}>{mods[d.debtor_id]}</strong> owes <strong style={{color:'#34d399'}}>{mods[d.creditor_id]}</strong> a day off</div>
                <div style={{fontSize:'0.72rem', color:'#64748b', marginTop:2}}>{fmtDate(d.swap_date)}</div>
              </div>
              <button style={s.btnSmGreen} onClick={()=>settle(d.id)}>Settle</button>
            </div>
          ))}
        </div>
      )}
      <div style={s.card}>
        <div style={s.cardHead}>
          <span style={s.cardTitle}>All Swap Requests</span>
          <div style={s.filterRow}>
            {['all','pending','pending_admin','approved','declined'].map(f=>(
              <button key={f} style={{...s.filterBtn,...(filter===f?s.filterActive:{})}} onClick={()=>setFilter(f)}>
                {f==='pending_admin'?'Awaiting Admin':f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {loading?<div style={s.empty}>Loading…</div>:swaps.length===0?<p style={s.empty}>No swaps.</p>:swaps.map(r=>(
          <div key={r.id} style={{padding:'12px 0', borderBottom:'1px solid #1e2433', display:'flex', alignItems:'center', gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontSize:'0.85rem', fontWeight:500}}>{mods[r.requester_id]} ↔ {mods[r.target_id]}</div>
              <div style={{fontSize:'0.72rem', color:'#64748b', marginTop:2}}>{fmtDate(r.swap_date)} ↔ {fmtDate(r.target_date)}</div>
            </div>
            <span style={{...s.pill, background:(statusColor[r.status]||'#94a3b8')+'22', color:statusColor[r.status]||'#94a3b8'}}>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PageVacationCalendar() {
  const [vacations, setVacations] = useState([])
  const [mods, setMods]           = useState({})
  const [month, setMonth]         = useState(new Date().getMonth())
  const [year, setYear]           = useState(new Date().getFullYear())
  const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December']

  useEffect(()=>{load()},[month,year])

  async function load() {
    const from=new Date(year,month,1).toISOString().split('T')[0], to=new Date(year,month+1,0).toISOString().split('T')[0]
    const [{data:v},{data:p}]=await Promise.all([
      supabase.from('vacation_requests').select('*').eq('status','approved').lte('start_date',to).gte('end_date',from).order('start_date'),
      supabase.from('profiles').select('id,name,avatar_url').eq('role','mod'),
    ])
    const map={}; (p||[]).forEach(x=>map[x.id]=x)
    setMods(map); setVacations(v||[])
  }

  const daysInMonth=new Date(year,month+1,0).getDate()
  const days=Array.from({length:daysInMonth},(_,i)=>i+1)
  function isOnVac(vac,day) { const d=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`; return d>=vac.start_date&&d<=vac.end_date }

  return (
    <div style={s.content}>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Vacation Calendar</h1>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <button style={s.filterBtn} onClick={()=>{const d=new Date(year,month-1,1);setMonth(d.getMonth());setYear(d.getFullYear())}}>← Prev</button>
          <span style={{fontSize:'0.9rem', fontWeight:600, color:'#f1f5f9', minWidth:140, textAlign:'center'}}>{MONTHS[month]} {year}</span>
          <button style={s.filterBtn} onClick={()=>{const d=new Date(year,month+1,1);setMonth(d.getMonth());setYear(d.getFullYear())}}>Next →</button>
        </div>
      </div>
      {vacations.length===0?<div style={s.card}><p style={s.empty}>No approved vacations this month.</p></div>:(
        <div style={s.card}>
          <div style={{overflowX:'auto'}}>
            <table style={{...s.table, minWidth:800}}>
              <thead><tr>
                <th style={{...s.th, width:130}}>Moderator</th>
                {days.map(d=>{
                  const date=new Date(year,month,d), isToday=new Date().toDateString()===date.toDateString(), isWeekend=date.getDay()===0||date.getDay()===6
                  return <th key={d} style={{...s.th, textAlign:'center', minWidth:28, padding:'0 1px 10px', color:isToday?'#60a5fa':isWeekend?'#4a5568':'#64748b', fontSize:'0.65rem'}}>{d}</th>
                })}
              </tr></thead>
              <tbody>
                {vacations.map(vac=>{
                  const mod=mods[vac.user_id]
                  return (
                    <tr key={vac.id}>
                      <td style={{...s.td, fontWeight:500, fontSize:'0.82rem', whiteSpace:'nowrap'}}>
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          {mod?.avatar_url?<img src={mod.avatar_url} alt="" style={{width:22,height:22,borderRadius:'50%',objectFit:'cover'}}/>:<div style={{width:22,height:22,borderRadius:'50%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.65rem',fontWeight:700,color:'#fff'}}>{(mod?.name||'?')[0].toUpperCase()}</div>}
                          {mod?.name||'Unknown'}
                        </div>
                      </td>
                      {days.map(d=>(
                        <td key={d} style={{padding:'4px 1px', textAlign:'center', borderBottom:'1px solid #0f1117'}}>
                          {isOnVac(vac,d)&&<div style={{width:'100%', height:8, background:'#34d39966', borderRadius:2}}/>}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}


function PageAdminLog() {
  const [logs, setLogs]   = useState([])
  const [loading, setLoading] = useState(true)
  const [mods, setMods]   = useState({})

  useEffect(()=>{load()},[])

  async function load() {
    const [{data:l},{data:p}]=await Promise.all([
      supabase.from('admin_log').select('*').order('created_at',{ascending:false}).limit(100),
      supabase.from('profiles').select('id,name'),
    ])
    const map={}; (p||[]).forEach(x=>map[x.id]=x.name)
    setMods(map); setLogs(l||[]); setLoading(false)
  }

  const actionLabel = {
    approve_vacation:'✅ Approved vacation', decline_vacation:'❌ Declined vacation',
    approve_swap:'✅ Approved swap', decline_swap:'❌ Declined swap',
    create_mod:'➕ Created mod', add_note:'📝 Added note',
    send_alert:'🔔 Sent alert', create_announcement:'📢 Created announcement',
    settle_debt:'⚖️ Settled swap debt',
  }

  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>Activity Log</h1>
      <div style={s.card}>
        {loading?<div style={s.empty}>Loading…</div>:logs.length===0?<p style={s.empty}>No activity yet.</p>:logs.map(log=>(
          <div key={log.id} style={{padding:'10px 0', borderBottom:'1px solid #1e2433', display:'flex', gap:12, alignItems:'flex-start'}}>
            <div style={{flex:1}}>
              <div style={{fontSize:'0.85rem', color:'#f1f5f9'}}>{actionLabel[log.action]||log.action}</div>
              {log.target_name&&<div style={{fontSize:'0.78rem', color:'#60a5fa', marginTop:2}}>→ {log.target_name}</div>}
              {log.details&&<div style={{fontSize:'0.75rem', color:'#64748b', marginTop:2}}>{log.details}</div>}
            </div>
            <div style={{textAlign:'right', flexShrink:0}}>
              <div style={{fontSize:'0.72rem', color:'#94a3b8'}}>{mods[log.admin_id]||'Admin'}</div>
              <div style={{fontSize:'0.68rem', color:'#4a5568', marginTop:2}}>{fmtDate(log.created_at)} {fmtTime(log.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PageApplications({ adminId }) {
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
    await logAction(adminId, `${status}_application`, id, selected?.applicant_name, null)
    setSelected(null); setAdminNote(''); load()
  }

  const typeColor = { staff:'#3b82f6', dev:'#8b5cf6' }
  const statusColor = { pending:'#f59e0b', accepted:'#34d399', declined:'#f87171' }

  return (
    <div style={s.content}>
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
                  <label style={s.label}>Admin Notes (optional)</label>
                  <textarea style={{...s.input, width:'100%', minHeight:70, resize:'vertical', marginTop:6, marginBottom:12}} value={adminNote} onChange={e=>setAdminNote(e.target.value)} placeholder="Add notes…"/>
                  <div style={{display:'flex', gap:8}}>
                    <button style={{...s.btnApprove, flex:1}} onClick={()=>decide(selected.id,'accepted')}>✓ Accept</button>
                    <button style={{...s.btnReject, flex:1}} onClick={()=>decide(selected.id,'declined')}>✕ Decline</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Applications</h1>
        <div style={s.filterRow}>
          {['pending','accepted','declined','all'].map(f=>(
            <button key={f} style={{...s.filterBtn,...(filter===f?s.filterActive:{})}} onClick={()=>setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading?<div style={s.empty}>Loading…</div>:apps.length===0?(
        <div style={s.card}><p style={s.empty}>No applications.</p></div>
      ):apps.map(a=>(
        <div key={a.id} onClick={()=>{setSelected(a);setAdminNote(a.admin_notes||'')}} style={{...s.card, cursor:'pointer', padding:'14px 18px'}}
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

function PageAttendanceReport() {
  const [data, setData]     = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth]   = useState(new Date().getMonth())
  const [year, setYear]     = useState(new Date().getFullYear())
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

  useEffect(() => { load() }, [month, year])

  async function load() {
    setLoading(true)
    const from = new Date(year, month, 1)
    const to   = new Date(year, month+1, 0)
    const workingDays = Array.from({length:to.getDate()},(_,i)=>new Date(year,month,i+1)).filter(d=>d.getDay()!==0&&d.getDay()!==6).length

    const [{ data:mods },{ data:att }] = await Promise.all([
      supabase.from('profiles').select('id,name,shift,days_off').eq('role','mod').eq('status','active'),
      supabase.from('attendance').select('user_id,clock_in,clock_out,lunch_start,lunch_end').gte('clock_in', from.toISOString()).lte('clock_in', to.toISOString()),
    ])

    const result = (mods||[]).map(mod => {
      const sessions = (att||[]).filter(a=>a.user_id===mod.id)
      const daysWorked = new Set(sessions.map(a=>new Date(a.clock_in).toDateString())).size
      const totalMins = sessions.filter(a=>a.clock_out).reduce((acc,a)=>acc+Math.round((new Date(a.clock_out)-new Date(a.clock_in))/60000),0)
      const lateSessions = sessions.filter(a=>{
        const hour = new Date(a.clock_in).getHours()
        const shiftStart = mod.shift==='Morning Shift'?9:mod.shift==='Afternoon Shift'?17:0
        return Math.abs(hour-shiftStart) > 0
      }).length
      const lunchOver = sessions.filter(a=>{
        if (!a.lunch_start||!a.lunch_end) return false
        return Math.round((new Date(a.lunch_end)-new Date(a.lunch_start))/60000) > 30
      }).length
      const daysOff = (mod.days_off||[]).length
      const expectedDays = workingDays - Math.round(workingDays/7*daysOff)
      const missingDays = Math.max(0, expectedDays - daysWorked)

      return { ...mod, daysWorked, totalMins, lateSessions, lunchOver, missingDays, expectedDays }
    })

    setData(result); setLoading(false)
  }

  return (
    <div style={s.content}>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Attendance Report</h1>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <select style={{...s.input, minWidth:130}} value={month} onChange={e=>setMonth(+e.target.value)}>
            {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
          </select>
          <select style={{...s.input, minWidth:90}} value={year} onChange={e=>setYear(+e.target.value)}>
            {[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div style={s.card}>
        {loading?<div style={s.empty}>Loading…</div>:(
          <div style={{overflowX:'auto'}}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Moderator','Shift','Days Worked','Expected','Missing','Total Hours','Late Clock-ins','Lunch Over 30m'].map(h=>(
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map(m=>(
                  <tr key={m.id}>
                    <td style={s.td}>{m.name}</td>
                    <td style={s.td}><span style={{fontSize:'0.75rem', color:'#64748b'}}>{m.shift?.replace(' Shift','')}</span></td>
                    <td style={s.td}><span style={{fontWeight:600, color:'#f1f5f9'}}>{m.daysWorked}</span></td>
                    <td style={s.td}>{m.expectedDays}</td>
                    <td style={s.td}>
                      <span style={{fontWeight:600, color:m.missingDays>0?'#f87171':'#34d399'}}>
                        {m.missingDays>0?`-${m.missingDays}`:'✓'}
                      </span>
                    </td>
                    <td style={s.td}>{formatHours(m.totalMins)}</td>
                    <td style={s.td}>
                      <span style={{color:m.lateSessions>0?'#f59e0b':'#64748b'}}>{m.lateSessions}</span>
                    </td>
                    <td style={s.td}>
                      <span style={{color:m.lunchOver>0?'#f87171':'#64748b'}}>{m.lunchOver}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


export default function AdminPanel() {
  const [profile, setProfile]         = useState(null)
  const [isAdmin, setIsAdmin]         = useState(false)
  const [page, setPage]               = useState('dashboard')
  const [onDuty, setOnDuty]           = useState([])
  const [weeklyHours, setWeeklyHours] = useState([])
  const [upcomingLeave, setUpcomingLeave] = useState([])
  const [pendingCount, setPendingCount]   = useState(0)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({data:{session}})=>{
      if(!session){window.location.href='/';return}
      init(session.user.id)
    })
  },[])

  async function init(uid) {
    const {data:prof} = await supabase.from('profiles').select('*').eq('id',uid).single()
    if(prof?.role!=='admin'){window.location.href='/dashboard';return}
    setProfile(prof); setIsAdmin(true)
    await fetchDashboard()
    setLoading(false)
  }

  const fetchDashboard = useCallback(async () => {
    const now=new Date(), {monday}=getWeekRange()
    const today=now.toISOString().split('T')[0]
    const in14=new Date(Date.now()+14*86400000).toISOString().split('T')[0]
    const [{data:duty},{data:att},{data:leave},{data:pending},{data:profs}] = await Promise.all([
      supabase.from('attendance').select('id,clock_in,status,user_id,profiles(name,role,last_seen)').is('clock_out',null).order('clock_in'),
      supabase.from('attendance').select('clock_in,clock_out,user_id').gte('clock_in',monday.toISOString()).not('clock_out','is',null),
      supabase.from('vacation_requests').select('id,start_date,end_date,user_id').eq('status','approved').gte('start_date',today).lte('start_date',in14).order('start_date'),
      supabase.from('vacation_requests').select('id').eq('status','pending'),
      supabase.from('profiles').select('id,name,role'),
    ])
    const profileMap={}; (profs||[]).forEach(p=>{profileMap[p.id]=p})
    setOnDuty((duty||[]).filter(r=>profileMap[r.user_id]?.role!=='admin').map(r=>({...r,profiles:profileMap[r.user_id]})))
    const map={}
    ;(att||[]).forEach(row=>{
      const p=profileMap[row.user_id]
      if(!p||p.role==='admin') return
      const mins=Math.round((new Date(row.clock_out)-new Date(row.clock_in))/60000)
      if(!map[p.name]) map[p.name]={name:p.name,minutes:0}
      map[p.name].minutes+=mins
    })
    setWeeklyHours(Object.values(map).sort((a,b)=>b.minutes-a.minutes))
    setUpcomingLeave((leave||[]).filter(r=>profileMap[r.user_id]?.role!=='admin').map(r=>({...r,profiles:profileMap[r.user_id]})))
    setPendingCount(pending?.length||0)
  },[])

  useEffect(()=>{
    if(!isAdmin) return
    const ch=supabase.channel('admin-duty').on('postgres_changes',{event:'*',schema:'public',table:'attendance'},fetchDashboard).subscribe()
    return ()=>supabase.removeChannel(ch)
  },[isAdmin,fetchDashboard])

  async function handleLogout(){await supabase.auth.signOut();window.location.href='/'}

  if(!isAdmin) return null

  return (
    <>
      <style>{`*{box-sizing:border-box}body{margin:0}input,select{color-scheme:dark}html,body{height:100%}#__next{height:100%}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      <Layout profile={profile} page={page} setPage={setPage} onLogout={handleLogout}>
        {loading && page==='dashboard' ? <div style={{padding:40,color:'#4a5568'}}>Loading…</div> : null}
{page==='dashboard'       && !loading && <PageDashboard onDuty={onDuty} weeklyHours={weeklyHours} upcomingLeave={upcomingLeave} pendingCount={pendingCount} adminId={profile?.id}/>}
{page==='approvals'       && <PageApprovals onCountChange={setPendingCount} adminId={profile?.id}/>}
{page==='moderators'      && <PageModerators adminId={profile?.id}/>}
{page==='applications'    && <PageApplications adminId={profile?.id}/>}
{page==='attendance'      && <PageAttendance/>}
{page==='attendancereport'&& <PageAttendanceReport/>}
{page==='shifts'          && <PageShifts/>}
{page==='calendar'        && <PageCalendar/>}
{page==='reports'         && <PageReports/>}
{page==='dailyreports'    && <PageDailyReports/>}
{page==='devreports'      && <PageDevReports/>}
{page==='hours'           && <PageHours/>}
{page==='rotating'        && <PageRotating/>}
{page==='modnotes'        && <PageModNotes adminId={profile?.id}/>}
{page==='announcements'   && <PageAnnouncements adminId={profile?.id}/>}
{page==='alertsend'       && <PageAlertSend adminId={profile?.id}/>}
{page==='swapmanager'     && <PageSwapManager adminId={profile?.id}/>}
{page==='vacationcal'     && <PageVacationCalendar/>}
{page==='adminlog'        && <PageAdminLog/>}
      </Layout>
    </>
  )
}

const s = {
  root:        {display:'flex',height:'100vh',overflow:'hidden',background:'#0f1117',color:'#e2e8f0',fontFamily:"'Inter',system-ui,sans-serif"},
  sidebar:     {width:230,background:'#0a0d14',borderRight:'1px solid #1e2433',display:'flex',flexDirection:'column',flexShrink:0,height:'100vh'},
  sideTop:     {padding:'20px 16px 12px'},
  logoRow:     {display:'flex',alignItems:'center',gap:8,marginBottom:4},
  logoIcon:    {width:30,height:30,background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:'#fff'},
  logoText:    {fontSize:'0.95rem',fontWeight:700,letterSpacing:'-0.02em',color:'#f8fafc'},
  roleLabel:   {fontSize:'0.7rem',color:'#4a5568',paddingLeft:38},
  userLabel:   {fontSize:'0.72rem',color:'#64748b',paddingLeft:38,marginTop:2},
  nav:         {padding:'8px',flex:1,overflowY:'auto'},
  navItem:     {display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:8,cursor:'pointer',fontSize:'0.83rem',color:'#94a3b8',marginBottom:2},
  navActive:   {background:'#1e2433',color:'#f1f5f9'},
  sideBottom:  {padding:'12px 8px',borderTop:'1px solid #1e2433',background:'#0a0d14',flexShrink:0},
  logoutBtn:   {display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:8,cursor:'pointer',fontSize:'0.83rem',color:'#64748b',width:'100%',background:'none',border:'none'},
  main:        {flex:1,overflow:'auto',height:'100vh'},
  content:     {padding:'32px 36px',maxWidth:1100,margin:'0 auto'},
  pageHead:    {display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24},
  pageTitle:   {fontSize:'1.3rem',fontWeight:700,margin:'0 0 24px',letterSpacing:'-0.02em',color:'#f8fafc'},
  empty:       {color:'#4a5568',fontSize:'0.85rem',padding:'12px 0'},
  card:        {background:'#141820',border:'1px solid #1e2433',borderRadius:12,padding:'20px 22px',marginBottom:20},
  cardHead:    {display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:8},
  cardTitle:   {fontSize:'0.88rem',fontWeight:600,color:'#f1f5f9'},
  statRow:     {display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:20},
  statCard:    {background:'#141820',border:'1px solid #1e2433',borderRadius:12,padding:'18px 20px',display:'flex',flexDirection:'column',gap:4},
  statNum:     {fontSize:'2rem',fontWeight:700,lineHeight:1},
  statLabel:   {fontSize:'0.7rem',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em'},
  twoCol:      {display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20},
  hoursRow:    {display:'grid',gridTemplateColumns:'130px 1fr 56px',alignItems:'center',gap:12,marginBottom:10},
  hoursName:   {fontSize:'0.8rem',color:'#94a3b8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'},
  barTrack:    {height:6,background:'#1e2433',borderRadius:99,overflow:'hidden'},
  barFill:     {height:'100%',borderRadius:99,transition:'width 0.4s ease'},
  liveChip:    {display:'flex',alignItems:'center',gap:5,fontSize:'0.62rem',fontWeight:700,letterSpacing:'0.08em',color:'#34d399',background:'rgba(52,211,153,0.08)',border:'1px solid rgba(52,211,153,0.2)',padding:'3px 8px',borderRadius:20},
  liveDot:     {width:6,height:6,borderRadius:'50%',background:'#34d399',animation:'pulse 1.8s ease-in-out infinite'},
  dot:         {width:8,height:8,borderRadius:'50%',flexShrink:0},
  dutyRow:     {display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid #1e2433'},
  chip:        {fontSize:'0.68rem',color:'#64748b',background:'#1e2433',padding:'3px 8px',borderRadius:4},
  badge:       {fontSize:'0.68rem',fontWeight:700,color:'#60a5fa',background:'#1e3a5f',padding:'3px 8px',borderRadius:4},
  pill:        {fontSize:'0.72rem',fontWeight:600,padding:'3px 10px',borderRadius:20},
  approvalBlock:{padding:'16px 0',borderBottom:'1px solid #1e2433'},
  approvalTop:  {display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12},
  approvalName: {fontSize:'0.87rem',fontWeight:500,marginBottom:4},
  approvalMeta: {fontSize:'0.75rem',color:'#64748b'},
  warnBox:     {background:'#f59e0b22',border:'1px solid #f59e0b44',color:'#f59e0b',fontSize:'0.78rem',padding:'6px 10px',borderRadius:6,marginBottom:4},
  errorBox:    {background:'#dc262622',border:'1px solid #dc262644',color:'#f87171',fontSize:'0.8rem',padding:'10px 14px',borderRadius:8,marginBottom:16},
  modAvatar:   {width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',fontWeight:700,flexShrink:0,color:'#fff'},
  table:       {width:'100%',borderCollapse:'collapse'},
  th:          {textAlign:'left',fontSize:'0.7rem',color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',paddingBottom:10,borderBottom:'1px solid #1e2433',paddingRight:16},
  td:          {padding:'11px 16px 11px 0',fontSize:'0.83rem',color:'#e2e8f0',borderBottom:'1px solid #0f1117'},
  filterRow:   {display:'flex',gap:6},
  filterBtn:   {background:'transparent',border:'1px solid #2d3748',color:'#94a3b8',borderRadius:6,padding:'6px 14px',fontSize:'0.78rem',cursor:'pointer'},
  filterActive: {background:'#1e2433',color:'#f1f5f9',borderColor:'#334155'},
  formGrid:    {display:'grid',gridTemplateColumns:'1fr 1fr',gap:16},
  formGroup:   {display:'flex',flexDirection:'column',gap:6},
  label:       {fontSize:'0.75rem',color:'#94a3b8',fontWeight:500},
  input:       {background:'#0f1117',border:'1px solid #2d3748',borderRadius:8,padding:'9px 12px',color:'#e2e8f0',fontSize:'0.85rem',outline:'none',fontFamily:'inherit'},
  btnPrimary:  {background:'#3b82f6',color:'#fff',border:'none',borderRadius:8,padding:'9px 18px',fontSize:'0.83rem',fontWeight:600,cursor:'pointer'},
  btnApprove:  {background:'#16a34a22',color:'#34d399',border:'1px solid #16a34a44',padding:'6px 14px',borderRadius:6,cursor:'pointer',fontSize:'0.78rem',fontWeight:600},
  btnReject:   {background:'#dc262622',color:'#f87171',border:'1px solid #dc262644',padding:'6px 14px',borderRadius:6,cursor:'pointer',fontSize:'0.78rem',fontWeight:600},
  btnSmGreen:  {background:'#16a34a22',color:'#34d399',border:'1px solid #16a34a44',padding:'4px 10px',borderRadius:6,cursor:'pointer',fontSize:'0.75rem',fontWeight:600},
  btnSmRed:    {background:'#dc262622',color:'#f87171',border:'1px solid #dc262644',padding:'4px 10px',borderRadius:6,cursor:'pointer',fontSize:'0.75rem',fontWeight:600},
  btnSmBlue:   {background:'#3b82f622',color:'#60a5fa',border:'1px solid #3b82f644',padding:'4px 10px',borderRadius:6,cursor:'pointer',fontSize:'0.75rem',fontWeight:600},
}