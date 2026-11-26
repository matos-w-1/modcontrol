import { fmtDate } from '../../lib/utils'
import { VacationHistory } from './VacationHistory'
import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'

export function PageApprovals({ onCountChange }) {
  const [vacations, setVacations] = useState([])
  const [approvedVacations, setApprovedVacations] = useState([])
  const [allSwaps, setAllSwaps]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [notes, setNotes]         = useState({})
  const [profiles, setProfiles]   = useState({})

  useEffect(() => { load() }, [])

  async function load() {
    const res = await fetch('/api/admin?action=approvals')
    const body = await res.json()
    const profileMap = {}
    ;(body.profiles||[]).forEach(p => { profileMap[p.id] = p })
    setProfiles(profileMap)
    setVacations(body.vacations || [])
    setApprovedVacations(body.approvedVacations || [])
    setAllSwaps(body.allSwaps || [])
    onCountChange?.((body.vacations||[]).length + (body.allSwaps||[]).filter(r=>r.status==='pending'||r.status==='pending_admin').length)
    setLoading(false)
  }

  // Same-shift teammates whose vacation (approved, or another pending
  // request) overlaps this request's date range.
  function shiftOverlaps(r) {
    const shift = profiles[r.user_id]?.shift
    if (!shift) return []
    const candidates = [
      ...approvedVacations.map(v=>({...v})),
      ...vacations.filter(v=>v.id!==r.id).map(v=>({...v})),
    ]
    return candidates
      .filter(o => o.user_id!==r.user_id && profiles[o.user_id]?.shift===shift)
      .filter(o => o.start_date<=r.end_date && o.end_date>=r.start_date)
      .map(o => ({ ...o, name: profiles[o.user_id]?.name }))
  }

  async function decideVacation(r, decision) {
    const profile = profiles[r.user_id]
    await fetch('/api/admin?action=decide_vacation', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id:r.id, decision, notes:notes[r.id]||'', user_id:r.user_id, days_requested:r.days_requested, vacation_used:profile?.vacation_used, vacation_pending:profile?.vacation_pending })
    })
    load()
  }

  async function decideSwap(id, decision) {
    await fetch('/api/admin?action=decide_swap', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id, decision })
    })
    load()
  }

  if (loading) return <div style={sa.content}><div style={sa.empty}>Loading…</div></div>

  const pendingSwaps = allSwaps.filter(r => r.status === 'pending' || r.status === 'pending_admin')
  const historySwaps = allSwaps.filter(r => r.status === 'approved' || r.status === 'declined')

  return (
    <div style={sa.content}>
      <h1 style={sa.pageTitle}>Approvals</h1>
      <div style={sa.card}>
        <div style={sa.cardHead}>
          <span style={sa.cardTitle}>Vacation Requests</span>
          <span style={sa.badge}>{vacations.length}</span>
        </div>
        {vacations.length === 0
          ? <p style={sa.empty}>No pending vacation requests.</p>
          : vacations.map(r => {
            const profile = profiles[r.user_id]
            const remaining = (profile?.vacation_allowance||15)-(profile?.vacation_used||0)-(profile?.vacation_pending||0)
            const overlaps = shiftOverlaps(r)
            return (
              <div key={r.id} style={sa.approvalBlock}>
                <div style={sa.approvalTop}>
                  <div>
                    <div style={sa.approvalName}>{profile?.name || r.user_id}</div>
                    <div style={sa.approvalMeta}>{fmtDate(r.start_date)} → {fmtDate(r.end_date)} · {r.days_requested} days · Balance: {remaining} remaining</div>
                    {r.validation_warnings?.length > 0 && r.validation_warnings.map((w,i) => <div key={i} style={sa.warnBox}>{w}</div>)}
                    {overlaps.map((o,i) => (
                      <div key={i} style={{background:'#f8717122', border:'1px solid #f8717166', color:'#f87171', fontSize:'0.78rem', padding:'6px 10px', borderRadius:8, marginTop:6, fontWeight:600}}>
                        🔁 Same shift ({profile?.shift}) as {o.name}, who has {o.status} vacation {fmtDate(o.start_date)} → {fmtDate(o.end_date)}
                      </div>
                    ))}
                  </div>
                  <div style={{display:'flex', gap:8, flexShrink:0}}>
                    <button style={sa.btnApprove} onClick={() => decideVacation(r,'approved')}>Approve</button>
                    <button style={sa.btnReject}  onClick={() => decideVacation(r,'declined')}>Decline</button>
                  </div>
                </div>
                <input style={{...sa.input, marginTop:10, width:'100%'}} placeholder="Admin note (optional)…" value={notes[r.id]||''} onChange={e => setNotes(n=>({...n,[r.id]:e.target.value}))}/>
              </div>
            )
          })
        }
      </div>
      <div style={sa.card}>
        <div style={sa.cardHead}>
          <span style={sa.cardTitle}>Shift Swap Requests</span>
          <span style={sa.badge}>{pendingSwaps.length}</span>
        </div>
        {pendingSwaps.length === 0
          ? <p style={sa.empty}>No pending swap requests.</p>
          : pendingSwaps.map(r => {
            const requester = profiles[r.requester_id]
            const target    = profiles[r.target_id]
            const isPendingAdmin = r.status === 'pending_admin'
            return (
              <div key={r.id} style={sa.approvalBlock}>
                <div style={sa.approvalTop}>
                  <div>
                    <div style={sa.approvalName}>{requester?.name} ↔ {target?.name}</div>
                    <div style={sa.approvalMeta}>{requester?.shift} ↔ {target?.shift} · {requester?.name} gives {fmtDate(r.swap_date)}, {target?.name} gives {fmtDate(r.target_date)}</div>
                    {r.notes && <div style={{fontSize:'0.78rem', color:'#94a3b8', marginTop:4}}>{r.notes}</div>}
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <span style={{...sa.pill, background: isPendingAdmin?'#60a5fa22':'#f59e0b22', color: isPendingAdmin?'#60a5fa':'#f59e0b'}}>
                      {isPendingAdmin ? 'Awaiting Admin' : 'Awaiting Target'}
                    </span>
                    {isPendingAdmin && (
                      <>
                        <button style={sa.btnApprove} onClick={() => decideSwap(r.id,'approved')}>Approve</button>
                        <button style={sa.btnReject}  onClick={() => decideSwap(r.id,'declined')}>Decline</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
      <div style={{display:'flex', alignItems:'center', gap:12, margin:'28px 0 16px'}}>
        <div style={{flex:1, height:1, background:'#1e2433'}}/>
        <span style={{fontSize:'0.72rem', color:'#4a5568', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em'}}>History</span>
        <div style={{flex:1, height:1, background:'#1e2433'}}/>
      </div>
      <div style={{...sa.card, background:'#0f1117', border:'1px solid #1a2030'}}>
        <div style={sa.cardHead}><span style={{...sa.cardTitle, color:'#64748b'}}>Vacation Requests</span></div>
        <VacationHistory profiles={profiles}/>
      </div>
      <div style={{...sa.card, background:'#0f1117', border:'1px solid #1a2030'}}>
        <div style={sa.cardHead}><span style={{...sa.cardTitle, color:'#64748b'}}>Shift Swaps</span></div>
        {historySwaps.length === 0
          ? <p style={sa.empty}>No swap history yet.</p>
          : historySwaps.map(r => {
            const requester = profiles[r.requester_id]
            const target    = profiles[r.target_id]
            const statusCol = { approved:'#34d399', declined:'#f87171' }
            return (
              <div key={r.id} style={{...sa.approvalBlock, opacity:0.7}}>
                <div style={sa.approvalTop}>
                  <div>
                    <div style={sa.approvalName}>{requester?.name} ↔ {target?.name}</div>
                    <div style={sa.approvalMeta}>{requester?.shift} ↔ {target?.shift} · {requester?.name} gives {fmtDate(r.swap_date)}, {target?.name} gives {fmtDate(r.target_date)}</div>
                  </div>
                  <span style={{...sa.pill, background:(statusCol[r.status]||'#94a3b8')+'22', color:statusCol[r.status]||'#94a3b8'}}>{r.status}</span>
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}
