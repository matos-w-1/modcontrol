import { fmtDate, notifyAdmins, toLocalISO } from '../../lib/utils'
import { SwapDebts } from './SwapDebts'
import { SwapCalendarPicker } from './SwapCalendarPicker'
import { s } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function PageSwaps({ userId, profile }) {
  const [swaps, setSwaps]         = useState([])
  const [mods, setMods]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ target_id:'', my_date:'', their_date:'', notes:'' })
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [{data:sw},{data:ms}] = await Promise.all([
      supabase.from('shift_swaps').select('*,requester:profiles!requester_id(name,shift),target:profiles!target_id(name,shift)').or(`requester_id.eq.${userId},target_id.eq.${userId}`).order('created_at',{ascending:false}),
      supabase.from('profiles').select('id,name,shift').eq('role','mod').neq('status','left').neq('id',userId),
    ])
    setSwaps(sw||[]); setMods(ms||[]); setLoading(false)
  }

  async function submitSwap() {
    setFormError(null)
    if(!form.target_id||!form.my_date||!form.their_date){setFormError('Please select both a day to give and a day to request.');return}
    if(form.my_date===form.their_date){setFormError('The two days must be different.');return}
    const todayIso = toLocalISO(new Date())
    if(form.my_date<todayIso||form.their_date<todayIso){setFormError('You cannot swap days that are in the past.');return}
    setSaving(true)
    // Block the request if either person already has a pending/approved swap on one of these days
    const ids=`(${userId},${form.target_id})`
    const dates=`(${form.my_date},${form.their_date})`
    const { data: clash } = await supabase.from('shift_swaps').select('id')
      .in('status',['pending','pending_admin','approved'])
      .or(`requester_id.in.${ids},target_id.in.${ids}`)
      .or(`swap_date.in.${dates},target_date.in.${dates}`)
      .limit(1)
    if (clash && clash.length > 0) { setFormError('One of you already has a swap on one of these days. Pick other days or wait for that request to be resolved.'); setSaving(false); return }
    const target=mods.find(m=>m.id===form.target_id)
    const {error}=await supabase.from('shift_swaps').insert({
      requester_id:userId, target_id:form.target_id,
      requester_shift:profile?.shift, target_shift:target?.shift,
      swap_date:form.my_date, target_date:form.their_date,
      notes:form.notes, status:'pending'
    })
    if(error){setFormError(error.message);setSaving(false);return}
    setShowForm(false); setForm({target_id:'',my_date:'',their_date:'',notes:''}); loadAll(); setSaving(false)
  }

  async function respondToSwap(id, response) {
    await supabase.from('shift_swaps').update({ target_response:response, status:response==='accepted'?'pending_admin':'declined' }).eq('id',id)
    if (response==='accepted') notifyAdmins('swap_pending_admin', id)
    loadAll()
  }

  const statusColor={pending:'#f59e0b',pending_admin:'#60a5fa',approved:'#34d399',declined:'#f87171'}

  return (
    <div style={s.content}>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Shift Swaps</h1>
        <button style={s.btnPrimary} onClick={()=>setShowForm(f=>!f)}>{showForm?'Cancel':'+ Request Swap'}</button>
      </div>

      <SwapDebts userId={userId}/>

      {showForm&&(
        <div style={s.card}>
          <div style={s.cardHead}><span style={s.cardTitle}>New Swap Request</span></div>
          {formError&&<div style={s.errorBox}>{formError}</div>}
          <SwapCalendarPicker userId={userId} form={form} setForm={setForm}/>
          <div style={{...s.formGroup, marginTop:12}}>
            <label style={s.label}>Notes (optional)</label>
            <input style={s.input} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Reason…"/>
          </div>
          <button style={{...s.btnPrimary,marginTop:16}} disabled={saving} onClick={submitSwap}>{saving?'Sending…':'Send Request'}</button>
        </div>
      )}

      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>My Swap Requests</span></div>
        {loading?<div style={s.empty}>Loading…</div>:swaps.length===0?<div style={s.empty}>No swap requests yet.</div>:swaps.map(r=>{
          const isTarget=r.target_id===userId
          const isPending=r.status==='pending'&&isTarget
          return (
            <div key={r.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:'1px solid #1e2433'}}>
              <div style={{flex:1}}>
                <div style={{fontSize:'0.85rem',fontWeight:500,marginBottom:3}}>{r.requester?.name} ↔ {r.target?.name}</div>
                <div style={{fontSize:'0.75rem',color:'#64748b'}}>{fmtDate(r.swap_date)} ↔ {fmtDate(r.target_date)}{r.notes ? ` · ${r.notes}` : ''}</div>
              </div>
              {isPending?(
                <div style={{display:'flex',gap:8}}>
                  <button style={{background:'#16a34a22',color:'#34d399',border:'1px solid #16a34a44',padding:'4px 12px',borderRadius:6,cursor:'pointer',fontSize:'0.78rem',fontWeight:600}} onClick={()=>respondToSwap(r.id,'accepted')}>Accept</button>
                  <button style={{background:'#dc262622',color:'#f87171',border:'1px solid #dc262644',padding:'4px 12px',borderRadius:6,cursor:'pointer',fontSize:'0.78rem',fontWeight:600}} onClick={()=>respondToSwap(r.id,'declined')}>Decline</button>
                </div>
              ):(
                <span style={{fontSize:'0.72rem',fontWeight:600,padding:'3px 10px',borderRadius:20,background:(statusColor[r.status]||'#94a3b8')+'22',color:statusColor[r.status]||'#94a3b8'}}>{r.status}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
