import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://vqoxhaggxgwfktuvtoyw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxb3hoYWdneGd3Zmt0dXZ0b3l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTI5ODExNCwiZXhwIjoyMDk2ODc0MTE0fQ.hq0gA0e7LeqdOUpoycN5865vs0xX3fhlG5HEvs3WDnA'
)

const Icon = {
  dash:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  check:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  swap:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  mods:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  clock:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  report: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  logout: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  shifts: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
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

function Layout({ profile, page, setPage, onLogout, children }) {
  const NAV = [
    { id:'dashboard',  label:'Dashboard',     icon:Icon.dash },
    { id:'approvals',  label:'Approvals',     icon:Icon.check },
    { id:'swaps',      label:'Shift Swaps',   icon:Icon.swap },
    { id:'moderators', label:'Moderators',    icon:Icon.mods },
    { id:'attendance', label:'Attendance',    icon:Icon.clock },
    { id:'shifts',     label:'Shift Schedule',icon:Icon.shifts },
    { id:'reports',    label:'Reports',       icon:Icon.report },
  ]
  return (
    <div style={s.root}>
      <aside style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.logoRow}>
            <div style={s.logoIcon}>M</div>
            <span style={s.logoText}>ModControl</span>
          </div>
          <div style={s.roleLabel}>Admin</div>
          <div style={s.userLabel}>· {profile?.name}</div>
        </div>
        <nav style={s.nav}>
          {NAV.map(item => (
            <div key={item.id} style={{...s.navItem,...(page===item.id?s.navActive:{})}} onClick={() => setPage(item.id)}>
              {item.icon}{item.label}
            </div>
          ))}
        </nav>
        <div style={s.sideBottom}>
          <button style={s.logoutBtn} onClick={onLogout}>{Icon.logout} Sign out</button>
        </div>
      </aside>
      <main style={s.main}>{children}</main>
    </div>
  )
}

function AdminBirthdayList() {
  const [people, setPeople] = useState([])
  useEffect(() => {
    supabase.from('profiles').select('id,name,birthday').eq('role','mod').not('birthday','is',null)
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
          <div style={s.modAvatar}>{p.name[0].toUpperCase()}</div>
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

function AdminTeamDirectory() {
  const [mods, setMods]     = useState([])
  const [search, setSearch] = useState('')
  useEffect(() => {
    supabase.from('profiles').select('id,name,full_name,nickname,shift,timezone,discord_name,telegram_name,days_off,mod_group,status').eq('role','mod').neq('status','left').order('name')
      .then(({data}) => setMods(data||[]))
  }, [])
  const SHIFT_COLOR = { 'Morning Shift':'#3b82f6','Afternoon Shift':'#8b5cf6','Night Shift':'#06b6d4' }
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  const filtered = mods.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.discord_name?.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div style={s.card}>
      <div style={s.cardHead}>
        <span style={s.cardTitle}>Team Directory</span>
        <span style={s.chip}>{mods.length} mods</span>
      </div>
      <input style={{...s.input, marginBottom:16, width:'100%'}} placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
      {filtered.map(m => {
        const shiftColor = SHIFT_COLOR[m.shift] || '#94a3b8'
        const daysOff = m.days_off || []
        return (
          <div key={m.id} style={{padding:'12px 0', borderBottom:'1px solid #1e2433'}}>
            <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
              <div style={s.modAvatar}>{m.name[0].toUpperCase()}</div>
              <div style={{flex:1, minWidth:140}}>
                <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
                  <span style={{fontSize:'0.87rem', fontWeight:600}}>{m.name}</span>
                  {m.nickname && <span style={{fontSize:'0.72rem', color:'#64748b'}}>"{m.nickname}"</span>}
                  {m.mod_group==='russian' && <span style={{fontSize:'0.6rem', background:'#f59e0b22', color:'#f59e0b', padding:'1px 5px', borderRadius:3, fontWeight:700}}>RU</span>}
                  {m.shift && <span style={{fontSize:'0.68rem', background:shiftColor+'22', color:shiftColor, padding:'2px 8px', borderRadius:4, fontWeight:600}}>{m.shift}</span>}
                  {m.timezone && <span style={{fontSize:'0.68rem', color:'#64748b'}}>🌍 {m.timezone}</span>}
                </div>
                {m.full_name && <div style={{fontSize:'0.72rem', color:'#64748b', marginTop:2}}>{m.full_name}</div>}
                <div style={{display:'flex', gap:12, marginTop:4, flexWrap:'wrap'}}>
                  {m.discord_name && <span style={{display:'flex', alignItems:'center', gap:4, fontSize:'0.72rem', color:'#94a3b8'}}><DiscordIcon/>{m.discord_name}</span>}
                  {m.telegram_name && <span style={{display:'flex', alignItems:'center', gap:4, fontSize:'0.72rem', color:'#94a3b8'}}><TelegramIcon/>{m.telegram_name}</span>}
                </div>
              </div>
              <div style={{display:'flex', gap:4, flexWrap:'wrap'}}>
                {DAYS.map(d => (
                  <div key={d} style={{fontSize:'0.6rem', fontWeight:700, padding:'3px 5px', borderRadius:4, background: daysOff.includes(d)?'#f8717115':shiftColor+'15', color: daysOff.includes(d)?'#f87171':shiftColor, textTransform:'uppercase'}}>
                    {d.slice(0,2)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
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
          {onDuty.length === 0 ? <p style={s.empty}>No moderators on duty.</p> : onDuty.map(r => (
            <div key={r.id} style={s.dutyRow}>
              <span style={{...s.dot, background: r.status==='lunch'?'#f59e0b':'#34d399'}}/>
              <span style={{flex:1, fontSize:'0.85rem'}}>{r.profiles?.name}</span>
              <span style={{fontSize:'0.72rem', color:'#64748b'}}>{r.status==='lunch'?'Lunch':'Working'} · since {fmtTime(r.clock_in)}</span>
            </div>
          ))}
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
        <div style={s.cardHead}><span style={s.cardTitle}>Weekly Hours</span><span style={s.chip}>Target: 40h</span></div>
        {weeklyHours.length === 0 ? <p style={s.empty}>No records this week.</p> : weeklyHours.map(mod => {
          const pct = Math.min(100, Math.round((mod.minutes/(40*60))*100))
          const over = mod.minutes > 40*60
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
      <AdminTeamDirectory />
    </div>
  )
}

function PageApprovals({ onCountChange }) {
  const [vacations, setVacations] = useState([])
  const [swaps, setSwaps]         = useState([])
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
    setSwaps(body.swaps || [])
    onCountChange?.((body.vacations||[]).length + (body.swaps||[]).length)
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

  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>Approvals</h1>
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>Vacation Requests</span><span style={s.badge}>{vacations.length}</span></div>
        {vacations.length === 0 ? <p style={s.empty}>No pending vacation requests.</p> : vacations.map(r => {
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
        })}
      </div>
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>Shift Swap Requests</span><span style={s.badge}>{swaps.length}</span></div>
        {swaps.length === 0 ? <p style={s.empty}>No pending swap approvals.</p> : swaps.map(r => {
          const requester = profiles[r.requester_id]
          const target    = profiles[r.target_id]
          return (
            <div key={r.id} style={s.approvalBlock}>
              <div style={s.approvalTop}>
                <div>
                  <div style={s.approvalName}>{requester?.name} ↔ {target?.name}</div>
                  <div style={s.approvalMeta}>{requester?.shift} ↔ {target?.shift} · {fmtDate(r.swap_date)}</div>
                  {r.notes && <div style={{fontSize:'0.78rem', color:'#94a3b8', marginTop:4}}>{r.notes}</div>}
                </div>
                <div style={{display:'flex', gap:8}}>
                  <button style={s.btnApprove} onClick={() => decideSwap(r.id,'approved')}>Approve</button>
                  <button style={s.btnReject}  onClick={() => decideSwap(r.id,'declined')}>Decline</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PageSwaps() {
  const [swaps, setSwaps]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  useEffect(() => { load() }, [filter])

  async function load() {
    let q = supabase.from('shift_swaps').select('id,requester_id,target_id,swap_date,status,notes,requester:profiles!requester_id(name,shift),target:profiles!target_id(name,shift)').order('created_at',{ascending:false})
    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q
    setSwaps(data || [])
    setLoading(false)
  }

  const statusCol = { pending:'#f59e0b', pending_admin:'#60a5fa', approved:'#34d399', declined:'#f87171' }

  return (
    <div style={s.content}>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Shift Swaps</h1>
        <div style={s.filterRow}>
          {['all','pending','approved','declined'].map(f => (
            <button key={f} style={{...s.filterBtn,...(filter===f?s.filterActive:{})}} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div style={s.card}>
        {loading ? <div style={s.empty}>Loading…</div> : swaps.length === 0 ? <p style={s.empty}>No swap requests.</p> : swaps.map(r => (
          <div key={r.id} style={s.dutyRow}>
            <div style={{flex:1}}>
              <div style={{fontSize:'0.85rem', fontWeight:500}}>{r.requester?.name} ↔ {r.target?.name}</div>
              <div style={{fontSize:'0.75rem', color:'#64748b'}}>{r.requester?.shift} ↔ {r.target?.shift} · {fmtDate(r.swap_date)}</div>
            </div>
            <span style={{...s.pill, background:(statusCol[r.status]||'#94a3b8')+'22', color:statusCol[r.status]||'#94a3b8'}}>{r.status}</span>
          </div>
        ))}
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
          <div style={s.modAvatar}>{(m.name||'?')[0].toUpperCase()}</div>
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
    const { data } = await supabase.from('profiles').select('id,name,shift,status,days_off,mod_group').eq('role','mod').order('name')
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
    const daysOff = mod.days_off || []
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
          <div style={{display:'flex', gap:16, flexWrap:'wrap', marginTop:4}}>
            {Object.entries(SHIFT_COLOR).map(([shift,color])=>(
              <div key={shift} style={{display:'flex', alignItems:'center', gap:6}}>
                <div style={{width:10,height:10,borderRadius:2,background:color}}/>
                <span style={{fontSize:'0.72rem',color:'#94a3b8'}}>{shift}</span>
              </div>
            ))}
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <div style={{width:10,height:10,borderRadius:2,background:'#f87171'}}/>
              <span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Day Off</span>
            </div>
          </div>
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
                  const diff=r.minutes-(40*60)
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
      supabase.from('attendance').select('id,clock_in,status,user_id').is('clock_out',null).order('clock_in'),
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
      <style>{`*{box-sizing:border-box}body{margin:0}input,select{color-scheme:dark}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      <Layout profile={profile} page={page} setPage={setPage} onLogout={handleLogout}>
        {loading && page==='dashboard' ? <div style={{padding:40,color:'#4a5568'}}>Loading…</div> : null}
        {page==='dashboard'  && !loading && <PageDashboard onDuty={onDuty} weeklyHours={weeklyHours} upcomingLeave={upcomingLeave} pendingCount={pendingCount}/>}
        {page==='approvals'  && <PageApprovals onCountChange={setPendingCount}/>}
        {page==='swaps'      && <PageSwaps/>}
        {page==='moderators' && <PageModerators/>}
        {page==='attendance' && <PageAttendance/>}
        {page==='shifts'     && <PageShifts/>}
        {page==='reports'    && <PageReports/>}
      </Layout>
    </>
  )
}

const s = {
  root:        {display:'flex',minHeight:'100vh',background:'#0f1117',color:'#e2e8f0',fontFamily:"'Inter',system-ui,sans-serif"},
  sidebar:     {width:230,background:'#0a0d14',borderRight:'1px solid #1e2433',display:'flex',flexDirection:'column',flexShrink:0,position:'sticky',top:0,height:'100vh'},
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
  main:        {flex:1,overflow:'auto'},
  content:     {padding:'32px 36px',maxWidth:1100,margin:'0 auto'},
  pageHead:    {display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24},
  pageTitle:   {fontSize:'1.3rem',fontWeight:700,margin:'0 0 24px',letterSpacing:'-0.02em',color:'#f8fafc'},
  empty:       {color:'#4a5568',fontSize:'0.85rem',padding:'12px 0'},
  card:        {background:'#141820',border:'1px solid #1e2433',borderRadius:12,padding:'20px 22px',marginBottom:20},
  cardHead:    {display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16},
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