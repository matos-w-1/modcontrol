import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  home:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  clock:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  palm:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  swap:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  user:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  cake:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><line x1="2" y1="21" x2="22" y2="21"/><path d="M12 15V7"/><path d="M8 7V5c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v2"/><circle cx="12" cy="4" r="1" fill="currentColor"/></svg>,
  logout:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  check:   <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  up:      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="5 12 12 5 19 12"/><line x1="12" y1="5" x2="12" y2="19"/></svg>,
  down:    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="19 12 12 19 5 12"/><line x1="12" y1="5" x2="12" y2="19"/></svg>,
  food:    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  back:    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
function elapsed(from) {
  if (!from) return '—'
  const mins = Math.floor((Date.now() - new Date(from)) / 60000)
  const h = Math.floor(mins / 60), m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0)
  const target = new Date(dateStr); target.setHours(0,0,0,0)
  return Math.ceil((target - today) / 86400000)
}
function businessDays(start, end) {
  let count = 0, cur = new Date(start)
  const last = new Date(end)
  while (cur <= last) {
    const d = cur.getDay()
    if (d !== 0 && d !== 6) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

// ─── Shared sidebar layout ────────────────────────────────────────────────────
function Layout({ profile, page, setPage, onLogout, children }) {
  const NAV = [
    { id: 'home',       label: 'Dashboard',        icon: Icon.home },
    { id: 'attendance', label: 'My Attendance',     icon: Icon.clock },
    { id: 'vacation',   label: 'Vacation Requests', icon: Icon.palm },
    { id: 'swaps',      label: 'Shift Swaps',       icon: Icon.swap },
    { id: 'profile',    label: 'My Profile',        icon: Icon.user },
  ]

  return (
    <div style={s.root}>
      <aside style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.logoRow}>
            <div style={s.logoIcon}>M</div>
            <span style={s.logoText}>ModControl</span>
          </div>
          <div style={s.roleLabel}>Moderator</div>
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


{/* Birthdays */}
<BirthdayCard />
function BirthdayCard() {
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
        }).sort((a,b) => a.daysUntil - b.daysUntil).slice(0,5)
        setPeople(enriched)
      })
  }, [])

  const todays = people.filter(p => p.daysUntil === 0)

  return (
    <div style={s.card}>
      <div style={s.cardHead}>
        <span style={s.cardTitle}>🎂 Upcoming Birthdays</span>
        <span style={s.chip}>Next 30 days</span>
      </div>
      {people.length === 0
        ? <p style={s.empty}>No birthdays coming up.</p>
        : people.map(p => (
          <div key={p.id} style={{display:'flex', alignItems:'center', gap:12, padding:'8px 0', borderBottom:'1px solid #1e2433'}}>
            <div style={{width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:700, flexShrink:0}}>
              {p.name[0].toUpperCase()}
            </div>
            <span style={{flex:1, fontSize:'0.85rem', fontWeight:500}}>{p.name}</span>
            <span style={{fontSize:'0.75rem', color:'#64748b'}}>
              {p.nextBirthday.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
            </span>
            <span style={{
              fontSize:'0.72rem', fontWeight:600, padding:'3px 10px', borderRadius:20,
              background: p.daysUntil===0 ? '#f59e0b22' : '#3b82f622',
              color: p.daysUntil===0 ? '#f59e0b' : '#60a5fa',
            }}>
              {p.daysUntil===0 ? '🎉 Today!' : p.daysUntil===1 ? 'Tomorrow' : `In ${p.daysUntil} days`}
            </span>
          </div>
        ))
      }
    </div>
  )
}
function TeamDirectory() {
  const [mods, setMods] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('profiles')
      .select('id,name,full_name,nickname,shift,timezone,discord_name,telegram_name,days_off,mod_group,status')
      .eq('role','mod')
      .eq('status','active')
      .order('name')
      .then(({data}) => setMods(data||[]))
  }, [])

  const SHIFT_COLOR = { 'Morning Shift':'#3b82f6','Afternoon Shift':'#8b5cf6','Night Shift':'#06b6d4' }

  const filtered = mods.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.discord_name?.toLowerCase().includes(search.toLowerCase())
  )

  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

  return (
    <div style={s.card}>
      <div style={s.cardHead}>
        <span style={s.cardTitle}>Team Directory</span>
        <span style={s.chip}>{mods.length} mods</span>
      </div>
      <input
        style={{...s.input, marginBottom:16, width:'100%'}}
        placeholder="Search by name or discord…"
        value={search}
        onChange={e=>setSearch(e.target.value)}
      />
      {filtered.map(m => {
        const shiftColor = SHIFT_COLOR[m.shift] || '#94a3b8'
        const daysOff = m.days_off || []
        const workDays = DAYS.filter(d => !daysOff.includes(d))
        return (
          <div key={m.id} style={{padding:'14px 0', borderBottom:'1px solid #1e2433'}}>
            <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
              <div style={{width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', fontWeight:700, flexShrink:0, color:'#fff'}}>
                {m.name[0].toUpperCase()}
              </div>
              <div style={{flex:1, minWidth:140}}>
                <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
                  <span style={{fontSize:'0.87rem', fontWeight:600, color:'#f1f5f9'}}>{m.name}</span>
                  {m.nickname && <span style={{fontSize:'0.72rem', color:'#64748b'}}>"{m.nickname}"</span>}
                  {m.mod_group === 'russian' && <span style={{fontSize:'0.6rem', background:'#f59e0b22', color:'#f59e0b', padding:'1px 5px', borderRadius:3, fontWeight:700}}>RU</span>}
                  {m.shift && <span style={{fontSize:'0.68rem', background:shiftColor+'22', color:shiftColor, padding:'2px 8px', borderRadius:4, fontWeight:600}}>{m.shift}</span>}
                  {m.timezone && <span style={{fontSize:'0.68rem', color:'#64748b'}}>🌍 {m.timezone}</span>}
                </div>
                {m.full_name && <div style={{fontSize:'0.72rem', color:'#64748b', marginTop:2}}>{m.full_name}</div>}
                <div style={{display:'flex', gap:12, marginTop:4, flexWrap:'wrap'}}>
                  {m.discord_name && (
                    <span style={{display:'flex', alignItems:'center', gap:4, fontSize:'0.72rem', color:'#94a3b8'}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                      {m.discord_name}
                    </span>
                  )}
                  {m.telegram_name && (
                    <span style={{display:'flex', alignItems:'center', gap:4, fontSize:'0.72rem', color:'#94a3b8'}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#26A5E4"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                      {m.telegram_name}
                    </span>
                  )}
                </div>
              </div>
              <div style={{display:'flex', gap:4, flexWrap:'wrap'}}>
                {DAYS.map(d => (
                  <div key={d} style={{
                    fontSize:'0.6rem', fontWeight:700, padding:'3px 5px', borderRadius:4,
                    background: daysOff.includes(d) ? '#f8717115' : shiftColor+'15',
                    color: daysOff.includes(d) ? '#f87171' : shiftColor,
                    textTransform:'uppercase',
                  }}>
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

// ─── Page: Dashboard ──────────────────────────────────────────────────────────
function PageHome({ profile, attendance, onAction, busy, error }) {
  const isClockedIn = !!attendance && !attendance.clock_out
  const isOnLunch   = isClockedIn && !!attendance.lunch_start && !attendance.lunch_end

  const shiftTimes = {
    'Night Shift':      '00:00 – 09:00',
    'Morning Shift':    '09:00 – 17:00',
    'Afternoon Shift':  '17:00 – 00:00',
  }

  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>Dashboard</h1>

      {/* Today's shift card */}
      <div style={s.card}>
        <div style={s.cardHead}>
          <span style={s.cardTitle}>Today's Shift</span>
          <span style={{
            ...s.statusBadge,
            background: !isClockedIn ? '#1e2433' : isOnLunch ? '#f59e0b22' : '#34d39922',
            color:      !isClockedIn ? '#4a5568'  : isOnLunch ? '#f59e0b'   : '#34d399',
            border:     `1px solid ${!isClockedIn ? '#2d3748' : isOnLunch ? '#f59e0b44' : '#34d39944'}`,
          }}>
            {!isClockedIn ? 'Offline' : isOnLunch ? 'On Lunch' : 'Working'}
          </span>
        </div>

        <div style={s.shiftGrid}>
          <div style={s.shiftItem}>
            <div style={s.shiftLabel}>Shift Type</div>
            <div style={s.shiftValue}>{profile?.shift || '—'}</div>
          </div>
          <div style={s.shiftItem}>
            <div style={s.shiftLabel}>Schedule</div>
            <div style={s.shiftValue}>{shiftTimes[profile?.shift] || '—'}</div>
          </div>
          <div style={s.shiftItem}>
            <div style={s.shiftLabel}>Clocked In</div>
            <div style={s.shiftValue}>{isClockedIn ? fmtTime(attendance.clock_in) : '—'}</div>
          </div>
          <div style={s.shiftItem}>
            <div style={s.shiftLabel}>Time Elapsed</div>
            <div style={s.shiftValue}>{isClockedIn ? elapsed(attendance.clock_in) : '—'}</div>
          </div>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        <div style={s.actions}>
          {!isClockedIn && (
            <button style={{...s.btn, ...s.btnGreen}} disabled={busy} onClick={() => onAction('clock_in')}>
              {Icon.up} {busy ? '…' : 'Clock In'}
            </button>
          )}
          {isClockedIn && !isOnLunch && (
            <button style={{...s.btn, ...s.btnAmber}} disabled={busy} onClick={() => onAction('lunch_start')}>
              {Icon.food} {busy ? '…' : 'Start Lunch'}
            </button>
          )}
          {isClockedIn && isOnLunch && (
            <button style={{...s.btn, ...s.btnBlue}} disabled={busy} onClick={() => onAction('lunch_end')}>
              {Icon.back} {busy ? '…' : 'End Lunch'}
            </button>
          )}
          {isClockedIn && (
            <button style={{...s.btn, ...s.btnRed}} disabled={busy} onClick={() => onAction('clock_out')}>
              {Icon.down} {busy ? '…' : 'Clock Out'}
            </button>
          )}
        </div>
      </div>
{/* Weekly schedule */}
<div style={s.card}>
  <div style={s.cardHead}><span style={s.cardTitle}>My Weekly Schedule</span></div>
  <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6}}>
    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => {
      const isOff = (profile?.days_off||[]).includes(day)
      const isToday = new Date().toLocaleDateString('en-GB',{weekday:'long'}) === day
      return (
        <div key={day} style={{
          textAlign:'center', padding:'10px 4px', borderRadius:8,
          background: isOff ? '#f8717115' : isToday ? '#3b82f620' : '#0f1117',
          border: `1px solid ${isOff ? '#f8717133' : isToday ? '#3b82f644' : '#1e2433'}`,
        }}>
          <div style={{fontSize:'0.65rem', color: isOff?'#f87171': isToday?'#60a5fa':'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4}}>
            {day.slice(0,3)}
          </div>
          <div style={{fontSize:'0.7rem', fontWeight:600, color: isOff?'#f87171': isToday?'#60a5fa':'#94a3b8'}}>
            {isOff ? 'OFF' : profile?.shift?.split(' ')[0] || '—'}
          </div>
        </div>
      )
    })}
  </div>
</div>
{/* Vacation summary */}
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>Vacation Summary</span></div>
        <div style={s.vacRow}>
          <div style={s.vacItem}>
            <div style={s.vacNum}>{profile?.vacation_allowance ?? 15}</div>
            <div style={s.vacLabel}>Annual Allowance</div>
          </div>
          <div style={s.vacItem}>
            <div style={{...s.vacNum, color:'#f87171'}}>{profile?.vacation_used ?? 0}</div>
            <div style={s.vacLabel}>Days Used</div>
          </div>
          <div style={s.vacItem}>
            <div style={{...s.vacNum, color:'#f59e0b'}}>{profile?.vacation_pending ?? 0}</div>
            <div style={s.vacLabel}>Pending</div>
          </div>
          <div style={s.vacItem}>
            <div style={{...s.vacNum, color:'#34d399'}}>
              {(profile?.vacation_allowance ?? 15) - (profile?.vacation_used ?? 0) - (profile?.vacation_pending ?? 0)}
            </div>
            <div style={s.vacLabel}>Remaining</div>
          </div>
        </div>
      </div>

      <BirthdayCard />
      <TeamDirectory />

    </div>
  )
}

// ─── Page: Attendance ─────────────────────────────────────────────────────────
function PageAttendance({ userId }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('week')

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    const now = new Date()
    let from
    if (filter === 'today') {
      from = new Date(now); from.setHours(0,0,0,0)
    } else if (filter === 'week') {
      from = new Date(now); from.setDate(now.getDate() - 7)
    } else {
      from = new Date(now.getFullYear(), now.getMonth(), 1)
    }
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .gte('clock_in', from.toISOString())
      .order('clock_in', { ascending: false })
    setRecords(data || [])
    setLoading(false)
  }

  function duration(ci, co) {
    if (!co) return <span style={{color:'#34d399'}}>Active</span>
    const mins = Math.round((new Date(co) - new Date(ci)) / 60000)
    const h = Math.floor(mins/60), m = mins%60
    return `${h}h ${m}m`
  }

  return (
    <div style={s.content}>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>My Attendance</h1>
        <div style={s.filterRow}>
          {['today','week','month'].map(f => (
            <button key={f} style={{...s.filterBtn,...(filter===f?s.filterActive:{})}} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div style={s.card}>
        {loading ? <div style={s.empty}>Loading…</div> : records.length === 0 ? (
          <div style={s.empty}>No records for this period.</div>
        ) : (
          <div style={{overflowX:'auto'}}>
            <table style={s.table}>
              <thead>
                <tr>{['Date','Clock In','Lunch Start','Lunch End','Clock Out','Duration','Status'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td style={s.td}>{fmtDate(r.clock_in)}</td>
                    <td style={s.td}>{fmtTime(r.clock_in)}</td>
                    <td style={s.td}>{fmtTime(r.lunch_start)}</td>
                    <td style={s.td}>{fmtTime(r.lunch_end)}</td>
                    <td style={s.td}>{fmtTime(r.clock_out)}</td>
                    <td style={s.td}>{duration(r.clock_in, r.clock_out)}</td>
                    <td style={s.td}>
                      <span style={{...s.pill, ...pillColor(r.status)}}>{r.status || 'done'}</span>
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

// ─── Page: Vacation ───────────────────────────────────────────────────────────
function PageVacation({ userId, profile, onProfileRefresh }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ start_date: '', end_date: '' })
  const [saving, setSaving]     = useState(false)
  const [warnings, setWarnings] = useState([])
  const [formError, setFormError] = useState(null)

  useEffect(() => { loadRequests() }, [])

  async function loadRequests() {
    const { data } = await supabase
      .from('vacation_requests')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
    setRequests(data || [])
    setLoading(false)
  }

  function validateRequest() {
    const warns = []
    const start = new Date(form.start_date)
    const end   = new Date(form.end_date)
    const today = new Date(); today.setHours(0,0,0,0)
    const days  = businessDays(start, end)
    const notice = Math.ceil((start - today) / 86400000)
    const remaining = (profile?.vacation_allowance ?? 15) - (profile?.vacation_used ?? 0) - (profile?.vacation_pending ?? 0)

    if (days > remaining) warns.push(`⚠️ Requesting ${days} days but only ${remaining} remaining.`)
    if (days > 5)         warns.push(`⚠️ Maximum 5 consecutive days allowed (requesting ${days}).`)
    if (notice < 21)      warns.push(`⚠️ Minimum 21 days notice required (you have ${notice} days).`)
    if (end < start)      warns.push(`⚠️ End date must be after start date.`)

    setWarnings(warns)
    return { days, valid: warns.length === 0 }
  }

  async function submitRequest() {
    setFormError(null)
    const { days, valid } = validateRequest()
    if (!valid && warnings.length > 0) {
      // Allow submission with warnings (admin sees them)
    }
    if (!form.start_date || !form.end_date) { setFormError('Please select both dates.'); return }

    setSaving(true)
    const { error } = await supabase.from('vacation_requests').insert({
      user_id: userId,
      start_date: form.start_date,
      end_date: form.end_date,
      days_requested: days,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      validation_warnings: warnings,
    })
    if (error) { setFormError(error.message); setSaving(false); return }

    // Update pending count
    await supabase.from('profiles').update({ vacation_pending: (profile?.vacation_pending ?? 0) + days }).eq('id', userId)
    setShowForm(false)
    setForm({ start_date:'', end_date:'' })
    setWarnings([])
    loadRequests()
    onProfileRefresh()
    setSaving(false)
  }

  const statusColor = { pending:'#f59e0b', approved:'#34d399', declined:'#f87171' }

  return (
    <div style={s.content}>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Vacation Requests</h1>
        <button style={s.btnPrimary} onClick={() => setShowForm(f=>!f)}>
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {/* Balance */}
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>My Balance</span></div>
        <div style={s.vacRow}>
          <div style={s.vacItem}><div style={s.vacNum}>{profile?.vacation_allowance ?? 15}</div><div style={s.vacLabel}>Allowance</div></div>
          <div style={s.vacItem}><div style={{...s.vacNum,color:'#f87171'}}>{profile?.vacation_used ?? 0}</div><div style={s.vacLabel}>Used</div></div>
          <div style={s.vacItem}><div style={{...s.vacNum,color:'#f59e0b'}}>{profile?.vacation_pending ?? 0}</div><div style={s.vacLabel}>Pending</div></div>
          <div style={s.vacItem}>
            <div style={{...s.vacNum,color:'#34d399'}}>
              {(profile?.vacation_allowance??15)-(profile?.vacation_used??0)-(profile?.vacation_pending??0)}
            </div>
            <div style={s.vacLabel}>Remaining</div>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={s.card}>
          <div style={s.cardHead}><span style={s.cardTitle}>New Vacation Request</span></div>
          <div style={s.formGrid}>
            <div style={s.formGroup}>
              <label style={s.label}>Start Date</label>
              <input style={s.input} type="date" value={form.start_date}
                onChange={e => { setForm(f=>({...f,start_date:e.target.value})); setWarnings([]) }}/>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>End Date</label>
              <input style={s.input} type="date" value={form.end_date}
                onChange={e => { setForm(f=>({...f,end_date:e.target.value})); setWarnings([]) }}/>
            </div>
          </div>
          {form.start_date && form.end_date && (
            <div style={{marginTop:12}}>
              <button style={{...s.filterBtn, marginBottom:12}} onClick={validateRequest}>Check Eligibility</button>
              {warnings.map((w,i) => <div key={i} style={s.warnBox}>{w}</div>)}
              {warnings.length === 0 && form.start_date && form.end_date && (
                <div style={s.successBox}>✓ {businessDays(new Date(form.start_date), new Date(form.end_date))} business days — eligible to submit.</div>
              )}
            </div>
          )}
          {formError && <div style={s.errorBox}>{formError}</div>}
          <button style={{...s.btnPrimary, marginTop:16}} disabled={saving} onClick={submitRequest}>
            {saving ? 'Submitting…' : 'Submit Request'}
          </button>
        </div>
      )}

      {/* History */}
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>My Requests</span></div>
        {loading ? <div style={s.empty}>Loading…</div> : requests.length === 0 ? (
          <div style={s.empty}>No vacation requests yet.</div>
        ) : requests.map(r => (
          <div key={r.id} style={s.requestRow}>
            <div style={{flex:1}}>
              <div style={s.requestDates}>{fmtDate(r.start_date)} → {fmtDate(r.end_date)}</div>
              <div style={s.requestMeta}>
                {r.days_requested} days · Submitted {fmtDate(r.submitted_at)}
                {r.admin_notes && <span style={{color:'#94a3b8'}}> · Note: {r.admin_notes}</span>}
              </div>
            </div>
            <span style={{...s.pill, background:(statusColor[r.status]||'#94a3b8')+'22', color:statusColor[r.status]||'#94a3b8'}}>
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page: Shift Swaps ────────────────────────────────────────────────────────
function PageSwaps({ userId, profile }) {
  const [swaps, setSwaps]       = useState([])
  const [mods, setMods]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ target_id:'', swap_date:'', notes:'' })
  const [saving, setSaving]     = useState(false)
  const [formError, setFormError] = useState(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [{ data: sw }, { data: ms }] = await Promise.all([
      supabase.from('shift_swaps').select('*, requester:profiles!requester_id(name,shift), target:profiles!target_id(name,shift)')
        .or(`requester_id.eq.${userId},target_id.eq.${userId}`).order('created_at', { ascending: false }),
      supabase.from('profiles').select('id,name,shift').eq('role','mod').neq('id', userId)
    ])
    setSwaps(sw || [])
    setMods(ms || [])
    setLoading(false)
  }

  async function submitSwap() {
    if (!form.target_id || !form.swap_date) { setFormError('Please fill all fields.'); return }
    setSaving(true)
    const target = mods.find(m => m.id === form.target_id)
    const { error } = await supabase.from('shift_swaps').insert({
      requester_id: userId,
      target_id: form.target_id,
      requester_shift: profile?.shift,
      target_shift: target?.shift,
      swap_date: form.swap_date,
      notes: form.notes,
      status: 'pending',
    })
    if (error) { setFormError(error.message); setSaving(false); return }
    setShowForm(false)
    setForm({ target_id:'', swap_date:'', notes:'' })
    loadAll()
    setSaving(false)
  }

  async function respondToSwap(id, response) {
    await supabase.from('shift_swaps').update({ target_response: response, status: response === 'accepted' ? 'pending_admin' : 'declined' }).eq('id', id)
    loadAll()
  }

  const statusColor = { pending:'#f59e0b', pending_admin:'#60a5fa', approved:'#34d399', declined:'#f87171' }

  return (
    <div style={s.content}>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Shift Swaps</h1>
        <button style={s.btnPrimary} onClick={() => setShowForm(f=>!f)}>
          {showForm ? 'Cancel' : '+ Request Swap'}
        </button>
      </div>

      {showForm && (
        <div style={s.card}>
          <div style={s.cardHead}><span style={s.cardTitle}>New Swap Request</span></div>
          {formError && <div style={s.errorBox}>{formError}</div>}
          <div style={s.formGrid}>
            <div style={s.formGroup}>
              <label style={s.label}>Swap With</label>
              <select style={s.input} value={form.target_id} onChange={e => setForm(f=>({...f,target_id:e.target.value}))}>
                <option value="">Select moderator…</option>
                {mods.map(m => <option key={m.id} value={m.id}>{m.name} ({m.shift})</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Swap Date</label>
              <input style={s.input} type="date" value={form.swap_date} onChange={e => setForm(f=>({...f,swap_date:e.target.value}))}/>
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Notes (optional)</label>
            <input style={s.input} value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} placeholder="Reason for swap…"/>
          </div>
          <button style={{...s.btnPrimary, marginTop:16}} disabled={saving} onClick={submitSwap}>
            {saving ? 'Sending…' : 'Send Request'}
          </button>
        </div>
      )}

      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>My Swap Requests</span></div>
        {loading ? <div style={s.empty}>Loading…</div> : swaps.length === 0 ? (
          <div style={s.empty}>No swap requests yet.</div>
        ) : swaps.map(r => {
          const isTarget = r.target_id === userId
          const isPending = r.status === 'pending' && isTarget
          return (
            <div key={r.id} style={s.requestRow}>
              <div style={{flex:1}}>
                <div style={s.requestDates}>
                  {r.requester?.name} ↔ {r.target?.name} · {fmtDate(r.swap_date)}
                </div>
                <div style={s.requestMeta}>
                  {r.requester?.shift} ↔ {r.target?.shift}
                  {r.notes && ` · ${r.notes}`}
                </div>
              </div>
              {isPending ? (
                <div style={{display:'flex',gap:8}}>
                  <button style={s.btnSmGreen} onClick={() => respondToSwap(r.id,'accepted')}>Accept</button>
                  <button style={s.btnSmRed}   onClick={() => respondToSwap(r.id,'declined')}>Decline</button>
                </div>
              ) : (
                <span style={{...s.pill, background:(statusColor[r.status]||'#94a3b8')+'22', color:statusColor[r.status]||'#94a3b8'}}>
                  {r.status}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Page: Profile ────────────────────────────────────────────────────────────
function PageProfile({ userId, profile, onRefresh }) {
  const [form, setForm]   = useState({ name:'', username:'', birthday:'' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  useEffect(() => {
    if (profile) setForm({ name: profile.name||'', username: profile.username||'', birthday: profile.birthday||'' })
  }, [profile])

  async function save() {
    setSaving(true)
    await supabase.from('profiles').update({ name: form.name, username: form.username, birthday: form.birthday }).eq('id', userId)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onRefresh()
  }

  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>My Profile</h1>
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>Profile Information</span></div>
        <div style={s.formGrid}>
          <div style={s.formGroup}>
            <label style={s.label}>Full Name</label>
            <input style={s.input} value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}/>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Username</label>
            <input style={s.input} value={form.username} onChange={e => setForm(f=>({...f,username:e.target.value}))}/>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Date of Birth</label>
            <input style={s.input} type="date" value={form.birthday} onChange={e => setForm(f=>({...f,birthday:e.target.value}))}/>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Shift</label>
            <input style={{...s.input, opacity:0.5}} value={profile?.shift||'—'} disabled/>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Role</label>
            <input style={{...s.input, opacity:0.5}} value={profile?.role||'—'} disabled/>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Status</label>
            <input style={{...s.input, opacity:0.5}} value={profile?.status||'active'} disabled/>
          </div>
        </div>
        <button style={{...s.btnPrimary, marginTop:20}} disabled={saving} onClick={save}>
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

// ─── Page: Birthdays ──────────────────────────────────────────────────────────
function PageBirthdays() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('profiles').select('id,name,birthday,shift').eq('role','mod').not('birthday','is',null)
      .then(({ data }) => {
        const today = new Date(); today.setHours(0,0,0,0)
        const enriched = (data||[]).map(p => {
          const bday = new Date(p.birthday)
          const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
          if (next < today) next.setFullYear(today.getFullYear()+1)
          return { ...p, daysUntil: Math.ceil((next-today)/86400000), nextBirthday: next }
        }).sort((a,b) => a.daysUntil - b.daysUntil)
        setPeople(enriched)
        setLoading(false)
      })
  }, [])

  const todays   = people.filter(p => p.daysUntil === 0)
  const upcoming = people.filter(p => p.daysUntil > 0 && p.daysUntil <= 30)

  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>Birthday Center</h1>
      {todays.length > 0 && (
        <div style={{...s.card, border:'1px solid #f59e0b44', background:'#f59e0b0a'}}>
          <div style={s.cardHead}><span style={s.cardTitle}>🎂 Today's Birthdays</span></div>
          {todays.map(p => (
            <div key={p.id} style={s.birthdayRow}>
              <div style={s.modAvatar}>{p.name[0].toUpperCase()}</div>
              <div><div style={s.modName}>{p.name}</div><div style={s.requestMeta}>{p.shift}</div></div>
              <span style={{color:'#f59e0b', fontWeight:600}}>🎉 Today!</span>
            </div>
          ))}
        </div>
      )}
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>Upcoming Birthdays (Next 30 Days)</span></div>
        {loading ? <div style={s.empty}>Loading…</div> : upcoming.length === 0 ? (
          <div style={s.empty}>No birthdays in the next 30 days.</div>
        ) : upcoming.map(p => (
          <div key={p.id} style={s.birthdayRow}>
            <div style={s.modAvatar}>{p.name[0].toUpperCase()}</div>
            <div style={{flex:1}}>
              <div style={s.modName}>{p.name}</div>
              <div style={s.requestMeta}>{p.nextBirthday.toLocaleDateString('en-GB',{day:'numeric',month:'long'})}</div>
            </div>
            <span style={{...s.pill, background:'#3b82f622', color:'#60a5fa'}}>
              {p.daysUntil === 1 ? 'Tomorrow' : `In ${p.daysUntil} days`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Pill helper ──────────────────────────────────────────────────────────────
function pillColor(status) {
  const map = {
    working:  { background:'#34d39922', color:'#34d399' },
    lunch:    { background:'#f59e0b22', color:'#f59e0b' },
    done:     { background:'#94a3b822', color:'#94a3b8' },
    pending:  { background:'#f59e0b22', color:'#f59e0b' },
    approved: { background:'#34d39922', color:'#34d399' },
    declined: { background:'#f87171'+'22', color:'#f87171' },
  }
  return map[status] || { background:'#94a3b822', color:'#94a3b8' }
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [session, setSession]     = useState(null)
  const [profile, setProfile]     = useState(null)
  const [attendance, setAttendance] = useState(null)
  const [page, setPage]           = useState('home')
  const [loading, setLoading]     = useState(true)
  const [busy, setBusy]           = useState(false)
  const [error, setError]         = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/'; return }
      setSession(session)
      await loadProfile(session.user.id)
      await loadAttendance(session.user.id)
      setLoading(false)
    })
  }, [])

  async function loadProfile(uid) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
    if (data?.role === 'admin') { window.location.href = '/admin'; return }
    setProfile(data)
  }

  async function loadAttendance(uid) {
    const { data } = await supabase.from('attendance').select('*').eq('user_id', uid)
      .is('clock_out', null).order('clock_in', { ascending: false }).limit(1).maybeSingle()
    setAttendance(data)
  }

  async function handleAction(action) {
    setBusy(true); setError(null)
    try {
      const res = await fetch(`/api/attendance?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: session.user.id }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Error')
      await loadAttendance(session.user.id)
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }

  async function handleLogout() {
    await supabase.auth.signOut(); window.location.href = '/'
  }

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0f1117',color:'#4a5568',fontFamily:'system-ui'}}>Loading…</div>

  return (
    <>
      <style>{`*{box-sizing:border-box}body{margin:0}input,select{color-scheme:dark}`}</style>
      <Layout profile={profile} page={page} setPage={setPage} onLogout={handleLogout}>
        {page === 'home'       && <PageHome profile={profile} attendance={attendance} onAction={handleAction} busy={busy} error={error}/>}
        {page === 'attendance' && <PageAttendance userId={session?.user.id}/>}
        {page === 'vacation'   && <PageVacation userId={session?.user.id} profile={profile} onProfileRefresh={() => loadProfile(session.user.id)}/>}
        {page === 'swaps'      && <PageSwaps userId={session?.user.id} profile={profile}/>}
        {page === 'profile'    && <PageProfile userId={session?.user.id} profile={profile} onRefresh={() => loadProfile(session.user.id)}/>}
        {page === 'birthdays'  && <PageBirthdays/>}
      </Layout>
    </>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  root:       { display:'flex', minHeight:'100vh', background:'#0f1117', color:'#e2e8f0', fontFamily:"'Inter',system-ui,sans-serif" },
  sidebar:    { width:230, background:'#0a0d14', borderRight:'1px solid #1e2433', display:'flex', flexDirection:'column', flexShrink:0, position:'sticky', top:0, height:'100vh' },
  sideTop:    { padding:'20px 16px 12px' },
  logoRow:    { display:'flex', alignItems:'center', gap:8, marginBottom:4 },
  logoIcon:   { width:30, height:30, background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:'#fff' },
  logoText:   { fontSize:'0.95rem', fontWeight:700, letterSpacing:'-0.02em', color:'#f8fafc' },
  roleLabel:  { fontSize:'0.7rem', color:'#4a5568', paddingLeft:38 },
  userLabel:  { fontSize:'0.72rem', color:'#64748b', paddingLeft:38, marginTop:2 },
  nav:        { padding:'8px', flex:1 },
  navItem:    { display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, cursor:'pointer', fontSize:'0.83rem', color:'#94a3b8', marginBottom:2 },
  navActive:  { background:'#1e2433', color:'#f1f5f9' },
  sideBottom: {padding:'12px 8px', borderTop:'1px solid #1e2433', position:'sticky', bottom:0, background:'#0a0d14'},
  logoutBtn:  { display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, cursor:'pointer', fontSize:'0.83rem', color:'#64748b', width:'100%', background:'none', border:'none' },
  main:       { flex:1, overflow:'auto' },
  content:    { padding:'32px 36px', maxWidth:1000, margin:'0 auto' },
  pageHead:   { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 },
  pageTitle:  { fontSize:'1.3rem', fontWeight:700, margin:'0 0 24px', letterSpacing:'-0.02em', color:'#f8fafc' },
  card:       { background:'#141820', border:'1px solid #1e2433', borderRadius:12, padding:'20px 22px', marginBottom:20 },
  cardHead:   { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 },
  cardTitle:  { fontSize:'0.88rem', fontWeight:600, color:'#f1f5f9' },
  empty:      { color:'#4a5568', fontSize:'0.85rem', padding:'12px 0' },
  shiftGrid:  { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 },
  shiftItem:  { },
  shiftLabel: { fontSize:'0.7rem', color:'#4a5568', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 },
  shiftValue: { fontSize:'0.9rem', fontWeight:500, color:'#e2e8f0' },
  statusBadge:{ fontSize:'0.72rem', fontWeight:600, padding:'5px 12px', borderRadius:20 },
  actions:    { display:'flex', gap:10, flexWrap:'wrap' },
  btn:        { display:'flex', alignItems:'center', gap:7, padding:'10px 18px', borderRadius:8, border:'none', fontSize:'0.84rem', fontWeight:600, cursor:'pointer' },
  btnGreen:   { background:'#16a34a', color:'#fff' },
  btnAmber:   { background:'#d97706', color:'#fff' },
  btnBlue:    { background:'#2563eb', color:'#fff' },
  btnRed:     { background:'#dc2626', color:'#fff' },
  btnPrimary: { background:'#3b82f6', color:'#fff', border:'none', borderRadius:8, padding:'9px 18px', fontSize:'0.83rem', fontWeight:600, cursor:'pointer' },
  btnSmGreen: { background:'#16a34a22', color:'#34d399', border:'1px solid #16a34a44', padding:'4px 12px', borderRadius:6, cursor:'pointer', fontSize:'0.78rem', fontWeight:600 },
  btnSmRed:   { background:'#dc262622', color:'#f87171', border:'1px solid #dc262644', padding:'4px 12px', borderRadius:6, cursor:'pointer', fontSize:'0.78rem', fontWeight:600 },
  errorBox:   { background:'#dc262622', border:'1px solid #dc262644', color:'#f87171', fontSize:'0.8rem', padding:'10px 14px', borderRadius:8, marginBottom:16 },
  warnBox:    { background:'#f59e0b22', border:'1px solid #f59e0b44', color:'#f59e0b', fontSize:'0.8rem', padding:'8px 12px', borderRadius:8, marginBottom:8 },
  successBox: { background:'#34d39922', border:'1px solid #34d39944', color:'#34d399', fontSize:'0.8rem', padding:'8px 12px', borderRadius:8, marginBottom:8 },
  vacRow:     { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 },
  vacItem:    { textAlign:'center' },
  vacNum:     { fontSize:'2rem', fontWeight:700, color:'#f8fafc', lineHeight:1 },
  vacLabel:   { fontSize:'0.7rem', color:'#4a5568', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:6 },
  table:      { width:'100%', borderCollapse:'collapse' },
  th:         { textAlign:'left', fontSize:'0.7rem', color:'#64748b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', paddingBottom:10, borderBottom:'1px solid #1e2433', paddingRight:16 },
  td:         { padding:'11px 16px 11px 0', fontSize:'0.83rem', color:'#e2e8f0', borderBottom:'1px solid #0f1117' },
  pill:       { fontSize:'0.72rem', fontWeight:600, padding:'3px 10px', borderRadius:20 },
  filterRow:  { display:'flex', gap:6 },
  filterBtn:  { background:'transparent', border:'1px solid #2d3748', color:'#94a3b8', borderRadius:6, padding:'6px 14px', fontSize:'0.78rem', cursor:'pointer' },
  filterActive:{ background:'#1e2433', color:'#f1f5f9', borderColor:'#334155' },
  formGrid:   { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  formGroup:  { display:'flex', flexDirection:'column', gap:6 },
  label:      { fontSize:'0.75rem', color:'#94a3b8', fontWeight:500 },
  input:      { background:'#0f1117', border:'1px solid #2d3748', borderRadius:8, padding:'9px 12px', color:'#e2e8f0', fontSize:'0.85rem', outline:'none', fontFamily:'inherit' },
  requestRow: { display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid #1e2433' },
  requestDates:{ fontSize:'0.85rem', fontWeight:500, marginBottom:3 },
  requestMeta:{ fontSize:'0.75rem', color:'#64748b' },
  modAvatar:  { width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', fontWeight:700, flexShrink:0 },
  modName:    { fontSize:'0.85rem', fontWeight:500 },
  birthdayRow:{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid #1e2433' },
}
