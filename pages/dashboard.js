import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [allMods, setAllMods] = useState([])
  const [attendance, setAttendance] = useState(null)
  const [requests, setRequests] = useState([])
  const [swaps, setSwaps] = useState([])
  const [page, setPage] = useState('dashboard')
  const [tick, setTick] = useState(0)
  const [vacForm, setVacForm] = useState({ start: '', end: '', notes: '' })
  const [vacMsg, setVacMsg] = useState('')
  const [swapForm, setSwapForm] = useState({ target_id: '', swap_date: '', notes: '' })
  const [swapMsg, setSwapMsg] = useState('')
  const [uid, setUid] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      setUid(session.user.id)
      loadProfile(session.user.id)
      loadTodayAttendance(session.user.id)
      loadRequests(session.user.id)
      loadSwaps(session.user.id)
      loadAllMods()
    })
    const t = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  async function loadProfile(id) {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
    if (data) setProfile(data)
  }

  async function loadAllMods() {
    const { data } = await supabase.from('profiles').select('id,name,shift').eq('status','active').order('name')
    if (data) setAllMods(data)
  }

  async function loadTodayAttendance(id) {
    const today = new Date().toISOString().slice(0, 10)
    const { data } = await supabase.from('attendance').select('*')
      .eq('user_id', id).gte('created_at', today).order('created_at', { ascending: false }).limit(1)
    if (data && data.length > 0) setAttendance(data[0])
  }

  async function loadRequests(id) {
    const { data } = await supabase.from('vacation_requests').select('*')
      .eq('user_id', id).order('submitted_at', { ascending: false })
    if (data) setRequests(data)
  }

  async function loadSwaps(id) {
    const { data } = await supabase.from('shift_swaps').select('*, requester:requester_id(name,shift), target:target_id(name,shift)')
      .or(`requester_id.eq.${id},target_id.eq.${id}`).order('created_at', { ascending: false })
    if (data) setSwaps(data)
  }

  async function clockIn() {
    const { data: s } = await supabase.auth.getSession()
    const { data } = await supabase.from('attendance').insert({
      user_id: s.session.user.id, clock_in: new Date().toISOString(), status: 'active'
    }).select().single()
    setAttendance(data)
  }

  async function lunchStart() {
    const { data } = await supabase.from('attendance')
      .update({ lunch_start: new Date().toISOString(), status: 'lunch' })
      .eq('id', attendance.id).select().single()
    setAttendance(data)
  }

  async function lunchEnd() {
    const { data } = await supabase.from('attendance')
      .update({ lunch_end: new Date().toISOString(), status: 'active' })
      .eq('id', attendance.id).select().single()
    setAttendance(data)
  }

  async function clockOut() {
    const now = new Date()
    const shiftMs = now - new Date(attendance.clock_in)
    const lunchMs = attendance.lunch_start && attendance.lunch_end
      ? new Date(attendance.lunch_end) - new Date(attendance.lunch_start) : 0
    const { data } = await supabase.from('attendance').update({
      clock_out: now.toISOString(), status: 'complete',
      total_hours: parseFloat(((shiftMs - lunchMs) / 3600000).toFixed(2)),
      lunch_minutes: Math.round(lunchMs / 60000)
    }).eq('id', attendance.id).select().single()
    setAttendance(data)
  }

  async function submitVacation(e) {
    e.preventDefault()
    setVacMsg('')
    const start = new Date(vacForm.start)
    const end = new Date(vacForm.end)
    const days = Math.round((end - start) / 86400000) + 1
    const diffDays = Math.round((start - new Date()) / 86400000)
    if (days > 5) { setVacMsg('error:Max 5 consecutive days allowed.'); return }
    if (diffDays < 21) { setVacMsg('error:Minimum 21 days advance notice required.'); return }
    if (days > (profile.vacation_allowance - profile.vacation_used)) { setVacMsg('error:Insufficient balance.'); return }
    const { data: s } = await supabase.auth.getSession()
    await supabase.from('vacation_requests').insert({
      user_id: s.session.user.id, start_date: vacForm.start,
      end_date: vacForm.end, days_requested: days, admin_notes: vacForm.notes
    })
    setVacMsg('ok:Request submitted!')
    setVacForm({ start: '', end: '', notes: '' })
    loadRequests(s.session.user.id)
  }

  async function submitSwap(e) {
    e.preventDefault()
    setSwapMsg('')
    if (!swapForm.target_id) { setSwapMsg('error:Select a moderator to swap with.'); return }
    if (swapForm.target_id === uid) { setSwapMsg('error:Cannot swap with yourself.'); return }
    const target = allMods.find(m => m.id === swapForm.target_id)
    await supabase.from('shift_swaps').insert({
      requester_id: uid,
      target_id: swapForm.target_id,
      requester_shift: profile.shift,
      target_shift: target?.shift || '',
      swap_date: swapForm.swap_date,
      notes: swapForm.notes,
      status: 'pending',
      target_response: 'pending',
      admin_response: 'pending'
    })
    setSwapMsg('ok:Swap request sent!')
    setSwapForm({ target_id: '', swap_date: '', notes: '' })
    loadSwaps(uid)
  }

  async function respondToSwap(swapId, accept) {
    await supabase.from('shift_swaps').update({
      target_response: accept ? 'accepted' : 'declined',
      status: accept ? 'waiting_admin' : 'declined'
    }).eq('id', swapId)
    loadSwaps(uid)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function fmtMs(ms) {
    let s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  if (!profile) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'system-ui,sans-serif',background:'#0f1117',color:'#888',fontSize:15}}>
      Loading...
    </div>
  )

  const now = new Date()
  const shiftMs = attendance?.clock_in ? now - new Date(attendance.clock_in) : 0
  const lunchMs = attendance?.lunch_start ? (attendance.lunch_end ? new Date(attendance.lunch_end) - new Date(attendance.lunch_start) : now - new Date(attendance.lunch_start)) : 0
  const workMs = Math.max(0, shiftMs - lunchMs)
  const isWorking = attendance && !attendance.clock_out
  const isOnLunch = attendance?.status === 'lunch'
  const isDone = attendance?.status === 'complete'

  const shiftColors = { morning: ['#1a3a5c','#60a5fa'], afternoon: ['#3a2500','#fbbf24'], night: ['#1e1a3a','#a78bfa'] }
  const sc = shiftColors[profile.shift] || shiftColors.morning

  const D = {
    bg: '#0f1117', sidebar: '#161b27', card: '#1a2030',
    border: 'rgba(255,255,255,0.08)', text: '#f0f0f0',
    muted: '#8892a4', hint: '#4a5568',
  }

  const btn = (bg, disabled) => ({
    display:'inline-flex', alignItems:'center', gap:6, padding:'9px 16px',
    borderRadius:8, fontSize:13, fontWeight:500, border:'none',
    background: disabled ? '#2a2f3a' : bg, color: disabled ? '#4a5568' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer', fontFamily:'inherit'
  })

  const navBtn = (id) => ({
    display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:8,
    cursor:'pointer', fontSize:13, color: page===id ? '#fff' : D.muted,
    background: page===id ? 'rgba(255,255,255,0.08)' : 'transparent',
    fontWeight: page===id ? 500 : 400, border:'none', width:'100%',
    textAlign:'left', fontFamily:'inherit', marginBottom:2
  })

  const card = { background: D.card, border: `0.5px solid ${D.border}`, borderRadius:12, padding:18, marginBottom:16 }
  const metric = { background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'12px 14px', border:`0.5px solid ${D.border}` }
  const input = { width:'100%', padding:'9px 11px', borderRadius:8, border:`0.5px solid rgba(255,255,255,0.12)`, background:'rgba(255,255,255,0.06)', color:D.text, fontSize:13, fontFamily:'inherit', outline:'none' }

  const badge = (bg, color, text) => (
    <span style={{display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:500,background:bg,color}}>{text}</span>
  )

  const pendingSwaps = swaps.filter(s => s.target_id === uid && s.target_response === 'pending')

  return (
    <div style={{minHeight:'100vh',background:D.bg,fontFamily:'system-ui,sans-serif',display:'flex',color:D.text}}>

      <div style={{width:220,flexShrink:0,background:D.sidebar,borderRight:`0.5px solid ${D.border}`,display:'flex',flexDirection:'column',minHeight:'100vh'}}>
        <div style={{padding:'20px 16px 14px',borderBottom:`0.5px solid ${D.border}`}}>
          <div style={{fontSize:16,fontWeight:600,marginBottom:2}}>🛡️ ModControl</div>
          <div style={{fontSize:12,color:D.muted,marginTop:2}}>{profile.name}</div>
          <div style={{marginTop:8}}>{badge(sc[0],sc[1],profile.shift+' shift')}</div>
        </div>
        <div style={{padding:'12px 10px',flex:1}}>
          <div style={{fontSize:11,fontWeight:500,color:D.hint,textTransform:'uppercase',letterSpacing:'.08em',padding:'0 10px',marginBottom:6}}>Navigation</div>
          {[['dashboard','📊 Dashboard'],['attendance','🕐 Attendance'],['vacation','🏖 Vacation'],['swaps',`🔄 Shift Swaps${pendingSwaps.length>0?' ('+pendingSwaps.length+')':''}`],['profile','👤 Profile']].map(([id,label]) => (
            <button key={id} style={navBtn(id)} onClick={() => setPage(id)}>{label}</button>
          ))}
        </div>
        <div style={{padding:'10px 16px 18px',borderTop:`0.5px solid ${D.border}`}}>
          <button onClick={logout} style={{...btn('rgba(255,255,255,0.08)',false),width:'100%',justifyContent:'center',color:D.muted}}>Sign out</button>
        </div>
      </div>

      <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
        <div style={{height:54,background:D.sidebar,borderBottom:`0.5px solid ${D.border}`,display:'flex',alignItems:'center',padding:'0 20px'}}>
          <div style={{flex:1,fontSize:15,fontWeight:500,textTransform:'capitalize'}}>{page.replace('swaps','Shift Swaps')}</div>
          <div style={{fontSize:13,color:D.muted}}>{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:20}}>

          {page === 'dashboard' && <>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:16}}>
              {[['Allowance','15',''],['Used',String(profile.vacation_used),'#60a5fa'],['Remaining',String(profile.vacation_allowance-profile.vacation_used),'#4ade80'],['Shift time',isWorking&&!isDone?fmtMs(shiftMs):'--:--:--','#60a5fa']].map(([l,v,c])=>(
                <div key={l} style={metric}>
                  <div style={{fontSize:11,color:D.hint,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:6}}>{l}</div>
                  <div style={{fontSize:24,fontWeight:500,color:c||D.text,fontVariantNumeric:'tabular-nums'}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={card}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:8}}>
                <div>
                  <div style={{fontSize:17,fontWeight:500,marginBottom:6}}>{profile.name}</div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    {badge(sc[0],sc[1],profile.shift)}
                    <span style={{fontSize:13,color:isOnLunch?'#fbbf24':isDone?D.muted:isWorking?'#4ade80':D.hint}}>
                      {isDone?'✓ Complete':isOnLunch?'On lunch':isWorking?'● On shift':'Not clocked in'}
                    </span>
                  </div>
                </div>
              </div>
              {isWorking && !isDone && (
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
                  {[['Shift time',fmtMs(shiftMs),'#60a5fa'],['Lunch',fmtMs(lunchMs),'#fbbf24'],['Worked',fmtMs(workMs),'#4ade80']].map(([l,v,c])=>(
                    <div key={l} style={metric}><div style={{fontSize:11,color:D.hint,marginBottom:4}}>{l}</div><div style={{fontSize:18,fontWeight:500,color:c,fontVariantNumeric:'tabular-nums'}}>{v}</div></div>
                  ))}
                </div>
              )}
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <button style={btn('#166534',!!attendance)} disabled={!!attendance} onClick={clockIn}>▶ Clock in</button>
                <button style={btn('#1e40af',!isWorking||isOnLunch||isDone)} disabled={!isWorking||isOnLunch||isDone} onClick={lunchStart}>☕ Start lunch</button>
                <button style={btn('#92400e',!isOnLunch)} disabled={!isOnLunch} onClick={lunchEnd}>✕ End lunch</button>
                <button style={btn('#991b1b',!isWorking||isOnLunch||isDone)} disabled={!isWorking||isOnLunch||isDone} onClick={clockOut}>■ Clock out</button>
              </div>
              {isDone && <div style={{marginTop:12,padding:'10px 12px',background:'rgba(74,222,128,0.1)',borderRadius:8,fontSize:13,color:'#4ade80',border:'0.5px solid rgba(74,222,128,0.2)'}}>✓ Shift complete — {attendance.total_hours}h worked · {attendance.lunch_minutes}m lunch</div>}
            </div>
          </>}

          {page === 'attendance' && (
            <div style={card}>
              <div style={{fontSize:14,fontWeight:500,marginBottom:12}}>Today's record</div>
              {attendance ? (
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
                  {[['Clock in',attendance.clock_in],['Lunch start',attendance.lunch_start],['Lunch end',attendance.lunch_end],['Clock out',attendance.clock_out]].map(([l,v])=>(
                    <div key={l} style={metric}>
                      <div style={{fontSize:11,color:D.hint,marginBottom:4}}>{l}</div>
                      <div style={{fontSize:18,fontWeight:500}}>{v?new Date(v).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):'—'}</div>
                    </div>
                  ))}
                </div>
              ) : <div style={{fontSize:13,color:D.muted,padding:'12px 0'}}>No record today — clock in to start.</div>}
              {isDone && <div style={{marginTop:12,padding:'10px 12px',background:'rgba(74,222,128,0.08)',borderRadius:8,fontSize:13,color:'#4ade80'}}>{attendance.total_hours}h worked · {attendance.lunch_minutes}m lunch</div>}
            </div>
          )}

          {page === 'vacation' && <>
            <div style={card}>
              <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>New vacation request</div>
              <form onSubmit={submitVacation}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                  <div><label style={{fontSize:12,fontWeight:500,color:D.muted,display:'block',marginBottom:5}}>Start date</label><input type="date" value={vacForm.start} onChange={e=>setVacForm(f=>({...f,start:e.target.value}))} required style={input} /></div>
                  <div><label style={{fontSize:12,fontWeight:500,color:D.muted,display:'block',marginBottom:5}}>End date</label><input type="date" value={vacForm.end} onChange={e=>setVacForm(f=>({...f,end:e.target.value}))} required style={input} /></div>
                </div>
                <div style={{marginBottom:14}}><label style={{fontSize:12,fontWeight:500,color:D.muted,display:'block',marginBottom:5}}>Notes</label><input type="text" value={vacForm.notes} onChange={e=>setVacForm(f=>({...f,notes:e.target.value}))} placeholder="Optional…" style={input} /></div>
                {vacMsg && <div style={{padding:'9px 12px',borderRadius:8,fontSize:13,marginBottom:12,background:vacMsg.startsWith('ok')?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.1)',color:vacMsg.startsWith('ok')?'#4ade80':'#f87171'}}>{vacMsg.split(':')[1]}</div>}
                <button type="submit" style={btn('#1e40af',false)}>Submit request</button>
              </form>
            </div>
            <div style={card}>
              <div style={{fontSize:14,fontWeight:500,marginBottom:12}}>Request history</div>
              {requests.length===0 && <div style={{fontSize:13,color:D.muted}}>No requests yet.</div>}
              {requests.map(r=>(
                <div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`0.5px solid ${D.border}`,fontSize:13}}>
                  <div><span style={{fontWeight:500}}>{r.start_date}</span><span style={{color:D.muted}}> → {r.end_date}</span><span style={{marginLeft:8,color:D.hint}}>{r.days_requested} days</span></div>
                  {badge(r.status==='approved'?'rgba(74,222,128,0.1)':r.status==='declined'?'rgba(248,113,113,0.1)':'rgba(251,191,36,0.1)',r.status==='approved'?'#4ade80':r.status==='declined'?'#f87171':'#fbbf24',r.status)}
                </div>
              ))}
            </div>
          </>}

          {page === 'swaps' && <>
            {pendingSwaps.length > 0 && (
              <div style={card}>
                <div style={{fontSize:14,fontWeight:500,marginBottom:12}}>⚠ Pending swap requests for you</div>
                {pendingSwaps.map(s => (
                  <div key={s.id} style={{padding:'12px',background:'rgba(251,191,36,0.06)',borderRadius:10,border:'0.5px solid rgba(251,191,36,0.2)',marginBottom:10}}>
                    <div style={{fontSize:13,marginBottom:8}}>
                      <span style={{fontWeight:500,color:'#fbbf24'}}>{s.requester?.name}</span>
                      <span style={{color:D.muted}}> wants to swap shifts on </span>
                      <span style={{fontWeight:500}}>{s.swap_date}</span>
                    </div>
                    <div style={{fontSize:12,color:D.muted,marginBottom:10}}>
                      Their shift: <span style={{color:D.text}}>{s.requester_shift}</span> ↔ Your shift: <span style={{color:D.text}}>{s.target_shift}</span>
                      {s.notes && <span style={{marginLeft:8}}>· "{s.notes}"</span>}
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <button style={btn('#166534',false)} onClick={()=>respondToSwap(s.id,true)}>✓ Accept</button>
                      <button style={btn('#991b1b',false)} onClick={()=>respondToSwap(s.id,false)}>✕ Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={card}>
              <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>Request a shift swap</div>
              <form onSubmit={submitSwap}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                  <div>
                    <label style={{fontSize:12,fontWeight:500,color:D.muted,display:'block',marginBottom:5}}>Swap with</label>
                    <select value={swapForm.target_id} onChange={e=>setSwapForm(f=>({...f,target_id:e.target.value}))} required style={{...input}}>
                      <option value="">Select a moderator…</option>
                      {allMods.filter(m=>m.id!==uid).map(m=>(
                        <option key={m.id} value={m.id}>{m.name} ({m.shift})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{fontSize:12,fontWeight:500,color:D.muted,display:'block',marginBottom:5}}>Date</label>
                    <input type="date" value={swapForm.swap_date} onChange={e=>setSwapForm(f=>({...f,swap_date:e.target.value}))} required style={input} />
                  </div>
                </div>
                <div style={{marginBottom:14}}>
                  <label style={{fontSize:12,fontWeight:500,color:D.muted,display:'block',marginBottom:5}}>Notes (optional)</label>
                  <input type="text" value={swapForm.notes} onChange={e=>setSwapForm(f=>({...f,notes:e.target.value}))} placeholder="Reason for swap…" style={input} />
                </div>
                {swapMsg && <div style={{padding:'9px 12px',borderRadius:8,fontSize:13,marginBottom:12,background:swapMsg.startsWith('ok')?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.1)',color:swapMsg.startsWith('ok')?'#4ade80':'#f87171'}}>{swapMsg.split(':')[1]}</div>}
                <button type="submit" style={btn('#1e40af',false)}>Send swap request</button>
              </form>
            </div>

            <div style={card}>
              <div style={{fontSize:14,fontWeight:500,marginBottom:12}}>Swap history</div>
              {swaps.filter(s=>s.target_response!=='pending'||s.requester_id===uid).length===0 && <div style={{fontSize:13,color:D.muted}}>No swaps yet.</div>}
              {swaps.map(s=>{
                const isRequester = s.requester_id === uid
                const otherName = isRequester ? s.target?.name : s.requester?.name
                const statusColor = s.status==='approved'?'#4ade80':s.status==='declined'?'#f87171':s.target_response==='accepted'?'#60a5fa':'#fbbf24'
                const statusLabel = s.status==='approved'?'Approved':s.status==='declined'?'Declined':s.target_response==='accepted'?'Waiting admin':s.target_response==='pending'?'Pending':'Declined'
                return (
                  <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`0.5px solid ${D.border}`,fontSize:13}}>
                    <div>
                      <span style={{color:D.muted}}>{isRequester?'You → ':'From '}</span>
                      <span style={{fontWeight:500}}>{otherName}</span>
                      <span style={{color:D.muted}}> · {s.swap_date}</span>
                    </div>
                    {badge(`rgba(255,255,255,0.05)`,statusColor,statusLabel)}
                  </div>
                )
              })}
            </div>
          </>}

          {page === 'profile' && (
            <div style={card}>
              <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:18}}>
                <div style={{width:52,height:52,borderRadius:'50%',background:sc[0],display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:600,color:sc[1]}}>
                  {profile.name.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div style={{fontSize:17,fontWeight:500,marginBottom:3}}>{profile.name}</div>
                  <div style={{fontSize:13,color:D.muted}}>{profile.role} · {profile.shift} shift</div>
                </div>
              </div>
              <div style={{borderTop:`0.5px solid ${D.border}`,paddingTop:14}}>
                {[['Shift hours','09:00–17:00 UTC+1'],['Vacation used',profile.vacation_used+' / '+profile.vacation_allowance+' days'],['Remaining',(profile.vacation_allowance-profile.vacation_used)+' days'],['Status',profile.status]].map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:`0.5px solid ${D.border}`,fontSize:13}}>
                    <span style={{color:D.muted}}>{k}</span><span style={{fontWeight:500}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}