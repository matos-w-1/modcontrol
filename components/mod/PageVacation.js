import { fmtDate, notifyAdmins, workingDaysInRange } from '../../lib/utils'
import { VacationDatePicker } from './VacationDatePicker'
import { s } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function PageVacation({ userId, profile, onProfileRefresh }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedDays, setSelectedDays] = useState([]) // sorted array of 'YYYY-MM-DD'
  const [saving, setSaving]     = useState(false)
  const [warnings, setWarnings] = useState([])
  const [formError, setFormError] = useState(null)

  useEffect(() => { loadRequests() }, [])

  async function loadRequests() {
    const {data} = await supabase.from('vacation_requests').select('*').eq('user_id',userId).order('submitted_at',{ascending:false})
    setRequests(data||[]); setLoading(false)
  }

  // Groups sorted ISO day strings into contiguous blocks, e.g.
  // ['2026-06-19','2026-06-20','2026-06-25'] -> [{start,end},{start,end}]
  function toBlocks(days) {
    const sorted = [...days].sort()
    const blocks = []
    let block = []
    sorted.forEach(d => {
      if (block.length === 0) { block = [d]; return }
      const prev = new Date(block[block.length-1])
      const cur  = new Date(d)
      const diff = Math.round((cur-prev)/86400000)
      if (diff === 1) block.push(d)
      else { blocks.push(block); block = [d] }
    })
    if (block.length) blocks.push(block)
    return blocks.map(b => ({ start: b[0], end: b[b.length-1] }))
  }

  async function validateRequest() {
    const warns=[]
    if (selectedDays.length===0) { setWarnings([]); return { totalDays:0, blocks:[], valid:false } }
    const blocks = toBlocks(selectedDays)
    const today=new Date(); today.setHours(0,0,0,0)
    let totalDays = 0
    blocks.forEach(b => { totalDays += workingDaysInRange(new Date(b.start), new Date(b.end), profile) })
    const earliest = new Date(blocks[0].start)
    const notice = Math.ceil((earliest-today)/86400000)
    const remaining=(profile?.vacation_allowance??15)-(profile?.vacation_used??0)-(profile?.vacation_pending??0)
    if(totalDays>remaining) warns.push(`⚠️ Requesting ${totalDays} days but only ${remaining} remaining.`)
    blocks.forEach(b => {
      const blockDays = workingDaysInRange(new Date(b.start), new Date(b.end), profile)
      if (blockDays>5) warns.push(`⚠️ Maximum 5 consecutive days allowed (${fmtDate(b.start)} → ${fmtDate(b.end)} is ${blockDays}).`)
    })
    if(notice<21) warns.push(`⚠️ Minimum 21 days notice required (you have ${notice} days).`)
    if(profile?.shift) {
      const { data: sameShift } = await supabase.from('profiles').select('id,name').eq('role','mod').eq('shift',profile.shift).neq('id',userId)
      const ids = (sameShift||[]).map(p=>p.id)
      if (ids.length>0) {
        const nameMap={}; (sameShift||[]).forEach(p=>{nameMap[p.id]=p.name})
        for (const b of blocks) {
          const { data: overlapping } = await supabase.from('vacation_requests').select('user_id,start_date,end_date,status')
            .in('user_id',ids).in('status',['approved','pending']).lte('start_date',b.end).gte('end_date',b.start)
          ;(overlapping||[]).forEach(o => {
            warns.push(`🔁 ${nameMap[o.user_id]||'A teammate'} (${profile.shift}) already has ${o.status} vacation ${fmtDate(o.start_date)} → ${fmtDate(o.end_date)}.`)
          })
        }
      }
    }
    setWarnings(warns)
    return { totalDays, blocks, valid: warns.length===0 }
  }

  async function submitRequest() {
    setFormError(null)
    if(selectedDays.length===0){setFormError('Please select at least one day.');return}
    const {totalDays, blocks, valid} = await validateRequest()
    if(!valid){setFormError('Please resolve the warnings above before submitting.');return}
    setSaving(true)
    for (const b of blocks) {
      const blockDays = workingDaysInRange(new Date(b.start), new Date(b.end), profile)
      const {data:created, error} = await supabase.from('vacation_requests').insert({
        user_id:userId, start_date:b.start, end_date:b.end,
        days_requested:blockDays, status:'pending', submitted_at:new Date().toISOString(), validation_warnings:warnings,
      }).select('id').single()
      if(error){setFormError(error.message);setSaving(false);return}
      if(created?.id) notifyAdmins('vacation_request', created.id)
    }
    await supabase.from('profiles').update({vacation_pending:(profile?.vacation_pending??0)+totalDays}).eq('id',userId)
    setShowForm(false); setSelectedDays([]); setWarnings([])
    loadRequests(); onProfileRefresh(); setSaving(false)
  }

  const statusColor={pending:'#f59e0b',approved:'#34d399',declined:'#f87171'}

  return (
    <div style={s.content}>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Vacation Requests</h1>
        <button style={s.btnPrimary} onClick={()=>setShowForm(f=>!f)}>{showForm?'Cancel':'+ New Request'}</button>
      </div>
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>My Balance</span></div>
        <div style={s.vacRow}>
          <div style={s.vacItem}><div style={s.vacNum}>{profile?.vacation_allowance??15}</div><div style={s.vacLabel}>Allowance</div></div>
          <div style={s.vacItem}><div style={{...s.vacNum,color:'#f87171'}}>{profile?.vacation_used??0}</div><div style={s.vacLabel}>Used</div></div>
          <div style={s.vacItem}><div style={{...s.vacNum,color:'#f59e0b'}}>{profile?.vacation_pending??0}</div><div style={s.vacLabel}>Pending</div></div>
          <div style={s.vacItem}><div style={{...s.vacNum,color:'#34d399'}}>{(profile?.vacation_allowance??15)-(profile?.vacation_used??0)-(profile?.vacation_pending??0)}</div><div style={s.vacLabel}>Remaining</div></div>
        </div>
      </div>
      {showForm && (
        <div style={s.card}>
          <div style={s.cardHead}><span style={s.cardTitle}>New Vacation Request</span></div>
          <VacationDatePicker profile={profile} myRequests={requests} selectedDays={selectedDays} setSelectedDays={setSelectedDays} onChange={()=>setWarnings([])}/>
          {selectedDays.length>0&&(
            <div style={{marginTop:12}}>
              <button style={{...s.filterBtn,marginBottom:12}} onClick={validateRequest}>Check Eligibility</button>
              {warnings.map((w,i)=><div key={i} style={{background:'#f59e0b22',border:'1px solid #f59e0b44',color:'#f59e0b',fontSize:'0.8rem',padding:'8px 12px',borderRadius:8,marginBottom:8}}>{w}</div>)}
              {warnings.length===0&&<div style={{background:'#34d39922',border:'1px solid #34d39944',color:'#34d399',fontSize:'0.8rem',padding:'8px 12px',borderRadius:8,marginBottom:8}}>✓ {toBlocks(selectedDays).reduce((sum,b)=>sum+workingDaysInRange(new Date(b.start),new Date(b.end),profile),0)} working day(s) selected — eligible.</div>}
            </div>
          )}
          {formError&&<div style={s.errorBox}>{formError}</div>}
          <button style={{...s.btnPrimary,marginTop:16,opacity:(saving||warnings.length>0)?0.5:1}} disabled={saving||warnings.length>0} onClick={submitRequest}>{saving?'Submitting…':warnings.length>0?'Resolve warnings to submit':'Submit Request'}</button>
        </div>
      )}
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>My Requests</span></div>
        {loading?<div style={s.empty}>Loading…</div>:requests.length===0?<div style={s.empty}>No vacation requests yet.</div>:requests.map(r=>(
          <div key={r.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:'1px solid #1e2433'}}>
            <div style={{flex:1}}>
              <div style={{fontSize:'0.85rem',fontWeight:500,marginBottom:3}}>{fmtDate(r.start_date)} → {fmtDate(r.end_date)}</div>
              <div style={{fontSize:'0.75rem',color:'#64748b'}}>{r.days_requested} days · Submitted {fmtDate(r.submitted_at)}{r.admin_notes&&<span style={{color:'#94a3b8'}}> · {r.admin_notes}</span>}</div>
            </div>
            <span style={{fontSize:'0.72rem',fontWeight:600,padding:'3px 10px',borderRadius:20,background:(statusColor[r.status]||'#94a3b8')+'22',color:statusColor[r.status]||'#94a3b8'}}>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
