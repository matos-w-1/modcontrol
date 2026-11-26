import { elapsed, fmtDate, fmtTime, formatHours } from '../../lib/utils'
import { AdminBirthdayList } from './AdminBirthdayList'
import { LUNCH_LIMIT_MIN, lunchMinutesSince } from '../../lib/shiftTime'
import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'

export function PageDashboard({ onDuty, weeklyHours, upcomingLeave, pendingCount }) {
  const [, setTick] = useState(0)
  useEffect(() => { const t = setInterval(() => setTick(x => x+1), 30000); return () => clearInterval(t) }, [])
  const online  = onDuty.filter(r => r.status !== 'lunch')
  const onLunch = onDuty.filter(r => r.status === 'lunch')
  return (
    <div style={sa.content}>
      <h1 style={sa.pageTitle}>Dashboard</h1>
      <div style={sa.statRow}>
        {[
          { num:online.length,   label:'Online',            col:'#34d399' },
          { num:onLunch.length,  label:'On Lunch',          col:'#f59e0b' },
          { num:onDuty.length,   label:'Total On Duty',     col:'#60a5fa' },
          { num:pendingCount,    label:'Pending Approvals', col:'#f87171' },
        ].map(st => (
          <div key={st.label} style={sa.statCard}>
            <span style={{...sa.statNum, color:st.col}}>{st.num}</span>
            <span style={sa.statLabel}>{st.label}</span>
          </div>
        ))}
      </div>
      <div style={sa.twoCol}>
        <div style={sa.card}>
          <div style={sa.cardHead}>
            <span style={sa.cardTitle}>Who's On Duty</span>
            <span style={sa.liveChip}><span style={sa.liveDot}/>LIVE</span>
          </div>
          {onDuty.length === 0 ? <p style={sa.empty}>No moderators on duty.</p> : onDuty.map(r => {
  const lastSeen = r.profiles?.last_seen ? new Date(r.profiles.last_seen) : null
  const minsAgo = lastSeen ? Math.floor((new Date()-lastSeen)/60000) : null
  const isActive = minsAgo !== null && minsAgo < 5
  return (
    <div key={r.id} style={sa.dutyRow}>
      <span style={{...sa.dot, background: r.status==='lunch'?'#f59e0b':'#34d399'}}/>
      <span style={{flex:1, fontSize:'0.85rem'}}>{r.profiles?.name}</span>
      {r.status==='lunch' && lunchMinutesSince(r.lunch_start)>=LUNCH_LIMIT_MIN
        ? <span style={{fontSize:'0.72rem', fontWeight:700, color:'#f87171'}}>⚠ Lunch over · {elapsed(r.lunch_start)}</span>
        : <span style={{fontSize:'0.72rem', color:'#64748b'}}>{r.status==='lunch'?`Lunch · ${elapsed(r.lunch_start)}`:'Working'} · since {fmtTime(r.clock_in)}</span>}
      {lastSeen && (
        <span style={{fontSize:'0.68rem', fontWeight:600, padding:'2px 8px', borderRadius:20, background:isActive?'#34d39922':'#f59e0b22', color:isActive?'#34d399':'#f59e0b'}}>
          {isActive ? '● Active' : `${minsAgo}m ago`}
        </span>
      )}
    </div>
  )
})}
        </div>
        <div style={sa.card}>
          <div style={sa.cardHead}><span style={sa.cardTitle}>Upcoming Leave</span><span style={sa.chip}>Next 14 days</span></div>
          {upcomingLeave.length === 0 ? <p style={sa.empty}>No approved leave upcoming.</p> : upcomingLeave.map(r => (
            <div key={r.id} style={sa.dutyRow}>
              <span style={{flex:1, fontSize:'0.85rem'}}>{r.profiles?.name}</span>
              <span style={{fontSize:'0.75rem', color:'#60a5fa'}}>{fmtDate(r.start_date)} → {fmtDate(r.end_date)}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={sa.card}>
        <div style={sa.cardHead}><span style={sa.cardTitle}>Weekly Hours</span><span style={sa.chip}>Target: 35h</span></div>
        {weeklyHours.length === 0 ? <p style={sa.empty}>No records this week.</p> : weeklyHours.map(mod => {
          const pct = Math.min(100, Math.round((mod.minutes/(35*60))*100))
          const over = mod.minutes > 35*60
          return (
            <div key={mod.name} style={sa.hoursRow}>
              <span style={sa.hoursName}>{mod.name}</span>
              <div style={sa.barTrack}><div style={{...sa.barFill, width:`${pct}%`, background: over?'linear-gradient(90deg,#f59e0b,#fbbf24)':'linear-gradient(90deg,#3b82f6,#60a5fa)'}}/></div>
              <span style={{fontSize:'0.72rem', color: over?'#f59e0b':'#64748b', textAlign:'right', minWidth:48}}>{formatHours(mod.minutes)}</span>
            </div>
          )
        })}
      </div>
      <div style={sa.card}>
        <div style={sa.cardHead}>
          <span style={sa.cardTitle}>🎂 Upcoming Birthdays</span>
          <span style={sa.chip}>Next 30 days</span>
        </div>
        <AdminBirthdayList />
      </div>
    </div>
  )
}
