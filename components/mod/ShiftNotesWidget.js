import { s } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function ShiftNotesWidget({ userId, attendanceId, isClockedIn }) {
  const [notes, setNotes]     = useState([])
  const [form, setForm]       = useState({ type:'locked_blacktide_rl', value:'' })
  const [saving, setSaving]   = useState(false)

 const TYPES = [
  { id:'locked_blacktide_rl',   label:'🔒 Blacktide — Rustyloot' },
  { id:'locked_blacktide_hunt', label:'🔒 Blacktide — Hunt' },
  { id:'coinflow_csdeals',      label:'🔒 Coinflow — CSDeals' },
  { id:'skin_manipulation',     label:'⚠️ Skin Manipulation' },
  { id:'free_coin_abuser',      label:'⚠️ Free Coin' },
  { id:'phone_abuser',          label:'⚠️ Phone Abuser' },
  { id:'referral_abuser',       label:'⚠️ Referral Abuser' },
]

  useEffect(() => {
    if (!attendanceId) return
    supabase.from('shift_notes').select('*').eq('attendance_id', attendanceId).order('created_at')
      .then(({data}) => setNotes(data||[]))
  }, [attendanceId])

  async function add() {
    if (!form.value.trim()) return
    setSaving(true)
    const ids = form.value.split(/[\n,\s]+/).filter(Boolean)
    await Promise.all(ids.map(v =>
      supabase.from('shift_notes').insert({ user_id:userId, attendance_id:attendanceId, type:form.type, value:v.trim() })
    ))
    setForm(f=>({...f, value:''}))
    const {data} = await supabase.from('shift_notes').select('*').eq('attendance_id', attendanceId).order('created_at')
    setNotes(data||[])
    setSaving(false)
  }

  async function remove(id) {
    await supabase.from('shift_notes').delete().eq('id', id)
    setNotes(n=>n.filter(x=>x.id!==id))
  }

  if (!isClockedIn) return null

  const grouped = TYPES.map(t => ({
    ...t,
    items: notes.filter(n=>n.type===t.id)
  })).filter(t=>t.items.length>0)

  const typeLabel = {}; TYPES.forEach(t=>typeLabel[t.id]=t.label)

  return (
    <div style={s.card}>
      <div style={s.cardHead}>
        <span style={s.cardTitle}>📋 Shift Notes</span>
        <span style={{fontSize:'0.68rem', color:'#64748b', background:'#1e2433', padding:'3px 8px', borderRadius:4}}>{notes.length} entries</span>
      </div>

      {/* Add form */}
      <div style={{display:'flex', gap:8, marginBottom:16, flexWrap:'wrap'}}>
        <select style={{...s.input, flex:1, minWidth:180}} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
          {TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <input style={{...s.input, flex:1, minWidth:120}} value={form.value} onChange={e=>setForm(f=>({...f,value:e.target.value}))} placeholder="ID or multiple IDs (space/comma/newline separated)" onKeyDown={e=>e.key==='Enter'&&add()}/>
        <button style={{...s.btnPrimary, padding:'9px 16px', flexShrink:0}} disabled={saving||!form.value.trim()} onClick={add}>
          {saving?'…':'Add'}
        </button>
      </div>

      {/* Grouped list */}
      {grouped.length===0 ? (
        <p style={s.empty}>No entries yet — add locked accounts and abusers as you go.</p>
      ) : grouped.map(group=>(
        <div key={group.id} style={{marginBottom:12}}>
          <div style={{fontSize:'0.72rem', color:'#94a3b8', fontWeight:600, marginBottom:6}}>{group.label}</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
            {group.items.map(item=>(
              <div key={item.id} style={{display:'flex', alignItems:'center', gap:6, background:'#0f1117', border:'1px solid #2d3748', borderRadius:6, padding:'4px 10px', fontSize:'0.8rem', color:'#e2e8f0'}}>
                {item.value}
                <span style={{cursor:'pointer', color:'#f87171', fontSize:'0.7rem', marginLeft:2}} onClick={()=>remove(item.id)}>✕</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
