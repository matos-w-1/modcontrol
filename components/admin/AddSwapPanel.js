import { fmtDate } from '../../lib/utils'
import { sa } from '../../lib/styles'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

// Admin: register a shift swap between two moderators directly. It is saved as already approved,
// and past dates are allowed (for swaps that happened without being requested in the dashboard).
export function AddSwapPanel({ mods, onDone, onCancel }) {
  const [aId, setAId]       = useState('')
  const [bId, setBId]       = useState('')
  const [aDate, setADate]   = useState('')   // day the first moderator gives away
  const [bDate, setBDate]   = useState('')   // day the second moderator gives away
  const [notes, setNotes]   = useState('')
  const [debt, setDebt]     = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)

  const a = mods.find(m => m.id === aId), b = mods.find(m => m.id === bId)

  async function save() {
    setError(null)
    if (!aId || !bId) { setError('Choose both moderators.'); return }
    if (aId === bId) { setError('Choose two different moderators.'); return }
    if (!aDate || !bDate) { setError('Choose both days.'); return }
    if (aDate === bDate) { setError('The two days must be different.'); return }
    setSaving(true)
    try {
      // Same check the moderators have: nobody can have two swaps on the same day
      const ids = `(${aId},${bId})`, dates = `(${aDate},${bDate})`
      const { data: clash } = await supabase.from('shift_swaps').select('id')
        .in('status', ['pending', 'pending_admin', 'approved'])
        .or(`requester_id.in.${ids},target_id.in.${ids}`)
        .or(`swap_date.in.${dates},target_date.in.${dates}`)
        .limit(1)
      if (clash && clash.length > 0) throw new Error('One of them already has a swap on one of these days. Delete or resolve that one first.')
      const { data: sw, error: e1 } = await supabase.from('shift_swaps').insert({
        requester_id: aId, target_id: bId,
        requester_shift: a?.shift, target_shift: b?.shift,
        swap_date: aDate, target_date: bDate,
        notes: notes.trim() || 'Added by admin',
        status: 'approved', target_response: 'accepted', admin_response: 'approved',
      }).select('id,swap_date').single()
      if (e1) throw new Error(e1.message)
      if (debt) {
        const { error: e2 } = await supabase.from('swap_debts').insert({ debtor_id: aId, creditor_id: bId, swap_id: sw.id, swap_date: sw.swap_date })
        if (e2) throw new Error(e2.message)
      }
      onDone()
    } catch (e) { setError(e.message); setSaving(false) }
  }

  const field = { display:'flex', flexDirection:'column', gap:6, minWidth:170 }
  const modOptions = mods.map(m => <option key={m.id} value={m.id}>{m.name}{m.shift ? ` · ${m.shift.replace(' Shift','')}` : ''}</option>)
  return (
    <div style={sa.card}>
      <div style={sa.cardHead}>
        <span style={sa.cardTitle}>Add a shift swap</span>
        <button style={sa.filterBtn} onClick={onCancel}>Cancel</button>
      </div>
      <p style={{fontSize:'0.78rem', color:'#64748b', marginTop:0}}>Registers a swap between two moderators as already approved. Past dates are allowed. Each moderator stops working the day they give away and works the day the other one gives away.</p>
      {error && <div style={sa.errorBox}>{error}</div>}
      <div style={{display:'flex', gap:14, flexWrap:'wrap', alignItems:'flex-end', marginBottom:14}}>
        <div style={field}>
          <span style={sa.label}>First moderator</span>
          <select style={sa.input} value={aId} onChange={e=>setAId(e.target.value)}><option value="">Select…</option>{modOptions}</select>
        </div>
        <div style={field}>
          <span style={sa.label}>{a ? `${a.name} gives away` : 'Day they give away'}</span>
          <input type="date" style={sa.input} value={aDate} onChange={e=>setADate(e.target.value)}/>
        </div>
      </div>
      <div style={{display:'flex', gap:14, flexWrap:'wrap', alignItems:'flex-end', marginBottom:14}}>
        <div style={field}>
          <span style={sa.label}>Second moderator</span>
          <select style={sa.input} value={bId} onChange={e=>setBId(e.target.value)}><option value="">Select…</option>{modOptions}</select>
        </div>
        <div style={field}>
          <span style={sa.label}>{b ? `${b.name} gives away` : 'Day they give away'}</span>
          <input type="date" style={sa.input} value={bDate} onChange={e=>setBDate(e.target.value)}/>
        </div>
      </div>
      <div style={{...field, marginBottom:14}}>
        <span style={sa.label}>Note (optional)</span>
        <input style={sa.input} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Added by admin"/>
      </div>
      <label style={{display:'flex', alignItems:'center', gap:8, fontSize:'0.8rem', color:'#94a3b8', marginBottom:14, cursor:'pointer'}}>
        <input type="checkbox" checked={debt} onChange={e=>setDebt(e.target.checked)}/>
        Also record a swap debt{a && b ? ` (${a.name} owes ${b.name} a day off)` : ''}
      </label>
      {a && b && aDate && bDate && (
        <p style={{fontSize:'0.78rem', color:'#94a3b8', marginTop:0}}>{a.name} gives {fmtDate(aDate)} · {b.name} gives {fmtDate(bDate)}</p>
      )}
      <button style={sa.btnPrimary || sa.btnSmGreen} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Add swap'}</button>
    </div>
  )
}
