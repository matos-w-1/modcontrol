import { fmtDate, toLocalISO, SHIFT_COLORS } from '../../lib/utils'
import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'
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

  // Calendar grid (same idea as the vacation / swap request calendar): rows = moderators, columns = days
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [vacs, setVacs]   = useState([])
  useEffect(() => {
    supabase.from('vacation_requests').select('user_id,start_date,end_date').eq('status','approved')
      .then(({ data }) => setVacs(data || []))
  }, [])
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const dayList = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-GB', { month:'long', year:'numeric' })
  function shiftMonth(d) { const n = new Date(year, month + d, 1); setYear(n.getFullYear()); setMonth(n.getMonth()) }
  function blocked(mod, date) {
    const iso = toLocalISO(date)
    if (vacs.some(v => v.user_id === mod.id && iso >= v.start_date && iso <= v.end_date)) return 'VAC'
    let off = mod.days_off || []
    if (mod.rotating_days_off) off = (date.getMonth() + 1) % 2 === 0 ? (mod.days_off || []) : (mod.rotating_days_off_alt || [])
    if (off.includes(date.toLocaleDateString('en-GB', { weekday:'long' }))) return 'OFF'
    return null
  }
  function pick(mod, date) {
    const iso = toLocalISO(date)
    if (!aId || mod.id === aId) { setAId(mod.id); setADate(iso); if (bId === mod.id) { setBId(''); setBDate('') } }
    else { setBId(mod.id); setBDate(iso) }
  }
  function clearPick() { setAId(''); setBId(''); setADate(''); setBDate('') }

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
  const sorted = [...mods].sort((x, y) => (x.shift||'').localeCompare(y.shift||'') || (x.name||'').localeCompare(y.name||''))
  const cellBase = { padding:'4px 1px', textAlign:'center', borderBottom:'1px solid #0f1117', fontSize:'0.62rem', minWidth:26 }
  return (
    <div style={sa.card}>
      <div style={sa.cardHead}>
        <span style={sa.cardTitle}>Add a shift swap</span>
        <button style={sa.filterBtn} onClick={onCancel}>Cancel</button>
      </div>
      <p style={{fontSize:'0.78rem', color:'#64748b', marginTop:0}}>Registered as already approved; past days are allowed. Click the day the first moderator gives away, then the day another moderator gives away. Days off (OFF) can be swapped too: whoever takes someone's day off works it, and the other works theirs. Vacation days are blocked.</p>
      {error && <div style={sa.errorBox}>{error}</div>}
      <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
        <button style={sa.filterBtn} onClick={()=>shiftMonth(-1)}>← Prev</button>
        <span style={{fontSize:'0.85rem', fontWeight:700, color:'#e2e8f0', minWidth:130, textAlign:'center'}}>{monthLabel}</span>
        <button style={sa.filterBtn} onClick={()=>shiftMonth(1)}>Next →</button>
        {(aId || bId) && <button style={sa.filterBtn} onClick={clearPick}>Clear</button>}
      </div>
      <div style={{overflowX:'auto', marginBottom:12}}>
        <table style={{borderCollapse:'collapse', width:'100%'}}>
          <thead>
            <tr>
              <th style={{...cellBase, textAlign:'left', padding:'4px 10px 4px 0', color:'#64748b', position:'sticky', left:0, background:'#0d1017'}}>Moderator</th>
              {dayList.map(d => (
                <th key={d.getDate()} style={{...cellBase, color: toLocalISO(d)===toLocalISO(now) ? '#3b82f6' : '#64748b', fontWeight:600}}>
                  <div>{d.toLocaleDateString('en-GB',{weekday:'narrow'})}</div><div>{d.getDate()}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(m => (
              <tr key={m.id}>
                <td style={{...cellBase, textAlign:'left', padding:'4px 10px 4px 0', whiteSpace:'nowrap', fontSize:'0.75rem', color: SHIFT_COLORS[m.shift] || '#94a3b8', position:'sticky', left:0, background:'#0d1017'}}>
                  {m.name}
                </td>
                {dayList.map(d => {
                  const iso = toLocalISO(d), bl = blocked(m, d)
                  const selA = aId === m.id && aDate === iso, selB = bId === m.id && bDate === iso
                  const sel = selA || selB
                  return (
                    <td key={iso} onClick={bl === 'VAC' ? undefined : () => pick(m, d)}
                        title={`${m.name} · ${d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}${bl ? ' · '+bl : ''}`}
                        style={{...cellBase, cursor: bl === 'VAC' ? 'not-allowed' : 'pointer',
                          background: sel ? '#3b82f6' : bl === 'VAC' ? '#a855f718' : bl === 'OFF' ? '#be123c22' : 'transparent',
                          color: sel ? '#fff' : bl === 'VAC' ? '#a855f7' : bl === 'OFF' ? '#be123c' : '#334155', fontWeight:700}}>
                      {sel ? (selA ? 'A' : 'B') : bl || '·'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{fontSize:'0.78rem', color:'#94a3b8', marginTop:0}}>
        {a && aDate ? <>A: <b>{a.name}</b> gives {fmtDate(aDate)}</> : 'A: click the first moderator\'s day'}
        {' · '}
        {b && bDate ? <>B: <b>{b.name}</b> gives {fmtDate(bDate)}</> : 'B: click the other moderator\'s day'}
      </p>
      <div style={{...field, marginBottom:14}}>
        <span style={sa.label}>Note (optional)</span>
        <input style={sa.input} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Added by admin"/>
      </div>
      <label style={{display:'flex', alignItems:'center', gap:8, fontSize:'0.8rem', color:'#94a3b8', marginBottom:14, cursor:'pointer'}}>
        <input type="checkbox" checked={debt} onChange={e=>setDebt(e.target.checked)}/>
        Also record a swap debt{a && b ? ` (${a.name} owes ${b.name} a day off)` : ''}
      </label>
      <button style={sa.btnPrimary || sa.btnSmGreen} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Add swap'}</button>
    </div>
  )
}
