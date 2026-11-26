import { sa } from '../../lib/styles'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export function AdminDevNotes({ reportId, initialNotes }) {
  const [notes, setNotes] = useState(initialNotes||'')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  async function save() {
    setSaving(true)
    await supabase.from('daily_reports').update({ admin_dev_notes: notes }).eq('id', reportId)
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2000)
  }

  return (
    <div>
      <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:6}}>Admin Notes</div>
      <textarea style={{width:'100%', background:'#0f1117', border:'1px solid #2d3748', borderRadius:8, padding:'8px 10px', color:'#e2e8f0', fontSize:'0.82rem', outline:'none', fontFamily:'inherit', resize:'vertical', minHeight:80, marginBottom:8}} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add admin notes on this bug/exploit…"/>
      <button style={{...sa.btnPrimary, padding:'6px 14px', fontSize:'0.78rem'}} disabled={saving} onClick={save}>
        {saved?'✓ Saved':saving?'Saving…':'Save Notes'}
      </button>
    </div>
  )
}
