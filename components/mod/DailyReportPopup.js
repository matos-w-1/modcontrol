import { notifyAdmins, toLocalISO } from '../../lib/utils'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function DailyReportPopup({ userId, attendanceId, shift, onClose, onSubmit }) {
  const [form, setForm] = useState({
    locked_blacktide_rl: '',
    locked_blacktide_hunt: '',
    coinflow_csdeals: '',
    skin_manipulation: '',
    free_coin_abuser: '',
    phone_abuser: '', referral_abuser: '', notes: '',
    has_bug: false, has_exploit: false, dev_notes: '',
    pending_tickets: [],
    pending_tickets_crisp: [],
    applications: [],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)
  const draftKey = `reportDraft:${userId}:${attendanceId || 'none'}`
  const [draftReady, setDraftReady] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)

  // Restore a saved draft (so closing the popup by accident never loses the summary)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) { setForm(f => ({...f, ...JSON.parse(raw)})); setDraftRestored(true) }
    } catch(e) {}
    setDraftReady(true)
  }, [draftKey])

  // Autosave the draft on every change
  useEffect(() => {
    if (!draftReady) return
    try { localStorage.setItem(draftKey, JSON.stringify(form)) } catch(e) {}
  }, [form, draftReady, draftKey])

  function closeSafely() {
    if (typeof window !== 'undefined' && !window.confirm('Close the report? Your text is saved as a draft and will be here when you reopen it.')) return
    onClose()
  }

  function set(key, val) { setForm(f => ({...f, [key]: val})) }

  useEffect(() => {
    if (!attendanceId) return
    supabase.from('shift_notes').select('*').eq('attendance_id', attendanceId)
      .then(({data}) => {
        if (!data || data.length===0) return
        const grouped = {}
        data.forEach(n => {
          if (!grouped[n.type]) grouped[n.type] = []
          grouped[n.type].push(n.value)
        })
        const fill = (cur, key) => cur || (grouped[key]||[]).join('\n')
        setForm(f=>({
          ...f,
          locked_blacktide_rl:  fill(f.locked_blacktide_rl, 'locked_blacktide_rl'),
          locked_blacktide_hunt:fill(f.locked_blacktide_hunt, 'locked_blacktide_hunt'),
          coinflow_csdeals:     fill(f.coinflow_csdeals, 'coinflow_csdeals'),
          skin_manipulation:    fill(f.skin_manipulation, 'skin_manipulation'),
          free_coin_abuser:     fill(f.free_coin_abuser, 'free_coin_abuser'),
          phone_abuser:         fill(f.phone_abuser, 'phone_abuser'),
          referral_abuser:      fill(f.referral_abuser, 'referral_abuser'),
        }))
      })
  }, [attendanceId])

  async function submit() {
    setSaving(true); setError(null)
    try {
      const { data:reportData, error } = await supabase.from('daily_reports').insert({
        user_id:              userId,
        attendance_id:        attendanceId,
        shift,
        report_date:          toLocalISO(new Date()),
        locked_blacktide_rl:  form.locked_blacktide_rl,
        locked_blacktide_hunt:form.locked_blacktide_hunt,
        coinflow_csdeals:     form.coinflow_csdeals,
        skin_manipulation:    form.skin_manipulation,
        free_coin_abuser:     form.free_coin_abuser,
        phone_abuser:         form.phone_abuser,
        referral_abuser:      form.referral_abuser,
        pending_links:        JSON.stringify(form.pending_tickets.filter(t=>t.link)),
        pending_links_crisp:  JSON.stringify(form.pending_tickets_crisp.filter(t=>t.link)),
        notes:                form.notes,
        has_bug:              form.has_bug,
        has_exploit:          form.has_exploit,
        dev_notes:            form.dev_notes,
      }).select('id').single()
      if (error) throw new Error(error.message)
      if (reportData?.id && (form.has_bug || form.has_exploit)) notifyAdmins('report_flag', reportData.id)
      if (form.applications.filter(a=>a.applicant_name).length > 0) {
        const { data: newApps } = await supabase.from('applications').insert(
          form.applications.filter(a=>a.applicant_name).map(a=>({
            ...a, submitted_by: userId, report_id: reportData?.id||null,
          }))
        ).select('id')
        ;(newApps||[]).forEach(a => notifyAdmins('application', a.id))
      }
      try { localStorage.removeItem(draftKey) } catch(e) {}
      onSubmit()
    } catch(e) { setError(e.message); setSaving(false) }
  }

  return (
    <div style={p.overlay}>
      <div style={p.modal}>
        <div style={p.header}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div>
              <span style={p.title}>📋 Daily Report</span>
              <span style={p.sub}>Fill in before clocking out</span>
            </div>
            <span style={{color:'#4a5568', cursor:'pointer', fontSize:'1.2rem', padding:4, lineHeight:1}} onClick={closeSafely}>✕</span>
          </div>
        </div>
        <div style={p.body}>
          {error && <div style={p.error}>{error}</div>}
          {draftRestored && <div style={{fontSize:'0.75rem', color:'#34d399', marginBottom:10}}>✓ Your previous draft was restored. It is saved automatically as you type.</div>}

          {/* Pending Tickets */}
          <div style={p.section}>
            <div style={p.sectionTitle}>🔗 Pending Tickets</div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:'0.75rem', color:'#60a5fa', fontWeight:600, marginBottom:8}}>Intercom — Rustyloot & Hunt</div>
              {form.pending_tickets.map((t,i)=>(
                <div key={i} style={{display:'flex', gap:8, marginBottom:8, alignItems:'center'}}>
                  <input style={{...p.input, flex:1}} value={t.link} onChange={e=>setForm(f=>({...f, pending_tickets:f.pending_tickets.map((x,j)=>j===i?{...x,link:e.target.value}:x)}))} placeholder="https://app.intercom.com/..."/>
                  <input style={{...p.input, flex:1}} value={t.description} onChange={e=>setForm(f=>({...f, pending_tickets:f.pending_tickets.map((x,j)=>j===i?{...x,description:e.target.value}:x)}))} placeholder="What is this ticket about?"/>
                  <span style={{cursor:'pointer', color:'#f87171', fontSize:'0.8rem', flexShrink:0}} onClick={()=>setForm(f=>({...f, pending_tickets:f.pending_tickets.filter((_,j)=>j!==i)}))}>✕</span>
                </div>
              ))}
              <button style={{...p.btnSkip, fontSize:'0.75rem'}} onClick={()=>setForm(f=>({...f, pending_tickets:[...f.pending_tickets, {link:'',description:''}]}))}>+ Add Intercom Pending</button>
            </div>
            <div>
              <div style={{fontSize:'0.75rem', color:'#f59e0b', fontWeight:600, marginBottom:8}}>Crisp — CSDeals</div>
              {form.pending_tickets_crisp.map((t,i)=>(
                <div key={i} style={{display:'flex', gap:8, marginBottom:8, alignItems:'center'}}>
                  <input style={{...p.input, flex:1}} value={t.link} onChange={e=>setForm(f=>({...f, pending_tickets_crisp:f.pending_tickets_crisp.map((x,j)=>j===i?{...x,link:e.target.value}:x)}))} placeholder="https://app.crisp.chat/..."/>
                  <input style={{...p.input, flex:1}} value={t.description} onChange={e=>setForm(f=>({...f, pending_tickets_crisp:f.pending_tickets_crisp.map((x,j)=>j===i?{...x,description:e.target.value}:x)}))} placeholder="What is this ticket about?"/>
                  <span style={{cursor:'pointer', color:'#f87171', fontSize:'0.8rem', flexShrink:0}} onClick={()=>setForm(f=>({...f, pending_tickets_crisp:f.pending_tickets_crisp.filter((_,j)=>j!==i)}))}>✕</span>
                </div>
              ))}
              <button style={{...p.btnSkip, fontSize:'0.75rem'}} onClick={()=>setForm(f=>({...f, pending_tickets_crisp:[...f.pending_tickets_crisp, {link:'',description:''}]}))}>+ Add Crisp Pending</button>
            </div>
          </div>

          {/* Locked Accounts */}
          <div style={p.section}>
            <div style={p.sectionTitle}>🔒 Locked Accounts</div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:'0.75rem', color:'#60a5fa', fontWeight:600, marginBottom:8}}>Blacktide</div>
              <div style={p.grid2}>
                <div style={p.field}><label style={p.label}>Rustyloot (IDs)</label><textarea style={p.textarea} value={form.locked_blacktide_rl} onChange={e=>set('locked_blacktide_rl',e.target.value)} placeholder={'ID1\nID2'}/></div>
                <div style={p.field}><label style={p.label}>Hunt (IDs)</label><textarea style={p.textarea} value={form.locked_blacktide_hunt} onChange={e=>set('locked_blacktide_hunt',e.target.value)} placeholder={'ID1\nID2'}/></div>
              </div>
            </div>
            <div>
              <div style={{fontSize:'0.75rem', color:'#6366f1', fontWeight:600, marginBottom:8}}>Coinflow</div>
              <div style={p.grid2}>
                <div style={p.field}><label style={p.label}>CSDeals (IDs)</label><textarea style={p.textarea} value={form.coinflow_csdeals} onChange={e=>set('coinflow_csdeals',e.target.value)} placeholder={'ID1\nID2'}/></div>
              </div>
            </div>
          </div>

          {/* Abusers */}
          <div style={p.section}>
            <div style={p.sectionTitle}>⚠️ Abusers</div>
            <div style={p.grid3}>
              <div style={p.field}><label style={p.label}>Skin Manipulation — Rustyloot</label><textarea style={p.textarea} value={form.skin_manipulation} onChange={e=>set('skin_manipulation',e.target.value)} placeholder={'ID1\nID2'}/></div>
              <div style={p.field}><label style={p.label}>Free Coin — Rustyloot</label><textarea style={p.textarea} value={form.free_coin_abuser} onChange={e=>set('free_coin_abuser',e.target.value)} placeholder={'ID1\nID2'}/></div>
              <div style={p.field}><label style={p.label}>Phone Abuser — Hunt</label><textarea style={p.textarea} value={form.phone_abuser} onChange={e=>set('phone_abuser',e.target.value)} placeholder={'ID1\nID2'}/></div>
              <div style={p.field}><label style={p.label}>Referral Abuser — Hunt</label><textarea style={p.textarea} value={form.referral_abuser} onChange={e=>set('referral_abuser',e.target.value)} placeholder={'ID1\nID2'}/></div>
            </div>
          </div>

          {/* Dev Reports */}
          <div style={p.section}>
            <div style={p.sectionTitle}>🐛 Dev Reports</div>
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {[
                ['has_bug',     '🐛 Bug to report to devs'],
                ['has_exploit', '⚠️ Exploit found'],
              ].map(([key, label]) => (
                <label key={key} style={{display:'flex', alignItems:'center', gap:10, cursor:'pointer', padding:'10px 12px', borderRadius:8, background:'#0f1117', border:`1px solid ${form[key]?'#3b82f644':'#2d3748'}`}}>
                  <input type="checkbox" checked={!!form[key]} onChange={e=>set(key, e.target.checked)} style={{width:16, height:16, cursor:'pointer', accentColor:'#3b82f6'}}/>
                  <span style={{fontSize:'0.85rem', color: form[key]?'#f1f5f9':'#94a3b8'}}>{label}</span>
                </label>
              ))}
              {(form.has_bug || form.has_exploit) && (
                <textarea style={{...p.textarea, width:'100%'}} value={form.dev_notes} onChange={e=>set('dev_notes',e.target.value)} placeholder="Describe the bug/exploit in detail…"/>
              )}
            </div>
          </div>

          {/* Applications */}
          <div style={p.section}>
            <div style={p.sectionTitle}>👥 Staff / Dev Applications</div>
            <div style={{fontSize:'0.78rem', color:'#64748b', marginBottom:10}}>Report any staff or developer applications received during your shift.</div>
            {form.applications.map((app, i) => (
              <div key={i} style={{background:'#0f1117', borderRadius:8, padding:12, marginBottom:10, border:'1px solid #2d3748'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                  <span style={{fontSize:'0.78rem', fontWeight:600, color:'#94a3b8'}}>Application #{i+1}</span>
                  <span style={{cursor:'pointer', color:'#f87171', fontSize:'0.8rem'}} onClick={()=>setForm(f=>({...f, applications:f.applications.filter((_,j)=>j!==i)}))}>Remove</span>
                </div>
                <div style={p.grid2}>
                  <div style={p.field}><label style={p.label}>Name</label><input style={p.input} value={app.applicant_name} onChange={e=>setForm(f=>({...f, applications:f.applications.map((a,j)=>j===i?{...a,applicant_name:e.target.value}:a)}))}/></div>
                  <div style={p.field}><label style={p.label}>Type</label>
                    <select style={p.input} value={app.type} onChange={e=>setForm(f=>({...f, applications:f.applications.map((a,j)=>j===i?{...a,type:e.target.value}:a)}))}>
                      <option value="staff">Staff</option>
                      <option value="dev">Dev</option>
                    </select>
                  </div>
                  <div style={p.field}><label style={p.label}>Discord</label><input style={p.input} value={app.applicant_discord} onChange={e=>setForm(f=>({...f, applications:f.applications.map((a,j)=>j===i?{...a,applicant_discord:e.target.value}:a)}))}/></div>
                  <div style={p.field}><label style={p.label}>Telegram</label><input style={p.input} value={app.applicant_telegram} onChange={e=>setForm(f=>({...f, applications:f.applications.map((a,j)=>j===i?{...a,applicant_telegram:e.target.value}:a)}))}/></div>
                  <div style={{...p.field, gridColumn:'span 2'}}><label style={p.label}>Message</label><textarea style={p.textarea} value={app.message} onChange={e=>setForm(f=>({...f, applications:f.applications.map((a,j)=>j===i?{...a,message:e.target.value}:a)}))}/></div>
                </div>
              </div>
            ))}
            <button style={{...p.btnSkip, fontSize:'0.78rem', marginTop:4}} onClick={()=>setForm(f=>({...f, applications:[...f.applications, {applicant_name:'', type:'staff', applicant_discord:'', applicant_telegram:'', message:''}]}))}>
              + Add Application
            </button>
          </div>

          {/* Notes */}
          <div style={p.section}>
            <div style={p.sectionTitle}>📝 Notes</div>
            <textarea style={{...p.textarea, width:'100%', minHeight:80}} value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Any important notes for the next shift…"/>
          </div>
        </div>
        <div style={p.footer}>
          <button style={p.btnSkip} onClick={onSubmit}>Skip & Clock Out</button>
          <button style={{...p.btnSkip, marginRight:'auto'}} onClick={()=>{
            const lines = []
            if (form.pending_tickets.filter(t=>t.link).length>0) {
              lines.push('🔗 Pending Tickets — Intercom')
              form.pending_tickets.filter(t=>t.link).forEach(t=>lines.push(`• ${t.description||t.link} — ${t.link}`))
            }
            if (form.pending_tickets_crisp.filter(t=>t.link).length>0) {
              lines.push('')
              lines.push('🔗 Pending Tickets — Crisp (CSDeals)')
              form.pending_tickets_crisp.filter(t=>t.link).forEach(t=>lines.push(`• ${t.description||t.link} — ${t.link}`))
            }
            const locked = [
              form.locked_blacktide_rl   && `Blacktide RL: ${form.locked_blacktide_rl.trim()}`,
              form.locked_blacktide_hunt && `Blacktide Hunt: ${form.locked_blacktide_hunt.trim()}`,
              form.coinflow_csdeals      && `Coinflow CSDeals: ${form.coinflow_csdeals.trim()}`,
            ].filter(Boolean)
            if (locked.length>0) { lines.push(''); lines.push('🔒 Locked Accounts'); locked.forEach(l=>lines.push(`• ${l}`)) }
            const abusers = [
              form.skin_manipulation && `Skin Manipulation: ${form.skin_manipulation.trim()}`,
              form.free_coin_abuser  && `Free Coin: ${form.free_coin_abuser.trim()}`,
              form.phone_abuser      && `Phone: ${form.phone_abuser.trim()}`,
              form.referral_abuser   && `Referral: ${form.referral_abuser.trim()}`,
            ].filter(Boolean)
            if (abusers.length>0) { lines.push(''); lines.push('⚠️ Abusers'); abusers.forEach(a=>lines.push(`• ${a}`)) }
            if (form.has_bug||form.has_exploit) {
              lines.push('')
              lines.push(`🐛 Dev Report: ${[form.has_bug?'Bug':'',form.has_exploit?'Exploit':''].filter(Boolean).join(' + ')}`)
              if (form.dev_notes) lines.push(form.dev_notes)
            }
            if (form.notes) { lines.push(''); lines.push(`📝 Notes: ${form.notes}`) }
            if (lines.length===0) { alert('Nothing to copy yet!'); return }
            navigator.clipboard.writeText(lines.join('\n'))
              .then(()=>alert('✓ Copied!'))
              .catch(()=>alert('Could not copy.'))
          }}>📋 Copy Summary</button>
          <button style={p.btnSubmit} disabled={saving} onClick={submit}>{saving?'Submitting…':'Submit & Clock Out'}</button>
        </div>
      </div>
    </div>
  )
}

const p = {
  overlay:      { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 },
  modal:        { background:'#141820', border:'1px solid #1e2433', borderRadius:16, width:'100%', maxWidth:720, maxHeight:'90vh', display:'flex', flexDirection:'column' },
  header:       { padding:'20px 24px 16px', borderBottom:'1px solid #1e2433' },
  title:        { fontSize:'1rem', fontWeight:700, color:'#f1f5f9', display:'block' },
  sub:          { fontSize:'0.75rem', color:'#4a5568', marginTop:4, display:'block' },
  body:         { padding:'20px 24px', overflowY:'auto', flex:1 },
  footer:       { padding:'16px 24px', borderTop:'1px solid #1e2433', display:'flex', justifyContent:'flex-end', gap:10 },
  section:      { marginBottom:20 },
  sectionTitle: { fontSize:'0.78rem', fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 },
  grid2:        { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 },
  grid3:        { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 },
  field:        { display:'flex', flexDirection:'column', gap:4 },
  label:        { fontSize:'0.72rem', color:'#64748b', fontWeight:500 },
  input:        { background:'#0f1117', border:'1px solid #2d3748', borderRadius:8, padding:'8px 10px', color:'#e2e8f0', fontSize:'0.85rem', outline:'none', fontFamily:'inherit' },
  textarea:     { background:'#0f1117', border:'1px solid #2d3748', borderRadius:8, padding:'8px 10px', color:'#e2e8f0', fontSize:'0.82rem', outline:'none', fontFamily:'inherit', resize:'vertical', minHeight:70 },
  error:        { background:'#dc262622', border:'1px solid #dc262644', color:'#f87171', fontSize:'0.8rem', padding:'10px 12px', borderRadius:8, marginBottom:14 },
  btnSkip:      { background:'transparent', border:'1px solid #2d3748', color:'#64748b', padding:'9px 18px', borderRadius:8, cursor:'pointer', fontSize:'0.83rem' },
  btnSubmit:    { background:'#3b82f6', color:'#fff', border:'none', padding:'9px 18px', borderRadius:8, cursor:'pointer', fontSize:'0.83rem', fontWeight:600 },
}
