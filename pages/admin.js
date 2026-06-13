import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Admin() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [mods, setMods] = useState([])
  const [requests, setRequests] = useState([])
  const [swaps, setSwaps] = useState([])
  const [attendanceLogs, setAttendanceLogs] = useState([])
  const [page, setPage] = useState('dashboard')
  const [noteMap, setNoteMap] = useState({})
  const [editMod, setEditMod] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editMsg, setEditMsg] = useState('')
  const [newMod, setNewMod] = useState({ email:'', name:'', password:'', shift:'morning' })
  const [newModMsg, setNewModMsg] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [selectedMod, setSelectedMod] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      checkAdmin(session.user.id)
    })
  }, [])

  async function checkAdmin(uid) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
    if (!data || data.role !== 'admin') { router.push('/dashboard'); return }
    setProfile(data)
    loadAll()
  }

  async function loadAll() {
    loadMods()
    loadRequests()
    loadSwaps()
    loadAttendance()
  }

  async function loadMods() {
    const { data } = await supabase.from('profiles').select('*').order('name')
    if (data) setMods(data)
  }

  async function loadRequests() {
    const { data } = await supabase.from('vacation_requests')
      .select('*, profiles(name,shift)').order('submitted_at', { ascending: false })
    if (data) setRequests(data)
  }

  async function loadSwaps() {
    const { data } = await supabase.from('shift_swaps')
      .select('*, requester:requester_id(name,shift), target:target_id(name,shift)')
      .order('created_at', { ascending: false })
    if (data) setSwaps(data)
  }

  async function loadAttendance() {
    const { data } = await supabase.from('attendance')
      .select('*, profiles(name,shift)')
      .order('created_at', { ascending: false })
      .limit(100)
    if (data) setAttendanceLogs(data)
  }

  async function reviewRequest(id, status, userId, days) {
    await supabase.from('vacation_requests').update({
      status, admin_notes: noteMap[id] || '', reviewed_at: new Date().toISOString()
    }).eq('id', id)
    if (status === 'approved') {
      const mod = mods.find(m => m.id === userId)
      if (mod) await supabase.from('profiles').update({ vacation_used: (mod.vacation_used||0) + days }).eq('id', userId)
    }
    loadRequests(); loadMods()
  }

  async function reviewSwap(id, approved) {
    await supabase.from('shift_swaps').update({
      admin_response: approved ? 'approved' : 'declined',
      status: approved ? 'approved' : 'declined'
    }).eq('id', id)
    if (approved) {
      const swap = swaps.find(s => s.id === id)
      if (swap) {
        await supabase.from('profiles').update({ shift: swap.target_shift }).eq('id', swap.requester_id)
        await supabase.from('profiles').update({ shift: swap.requester_shift }).eq('id', swap.target_id)
      }
    }
    loadSwaps(); loadMods()
  }

  async function saveMod(e) {
    e.preventDefault()
    setEditMsg('')
    await supabase.from('profiles').update({
      name: editForm.name, shift: editForm.shift, role: editForm.role,
      status: editForm.status, vacation_allowance: parseInt(editForm.vacation_allowance),
      vacation_used: parseInt(editForm.vacation_used), birthday: editForm.birthday || null
    }).eq('id', editMod.id)
    setEditMsg('ok:Saved!')
    loadMods()
  }

  async function createMod(e) {
    e.preventDefault()
    setNewModMsg('')
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...newMod })
    })
    const data = await res.json()
    if (data.error) { setNewModMsg('error:' + data.error); return }
    setNewModMsg('ok:Moderator created!')
    setNewMod({ email:'', name:'', password:'', shift:'morning' })
    loadMods()
  }

  async function deleteMod(mod) {
    if (!confirm(`Remove ${mod.name}? This cannot be undone.`)) return
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', userId: mod.id })
    })
    loadMods()
    setEditMod(null)
  }

  async function updatePassword(e) {
    e.preventDefault()
    setPwMsg('')
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_password', userId: editMod.id, password: newPassword })
    })
    const data = await res.json()
    if (data.error) { setPwMsg('error:' + data.error); return }
    setPwMsg('ok:Password updated!')
    setNewPassword('')
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!profile) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'system-ui,sans-serif',background:'#0f1117',color:'#888',fontSize:15}}>Loading...</div>
  )

  const D = {
    bg:'#0f1117', sidebar:'#161b27', card:'#1a2030',
    border:'rgba(255,255,255,0.08)', text:'#f0f0f0',
    muted:'#8892a4', hint:'#4a5568',
  }

  const btn = (bg, disabled) => ({
    display:'inline-flex', alignItems:'center', gap:6, padding:'9px 16px',
    borderRadius:8, fontSize:13, fontWeight:500, border:'none',
    background: disabled?'#2a2f3a':bg, color: disabled?'#4a5568':'#fff',
    cursor: disabled?'not-allowed':'pointer', fontFamily:'inherit'
  })

  const navBtn = (id) => ({
    display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:8,
    cursor:'pointer', fontSize:13, color: page===id?'#fff':D.muted,
    background: page===id?'rgba(255,255,255,0.08)':'transparent',
    fontWeight: page===id?500:400, border:'none', width:'100%',
    textAlign:'left', fontFamily:'inherit', marginBottom:2
  })

  const card = { background:D.card, border:`0.5px solid ${D.border}`, borderRadius:12, padding:18, marginBottom:16 }
  const input = { width:'100%', padding:'9px 11px', borderRadius:8, border:`0.5px solid rgba(255,255,255,0.12)`, background:'rgba(255,255,255,0.06)', color:D.text, fontSize:13, fontFamily:'inherit', outline:'none' }
  const badge = (bg, color, text) => <span style={{display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:500,background:bg,color}}>{text}</span>
  const shiftBadge = { morning:['#1a3a5c','#60a5fa'], afternoon:['#3a2500','#fbbf24'], night:['#1e1a3a','#a78bfa'] }

  const pending = requests.filter(r => r.status === 'pending')
  const pendingSwaps = swaps.filter(s => s.status === 'waiting_admin')
  const todayLogs = attendanceLogs.filter(a => a.created_at?.slice(0,10) === new Date().toISOString().slice(0,10))

  const navItems = [
    ['dashboard','📊 Dashboard'],
    ['approvals',`✅ Approvals${pending.length>0?' ('+pending.length+')':''}`],
    ['swaps',`🔄 Swaps${pendingSwaps.length>0?' ('+pendingSwaps.length+')':''}`],
    ['mods','👥 Moderators'],
    ['attendance','🕐 Attendance'],
  ]

  return (
    <div style={{minHeight:'100vh',background:D.bg,fontFamily:'system-ui,sans-serif',display:'flex',color:D.text}}>
      <div style={{width:220,flexShrink:0,background:D.sidebar,borderRight:`0.5px solid ${D.border}`,display:'flex',flexDirection:'column',minHeight:'100vh'}}>
        <div style={{padding:'20px 16px 14px',borderBottom:`0.5px solid ${D.border}`}}>
          <div style={{fontSize:16,fontWeight:600,marginBottom:2}}>🛡️ ModControl</div>
          <div style={{fontSize:12,color:D.muted,marginTop:2}}>Admin · {profile.name}</div>
        </div>
        <div style={{padding:'12px 10px',flex:1}}>
          {navItems.map(([id,label]) => (
            <button key={id} style={navBtn(id)} onClick={()=>{ setPage(id); setEditMod(null); setEditMsg(''); setNewModMsg('') }}>{label}</button>
          ))}
        </div>
        <div style={{padding:'10px 16px 18px',borderTop:`0.5px solid ${D.border}`}}>
          <button onClick={logout} style={{...btn('rgba(255,255,255,0.08)',false),width:'100%',justifyContent:'center',color:D.muted}}>Sign out</button>
        </div>
      </div>

      <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
        <div style={{height:54,background:D.sidebar,borderBottom:`0.5px solid ${D.border}`,display:'flex',alignItems:'center',padding:'0 20px'}}>
          <div style={{flex:1,fontSize:15,fontWeight:500,textTransform:'capitalize'}}>{page}</div>
          <div style={{fontSize:13,color:D.muted}}>{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:20}}>

          {page==='dashboard' && <>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:16}}>
              {[['Active mods',String(mods.filter(m=>m.status==='active').length),'#4ade80'],['Pending approvals',String(pending.length),'#fbbf24'],['Pending swaps',String(pendingSwaps.length),'#60a5fa'],['On shift now',String(todayLogs.filter(a=>a.status==='active').length),'#a78bfa']].map(([l,v,c])=>(
                <div key={l} style={{background:'rgba(255,255,255,0.04)',borderRadius:10,padding:'12px 14px',border:`0.5px solid ${D.border}`}}>
                  <div style={{fontSize:11,color:D.hint,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:6}}>{l}</div>
                  <div style={{fontSize:24,fontWeight:500,color:c}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={card}>
              <div style={{fontSize:14,fontWeight:500,marginBottom:12}}>Team overview</div>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead><tr>{['Mod','Shift','Status','Used','Remaining','Today'].map(h=><th key={h} style={{textAlign:'left',padding:'7px 8px',fontSize:11,color:D.hint,borderBottom:`0.5px solid ${D.border}`,fontWeight:500,textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
                <tbody>
                  {mods.filter(m=>m.status==='active'&&m.role!=='admin').map(m=>{
                    const log = todayLogs.find(a=>a.user_id===m.id)
                    const clockInTime = log?.clock_in ? new Date(log.clock_in).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) : '—'
                    const clockOutTime = log?.clock_out ? new Date(log.clock_out).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) : '—'
                    const todayStatus = log ? (log.status==='complete'?'done':log.status==='lunch'?'lunch':'active') : 'absent'
                    const todayColor = todayStatus==='done'?'#4ade80':todayStatus==='lunch'?'#fbbf24':todayStatus==='active'?'#60a5fa':'#4a5568'
                    return (
                      <tr key={m.id}>
                        <td style={{padding:'9px 8px',borderBottom:`0.5px solid ${D.border}`,fontWeight:500}}>{m.name}</td>
                        <td style={{padding:'9px 8px',borderBottom:`0.5px solid ${D.border}`}}>{badge(...(shiftBadge[m.shift]||['#333','#aaa']),m.shift)}</td>
                        <td style={{padding:'9px 8px',borderBottom:`0.5px solid ${D.border}`}}>{badge(m.status==='active'?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.1)',m.status==='active'?'#4ade80':'#f87171',m.status)}</td>
                        <td style={{padding:'9px 8px',borderBottom:`0.5px solid ${D.border}`,color:'#60a5fa'}}>{m.vacation_used}</td>
                        <td style={{padding:'9px 8px',borderBottom:`0.5px solid ${D.border}`,color:(m.vacation_allowance-m.vacation_used)<=3?'#f87171':'#4ade80',fontWeight:500}}>{m.vacation_allowance-m.vacation_used}</td>
                        <td style={{padding:'9px 8px',borderBottom:`0.5px solid ${D.border}`,fontSize:12}}>
                          <span style={{color:todayColor,fontWeight:500}}>{todayStatus==='absent'?'absent':todayStatus==='done'?`${clockInTime}–${clockOutTime}`:todayStatus==='lunch'?`in ${clockInTime} (lunch)`:`in ${clockInTime}`}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>}

          {page==='approvals' && (
            <div style={card}>
              <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>Vacation requests</div>
              {pending.length===0 && <div style={{fontSize:13,color:D.muted,padding:'8px 0'}}>No pending requests.</div>}
              {pending.map(r=>{
                const days=r.days_requested
                const diffDays=Math.round((new Date(r.start_date)-new Date())/86400000)
                const mod=mods.find(m=>m.id===r.user_id)
                const remaining=mod?(mod.vacation_allowance-mod.vacation_used):15
                const warnings=[]
                if(days>5)warnings.push('Exceeds 5 consecutive days')
                if(diffDays<21)warnings.push('Less than 21 days notice')
                if(days>remaining)warnings.push('Insufficient balance')
                return (
                  <div key={r.id} style={{border:`0.5px solid ${D.border}`,borderRadius:10,padding:14,marginBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                      <div style={{fontSize:14,fontWeight:500}}>{r.profiles?.name} <span style={{fontSize:12,color:D.muted,fontWeight:400}}>· {r.profiles?.shift} shift</span></div>
                      {badge('rgba(251,191,36,0.1)','#fbbf24','pending')}
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,fontSize:13,marginBottom:10}}>
                      {[['Start',r.start_date],['End',r.end_date],['Days',String(days)],['Submitted',r.submitted_at?.slice(0,10)]].map(([l,v])=>(
                        <div key={l}><div style={{color:D.hint,fontSize:11,marginBottom:2}}>{l}</div><div style={{fontWeight:500}}>{v}</div></div>
                      ))}
                    </div>
                    {warnings.length>0
                      ? warnings.map(w=><div key={w} style={{padding:'6px 10px',background:'rgba(251,191,36,0.08)',borderRadius:8,fontSize:12,color:'#fbbf24',marginBottom:6}}>⚠ {w}</div>)
                      : <div style={{padding:'6px 10px',background:'rgba(74,222,128,0.08)',borderRadius:8,fontSize:12,color:'#4ade80',marginBottom:10}}>✓ All validations passed</div>
                    }
                    <div style={{display:'flex',gap:8,alignItems:'center',marginTop:10}}>
                      <button style={btn('#166534',false)} onClick={()=>reviewRequest(r.id,'approved',r.user_id,days)}>✓ Approve</button>
                      <button style={btn('#991b1b',false)} onClick={()=>reviewRequest(r.id,'declined',r.user_id,days)}>✕ Decline</button>
                      <input type="text" placeholder="Note…" value={noteMap[r.id]||''} onChange={e=>setNoteMap(m=>({...m,[r.id]:e.target.value}))} style={{...input,flex:1,width:'auto'}} />
                    </div>
                  </div>
                )
              })}
              {requests.filter(r=>r.status!=='pending').length>0 && <>
                <div style={{fontSize:12,color:D.hint,margin:'16px 0 8px',textTransform:'uppercase',letterSpacing:'.05em'}}>Reviewed</div>
                {requests.filter(r=>r.status!=='pending').map(r=>(
                  <div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:`0.5px solid ${D.border}`,fontSize:13}}>
                    <div><span style={{fontWeight:500}}>{r.profiles?.name}</span><span style={{color:D.muted}}> · {r.start_date} → {r.end_date} · {r.days_requested}d</span>{r.admin_notes&&<span style={{color:D.hint,fontSize:12}}> · "{r.admin_notes}"</span>}</div>
                    {badge(r.status==='approved'?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.1)',r.status==='approved'?'#4ade80':'#f87171',r.status)}
                  </div>
                ))}
              </>}
            </div>
          )}

          {page==='swaps' && (
            <div style={card}>
              <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>Shift swap requests</div>
              {pendingSwaps.length===0 && <div style={{fontSize:13,color:D.muted,padding:'8px 0'}}>No swaps waiting for approval.</div>}
              {pendingSwaps.map(s=>(
                <div key={s.id} style={{border:`0.5px solid ${D.border}`,borderRadius:10,padding:14,marginBottom:12}}>
                  <div style={{fontSize:14,fontWeight:500,marginBottom:8}}>
                    <span style={{color:'#60a5fa'}}>{s.requester?.name}</span><span style={{color:D.muted}}> ↔ </span><span style={{color:'#a78bfa'}}>{s.target?.name}</span>
                    <span style={{color:D.muted,fontSize:13,fontWeight:400}}> · {s.swap_date}</span>
                  </div>
                  <div style={{fontSize:13,color:D.muted,marginBottom:8}}>
                    {s.requester?.name}: <span style={{color:D.text}}>{s.requester_shift}</span> ↔ {s.target?.name}: <span style={{color:D.text}}>{s.target_shift}</span>
                    {s.notes&&<span style={{marginLeft:8}}>· "{s.notes}"</span>}
                  </div>
                  <div style={{display:'inline-block',padding:'4px 10px',background:'rgba(74,222,128,0.08)',borderRadius:8,fontSize:12,color:'#4ade80',marginBottom:10}}>✓ Both mods agreed</div>
                  <div style={{display:'flex',gap:8}}>
                    <button style={btn('#166534',false)} onClick={()=>reviewSwap(s.id,true)}>✓ Approve</button>
                    <button style={btn('#991b1b',false)} onClick={()=>reviewSwap(s.id,false)}>✕ Decline</button>
                  </div>
                </div>
              ))}
              {swaps.filter(s=>s.status!=='waiting_admin'&&s.status!=='pending').length>0 && <>
                <div style={{fontSize:12,color:D.hint,margin:'16px 0 8px',textTransform:'uppercase',letterSpacing:'.05em'}}>History</div>
                {swaps.filter(s=>s.status!=='waiting_admin'&&s.status!=='pending').map(s=>(
                  <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:`0.5px solid ${D.border}`,fontSize:13}}>
                    <div><span style={{fontWeight:500}}>{s.requester?.name}</span><span style={{color:D.muted}}> ↔ {s.target?.name} · {s.swap_date}</span></div>
                    {badge(s.status==='approved'?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.1)',s.status==='approved'?'#4ade80':'#f87171',s.status)}
                  </div>
                ))}
              </>}
            </div>
          )}

          {page==='mods' && !editMod && <>
            <div style={card}>
              <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>Add new moderator</div>
              <form onSubmit={createMod}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                  <div><label style={{fontSize:12,fontWeight:500,color:D.muted,display:'block',marginBottom:5}}>Display name</label><input type="text" value={newMod.name} onChange={e=>setNewMod(f=>({...f,name:e.target.value}))} required placeholder="Jay" style={input} /></div>
                  <div><label style={{fontSize:12,fontWeight:500,color:D.muted,display:'block',marginBottom:5}}>Email</label><input type="email" value={newMod.email} onChange={e=>setNewMod(f=>({...f,email:e.target.value}))} required placeholder="jay@team.co" style={input} /></div>
                  <div><label style={{fontSize:12,fontWeight:500,color:D.muted,display:'block',marginBottom:5}}>Password</label><input type="password" value={newMod.password} onChange={e=>setNewMod(f=>({...f,password:e.target.value}))} required placeholder="Min 6 characters" style={input} /></div>
                  <div><label style={{fontSize:12,fontWeight:500,color:D.muted,display:'block',marginBottom:5}}>Shift</label>
                    <select value={newMod.shift} onChange={e=>setNewMod(f=>({...f,shift:e.target.value}))} style={input}>
                      <option value="morning">Morning (09:00–17:00)</option>
                      <option value="afternoon">Afternoon (17:00–00:00)</option>
                      <option value="night">Night (00:00–09:00)</option>
                    </select>
                  </div>
                </div>
                {newModMsg&&<div style={{padding:'9px 12px',borderRadius:8,fontSize:13,marginBottom:12,background:newModMsg.startsWith('ok')?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.1)',color:newModMsg.startsWith('ok')?'#4ade80':'#f87171'}}>{newModMsg.split(':')[1]}</div>}
                <button type="submit" style={btn('#1e40af',false)}>+ Add moderator</button>
              </form>
            </div>
            <div style={card}>
              <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>All moderators</div>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead><tr>{['Name','Shift','Role','Used','Remaining','Status',''].map(h=><th key={h} style={{textAlign:'left',padding:'7px 8px',fontSize:11,color:D.hint,borderBottom:`0.5px solid ${D.border}`,fontWeight:500,textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
                <tbody>
                  {mods.map(m=>(
                    <tr key={m.id}>
                      <td style={{padding:'9px 8px',borderBottom:`0.5px solid ${D.border}`,fontWeight:500}}>{m.name}</td>
                      <td style={{padding:'9px 8px',borderBottom:`0.5px solid ${D.border}`}}>{badge(...(shiftBadge[m.shift]||['#333','#aaa']),m.shift)}</td>
                      <td style={{padding:'9px 8px',borderBottom:`0.5px solid ${D.border}`,color:D.muted}}>{m.role}</td>
                      <td style={{padding:'9px 8px',borderBottom:`0.5px solid ${D.border}`,color:'#60a5fa'}}>{m.vacation_used}</td>
                      <td style={{padding:'9px 8px',borderBottom:`0.5px solid ${D.border}`,color:(m.vacation_allowance-m.vacation_used)<=3?'#f87171':'#4ade80',fontWeight:500}}>{m.vacation_allowance-m.vacation_used}</td>
                      <td style={{padding:'9px 8px',borderBottom:`0.5px solid ${D.border}`}}>{badge(m.status==='active'?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.1)',m.status==='active'?'#4ade80':'#f87171',m.status)}</td>
                      <td style={{padding:'9px 8px',borderBottom:`0.5px solid ${D.border}`}}>
                        <button style={{...btn('rgba(255,255,255,0.08)',false),padding:'5px 10px',fontSize:12}} onClick={()=>{ setEditMod(m); setEditForm({...m,birthday:m.birthday||''}); setEditMsg(''); setPwMsg('') }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>}

          {page==='mods' && editMod && <>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
              <button style={{...btn('rgba(255,255,255,0.08)',false),padding:'6px 12px',fontSize:12}} onClick={()=>setEditMod(null)}>← Back</button>
              <div style={{fontSize:15,fontWeight:500}}>Edit — {editMod.name}</div>
              <button style={{...btn('#7f1d1d',false),padding:'6px 12px',fontSize:12,marginLeft:'auto'}} onClick={()=>deleteMod(editMod)}>🗑 Remove mod</button>
            </div>
            <div style={card}>
              <div style={{fontSize:13,fontWeight:500,color:D.muted,marginBottom:12}}>Profile</div>
              <form onSubmit={saveMod}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                  <div><label style={{fontSize:12,fontWeight:500,color:D.muted,display:'block',marginBottom:5}}>Display name</label><input type="text" value={editForm.name||''} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} required style={input} /></div>
                  <div><label style={{fontSize:12,fontWeight:500,color:D.muted,display:'block',marginBottom:5}}>Shift</label>
                    <select value={editForm.shift||'morning'} onChange={e=>setEditForm(f=>({...f,shift:e.target.value}))} style={input}>
                      <option value="morning">Morning (09:00–17:00)</option>
                      <option value="afternoon">Afternoon (17:00–00:00)</option>
                      <option value="night">Night (00:00–09:00)</option>
                    </select>
                  </div>
                  <div><label style={{fontSize:12,fontWeight:500,color:D.muted,display:'block',marginBottom:5}}>Role</label>
                    <select value={editForm.role||'moderator'} onChange={e=>setEditForm(f=>({...f,role:e.target.value}))} style={input}>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div><label style={{fontSize:12,fontWeight:500,color:D.muted,display:'block',marginBottom:5}}>Status</label>
                    <select value={editForm.status||'active'} onChange={e=>setEditForm(f=>({...f,status:e.target.value}))} style={input}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div><label style={{fontSize:12,fontWeight:500,color:D.muted,display:'block',marginBottom:5}}>Birthday</label><input type="date" value={editForm.birthday||''} onChange={e=>setEditForm(f=>({...f,birthday:e.target.value}))} style={input} /></div>
                  <div><label style={{fontSize:12,fontWeight:500,color:D.muted,display:'block',marginBottom:5}}>Vacation allowance</label><input type="number" value={editForm.vacation_allowance||15} onChange={e=>setEditForm(f=>({...f,vacation_allowance:e.target.value}))} style={input} /></div>
                  <div><label style={{fontSize:12,fontWeight:500,color:D.muted,display:'block',marginBottom:5}}>Vacation used</label><input type="number" value={editForm.vacation_used||0} onChange={e=>setEditForm(f=>({...f,vacation_used:e.target.value}))} style={input} /></div>
                </div>
                {editMsg&&<div style={{padding:'9px 12px',borderRadius:8,fontSize:13,marginBottom:12,background:'rgba(74,222,128,0.1)',color:'#4ade80'}}>{editMsg.split(':')[1]}</div>}
                <button type="submit" style={btn('#1e40af',false)}>Save changes</button>
              </form>
            </div>
            <div style={card}>
              <div style={{fontSize:13,fontWeight:500,color:D.muted,marginBottom:12}}>Change password</div>
              <form onSubmit={updatePassword}>
                <div style={{display:'flex',gap:12,alignItems:'flex-end'}}>
                  <div style={{flex:1}}><label style={{fontSize:12,fontWeight:500,color:D.muted,display:'block',marginBottom:5}}>New password</label><input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required placeholder="Min 6 characters" style={input} /></div>
                  <button type="submit" style={{...btn('#854d0e',false),padding:'9px 16px',whiteSpace:'nowrap'}}>Update password</button>
                </div>
                {pwMsg&&<div style={{padding:'9px 12px',borderRadius:8,fontSize:13,marginTop:10,background:pwMsg.startsWith('ok')?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.1)',color:pwMsg.startsWith('ok')?'#4ade80':'#f87171'}}>{pwMsg.split(':')[1]}</div>}
              </form>
            </div>
            <div style={card}>
              <div style={{fontSize:13,fontWeight:500,color:D.muted,marginBottom:12}}>Attendance log — {editMod.name}</div>
              {attendanceLogs.filter(a=>a.user_id===editMod.id).length===0 && <div style={{fontSize:13,color:D.hint}}>No records yet.</div>}
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead><tr>{['Date','Clock in','Lunch out','Lunch in','Clock out','Hours'].map(h=><th key={h} style={{textAlign:'left',padding:'7px 8px',fontSize:11,color:D.hint,borderBottom:`0.5px solid ${D.border}`,fontWeight:500,textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
                <tbody>
                  {attendanceLogs.filter(a=>a.user_id===editMod.id).map(a=>(
                    <tr key={a.id}>
                      {[a.created_at?.slice(0,10),a.clock_in,a.lunch_start,a.lunch_end,a.clock_out].map((v,i)=>(
                        <td key={i} style={{padding:'8px 8px',borderBottom:`0.5px solid ${D.border}`,color:v?D.text:D.hint}}>{v?(i===0?v:new Date(v).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})):'—'}</td>
                      ))}
                      <td style={{padding:'8px 8px',borderBottom:`0.5px solid ${D.border}`,color:a.total_hours?'#4ade80':D.hint}}>{a.total_hours?a.total_hours+'h':'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>}

          {page==='attendance' && (
            <div style={card}>
              <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>Full attendance log</div>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead><tr>{['Mod','Shift','Date','Clock in','Lunch','Clock out','Hours','Status'].map(h=><th key={h} style={{textAlign:'left',padding:'7px 8px',fontSize:11,color:D.hint,borderBottom:`0.5px solid ${D.border}`,fontWeight:500,textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
                <tbody>
                  {attendanceLogs.map(a=>(
                    <tr key={a.id}>
                      <td style={{padding:'8px 8px',borderBottom:`0.5px solid ${D.border}`,fontWeight:500}}>{a.profiles?.name}</td>
                      <td style={{padding:'8px 8px',borderBottom:`0.5px solid ${D.border}`}}>{badge(...(shiftBadge[a.profiles?.shift]||['#333','#aaa']),a.profiles?.shift||'—')}</td>
                      <td style={{padding:'8px 8px',borderBottom:`0.5px solid ${D.border}`,color:D.muted}}>{a.created_at?.slice(0,10)}</td>
                      <td style={{padding:'8px 8px',borderBottom:`0.5px solid ${D.border}`}}>{a.clock_in?new Date(a.clock_in).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):'—'}</td>
                      <td style={{padding:'8px 8px',borderBottom:`0.5px solid ${D.border}`,color:D.muted}}>{a.lunch_minutes?a.lunch_minutes+'m':'—'}</td>
                      <td style={{padding:'8px 8px',borderBottom:`0.5px solid ${D.border}`}}>{a.clock_out?new Date(a.clock_out).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):'—'}</td>
                      <td style={{padding:'8px 8px',borderBottom:`0.5px solid ${D.border}`,color:a.total_hours?'#4ade80':D.hint}}>{a.total_hours?a.total_hours+'h':'—'}</td>
                      <td style={{padding:'8px 8px',borderBottom:`0.5px solid ${D.border}`}}>{badge(a.status==='complete'?'rgba(74,222,128,0.1)':a.status==='lunch'?'rgba(251,191,36,0.1)':'rgba(96,165,250,0.1)',a.status==='complete'?'#4ade80':a.status==='lunch'?'#fbbf24':'#60a5fa',a.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
