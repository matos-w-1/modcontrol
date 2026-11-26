import { Icon } from '../../lib/icons'
import { SHIFT_COLORS, elapsed, fmtDate, fmtTime, isTestAccount, notifyAdmins, toLocalISO } from '../../lib/utils'
import { AnnouncementsWidget } from './AnnouncementsWidget'
import { ShiftNotesWidget } from './ShiftNotesWidget'
import { LUNCH_LIMIT_MIN, lunchMinutesSince, shiftEndFor } from '../../lib/shiftTime'
import { s } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function PageHome({ profile, attendance, onAction, busy, error, userId, onNavigate }) {
  const [onDuty, setOnDuty] = useState([])

useEffect(() => {
  loadOnDuty()
  const interval = setInterval(loadOnDuty, 60000)
  return () => clearInterval(interval)
}, [])

async function loadOnDuty() {
  const { data } = await supabase.from('attendance')
    .select('id,status,clock_in,lunch_start,user_id,profiles(name,avatar_url,shift)')
    .is('clock_out', null)
    .order('clock_in')
  setOnDuty(data||[])
}
  const isClockedIn = !!attendance && !attendance.clock_out
  const isOnLunch   = isClockedIn && !!attendance.lunch_start && !attendance.lunch_end
  const shiftTimes  = { 'Night Shift':'12 AM–9 AM', 'Morning Shift':'9 AM–5 PM', 'Afternoon Shift':'5 PM–12 AM' }
  const shiftEndHour = { 'Night Shift':9, 'Morning Shift':17, 'Afternoon Shift':24 }

  const [now, setNow] = useState(new Date())
  const [debts, setDebts] = useState([])
  const [debtProfiles, setDebtProfiles] = useState({})
  const [calMods, setCalMods] = useState([])
  const [calVacs, setCalVacs] = useState([])
  const [calSwaps, setCalSwaps] = useState([])
  const [issues, setIssues] = useState([])
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [issueForm, setIssueForm] = useState({ title:'', description:'', priority:'normal' })
  const [savingIssue, setSavingIssue] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!userId) return
    loadDebts()
    loadCalPreview()
    loadIssues()
  }, [userId])

  async function loadDebts() {
    const [{ data:d },{ data:p }] = await Promise.all([
      supabase.from('swap_debts').select('*').or(`debtor_id.eq.${userId},creditor_id.eq.${userId}`).eq('settled',false),
      supabase.from('profiles').select('id,name'),
    ])
    const map={}; (p||[]).forEach(x=>map[x.id]=x.name)
    setDebtProfiles(map); setDebts(d||[])
  }

  async function loadCalPreview() {
    const today = toLocalISO(new Date())
    const in7   = toLocalISO(new Date(Date.now()+7*86400000))
    const [{ data:m },{ data:v },{ data:sw }] = await Promise.all([
      supabase.from('profiles').select('id,name,shift,days_off,rotating_days_off,rotating_days_off_alt,mod_group').eq('role','mod').neq('status','left').order('shift,name'),
      supabase.from('vacation_requests').select('id,user_id,start_date,end_date').eq('status','approved').lte('start_date',in7).gte('end_date',today),
      supabase.from('shift_swaps').select('id,requester_id,target_id,swap_date,target_date').eq('status','approved').or(`and(swap_date.gte.${today},swap_date.lte.${in7}),and(target_date.gte.${today},target_date.lte.${in7})`),
    ])
    setCalMods((m||[]).filter(x=>!isTestAccount(x))); setCalVacs(v||[]); setCalSwaps(sw||[])
  }

  async function loadIssues() {
    const { data } = await supabase.from('dev_issues').select('*').eq('user_id', userId).order('created_at',{ascending:false}).limit(5)
    setIssues(data||[])
  }

  async function submitIssue() {
    if (!issueForm.title) return
    setSavingIssue(true)
    const { data: newIssue } = await supabase.from('dev_issues').insert({ user_id:userId, title:issueForm.title, description:issueForm.description, priority:issueForm.priority }).select('id').single()
    if (newIssue?.id) notifyAdmins('dev_issue', newIssue.id)
    setIssueForm({ title:'', description:'', priority:'normal' })
    setShowIssueForm(false)
    setSavingIssue(false)
    loadIssues()
  }

  // Shift progress
  function getShiftProgress() {
    if (!isClockedIn || !profile?.shift) return null
    const endHour = shiftEndHour[profile.shift]
    if (!endHour) return null
    const clockIn = new Date(attendance.clock_in)
    const shiftEnd = shiftEndFor(clockIn, profile.shift)
    const totalMins = (shiftEnd - clockIn) / 60000
    const elapsedMins = (now - clockIn) / 60000
    const pct = Math.min(100, Math.round((elapsedMins/totalMins)*100))
    const remainMins = Math.max(0, totalMins - elapsedMins)
    const rh = Math.floor(remainMins/60), rm = Math.round(remainMins%60)

    // Lunch
    let lunchMins = 0
    if (attendance.lunch_start) {
      const ls = new Date(attendance.lunch_start)
      const le = attendance.lunch_end ? new Date(attendance.lunch_end) : now
      lunchMins = Math.round((le-ls)/60000)
    }

    return { pct, rh, rm, lunchMins, shiftEnd, clockIn }
  }

  const shiftProgress = getShiftProgress()

  // Calendar preview — next 7 days
  const days7 = Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate()+i); return d
  })
const isEvenMonth = (now.getMonth()+1) % 2 === 0
  const SHIFT_COLOR = SHIFT_COLORS

  function getModStatus(mod, date) {
    const d = toLocalISO(date)
    const dayName = date.toLocaleDateString('en-GB',{weekday:'long'})
    let daysOff = mod.days_off||[]
    if (mod.rotating_days_off) daysOff = isEvenMonth ? (mod.days_off||[]) : (mod.rotating_days_off_alt||[])
    if (calVacs.some(v=>v.user_id===mod.id&&d>=v.start_date&&d<=v.end_date)) return { label:'VAC', color:'#a855f7' }
    if (calSwaps.some(sw=>(sw.swap_date===d||sw.target_date===d)&&(sw.requester_id===mod.id||sw.target_id===mod.id))) return { label:'SWAP', color:'#cbd5e1' }
    if (daysOff.includes(dayName)) return { label:'OFF', color:'#be123c' }
    const color = SHIFT_COLOR[mod.shift]||'#94a3b8'
    return { label:'●', color }
  }

  const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>Dashboard</h1>
      <AnnouncementsWidget/>

      {/* My Status Widget */}
      <div style={s.card}>
        <div style={s.cardHead}>
          <span style={s.cardTitle}>My Status</span>
          <span style={{...s.statusBadge,
            background: !isClockedIn?'#1e2433':isOnLunch?'#f59e0b22':'#34d39922',
            color:      !isClockedIn?'#4a5568' :isOnLunch?'#f59e0b'  :'#34d399',
            border:`1px solid ${!isClockedIn?'#2d3748':isOnLunch?'#f59e0b44':'#34d39944'}`
          }}>
            {!isClockedIn?'Offline':isOnLunch?'On Lunch':'Working'}
          </span>
        </div>

        {shiftProgress && (
          <div style={{marginBottom:16}}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:14}}>
              <div style={s.shiftItem}>
                <div style={s.shiftLabel}>Clocked In</div>
                <div style={s.shiftValue}>{fmtTime(attendance.clock_in)}</div>
              </div>
              <div style={s.shiftItem}>
                <div style={s.shiftLabel}>Lunch Used</div>
                <div style={{...s.shiftValue, color: shiftProgress.lunchMins>30?'#f87171':'#e2e8f0'}}>
                  {shiftProgress.lunchMins}m / 30m
                </div>
              </div>
              <div style={s.shiftItem}>
                <div style={s.shiftLabel}>Shift Ends</div>
                <div style={s.shiftValue}>{fmtTime(shiftProgress.shiftEnd.toISOString())}</div>
              </div>
            </div>
            <div style={{marginBottom:6, display:'flex', justifyContent:'space-between'}}>
              <span style={{fontSize:'0.7rem', color:'#64748b'}}>Progress</span>
              <span style={{fontSize:'0.7rem', color: shiftProgress.pct>90?'#f59e0b':'#64748b'}}>
                {shiftProgress.rh}h {shiftProgress.rm}m remaining
              </span>
            </div>
            <div style={{height:6, background:'#1e2433', borderRadius:99, overflow:'hidden'}}>
              <div style={{height:'100%', width:`${shiftProgress.pct}%`, borderRadius:99, background: shiftProgress.pct>90?'linear-gradient(90deg,#f59e0b,#fbbf24)':'linear-gradient(90deg,#3b82f6,#60a5fa)', transition:'width 0.5s'}}/>
            </div>
          </div>
        )}

        {error && <div style={s.errorBox}>{error}</div>}
        <div style={s.actions}>
          {!isClockedIn && <button style={{...s.btn,...s.btnGreen}} disabled={busy} onClick={()=>onAction('clock_in')}>{Icon.up} {busy?'…':'Clock In'}</button>}
          {isClockedIn&&!isOnLunch && <button style={{...s.btn,...s.btnAmber}} disabled={busy} onClick={()=>onAction('lunch_start')}>{Icon.food} {busy?'…':'Start Lunch'}</button>}
          {isClockedIn&&isOnLunch  && <button style={{...s.btn,...s.btnBlue}}  disabled={busy} onClick={()=>onAction('lunch_end')}>{Icon.back} {busy?'…':'End Lunch'}</button>}
          {isClockedIn && <button style={{...s.btn,...s.btnRed}} disabled={busy} onClick={()=>onAction('clock_out')}>{Icon.down} {busy?'…':'Clock Out'}</button>}
        </div>
      </div>

{/* Who's On Duty */}
<div style={s.card}>
  <div style={s.cardHead}>
    <span style={s.cardTitle}>Who's On Duty</span>
    <span style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.62rem',fontWeight:700,color:'#34d399',background:'rgba(52,211,153,0.08)',border:'1px solid rgba(52,211,153,0.2)',padding:'3px 8px',borderRadius:20}}>
      <span style={{width:6,height:6,borderRadius:'50%',background:'#34d399',display:'inline-block'}}/>LIVE
    </span>
  </div>
  {onDuty.length===0 ? <p style={s.empty}>No moderators on duty.</p> : onDuty.map(r=>(
    <div key={r.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid #1e2433'}}>
      <div style={{width:28,height:28,borderRadius:'50%',flexShrink:0,overflow:'hidden'}}>
        {r.profiles?.avatar_url
          ? <img src={r.profiles.avatar_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',fontWeight:700,color:'#fff'}}>{(r.profiles?.name||'?')[0].toUpperCase()}</div>
        }
      </div>
      <span style={{flex:1,fontSize:'0.85rem',color:'#f1f5f9'}}>{r.profiles?.name}</span>
      <span style={{fontSize:'0.72rem',color:'#64748b'}}>{r.profiles?.shift?.replace(' Shift','')}</span>
      <span style={{fontSize:'0.72rem',fontWeight:600,padding:'2px 10px',borderRadius:20,
        background:r.status==='lunch'?(lunchMinutesSince(r.lunch_start)>=LUNCH_LIMIT_MIN?'#f8717122':'#f59e0b22'):'#34d39922',
        color:r.status==='lunch'?(lunchMinutesSince(r.lunch_start)>=LUNCH_LIMIT_MIN?'#f87171':'#f59e0b'):'#34d399'}}>
        {r.status==='lunch'?`🍽 Lunch · ${elapsed(r.lunch_start)}`:'● Working'}
      </span>
    </div>
  ))}
</div>

<ShiftNotesWidget userId={userId} attendanceId={attendance?.id} isClockedIn={isClockedIn}/>

      {/* My Weekly Schedule */}
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>My Weekly Schedule</span></div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6}}>
          {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => {
            const isEvenMonth = (new Date().getMonth() + 1) % 2 === 0
            let daysOff = profile?.days_off || []
            if (profile?.rotating_days_off) {
              daysOff = isEvenMonth ? (profile?.days_off||[]) : (profile?.rotating_days_off_alt||[])
            }
            const isOff   = daysOff.includes(day)
            const isToday = new Date().toLocaleDateString('en-GB',{weekday:'long'}) === day
            return (
              <div key={day} style={{textAlign:'center', padding:'10px 4px', borderRadius:8, background:isOff?'#f8717115':isToday?'#3b82f620':'#0f1117', border:`1px solid ${isOff?'#f8717133':isToday?'#3b82f644':'#1e2433'}`}}>
                <div style={{fontSize:'0.65rem', color:isOff?'#f87171':isToday?'#60a5fa':'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4}}>{day.slice(0,3)}</div>
                <div style={{fontSize:'0.7rem', fontWeight:600, color:isOff?'#be123c':isToday?'#60a5fa':'#94a3b8'}}>{isOff?'OFF':profile?.shift?.split(' ')[0]||'—'}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Vacation Summary */}
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>Vacation Summary</span></div>
        <div style={s.vacRow}>
          <div style={s.vacItem}><div style={s.vacNum}>{profile?.vacation_allowance??15}</div><div style={s.vacLabel}>Allowance</div></div>
          <div style={s.vacItem}><div style={{...s.vacNum,color:'#f87171'}}>{profile?.vacation_used??0}</div><div style={s.vacLabel}>Used</div></div>
          <div style={s.vacItem}><div style={{...s.vacNum,color:'#f59e0b'}}>{profile?.vacation_pending??0}</div><div style={s.vacLabel}>Pending</div></div>
          <div style={s.vacItem}><div style={{...s.vacNum,color:'#34d399'}}>{(profile?.vacation_allowance??15)-(profile?.vacation_used??0)-(profile?.vacation_pending??0)}</div><div style={s.vacLabel}>Remaining</div></div>
        </div>
      </div>

      {/* Swap Debts */}
      {debts.length > 0 && (
        <div style={{...s.card, border:'1px solid #f59e0b44', background:'#f59e0b06'}}>
          <div style={s.cardHead}><span style={s.cardTitle}>⚖️ Shift Swap Debts</span></div>
          {debts.map(d => {
            const isDebtor = d.debtor_id === userId
            return (
              <div key={d.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid #1e2433'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.85rem',fontWeight:500}}>
                    {isDebtor
                      ? <span>You owe <strong style={{color:'#f87171'}}>{debtProfiles[d.creditor_id]}</strong> a day off</span>
                      : <span><strong style={{color:'#34d399'}}>{debtProfiles[d.debtor_id]}</strong> owes you a day off</span>
                    }
                  </div>
                  <div style={{fontSize:'0.75rem',color:'#64748b',marginTop:2}}>Swap date: {fmtDate(d.swap_date)}</div>
                </div>
                <span style={{fontSize:'0.72rem',fontWeight:600,padding:'3px 10px',borderRadius:20,background:isDebtor?'#f8717122':'#34d39922',color:isDebtor?'#f87171':'#34d399'}}>
                  {isDebtor?'You owe':'They owe'}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Team Overview */}
      <div style={s.card}>
        <div style={s.cardHead}>
          <span style={s.cardTitle}>Team Overview — Next 7 Days</span>
          <button style={{...s.filterBtn, fontSize:'0.75rem'}} onClick={()=>onNavigate('calendar')}>
            View Full Calendar →
          </button>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{...s.table, minWidth:500}}>
            <thead>
              <tr>
                <th style={{...s.th, width:100, paddingRight:12}}>Mod</th>
                {days7.map((d,i) => (
                  <th key={i} style={{...s.th, textAlign:'center', minWidth:44, padding:'0 2px 10px', color: i===0?'#60a5fa':'#64748b', fontWeight: i===0?700:600}}>
                    <div style={{fontSize:'0.6rem'}}>{DAYS_SHORT[d.getDay()]}</div>
                    <div style={{fontSize:'0.72rem'}}>{d.getDate()}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['Morning Shift','Afternoon Shift','Night Shift',null].map(shiftName => {
                const group = calMods.filter(m => shiftName ? m.shift === shiftName : !['Morning Shift','Afternoon Shift','Night Shift'].includes(m.shift))
                if (group.length === 0) return null
                const hours = { 'Morning Shift':'9 AM–5 PM', 'Afternoon Shift':'5 PM–12 AM', 'Night Shift':'12 AM–9 AM' }[shiftName]
                return [
                  <tr key={'h-'+(shiftName||'none')}>
                    <td colSpan={days7.length+1} style={{padding:'14px 0 6px', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:(shiftName&&SHIFT_COLORS[shiftName])||'#94a3b8', borderBottom:`2px solid ${((shiftName&&SHIFT_COLORS[shiftName])||'#94a3b8')}55`}}>
                      {shiftName ? shiftName.replace(' Shift','') : 'No shift'}{hours && <span style={{fontWeight:500, color:'#64748b', marginLeft:8, textTransform:'none', letterSpacing:0}}>{hours}</span>}
                    </td>
                  </tr>,
                  ...group.map(mod => (
                    <tr key={mod.id} style={mod.id===userId?{background:'#3b82f60d'}:undefined}>
                      <td style={{...s.td, fontWeight:500, fontSize:'0.8rem', paddingRight:12, whiteSpace:'nowrap', color: mod.id===userId?'#60a5fa':'#e2e8f0'}}>
                        {mod.name}{mod.id===userId?' (you)':''}
                      </td>
                      {days7.map((d,i) => {
                        const status = getModStatus(mod, d)
                        const isWorking = status.label==='●'
                        return (
                          <td key={i} style={{...s.td, textAlign:'center', padding:'6px 2px', background: i===0?'#3b82f608':undefined}}>
                            {isWorking
                              ? <div style={{width:6, height:6, borderRadius:'50%', background:'#64748b', margin:'0 auto'}}/>
                              : <div style={{fontSize:'0.62rem', fontWeight:700, color:status.color, background:status.color+'22', padding:'3px 4px', borderRadius:4, textTransform:'uppercase'}}>{status.label}</div>
                            }
                          </td>
                        )
                      })}
                    </tr>
                  ))
                ]
              })}
            </tbody>
          </table>
        </div>
        <div style={{display:'flex', gap:16, marginTop:12, flexWrap:'wrap'}}>
          {[['#a855f7','Vacation (VAC)'],['#be123c','Day off (OFF)'],['#cbd5e1','Shift swap (SWAP)']].map(([color,label])=>(
            <div key={label} style={{display:'flex',alignItems:'center',gap:5}}>
              <div style={{width:8,height:8,borderRadius:2,background:color}}/>
              <span style={{fontSize:'0.7rem',color:'#64748b'}}>{label}</span>
            </div>
          ))}
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#64748b'}}/>
            <span style={{fontSize:'0.7rem',color:'#64748b'}}>Working</span>
          </div>
        </div>
      </div>
    </div>
  )
}
