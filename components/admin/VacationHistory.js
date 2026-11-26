import { fmtDate } from '../../lib/utils'
import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function VacationHistory({ profiles }) {
  const [history, setHistory] = useState([])
  useEffect(() => {
    supabase.from('vacation_requests')
      .select('id,user_id,start_date,end_date,days_requested,status,admin_notes,reviewed_at')
      .in('status',['approved','declined'])
      .order('reviewed_at', { ascending: false })
      .limit(20)
      .then(({data}) => setHistory(data||[]))
  }, [])
  if (history.length === 0) return <p style={sa.empty}>No vacation history yet.</p>
  const statusCol = { approved:'#34d399', declined:'#f87171' }
  return history.map(r => {
    const profile = profiles[r.user_id]
    return (
      <div key={r.id} style={sa.approvalBlock}>
        <div style={sa.approvalTop}>
          <div>
            <div style={sa.approvalName}>{profile?.name || r.user_id}</div>
            <div style={sa.approvalMeta}>
              {fmtDate(r.start_date)} → {fmtDate(r.end_date)} · {r.days_requested} days
              {r.admin_notes && ` · ${r.admin_notes}`}
            </div>
          </div>
          <span style={{...sa.pill, background:(statusCol[r.status]||'#94a3b8')+'22', color:statusCol[r.status]||'#94a3b8'}}>{r.status}</span>
        </div>
      </div>
    )
  })
}
