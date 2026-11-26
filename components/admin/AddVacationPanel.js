import { fmtDate, workingDaysInRange } from '../../lib/utils'
import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

// Admin: record vacation days a moderator already took but that were never requested.
export function AddVacationPanel({ mods, onDone, onCancel }) {
  const [userId, setUserId]   = useState('')
  const [start, setStart]     = useState('')
  const [end, setEnd]         = useState('')
  const [override, setOverride] = useState('')
  const [notes, setNotes]     = useState('')
  const [clash, setClash]     = useState([])
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)

  const mod = mods.find(m => m.id === userId)
  const validRange = !!(userId && start && end && end >= start)
  const counted = validRange ? workingDaysInRange(new Date(start+'T00:00:00'), new Date(end+'T00:00:00'), mod) : 0
  const days = override !== '' ? Number(override) : counted
  const allowance = mod?.vacation_allowance || 15
  const usedAfter = (mod?.vacation_used || 0) + (Number.isFinite(days) ? days : 0)

  // Warn about vacations this mod already has in the same dates
  useEffect(() => {
    setClash([])
    if (!validRange) return
    supabase.from('vacation_requests').select('id,start_date,end_date,status')
      .eq('user_id', userId).in('status', ['approved','pending'])
      .lte('start_date', end).gte('end_date', start)
      .then(({ data }) => setClash(data || []))
  }, [userId, start, end])

  async function save() {
    setError(null)
    if (!validRange) { setError('Choose a moderator and a valid start and end date.'); return }
    if (!Number.isFinite(days) || days <= 0) { setError('The number of vacation days must be greater than 0.'); return }
    if (clash.length > 0) { setError('This moderator already has vacation in these dates. Delete the existing one first or pick other dates.'); return }
    if (usedAfter > allowance && !window.confirm(`${mod.name} will have ${usedAfter} of ${allowance} vacation days used (over the allowance). Add anyway?`)) return
    setSaving(true)
    try {
      const now = new Date().toISOString()
      const { error: e1 } = await supabase.from('vacation_requests').insert({
        user_id: userId, start_date: start, end_date: end, days_requested: days,
        status: 'approved', admin_notes: notes.trim() || 'Added by admin',
        submitted_at: now, reviewed_at: now,
      })
      if (e1) throw new Error(e1.message)
      const { data: prof } = await supabase.from('profiles').select('vacation_used').eq('id', userId).single()
      const { error: e2 } = await supabase.from('profiles').update({ vacation_used: (prof?.vacation_used || 0) + days }).eq('id', userId)
      if (e2) throw new Error(e2.message)
      onDone()
    } catch (e) { setError(e.message); setSaving(false) }
  }

  const field = { display:'flex', flexDirection:'column', gap:6, minWidth:150 }
  return (
    <div style={sa.card}>
      <div style={sa.cardHead}>
        <span style={sa.cardTitle}>Add vacation already taken</span>
        <button style={sa.filterBtn} onClick={onCancel}>Cancel</button>
      </div>
      <p style={{fontSize:'0.78rem', color:'#64748b', marginTop:0}}>Registers an approved vacation for dates that were never requested. Past dates are allowed. Only the days the moderator would have worked are counted (their days off are skipped).</p>
      {error && <div style={sa.errorBox}>{error}</div>}
      <div style={{display:'flex', gap:14, flexWrap:'wrap', alignItems:'flex-end'}}>
        <div style={field}>
          <span style={sa.label}>Moderator</span>
          <select style={sa.input} value={userId} onChange={e=>setUserId(e.target.value)}>
            <option value="">Select…</option>
            {mods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div style={field}>
          <span style={sa.label}>First day of vacation</span>
          <input type="date" style={sa.input} value={start} onChange={e=>{ setStart(e.target.value); if (!end || end < e.target.value) setEnd(e.target.value) }}/>
        </div>
        <div style={field}>
          <span style={sa.label}>Last day of vacation</span>
          <input type="date" style={sa.input} value={end} min={start || undefined} onChange={e=>setEnd(e.target.value)}/>
        </div>
        <div style={{...field, minWidth:110}}>
          <span style={sa.label}>Days to count</span>
          <input type="number" min="0" step="1" style={sa.input} value={override} placeholder={validRange ? String(counted) : 'auto'} onChange={e=>setOverride(e.target.value)}/>
        </div>
      </div>
      <div style={{...field, marginTop:14}}>
        <span style={sa.label}>Note (optional)</span>
        <input style={sa.input} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="e.g. Took these days before the system had vacation requests"/>
      </div>
      {validRange && (
        <div style={{marginTop:14, fontSize:'0.82rem', color:'#cbd5e1'}}>
          <strong style={{color:'#34d399'}}>{Number.isFinite(days) ? days : 0} vacation day(s)</strong> will be added for {mod?.name} ({fmtDate(start)} → {fmtDate(end)}).
          {override === '' && <span style={{color:'#64748b'}}> Counted automatically, skipping their days off. Type a number above to override.</span>}
          <div style={{color: usedAfter > allowance ? '#f87171' : '#64748b', marginTop:4}}>Used after: {usedAfter} / {allowance}</div>
        </div>
      )}
      {clash.length > 0 && (
        <div style={{...sa.errorBox, marginTop:12, marginBottom:0}}>
          ⚠ {mod?.name} already has vacation in these dates: {clash.map(c => `${fmtDate(c.start_date)} → ${fmtDate(c.end_date)} (${c.status})`).join(', ')}
        </div>
      )}
      <div style={{marginTop:16}}>
        <button style={{...sa.btnPrimary, opacity:(saving||clash.length>0)?0.5:1}} disabled={saving||clash.length>0} onClick={save}>{saving ? 'Saving…' : 'Add vacation'}</button>
      </div>
    </div>
  )
}
