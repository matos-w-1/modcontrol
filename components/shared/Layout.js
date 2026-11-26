import { Icon } from '../../lib/icons'
import { fmtDate } from '../../lib/utils'
import { s } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { filterAdminNav, filterModNav } from '../../lib/permissions'

export function Layout({ profile, page, setPage, onLogout, children }) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showInbox, setShowInbox]       = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread]               = useState(0)
  const [settings, setSettings]           = useState({
    theme:'dark', fontSize:'medium', language:'english',
    notifSwaps:true, notifVacations:true, notifBirthdays:true, notifSound:false,
    showDirectory:true, showBirthdays:true,
    showDiscord:true, showTelegram:true, showBirthday:true,
  })
  const [userStatus, setUserStatus]       = useState(profile?.user_status || 'online')
  const [savingSettings, setSavingSettings] = useState(false)

  const isAdmin = profile?.role === 'admin'

  const [showMoreNav, setShowMoreNav] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('modcontrol_admin_nav_expanded') === 'true'
  })

  function toggleMoreNav() {
    setShowMoreNav(v => {
      const next = !v
      if (typeof window !== 'undefined') localStorage.setItem('modcontrol_admin_nav_expanded', String(next))
      return next
    })
  }

  const CORE_ADMIN_GROUPS = ['Menu']

  const adminNavFiltered = filterAdminNav(profile).map(g => ({ ...g, items: g.items.map(i => ({ ...i, icon: Icon[i.icon] })) }))
  const adminCoreGroups = adminNavFiltered.filter(g => CORE_ADMIN_GROUPS.includes(g.label))
  const adminMoreGroups = adminNavFiltered.filter(g => !CORE_ADMIN_GROUPS.includes(g.label))
  const adminExtraGroups = []

  const NAV_GROUPS = isAdmin
    ? [...adminCoreGroups, ...(showMoreNav ? adminMoreGroups : []), ...adminExtraGroups]
    : filterModNav(profile).map(g => ({ ...g, items: g.items.map(i => ({ ...i, icon: Icon[i.icon] })) }))

  const hasAnyNav = isAdmin
    ? (adminCoreGroups.length + adminMoreGroups.length + adminExtraGroups.length) > 0
    : NAV_GROUPS.length > 0

  const THEMES = [
    { id:'dark',     label:'Dark',     bg:'#0f1117', accent:'#3b82f6' },
    { id:'midnight', label:'Midnight', bg:'#0a0a1a', accent:'#8b5cf6' },
    { id:'forest',   label:'Forest',   bg:'#0a1a0f', accent:'#34d399' },
    { id:'ocean',    label:'Ocean',    bg:'#0a1520', accent:'#06b6d4' },
  ]

  useEffect(() => {
    if (!profile?.id) return
    loadSettings()
    if (!isAdmin) loadNotifications()
  }, [profile?.id])

  async function loadSettings() {
    const { data } = await supabase.from('profiles').select('settings').eq('id', profile.id).single()
    if (data?.settings && Object.keys(data.settings).length > 0) {
      setSettings(s => ({...s, ...data.settings}))
    }
  }

  async function loadNotifications() {
  const readIds = JSON.parse(localStorage.getItem('readNotifIds') || '[]')

  const [{ data:swaps }, { data:vacs }, { data:bdays }, { data:modAlerts }] = await Promise.all([
  supabase.from('shift_swaps').select('id,requester_id,swap_date,target_date,requester:profiles!requester_id(name)').eq('target_id', profile.id).eq('status','pending'),
  supabase.from('vacation_requests').select('id,start_date,end_date,status,reviewed_at').eq('user_id', profile.id).in('status',['approved','declined']).gte('reviewed_at', new Date(Date.now()-7*86400000).toISOString()),
  supabase.from('profiles').select('id,name,birthday').eq('role','mod').neq('status','left').not('birthday','is',null),
  supabase.from('mod_alerts').select('*').eq('user_id', profile.id).eq('read', false),
])
  const notifs = []
  ;(swaps||[]).forEach(sw => {
    notifs.push({ id:`swap-${sw.id}`, type:'swap', icon:'🔄', title:`${sw.requester?.name} wants to swap`, body:`They give ${fmtDate(sw.swap_date)}, you give ${fmtDate(sw.target_date)}`, color:'#60a5fa', action:()=>{ setPage('swaps'); setShowInbox(false) } })
  })
  ;(vacs||[]).forEach(v => {
    const isApproved = v.status==='approved'
    notifs.push({ id:`vac-${v.id}`, type:'vacation', icon:isApproved?'✅':'❌', title:`Vacation ${v.status}`, body:`${fmtDate(v.start_date)} → ${fmtDate(v.end_date)}`, color:isApproved?'#34d399':'#f87171', action:()=>{ setPage('vacation'); setShowInbox(false) } })
  })
  const today = new Date(); today.setHours(0,0,0,0)
  ;(bdays||[]).filter(p=>p.id!==profile.id).forEach(p => {
    const bday = new Date(p.birthday)
    const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
    if (next < today) next.setFullYear(today.getFullYear()+1)
    const days = Math.ceil((next-today)/86400000)
    if (days <= 1) notifs.push({ id:`bday-${p.id}`, type:'birthday', icon:'🎂', title:days===0?`🎉 ${p.name}'s birthday today!`:`${p.name}'s birthday tomorrow!`, body:days===0?'Wish them a happy birthday!':'Don\'t forget!', color:'#f59e0b', action:()=>setShowInbox(false) })
  })
;(modAlerts||[]).forEach(a => {
  notifs.push({ id:`alert-${a.id}`, type:'alert', icon:'🔔', title:a.title, body:a.body||'', color:'#f87171', action: async ()=>{ await supabase.from('mod_alerts').update({read:true}).eq('id',a.id); setShowInbox(false) } })
})
  setNotifications(notifs)
  setUnread(notifs.filter(n => !readIds.includes(n.id)).length)
}

  async function saveSettings(newSettings) {
    setSavingSettings(true)
    await supabase.from('profiles').update({ settings: newSettings }).eq('id', profile.id)
    setSavingSettings(false)
  }

  function updateSetting(key, val) {
    const newSettings = {...settings, [key]: val}
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  return (
    <div style={s.root}>
      <aside style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div>
              <span style={{fontSize:'1.1rem', fontWeight:800, color:'#f8fafc', letterSpacing:'-0.02em', cursor:'pointer'}} onClick={()=>setPage(isAdmin?'dashboard':'home')}>ROLLTWO</span>
              <div style={{fontSize:'0.68rem', color:'#4a5568', marginTop:1, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:600}}>{isAdmin ? 'Admin Panel' : 'Mod Control'}</div>
            </div>
            {!isAdmin && (
            <div style={{position:'relative', cursor:'pointer', padding:6, borderRadius:8}}
              onClick={()=>{ setShowInbox(i=>!i); setShowSettings(false); setShowUserMenu(false) }}
              onMouseEnter={e=>e.currentTarget.style.background='#1a1f2e'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <svg width="16" height="16" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {unread > 0 && <span style={{position:'absolute', top:2, right:2, width:14, height:14, borderRadius:'50%', background:'#f87171', fontSize:'0.55rem', fontWeight:700, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'}}>{unread}</span>}
            </div>
            )}
          </div>
        </div>

        <nav style={s.nav}>
          {isAdmin ? (
            <>
              {adminCoreGroups.map(group => (
                <div key={group.label} style={{marginBottom:8}}>
                  <div style={{fontSize:'0.62rem', fontWeight:700, color:'#2d3748', textTransform:'uppercase', letterSpacing:'0.1em', padding:'8px 12px 4px'}}>
                    {group.label}
                  </div>
                  {group.items.map(item => (
                    <div key={item.id} style={{...s.navItem,...(page===item.id?s.navActive:{})}} onClick={() => setPage(item.id)}>
                      {item.icon}{item.label}
                    </div>
                  ))}
                </div>
              ))}
              {adminMoreGroups.length > 0 && (
                <div style={{...s.navItem, color:'#64748b', fontWeight:600, justifyContent:'center', gap:6}} onClick={toggleMoreNav}>
                  {showMoreNav ? Icon.up : Icon.down}
                  {showMoreNav ? 'Less' : 'More'}
                </div>
              )}
              {showMoreNav && adminMoreGroups.map(group => (
                <div key={group.label} style={{marginBottom:8, marginTop:8}}>
                  <div style={{fontSize:'0.62rem', fontWeight:700, color:'#2d3748', textTransform:'uppercase', letterSpacing:'0.1em', padding:'8px 12px 4px'}}>
                    {group.label}
                  </div>
                  {group.items.map(item => (
                    <div key={item.id} style={{...s.navItem,...(page===item.id?s.navActive:{})}} onClick={() => setPage(item.id)}>
                      {item.icon}{item.label}
                    </div>
                  ))}
                </div>
              ))}
              {adminExtraGroups.map(group => (
                <div key={group.label} style={{marginBottom:8, marginTop:8}}>
                  <div style={{fontSize:'0.62rem', fontWeight:700, color:'#2d3748', textTransform:'uppercase', letterSpacing:'0.1em', padding:'8px 12px 4px'}}>
                    {group.label}
                  </div>
                  {group.items.map(item => (
                    <div key={item.id} style={{...s.navItem,...(page===item.id?s.navActive:{})}} onClick={() => setPage(item.id)}>
                      {item.icon}{item.label}
                    </div>
                  ))}
                </div>
              ))}
            </>
          ) : (
            NAV_GROUPS.map(group => (
              <div key={group.label} style={{marginBottom:8}}>
                <div style={{fontSize:'0.62rem', fontWeight:700, color:'#2d3748', textTransform:'uppercase', letterSpacing:'0.1em', padding:'8px 12px 4px'}}>
                  {group.label}
                </div>
                {group.items.map(item => (
                  <div key={item.id} style={{...s.navItem,...(page===item.id?s.navActive:{})}} onClick={() => setPage(item.id)}>
                    {item.icon}{item.label}
                  </div>
                ))}
              </div>
            ))
          )}
          {!hasAnyNav && (
            <div style={{padding:'12px', fontSize:'0.78rem', color:'#4a5568'}}>No sections assigned yet. Ask a super-admin to grant you access.</div>
          )}
        </nav>

        <div style={{padding:'8px', borderTop:'1px solid #1e2433', position:'relative'}}>
          {showUserMenu && (
            <div style={{position:'absolute', bottom:'100%', left:8, right:8, background:'#1a1f2e', border:'1px solid #2d3748', borderRadius:10, padding:6, marginBottom:4, zIndex:100}}>
              <div style={{padding:'6px 10px 8px', borderBottom:'1px solid #1e2433', marginBottom:4}}>
                <div style={{fontSize:'0.82rem', fontWeight:600, color:'#f1f5f9'}}>{profile?.name}</div>
                <div style={{fontSize:'0.7rem', color:'#4a5568', marginTop:1}}>{isAdmin ? 'Administrator' : (profile?.shift||'—')}</div>
              </div>
              {[
                { label:'My Profile', icon:'👤', action:()=>{ setPage(isAdmin?'adminprofile':'profile'); setShowUserMenu(false) } },
                ...(!isAdmin ? [{ label:'Settings',   icon:'⚙️', action:()=>{ setShowSettings(true); setShowUserMenu(false) } }] : []),
                { label:'Help', icon:'❓', action:()=>{ window.open('https://t.me/matos_w', '_blank'); setShowUserMenu(false) } },
                { label:'Sign Out', icon:'🚪', action:onLogout, danger:true },
              ].map(item => (
                <div key={item.label} onClick={item.action}
                  style={{display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:6, cursor:'pointer', fontSize:'0.82rem', color:item.danger?'#f87171':'#94a3b8'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#0f1117'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <span>{item.icon}</span>{item.label}
                </div>
              ))}
            </div>
          )}
          <div style={{display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, cursor:'pointer', background:showUserMenu?'#1e2433':'transparent'}}
            onClick={()=>{ setShowUserMenu(m=>!m); setShowInbox(false); setShowSettings(false) }}
            onMouseEnter={e=>{ if(!showUserMenu) e.currentTarget.style.background='#1a1f2e' }}
            onMouseLeave={e=>{ if(!showUserMenu) e.currentTarget.style.background='transparent' }}>
            <div style={{position:'relative', flexShrink:0}}>
  {profile?.avatar_url ? (
    <img src={profile.avatar_url} alt="avatar" style={{width:30, height:30, borderRadius:'50%', objectFit:'cover'}}/>
  ) : (
    <div style={{width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:700, color:'#fff'}}>
      {(profile?.name||'?')[0].toUpperCase()}
    </div>
  )}
  <div style={{position:'absolute', bottom:0, right:0, width:9, height:9, borderRadius:'50%', background: userStatus==='online'?'#34d399':userStatus==='busy'?'#f59e0b':userStatus==='dnd'?'#f87171':'#64748b', border:'2px solid #0a0d14'}}/>
</div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:'0.8rem', fontWeight:600, color:'#f1f5f9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{profile?.name}</div>
              <div style={{fontSize:'0.68rem', color:'#4a5568'}}>{isAdmin ? 'Administrator' : 'Moderator'}</div>
            </div>
            <span style={{fontSize:'0.6rem', color:'#4a5568'}}>{showUserMenu?'▲':'▼'}</span>
          </div>
        </div>
      </aside>

      <main style={s.main}>
        {children}
      </main>

      {/* Inbox Panel */}
      {showInbox && (
        <div style={{position:'fixed', right:0, top:0, width:320, height:'100vh', background:'#0f1117', borderLeft:'1px solid #1e2433', zIndex:50, display:'flex', flexDirection:'column'}}>
          <div style={{padding:'16px 20px', borderBottom:'1px solid #1e2433', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:'0.9rem', fontWeight:700, color:'#f1f5f9'}}>🔔 Notifications</div>
              <div style={{fontSize:'0.7rem', color:'#4a5568', marginTop:2}}>{unread} unread</div>
            </div>
            <span style={{color:'#4a5568', cursor:'pointer', fontSize:'1rem', padding:4}} onClick={()=>setShowInbox(false)}>✕</span>
          </div>
          <div style={{flex:1, overflowY:'auto'}}>
            {notifications.length === 0 ? (
              <div style={{padding:24, textAlign:'center'}}>
                <div style={{fontSize:'1.5rem', marginBottom:8}}>🔕</div>
                <div style={{color:'#4a5568', fontSize:'0.85rem'}}>All caught up!</div>
              </div>
            ) : notifications.map(n => (
              <div key={n.id} onClick={n.action} style={{padding:'14px 20px', borderBottom:'1px solid #1e2433', cursor:'pointer', display:'flex', gap:12, alignItems:'flex-start'}}
                onMouseEnter={e=>e.currentTarget.style.background='#141820'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{width:36, height:36, borderRadius:10, background:n.color+'18', border:`1px solid ${n.color}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0}}>
                  {n.icon}
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:'0.82rem', fontWeight:600, color:'#f1f5f9', marginBottom:3}}>{n.title}</div>
                  <div style={{fontSize:'0.75rem', color:'#64748b', lineHeight:1.4}}>{n.body}</div>
                </div>
                <div style={{width:6, height:6, borderRadius:'50%', background:n.color, flexShrink:0, marginTop:6}}/>
              </div>
            ))}
          </div>
          {notifications.length > 0 && (
            <div style={{padding:'12px 20px', borderTop:'1px solid #1e2433'}}>
             <button style={{width:'100%', background:'transparent', border:'1px solid #2d3748', color:'#64748b', padding:'8px', borderRadius:8, cursor:'pointer', fontSize:'0.78rem'}} onClick={()=>{ setUnread(0); setShowInbox(false) }}>
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
  <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20}} onClick={()=>setShowSettings(false)}>
    <div style={{background:'#141820', border:'1px solid #1e2433', borderRadius:16, width:'100%', maxWidth:400, maxHeight:'85vh', overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
      <div style={{padding:'20px 24px 16px', borderBottom:'1px solid #1e2433', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <span style={{fontSize:'0.95rem', fontWeight:700, color:'#f1f5f9'}}>⚙️ Settings</span>
        <span style={{color:'#4a5568', cursor:'pointer', fontSize:'1rem'}} onClick={()=>setShowSettings(false)}>✕</span>
      </div>
      <div style={{padding:24, display:'flex', flexDirection:'column', gap:20}}>

        <div>
          <div style={{fontSize:'0.72rem', color:'#4a5568', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10}}>Theme</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
            {THEMES.map(t => (
              <div key={t.id} onClick={()=>updateSetting('theme',t.id)} style={{padding:'10px 12px', borderRadius:8, cursor:'pointer', border:`1px solid ${settings.theme===t.id?t.accent:'#2d3748'}`, background:settings.theme===t.id?t.accent+'22':'#0f1117', display:'flex', alignItems:'center', gap:8}}>
                <div style={{width:14, height:14, borderRadius:3, background:t.bg, border:`2px solid ${t.accent}`}}/>
                <span style={{fontSize:'0.78rem', color:settings.theme===t.id?t.accent:'#94a3b8', fontWeight:settings.theme===t.id?600:400}}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{fontSize:'0.72rem', color:'#4a5568', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10}}>Font Size</div>
          <div style={{display:'flex', gap:8}}>
            {['small','medium','large'].map(size => (
              <div key={size} onClick={()=>updateSetting('fontSize',size)} style={{flex:1, padding:'8px', borderRadius:8, cursor:'pointer', border:`1px solid ${settings.fontSize===size?'#3b82f6':'#2d3748'}`, background:settings.fontSize===size?'#3b82f622':'#0f1117', textAlign:'center', fontSize:'0.78rem', color:settings.fontSize===size?'#60a5fa':'#94a3b8', fontWeight:settings.fontSize===size?600:400}}>
                {size.charAt(0).toUpperCase()+size.slice(1)}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{fontSize:'0.72rem', color:'#4a5568', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10}}>Language</div>
          <div style={{display:'flex', gap:8}}>
            {[['english','🇬🇧 English'],['portuguese','🇵🇹 PT'],['russian','🇷🇺 RU']].map(([lang,label]) => (
              <div key={lang} onClick={()=>updateSetting('language',lang)} style={{flex:1, padding:'8px', borderRadius:8, cursor:'pointer', border:`1px solid ${settings.language===lang?'#3b82f6':'#2d3748'}`, background:settings.language===lang?'#3b82f622':'#0f1117', textAlign:'center', fontSize:'0.72rem', color:settings.language===lang?'#60a5fa':'#94a3b8', fontWeight:settings.language===lang?600:400}}>
                {label}
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
 </div>
      )}
    </div>
  )
}
