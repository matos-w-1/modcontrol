import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { MOD_SECTIONS, ADMIN_SECTIONS, hasPermission, filterAdminNav, filterModNav } from '../lib/permissions'

const Icon = {
  home:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  clock:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  palm:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  swap:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  user:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  report: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  logout: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  cal:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  up:     <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="5 12 12 5 19 12"/><line x1="12" y1="5" x2="12" y2="19"/></svg>,
  down:   <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="19 12 12 19 5 12"/><line x1="12" y1="5" x2="12" y2="19"/></svg>,
  food:   <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  back:   <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>,
  mods:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  dash:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  check:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  shifts: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  bell:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  log:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>,
  link:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
}

// ==================== MOD-FACING COMPONENTS ====================

function fmtTime(iso) { if (!iso) return '—'; return new Date(iso).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }) }
function fmtDate(d)   { if (!d) return '—'; return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) }
function elapsed(from) {
  if (!from) return '—'
  const mins = Math.floor((Date.now() - new Date(from)) / 60000)
  const h = Math.floor(mins / 60), m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
function businessDays(start, end) {
  let count = 0, cur = new Date(start)
  const last = new Date(end)
  while (cur <= last) { const d = cur.getDay(); if (d !== 0 && d !== 6) count++; cur.setDate(cur.getDate() + 1) }
  return count
}

function DailyReportPopup({ userId, attendanceId, shift, onClose, onSubmit }) {
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
        setForm(f=>({
          ...f,
          locked_blacktide_rl:  (grouped.locked_blacktide_rl||[]).join('\n'),
          locked_blacktide_hunt:(grouped.locked_blacktide_hunt||[]).join('\n'),
          coinflow_csdeals:     (grouped.coinflow_csdeals||[]).join('\n'),
          skin_manipulation:    (grouped.skin_manipulation||[]).join('\n'),
          free_coin_abuser:     (grouped.free_coin_abuser||[]).join('\n'),
          phone_abuser:         (grouped.phone_abuser||[]).join('\n'),
          referral_abuser:      (grouped.referral_abuser||[]).join('\n'),
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
        report_date:          new Date().toISOString().split('T')[0],
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
      if (form.applications.filter(a=>a.applicant_name).length > 0) {
        await supabase.from('applications').insert(
          form.applications.filter(a=>a.applicant_name).map(a=>({
            ...a, submitted_by: userId, report_id: reportData?.id||null,
          }))
        )
      }
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
            <span style={{color:'#4a5568', cursor:'pointer', fontSize:'1.2rem', padding:4, lineHeight:1}} onClick={onClose}>✕</span>
          </div>
        </div>
        <div style={p.body}>
          {error && <div style={p.error}>{error}</div>}

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

function AnnouncementsWidget() {
  const [items, setItems] = useState([])
  useEffect(()=>{
    supabase.from('announcements').select('*').eq('active',true).order('created_at',{ascending:false})
      .then(({data})=>{
        const now = new Date()
        setItems((data||[]).filter(a=>!a.expires_at||new Date(a.expires_at)>now))
      })
  },[])
  if (items.length===0) return null
  const typeColor={info:'#3b82f6',warning:'#f59e0b',success:'#34d399',danger:'#f87171'}
  return (
    <div style={{marginBottom:20}}>
  <h2 style={{fontSize:'1rem', fontWeight:700, color:'#f8fafc', margin:'0 0 12px', letterSpacing:'-0.01em'}}>📢 Announcements</h2>
      {items.map(a=>{
        const color=typeColor[a.type]||'#3b82f6'
        return (
          <div key={a.id} style={{background:color+'0d', border:`1px solid ${color}33`, borderRadius:12, padding:'14px 18px', marginBottom:10}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
              <span style={{fontSize:'0.68rem', fontWeight:700, color, background:color+'22', padding:'2px 8px', borderRadius:20}}>{a.type.toUpperCase()}</span>
              <span style={{fontSize:'0.85rem', fontWeight:600, color:'#f1f5f9'}}>{a.title}</span>
            </div>
            <div style={{fontSize:'0.82rem', color:'#94a3b8'}}>{a.body}</div>
          </div>
        )
      })}
    </div>
  )
}

function ShiftNotesWidget({ userId, attendanceId, isClockedIn }) {
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

function PageHome({ profile, attendance, onAction, busy, error, userId, onNavigate }) {
  const [onDuty, setOnDuty] = useState([])

useEffect(() => {
  loadOnDuty()
  const interval = setInterval(loadOnDuty, 60000)
  return () => clearInterval(interval)
}, [])

async function loadOnDuty() {
  const { data } = await supabase.from('attendance')
    .select('id,status,clock_in,lunch_start,user_id,profiles(name,avatar_url,shift)')
    .is('clock_out', null)
    .order('clock_in')
  setOnDuty(data||[])
}
  const isClockedIn = !!attendance && !attendance.clock_out
  const isOnLunch   = isClockedIn && !!attendance.lunch_start && !attendance.lunch_end
  const shiftTimes  = { 'Night Shift':'00:00–09:00', 'Morning Shift':'09:00–17:00', 'Afternoon Shift':'17:00–00:00' }
  const shiftEndHour = { 'Night Shift':9, 'Morning Shift':17, 'Afternoon Shift':24 }

  const [now, setNow] = useState(new Date())
  const [debts, setDebts] = useState([])
  const [debtProfiles, setDebtProfiles] = useState({})
  const [calMods, setCalMods] = useState([])
  const [calVacs, setCalVacs] = useState([])
  const [calSwaps, setCalSwaps] = useState([])
  const [issues, setIssues] = useState([])
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [issueForm, setIssueForm] = useState({ title:'', description:'', priority:'normal' })
  const [savingIssue, setSavingIssue] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!userId) return
    loadDebts()
    loadCalPreview()
    loadIssues()
  }, [userId])

  async function loadDebts() {
    const [{ data:d },{ data:p }] = await Promise.all([
      supabase.from('swap_debts').select('*').or(`debtor_id.eq.${userId},creditor_id.eq.${userId}`).eq('settled',false),
      supabase.from('profiles').select('id,name'),
    ])
    const map={}; (p||[]).forEach(x=>map[x.id]=x.name)
    setDebtProfiles(map); setDebts(d||[])
  }

  async function loadCalPreview() {
    const today = new Date().toISOString().split('T')[0]
    const in7   = new Date(Date.now()+7*86400000).toISOString().split('T')[0]
    const [{ data:m },{ data:v },{ data:sw }] = await Promise.all([
      supabase.from('profiles').select('id,name,shift,days_off,rotating_days_off,rotating_days_off_alt,mod_group').eq('role','mod').neq('status','left').order('shift,name'),
      supabase.from('vacation_requests').select('id,user_id,start_date,end_date').eq('status','approved').lte('start_date',in7).gte('end_date',today),
      supabase.from('shift_swaps').select('id,requester_id,target_id,swap_date').eq('status','approved').gte('swap_date',today).lte('swap_date',in7),
    ])
    setCalMods(m||[]); setCalVacs(v||[]); setCalSwaps(sw||[])
  }

  async function loadIssues() {
    const { data } = await supabase.from('dev_issues').select('*').eq('user_id', userId).order('created_at',{ascending:false}).limit(5)
    setIssues(data||[])
  }

  async function submitIssue() {
    if (!issueForm.title) return
    setSavingIssue(true)
    await supabase.from('dev_issues').insert({ user_id:userId, title:issueForm.title, description:issueForm.description, priority:issueForm.priority })
    setIssueForm({ title:'', description:'', priority:'normal' })
    setShowIssueForm(false)
    setSavingIssue(false)
    loadIssues()
  }

  // Shift progress
  function getShiftProgress() {
    if (!isClockedIn || !profile?.shift) return null
    const endHour = shiftEndHour[profile.shift]
    if (!endHour) return null
    const clockIn = new Date(attendance.clock_in)
    const shiftEnd = new Date(clockIn)
    shiftEnd.setHours(endHour, 0, 0, 0)
    if (shiftEnd < clockIn) shiftEnd.setDate(shiftEnd.getDate()+1)
    const totalMins = (shiftEnd - clockIn) / 60000
    const elapsedMins = (now - clockIn) / 60000
    const pct = Math.min(100, Math.round((elapsedMins/totalMins)*100))
    const remainMins = Math.max(0, totalMins - elapsedMins)
    const rh = Math.floor(remainMins/60), rm = Math.round(remainMins%60)

    // Lunch
    let lunchMins = 0
    if (attendance.lunch_start) {
      const ls = new Date(attendance.lunch_start)
      const le = attendance.lunch_end ? new Date(attendance.lunch_end) : now
      lunchMins = Math.round((le-ls)/60000)
    }

    return { pct, rh, rm, lunchMins, shiftEnd, clockIn }
  }

  const shiftProgress = getShiftProgress()

  // Calendar preview — next 7 days
  const days7 = Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate()+i); return d
  })
const isEvenMonth = (now.getMonth()+1) % 2 === 0
  const SHIFT_COLOR = {'Morning Shift':'#3b82f6','Afternoon Shift':'#8b5cf6','Night Shift':'#06b6d4'}

  function getModStatus(mod, date) {
    const d = date.toISOString().split('T')[0]
    const dayName = date.toLocaleDateString('en-GB',{weekday:'long'})
    let daysOff = mod.days_off||[]
    if (mod.rotating_days_off) daysOff = isEvenMonth ? (mod.days_off||[]) : (mod.rotating_days_off_alt||[])
    if (calVacs.some(v=>v.user_id===mod.id&&d>=v.start_date&&d<=v.end_date)) return { label:'VAC', color:'#34d399' }
    if (calSwaps.some(sw=>sw.swap_date===d&&(sw.requester_id===mod.id||sw.target_id===mod.id))) return { label:'SWAP', color:'#f59e0b' }
    if (daysOff.includes(dayName)) return { label:'OFF', color:'#f87171' }
    const color = SHIFT_COLOR[mod.shift]||'#94a3b8'
    return { label:'●', color }
  }

  const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>Dashboard</h1>
      <AnnouncementsWidget/>

      {/* My Status Widget */}
      <div style={s.card}>
        <div style={s.cardHead}>
          <span style={s.cardTitle}>My Status</span>
          <span style={{...s.statusBadge,
            background: !isClockedIn?'#1e2433':isOnLunch?'#f59e0b22':'#34d39922',
            color:      !isClockedIn?'#4a5568' :isOnLunch?'#f59e0b'  :'#34d399',
            border:`1px solid ${!isClockedIn?'#2d3748':isOnLunch?'#f59e0b44':'#34d39944'}`
          }}>
            {!isClockedIn?'Offline':isOnLunch?'On Lunch':'Working'}
          </span>
        </div>

        {shiftProgress && (
          <div style={{marginBottom:16}}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:14}}>
              <div style={s.shiftItem}>
                <div style={s.shiftLabel}>Clocked In</div>
                <div style={s.shiftValue}>{fmtTime(attendance.clock_in)}</div>
              </div>
              <div style={s.shiftItem}>
                <div style={s.shiftLabel}>Lunch Used</div>
                <div style={{...s.shiftValue, color: shiftProgress.lunchMins>30?'#f87171':'#e2e8f0'}}>
                  {shiftProgress.lunchMins}m / 30m
                </div>
              </div>
              <div style={s.shiftItem}>
                <div style={s.shiftLabel}>Shift Ends</div>
                <div style={s.shiftValue}>{fmtTime(shiftProgress.shiftEnd.toISOString())}</div>
              </div>
            </div>
            <div style={{marginBottom:6, display:'flex', justifyContent:'space-between'}}>
              <span style={{fontSize:'0.7rem', color:'#64748b'}}>Progress</span>
              <span style={{fontSize:'0.7rem', color: shiftProgress.pct>90?'#f59e0b':'#64748b'}}>
                {shiftProgress.rh}h {shiftProgress.rm}m remaining
              </span>
            </div>
            <div style={{height:6, background:'#1e2433', borderRadius:99, overflow:'hidden'}}>
              <div style={{height:'100%', width:`${shiftProgress.pct}%`, borderRadius:99, background: shiftProgress.pct>90?'linear-gradient(90deg,#f59e0b,#fbbf24)':'linear-gradient(90deg,#3b82f6,#60a5fa)', transition:'width 0.5s'}}/>
            </div>
          </div>
        )}

        {error && <div style={s.errorBox}>{error}</div>}
        <div style={s.actions}>
          {!isClockedIn && <button style={{...s.btn,...s.btnGreen}} disabled={busy} onClick={()=>onAction('clock_in')}>{Icon.up} {busy?'…':'Clock In'}</button>}
          {isClockedIn&&!isOnLunch && <button style={{...s.btn,...s.btnAmber}} disabled={busy} onClick={()=>onAction('lunch_start')}>{Icon.food} {busy?'…':'Start Lunch'}</button>}
          {isClockedIn&&isOnLunch  && <button style={{...s.btn,...s.btnBlue}}  disabled={busy} onClick={()=>onAction('lunch_end')}>{Icon.back} {busy?'…':'End Lunch'}</button>}
          {isClockedIn && <button style={{...s.btn,...s.btnRed}} disabled={busy} onClick={()=>onAction('clock_out')}>{Icon.down} {busy?'…':'Clock Out'}</button>}
        </div>
      </div>

{/* Who's On Duty */}
<div style={s.card}>
  <div style={s.cardHead}>
    <span style={s.cardTitle}>Who's On Duty</span>
    <span style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.62rem',fontWeight:700,color:'#34d399',background:'rgba(52,211,153,0.08)',border:'1px solid rgba(52,211,153,0.2)',padding:'3px 8px',borderRadius:20}}>
      <span style={{width:6,height:6,borderRadius:'50%',background:'#34d399',display:'inline-block'}}/>LIVE
    </span>
  </div>
  {onDuty.length===0 ? <p style={s.empty}>No moderators on duty.</p> : onDuty.map(r=>(
    <div key={r.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid #1e2433'}}>
      <div style={{width:28,height:28,borderRadius:'50%',flexShrink:0,overflow:'hidden'}}>
        {r.profiles?.avatar_url
          ? <img src={r.profiles.avatar_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',fontWeight:700,color:'#fff'}}>{(r.profiles?.name||'?')[0].toUpperCase()}</div>
        }
      </div>
      <span style={{flex:1,fontSize:'0.85rem',color:'#f1f5f9'}}>{r.profiles?.name}</span>
      <span style={{fontSize:'0.72rem',color:'#64748b'}}>{r.profiles?.shift?.replace(' Shift','')}</span>
      <span style={{fontSize:'0.72rem',fontWeight:600,padding:'2px 10px',borderRadius:20,
        background:r.status==='lunch'?'#f59e0b22':'#34d39922',
        color:r.status==='lunch'?'#f59e0b':'#34d399'}}>
        {r.status==='lunch'?`🍽 Lunch · ${elapsed(r.lunch_start)}`:'● Working'}
      </span>
    </div>
  ))}
</div>

<ShiftNotesWidget userId={userId} attendanceId={attendance?.id} isClockedIn={isClockedIn}/>

      {/* My Weekly Schedule */}
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>My Weekly Schedule</span></div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6}}>
          {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => {
            const isEvenMonth = (new Date().getMonth() + 1) % 2 === 0
            let daysOff = profile?.days_off || []
            if (profile?.rotating_days_off) {
              daysOff = isEvenMonth ? (profile?.days_off||[]) : (profile?.rotating_days_off_alt||[])
            }
            const isOff   = daysOff.includes(day)
            const isToday = new Date().toLocaleDateString('en-GB',{weekday:'long'}) === day
            return (
              <div key={day} style={{textAlign:'center', padding:'10px 4px', borderRadius:8, background:isOff?'#f8717115':isToday?'#3b82f620':'#0f1117', border:`1px solid ${isOff?'#f8717133':isToday?'#3b82f644':'#1e2433'}`}}>
                <div style={{fontSize:'0.65rem', color:isOff?'#f87171':isToday?'#60a5fa':'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4}}>{day.slice(0,3)}</div>
                <div style={{fontSize:'0.7rem', fontWeight:600, color:isOff?'#f87171':isToday?'#60a5fa':'#94a3b8'}}>{isOff?'OFF':profile?.shift?.split(' ')[0]||'—'}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Vacation Summary */}
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>Vacation Summary</span></div>
        <div style={s.vacRow}>
          <div style={s.vacItem}><div style={s.vacNum}>{profile?.vacation_allowance??15}</div><div style={s.vacLabel}>Allowance</div></div>
          <div style={s.vacItem}><div style={{...s.vacNum,color:'#f87171'}}>{profile?.vacation_used??0}</div><div style={s.vacLabel}>Used</div></div>
          <div style={s.vacItem}><div style={{...s.vacNum,color:'#f59e0b'}}>{profile?.vacation_pending??0}</div><div style={s.vacLabel}>Pending</div></div>
          <div style={s.vacItem}><div style={{...s.vacNum,color:'#34d399'}}>{(profile?.vacation_allowance??15)-(profile?.vacation_used??0)-(profile?.vacation_pending??0)}</div><div style={s.vacLabel}>Remaining</div></div>
        </div>
      </div>

      {/* Swap Debts */}
      {debts.length > 0 && (
        <div style={{...s.card, border:'1px solid #f59e0b44', background:'#f59e0b06'}}>
          <div style={s.cardHead}><span style={s.cardTitle}>⚖️ Shift Swap Debts</span></div>
          {debts.map(d => {
            const isDebtor = d.debtor_id === userId
            return (
              <div key={d.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid #1e2433'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.85rem',fontWeight:500}}>
                    {isDebtor
                      ? <span>You owe <strong style={{color:'#f87171'}}>{debtProfiles[d.creditor_id]}</strong> a day off</span>
                      : <span><strong style={{color:'#34d399'}}>{debtProfiles[d.debtor_id]}</strong> owes you a day off</span>
                    }
                  </div>
                  <div style={{fontSize:'0.75rem',color:'#64748b',marginTop:2}}>Swap date: {fmtDate(d.swap_date)}</div>
                </div>
                <span style={{fontSize:'0.72rem',fontWeight:600,padding:'3px 10px',borderRadius:20,background:isDebtor?'#f8717122':'#34d39922',color:isDebtor?'#f87171':'#34d399'}}>
                  {isDebtor?'You owe':'They owe'}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Team Overview */}
      <div style={s.card}>
        <div style={s.cardHead}>
          <span style={s.cardTitle}>Team Overview — Next 7 Days</span>
          <button style={{...s.filterBtn, fontSize:'0.75rem'}} onClick={()=>onNavigate('calendar')}>
            View Full Calendar →
          </button>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{...s.table, minWidth:500}}>
            <thead>
              <tr>
                <th style={{...s.th, width:100, paddingRight:12}}>Mod</th>
                {days7.map((d,i) => (
                  <th key={i} style={{...s.th, textAlign:'center', minWidth:44, padding:'0 2px 10px', color: i===0?'#60a5fa':'#64748b', fontWeight: i===0?700:600}}>
                    <div style={{fontSize:'0.6rem'}}>{DAYS_SHORT[d.getDay()]}</div>
                    <div style={{fontSize:'0.72rem'}}>{d.getDate()}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calMods.map(mod => (
                <tr key={mod.id}>
                  <td style={{...s.td, fontWeight:500, fontSize:'0.8rem', paddingRight:12, whiteSpace:'nowrap', color: mod.id===userId?'#60a5fa':'#e2e8f0'}}>
                    {mod.name}{mod.id===userId?' (you)':''}
                  </td>
                  {days7.map((d,i) => {
                    const status = getModStatus(mod, d)
                    const isWorking = status.label==='●'
                    return (
                      <td key={i} style={{...s.td, textAlign:'center', padding:'6px 2px'}}>
                        {isWorking
                          ? <div style={{width:8, height:8, borderRadius:'50%', background:status.color, margin:'0 auto', opacity:0.8}}/>
                          : <div style={{fontSize:'0.6rem', fontWeight:700, color:status.color, background:status.color+'18', padding:'2px 4px', borderRadius:4, textTransform:'uppercase'}}>{status.label}</div>
                        }
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{display:'flex', gap:16, marginTop:12, flexWrap:'wrap'}}>
          {[['#34d399','Vacation'],['#f59e0b','Swap'],['#f87171','Off'],['#3b82f6','Working']].map(([color,label])=>(
            <div key={label} style={{display:'flex',alignItems:'center',gap:5}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:color}}/>
              <span style={{fontSize:'0.7rem',color:'#64748b'}}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PageAttendance({ userId }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('week')

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    const now = new Date(); let from
    if (filter==='today') { from=new Date(now); from.setHours(0,0,0,0) }
    else if (filter==='week') { from=new Date(now); from.setDate(now.getDate()-7) }
    else { from=new Date(now.getFullYear(),now.getMonth(),1) }
    const {data} = await supabase.from('attendance').select('*').eq('user_id',userId).gte('clock_in',from.toISOString()).order('clock_in',{ascending:false})
    setRecords(data||[]); setLoading(false)
  }

  function duration(ci,co) {
    if (!co) return <span style={{color:'#34d399'}}>Active</span>
    const mins=Math.round((new Date(co)-new Date(ci))/60000), h=Math.floor(mins/60), m=mins%60
    return `${h}h ${m}m`
  }

  return (
    <div style={s.content}>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>My Attendance</h1>
        <div style={s.filterRow}>
          {['today','week','month'].map(f=>(
            <button key={f} style={{...s.filterBtn,...(filter===f?s.filterActive:{})}} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
          ))}
        </div>
      </div>
      <div style={s.card}>
        {loading?<div style={s.empty}>Loading…</div>:records.length===0?<div style={s.empty}>No records.</div>:(
          <div style={{overflowX:'auto'}}>
            <table style={s.table}>
              <thead><tr>{['Date','Clock In','Lunch Start','Lunch End','Clock Out','Duration','Status'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {records.map(r=>(
                  <tr key={r.id}>
                    <td style={s.td}>{fmtDate(r.clock_in)}</td>
                    <td style={s.td}>{fmtTime(r.clock_in)}</td>
                    <td style={s.td}>{fmtTime(r.lunch_start)}</td>
                    <td style={s.td}>{fmtTime(r.lunch_end)}</td>
                    <td style={s.td}>{fmtTime(r.clock_out)}</td>
                    <td style={s.td}>{duration(r.clock_in,r.clock_out)}</td>
                    <td style={s.td}><span style={{fontSize:'0.72rem',fontWeight:600,padding:'3px 10px',borderRadius:20,background:r.status==='working'?'#34d39922':r.status==='lunch'?'#f59e0b22':'#94a3b822',color:r.status==='working'?'#34d399':r.status==='lunch'?'#f59e0b':'#94a3b8'}}>{r.status||'done'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function PageVacation({ userId, profile, onProfileRefresh }) {
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
    blocks.forEach(b => { totalDays += businessDays(new Date(b.start), new Date(b.end)) })
    const earliest = new Date(blocks[0].start)
    const notice = Math.ceil((earliest-today)/86400000)
    const remaining=(profile?.vacation_allowance??15)-(profile?.vacation_used??0)-(profile?.vacation_pending??0)
    if(totalDays>remaining) warns.push(`⚠️ Requesting ${totalDays} days but only ${remaining} remaining.`)
    blocks.forEach(b => {
      const blockDays = businessDays(new Date(b.start), new Date(b.end))
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
      const blockDays = businessDays(new Date(b.start), new Date(b.end))
      const {error} = await supabase.from('vacation_requests').insert({
        user_id:userId, start_date:b.start, end_date:b.end,
        days_requested:blockDays, status:'pending', submitted_at:new Date().toISOString(), validation_warnings:warnings,
      })
      if(error){setFormError(error.message);setSaving(false);return}
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
              {warnings.length===0&&<div style={{background:'#34d39922',border:'1px solid #34d39944',color:'#34d399',fontSize:'0.8rem',padding:'8px 12px',borderRadius:8,marginBottom:8}}>✓ {selectedDays.filter(d=>{const wd=new Date(d).getDay();return wd!==0&&wd!==6}).length} business day(s) selected — eligible.</div>}
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

function VacationDatePicker({ profile, myRequests, selectedDays, setSelectedDays, onChange }) {
  const [viewDate, setViewDate] = useState(new Date())
  const year = viewDate.getFullYear(), month = viewDate.getMonth()
  const DOW = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const isEvenMonth = (month+1)%2===0
  const today = new Date(); today.setHours(0,0,0,0)

  const offNames = profile?.rotating_days_off
    ? (isEvenMonth ? (profile.days_off||[]) : (profile.rotating_days_off_alt||[]))
    : (profile?.days_off||[])

  function toISO(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
  function isDayOff(d) { return offNames.includes(d.toLocaleDateString('en-GB',{weekday:'long'})) }
  function isRequested(d) {
    const iso = toISO(d)
    return (myRequests||[]).some(r => r.status!=='declined' && iso>=r.start_date && iso<=r.end_date)
  }

  function getCells() {
    const first = new Date(year, month, 1)
    const last  = new Date(year, month+1, 0)
    const pad = (first.getDay()+6)%7
    const cells = []
    for (let i=0;i<pad;i++) cells.push(null)
    for (let d=1; d<=last.getDate(); d++) cells.push(new Date(year,month,d))
    return cells
  }

  function toggleDay(d) {
    const iso = toISO(d)
    setSelectedDays(days => days.includes(iso) ? days.filter(x=>x!==iso) : [...days, iso].sort())
    onChange?.()
  }

  const cells = getCells()

  return (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:'0.75rem', color:'#64748b', marginBottom:10}}>Click any days you want off — they don't need to be consecutive.</div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
        <button style={s.filterBtn} onClick={()=>setViewDate(new Date(year,month-1,1))}>← Prev</button>
        <span style={{fontSize:'0.88rem', fontWeight:600, color:'#f1f5f9'}}>{MONTHS[month]} {year}</span>
        <button style={s.filterBtn} onClick={()=>setViewDate(new Date(year,month+1,1))}>Next →</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:4}}>
        {DOW.map(d => <div key={d} style={{textAlign:'center', fontSize:'0.62rem', fontWeight:700, color:'#4a5568', textTransform:'uppercase'}}>{d}</div>)}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4}}>
        {cells.map((d,i) => {
          if (!d) return <div key={i}/>
          const past = d < today
          const off = isDayOff(d)
          const requested = isRequested(d)
          const iso = toISO(d)
          const selected = selectedDays.includes(iso)
          const disabled = past || off
          let style = { background:'transparent', color:'#cbd5e1', border:'1px solid transparent' }
          if (off)       style = { background:'#f8717118', color:'#f87171', border:'1px solid #f8717133' }
          if (requested) style = { background:'#34d39918', color:'#34d399', border:'1px solid #34d39933' }
          if (selected)  style = { background:'#3b82f6', color:'#fff', border:'1px solid #3b82f6' }
          return (
            <div key={i} onClick={()=>!disabled && toggleDay(d)}
              style={{textAlign:'center', padding:'8px 0', borderRadius:8, fontSize:'0.78rem', fontWeight:selected?700:500,
                cursor:disabled?'not-allowed':'pointer', opacity:past?0.3:1, ...style}}>
              {d.getDate()}
            </div>
          )
        })}
      </div>
      <div style={{display:'flex', gap:16, flexWrap:'wrap', marginTop:14}}>
        <div style={{display:'flex', alignItems:'center', gap:6}}><div style={{width:10,height:10,borderRadius:3,background:'#f87171'}}/><span style={{fontSize:'0.72rem', color:'#94a3b8'}}>Your day off</span></div>
        <div style={{display:'flex', alignItems:'center', gap:6}}><div style={{width:10,height:10,borderRadius:3,background:'#34d399'}}/><span style={{fontSize:'0.72rem', color:'#94a3b8'}}>Already requested</span></div>
        <div style={{display:'flex', alignItems:'center', gap:6}}><div style={{width:10,height:10,borderRadius:3,background:'#3b82f6'}}/><span style={{fontSize:'0.72rem', color:'#94a3b8'}}>Selected</span></div>
      </div>
      {selectedDays.length>0 && (
        <div style={{marginTop:10, fontSize:'0.8rem', color:'#94a3b8'}}>
          Selected ({selectedDays.length} day{selectedDays.length===1?'':'s'}): <strong style={{color:'#f1f5f9'}}>{selectedDays.map(d=>fmtDate(d)).join(', ')}</strong>
        </div>
      )}
    </div>
  )
}

function SwapDebts({ userId }) {
  const [debts, setDebts]       = useState([])
  const [profiles, setProfiles] = useState({})

  useEffect(() => {
    Promise.all([
      supabase.from('swap_debts').select('*').or(`debtor_id.eq.${userId},creditor_id.eq.${userId}`).eq('settled',false).order('created_at',{ascending:false}),
      supabase.from('profiles').select('id,name'),
    ]).then(([{data:d},{data:p}]) => {
      const map={}; (p||[]).forEach(x=>map[x.id]=x.name)
      setProfiles(map); setDebts(d||[])
    })
  },[])

  async function settle(id) {
    await supabase.from('swap_debts').update({ settled:true, settled_at:new Date().toISOString() }).eq('id',id)
    setDebts(d=>d.filter(x=>x.id!==id))
  }

  if (debts.length === 0) return null

  return (
    <div style={{...s.card, border:'1px solid #f59e0b44', background:'#f59e0b08', marginBottom:20}}>
      <div style={s.cardHead}><span style={s.cardTitle}>⚖️ Swap Debts</span></div>
      {debts.map(d => {
        const isDebtor = d.debtor_id === userId
        return (
          <div key={d.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid #1e2433'}}>
            <div style={{flex:1}}>
              <div style={{fontSize:'0.85rem',fontWeight:500}}>
                {isDebtor ? <span>You owe <strong>{profiles[d.creditor_id]}</strong> a day off</span> : <span><strong>{profiles[d.debtor_id]}</strong> owes you a day off</span>}
              </div>
              <div style={{fontSize:'0.75rem',color:'#64748b',marginTop:2}}>Swap date: {fmtDate(d.swap_date)}</div>
            </div>
            {!isDebtor && (
              <button style={{background:'#34d39922',color:'#34d399',border:'1px solid #34d39944',padding:'4px 12px',borderRadius:6,cursor:'pointer',fontSize:'0.78rem',fontWeight:600}} onClick={()=>settle(d.id)}>
                Mark as Settled
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

function PageSwaps({ userId, profile }) {
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
      supabase.from('profiles').select('id,name,shift').eq('role','mod').neq('id',userId),
    ])
    setSwaps(sw||[]); setMods(ms||[]); setLoading(false)
  }

  async function submitSwap() {
    if(!form.target_id||!form.my_date||!form.their_date){setFormError('Please fill all fields.');return}
    setSaving(true)
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
          <div style={s.formGrid}>
            <div style={s.formGroup}><label style={s.label}>Swap With</label>
              <select style={s.input} value={form.target_id} onChange={e=>setForm(f=>({...f,target_id:e.target.value}))}>
                <option value="">Select moderator…</option>
                {mods.map(m=><option key={m.id} value={m.id}>{m.name} ({m.shift})</option>)}
              </select>
            </div>
            <div style={s.formGroup}><label style={s.label}>Notes (optional)</label>
              <input style={s.input} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Reason…"/>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>My day to give</label>
              <input style={s.input} type="date" value={form.my_date} onChange={e=>setForm(f=>({...f,my_date:e.target.value}))}/>
              <span style={{fontSize:'0.7rem',color:'#4a5568',marginTop:4}}>The day you are giving away</span>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Their day I want</label>
              <input style={s.input} type="date" value={form.their_date} onChange={e=>setForm(f=>({...f,their_date:e.target.value}))}/>
              <span style={{fontSize:'0.7rem',color:'#4a5568',marginTop:4}}>The day you want from them</span>
            </div>
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

function PageProfile({ userId, profile, onRefresh }) {
  const [form, setForm] = useState({
    name: '', full_name: '', birthday: '', timezone: 'UTC+1',
    discord_name: '', telegram_name: '', start_date: '', languages_spoken: [],
  })
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const TIMEZONES = ['UTC-5','UTC-4','UTC-3','UTC-2','UTC-1','UTC+0','UTC+1','UTC+2','UTC+3','UTC+4','UTC+5','UTC+6']
  const LANGUAGES = ['English','Portuguese','Russian','Spanish','French','German','Italian']
  const SHIFT_COLOR = {'Morning Shift':'#3b82f6','Afternoon Shift':'#8b5cf6','Night Shift':'#06b6d4'}
  const shiftColor = SHIFT_COLOR[profile?.shift] || '#94a3b8'
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

  useEffect(() => {
    if(profile) setForm({
      name:             profile.name||'',
      full_name:        profile.full_name||'',
      birthday:         profile.birthday||'',
      timezone:         profile.timezone||'UTC+1',
      discord_name:     profile.discord_name||'',
      telegram_name:    profile.telegram_name||'',
      start_date:       profile.start_date||'',
      languages_spoken: profile.languages_spoken||[],
    })
  }, [profile])

  function toggleLanguage(lang) {
    setForm(f => ({
      ...f,
      languages_spoken: f.languages_spoken.includes(lang)
        ? f.languages_spoken.filter(l => l !== lang)
        : [...f.languages_spoken, lang]
    }))
  }

  async function save() {
    setSaving(true)
    await supabase.from('profiles').update({
      name:             form.name,
      full_name:        form.full_name,
      birthday:         form.birthday||null,
      timezone:         form.timezone,
      discord_name:     form.discord_name,
      telegram_name:    form.telegram_name,
      start_date:       form.start_date||null,
      languages_spoken: form.languages_spoken,
    }).eq('id', userId)
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2000); onRefresh()
  }

  async function uploadAvatar(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingAvatar(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert:true })
    if (error) { alert(error.message); setUploadingAvatar(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', userId)
    setUploadingAvatar(false)
    onRefresh()
  }

  return (
    <div style={s.content}>
     <h1 style={{...s.pageTitle, marginBottom:16}}>My Profile</h1>

      {/* Header */}
      <div style={{...s.card, display:'flex', alignItems:'center', gap:20, flexWrap:'wrap', paddingTop:20}}>
        {/* Avatar */}
        <div style={{position:'relative', flexShrink:0}}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" style={{width:72, height:72, borderRadius:'50%', objectFit:'cover', border:'2px solid #1e2433'}}/>
          ) : (
            <div style={{width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', fontWeight:800, color:'#fff'}}>
              {(profile?.name||'?')[0].toUpperCase()}
            </div>
          )}
          <label style={{position:'absolute', bottom:0, right:0, width:22, height:22, borderRadius:'50%', background:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'2px solid #141820'}}>
            {uploadingAvatar
              ? <span style={{fontSize:'0.6rem', color:'#fff'}}>…</span>
              : <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            }
            <input type="file" accept="image/*" style={{display:'none'}} onChange={uploadAvatar}/>
          </label>
        </div>

        <div style={{flex:1}}>
          <div style={{fontSize:'1.1rem', fontWeight:700, color:'#f1f5f9', marginBottom:4}}>{profile?.name}</div>
          {profile?.full_name && <div style={{fontSize:'0.82rem', color:'#64748b', marginBottom:6}}>{profile.full_name}</div>}
          <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
            {profile?.shift && <span style={{fontSize:'0.75rem', background:shiftColor+'22', color:shiftColor, padding:'3px 10px', borderRadius:20, fontWeight:600}}>{profile.shift}</span>}
            {profile?.mod_group==='russian' && <span style={{fontSize:'0.68rem', background:'#f59e0b22', color:'#f59e0b', padding:'2px 8px', borderRadius:4, fontWeight:700}}>🇷🇺 Russian</span>}
            {profile?.timezone && <span style={{fontSize:'0.75rem', color:'#64748b'}}>🌍 {profile.timezone}</span>}
            <span style={{fontSize:'0.75rem', background:profile?.status==='active'?'#34d39922':'#f8717122', color:profile?.status==='active'?'#34d399':'#f87171', padding:'3px 10px', borderRadius:20, fontWeight:600}}>{profile?.status||'active'}</span>
          </div>
          <div style={{display:'flex', gap:16, marginTop:6, flexWrap:'wrap'}}>
            {profile?.discord_name && <span style={{fontSize:'0.75rem', color:'#94a3b8', display:'flex', alignItems:'center', gap:4}}><svg width="12" height="12" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>{profile.discord_name}</span>}
            {profile?.telegram_name && <span style={{fontSize:'0.75rem', color:'#94a3b8', display:'flex', alignItems:'center', gap:4}}><svg width="12" height="12" viewBox="0 0 24 24" fill="#26A5E4"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>{profile.telegram_name}</span>}
            {profile?.start_date && <span style={{fontSize:'0.75rem', color:'#64748b'}}>📅 Since {fmtDate(profile.start_date)}</span>}
            {(profile?.languages_spoken||[]).length>0 && <span style={{fontSize:'0.75rem', color:'#64748b'}}>🗣️ {profile.languages_spoken.join(', ')}</span>}
          </div>
        </div>
      </div>

      {/* Vacation Balance */}
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>Vacation Balance</span></div>
        <div style={s.vacRow}>
          <div style={s.vacItem}><div style={s.vacNum}>{profile?.vacation_allowance??15}</div><div style={s.vacLabel}>Allowance</div></div>
          <div style={s.vacItem}><div style={{...s.vacNum,color:'#f87171'}}>{profile?.vacation_used??0}</div><div style={s.vacLabel}>Used</div></div>
          <div style={s.vacItem}><div style={{...s.vacNum,color:'#f59e0b'}}>{profile?.vacation_pending??0}</div><div style={s.vacLabel}>Pending</div></div>
          <div style={s.vacItem}><div style={{...s.vacNum,color:'#34d399'}}>{(profile?.vacation_allowance??15)-(profile?.vacation_used??0)-(profile?.vacation_pending??0)}</div><div style={s.vacLabel}>Remaining</div></div>
        </div>
      </div>

      {/* Edit Info */}
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>Edit Information</span></div>
        <div style={s.formGrid}>
          <div style={s.formGroup}><label style={s.label}>Display Name</label><input style={s.input} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div style={s.formGroup}><label style={s.label}>Full Name</label><input style={s.input} value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))}/></div>
          <div style={s.formGroup}><label style={s.label}>Date of Birth</label><input style={s.input} type="date" value={form.birthday} onChange={e=>setForm(f=>({...f,birthday:e.target.value}))}/></div>
          <div style={s.formGroup}><label style={s.label}>Start Date</label><input style={s.input} type="date" value={form.start_date} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))}/></div>
          <div style={s.formGroup}><label style={s.label}>Timezone</label>
            <select style={s.input} value={form.timezone} onChange={e=>setForm(f=>({...f,timezone:e.target.value}))}>
              {TIMEZONES.map(tz=><option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <div style={s.formGroup}>
            <label style={{...s.label, display:'flex', alignItems:'center', gap:4}}><svg width="12" height="12" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg> Discord</label>
            <input style={s.input} value={form.discord_name} onChange={e=>setForm(f=>({...f,discord_name:e.target.value}))} placeholder="username"/>
          </div>
          <div style={s.formGroup}>
            <label style={{...s.label, display:'flex', alignItems:'center', gap:4}}><svg width="12" height="12" viewBox="0 0 24 24" fill="#26A5E4"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> Telegram</label>
            <input style={s.input} value={form.telegram_name} onChange={e=>setForm(f=>({...f,telegram_name:e.target.value}))} placeholder="@username"/>
          </div>
        </div>

        <div style={{marginTop:16}}>
          <label style={s.label}>Languages Spoken</label>
          <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:8}}>
            {LANGUAGES.map(lang => {
              const selected = form.languages_spoken.includes(lang)
              return (
                <div key={lang} onClick={()=>toggleLanguage(lang)} style={{padding:'5px 12px', borderRadius:20, cursor:'pointer', fontSize:'0.78rem', fontWeight:600, border:`1px solid ${selected?'#3b82f6':'#2d3748'}`, background:selected?'#3b82f622':'transparent', color:selected?'#60a5fa':'#64748b'}}>
                  {lang}
                </div>
              )
            })}
          </div>
        </div>

        <button style={{...s.btnPrimary, marginTop:20}} disabled={saving} onClick={save}>
          {saved?'✓ Saved':saving?'Saving…':'Save Changes'}
        </button>
      </div>

      {/* Shift Schedule */}
      <div style={s.card}>
        <div style={s.cardHead}><span style={s.cardTitle}>Shift Information</span></div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6}}>
          {DAYS.map(day => {
            const isEvenMonth = (new Date().getMonth() + 1) % 2 === 0
            let daysOff = profile?.days_off || []
            if (profile?.rotating_days_off) {
              daysOff = isEvenMonth ? (profile?.days_off||[]) : (profile?.rotating_days_off_alt||[])
            }
            const isOff   = daysOff.includes(day)
            const isToday = new Date().toLocaleDateString('en-GB',{weekday:'long'}) === day
            return (
              <div key={day} style={{textAlign:'center', padding:'10px 4px', borderRadius:8, background:isOff?'#f8717115':isToday?'#3b82f620':'#0f1117', border:`1px solid ${isOff?'#f8717133':isToday?'#3b82f644':'#1e2433'}`}}>
                <div style={{fontSize:'0.65rem', color:isOff?'#f87171':isToday?'#60a5fa':'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4}}>{day.slice(0,3)}</div>
                <div style={{fontSize:'0.7rem', fontWeight:600, color:isOff?'#f87171':isToday?'#60a5fa':'#94a3b8'}}>{isOff?'OFF':profile?.shift?.split(' ')[0]||'—'}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ReportModal({ report, modName, onClose }) {
  function IDList({ val }) {
    if (!val) return <span style={{color:'#4a5568'}}>—</span>
    const ids = val.split(/[\n,\s]+/).filter(Boolean)
    if (ids.length === 0) return <span style={{color:'#4a5568'}}>—</span>
    return <>{ids.map((id,i)=><div key={i} style={{fontSize:'0.82rem',padding:'2px 0'}}>{id}</div>)}</>
  }
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={onClose}>
      <div style={{background:'#141820',border:'1px solid #1e2433',borderRadius:16,width:'100%',maxWidth:680,maxHeight:'88vh',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:'18px 24px',borderBottom:'1px solid #1e2433',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:'0.95rem',fontWeight:700,color:'#f1f5f9'}}>{modName||'Report'} — {fmtDate(report.report_date)}</div>
            <div style={{fontSize:'0.75rem',color:'#64748b',marginTop:2}}>{report.shift}</div>
          </div>
          <span style={{color:'#4a5568',cursor:'pointer',fontSize:'1.2rem',padding:4}} onClick={onClose}>✕</span>
        </div>
        <div style={{padding:'20px 24px',overflowY:'auto',flex:1}}>
        
         {(report.pending_links||report.important_links)&&(
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
    {report.pending_links&&(()=>{
      try {
        const tickets = JSON.parse(report.pending_links)
        if (Array.isArray(tickets) && tickets.length>0) return (
          <div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}>
            <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:6}}>🔗 Pending</div>
            {tickets.map((t,i)=>(
              <a key={i} href={t.link} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:6,padding:'6px 8px',borderRadius:6,background:'#141820',border:'1px solid #1e2433',marginBottom:6,textDecoration:'none',cursor:'pointer'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#3b82f6'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='#1e2433'}>
                <span style={{fontSize:'0.78rem',color:'#60a5fa',flex:1}}>{t.description||t.link}</span>
                <svg width="10" height="10" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            ))}
          </div>
        )
      } catch(e) {}
      return null
    })()}
    {report.important_links&&(()=>{
      try {
        const tickets = JSON.parse(report.important_links)
        if (Array.isArray(tickets) && tickets.length>0) return (
          <div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}>
            <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:6}}>⭐ Important</div>
            {tickets.map((t,i)=>(
              <a key={i} href={t.link} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:6,padding:'6px 8px',borderRadius:6,background:'#141820',border:'1px solid #1e2433',marginBottom:6,textDecoration:'none',cursor:'pointer'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#f59e0b'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='#1e2433'}>
                <span style={{fontSize:'0.78rem',color:'#f59e0b',flex:1}}>{t.description||t.link}</span>
                <svg width="10" height="10" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            ))}
          </div>
        )
      } catch(e) {}
      return null
    })()}
  </div>
)}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            {[
              ['🔒 Blacktide — Rustyloot',report.locked_blacktide_rl],
              ['🔒 Blacktide — Hunt',report.locked_blacktide_hunt],
              ['🔒 Skin Manip. (RL)',report.skin_manipulation],
              ['⚠️ Free Coin (RL)',report.free_coin_abuser],
              ['⚠️ Phone (Hunt)',report.phone_abuser],
              ['⚠️ Referral (Hunt)',report.referral_abuser],
            ].map(([label,val])=>(
              <div key={label} style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}>
                <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:6}}>{label}</div>
                <IDList val={val}/>
              </div>
            ))}
          </div>
          {(report.has_bug||report.has_exploit)&&(
            <div style={{background:'#f8717108',border:'1px solid #f8717133',borderRadius:8,padding:'10px 14px',marginBottom:12}}>
              <div style={{fontSize:'0.72rem',color:'#f87171',marginBottom:6,fontWeight:600}}>
                {report.has_bug?'🐛 Bug reported':''}{report.has_bug&&report.has_exploit?' · ':''}{report.has_exploit?'⚠️ Exploit reported':''}
                {report.dev_resolved&&<span style={{marginLeft:8,color:'#34d399'}}>✓ Resolved</span>}
              </div>
              {report.dev_notes&&<div style={{fontSize:'0.83rem',color:'#94a3b8'}}>{report.dev_notes}</div>}
            </div>
          )}
          {report.notes&&<div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}>
            <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:4}}>📝 Notes</div>
            <div style={{fontSize:'0.83rem',color:'#94a3b8'}}>{report.notes}</div>
          </div>}
        </div>
      </div>
    </div>
  )
}

function ReportCard({ report, modName, avatarUrl, onClick }) {
  return (
    <div onClick={onClick} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:10,background:'#0f1117',border:'1px solid #1e2433',cursor:'pointer',marginBottom:8}}
      onMouseEnter={e=>e.currentTarget.style.borderColor='#334155'}
      onMouseLeave={e=>e.currentTarget.style.borderColor='#1e2433'}>
      {avatarUrl
        ? <img src={avatarUrl} alt="" style={{width:32,height:32,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>
        : <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',fontWeight:700,color:'#fff',flexShrink:0}}>{(modName||'?')[0].toUpperCase()}</div>
      }
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          {modName && <span style={{fontSize:'0.85rem',fontWeight:600,color:'#f1f5f9'}}>{modName}</span>}
          <span style={{fontSize:'0.72rem',color:'#64748b'}}>{report.shift}</span>
          <span style={{fontSize:'0.72rem',color:'#4a5568'}}>{fmtDate(report.report_date)}</span>
          {report.has_bug&&<span style={{fontSize:'0.63rem',fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#f8717122',color:'#f87171'}}>🐛 Bug</span>}
          {report.has_exploit&&<span style={{fontSize:'0.63rem',fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#f59e0b22',color:'#f59e0b'}}>⚠️ Exploit</span>}
        </div>
         <div style={{fontSize:'0.73rem',color:'#64748b',marginTop:2}}>
  {(()=>{
    let parts = []
    try { const p=JSON.parse(report.pending_links||'[]'); if(p.length>0) parts.push(`${p.length} pending`) } catch(e){}
    try { const i=JSON.parse(report.important_links||'[]'); if(i.length>0) parts.push(`${i.length} important`) } catch(e){}
    if(report.notes) parts.push('📝 notes')
    return parts.length>0 ? parts.join(' · ') : 'No highlights'
  })()}
</div>
      </div>
      <svg width="14" height="14" fill="none" stroke="#4a5568" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
    </div>
  )
}

function PageMyReports({ userId, profile }) {
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    supabase.from('daily_reports').select('*').eq('user_id',userId).order('created_at',{ascending:false})
      .then(({data})=>{setReports(data||[]);setLoading(false)})
  },[])

  const filtered = search.trim()
    ? reports.filter(r => {
        const q = search.toLowerCase()
        try { const p=JSON.parse(r.pending_links||'[]'); if(p.some(t=>t.description?.toLowerCase().includes(q)||t.link?.toLowerCase().includes(q))) return true } catch(e){}
        try { const i=JSON.parse(r.important_links||'[]'); if(i.some(t=>t.description?.toLowerCase().includes(q)||t.link?.toLowerCase().includes(q))) return true } catch(e){}
        return [r.locked_blacktide_rl,r.locked_blacktide_hunt,r.skin_manipulation,r.free_coin_abuser,r.phone_abuser,r.referral_abuser,r.notes,r.dev_notes]
          .some(f=>f&&f.toLowerCase().includes(q))
      })
    : reports

  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>My Reports</h1>
      {selected && <ReportModal report={selected} modName="Me" onClose={()=>setSelected(null)}/>}
      <input style={{...s.input, width:'100%', marginBottom:16}} placeholder="Search by UID, description, notes…" value={search} onChange={e=>setSearch(e.target.value)}/>
      {loading?<div style={s.empty}>Loading…</div>:filtered.length===0?(
        <div style={s.card}><p style={s.empty}>No reports found.</p></div>
      ):(
        <div style={s.card}>
          {filtered.map(r=>(
            <ReportCard key={r.id} report={r} modName="Me" avatarUrl={profile?.avatar_url} hideDevInfo onClick={()=>setSelected(r)}/>
          ))}
        </div>
      )}
    </div>
  )
}

function BirthdayCard() {
  const [people, setPeople] = useState([])
  useEffect(()=>{
  supabase.from('profiles').select('id,name,birthday,avatar_url').eq('role','mod').not('birthday','is',null)      .then(({data})=>{
        const today=new Date(); today.setHours(0,0,0,0)
        const enriched=(data||[]).map(p=>{
          const bday=new Date(p.birthday), next=new Date(today.getFullYear(),bday.getMonth(),bday.getDate())
          if(next<today) next.setFullYear(today.getFullYear()+1)
          return {...p,daysUntil:Math.ceil((next-today)/86400000),nextBirthday:next}
        }).sort((a,b)=>a.daysUntil-b.daysUntil).slice(0,5)
        setPeople(enriched)
      })
  },[])
  return (
    <div style={s.card}>
      <div style={s.cardHead}><span style={s.cardTitle}>🎂 Upcoming Birthdays</span><span style={s.chip}>Next 30 days</span></div>
      {people.length===0?<p style={s.empty}>No birthdays coming up.</p>:people.map(p=>(
        <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:'1px solid #1e2433'}}>
          <div style={{width:32,height:32,borderRadius:'50%',flexShrink:0,overflow:'hidden'}}>
  {p.avatar_url
    ? <img src={p.avatar_url} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
    : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',fontWeight:700,color:'#fff'}}>{p.name[0].toUpperCase()}</div>
  }
</div>
          <span style={{flex:1,fontSize:'0.85rem',fontWeight:500}}>{p.name}</span>
          <span style={{fontSize:'0.75rem',color:'#64748b'}}>{p.nextBirthday.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>
          <span style={{fontSize:'0.72rem',fontWeight:600,padding:'3px 10px',borderRadius:20,background:p.daysUntil===0?'#f59e0b22':'#3b82f622',color:p.daysUntil===0?'#f59e0b':'#60a5fa'}}>
            {p.daysUntil===0?'🎉 Today!':p.daysUntil===1?'Tomorrow':`In ${p.daysUntil} days`}
          </span>
        </div>
      ))}
    </div>
  )
}

function TeamDirectory() {
  const [mods, setMods]     = useState([])
  const [search, setSearch] = useState('')
  useEffect(()=>{
    supabase.from('profiles').select('id,name,full_name,nickname,shift,timezone,discord_name,telegram_name,days_off,mod_group,status,avatar_url').eq('role','mod').neq('status','left').order('name')
      .then(({data})=>setMods(data||[]))
  },[])
  const SHIFT_COLOR={'Morning Shift':'#3b82f6','Afternoon Shift':'#8b5cf6','Night Shift':'#06b6d4'}
  const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  const filtered=mods.filter(m=>m.name?.toLowerCase().includes(search.toLowerCase())||m.full_name?.toLowerCase().includes(search.toLowerCase())||m.discord_name?.toLowerCase().includes(search.toLowerCase()))
  return (
    <div style={s.card}>
      <div style={s.cardHead}><span style={s.cardTitle}>Team Directory</span><span style={s.chip}>{mods.length} mods</span></div>
      <input style={{...s.input,marginBottom:16,width:'100%'}} placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
      {filtered.map(m=>{
        const shiftColor=SHIFT_COLOR[m.shift]||'#94a3b8', daysOff=m.days_off||[]
        return (
 <div key={m.id} style={{padding:'12px 0',borderBottom:'1px solid #1e2433'}}>
  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
    <div style={{width:36,height:36,borderRadius:'50%',flexShrink:0,overflow:'hidden'}}>
      {m.avatar_url
        ? <img src={m.avatar_url} alt={m.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.9rem',fontWeight:700,color:'#fff'}}>{m.name[0].toUpperCase()}</div>
      }
    </div>
    <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                  <span style={{fontSize:'0.87rem',fontWeight:600,color:'#f1f5f9'}}>{m.name}</span>
                  {m.nickname&&<span style={{fontSize:'0.72rem',color:'#64748b'}}>"{m.nickname}"</span>}
                  {m.mod_group==='russian'&&<span style={{fontSize:'0.6rem',background:'#f59e0b22',color:'#f59e0b',padding:'1px 5px',borderRadius:3,fontWeight:700}}>RU</span>}
                  {m.shift&&<span style={{fontSize:'0.68rem',background:shiftColor+'22',color:shiftColor,padding:'2px 8px',borderRadius:4,fontWeight:600}}>{m.shift}</span>}
                  {m.timezone&&<span style={{fontSize:'0.68rem',color:'#64748b'}}>🌍 {m.timezone}</span>}
                </div>
                {m.full_name&&<div style={{fontSize:'0.72rem',color:'#64748b',marginTop:2}}>{m.full_name}</div>}
                <div style={{display:'flex',gap:12,marginTop:4,flexWrap:'wrap'}}>
                  {m.discord_name&&<span style={{display:'flex',alignItems:'center',gap:4,fontSize:'0.72rem',color:'#94a3b8'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>{m.discord_name}</span>}
                  {m.telegram_name&&<span style={{display:'flex',alignItems:'center',gap:4,fontSize:'0.72rem',color:'#94a3b8'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="#26A5E4"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>{m.telegram_name}</span>}
                </div>
              </div>
              <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                {DAYS.map(d=>(
                  <div key={d} style={{fontSize:'0.6rem',fontWeight:700,padding:'3px 5px',borderRadius:4,background:daysOff.includes(d)?'#f8717115':shiftColor+'15',color:daysOff.includes(d)?'#f87171':shiftColor,textTransform:'uppercase'}}>{d.slice(0,2)}</div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PageCalendar() {
  const [mods, setMods]           = useState([])
  const [vacations, setVacations] = useState([])
  const [swaps, setSwaps]         = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading]     = useState(true)
  const [birthdays, setBirthdays] = useState([])
  const [overrides, setOverrides] = useState([])
  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const isEvenMonth = (month + 1) % 2 === 0
  const DAYS_OF_WEEK = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const MONTH_NAMES  = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const SHIFT_COLOR  = { 'Morning Shift':'#3b82f6','Afternoon Shift':'#8b5cf6','Night Shift':'#06b6d4' }

  useEffect(() => { load() }, [month, year])

  async function load() {
  setLoading(true)
  const firstDay = new Date(year, month, 1).toISOString().split('T')[0]
  const lastDay  = new Date(year, month + 1, 0).toISOString().split('T')[0]
  const [{ data:m },{ data:v },{ data:sw },{ data:bd },{ data:ov }] = await Promise.all([
    supabase.from('profiles').select('id,name,shift,days_off,rotating_days_off,rotating_days_off_alt,mod_group,birthday').eq('role','mod').neq('status','left').order('name'),
    supabase.from('vacation_requests').select('id,user_id,start_date,end_date').eq('status','approved').lte('start_date',lastDay).gte('end_date',firstDay),
    supabase.from('shift_swaps').select('id,requester_id,target_id,swap_date').eq('status','approved').gte('swap_date',firstDay).lte('swap_date',lastDay),
    supabase.from('profiles').select('id,birthday').eq('role','mod').not('birthday','is',null),
    supabase.from('shift_overrides').select('*'),
  ])
  setMods(m||[]); setVacations(v||[]); setSwaps(sw||[])
  setBirthdays(bd||[])
  setOverrides(ov||[])
  setLoading(false)
}
  function getDays() {
    const days = []
    const first = new Date(year, month, 1)
    const last  = new Date(year, month + 1, 0)
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d))
    return days
  }

  function isOff(mod, date) {
    const dayName = date.toLocaleDateString('en-GB',{weekday:'long'})
    let daysOff = mod.days_off || []
    if (mod.rotating_days_off) {
      daysOff = isEvenMonth ? (mod.days_off||[]) : (mod.rotating_days_off_alt||[])
    }
    return daysOff.includes(dayName)
  }

  function isOnVacation(modId, date) {
    const d = date.toISOString().split('T')[0]
    return vacations.some(v => v.user_id===modId && d>=v.start_date && d<=v.end_date)
  }

  function hasSwap(modId, date) {
    const d = date.toISOString().split('T')[0]
    return swaps.some(sw => sw.swap_date===d && (sw.requester_id===modId||sw.target_id===modId))
  }

  function getCell(mod, date) {
    const isBirthday = birthdays.some(b => {
      if (!b.birthday || b.id !== mod.id) return false
      const bd = new Date(b.birthday)
      return bd.getMonth()===date.getMonth() && bd.getDate()===date.getDate()
    })
    if (isBirthday)                  return { label:'🎂', color:'#f59e0b', bg:'#f59e0b18' }
    if (isOnVacation(mod.id, date))  return { label:'VAC', color:'#34d399', bg:'#34d39918' }
    if (hasSwap(mod.id, date))       return { label:'SWAP', color:'#f59e0b', bg:'#f59e0b18' }
    if (isOff(mod, date))            return { label:'OFF', color:'#f87171', bg:'#f8717118' }

    // Check override for this day
    const dayName = date.toLocaleDateString('en-GB',{weekday:'long'})
    const override = overrides.find(o => o.user_id===mod.id && o.day_of_week===dayName)
    if (override) {
      const color = SHIFT_COLOR[override.shift] || '#94a3b8'
      const label = override.start_time && override.end_time
        ? `${override.start_time}-${override.end_time}`
        : override.shift?.split(' ')[0]||'—'
      return { label, color, bg: color+'15' }
    }

    const color = SHIFT_COLOR[mod.shift] || '#94a3b8'
    return { label: mod.shift?.split(' ')[0]||'—', color, bg: color+'15' }
  }

  const days  = getDays()
  const today = new Date()

  const englishMods   = mods.filter(m => m.mod_group !== 'russian')
  const russianMods   = mods.filter(m => m.mod_group === 'russian')
  const nightMods     = englishMods.filter(m => m.shift === 'Night Shift')
  const morningMods   = englishMods.filter(m => m.shift === 'Morning Shift')
  const afternoonMods = englishMods.filter(m => m.shift === 'Afternoon Shift')

function ShiftCalendar({ title, accent, rows }) {
  if (rows.length === 0) return null
  return (
    <div style={{marginBottom:40}}>
      <div style={{fontSize:'0.78rem', fontWeight:700, color:accent, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14, display:'flex', alignItems:'center', gap:10}}>
        <div style={{height:1, width:20, background:accent+'66'}}/>
        {title}
        <div style={{flex:1, height:1, background:accent+'22'}}/>
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{...s.table, minWidth:900}}>
          <thead>
            <tr>
              <th style={{...s.th, width:120, paddingRight:16, position:'sticky', left:0, background:'#0f1117', zIndex:1}}>Mod</th>
              {days.map((d,i) => (
                <th key={i} style={{...s.th, textAlign:'center', minWidth:38, padding:'0 2px 12px', color:d&&d.toDateString()===today.toDateString()?'#60a5fa':'#4a5568', fontWeight:d&&d.toDateString()===today.toDateString()?700:400}}>
                  {d?(<>
                    <div style={{fontSize:'0.57rem', marginBottom:2}}>{DAYS_OF_WEEK[(d.getDay()+6)%7]}</div>
                    <div style={{fontSize:'0.75rem', background:d.toDateString()===today.toDateString()?'#3b82f6':'transparent', color:d.toDateString()===today.toDateString()?'#fff':'inherit', borderRadius:'50%', width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto'}}>{d.getDate()}</div>
                  </>):''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((mod,mi) => (
              <tr key={mod.id} style={{background: mi%2===0?'transparent':'#0a0d1422'}}>
                <td style={{...s.td, fontWeight:500, fontSize:'0.82rem', paddingRight:16, whiteSpace:'nowrap', position:'sticky', left:0, background: mi%2===0?'#141820':'#111520', zIndex:1}}>
                  {mod.name}{mod.rotating_days_off&&<span style={{fontSize:'0.6rem',color:'#4a5568',marginLeft:4}}>↻</span>}
                </td>
                {days.map((d,i) => {
                  if (!d) return <td key={i} style={{padding:'6px 2px', borderBottom:'1px solid #0f1117'}}/>
                  const cell = getCell(mod, d)
                  const isToday = d.toDateString()===today.toDateString()
                  const isWeekend = d.getDay()===0||d.getDay()===6
                  const isWorking = cell.label!=='OFF'&&cell.label!=='VAC'&&cell.label!=='SWAP'&&cell.label!=='🎂'&&!cell.label?.includes('-')
                  return (
                    <td key={i} style={{padding:'6px 2px', textAlign:'center', borderBottom:'1px solid #0f1117', background:isToday?'#1e2433':isWeekend?'#0d1018':'transparent'}}>
                      {isWorking
                        ? <div style={{width:8, height:8, borderRadius:'50%', background:cell.color, margin:'0 auto', opacity:0.75}}/>
                        : <div style={{fontSize:'0.58rem', fontWeight:700, color:cell.color, background:cell.color+'18', padding:'3px 3px', borderRadius:5, textTransform:'uppercase', border:`1px solid ${cell.color}33`}}>
                            {cell.label}
                          </div>
                      }
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

  if (loading) return <div style={s.content}><div style={s.empty}>Loading…</div></div>

  return (
    <div style={{padding:'32px 24px', width:'100%', boxSizing:'border-box'}}>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Team Calendar</h1>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <button style={s.filterBtn} onClick={()=>setCurrentDate(new Date(year,month-1,1))}>← Prev</button>
          <span style={{fontSize:'0.95rem', fontWeight:600, color:'#f1f5f9', minWidth:160, textAlign:'center'}}>{MONTH_NAMES[month]} {year}</span>
          <button style={s.filterBtn} onClick={()=>setCurrentDate(new Date(year,month+1,1))}>Next →</button>
        </div>
      </div>
      <div style={{display:'flex', gap:16, flexWrap:'wrap', marginBottom:24}}>
        {Object.entries(SHIFT_COLOR).map(([shift,color])=>(
  <div key={shift} style={{display:'flex',alignItems:'center',gap:6}}>
    <div style={{width:10,height:10,borderRadius:2,background:color}}/>
    <span style={{fontSize:'0.72rem',color:'#94a3b8'}}>{shift}</span>
  </div>
))}
        <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:10,height:10,borderRadius:2,background:'#f87171'}}/><span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Day Off</span></div>
        <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:10,height:10,borderRadius:2,background:'#34d399'}}/><span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Vacation</span></div>
        <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:10,height:10,borderRadius:2,background:'#f59e0b'}}/><span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Swap</span></div>
        <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:'0.72rem',color:'#64748b'}}>↻ Rotating</span></div>
      </div>
      <div style={{fontSize:'0.75rem', color:'#64748b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16}}>🇬🇧 English Moderators</div>
      <ShiftCalendar title="Night Shift · 00:00–09:00 UTC+1"     accent='#06b6d4' rows={nightMods}/>
      <ShiftCalendar title="Morning Shift · 09:00–17:00 UTC+1"   accent='#3b82f6' rows={morningMods}/>
      <ShiftCalendar title="Afternoon Shift · 17:00–00:00 UTC+1" accent='#8b5cf6' rows={afternoonMods}/>
      {russianMods.length > 0 && (
        <>
          <div style={{fontSize:'0.75rem', color:'#f59e0b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', margin:'24px 0 16px'}}>🇷🇺 Russian Moderators</div>
          <ShiftCalendar title="Schedule" accent='#f59e0b' rows={russianMods}/>
        </>
      )}
    </div>
  )
}

function PageTeamReports() {
  const [reports, setReports]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('today')
  const [modFilter, setModFilter] = useState('')
  const [search, setSearch]       = useState('')
  const [mods, setMods]           = useState({})
  const [modsList, setModsList]   = useState([])
  const [selected, setSelected]   = useState(null)

  useEffect(() => { load() }, [filter, modFilter])

  async function load() {
    setLoading(true)
    const now = new Date(); let from
    if (filter==='today') { from=new Date(now); from.setHours(0,0,0,0) }
else if (filter==='week') { from=new Date(now); from.setDate(now.getDate()-7) }
else if (filter==='month') { from=new Date(now.getFullYear(),now.getMonth(),1) }
else { from=new Date(2024,0,1) }
    const [{ data:r },{ data:p }] = await Promise.all([
      supabase.from('daily_reports').select('*').gte('report_date', from.toISOString().split('T')[0]).order('created_at',{ascending:false}),
      supabase.from('profiles').select('id,name,avatar_url').eq('role','mod'),
    ])
    const map={}; (p||[]).forEach(x=>map[x.id]={name:x.name,avatar_url:x.avatar_url})
    setMods(map); setModsList(p||[])
    setReports(modFilter?(r||[]).filter(x=>x.user_id===modFilter):(r||[]))
    setLoading(false)
  }

  const filtered = search.trim()
    ? reports.filter(r => {
        const q = search.toLowerCase()
        const fields = [
          r.locked_blacktide_rl, r.locked_blacktide_hunt, r.skin_manipulation,
          r.free_coin_abuser, r.phone_abuser, r.referral_abuser,
          r.pending_links, r.important_links, r.notes, r.dev_notes,
          mods[r.user_id]?.name
        ]
        return fields.some(f => f && f.toLowerCase().includes(q))
      })
    : reports

  return (
    <div style={s.content}>
      {selected && <ReportModal report={selected} modName={mods[selected.user_id]?.name} onClose={()=>setSelected(null)}/>}
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Team Reports</h1>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
          <select style={{...s.input,padding:'6px 10px',fontSize:'0.78rem',minWidth:140}} value={modFilter} onChange={e=>setModFilter(e.target.value)}>
            <option value="">All Moderators</option>
            {modsList.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <div style={s.filterRow}>
           {['today','week','month','all'].map(f=>(
  <button key={f} style={{...s.filterBtn,...(filter===f?s.filterActive:{})}} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
))}
          </div>
        </div>
      </div>
      <input style={{...s.input, width:'100%', marginBottom:16}} placeholder="Search by UID, mod name, notes…" value={search} onChange={e=>setSearch(e.target.value)}/>
      {loading?<div style={s.empty}>Loading…</div>:filtered.length===0?(
        <div style={s.card}><p style={s.empty}>No reports found.</p></div>
      ):(
        <div style={s.card}>
          {filtered.map(r=>(
            <ReportCard key={r.id} report={r} modName={mods[r.user_id]?.name} avatarUrl={mods[r.user_id]?.avatar_url} onClick={()=>setSelected(r)}/>
          ))}
        </div>
      )}
    </div>
  )
}

function PageDevReports({ userId }) {
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('open')
  const [mods, setMods]         = useState({})
  const [selected, setSelected] = useState(null)
  const [search, setSearch]     = useState('')

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    const [{ data:r },{ data:p }] = await Promise.all([
      supabase.from('daily_reports').select('*').or('has_bug.eq.true,has_exploit.eq.true').order('created_at',{ascending:false}),
      supabase.from('profiles').select('id,name,avatar_url').eq('role','mod'),
    ])
    const map={}; (p||[]).forEach(x=>map[x.id]={name:x.name,avatar_url:x.avatar_url})
    setMods(map)
    const filtered = filter==='open'?(r||[]).filter(x=>!x.dev_resolved):filter==='resolved'?(r||[]).filter(x=>x.dev_resolved):(r||[])
    setReports(filtered)
    setLoading(false)
  }

  const filtered = search.trim()
    ? reports.filter(r => {
        const q = search.toLowerCase()
        return [r.dev_notes, r.notes, mods[r.user_id]?.name].some(f=>f&&f.toLowerCase().includes(q))
      })
    : reports

  return (
    <div style={s.content}>
      {selected && <ReportModal report={selected} modName={mods[selected.user_id]?.name} onClose={()=>setSelected(null)}/>}
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Dev Reports</h1>
        <div style={s.filterRow}>
          {['open','resolved','all'].map(f=>(
            <button key={f} style={{...s.filterBtn,...(filter===f?s.filterActive:{})}} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
          ))}
        </div>
      </div>
      <input style={{...s.input, width:'100%', marginBottom:16}} placeholder="Search by mod name, description…" value={search} onChange={e=>setSearch(e.target.value)}/>
      {loading?<div style={s.empty}>Loading…</div>:filtered.length===0?(
        <div style={s.card}><p style={s.empty}>No dev reports yet.</p></div>
      ):(
        <div style={s.card}>
          {filtered.map(r=>(
            <ReportCard key={r.id} report={r} modName={mods[r.user_id]?.name} avatarUrl={mods[r.user_id]?.avatar_url} onClick={()=>setSelected(r)}/>
          ))}
        </div>
      )}
    </div>
  )
}

function PageTeam() {
  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>Team</h1>
      <BirthdayCard />
      <TeamDirectory />
    </div>
  )
}

function PageLinks() {
  const LINKS = [
  { category:'Support', items:[
    { label:'Intercom', desc:'Shared inbox', url:'https://app.intercom.com/a/inbox/yeoadtsy/inbox/shared/all', color:'#3b82f6' },
    { label:'Crisp',    desc:'Shared inbox', url:'https://app.crisp.chat/website/fe2e4489-7400-4bb6-8237-c8c14400a245/inbox/', color:'#f59e0b' },
  ]},
  { category:'Dashboards', items:[
    { label:'Rustyloot Dashboard', desc:'User management', url:'https://dashboard.terrypoker.pro/dashboard/users', color:'#f59e0b', logo:'https://vqoxhaggxgwfktuvtoyw.supabase.co/storage/v1/object/public/logos/rustyloot.jpg' },
    { label:'Hunt Dashboard',      desc:'User management', url:'https://dashboard.hunt.gg/users',                  color:'#34d399', logo:'https://vqoxhaggxgwfktuvtoyw.supabase.co/storage/v1/object/public/logos/hunt.jpg' },
    { label:'CSDeals Dashboard',   desc:'User management', url:'https://dashboard.cs.deals/',                      color:'#6366f1', logo:'https://vqoxhaggxgwfktuvtoyw.supabase.co/storage/v1/object/public/logos/csdeals.jpg' },
  ]},
  { category:'Discord', items:[
    { label:'RustyLoot Discord', desc:'Main server',    url:'https://discord.com/channels/984386438160343092/984386438747529278',  color:'#5865F2', logo:'https://vqoxhaggxgwfktuvtoyw.supabase.co/storage/v1/object/public/logos/rustyloot.jpg' },
    { label:'Hunt Discord',      desc:'Hunt server',    url:'https://discord.com/channels/1242469866573926400/1274418382942371996', color:'#34d399', logo:'https://vqoxhaggxgwfktuvtoyw.supabase.co/storage/v1/object/public/logos/hunt.jpg' },
    { label:'CSDeals Discord',   desc:'CSDeals server', url:'https://discord.gg/ZdpR52qrM',                                        color:'#6366f1', logo:'https://vqoxhaggxgwfktuvtoyw.supabase.co/storage/v1/object/public/logos/csdeals.jpg' },
  ]},
  { category:'Sites', items:[
    { label:'Rustyloot', desc:'Live chat', url:'https://rustyloot.gg/', color:'#f59e0b', logo:'https://vqoxhaggxgwfktuvtoyw.supabase.co/storage/v1/object/public/logos/rustyloot.jpg' },
    { label:'Hunt.gg',   desc:'Live chat', url:'https://hunt.gg/',      color:'#34d399', logo:'https://vqoxhaggxgwfktuvtoyw.supabase.co/storage/v1/object/public/logos/hunt.jpg' },
    { label:'CSDeals',   desc:'Live chat', url:'https://cs.deals/',     color:'#6366f1', logo:'https://vqoxhaggxgwfktuvtoyw.supabase.co/storage/v1/object/public/logos/csdeals.jpg' },
  ]},
]

  return (
    <div style={s.content}>
      <h1 style={s.pageTitle}>Work Links</h1>
      {LINKS.map(group => (
        <div key={group.category} style={s.card}>
          <div style={s.cardHead}><span style={s.cardTitle}>{group.category}</span></div>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {group.items.map(link => (
              <a key={link.url} href={link.url} target="_blank" rel="noreferrer" style={{display:'flex', alignItems:'center', gap:14, padding:'12px 14px', borderRadius:10, background:'#0f1117', border:'1px solid #1e2433', textDecoration:'none'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#334155'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='#1e2433'}>
               <div style={{width:36, height:36, borderRadius:8, overflow:'hidden', flexShrink:0, background:link.color+'22', border:`1px solid ${link.color}44`}}>
  {link.logo
    ? <img src={link.logo} alt={link.label} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
    : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <svg width="16" height="16" fill="none" stroke={link.color} strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </div>
  }
</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.87rem', fontWeight:600, color:'#f1f5f9'}}>{link.label}</div>
                  <div style={{fontSize:'0.75rem', color:'#64748b', marginTop:2}}>{link.desc}</div>
                </div>
                <svg width="14" height="14" fill="none" stroke="#4a5568" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function PageApplications({ userId }) {
  const [apps, setApps]       = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')
  const [search, setSearch]   = useState('')

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('applications').select('*').eq('submitted_by', userId).order('created_at',{ascending:false})
    const filtered = filter==='all' ? data : (data||[]).filter(a=>a.status===filter)
    setApps(filtered||[])
    setLoading(false)
  }

  const filtered = search.trim()
    ? apps.filter(a => {
        const q = search.toLowerCase()
        return [a.applicant_name, a.applicant_discord, a.applicant_telegram, a.message].some(f=>f&&f.toLowerCase().includes(q))
      })
    : apps

  const typeColor   = { staff:'#3b82f6', dev:'#8b5cf6' }
  const statusColor = { pending:'#f59e0b', accepted:'#34d399', declined:'#f87171' }

  return (
    <div style={s.content}>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Applications</h1>
        <div style={s.filterRow}>
          {['all','pending','accepted','declined'].map(f=>(
            <button key={f} style={{...s.filterBtn,...(filter===f?s.filterActive:{})}} onClick={()=>setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <input style={{...s.input, width:'100%', marginBottom:16}} placeholder="Search by name, discord, telegram…" value={search} onChange={e=>setSearch(e.target.value)}/>
      {loading?<div style={s.empty}>Loading…</div>:filtered.length===0?(
        <div style={s.card}><p style={s.empty}>No applications yet.</p></div>
      ):(
        <div style={s.card}>
          {filtered.map(a=>(
            <div key={a.id} style={{padding:'12px 0', borderBottom:'1px solid #1e2433'}}>
              <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                    <span style={{fontSize:'0.87rem', fontWeight:600, color:'#f1f5f9'}}>{a.applicant_name}</span>
                    <span style={{fontSize:'0.68rem', fontWeight:700, padding:'2px 8px', borderRadius:20, background:(typeColor[a.type]||'#94a3b8')+'22', color:typeColor[a.type]||'#94a3b8'}}>{a.type?.toUpperCase()}</span>
                    <span style={{fontSize:'0.68rem', fontWeight:700, padding:'2px 8px', borderRadius:20, background:(statusColor[a.status]||'#94a3b8')+'22', color:statusColor[a.status]||'#94a3b8'}}>{a.status}</span>
                  </div>
                  <div style={{fontSize:'0.75rem', color:'#64748b'}}>
                    {a.applicant_discord&&<span style={{marginRight:12}}>💬 {a.applicant_discord}</span>}
                    {a.applicant_telegram&&<span style={{marginRight:12}}>✈️ {a.applicant_telegram}</span>}
                    {fmtDate(a.created_at)}
                  </div>
                  {a.message&&<div style={{fontSize:'0.78rem', color:'#94a3b8', marginTop:4}}>{a.message}</div>}
                  {a.admin_notes&&<div style={{fontSize:'0.75rem', color:'#60a5fa', marginTop:4}}>Admin: {a.admin_notes}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PageMeetingAgenda({ userId }) {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [topic, setTopic]       = useState('')
  const [desc, setDesc]         = useState('')
  const [image, setImage]       = useState(null)
  const [saving, setSaving]     = useState(false)
  const [preview, setPreview]   = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('meeting_agenda')
      .select('*,profiles(name,avatar_url)')
      .eq('status','pending')
      .order('created_at',{ascending:true})
    setItems(data||[])
    setLoading(false)
  }

  async function add() {
  if (!topic.trim()) return
  setSaving(true)
  let image_url = null
  if (image) {
    const ext = image.name.split('.').pop().toLowerCase()
    const path = `agenda-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('agenda').upload(path, image, { upsert:true, contentType: image.type })
    if (!error) {
      const { data } = supabase.storage.from('agenda').getPublicUrl(path)
      image_url = data.publicUrl
    } else {
      console.error('Upload error:', error)
    }
  }
  await supabase.from('meeting_agenda').insert({ submitted_by:userId, topic:topic.trim(), description:desc.trim()||null, image_url })
  setTopic(''); setDesc(''); setImage(null); setPreview(null)
  setSaving(false)
  await load()
}

  return (
    <div style={s.content}>
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setSelected(null)}>
          <div style={{background:'#141820',border:'1px solid #1e2433',borderRadius:16,width:'100%',maxWidth:560,maxHeight:'88vh',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'18px 24px',borderBottom:'1px solid #1e2433',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{flex:1}}>
                <div style={{fontSize:'0.95rem',fontWeight:700,color:'#f1f5f9'}}>{selected.topic}</div>
                <div style={{fontSize:'0.72rem',color:'#64748b',marginTop:4}}>
                  by {selected.profiles?.name||'Unknown'} · {new Date(selected.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})} at {new Date(selected.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
                </div>
              </div>
              <span style={{color:'#4a5568',cursor:'pointer',fontSize:'1.2rem',padding:4}} onClick={()=>setSelected(null)}>✕</span>
            </div>
            <div style={{padding:'20px 24px',overflowY:'auto',flex:1}}>
              {selected.description && (
                <div style={{background:'#0f1117',borderRadius:8,padding:'12px 14px',marginBottom:16,fontSize:'0.85rem',color:'#94a3b8',lineHeight:1.6}}>
                  {selected.description}
                </div>
              )}
              {selected.image_url && (
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:8}}>Screenshot</div>
                  <a href={selected.image_url} target="_blank" rel="noreferrer">
                    <img src={selected.image_url} alt="screenshot" style={{width:'100%',borderRadius:8,border:'1px solid #2d3748',cursor:'pointer'}}/>
                  </a>
                  <div style={{fontSize:'0.68rem',color:'#4a5568',marginTop:6}}>Click image to open full size</div>
                </div>
              )}
              {!selected.description && !selected.image_url && (
                <p style={s.empty}>No additional details provided.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Meeting Agenda</h1>
        <span style={s.chip}>{items.length} topic{items.length!==1?'s':''}</span>
      </div>

      <div style={{...s.card, border:'1px solid #3b82f633', background:'#3b82f606'}}>
        <div style={{fontSize:'0.82rem', color:'#94a3b8', marginBottom:14}}>
          Add topics or situations you want to discuss at the next team meeting.
        </div>
        <input style={{...s.input, width:'100%', marginBottom:10}} placeholder="Topic title…" value={topic} onChange={e=>setTopic(e.target.value)}/>
        <textarea style={{width:'100%', background:'#0f1117', border:'1px solid #2d3748', borderRadius:8, padding:'9px 12px', color:'#e2e8f0', fontSize:'0.85rem', outline:'none', fontFamily:'inherit', resize:'vertical', minHeight:60, marginBottom:10}} placeholder="Additional details (optional)…" value={desc} onChange={e=>setDesc(e.target.value)}/>
        <div style={{marginBottom:12}}>
          <label style={{display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:8, background:'#0f1117', border:'1px solid #2d3748', cursor:'pointer'}}>
            <svg width="16" height="16" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span style={{fontSize:'0.83rem', color:'#64748b'}}>{image ? image.name : 'Attach screenshot (optional)'}</span>
            <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{
              const f = e.target.files[0]
              if (!f) return
              setImage(f)
              setPreview(URL.createObjectURL(f))
            }}/>
          </label>
          {preview && (
            <div style={{marginTop:8, position:'relative', display:'inline-block'}}>
              <img src={preview} alt="preview" style={{maxWidth:'100%', maxHeight:200, borderRadius:8, border:'1px solid #2d3748'}}/>
              <span style={{position:'absolute', top:4, right:4, background:'#141820', borderRadius:'50%', width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'0.8rem', color:'#f87171'}} onClick={()=>{ setImage(null); setPreview(null) }}>✕</span>
            </div>
          )}
        </div>
        <button style={{...s.btnPrimary, width:'100%'}} disabled={saving||!topic.trim()} onClick={add}>
          {saving?'Adding…':'+ Add Topic'}
        </button>
      </div>

      {loading ? <div style={s.empty}>Loading…</div> : items.length===0 ? (
        <div style={s.card}><p style={s.empty}>No topics yet — be the first to add one!</p></div>
      ) : (
        <div style={s.card}>
          {items.map((item,i) => (
            <div key={item.id} onClick={()=>setSelected(item)} style={{display:'flex',gap:12,alignItems:'flex-start',padding:'14px 0',borderBottom:'1px solid #1e2433',cursor:'pointer'}}
              onMouseEnter={e=>e.currentTarget.style.opacity='0.8'}
              onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              <div style={{width:24,height:24,borderRadius:'50%',background:'#1e2433',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.72rem',fontWeight:700,color:'#64748b',flexShrink:0,marginTop:2}}>{i+1}</div>
              <div style={{width:32,height:32,borderRadius:'50%',flexShrink:0,overflow:'hidden'}}>
                {item.profiles?.avatar_url
                  ? <img src={item.profiles.avatar_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.78rem',fontWeight:700,color:'#fff'}}>{(item.profiles?.name||'?')[0].toUpperCase()}</div>
                }
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'0.87rem',fontWeight:600,color:'#f1f5f9',marginBottom:2}}>{item.topic}</div>
                {item.description && <div style={{fontSize:'0.78rem',color:'#64748b',lineHeight:1.4,marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.description}</div>}
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:'0.7rem',color:'#4a5568'}}>by {item.profiles?.name||'Unknown'} · {new Date(item.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})} {new Date(item.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</span>
                  {item.image_url && <span style={{fontSize:'0.68rem',color:'#3b82f6',background:'#3b82f618',padding:'1px 6px',borderRadius:4}}>📎 screenshot</span>}
                </div>
              </div>
              <svg width="14" height="14" fill="none" stroke="#4a5568" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PageVIPUsers({ userId, profile }) {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [platform, setPlatform] = useState('all')
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState({ platform:'rustmagic', username:'', steam_id:'', trade_url:'', discord_id:'', deposit_range:'', registered:false, notes:'' })

  const isVipManager = true
  const PLATFORMS = ['rustmagic','rustyloot','hunt','csdeals','other']
  const PLATFORM_COLOR = { rustmagic:'#f59e0b', rustyloot:'#f87171', hunt:'#34d399', csdeals:'#6366f1', other:'#94a3b8' }

  useEffect(() => { load() }, [platform])

  async function load() {
    setLoading(true)
    let q = supabase.from('vip_users').select('*').order('created_at',{ascending:false})
    if (platform !== 'all') q = q.eq('platform', platform)
    const { data } = await q
    setUsers(data||[])
    setLoading(false)
  }

  async function save() {
    if (!form.username.trim()) return
    setSaving(true)
    if (form.id) {
      await supabase.from('vip_users').update({...form, updated_at: new Date().toISOString()}).eq('id', form.id)
    } else {
      await supabase.from('vip_users').insert({...form, added_by: userId})
    }
    setSaving(false)
    setShowForm(false)
    setForm({ platform:'rustmagic', username:'', steam_id:'', trade_url:'', discord_id:'', deposit_range:'', registered:false, notes:'' })
    await load()
  }

  const filtered = search.trim()
    ? users.filter(u => [u.username, u.steam_id, u.discord_id, u.notes, u.deposit_range]
        .some(f => f && f.toLowerCase().includes(search.toLowerCase())))
    : users

  return (
    <div style={s.content}>
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setSelected(null)}>
          <div style={{background:'#141820',border:'1px solid #1e2433',borderRadius:16,width:'100%',maxWidth:560,maxHeight:'88vh',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'18px 24px',borderBottom:'1px solid #1e2433',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:'0.95rem',fontWeight:700,color:'#f1f5f9'}}>{selected.username}</div>
                <div style={{display:'flex',gap:8,marginTop:4}}>
                  <span style={{fontSize:'0.68rem',fontWeight:700,padding:'2px 8px',borderRadius:20,background:(PLATFORM_COLOR[selected.platform]||'#94a3b8')+'22',color:PLATFORM_COLOR[selected.platform]||'#94a3b8'}}>{selected.platform}</span>
                  <span style={{fontSize:'0.68rem',fontWeight:700,padding:'2px 8px',borderRadius:20,background:selected.registered?'#34d39922':'#f8717122',color:selected.registered?'#34d399':'#f87171'}}>{selected.registered?'Registered':'Not Registered'}</span>
                </div>
              </div>
              <span style={{color:'#4a5568',cursor:'pointer',fontSize:'1.2rem'}} onClick={()=>setSelected(null)}>✕</span>
            </div>
            <div style={{padding:'20px 24px',overflowY:'auto',flex:1}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
                {selected.steam_id&&<div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}><div style={{fontSize:'0.68rem',color:'#4a5568',marginBottom:4}}>Steam ID</div><div style={{fontSize:'0.82rem',color:'#e2e8f0',wordBreak:'break-all'}}>{selected.steam_id}</div></div>}
                {selected.discord_id&&<div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}><div style={{fontSize:'0.68rem',color:'#4a5568',marginBottom:4}}>Discord ID</div><div style={{fontSize:'0.82rem',color:'#e2e8f0'}}>{selected.discord_id}</div></div>}
                {selected.deposit_range&&<div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}><div style={{fontSize:'0.68rem',color:'#4a5568',marginBottom:4}}>Deposit Range</div><div style={{fontSize:'0.85rem',fontWeight:600,color:'#34d399'}}>{selected.deposit_range}</div></div>}
              </div>
              {selected.trade_url&&<div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px',marginBottom:10}}>
                <div style={{fontSize:'0.68rem',color:'#4a5568',marginBottom:4}}>Trade URL / Profile</div>
                <a href={selected.trade_url} target="_blank" rel="noreferrer" style={{fontSize:'0.78rem',color:'#60a5fa',wordBreak:'break-all'}}>{selected.trade_url}</a>
              </div>}
              {selected.notes&&<div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px',marginBottom:10}}>
                <div style={{fontSize:'0.68rem',color:'#4a5568',marginBottom:4}}>Notes</div>
                <div style={{fontSize:'0.83rem',color:'#94a3b8',lineHeight:1.6}}>{selected.notes}</div>
              </div>}
              {isVipManager && (
                <button style={{...s.btnPrimary, width:'100%', marginTop:8}} onClick={()=>{
                  setForm({...selected})
                  setSelected(null)
                  setShowForm(true)
                }}>Edit</button>
              )}
            </div>
          </div>
        </div>
      )}

      {showForm && isVipManager && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#141820',border:'1px solid #1e2433',borderRadius:16,width:'100%',maxWidth:560,maxHeight:'88vh',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'18px 24px',borderBottom:'1px solid #1e2433',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:'0.95rem',fontWeight:700,color:'#f1f5f9'}}>{form.id?'Edit VIP User':'Add VIP User'}</span>
              <span style={{color:'#4a5568',cursor:'pointer',fontSize:'1.2rem'}} onClick={()=>setShowForm(false)}>✕</span>
            </div>
            <div style={{padding:'20px 24px',overflowY:'auto',flex:1,display:'flex',flexDirection:'column',gap:12}}>
              <div><label style={s.label}>Platform</label>
                <select style={{...s.input, width:'100%', marginTop:4}} value={form.platform} onChange={e=>setForm(f=>({...f,platform:e.target.value}))}>
                  {PLATFORMS.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div><label style={s.label}>Username *</label><input style={{...s.input, width:'100%', marginTop:4}} value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))}/></div>
              <div><label style={s.label}>Steam ID</label><input style={{...s.input, width:'100%', marginTop:4}} value={form.steam_id||''} onChange={e=>setForm(f=>({...f,steam_id:e.target.value}))}/></div>
              <div><label style={s.label}>Trade URL / Profile</label><input style={{...s.input, width:'100%', marginTop:4}} value={form.trade_url||''} onChange={e=>setForm(f=>({...f,trade_url:e.target.value}))}/></div>
              <div><label style={s.label}>Discord ID</label><input style={{...s.input, width:'100%', marginTop:4}} value={form.discord_id||''} onChange={e=>setForm(f=>({...f,discord_id:e.target.value}))}/></div>
              <div><label style={s.label}>Deposit Range</label><input style={{...s.input, width:'100%', marginTop:4}} value={form.deposit_range||''} onChange={e=>setForm(f=>({...f,deposit_range:e.target.value}))} placeholder="$50-$500"/></div>
              <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
                <input type="checkbox" checked={!!form.registered} onChange={e=>setForm(f=>({...f,registered:e.target.checked}))} style={{width:16,height:16,accentColor:'#3b82f6'}}/>
                <span style={{fontSize:'0.83rem',color:'#94a3b8'}}>Registered on platform</span>
              </label>
              <div><label style={s.label}>Notes</label><textarea style={{...s.input, width:'100%', minHeight:80, resize:'vertical', fontFamily:'inherit', marginTop:4}} value={form.notes||''} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
            </div>
            <div style={{padding:'16px 24px',borderTop:'1px solid #1e2433'}}>
              <button style={{...s.btnPrimary, width:'100%'}} disabled={saving||!form.username.trim()} onClick={save}>{saving?'Saving…':'Save'}</button>
            </div>
          </div>
        </div>
      )}

      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>VIP Users</h1>
        <button style={s.btnPrimary} onClick={()=>{ setForm({platform:'rustmagic',username:'',steam_id:'',trade_url:'',discord_id:'',deposit_range:'',registered:false,notes:''}); setShowForm(true) }}>+ Add User</button>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        {['all',...PLATFORMS].map(p=>(
          <button key={p} style={{...s.filterBtn,...(platform===p?s.filterActive:{})}} onClick={()=>setPlatform(p)}>
            {p==='all'?'All':p}
            {p!=='all'&&<span style={{marginLeft:6,fontSize:'0.65rem',background:(PLATFORM_COLOR[p]||'#94a3b8')+'33',color:PLATFORM_COLOR[p]||'#94a3b8',padding:'1px 5px',borderRadius:10}}>{users.filter(u=>u.platform===p).length}</span>}
          </button>
        ))}
      </div>

      <input style={{...s.input, width:'100%', marginBottom:16}} placeholder="Search by username, Steam ID, Discord ID, notes…" value={search} onChange={e=>setSearch(e.target.value)}/>

      {loading?<div style={s.empty}>Loading…</div>:filtered.length===0?(
        <div style={s.card}><p style={s.empty}>No VIP users found.</p></div>
      ):(
        <div style={s.card}>
          {filtered.map(u=>(
            <div key={u.id} onClick={()=>setSelected(u)} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid #1e2433',cursor:'pointer'}}
              onMouseEnter={e=>e.currentTarget.style.opacity='0.8'}
              onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              <div style={{width:36,height:36,borderRadius:8,background:(PLATFORM_COLOR[u.platform]||'#94a3b8')+'22',border:`1px solid ${PLATFORM_COLOR[u.platform]||'#94a3b8'}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',fontWeight:700,color:PLATFORM_COLOR[u.platform]||'#94a3b8',flexShrink:0}}>
                {u.username[0].toUpperCase()}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:2}}>
                  <span style={{fontSize:'0.87rem',fontWeight:600,color:'#f1f5f9'}}>{u.username}</span>
                  <span style={{fontSize:'0.63rem',fontWeight:700,padding:'1px 6px',borderRadius:10,background:(PLATFORM_COLOR[u.platform]||'#94a3b8')+'22',color:PLATFORM_COLOR[u.platform]||'#94a3b8'}}>{u.platform}</span>
                  <span style={{fontSize:'0.63rem',fontWeight:700,padding:'1px 6px',borderRadius:10,background:u.registered?'#34d39922':'#f8717122',color:u.registered?'#34d399':'#f87171'}}>{u.registered?'Registered':'Not Registered'}</span>
                </div>
                <div style={{fontSize:'0.73rem',color:'#64748b',display:'flex',gap:12,flexWrap:'wrap'}}>
                  {u.deposit_range&&<span style={{color:'#34d399',fontWeight:600}}>{u.deposit_range}</span>}
                  {u.discord_id&&<span>💬 {u.discord_id}</span>}
                  {u.notes&&<span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:200}}>{u.notes}</span>}
                </div>
              </div>
              <svg width="14" height="14" fill="none" stroke="#4a5568" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


// ==================== ADMIN-FACING COMPONENTS ====================

function formatHours(minutes) { const h=Math.floor(minutes/60), m=minutes%60; return m>0?`${h}h ${m}m`:`${h}h` }
function getWeekRange() {
  const now=new Date(), monday=new Date(now)
  monday.setDate(now.getDate()-((now.getDay()+6)%7)); monday.setHours(0,0,0,0)
  const sunday=new Date(monday); sunday.setDate(monday.getDate()+6); sunday.setHours(23,59,59,999)
  return { monday, sunday }
}
function pillColor(status) {
  const map = { pending:{bg:'#f59e0b22',col:'#f59e0b'}, approved:{bg:'#34d39922',col:'#34d399'}, declined:{bg:'#f8717122',col:'#f87171'}, working:{bg:'#34d39922',col:'#34d399'}, lunch:{bg:'#f59e0b22',col:'#f59e0b'}, done:{bg:'#94a3b822',col:'#94a3b8'}, active:{bg:'#34d39922',col:'#34d399'}, inactive:{bg:'#f8717122',col:'#f87171'}, left:{bg:'#f8717122',col:'#f87171'} }
  return map[status] || {bg:'#94a3b822',col:'#94a3b8'}
}

const DiscordIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
const TelegramIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="#26A5E4"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>

function AdminReportModal({ report, modName, onClose, onResolve, isAdmin, hideDevInfo }) {
    function IDList({ val }) {
    if (!val) return <span style={{color:'#4a5568'}}>—</span>
    const ids = val.split(/[\n,\s]+/).filter(Boolean)
    if (ids.length === 0) return <span style={{color:'#4a5568'}}>—</span>
    return <>{ids.map((id,i)=><div key={i} style={{fontSize:'0.82rem',padding:'2px 0'}}>{id}</div>)}</>
  }
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={onClose}>
      <div style={{background:'#141820',border:'1px solid #1e2433',borderRadius:16,width:'100%',maxWidth:680,maxHeight:'88vh',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:'18px 24px',borderBottom:'1px solid #1e2433',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:'0.95rem',fontWeight:700,color:'#f1f5f9'}}>{modName||'Report'} — {fmtDate(report.report_date)}</div>
            <div style={{fontSize:'0.75rem',color:'#64748b',marginTop:2}}>{report.shift}</div>
          </div>
          <span style={{color:'#4a5568',cursor:'pointer',fontSize:'1.2rem',padding:4}} onClick={onClose}>✕</span>
        </div>
        <div style={{padding:'20px 24px',overflowY:'auto',flex:1}}>
          {(report.pending_links||report.important_links)&&(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              {report.pending_links&&(()=>{
                try {
                  const tickets = JSON.parse(report.pending_links)
                  if (Array.isArray(tickets) && tickets.length>0) return (
                    <div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}>
                      <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:6}}>🔗 Pending</div>
                      {tickets.map((t,i)=>(
                        <a key={i} href={t.link} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:6,padding:'6px 8px',borderRadius:6,background:'#141820',border:'1px solid #1e2433',marginBottom:6,textDecoration:'none',cursor:'pointer'}}
                          onMouseEnter={e=>e.currentTarget.style.borderColor='#3b82f6'}
                          onMouseLeave={e=>e.currentTarget.style.borderColor='#1e2433'}>
                          <span style={{fontSize:'0.78rem',color:'#60a5fa',flex:1}}>{t.description||t.link}</span>
                          <svg width="10" height="10" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      ))}
                    </div>
                  )
                } catch(e) {}
                return null
              })()}
              {report.important_links&&(()=>{
                try {
                  const tickets = JSON.parse(report.important_links)
                  if (Array.isArray(tickets) && tickets.length>0) return (
                    <div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}>
                      <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:6}}>⭐ Important</div>
                      {tickets.map((t,i)=>(
                        <a key={i} href={t.link} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:6,padding:'6px 8px',borderRadius:6,background:'#141820',border:'1px solid #1e2433',marginBottom:6,textDecoration:'none',cursor:'pointer'}}
                          onMouseEnter={e=>e.currentTarget.style.borderColor='#f59e0b'}
                          onMouseLeave={e=>e.currentTarget.style.borderColor='#1e2433'}>
                          <span style={{fontSize:'0.78rem',color:'#f59e0b',flex:1}}>{t.description||t.link}</span>
                          <svg width="10" height="10" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      ))}
                    </div>
                  )
                } catch(e) {}
                return null
              })()}
            </div>
          )}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            {[
              ['🔒 Blacktide — Rustyloot',report.locked_blacktide_rl],
              ['🔒 Blacktide — Hunt',report.locked_blacktide_hunt],
              ['🔒 Skin Manip. (RL)',report.skin_manipulation],
              ['⚠️ Free Coin (RL)',report.free_coin_abuser],
              ['⚠️ Phone (Hunt)',report.phone_abuser],
              ['⚠️ Referral (Hunt)',report.referral_abuser],
            ].map(([label,val])=>(
              <div key={label} style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}>
                <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:6}}>{label}</div>
                <IDList val={val}/>
              </div>
            ))}
          </div>
          {!hideDevInfo && (report.has_bug||report.has_exploit)&&(
  <div style={{background:'#f8717108',border:'1px solid #f8717133',borderRadius:8,padding:'10px 14px',marginBottom:12}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
      <div style={{fontSize:'0.72rem',color:'#f87171',fontWeight:600}}>
        {report.has_bug?'🐛 Bug reported':''}{report.has_bug&&report.has_exploit?' · ':''}{report.has_exploit?'⚠️ Exploit reported':''}
        {report.dev_resolved&&<span style={{marginLeft:8,color:'#34d399'}}>✓ Resolved</span>}
      </div>
      {!report.dev_resolved && onResolve && <button style={sa.btnApprove} onClick={()=>onResolve(report.id)}>Mark Resolved</button>}
    </div>
    {isAdmin
      ? <AdminDevNotes reportId={report.id} initialNotes={report.dev_notes}/>
      : report.dev_notes&&<div style={{fontSize:'0.83rem',color:'#94a3b8'}}>{report.dev_notes}</div>
    }
  </div>
)}
          {report.notes&&<div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}>
            <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:4}}>📝 Notes</div>
            <div style={{fontSize:'0.83rem',color:'#94a3b8'}}>{report.notes}</div>
          </div>}
        </div>
      </div>
    </div>
  )
}

function AdminReportCard({ report, modName, avatarUrl, onClick, hideDevInfo }) {
  return (
    <div onClick={onClick} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:10,background:'#0f1117',border:'1px solid #1e2433',cursor:'pointer',marginBottom:8}}
      onMouseEnter={e=>e.currentTarget.style.borderColor='#334155'}
      onMouseLeave={e=>e.currentTarget.style.borderColor='#1e2433'}>
      {avatarUrl
        ? <img src={avatarUrl} alt="" style={{width:32,height:32,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>
        : <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',fontWeight:700,color:'#fff',flexShrink:0}}>{(modName||'?')[0].toUpperCase()}</div>
      }
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          {modName && <span style={{fontSize:'0.85rem',fontWeight:600,color:'#f1f5f9'}}>{modName}</span>}
          <span style={{fontSize:'0.72rem',color:'#64748b'}}>{report.shift}</span>
          <span style={{fontSize:'0.72rem',color:'#4a5568'}}>{fmtDate(report.report_date)}</span>
          {report.has_bug&&<span style={{fontSize:'0.63rem',fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#f8717122',color:'#f87171'}}>🐛 Bug</span>}
          {report.has_exploit&&<span style={{fontSize:'0.63rem',fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#f59e0b22',color:'#f59e0b'}}>⚠️ Exploit</span>}
          {report.dev_resolved&&<span style={{fontSize:'0.63rem',fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#34d39922',color:'#34d399'}}>✓ Resolved</span>}
        </div>
        <div style={{fontSize:'0.73rem',color:'#64748b',marginTop:2}}>
          {(()=>{
            let parts = []
            try { const p=JSON.parse(report.pending_links||'[]'); if(p.length>0) parts.push(`${p.length} pending`) } catch(e){}
            try { const i=JSON.parse(report.important_links||'[]'); if(i.length>0) parts.push(`${i.length} important`) } catch(e){}
            if(report.notes) parts.push('📝 notes')
            return parts.length>0 ? parts.join(' · ') : fmtDate(report.report_date)
          })()}
        </div>
      </div>
      <svg width="14" height="14" fill="none" stroke="#4a5568" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
    </div>
  )
}

function AdminPageProfile({ userId, profile, onRefresh }) {
  const [form, setForm] = useState({ name:'', full_name:'' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    if (profile) setForm({ name: profile.name||'', full_name: profile.full_name||'' })
  }, [profile])

  async function save() {
    setSaving(true)
    await supabase.from('profiles').update({ name: form.name, full_name: form.full_name }).eq('id', userId)
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2000); onRefresh()
  }

  async function uploadAvatar(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingAvatar(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert:true })
    if (error) { alert(error.message); setUploadingAvatar(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', userId)
    setUploadingAvatar(false)
    onRefresh()
  }

  return (
    <div style={sa.content}>
      <h1 style={{...sa.pageTitle, marginBottom:16}}>My Profile</h1>

      <div style={{...sa.card, display:'flex', alignItems:'center', gap:20, flexWrap:'wrap', paddingTop:20}}>
        <div style={{position:'relative', flexShrink:0}}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" style={{width:72, height:72, borderRadius:'50%', objectFit:'cover', border:'2px solid #1e2433'}}/>
          ) : (
            <div style={{width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', fontWeight:800, color:'#fff'}}>
              {(profile?.name||'?')[0].toUpperCase()}
            </div>
          )}
          <label style={{position:'absolute', bottom:0, right:0, width:22, height:22, borderRadius:'50%', background:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'2px solid #141820'}}>
            {uploadingAvatar
              ? <span style={{fontSize:'0.6rem', color:'#fff'}}>…</span>
              : <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            }
            <input type="file" accept="image/*" style={{display:'none'}} onChange={uploadAvatar}/>
          </label>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:'1.1rem', fontWeight:700, color:'#f1f5f9', marginBottom:4}}>{profile?.name}</div>
          {profile?.full_name && <div style={{fontSize:'0.82rem', color:'#64748b'}}>{profile.full_name}</div>}
          <span style={{fontSize:'0.72rem', color:'#f87171', background:'#f8717122', padding:'3px 10px', borderRadius:20, fontWeight:600, marginTop:6, display:'inline-block'}}>Administrator</span>
        </div>
      </div>

      <div style={sa.card}>
        <div style={sa.cardHead}><span style={sa.cardTitle}>Edit Information</span></div>
        <div style={sa.formGrid}>
          <div style={sa.formGroup}><label style={sa.label}>Display Name</label><input style={sa.input} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div style={sa.formGroup}><label style={sa.label}>Full Name</label><input style={sa.input} value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))}/></div>
        </div>
        <button style={{...sa.btnPrimary, marginTop:20}} disabled={saving} onClick={save}>
          {saved?'✓ Saved':saving?'Saving…':'Save Changes'}
        </button>
      </div>
    </div>
  )
}

function AdminBirthdayList() {
  const [people, setPeople] = useState([])
  useEffect(() => {
    supabase.from('profiles').select('id,name,birthday,avatar_url').eq('role','mod').not('birthday','is',null)
      .then(({data}) => {
        const today = new Date(); today.setHours(0,0,0,0)
        const enriched = (data||[]).map(p => {
          const bday = new Date(p.birthday)
          const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
          if (next < today) next.setFullYear(today.getFullYear()+1)
          return { ...p, daysUntil: Math.ceil((next-today)/86400000), nextBirthday: next }
        }).sort((a,b) => a.daysUntil - b.daysUntil).slice(0,8)
        setPeople(enriched)
      })
  }, [])
  return people.length === 0 ? <p style={sa.empty}>No birthdays coming up.</p> : (
    <>
      {people.map(p => (
        <div key={p.id} style={{display:'flex', alignItems:'center', gap:12, padding:'8px 0', borderBottom:'1px solid #1e2433'}}>
          <div style={{width:32,height:32,borderRadius:'50%',flexShrink:0,overflow:'hidden'}}>
            {p.avatar_url
              ? <img src={p.avatar_url} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',fontWeight:700,color:'#fff'}}>{p.name[0].toUpperCase()}</div>
            }
          </div>
          <span style={{flex:1, fontSize:'0.85rem', fontWeight:500}}>{p.name}</span>
          <span style={{fontSize:'0.75rem', color:'#64748b'}}>{p.nextBirthday.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>
          <span style={{fontSize:'0.72rem', fontWeight:600, padding:'3px 10px', borderRadius:20, background: p.daysUntil===0?'#f59e0b22':'#3b82f622', color: p.daysUntil===0?'#f59e0b':'#60a5fa'}}>
            {p.daysUntil===0 ? '🎉 Today!' : p.daysUntil===1 ? 'Tomorrow' : `In ${p.daysUntil} days`}
          </span>
        </div>
      ))}
    </>
  )
}

function PageDashboard({ onDuty, weeklyHours, upcomingLeave, pendingCount }) {
  const online  = onDuty.filter(r => r.status !== 'lunch')
  const onLunch = onDuty.filter(r => r.status === 'lunch')
  return (
    <div style={sa.content}>
      <h1 style={sa.pageTitle}>Dashboard</h1>
      <div style={sa.statRow}>
        {[
          { num:online.length,   label:'Online',            col:'#34d399' },
          { num:onLunch.length,  label:'On Lunch',          col:'#f59e0b' },
          { num:onDuty.length,   label:'Total On Duty',     col:'#60a5fa' },
          { num:pendingCount,    label:'Pending Approvals', col:'#f87171' },
        ].map(st => (
          <div key={st.label} style={sa.statCard}>
            <span style={{...sa.statNum, color:st.col}}>{st.num}</span>
            <span style={sa.statLabel}>{st.label}</span>
          </div>
        ))}
      </div>
      <div style={sa.twoCol}>
        <div style={sa.card}>
          <div style={sa.cardHead}>
            <span style={sa.cardTitle}>Who's On Duty</span>
            <span style={sa.liveChip}><span style={sa.liveDot}/>LIVE</span>
          </div>
          {onDuty.length === 0 ? <p style={sa.empty}>No moderators on duty.</p> : onDuty.map(r => {
  const lastSeen = r.profiles?.last_seen ? new Date(r.profiles.last_seen) : null
  const minsAgo = lastSeen ? Math.floor((new Date()-lastSeen)/60000) : null
  const isActive = minsAgo !== null && minsAgo < 5
  return (
    <div key={r.id} style={sa.dutyRow}>
      <span style={{...sa.dot, background: r.status==='lunch'?'#f59e0b':'#34d399'}}/>
      <span style={{flex:1, fontSize:'0.85rem'}}>{r.profiles?.name}</span>
      <span style={{fontSize:'0.72rem', color:'#64748b'}}>{r.status==='lunch'?`Lunch · ${elapsed(r.lunch_start)}`:'Working'} · since {fmtTime(r.clock_in)}</span>
      {lastSeen && (
        <span style={{fontSize:'0.68rem', fontWeight:600, padding:'2px 8px', borderRadius:20, background:isActive?'#34d39922':'#f59e0b22', color:isActive?'#34d399':'#f59e0b'}}>
          {isActive ? '● Active' : `${minsAgo}m ago`}
        </span>
      )}
    </div>
  )
})}
        </div>
        <div style={sa.card}>
          <div style={sa.cardHead}><span style={sa.cardTitle}>Upcoming Leave</span><span style={sa.chip}>Next 14 days</span></div>
          {upcomingLeave.length === 0 ? <p style={sa.empty}>No approved leave upcoming.</p> : upcomingLeave.map(r => (
            <div key={r.id} style={sa.dutyRow}>
              <span style={{flex:1, fontSize:'0.85rem'}}>{r.profiles?.name}</span>
              <span style={{fontSize:'0.75rem', color:'#60a5fa'}}>{fmtDate(r.start_date)} → {fmtDate(r.end_date)}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={sa.card}>
        <div style={sa.cardHead}><span style={sa.cardTitle}>Weekly Hours</span><span style={sa.chip}>Target: 35h</span></div>
        {weeklyHours.length === 0 ? <p style={sa.empty}>No records this week.</p> : weeklyHours.map(mod => {
          const pct = Math.min(100, Math.round((mod.minutes/(35*60))*100))
          const over = mod.minutes > 35*60
          return (
            <div key={mod.name} style={sa.hoursRow}>
              <span style={sa.hoursName}>{mod.name}</span>
              <div style={sa.barTrack}><div style={{...sa.barFill, width:`${pct}%`, background: over?'linear-gradient(90deg,#f59e0b,#fbbf24)':'linear-gradient(90deg,#3b82f6,#60a5fa)'}}/></div>
              <span style={{fontSize:'0.72rem', color: over?'#f59e0b':'#64748b', textAlign:'right', minWidth:48}}>{formatHours(mod.minutes)}</span>
            </div>
          )
        })}
      </div>
      <div style={sa.card}>
        <div style={sa.cardHead}>
          <span style={sa.cardTitle}>🎂 Upcoming Birthdays</span>
          <span style={sa.chip}>Next 30 days</span>
        </div>
        <AdminBirthdayList />
      </div>
    </div>
  )
}

function VacationHistory({ profiles }) {
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

function PageApprovals({ onCountChange }) {
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
                    <div style={sa.approvalMeta}>{requester?.shift} ↔ {target?.shift} · {fmtDate(r.swap_date)}</div>
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
                    <div style={sa.approvalMeta}>{requester?.shift} ↔ {target?.shift} · {fmtDate(r.swap_date)}</div>
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

function PageModerators() {
  const [mods, setMods]             = useState([])
  const [formerMods, setFormerMods] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [tab, setTab]               = useState('active')
  const [form, setForm]             = useState({ name:'', full_name:'', nickname:'', email:'', password:'', shift:'', birthday:'', timezone:'UTC+1', discord_name:'', telegram_name:'', mod_group:'english' })
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState(null)
  const [editMod, setEditMod]       = useState(null)

  const SHIFTS    = ['Morning Shift','Afternoon Shift','Night Shift']
  const TIMEZONES = ['UTC-5','UTC-4','UTC-3','UTC-2','UTC-1','UTC+0','UTC+1','UTC+2','UTC+3','UTC+4','UTC+5','UTC+6']

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('profiles').select('*').eq('role','mod').order('name')
    setMods((data||[]).filter(m => m.status !== 'left'))
    setFormerMods((data||[]).filter(m => m.status === 'left'))
    setLoading(false)
  }

  async function createMod() {
    if (!form.name || !form.email || !form.password) { setError('Name, email and password are required.'); return }
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/admin?action=create_mod', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error)
      setShowForm(false)
      setForm({ name:'', full_name:'', nickname:'', email:'', password:'', shift:'', birthday:'', timezone:'UTC+1', discord_name:'', telegram_name:'', mod_group:'english' })
      load()
    } catch(e) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function saveMod() {
    await supabase.from('profiles').update({
      name: editMod.name, full_name: editMod.full_name, nickname: editMod.nickname,
      shift: editMod.shift, status: editMod.status, vacation_allowance: editMod.vacation_allowance,
      timezone: editMod.timezone, discord_name: editMod.discord_name, telegram_name: editMod.telegram_name,
      mod_group: editMod.mod_group, birthday: editMod.birthday,
      left_date: editMod.left_date||null, left_reason: editMod.left_reason||null,
    }).eq('id', editMod.id)
    setEditMod(null); load()
  }

  async function markAsLeft(mod) {
    await supabase.from('profiles').update({ status:'left', left_date: new Date().toISOString().split('T')[0] }).eq('id', mod.id)
    load()
  }

  async function reactivate(mod) {
    await supabase.from('profiles').update({ status:'active', left_date:null, left_reason:null }).eq('id', mod.id)
    load()
  }

  function ModCard({ m }) {
    return (
      <div style={{padding:'16px 0', borderBottom:'1px solid #1e2433'}}>
        <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
         <div style={{position:'relative', flexShrink:0}}>
  <div style={{width:34,height:34,borderRadius:'50%',overflow:'hidden'}}>
    {m.avatar_url
      ? <img src={m.avatar_url} alt={m.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
      : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',fontWeight:700,color:'#fff'}}>{(m.name||'?')[0].toUpperCase()}</div>
    }
  </div>
  <label style={{position:'absolute',bottom:-2,right:-2,width:14,height:14,borderRadius:'50%',background:'#3b82f6',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',border:'2px solid #141820'}}>
    <svg width="7" height="7" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
    <input type="file" accept="image/*" style={{display:'none'}} onChange={async e=>{
      const file = e.target.files[0]
      if (!file) return
      const ext = file.name.split('.').pop()
      const path = `${m.id}.${ext}`
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert:true })
      if (error) { alert(error.message); return }
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', m.id)
      load()
    }}/>
  </label>
</div>
          <div style={{flex:1, minWidth:160}}>
            <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
              <span style={{fontSize:'0.87rem', fontWeight:600}}>{m.name}</span>
              {m.nickname && <span style={{fontSize:'0.72rem', color:'#64748b'}}>"{m.nickname}"</span>}
              {m.mod_group==='russian' && <span style={{fontSize:'0.6rem', background:'#f59e0b22', color:'#f59e0b', padding:'1px 5px', borderRadius:3, fontWeight:700}}>RU</span>}
              <span style={{...sa.pill, background:pillColor(m.status||'active').bg, color:pillColor(m.status||'active').col}}>{m.status||'active'}</span>
            </div>
            <div style={{fontSize:'0.72rem', color:'#64748b', marginTop:3, display:'flex', gap:12, flexWrap:'wrap'}}>
              {m.full_name && <span>👤 {m.full_name}</span>}
              {m.email && <span>✉️ {m.email}</span>}
              {m.shift && <span>⏰ {m.shift}</span>}
              {m.last_seen && (
  <span style={{fontSize:'0.72rem', color: (new Date()-new Date(m.last_seen))<5*60*1000 ? '#34d399' : (new Date()-new Date(m.last_seen))<30*60*1000 ? '#f59e0b' : '#4a5568'}}>
    ● {(new Date()-new Date(m.last_seen))<60000 ? 'Just now' : (new Date()-new Date(m.last_seen))<3600000 ? `${Math.floor((new Date()-new Date(m.last_seen))/60000)}m ago` : `${Math.floor((new Date()-new Date(m.last_seen))/3600000)}h ago`}
  </span>
)}
              {m.timezone && <span>🌍 {m.timezone}</span>}
            </div>
            <div style={{fontSize:'0.72rem', color:'#64748b', marginTop:3, display:'flex', gap:12, flexWrap:'wrap'}}>
              {m.discord_name && <span style={{display:'flex', alignItems:'center', gap:4}}><DiscordIcon/>{m.discord_name}</span>}
              {m.telegram_name && <span style={{display:'flex', alignItems:'center', gap:4}}><TelegramIcon/>{m.telegram_name}</span>}
              {m.birthday && <span>🎂 {new Date(m.birthday).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>}
              <span>🏖️ {m.vacation_used||0}/{m.vacation_allowance||15} days used</span>
            </div>
            {m.status==='left' && m.left_date && <div style={{fontSize:'0.72rem', color:'#f87171', marginTop:3}}>Left on {fmtDate(m.left_date)}{m.left_reason?` · ${m.left_reason}`:''}</div>}
          </div>
          <div style={{display:'flex', gap:6}}>
            <button style={sa.btnSmBlue} onClick={()=>setEditMod({...m})}>Edit</button>
            {m.status!=='left'
              ? <button style={sa.btnSmRed} onClick={()=>markAsLeft(m)}>Mark as Left</button>
              : <button style={sa.btnSmGreen} onClick={()=>reactivate(m)}>Reactivate</button>
            }
          </div>
        </div>
        {editMod?.id === m.id && (
          <div style={{background:'#0f1117', borderRadius:10, padding:20, marginTop:12}}>
            <div style={sa.formGrid}>
              <div style={sa.formGroup}><label style={sa.label}>Username</label><input style={sa.input} value={editMod.name||''} onChange={e=>setEditMod(em=>({...em,name:e.target.value}))}/></div>
              <div style={sa.formGroup}><label style={sa.label}>Full Name</label><input style={sa.input} value={editMod.full_name||''} onChange={e=>setEditMod(em=>({...em,full_name:e.target.value}))}/></div>
              <div style={sa.formGroup}><label style={sa.label}>Nickname</label><input style={sa.input} value={editMod.nickname||''} onChange={e=>setEditMod(em=>({...em,nickname:e.target.value}))}/></div>
              <div style={sa.formGroup}><label style={sa.label}>Discord</label><input style={sa.input} value={editMod.discord_name||''} onChange={e=>setEditMod(em=>({...em,discord_name:e.target.value}))}/></div>
              <div style={sa.formGroup}><label style={sa.label}>Telegram</label><input style={sa.input} value={editMod.telegram_name||''} onChange={e=>setEditMod(em=>({...em,telegram_name:e.target.value}))}/></div>
              <div style={sa.formGroup}><label style={sa.label}>Timezone</label>
                <select style={sa.input} value={editMod.timezone||'UTC+1'} onChange={e=>setEditMod(em=>({...em,timezone:e.target.value}))}>
                  {TIMEZONES.map(tz=><option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
              <div style={sa.formGroup}><label style={sa.label}>Shift</label>
                <select style={sa.input} value={editMod.shift||''} onChange={e=>setEditMod(em=>({...em,shift:e.target.value}))}>
                  <option value="">No shift</option>
                  {SHIFTS.map(sh=><option key={sh} value={sh}>{sh}</option>)}
                </select>
              </div>
              <div style={sa.formGroup}><label style={sa.label}>Group</label>
                <select style={sa.input} value={editMod.mod_group||'english'} onChange={e=>setEditMod(em=>({...em,mod_group:e.target.value}))}>
                  <option value="english">English</option>
                  <option value="russian">Russian</option>
                </select>
              </div>
              <div style={sa.formGroup}><label style={sa.label}>Date of Birth</label><input style={sa.input} type="date" value={editMod.birthday||''} onChange={e=>setEditMod(em=>({...em,birthday:e.target.value}))}/></div>
              <div style={sa.formGroup}><label style={sa.label}>Vacation Allowance</label><input style={sa.input} type="number" value={editMod.vacation_allowance||15} onChange={e=>setEditMod(em=>({...em,vacation_allowance:+e.target.value}))}/></div>
              <div style={sa.formGroup}><label style={sa.label}>Status</label>
                <select style={sa.input} value={editMod.status||'active'} onChange={e=>setEditMod(em=>({...em,status:e.target.value}))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="left">Left</option>
                </select>
              </div>
              {editMod.status==='left' && <>
                <div style={sa.formGroup}><label style={sa.label}>Left Date</label><input style={sa.input} type="date" value={editMod.left_date||''} onChange={e=>setEditMod(em=>({...em,left_date:e.target.value}))}/></div>
                <div style={{...sa.formGroup, gridColumn:'span 2'}}><label style={sa.label}>Reason</label><input style={sa.input} value={editMod.left_reason||''} onChange={e=>setEditMod(em=>({...em,left_reason:e.target.value}))} placeholder="Optional…"/></div>
              </>}
            </div>
            <div style={{display:'flex', gap:8, marginTop:16}}>
              <button style={sa.btnSmGreen} onClick={saveMod}>Save Changes</button>
              <button style={sa.btnSmRed} onClick={()=>setEditMod(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) return <div style={sa.content}><div style={sa.empty}>Loading…</div></div>

  return (
    <div style={sa.content}>
      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Moderators</h1>
        <button style={sa.btnPrimary} onClick={()=>setShowForm(f=>!f)}>{showForm?'Cancel':'+ Add Moderator'}</button>
      </div>
      {showForm && (
        <div style={sa.card}>
          <div style={sa.cardHead}><span style={sa.cardTitle}>New Moderator</span></div>
          {error && <div style={sa.errorBox}>{error}</div>}
          <div style={sa.formGrid}>
            <div style={sa.formGroup}><label style={sa.label}>Username *</label><input style={sa.input} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="johndoe"/></div>
            <div style={sa.formGroup}><label style={sa.label}>Full Name</label><input style={sa.input} value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))} placeholder="John Doe"/></div>
            <div style={sa.formGroup}><label style={sa.label}>Nickname</label><input style={sa.input} value={form.nickname} onChange={e=>setForm(f=>({...f,nickname:e.target.value}))} placeholder="Johnny"/></div>
            <div style={sa.formGroup}><label style={sa.label}>Email *</label><input style={sa.input} type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="john@example.com"/></div>
            <div style={sa.formGroup}><label style={sa.label}>Password *</label><input style={sa.input} type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Temporary password"/></div>
            <div style={sa.formGroup}>
              <label style={{...sa.label, display:'flex', alignItems:'center', gap:4}}><DiscordIcon/> Discord</label>
              <input style={sa.input} value={form.discord_name} onChange={e=>setForm(f=>({...f,discord_name:e.target.value}))} placeholder="username"/>
            </div>
            <div style={sa.formGroup}>
              <label style={{...sa.label, display:'flex', alignItems:'center', gap:4}}><TelegramIcon/> Telegram</label>
              <input style={sa.input} value={form.telegram_name} onChange={e=>setForm(f=>({...f,telegram_name:e.target.value}))} placeholder="@username"/>
            </div>
            <div style={sa.formGroup}><label style={sa.label}>Shift</label>
              <select style={sa.input} value={form.shift} onChange={e=>setForm(f=>({...f,shift:e.target.value}))}>
                <option value="">Select shift…</option>
                {SHIFTS.map(sh=><option key={sh} value={sh}>{sh}</option>)}
              </select>
            </div>
            <div style={sa.formGroup}><label style={sa.label}>Timezone</label>
              <select style={sa.input} value={form.timezone} onChange={e=>setForm(f=>({...f,timezone:e.target.value}))}>
                {TIMEZONES.map(tz=><option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
            <div style={sa.formGroup}><label style={sa.label}>Group</label>
              <select style={sa.input} value={form.mod_group} onChange={e=>setForm(f=>({...f,mod_group:e.target.value}))}>
                <option value="english">English</option>
                <option value="russian">Russian</option>
              </select>
            </div>
            <div style={sa.formGroup}><label style={sa.label}>Date of Birth</label><input style={sa.input} type="date" value={form.birthday} onChange={e=>setForm(f=>({...f,birthday:e.target.value}))}/></div>
          </div>
          <button style={{...sa.btnPrimary,marginTop:16}} disabled={saving} onClick={createMod}>{saving?'Creating…':'Create Account'}</button>
        </div>
      )}
      <div style={{display:'flex', gap:6, marginBottom:16}}>
        <button style={{...sa.filterBtn,...(tab==='active'?sa.filterActive:{})}} onClick={()=>setTab('active')}>Active ({mods.length})</button>
        <button style={{...sa.filterBtn,...(tab==='former'?sa.filterActive:{})}} onClick={()=>setTab('former')}>Former ({formerMods.length})</button>
      </div>
      {tab==='active' && (
        <div style={sa.card}>
          <div style={sa.cardHead}><span style={sa.cardTitle}>Active Moderators</span><span style={sa.badge}>{mods.length}</span></div>
          {mods.length===0 ? <p style={sa.empty}>No active moderators.</p> : mods.map(m => <ModCard key={m.id} m={m}/>)}
        </div>
      )}
      {tab==='former' && (
        <div style={sa.card}>
          <div style={sa.cardHead}><span style={sa.cardTitle}>Former Moderators</span><span style={sa.badge}>{formerMods.length}</span></div>
          {formerMods.length===0 ? <p style={sa.empty}>No former moderators.</p> : formerMods.map(m => <ModCard key={m.id} m={m}/>)}
        </div>
      )}
    </div>
  )
}

function AdminPageAttendance() {
  const [records, setRecords]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('today')
  const [modFilter, setModFilter] = useState('')
  const [mods, setMods]           = useState([])

  useEffect(() => { supabase.from('profiles').select('id,name').eq('role','mod').then(({data})=>setMods(data||[])) }, [])
  useEffect(() => { load() }, [filter, modFilter])

  async function load() {
    setLoading(true)
    const now = new Date(); let from
    if (filter==='today') { from=new Date(now); from.setHours(0,0,0,0) }
    else if (filter==='week') { const {monday}=getWeekRange(); from=monday }
    else { from=new Date(now.getFullYear(),now.getMonth(),1) }
    let q = supabase.from('attendance').select('*, profiles(name,role)').gte('clock_in',from.toISOString()).order('clock_in',{ascending:false})
    if (modFilter) q = q.eq('user_id', modFilter)
    const { data } = await q
    setRecords((data||[]).filter(r=>r.profiles?.role!=='admin'))
    setLoading(false)
  }

  function duration(ci,co) {
    if (!co) return <span style={{color:'#34d399'}}>Active</span>
    return formatHours(Math.round((new Date(co)-new Date(ci))/60000))
  }

  return (
    <div style={sa.content}>
      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Attendance Logs</h1>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <select style={{...sa.input, padding:'6px 10px', fontSize:'0.78rem'}} value={modFilter} onChange={e=>setModFilter(e.target.value)}>
            <option value="">All Moderators</option>
            {mods.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <div style={sa.filterRow}>
            {['today','week','month'].map(f=>(
              <button key={f} style={{...sa.filterBtn,...(filter===f?sa.filterActive:{})}} onClick={()=>setFilter(f)}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={sa.card}>
        {loading ? <div style={sa.empty}>Loading…</div> : records.length===0 ? <p style={sa.empty}>No records.</p> : (
          <div style={{overflowX:'auto'}}>
            <table style={sa.table}>
              <thead><tr>{['Moderator','Date','Clock In','Lunch Start','Lunch End','Clock Out','Duration','Status'].map(h=><th key={h} style={sa.th}>{h}</th>)}</tr></thead>
              <tbody>
                {records.map(r=>(
                  <tr key={r.id}>
                    <td style={sa.td}>{r.profiles?.name}</td>
                    <td style={sa.td}>{fmtDate(r.clock_in)}</td>
                    <td style={sa.td}>{fmtTime(r.clock_in)}</td>
                    <td style={sa.td}>{fmtTime(r.lunch_start)}</td>
                    <td style={sa.td}>{fmtTime(r.lunch_end)}</td>
                    <td style={sa.td}>{fmtTime(r.clock_out)}</td>
                    <td style={sa.td}>{duration(r.clock_in,r.clock_out)}</td>
                    <td style={sa.td}><span style={{...sa.pill, background:pillColor(r.status).bg, color:pillColor(r.status).col}}>{r.status||'done'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function PageShifts() {
  const [mods, setMods]       = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView]       = useState('schedule')
  const [editMod, setEditMod] = useState(null)

  const DAYS        = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  const SHIFTS      = ['Morning Shift','Afternoon Shift','Night Shift']
  const SHIFT_TIMES = { 'Morning Shift':'09:00–17:00','Afternoon Shift':'17:00–00:00','Night Shift':'00:00–09:00' }
  const SHIFT_COLOR = { 'Morning Shift':'#22c55e','Afternoon Shift':'#f59e0b','Night Shift':'#6366f1' }

  useEffect(() => { load() }, [])

async function load() {
  const [{ data }, { data:overridesData }] = await Promise.all([
    supabase.from('profiles').select('id,name,shift,status,days_off,mod_group,rotating_days_off,rotating_days_off_alt').eq('role','mod').order('name'),
    supabase.from('shift_overrides').select('*'),
  ])
  const overridesByMod = {}
  ;(overridesData||[]).forEach(o => {
    if (!overridesByMod[o.user_id]) overridesByMod[o.user_id] = []
    overridesByMod[o.user_id].push(o)
  })
  setMods((data||[]).map(m => ({...m, overrides: overridesByMod[m.id]||[]})))
  setLoading(false)
}
  async function saveEdit() {
  await supabase.from('profiles').update({ shift:editMod.shift, days_off:editMod.days_off, mod_group:editMod.mod_group }).eq('id', editMod.id)
  // Save overrides
  await supabase.from('shift_overrides').delete().eq('user_id', editMod.id)
  if (editMod.overrides && editMod.overrides.length > 0) {
    await supabase.from('shift_overrides').insert(editMod.overrides.map(o=>({...o, user_id:editMod.id})))
  }
  setEditMod(null); load()
}

  function toggleDayOff(day) {
    const current = editMod.days_off || []
    setEditMod(e => ({...e, days_off: current.includes(day) ? current.filter(d=>d!==day) : [...current, day]}))
  }

  function getCellContent(mod, day) {
    const isEvenMonth = (new Date().getMonth() + 1) % 2 === 0
    let daysOff = mod.days_off || []
    if (mod.rotating_days_off) {
      daysOff = isEvenMonth ? (mod.days_off || []) : (mod.rotating_days_off_alt || [])
    }
    if (daysOff.includes(day)) return { label:'OFF', color:'#f87171', bg:'#f8717118' }
    const color = SHIFT_COLOR[mod.shift] || '#94a3b8'
    return { label: mod.shift?.split(' ')[0] || '—', color, bg: color+'18' }
  }

  function ShiftTable({ title, rows, accent }) {
    return (
      <div style={{...sa.card, marginBottom:20}}>
        <div style={sa.cardHead}><span style={{...sa.cardTitle, color:accent||'#f1f5f9'}}>{title}</span></div>
        <div style={{overflowX:'auto'}}>
          <table style={{...sa.table, minWidth:700}}>
            <thead><tr>
              <th style={{...sa.th, width:130, paddingRight:16}}>Moderator</th>
              {DAYS.map(d=><th key={d} style={{...sa.th, textAlign:'center', minWidth:70}}>{d.slice(0,3).toUpperCase()}</th>)}
            </tr></thead>
            <tbody>
              {rows.map(mod=>(
                <tr key={mod.id}>
                  <td style={{...sa.td, fontWeight:500, paddingRight:16, whiteSpace:'nowrap'}}>{mod.name}</td>
                  {DAYS.map(day=>{
                    const cell = getCellContent(mod, day)
                    return (
                      <td key={day} style={{...sa.td, textAlign:'center', padding:'8px 4px'}}>
                        <div style={{background:cell.bg, color:cell.color, fontSize:'0.68rem', fontWeight:700, padding:'5px 4px', borderRadius:6, textTransform:'uppercase', letterSpacing:'0.03em'}}>
                          {cell.label}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (loading) return <div style={sa.content}><div style={sa.empty}>Loading…</div></div>

  const englishMods  = mods.filter(m => m.mod_group !== 'russian')
  const russianMods  = mods.filter(m => m.mod_group === 'russian')
  const nightEn      = englishMods.filter(m => m.shift === 'Night Shift')
  const morningEn    = englishMods.filter(m => m.shift === 'Morning Shift')
  const afternoonEn  = englishMods.filter(m => m.shift === 'Afternoon Shift')

  return (
    <div style={sa.content}>
      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Shift Schedule</h1>
        <div style={sa.filterRow}>
          <button style={{...sa.filterBtn,...(view==='schedule'?sa.filterActive:{})}} onClick={()=>setView('schedule')}>Weekly View</button>
          <button style={{...sa.filterBtn,...(view==='edit'?sa.filterActive:{})}} onClick={()=>setView('edit')}>Edit Shifts</button>
        </div>
      </div>
      {view==='schedule' && (
        <>
          <div style={{fontSize:'0.75rem', color:'#64748b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12}}>🇬🇧 English Moderators</div>
          {nightEn.length>0     && <ShiftTable title={`Night Shift · ${SHIFT_TIMES['Night Shift']} UTC+1`}     rows={nightEn}     accent='#06b6d4'/>}
          {morningEn.length>0   && <ShiftTable title={`Morning Shift · ${SHIFT_TIMES['Morning Shift']} UTC+1`}   rows={morningEn}   accent='#3b82f6'/>}
          {afternoonEn.length>0 && <ShiftTable title={`Afternoon Shift · ${SHIFT_TIMES['Afternoon Shift']} UTC+1`} rows={afternoonEn} accent='#8b5cf6'/>}
          {russianMods.length>0 && (
            <>
              <div style={{fontSize:'0.75rem', color:'#f59e0b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', margin:'24px 0 12px'}}>🇷🇺 Russian Moderators</div>
              <ShiftTable title='Schedule' rows={russianMods} accent='#f59e0b'/>
            </>
          )}
        </>
      )}
      {view==='edit' && (
        <div style={sa.card}>
          <div style={sa.cardHead}><span style={sa.cardTitle}>Edit Moderator Schedules</span></div>
          {mods.map(m=>(
            <div key={m.id} style={{...sa.dutyRow, flexWrap:'wrap', gap:12, padding:'14px 0'}}>
             <div style={{position:'relative', flexShrink:0}}>
  <div style={{width:34,height:34,borderRadius:'50%',overflow:'hidden'}}>
    {m.avatar_url
      ? <img src={m.avatar_url} alt={m.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
      : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',fontWeight:700,color:'#fff'}}>{(m.name||'?')[0].toUpperCase()}</div>
    }
  </div>
  <label style={{position:'absolute',bottom:-2,right:-2,width:14,height:14,borderRadius:'50%',background:'#3b82f6',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',border:'2px solid #141820'}}>
    <svg width="7" height="7" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
    <input type="file" accept="image/*" style={{display:'none'}} onChange={async e=>{
      const file = e.target.files[0]
      if (!file) return
      const ext = file.name.split('.').pop()
      const path = `${m.id}.${ext}`
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert:true })
      if (error) { alert(error.message); return }
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', m.id)
      load()
    }}/>
  </label>
</div>
              <div style={{flex:1, minWidth:100}}>
                <div style={{display:'flex', alignItems:'center', gap:6}}>
                  <span style={{fontSize:'0.87rem', fontWeight:500}}>{m.name}</span>
                  {m.mod_group==='russian' && <span style={{fontSize:'0.6rem', background:'#f59e0b22', color:'#f59e0b', padding:'1px 5px', borderRadius:3, fontWeight:700}}>RU</span>}
                </div>
                <div style={{fontSize:'0.72rem', color:'#64748b'}}>{m.shift||'No shift'} · Off: {(m.days_off||[]).join(', ')||'None'}</div>
              </div>
              {editMod?.id===m.id ? (
                <div style={{width:'100%', background:'#0f1117', borderRadius:8, padding:16, marginTop:8}}>
                  <div style={{marginBottom:12}}>
                    <label style={sa.label}>Shift</label>
                    <select style={{...sa.input, marginTop:4}} value={editMod.shift||''} onChange={e=>setEditMod(em=>({...em,shift:e.target.value}))}>
                      <option value="">No shift</option>
                      {SHIFTS.map(sh=><option key={sh} value={sh}>{sh}</option>)}
                    </select>
                  </div>
                  <div style={{marginBottom:12}}>
                    <label style={sa.label}>Days Off</label>
                    <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:6}}>
                      {DAYS.map(day=>{
                        const isOff=(editMod.days_off||[]).includes(day)
                        return <button key={day} onClick={()=>toggleDayOff(day)} style={{padding:'5px 10px', borderRadius:6, fontSize:'0.75rem', fontWeight:600, cursor:'pointer', border:'1px solid', background:isOff?'#f8717122':'#1e2433', color:isOff?'#f87171':'#94a3b8', borderColor:isOff?'#f8717144':'#2d3748'}}>{day.slice(0,3)}</button>
                      })}
                    </div>
                  </div>

                  <div style={{marginBottom:12}}>
  <label style={sa.label}>Day Overrides</label>
  <div style={{fontSize:'0.72rem', color:'#64748b', marginBottom:8}}>Define a different shift for specific days of the week.</div>
  {(editMod.overrides||[]).map((o,i)=>(
    <div key={i} style={{display:'flex', gap:8, marginBottom:8, alignItems:'center'}}>
      <select style={{...sa.input, flex:1}} value={o.day_of_week} onChange={e=>setEditMod(em=>({...em, overrides:em.overrides.map((x,j)=>j===i?{...x,day_of_week:e.target.value}:x)}))}>
        {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
      </select>
      <select style={{...sa.input, flex:1}} value={o.shift} onChange={e=>setEditMod(em=>({...em, overrides:em.overrides.map((x,j)=>j===i?{...x,shift:e.target.value}:x)}))}>
        {SHIFTS.map(sh=><option key={sh} value={sh}>{sh}</option>)}
      </select>
      <input style={{...sa.input, width:80}} value={o.start_time||''} onChange={e=>setEditMod(em=>({...em, overrides:em.overrides.map((x,j)=>j===i?{...x,start_time:e.target.value}:x)}))} placeholder="09:00"/>
      <input style={{...sa.input, width:80}} value={o.end_time||''} onChange={e=>setEditMod(em=>({...em, overrides:em.overrides.map((x,j)=>j===i?{...x,end_time:e.target.value}:x)}))} placeholder="17:00"/>
      <span style={{cursor:'pointer', color:'#f87171', flexShrink:0}} onClick={()=>setEditMod(em=>({...em, overrides:em.overrides.filter((_,j)=>j!==i)}))}>✕</span>
    </div>
  ))}
  <button style={sa.btnSmBlue} onClick={()=>setEditMod(em=>({...em, overrides:[...(em.overrides||[]), {day_of_week:'Sunday', shift:'Afternoon Shift', start_time:'', end_time:''}]}))}>+ Add Override</button>
</div>
                  <div style={{marginBottom:12}}>
                    <label style={sa.label}>Group</label>
                    <select style={{...sa.input, marginTop:4}} value={editMod.mod_group||'english'} onChange={e=>setEditMod(em=>({...em,mod_group:e.target.value}))}>
                      <option value="english">English</option>
                      <option value="russian">Russian</option>
                    </select>
                  </div>
                  <div style={{display:'flex', gap:8}}>
                    <button style={sa.btnSmGreen} onClick={saveEdit}>Save</button>
                    <button style={sa.btnSmRed} onClick={()=>setEditMod(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button style={sa.btnSmBlue} onClick={()=>setEditMod({...m})}>Edit</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PageReports() {
  const [vacStats, setVacStats] = useState([])
  const [attStats, setAttStats] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { monday } = getWeekRange()
    const [{ data:profs }, { data:att }] = await Promise.all([
      supabase.from('profiles').select('id,name,vacation_used,vacation_pending,vacation_allowance').eq('role','mod'),
      supabase.from('attendance').select('user_id,clock_in,clock_out').gte('clock_in',monday.toISOString()).not('clock_out','is',null),
    ])
    setVacStats((profs||[]).map(p=>({ name:p.name, allowance:p.vacation_allowance||15, used:p.vacation_used||0, pending:p.vacation_pending||0, remaining:(p.vacation_allowance||15)-(p.vacation_used||0)-(p.vacation_pending||0) })))
    const profMap={}; (profs||[]).forEach(p=>{ profMap[p.id]=p.name })
    const map={}
    ;(att||[]).forEach(r=>{
      const name=profMap[r.user_id]||r.user_id
      const mins=Math.round((new Date(r.clock_out)-new Date(r.clock_in))/60000)
      if(!map[name]) map[name]={name,minutes:0,sessions:0}
      map[name].minutes+=mins; map[name].sessions++
    })
    setAttStats(Object.values(map).sort((a,b)=>b.minutes-a.minutes))
    setLoading(false)
  }

  if (loading) return <div style={sa.content}><div style={sa.empty}>Loading…</div></div>

  return (
    <div style={sa.content}>
      <h1 style={sa.pageTitle}>Reports</h1>
      <div style={sa.card}>
        <div style={sa.cardHead}><span style={sa.cardTitle}>Vacation Report</span></div>
        <div style={{overflowX:'auto'}}>
          <table style={sa.table}>
            <thead><tr>{['Moderator','Allowance','Used','Pending','Remaining'].map(h=><th key={h} style={sa.th}>{h}</th>)}</tr></thead>
            <tbody>
              {vacStats.map(r=>(
                <tr key={r.name}>
                  <td style={sa.td}>{r.name}</td>
                  <td style={sa.td}>{r.allowance}</td>
                  <td style={{...sa.td,color:'#f87171'}}>{r.used}</td>
                  <td style={{...sa.td,color:'#f59e0b'}}>{r.pending}</td>
                  <td style={{...sa.td,color:'#34d399',fontWeight:600}}>{r.remaining}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={sa.card}>
        <div style={sa.cardHead}><span style={sa.cardTitle}>Weekly Hours Report</span></div>
        {attStats.length===0 ? <p style={sa.empty}>No attendance this week.</p> : (
          <div style={{overflowX:'auto'}}>
            <table style={sa.table}>
              <thead><tr>{['Moderator','Sessions','Total Hours','vs Target'].map(h=><th key={h} style={sa.th}>{h}</th>)}</tr></thead>
              <tbody>
                {attStats.map(r=>{
                  const diff=r.minutes-(35*60)
                  return (
                    <tr key={r.name}>
                      <td style={sa.td}>{r.name}</td>
                      <td style={sa.td}>{r.sessions}</td>
                      <td style={sa.td}>{formatHours(r.minutes)}</td>
                      <td style={{...sa.td,color:diff>=0?'#34d399':'#f87171'}}>{diff>=0?'+':''}{formatHours(Math.abs(diff))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function PageDailyReports() {
  const [reports, setReports]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('today')
  const [modFilter, setModFilter] = useState('')
  const [mods, setMods]           = useState({})
  const [modsList, setModsList]   = useState([])
  const [selected, setSelected]   = useState(null)
  const [search, setSearch]       = useState('')

  useEffect(() => { load() }, [filter, modFilter])

  async function load() {
    setLoading(true)
    const now = new Date(); let q
    if (filter==='all') {
      q = supabase.from('daily_reports').select('*').order('created_at',{ascending:false})
    } else {
      let from
      if (filter==='today') { from=new Date(now); from.setHours(0,0,0,0) }
      else if (filter==='week') { from=new Date(now); from.setDate(now.getDate()-7) }
      else { from=new Date(now.getFullYear(),now.getMonth(),1) }
      q = supabase.from('daily_reports').select('*').gte('report_date', from.toISOString().split('T')[0]).order('created_at',{ascending:false})
    }
    const [{ data:r },{ data:p }] = await Promise.all([
      q,
      supabase.from('profiles').select('id,name,avatar_url').eq('role','mod'),
    ])
    const map={}; (p||[]).forEach(x=>map[x.id]={name:x.name,avatar_url:x.avatar_url})
    setMods(map); setModsList(p||[])
    setReports(modFilter?(r||[]).filter(x=>x.user_id===modFilter):(r||[]))
    setLoading(false)
  }

  const filtered = search.trim()
    ? reports.filter(r => {
        const q = search.toLowerCase()
        try { const p=JSON.parse(r.pending_links||'[]'); if(p.some(t=>t.description?.toLowerCase().includes(q)||t.link?.toLowerCase().includes(q))) return true } catch(e){}
        try { const i=JSON.parse(r.important_links||'[]'); if(i.some(t=>t.description?.toLowerCase().includes(q)||t.link?.toLowerCase().includes(q))) return true } catch(e){}
        return [r.locked_blacktide_rl,r.locked_blacktide_hunt,r.skin_manipulation,r.free_coin_abuser,r.phone_abuser,r.referral_abuser,r.notes,mods[r.user_id]?.name]
          .some(f=>f&&f.toLowerCase().includes(q))
      })
    : reports

  return (
    <div style={sa.content}>
      {selected && <AdminReportModal report={selected} modName={mods[selected.user_id]?.name} onClose={()=>setSelected(null)} hideDevInfo/>}
      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Daily Reports</h1>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
          <select style={{...sa.input,padding:'6px 10px',fontSize:'0.78rem',minWidth:140}} value={modFilter} onChange={e=>setModFilter(e.target.value)}>
            <option value="">All Moderators</option>
            {modsList.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <div style={sa.filterRow}>
            {['today','week','month','all'].map(f=>(
              <button key={f} style={{...sa.filterBtn,...(filter===f?sa.filterActive:{})}} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
            ))}
          </div>
        </div>
      </div>
      <input style={{...sa.input, width:'100%', marginBottom:16}} placeholder="Search by mod name, UID, notes…" value={search} onChange={e=>setSearch(e.target.value)}/>
      {loading?<div style={sa.empty}>Loading…</div>:filtered.length===0?(
        <div style={sa.card}><p style={sa.empty}>No reports yet.</p></div>
      ):(
        <div style={sa.card}>
          {filtered.map(r=>(
            <AdminReportCard key={r.id} report={r} modName={mods[r.user_id]?.name} avatarUrl={mods[r.user_id]?.avatar_url} hideDevInfo onClick={()=>setSelected(r)}/>
          ))}
        </div>
      )}
    </div>
  )
}

function AdminDevNotes({ reportId, initialNotes }) {
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

function AdminPageDevReports() {
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('open')
  const [mods, setMods]         = useState({})
  const [selected, setSelected] = useState(null)

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    const [{ data:r },{ data:p }] = await Promise.all([
      supabase.from('daily_reports').select('*').or('has_bug.eq.true,has_exploit.eq.true').order('created_at',{ascending:false}),
      supabase.from('profiles').select('id,name,avatar_url').eq('role','mod'),
    ])
    const map={}; (p||[]).forEach(x=>map[x.id]={name:x.name,avatar_url:x.avatar_url})
    setMods(map)
    const filtered = filter==='open'?(r||[]).filter(x=>!x.dev_resolved):filter==='resolved'?(r||[]).filter(x=>x.dev_resolved):(r||[])
    setReports(filtered)
    setLoading(false)
  }

  async function resolve(id) {
    await supabase.from('daily_reports').update({ dev_resolved:true }).eq('id',id)
    setSelected(null); load()
  }

  return (
    <div style={sa.content}>
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>{setSelected(null);load()}}>
          <div style={{background:'#141820',border:'1px solid #1e2433',borderRadius:16,width:'100%',maxWidth:560,display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'18px 24px',borderBottom:'1px solid #1e2433',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:'0.95rem',fontWeight:700,color:'#f1f5f9'}}>{mods[selected.user_id]?.name} — {fmtDate(selected.report_date)}</div>
                <div style={{display:'flex',gap:8,marginTop:4}}>
                  {selected.has_bug&&<span style={{fontSize:'0.68rem',fontWeight:700,padding:'2px 8px',borderRadius:20,background:'#f8717122',color:'#f87171'}}>🐛 Bug</span>}
                  {selected.has_exploit&&<span style={{fontSize:'0.68rem',fontWeight:700,padding:'2px 8px',borderRadius:20,background:'#f59e0b22',color:'#f59e0b'}}>⚠️ Exploit</span>}
                  {selected.dev_resolved&&<span style={{fontSize:'0.68rem',fontWeight:700,padding:'2px 8px',borderRadius:20,background:'#34d39922',color:'#34d399'}}>✓ Resolved</span>}
                </div>
              </div>
              <span style={{color:'#4a5568',cursor:'pointer',fontSize:'1.2rem'}} onClick={()=>{setSelected(null);load()}}>✕</span>
            </div>
            <div style={{padding:'20px 24px'}}>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:6}}>Mod Description</div>
                <div style={{background:'#0f1117',borderRadius:8,padding:'10px 14px',fontSize:'0.85rem',color:'#94a3b8',lineHeight:1.6,minHeight:60}}>
                  {selected.dev_notes||<span style={{color:'#4a5568'}}>No description provided.</span>}
                </div>
              </div>
              <AdminDevNotes reportId={selected.id} initialNotes={selected.admin_dev_notes}/>
              {!selected.dev_resolved && (
                <button style={{...sa.btnApprove, width:'100%', marginTop:12, display:'flex', justifyContent:'center'}} onClick={()=>resolve(selected.id)}>
                  ✓ Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Dev Reports</h1>
        <div style={sa.filterRow}>
          {['open','resolved','all'].map(f=>(
            <button key={f} style={{...sa.filterBtn,...(filter===f?sa.filterActive:{})}} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
          ))}
        </div>
      </div>
      {loading?<div style={sa.empty}>Loading…</div>:reports.length===0?(
        <div style={sa.card}><p style={sa.empty}>No dev reports yet.</p></div>
      ):(
        <div style={sa.card}>
          {reports.map(r=>(
            <div key={r.id} onClick={()=>setSelected(r)} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:10,background:'#0f1117',border:'1px solid #1e2433',cursor:'pointer',marginBottom:8}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#334155'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#1e2433'}>
              {mods[r.user_id]?.avatar_url
                ? <img src={mods[r.user_id].avatar_url} alt="" style={{width:32,height:32,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>
                : <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',fontWeight:700,color:'#fff',flexShrink:0}}>{(mods[r.user_id]?.name||'?')[0].toUpperCase()}</div>
              }
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                  <span style={{fontSize:'0.85rem',fontWeight:600,color:'#f1f5f9'}}>{mods[r.user_id]?.name||'Unknown'}</span>
                  <span style={{fontSize:'0.72rem',color:'#64748b'}}>{fmtDate(r.report_date)} · {r.shift}</span>
                  {r.has_bug&&<span style={{fontSize:'0.63rem',fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#f8717122',color:'#f87171'}}>🐛 Bug</span>}
                  {r.has_exploit&&<span style={{fontSize:'0.63rem',fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#f59e0b22',color:'#f59e0b'}}>⚠️ Exploit</span>}
                  {r.dev_resolved&&<span style={{fontSize:'0.63rem',fontWeight:700,padding:'1px 6px',borderRadius:10,background:'#34d39922',color:'#34d399'}}>✓ Resolved</span>}
                </div>
                {r.dev_notes&&<div style={{fontSize:'0.73rem',color:'#64748b',marginTop:2}}>{r.dev_notes.slice(0,80)}{r.dev_notes.length>80?'…':''}</div>}
              </div>
              <svg width="14" height="14" fill="none" stroke="#4a5568" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AdminPageCalendar() {
  const [mods, setMods]           = useState([])
  const [vacations, setVacations] = useState([])
  const [swaps, setSwaps]         = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading]     = useState(true)
  const [birthdays, setBirthdays] = useState([])
  const [overrides, setOverrides] = useState([])

  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const isEvenMonth = (month + 1) % 2 === 0

  const DAYS_OF_WEEK = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const MONTH_NAMES  = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const SHIFT_COLOR  = { 'Morning Shift':'#22c55e','Afternoon Shift':'#f59e0b','Night Shift':'#6366f1' }

  useEffect(() => { load() }, [month, year])

  async function load() {
  setLoading(true)
  const firstDay = new Date(year, month, 1).toISOString().split('T')[0]
  const lastDay  = new Date(year, month + 1, 0).toISOString().split('T')[0]
  const [{ data:m },{ data:v },{ data:sw },{ data:bd },{ data:ov }] = await Promise.all([
    supabase.from('profiles').select('id,name,shift,days_off,rotating_days_off,rotating_days_off_alt,mod_group,birthday').eq('role','mod').neq('status','left').order('name'),
    supabase.from('vacation_requests').select('id,user_id,start_date,end_date').eq('status','approved').lte('start_date',lastDay).gte('end_date',firstDay),
    supabase.from('shift_swaps').select('id,requester_id,target_id,swap_date').eq('status','approved').gte('swap_date',firstDay).lte('swap_date',lastDay),
    supabase.from('profiles').select('id,birthday').eq('role','mod').not('birthday','is',null),
    supabase.from('shift_overrides').select('*'),
  ])
  setMods(m||[]); setVacations(v||[]); setSwaps(sw||[])
  setBirthdays(bd||[])
  setOverrides(ov||[])
  setLoading(false)
}

  function getDays() {
    const days = []
    const last = new Date(year, month + 1, 0)
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d))
    return days
  }

  function isOff(mod, date) {
    const dayName = date.toLocaleDateString('en-GB',{weekday:'long'})
    let daysOff = mod.days_off || []
    if (mod.rotating_days_off) {
      daysOff = isEvenMonth ? (mod.days_off||[]) : (mod.rotating_days_off_alt||[])
    }
    return daysOff.includes(dayName)
  }

  function isOnVacation(modId, date) {
    const d = date.toISOString().split('T')[0]
    return vacations.some(v => v.user_id===modId && d>=v.start_date && d<=v.end_date)
  }

  function hasSwap(modId, date) {
    const d = date.toISOString().split('T')[0]
    return swaps.some(sw => sw.swap_date===d && (sw.requester_id===modId||sw.target_id===modId))
  }

  function getCell(mod, date) {
    const isBirthday = birthdays.some(b => {
      if (!b.birthday || b.id !== mod.id) return false
      const bd = new Date(b.birthday)
      return bd.getMonth()===date.getMonth() && bd.getDate()===date.getDate()
    })
    if (isBirthday)                  return { label:'🎂', color:'#f59e0b', bg:'#f59e0b18' }
    if (isOnVacation(mod.id, date))  return { label:'VAC', color:'#34d399', bg:'#34d39918' }
    if (hasSwap(mod.id, date))       return { label:'SWAP', color:'#f59e0b', bg:'#f59e0b18' }
    if (isOff(mod, date))            return { label:'OFF', color:'#f87171', bg:'#f8717118' }
    const dayName = date.toLocaleDateString('en-GB',{weekday:'long'})
    const override = overrides.find(o => o.user_id===mod.id && o.day_of_week===dayName)
    if (override) {
      const color = SHIFT_COLOR[override.shift] || '#94a3b8'
      const label = override.start_time && override.end_time
        ? `${override.start_time}-${override.end_time}`
        : override.shift?.split(' ')[0]||'—'
      return { label, color, bg: color+'15' }
    }
    const color = SHIFT_COLOR[mod.shift] || '#94a3b8'
    return { label: mod.shift?.split(' ')[0]||'—', color, bg: color+'15' }
  }

  const days  = getDays()
  const today = new Date()

  const englishMods   = mods.filter(m => m.mod_group !== 'russian')
  const russianMods   = mods.filter(m => m.mod_group === 'russian')
  const nightMods     = englishMods.filter(m => m.shift === 'Night Shift')
  const morningMods   = englishMods.filter(m => m.shift === 'Morning Shift')
  const afternoonMods = englishMods.filter(m => m.shift === 'Afternoon Shift')

  function ShiftCalendar({ title, accent, rows }) {
    if (rows.length === 0) return null
    return (
      <div style={{marginBottom:40}}>
        <div style={{fontSize:'0.78rem', fontWeight:700, color:accent, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14, display:'flex', alignItems:'center', gap:10}}>
          <div style={{height:1, width:20, background:accent+'66'}}/>
          {title}
          <div style={{flex:1, height:1, background:accent+'22'}}/>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{...sa.table, minWidth:900}}>
            <thead>
              <tr>
                <th style={{...sa.th, width:120, paddingRight:16, position:'sticky', left:0, background:'#0f1117', zIndex:1}}>Mod</th>
                {days.map((d,i) => (
                  <th key={i} style={{...sa.th, textAlign:'center', minWidth:38, padding:'0 2px 12px', color:d.toDateString()===today.toDateString()?'#60a5fa':'#4a5568', fontWeight:d.toDateString()===today.toDateString()?700:400}}>
                    <div style={{fontSize:'0.57rem', marginBottom:2}}>{DAYS_OF_WEEK[(d.getDay()+6)%7]}</div>
                    <div style={{fontSize:'0.75rem', background:d.toDateString()===today.toDateString()?'#3b82f6':'transparent', color:d.toDateString()===today.toDateString()?'#fff':'inherit', borderRadius:'50%', width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto'}}>{d.getDate()}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((mod,mi) => (
                <tr key={mod.id} style={{background: mi%2===0?'transparent':'#0a0d1422'}}>
                  <td style={{...sa.td, fontWeight:500, fontSize:'0.82rem', paddingRight:16, whiteSpace:'nowrap', position:'sticky', left:0, background: mi%2===0?'#141820':'#111520', zIndex:1}}>
                    {mod.name}{mod.rotating_days_off&&<span style={{fontSize:'0.6rem',color:'#4a5568',marginLeft:4}}>↻</span>}
                  </td>
                  {days.map((d,i) => {
                    const cell = getCell(mod, d)
                    const isToday = d.toDateString()===today.toDateString()
                    const isWeekend = d.getDay()===0||d.getDay()===6
                    const isWorking = cell.label!=='OFF'&&cell.label!=='VAC'&&cell.label!=='SWAP'&&cell.label!=='🎂'&&!cell.label?.includes('-')
                    return (
                      <td key={i} style={{padding:'6px 2px', textAlign:'center', borderBottom:'1px solid #0f1117', background:isToday?'#1e2433':isWeekend?'#0d1018':'transparent'}}>
                        {isWorking
                          ? <div style={{width:8, height:8, borderRadius:'50%', background:cell.color, margin:'0 auto', opacity:0.75}}/>
                          : <div style={{fontSize:'0.58rem', fontWeight:700, color:cell.color, background:cell.color+'18', padding:'3px 3px', borderRadius:5, textTransform:'uppercase', border:`1px solid ${cell.color}33`}}>{cell.label}</div>
                        }
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (loading) return <div style={sa.content}><div style={sa.empty}>Loading…</div></div>

  return (
    <div style={{padding:'32px 24px', width:'100%', boxSizing:'border-box'}}>
      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Team Calendar</h1>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <button style={sa.filterBtn} onClick={()=>setCurrentDate(new Date(year,month-1,1))}>← Prev</button>
          <span style={{fontSize:'0.95rem', fontWeight:600, color:'#f1f5f9', minWidth:160, textAlign:'center'}}>{MONTH_NAMES[month]} {year}</span>
          <button style={sa.filterBtn} onClick={()=>setCurrentDate(new Date(year,month+1,1))}>Next →</button>
        </div>
      </div>
      <div style={{display:'flex', gap:16, flexWrap:'wrap', marginBottom:24}}>
        {Object.entries(SHIFT_COLOR).map(([shift,color])=>(
          <div key={shift} style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:10,height:10,borderRadius:2,background:color}}/>
            <span style={{fontSize:'0.72rem',color:'#94a3b8'}}>{shift}</span>
          </div>
        ))}
        <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:10,height:10,borderRadius:2,background:'#f87171'}}/><span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Day Off</span></div>
        <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:10,height:10,borderRadius:2,background:'#34d399'}}/><span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Vacation</span></div>
        <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:10,height:10,borderRadius:2,background:'#f59e0b'}}/><span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Swap</span></div>
        <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:'0.72rem'}}>🎂</span><span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Birthday</span></div>
        <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:'0.72rem',color:'#64748b'}}>↻ Rotating</span></div>
      </div>
      <div style={{fontSize:'0.75rem', color:'#64748b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16}}>🇬🇧 English Tickets</div>
      <ShiftCalendar title="Night Shift · 00:00–09:00 UTC+1"     accent='#06b6d4' rows={nightMods}/>
      <ShiftCalendar title="Morning Shift · 09:00–17:00 UTC+1"   accent='#3b82f6' rows={morningMods}/>
      <ShiftCalendar title="Afternoon Shift · 17:00–00:00 UTC+1" accent='#8b5cf6' rows={afternoonMods}/>
      {russianMods.length > 0 && (
        <>
          <div style={{fontSize:'0.75rem', color:'#f59e0b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', margin:'24px 0 16px'}}>🇷🇺 Russian Tickets</div>
          <ShiftCalendar title="Schedule" accent='#f59e0b' rows={russianMods}/>
        </>
      )}
    </div>
  )
}

function PageHours() {
  const [mods, setMods]         = useState([])
  const [selected, setSelected] = useState('')
  const [month, setMonth]       = useState(new Date().getMonth())
  const [year, setYear]         = useState(new Date().getFullYear())
  const [records, setRecords]   = useState([])
  const [loading, setLoading]   = useState(false)
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

  useEffect(() => { supabase.from('profiles').select('id,name').eq('role','mod').order('name').then(({data})=>setMods(data||[])) }, [])
  useEffect(() => { if(selected) load() }, [selected, month, year])

  async function load() {
    setLoading(true)
    const from = new Date(year, month, 1).toISOString()
    const to   = new Date(year, month+1, 0, 23, 59, 59).toISOString()
    const { data } = await supabase.from('attendance').select('*').eq('user_id', selected).gte('clock_in', from).lte('clock_in', to).order('clock_in')
    setRecords(data||[]); setLoading(false)
  }

  const totalMins = records.filter(r=>r.clock_out).reduce((acc,r)=>acc+Math.round((new Date(r.clock_out)-new Date(r.clock_in))/60000),0)
  const diff = totalMins - 35*60
  const byDay = {}
  records.forEach(r => {
    const day = new Date(r.clock_in).toLocaleDateString('en-GB',{day:'2-digit',month:'short'})
    if (!byDay[day]) byDay[day] = 0
    if (r.clock_out) byDay[day] += Math.round((new Date(r.clock_out)-new Date(r.clock_in))/60000)
  })

  return (
    <div style={sa.content}>
      <h1 style={sa.pageTitle}>Hours & Attendance</h1>
      <div style={{display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center'}}>
        <select style={{...sa.input, minWidth:160}} value={selected} onChange={e=>setSelected(e.target.value)}>
          <option value="">Select moderator…</option>
          {mods.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select style={{...sa.input, minWidth:130}} value={month} onChange={e=>setMonth(+e.target.value)}>
          {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
        </select>
        <select style={{...sa.input, minWidth:90}} value={year} onChange={e=>setYear(+e.target.value)}>
          {[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {!selected && <div style={sa.card}><p style={sa.empty}>Select a moderator to view their hours.</p></div>}
      {selected && !loading && <>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20}}>
          {[
            { label:'Total Hours', val:formatHours(totalMins), col:'#60a5fa' },
            { label:'Target', val:'35h', col:'#94a3b8' },
            { label:'vs Target', val:(diff>=0?'+':'')+formatHours(Math.abs(diff)), col:diff>=0?'#34d399':'#f87171' },
            { label:'Days Worked', val:Object.keys(byDay).length, col:'#8b5cf6' },
          ].map(item=>(
            <div key={item.label} style={sa.statCard}>
              <span style={{...sa.statNum, color:item.col, fontSize:'1.5rem'}}>{item.val}</span>
              <span style={sa.statLabel}>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={sa.card}>
          <div style={sa.cardHead}><span style={sa.cardTitle}>Daily Breakdown — {MONTHS[month]} {year}</span></div>
          {Object.keys(byDay).length === 0 ? <p style={sa.empty}>No records.</p> : (
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              {Object.entries(byDay).map(([day, mins]) => {
                const pct = Math.min(100, Math.round((mins/480)*100))
                return (
                  <div key={day} style={{display:'grid', gridTemplateColumns:'80px 1fr 60px', gap:12, alignItems:'center'}}>
                    <span style={{fontSize:'0.78rem', color:'#94a3b8'}}>{day}</span>
                    <div style={sa.barTrack}><div style={{...sa.barFill, width:`${pct}%`, background:'linear-gradient(90deg,#3b82f6,#60a5fa)'}}/></div>
                    <span style={{fontSize:'0.72rem', color:'#64748b', textAlign:'right'}}>{formatHours(mins)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div style={sa.card}>
          <div style={sa.cardHead}><span style={sa.cardTitle}>Session Log</span></div>
          <div style={{overflowX:'auto'}}>
            <table style={sa.table}>
              <thead><tr>{['Date','Clock In','Lunch','Clock Out','Duration'].map(h=><th key={h} style={sa.th}>{h}</th>)}</tr></thead>
              <tbody>
                {records.map(r => {
                  const mins = r.clock_out ? Math.round((new Date(r.clock_out)-new Date(r.clock_in))/60000) : null
                  const lunchMins = r.lunch_start && r.lunch_end ? Math.round((new Date(r.lunch_end)-new Date(r.lunch_start))/60000) : null
                  return (
                    <tr key={r.id}>
                      <td style={sa.td}>{fmtDate(r.clock_in)}</td>
                      <td style={sa.td}>{fmtTime(r.clock_in)}</td>
                      <td style={sa.td}>{lunchMins ? <span style={{color:lunchMins>30?'#f87171':'#94a3b8'}}>{lunchMins}m</span> : '—'}</td>
                      <td style={sa.td}>{fmtTime(r.clock_out)}</td>
                      <td style={sa.td}>{mins ? formatHours(mins) : <span style={{color:'#34d399'}}>Active</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </>}
    </div>
  )
}

function PageAnnouncements({ adminId }) {
  const [announcements, setAnnouncements] = useState([])
  const [form, setForm]   = useState({ title:'', body:'', type:'info', expires_at:'' })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)

  useEffect(() => { load() }, [])
  async function load() {
    const { data } = await supabase.from('announcements').select('*').order('created_at',{ascending:false})
    setAnnouncements(data||[])
  }
  async function create() {
    if (!form.title||!form.body) return
    setSaving(true)
    await supabase.from('announcements').insert({...form, created_by:adminId, expires_at:form.expires_at||null})
    setForm({title:'',body:'',type:'info',expires_at:''}); setShowForm(false); setSaving(false); load()
  }
  async function toggle(id, active) { await supabase.from('announcements').update({active}).eq('id',id); load() }
  async function remove(id) { await supabase.from('announcements').delete().eq('id',id); load() }

  const typeColor = { info:'#3b82f6', warning:'#f59e0b', success:'#34d399', danger:'#f87171' }

  return (
    <div style={sa.content}>
      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Announcements</h1>
        <button style={sa.btnPrimary} onClick={()=>setShowForm(f=>!f)}>{showForm?'Cancel':'+ New'}</button>
      </div>
      {showForm && (
        <div style={sa.card}>
          <div style={sa.formGrid}>
            <div style={{...sa.formGroup, gridColumn:'span 2'}}><label style={sa.label}>Title</label><input style={sa.input} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Title…"/></div>
            <div style={{...sa.formGroup, gridColumn:'span 2'}}><label style={sa.label}>Body</label><textarea style={{...sa.input, minHeight:80, resize:'vertical'}} value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} placeholder="Content…"/></div>
            <div style={sa.formGroup}><label style={sa.label}>Type</label>
              <select style={sa.input} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                {['info','warning','success','danger'].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div style={sa.formGroup}><label style={sa.label}>Expires at (optional)</label><input style={sa.input} type="datetime-local" value={form.expires_at} onChange={e=>setForm(f=>({...f,expires_at:e.target.value}))}/></div>
          </div>
          <button style={{...sa.btnPrimary, marginTop:16}} disabled={saving} onClick={create}>{saving?'Publishing…':'Publish'}</button>
        </div>
      )}
      {announcements.length===0?<div style={sa.card}><p style={sa.empty}>No announcements yet.</p></div>:announcements.map(a=>{
        const color=typeColor[a.type]||'#3b82f6'
        return (
          <div key={a.id} style={{...sa.card, border:`1px solid ${color}33`, opacity:a.active?1:0.5}}>
            <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12}}>
              <div style={{flex:1}}>
                <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                  <span style={{fontSize:'0.68rem', fontWeight:700, padding:'2px 8px', borderRadius:20, background:color+'22', color}}>{a.type.toUpperCase()}</span>
                  {!a.active&&<span style={{fontSize:'0.68rem', color:'#4a5568'}}>Inactive</span>}
                </div>
                <div style={{fontSize:'0.9rem', fontWeight:600, color:'#f1f5f9', marginBottom:4}}>{a.title}</div>
                <div style={{fontSize:'0.82rem', color:'#94a3b8'}}>{a.body}</div>
                <div style={{fontSize:'0.7rem', color:'#4a5568', marginTop:8}}>{fmtDate(a.created_at)}</div>
              </div>
              <div style={{display:'flex', gap:6}}>
                <button style={a.active?sa.btnSmRed:sa.btnSmGreen} onClick={()=>toggle(a.id,!a.active)}>{a.active?'Deactivate':'Activate'}</button>
                <button style={sa.btnSmRed} onClick={()=>remove(a.id)}>Delete</button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PageSwapManager({ adminId }) {
  const [swaps, setSwaps]   = useState([])
  const [debts, setDebts]   = useState([])
  const [mods, setMods]     = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    const [{ data:sw },{ data:db },{ data:p }] = await Promise.all([
      supabase.from('shift_swaps').select('*').order('created_at',{ascending:false}),
      supabase.from('swap_debts').select('*').order('created_at',{ascending:false}),
      supabase.from('profiles').select('id,name'),
    ])
    const map={}; (p||[]).forEach(x=>map[x.id]=x.name)
    setMods(map); setDebts(db||[])
    setSwaps(filter==='all'?sw||[]:(sw||[]).filter(s=>sa.status===filter))
    setLoading(false)
  }

  async function settle(id) {
    await supabase.from('swap_debts').update({ settled:true, settled_at:new Date().toISOString() }).eq('id', id)
    load()
  }

  const statusColor = { pending:'#f59e0b', pending_admin:'#60a5fa', approved:'#34d399', declined:'#f87171' }
  const openDebts = debts.filter(d=>!d.settled)

  return (
    <div style={sa.content}>
      <h1 style={sa.pageTitle}>Swap Manager</h1>
      {openDebts.length>0&&(
        <div style={{...sa.card, border:'1px solid #f59e0b44', background:'#f59e0b06'}}>
          <div style={sa.cardHead}><span style={sa.cardTitle}>⚖️ Open Swap Debts</span><span style={sa.badge}>{openDebts.length}</span></div>
          {openDebts.map(d=>(
            <div key={d.id} style={{display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid #1e2433'}}>
              <div style={{flex:1}}>
                <div style={{fontSize:'0.85rem', fontWeight:500}}><strong style={{color:'#f87171'}}>{mods[d.debtor_id]}</strong> owes <strong style={{color:'#34d399'}}>{mods[d.creditor_id]}</strong> a day off</div>
                <div style={{fontSize:'0.72rem', color:'#64748b', marginTop:2}}>{fmtDate(d.swap_date)}</div>
              </div>
              <button style={sa.btnSmGreen} onClick={()=>settle(d.id)}>Settle</button>
            </div>
          ))}
        </div>
      )}
      <div style={sa.card}>
        <div style={sa.cardHead}>
          <span style={sa.cardTitle}>All Swap Requests</span>
          <div style={sa.filterRow}>
            {['all','pending','pending_admin','approved','declined'].map(f=>(
              <button key={f} style={{...sa.filterBtn,...(filter===f?sa.filterActive:{})}} onClick={()=>setFilter(f)}>
                {f==='pending_admin'?'Awaiting Admin':f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {loading?<div style={sa.empty}>Loading…</div>:swaps.length===0?<p style={sa.empty}>No swaps.</p>:swaps.map(r=>(
          <div key={r.id} style={{padding:'12px 0', borderBottom:'1px solid #1e2433', display:'flex', alignItems:'center', gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontSize:'0.85rem', fontWeight:500}}>{mods[r.requester_id]} ↔ {mods[r.target_id]}</div>
              <div style={{fontSize:'0.72rem', color:'#64748b', marginTop:2}}>{fmtDate(r.swap_date)} ↔ {fmtDate(r.target_date)}</div>
            </div>
            <span style={{...sa.pill, background:(statusColor[r.status]||'#94a3b8')+'22', color:statusColor[r.status]||'#94a3b8'}}>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PageVacationCalendar() {
  const [vacations, setVacations] = useState([])
  const [mods, setMods]           = useState({})
  const [month, setMonth]         = useState(new Date().getMonth())
  const [year, setYear]           = useState(new Date().getFullYear())
  const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December']

  useEffect(()=>{load()},[month,year])

  async function load() {
    const from=new Date(year,month,1).toISOString().split('T')[0], to=new Date(year,month+1,0).toISOString().split('T')[0]
    const [{data:v},{data:p}]=await Promise.all([
      supabase.from('vacation_requests').select('*').eq('status','approved').lte('start_date',to).gte('end_date',from).order('start_date'),
      supabase.from('profiles').select('id,name,avatar_url').eq('role','mod'),
    ])
    const map={}; (p||[]).forEach(x=>map[x.id]=x)
    setMods(map); setVacations(v||[])
  }

  const daysInMonth=new Date(year,month+1,0).getDate()
  const days=Array.from({length:daysInMonth},(_,i)=>i+1)
  function isOnVac(vac,day) { const d=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`; return d>=vac.start_date&&d<=vac.end_date }

  return (
    <div style={sa.content}>
      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Vacation Calendar</h1>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <button style={sa.filterBtn} onClick={()=>{const d=new Date(year,month-1,1);setMonth(d.getMonth());setYear(d.getFullYear())}}>← Prev</button>
          <span style={{fontSize:'0.9rem', fontWeight:600, color:'#f1f5f9', minWidth:140, textAlign:'center'}}>{MONTHS[month]} {year}</span>
          <button style={sa.filterBtn} onClick={()=>{const d=new Date(year,month+1,1);setMonth(d.getMonth());setYear(d.getFullYear())}}>Next →</button>
        </div>
      </div>
      {vacations.length===0?<div style={sa.card}><p style={sa.empty}>No approved vacations this month.</p></div>:(
        <div style={sa.card}>
          <div style={{overflowX:'auto'}}>
            <table style={{...sa.table, minWidth:800}}>
              <thead><tr>
                <th style={{...sa.th, width:130}}>Moderator</th>
                {days.map(d=>{
                  const date=new Date(year,month,d), isToday=new Date().toDateString()===date.toDateString(), isWeekend=date.getDay()===0||date.getDay()===6
                  return <th key={d} style={{...sa.th, textAlign:'center', minWidth:28, padding:'0 1px 10px', color:isToday?'#60a5fa':isWeekend?'#4a5568':'#64748b', fontSize:'0.65rem'}}>{d}</th>
                })}
              </tr></thead>
              <tbody>
                {vacations.map(vac=>{
                  const mod=mods[vac.user_id]
                  return (
                    <tr key={vac.id}>
                      <td style={{...sa.td, fontWeight:500, fontSize:'0.82rem', whiteSpace:'nowrap'}}>
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          {mod?.avatar_url?<img src={mod.avatar_url} alt="" style={{width:22,height:22,borderRadius:'50%',objectFit:'cover'}}/>:<div style={{width:22,height:22,borderRadius:'50%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.65rem',fontWeight:700,color:'#fff'}}>{(mod?.name||'?')[0].toUpperCase()}</div>}
                          {mod?.name||'Unknown'}
                        </div>
                      </td>
                      {days.map(d=>(
                        <td key={d} style={{padding:'4px 1px', textAlign:'center', borderBottom:'1px solid #0f1117'}}>
                          {isOnVac(vac,d)&&<div style={{width:'100%', height:8, background:'#34d39966', borderRadius:2}}/>}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminPageApplications({ adminId }) {
  const [apps, setApps]       = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('pending')
  const [selected, setSelected] = useState(null)
  const [adminNote, setAdminNote] = useState('')
  const [mods, setMods]       = useState({})

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    const [{ data:a }, { data:p }] = await Promise.all([
      supabase.from('applications').select('*').order('created_at', {ascending:false}),
      supabase.from('profiles').select('id,name').eq('role','mod'),
    ])
    const map={}; (p||[]).forEach(x=>map[x.id]=x.name)
    setMods(map)
    const filtered = filter==='all' ? a : (a||[]).filter(x=>x.status===filter)
    setApps(filtered||[])
    setLoading(false)
  }

  async function decide(id, status) {
    await supabase.from('applications').update({
      status, admin_notes: adminNote, reviewed_at: new Date().toISOString(), reviewed_by: adminId
    }).eq('id', id)
    await logAction(adminId, `${status}_application`, id, selected?.applicant_name, null)
    setSelected(null); setAdminNote(''); load()
  }

  const typeColor = { staff:'#3b82f6', dev:'#8b5cf6' }
  const statusColor = { pending:'#f59e0b', accepted:'#34d399', declined:'#f87171' }

  return (
    <div style={sa.content}>
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setSelected(null)}>
          <div style={{background:'#141820',border:'1px solid #1e2433',borderRadius:16,width:'100%',maxWidth:560,maxHeight:'88vh',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'18px 24px',borderBottom:'1px solid #1e2433',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:'0.95rem',fontWeight:700,color:'#f1f5f9'}}>{selected.applicant_name}</div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4}}>
                  <span style={{fontSize:'0.68rem',fontWeight:700,padding:'2px 8px',borderRadius:20,background:(typeColor[selected.type]||'#94a3b8')+'22',color:typeColor[selected.type]||'#94a3b8'}}>{selected.type.toUpperCase()}</span>
                  <span style={{fontSize:'0.68rem',fontWeight:700,padding:'2px 8px',borderRadius:20,background:(statusColor[selected.status]||'#94a3b8')+'22',color:statusColor[selected.status]||'#94a3b8'}}>{selected.status}</span>
                </div>
              </div>
              <span style={{color:'#4a5568',cursor:'pointer',fontSize:'1.2rem'}} onClick={()=>setSelected(null)}>✕</span>
            </div>
            <div style={{padding:'20px 24px',overflowY:'auto',flex:1}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                {selected.applicant_discord&&<div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}><div style={{fontSize:'0.68rem',color:'#4a5568',marginBottom:4}}>Discord</div><div style={{fontSize:'0.85rem',color:'#f1f5f9'}}>{selected.applicant_discord}</div></div>}
                {selected.applicant_telegram&&<div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px'}}><div style={{fontSize:'0.68rem',color:'#4a5568',marginBottom:4}}>Telegram</div><div style={{fontSize:'0.85rem',color:'#f1f5f9'}}>{selected.applicant_telegram}</div></div>}
              </div>
              {selected.message&&<div style={{background:'#0f1117',borderRadius:8,padding:'12px 14px',marginBottom:16}}>
                <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:6}}>Message</div>
                <div style={{fontSize:'0.85rem',color:'#e2e8f0',lineHeight:1.6}}>{selected.message}</div>
              </div>}
              <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:16}}>Submitted by <strong style={{color:'#94a3b8'}}>{mods[selected.submitted_by]||'Unknown'}</strong> · {fmtDate(selected.created_at)}</div>
              {selected.admin_notes&&<div style={{background:'#0f1117',borderRadius:8,padding:'10px 12px',marginBottom:16}}>
                <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:4}}>Admin Notes</div>
                <div style={{fontSize:'0.83rem',color:'#94a3b8'}}>{selected.admin_notes}</div>
              </div>}
              {selected.status==='pending' && (
                <div>
                  <label style={sa.label}>Admin Notes (optional)</label>
                  <textarea style={{...sa.input, width:'100%', minHeight:70, resize:'vertical', marginTop:6, marginBottom:12}} value={adminNote} onChange={e=>setAdminNote(e.target.value)} placeholder="Add notes…"/>
                  <div style={{display:'flex', gap:8}}>
                    <button style={{...sa.btnApprove, flex:1}} onClick={()=>decide(selected.id,'accepted')}>✓ Accept</button>
                    <button style={{...sa.btnReject, flex:1}} onClick={()=>decide(selected.id,'declined')}>✕ Decline</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Applications</h1>
        <div style={sa.filterRow}>
          {['pending','accepted','declined','all'].map(f=>(
            <button key={f} style={{...sa.filterBtn,...(filter===f?sa.filterActive:{})}} onClick={()=>setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading?<div style={sa.empty}>Loading…</div>:apps.length===0?(
        <div style={sa.card}><p style={sa.empty}>No applications.</p></div>
      ):apps.map(a=>(
        <div key={a.id} onClick={()=>{setSelected(a);setAdminNote(a.admin_notes||'')}} style={{...sa.card, cursor:'pointer', padding:'14px 18px'}}
          onMouseEnter={e=>e.currentTarget.style.borderColor='#334155'}
          onMouseLeave={e=>e.currentTarget.style.borderColor='#1e2433'}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{flex:1}}>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                <span style={{fontSize:'0.87rem', fontWeight:600, color:'#f1f5f9'}}>{a.applicant_name}</span>
                <span style={{fontSize:'0.68rem', fontWeight:700, padding:'2px 8px', borderRadius:20, background:(typeColor[a.type]||'#94a3b8')+'22', color:typeColor[a.type]||'#94a3b8'}}>{a.type.toUpperCase()}</span>
                <span style={{fontSize:'0.68rem', fontWeight:700, padding:'2px 8px', borderRadius:20, background:(statusColor[a.status]||'#94a3b8')+'22', color:statusColor[a.status]||'#94a3b8'}}>{a.status}</span>
              </div>
              <div style={{fontSize:'0.75rem', color:'#64748b'}}>
                {a.applicant_discord&&<span style={{marginRight:12}}>💬 {a.applicant_discord}</span>}
                Submitted by {mods[a.submitted_by]||'Unknown'} · {fmtDate(a.created_at)}
              </div>
            </div>
            <svg width="14" height="14" fill="none" stroke="#4a5568" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      ))}
    </div>
  )
}

function PageAttendanceReport() {
  const [data, setData]     = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth]   = useState(new Date().getMonth())
  const [year, setYear]     = useState(new Date().getFullYear())
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

  useEffect(() => { load() }, [month, year])

  async function load() {
    setLoading(true)
    const from = new Date(year, month, 1)
    const to   = new Date(year, month+1, 0)
    const workingDays = Array.from({length:to.getDate()},(_,i)=>new Date(year,month,i+1)).filter(d=>d.getDay()!==0&&d.getDay()!==6).length

    const [{ data:mods },{ data:att }] = await Promise.all([
      supabase.from('profiles').select('id,name,shift,days_off').eq('role','mod').eq('status','active'),
      supabase.from('attendance').select('user_id,clock_in,clock_out,lunch_start,lunch_end').gte('clock_in', from.toISOString()).lte('clock_in', to.toISOString()),
    ])

    const result = (mods||[]).map(mod => {
      const sessions = (att||[]).filter(a=>a.user_id===mod.id)
      const daysWorked = new Set(sessions.map(a=>new Date(a.clock_in).toDateString())).size
      const totalMins = sessions.filter(a=>a.clock_out).reduce((acc,a)=>acc+Math.round((new Date(a.clock_out)-new Date(a.clock_in))/60000),0)
      const lateSessions = sessions.filter(a=>{
        const hour = new Date(a.clock_in).getHours()
        const shiftStart = mod.shift==='Morning Shift'?9:mod.shift==='Afternoon Shift'?17:0
        return Math.abs(hour-shiftStart) > 0
      }).length
      const lunchOver = sessions.filter(a=>{
        if (!a.lunch_start||!a.lunch_end) return false
        return Math.round((new Date(a.lunch_end)-new Date(a.lunch_start))/60000) > 30
      }).length
      const daysOff = (mod.days_off||[]).length
      const expectedDays = workingDays - Math.round(workingDays/7*daysOff)
      const missingDays = Math.max(0, expectedDays - daysWorked)

      return { ...mod, daysWorked, totalMins, lateSessions, lunchOver, missingDays, expectedDays }
    })

    setData(result); setLoading(false)
  }

  return (
    <div style={sa.content}>
      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Attendance Report</h1>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <select style={{...sa.input, minWidth:130}} value={month} onChange={e=>setMonth(+e.target.value)}>
            {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
          </select>
          <select style={{...sa.input, minWidth:90}} value={year} onChange={e=>setYear(+e.target.value)}>
            {[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div style={sa.card}>
        {loading?<div style={sa.empty}>Loading…</div>:(
          <div style={{overflowX:'auto'}}>
            <table style={sa.table}>
              <thead>
                <tr>
                  {['Moderator','Shift','Days Worked','Expected','Missing','Total Hours','Late Clock-ins','Lunch Over 30m'].map(h=>(
                    <th key={h} style={sa.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map(m=>(
                  <tr key={m.id}>
                    <td style={sa.td}>{m.name}</td>
                    <td style={sa.td}><span style={{fontSize:'0.75rem', color:'#64748b'}}>{m.shift?.replace(' Shift','')}</span></td>
                    <td style={sa.td}><span style={{fontWeight:600, color:'#f1f5f9'}}>{m.daysWorked}</span></td>
                    <td style={sa.td}>{m.expectedDays}</td>
                    <td style={sa.td}>
                      <span style={{fontWeight:600, color:m.missingDays>0?'#f87171':'#34d399'}}>
                        {m.missingDays>0?`-${m.missingDays}`:'✓'}
                      </span>
                    </td>
                    <td style={sa.td}>{formatHours(m.totalMins)}</td>
                    <td style={sa.td}>
                      <span style={{color:m.lateSessions>0?'#f59e0b':'#64748b'}}>{m.lateSessions}</span>
                    </td>
                    <td style={sa.td}>
                      <span style={{color:m.lunchOver>0?'#f87171':'#64748b'}}>{m.lunchOver}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function AdminPageMeetingAgenda({ adminId }) {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [mods, setMods]       = useState({})
  const [selected, setSelected] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [{ data:a },{ data:p }] = await Promise.all([
      supabase.from('meeting_agenda').select('*').order('created_at',{ascending:true}),
      supabase.from('profiles').select('id,name,avatar_url').eq('role','mod'),
    ])
    const map={}; (p||[]).forEach(x=>map[x.id]={name:x.name,avatar_url:x.avatar_url})
    setMods(map); setItems(a||[])
    setLoading(false)
  }

  async function markDone(id) {
    await supabase.from('meeting_agenda').update({ status:'discussed' }).eq('id', id)
    await load()
  }

  async function clearAll() {
    if (!confirm('Mark all pending topics as discussed?')) return
    await supabase.from('meeting_agenda').update({ status:'discussed' }).eq('status','pending')
    await load()
  }

  async function deleteItem(id) {
    await supabase.from('meeting_agenda').delete().eq('id', id)
    await load()
  }

  const pending   = items.filter(i=>i.status==='pending')
  const discussed = items.filter(i=>i.status==='discussed')

  return (
    <div style={sa.content}>
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setSelected(null)}>
          <div style={{background:'#141820',border:'1px solid #1e2433',borderRadius:16,width:'100%',maxWidth:560,maxHeight:'88vh',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'18px 24px',borderBottom:'1px solid #1e2433',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{flex:1}}>
                <div style={{fontSize:'0.95rem',fontWeight:700,color:'#f1f5f9'}}>{selected.topic}</div>
                <div style={{fontSize:'0.72rem',color:'#64748b',marginTop:4}}>
                  by {mods[selected.submitted_by]?.name||'Unknown'} · {new Date(selected.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})} at {new Date(selected.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
                </div>
              </div>
              <span style={{color:'#4a5568',cursor:'pointer',fontSize:'1.2rem',padding:4}} onClick={()=>setSelected(null)}>✕</span>
            </div>
            <div style={{padding:'20px 24px',overflowY:'auto',flex:1}}>
              {selected.description && (
                <div style={{background:'#0f1117',borderRadius:8,padding:'12px 14px',marginBottom:16,fontSize:'0.85rem',color:'#94a3b8',lineHeight:1.6}}>
                  {selected.description}
                </div>
              )}
              {selected.image_url && (
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:8}}>Screenshot</div>
                  <a href={selected.image_url} target="_blank" rel="noreferrer">
                    <img src={selected.image_url} alt="screenshot" style={{width:'100%',borderRadius:8,border:'1px solid #2d3748',cursor:'pointer'}}/>
                  </a>
                  <div style={{fontSize:'0.68rem',color:'#4a5568',marginTop:6}}>Click to open full size</div>
                </div>
              )}
              {!selected.description && !selected.image_url && <p style={sa.empty}>No additional details.</p>}
            </div>
            <div style={{padding:'16px 24px',borderTop:'1px solid #1e2433',display:'flex',gap:8}}>
              {selected.status==='pending' && <button style={{...sa.btnApprove,flex:1}} onClick={()=>{markDone(selected.id);setSelected(null)}}>✓ Mark as Discussed</button>}
              <button style={{...sa.btnReject,flex:1}} onClick={()=>{deleteItem(selected.id);setSelected(null)}}>✕ Delete</button>
            </div>
          </div>
        </div>
      )}

      <div style={sa.pageHead}>
        <h1 style={sa.pageTitle}>Meeting Agenda</h1>
        <div style={{display:'flex',gap:8}}>
          <span style={sa.badge}>{pending.length} pending</span>
          {pending.length>0 && <button style={sa.btnSmGreen} onClick={clearAll}>✓ Mark all discussed</button>}
        </div>
      </div>

      {loading ? <div style={sa.empty}>Loading…</div> : pending.length===0 ? (
        <div style={sa.card}><p style={sa.empty}>No pending topics.</p></div>
      ) : (
        <div style={sa.card}>
          {pending.map((item,i) => (
            <div key={item.id} onClick={()=>setSelected(item)} style={{display:'flex',gap:12,alignItems:'flex-start',padding:'14px 0',borderBottom:'1px solid #1e2433',cursor:'pointer'}}
              onMouseEnter={e=>e.currentTarget.style.opacity='0.8'}
              onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              <div style={{width:24,height:24,borderRadius:'50%',background:'#1e2433',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.72rem',fontWeight:700,color:'#64748b',flexShrink:0,marginTop:2}}>{i+1}</div>
              <div style={{width:32,height:32,borderRadius:'50%',flexShrink:0,overflow:'hidden'}}>
                {mods[item.submitted_by]?.avatar_url
                  ? <img src={mods[item.submitted_by].avatar_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.78rem',fontWeight:700,color:'#fff'}}>{(mods[item.submitted_by]?.name||'?')[0].toUpperCase()}</div>
                }
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'0.87rem',fontWeight:600,color:'#f1f5f9',marginBottom:2}}>{item.topic}</div>
                {item.description && <div style={{fontSize:'0.78rem',color:'#64748b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:4}}>{item.description}</div>}
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:'0.7rem',color:'#4a5568'}}>by {mods[item.submitted_by]?.name||'Unknown'} · {new Date(item.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})} {new Date(item.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</span>
                  {item.image_url && <span style={{fontSize:'0.68rem',color:'#3b82f6',background:'#3b82f618',padding:'1px 6px',borderRadius:4}}>📎 screenshot</span>}
                </div>
              </div>
              <svg width="14" height="14" fill="none" stroke="#4a5568" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          ))}
        </div>
      )}

      {discussed.length>0 && (
        <>
          <div style={{display:'flex',alignItems:'center',gap:12,margin:'24px 0 16px'}}>
            <div style={{flex:1,height:1,background:'#1e2433'}}/>
            <span style={{fontSize:'0.72rem',color:'#4a5568',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.1em'}}>Discussed</span>
            <div style={{flex:1,height:1,background:'#1e2433'}}/>
          </div>
          <div style={{...sa.card,background:'#0f1117',border:'1px solid #1a2030'}}>
            {discussed.map(item=>(
              <div key={item.id} style={{padding:'10px 0',borderBottom:'1px solid #1e2433',display:'flex',gap:12,alignItems:'center',opacity:0.6}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.83rem',color:'#64748b',textDecoration:'line-through'}}>{item.topic}</div>
                  <div style={{fontSize:'0.7rem',color:'#4a5568'}}>by {mods[item.submitted_by]?.name||'Unknown'}</div>
                </div>
                <span style={{fontSize:'0.63rem',fontWeight:700,padding:'2px 8px',borderRadius:20,background:'#34d39922',color:'#34d399'}}>✓ Discussed</span>
                <span style={{cursor:'pointer',color:'#f87171',fontSize:'0.8rem',padding:4}} onClick={()=>deleteItem(item.id)}>✕</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}


// ==================== PERMISSIONS MANAGEMENT (super-admin only) ====================

function PermissionsList({ role, sections, allowSuperToggle }) {
  const [people, setPeople]   = useState([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft]     = useState({})
  const [savingId, setSavingId] = useState(null)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { load() }, [role])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('id,name,email,permissions,is_super_admin').eq('role',role).order('name')
    setPeople(data || [])
    const d = {}
    ;(data || []).forEach(p => { d[p.id] = { permissions: Array.isArray(p.permissions) ? p.permissions : [], is_super_admin: !!p.is_super_admin } })
    setDraft(d)
    setLoading(false)
  }

  function toggleSection(personId, sectionId) {
    setDraft(d => {
      const cur = d[personId]?.permissions || []
      const next = cur.includes(sectionId) ? cur.filter(x => x !== sectionId) : [...cur, sectionId]
      return { ...d, [personId]: { ...d[personId], permissions: next } }
    })
  }

  function toggleSuper(personId) {
    setDraft(d => ({ ...d, [personId]: { ...d[personId], is_super_admin: !d[personId]?.is_super_admin } }))
  }

  async function save(personId) {
    setSavingId(personId)
    const { permissions, is_super_admin } = draft[personId]
    const update = allowSuperToggle ? { permissions, is_super_admin } : { permissions }
    await supabase.from('profiles').update(update).eq('id', personId)
    await load()
    setSavingId(null)
  }

  const groups = [...new Set(sections.map(s2 => s2.group))]

  if (loading) return <div style={sa.empty}>Loading…</div>
  if (people.length === 0) return <div style={sa.empty}>No {role === 'admin' ? 'admins' : 'moderators'} found.</div>

  return (
    <>
      {people.map(person => {
        const d = draft[person.id] || { permissions: [], is_super_admin: false }
        const isOpen = expanded === person.id
        const bypassesGating = allowSuperToggle && d.is_super_admin
        return (
          <div key={person.id} style={sa.card}>
            <div style={{...sa.cardHead, cursor:'pointer'}} onClick={() => setExpanded(isOpen ? null : person.id)}>
              <div>
                <div style={sa.cardTitle}>{person.name}</div>
                <div style={{fontSize:'0.75rem', color:'#64748b', marginTop:2}}>{person.email || '—'}</div>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:12}}>
                {allowSuperToggle && (
                  <label style={{display:'flex', alignItems:'center', gap:6, fontSize:'0.78rem', color:'#94a3b8', cursor:'pointer'}}>
                    <input type="checkbox" checked={!!d.is_super_admin} onChange={() => toggleSuper(person.id)} />
                    Super-admin (sees everything)
                  </label>
                )}
                <button style={sa.filterBtn} onClick={() => setExpanded(isOpen ? null : person.id)}>{isOpen ? 'Close' : 'Edit sections'}</button>
              </div>
            </div>
            {isOpen && !bypassesGating && (
              <div style={{marginTop:16, borderTop:'1px solid #1e2433', paddingTop:16}}>
                {groups.map(g => (
                  <div key={g} style={{marginBottom:14}}>
                    <div style={{fontSize:'0.68rem', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8}}>{g}</div>
                    <div style={{display:'flex', flexWrap:'wrap', gap:10}}>
                      {sections.filter(s2 => s2.group === g).map(s2 => (
                        <label key={s2.id} style={{display:'flex', alignItems:'center', gap:6, fontSize:'0.8rem', color:'#e2e8f0', background:'#0f1117', border:'1px solid #2d3748', borderRadius:8, padding:'6px 10px', cursor:'pointer'}}>
                          <input type="checkbox" checked={d.permissions.includes(s2.id)} onChange={() => toggleSection(person.id, s2.id)} />
                          {s2.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {isOpen && bypassesGating && (
              <div style={{marginTop:16, borderTop:'1px solid #1e2433', paddingTop:16, fontSize:'0.8rem', color:'#64748b'}}>
                Super-admins automatically have access to every section.
              </div>
            )}
            {isOpen && (
              <div style={{marginTop:16, display:'flex', justifyContent:'flex-end'}}>
                <button style={sa.btnPrimary} disabled={savingId===person.id} onClick={() => save(person.id)}>
                  {savingId===person.id ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

function PagePermissions() {
  const [tab, setTab] = useState('admin')

  return (
    <div style={sa.content}>
      <div style={sa.pageHead}><h1 style={sa.pageTitle}>Permissions</h1></div>
      <div style={{...sa.filterRow, marginBottom:20}}>
        <button style={{...sa.filterBtn, ...(tab==='admin'?sa.filterActive:{})}} onClick={()=>setTab('admin')}>Admins</button>
        <button style={{...sa.filterBtn, ...(tab==='mod'?sa.filterActive:{})}} onClick={()=>setTab('mod')}>Moderators</button>
      </div>
      {tab==='admin'
        ? <PermissionsList role="admin" sections={ADMIN_SECTIONS} allowSuperToggle={true}/>
        : <PermissionsList role="mod" sections={MOD_SECTIONS} allowSuperToggle={false}/>}
    </div>
  )
}


// ==================== SHARED LAYOUT ====================

function Layout({ profile, page, setPage, onLogout, children }) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showInbox, setShowInbox]       = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread]               = useState(0)
  const [settings, setSettings]           = useState({
    theme:'dark', fontSize:'medium', language:'english',
    notifSwaps:true, notifVacations:true, notifBirthdays:true, notifSound:false,
    showDirectory:true, showBirthdays:true, timeFormat:'24h',
    showDiscord:true, showTelegram:true, showBirthday:true,
  })
  const [userStatus, setUserStatus]       = useState(profile?.user_status || 'online')
  const [savingSettings, setSavingSettings] = useState(false)

  const isAdmin = profile?.role === 'admin'

  const [showMoreNav, setShowMoreNav] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('modcontrol_admin_nav_expanded') === 'true'
  })

  function toggleMoreNav() {
    setShowMoreNav(v => {
      const next = !v
      if (typeof window !== 'undefined') localStorage.setItem('modcontrol_admin_nav_expanded', String(next))
      return next
    })
  }

  const CORE_ADMIN_GROUPS = ['Overview', 'Management']

  const adminNavFiltered = filterAdminNav(profile).map(g => ({ ...g, items: g.items.map(i => ({ ...i, icon: Icon[i.icon] })) }))
  const adminCoreGroups = adminNavFiltered.filter(g => CORE_ADMIN_GROUPS.includes(g.label))
  const adminMoreGroups = adminNavFiltered.filter(g => !CORE_ADMIN_GROUPS.includes(g.label))
  const adminExtraGroups = profile?.is_super_admin ? [{ label:'Admin', items:[{ id:'permissions', label:'Permissions', icon:Icon.user }] }] : []

  const NAV_GROUPS = isAdmin
    ? [...adminCoreGroups, ...(showMoreNav ? adminMoreGroups : []), ...adminExtraGroups]
    : filterModNav(profile).map(g => ({ ...g, items: g.items.map(i => ({ ...i, icon: Icon[i.icon] })) }))

  const hasAnyNav = isAdmin
    ? (adminCoreGroups.length + adminMoreGroups.length + adminExtraGroups.length) > 0
    : NAV_GROUPS.length > 0

  const THEMES = [
    { id:'dark',     label:'Dark',     bg:'#0f1117', accent:'#3b82f6' },
    { id:'midnight', label:'Midnight', bg:'#0a0a1a', accent:'#8b5cf6' },
    { id:'forest',   label:'Forest',   bg:'#0a1a0f', accent:'#34d399' },
    { id:'ocean',    label:'Ocean',    bg:'#0a1520', accent:'#06b6d4' },
  ]

  useEffect(() => {
    if (!profile?.id) return
    loadSettings()
    if (!isAdmin) loadNotifications()
  }, [profile?.id])

  async function loadSettings() {
    const { data } = await supabase.from('profiles').select('settings').eq('id', profile.id).single()
    if (data?.settings && Object.keys(data.settings).length > 0) {
      setSettings(s => ({...s, ...data.settings}))
    }
  }

  async function loadNotifications() {
  const readIds = JSON.parse(localStorage.getItem('readNotifIds') || '[]')

  const [{ data:swaps }, { data:vacs }, { data:bdays }, { data:modAlerts }] = await Promise.all([
  supabase.from('shift_swaps').select('id,requester_id,swap_date,requester:profiles!requester_id(name)').eq('target_id', profile.id).eq('status','pending'),
  supabase.from('vacation_requests').select('id,start_date,end_date,status,reviewed_at').eq('user_id', profile.id).in('status',['approved','declined']).gte('reviewed_at', new Date(Date.now()-7*86400000).toISOString()),
  supabase.from('profiles').select('id,name,birthday').eq('role','mod').not('birthday','is',null),
  supabase.from('mod_alerts').select('*').eq('user_id', profile.id).eq('read', false),
])
  const notifs = []
  ;(swaps||[]).forEach(sw => {
    notifs.push({ id:`swap-${sw.id}`, type:'swap', icon:'🔄', title:`${sw.requester?.name} wants to swap`, body:`Swap date: ${fmtDate(sw.swap_date)}`, color:'#60a5fa', action:()=>{ setPage('swaps'); setShowInbox(false) } })
  })
  ;(vacs||[]).forEach(v => {
    const isApproved = v.status==='approved'
    notifs.push({ id:`vac-${v.id}`, type:'vacation', icon:isApproved?'✅':'❌', title:`Vacation ${v.status}`, body:`${fmtDate(v.start_date)} → ${fmtDate(v.end_date)}`, color:isApproved?'#34d399':'#f87171', action:()=>{ setPage('vacation'); setShowInbox(false) } })
  })
  const today = new Date(); today.setHours(0,0,0,0)
  ;(bdays||[]).filter(p=>p.id!==profile.id).forEach(p => {
    const bday = new Date(p.birthday)
    const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
    if (next < today) next.setFullYear(today.getFullYear()+1)
    const days = Math.ceil((next-today)/86400000)
    if (days <= 1) notifs.push({ id:`bday-${p.id}`, type:'birthday', icon:'🎂', title:days===0?`🎉 ${p.name}'s birthday today!`:`${p.name}'s birthday tomorrow!`, body:days===0?'Wish them a happy birthday!':'Don\'t forget!', color:'#f59e0b', action:()=>setShowInbox(false) })
  })
;(modAlerts||[]).forEach(a => {
  notifs.push({ id:`alert-${a.id}`, type:'alert', icon:'🔔', title:a.title, body:a.body||'', color:'#f87171', action: async ()=>{ await supabase.from('mod_alerts').update({read:true}).eq('id',a.id); setShowInbox(false) } })
})
  setNotifications(notifs)
  setUnread(notifs.filter(n => !readIds.includes(n.id)).length)
}

  async function saveSettings(newSettings) {
    setSavingSettings(true)
    await supabase.from('profiles').update({ settings: newSettings }).eq('id', profile.id)
    setSavingSettings(false)
  }

  function updateSetting(key, val) {
    const newSettings = {...settings, [key]: val}
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  return (
    <div style={s.root}>
      <aside style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div>
              <span style={{fontSize:'1.1rem', fontWeight:800, color:'#f8fafc', letterSpacing:'-0.02em', cursor:'pointer'}} onClick={()=>setPage(isAdmin?'dashboard':'home')}>ROLLTWO</span>
              <div style={{fontSize:'0.68rem', color:'#4a5568', marginTop:1, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:600}}>{isAdmin ? 'Admin Panel' : 'Mod Control'}</div>
            </div>
            {!isAdmin && (
            <div style={{position:'relative', cursor:'pointer', padding:6, borderRadius:8}}
              onClick={()=>{ setShowInbox(i=>!i); setShowSettings(false); setShowUserMenu(false) }}
              onMouseEnter={e=>e.currentTarget.style.background='#1a1f2e'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <svg width="16" height="16" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {unread > 0 && <span style={{position:'absolute', top:2, right:2, width:14, height:14, borderRadius:'50%', background:'#f87171', fontSize:'0.55rem', fontWeight:700, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'}}>{unread}</span>}
            </div>
            )}
          </div>
        </div>

        <nav style={s.nav}>
          {isAdmin ? (
            <>
              {adminCoreGroups.map(group => (
                <div key={group.label} style={{marginBottom:8}}>
                  <div style={{fontSize:'0.62rem', fontWeight:700, color:'#2d3748', textTransform:'uppercase', letterSpacing:'0.1em', padding:'8px 12px 4px'}}>
                    {group.label}
                  </div>
                  {group.items.map(item => (
                    <div key={item.id} style={{...s.navItem,...(page===item.id?s.navActive:{})}} onClick={() => setPage(item.id)}>
                      {item.icon}{item.label}
                    </div>
                  ))}
                </div>
              ))}
              {adminMoreGroups.length > 0 && (
                <div style={{...s.navItem, color:'#64748b', fontWeight:600, justifyContent:'center', gap:6}} onClick={toggleMoreNav}>
                  {showMoreNav ? Icon.up : Icon.down}
                  {showMoreNav ? 'Less' : 'More'}
                </div>
              )}
              {showMoreNav && adminMoreGroups.map(group => (
                <div key={group.label} style={{marginBottom:8, marginTop:8}}>
                  <div style={{fontSize:'0.62rem', fontWeight:700, color:'#2d3748', textTransform:'uppercase', letterSpacing:'0.1em', padding:'8px 12px 4px'}}>
                    {group.label}
                  </div>
                  {group.items.map(item => (
                    <div key={item.id} style={{...s.navItem,...(page===item.id?s.navActive:{})}} onClick={() => setPage(item.id)}>
                      {item.icon}{item.label}
                    </div>
                  ))}
                </div>
              ))}
              {adminExtraGroups.map(group => (
                <div key={group.label} style={{marginBottom:8, marginTop:8}}>
                  <div style={{fontSize:'0.62rem', fontWeight:700, color:'#2d3748', textTransform:'uppercase', letterSpacing:'0.1em', padding:'8px 12px 4px'}}>
                    {group.label}
                  </div>
                  {group.items.map(item => (
                    <div key={item.id} style={{...s.navItem,...(page===item.id?s.navActive:{})}} onClick={() => setPage(item.id)}>
                      {item.icon}{item.label}
                    </div>
                  ))}
                </div>
              ))}
            </>
          ) : (
            NAV_GROUPS.map(group => (
              <div key={group.label} style={{marginBottom:8}}>
                <div style={{fontSize:'0.62rem', fontWeight:700, color:'#2d3748', textTransform:'uppercase', letterSpacing:'0.1em', padding:'8px 12px 4px'}}>
                  {group.label}
                </div>
                {group.items.map(item => (
                  <div key={item.id} style={{...s.navItem,...(page===item.id?s.navActive:{})}} onClick={() => setPage(item.id)}>
                    {item.icon}{item.label}
                  </div>
                ))}
              </div>
            ))
          )}
          {!hasAnyNav && (
            <div style={{padding:'12px', fontSize:'0.78rem', color:'#4a5568'}}>No sections assigned yet. Ask a super-admin to grant you access.</div>
          )}
        </nav>

        <div style={{padding:'8px', borderTop:'1px solid #1e2433', position:'relative'}}>
          {showUserMenu && (
            <div style={{position:'absolute', bottom:'100%', left:8, right:8, background:'#1a1f2e', border:'1px solid #2d3748', borderRadius:10, padding:6, marginBottom:4, zIndex:100}}>
              <div style={{padding:'6px 10px 8px', borderBottom:'1px solid #1e2433', marginBottom:4}}>
                <div style={{fontSize:'0.82rem', fontWeight:600, color:'#f1f5f9'}}>{profile?.name}</div>
                <div style={{fontSize:'0.7rem', color:'#4a5568', marginTop:1}}>{isAdmin ? 'Administrator' : (profile?.shift||'—')}</div>
              </div>
              {[
                { label:'My Profile', icon:'👤', action:()=>{ setPage(isAdmin?'adminprofile':'profile'); setShowUserMenu(false) } },
                ...(!isAdmin ? [{ label:'Settings',   icon:'⚙️', action:()=>{ setShowSettings(true); setShowUserMenu(false) } }] : []),
                { label:'Help', icon:'❓', action:()=>{ window.open('https://t.me/matos_w', '_blank'); setShowUserMenu(false) } },
                { label:'Sign Out', icon:'🚪', action:onLogout, danger:true },
              ].map(item => (
                <div key={item.label} onClick={item.action}
                  style={{display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:6, cursor:'pointer', fontSize:'0.82rem', color:item.danger?'#f87171':'#94a3b8'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#0f1117'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <span>{item.icon}</span>{item.label}
                </div>
              ))}
            </div>
          )}
          <div style={{display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, cursor:'pointer', background:showUserMenu?'#1e2433':'transparent'}}
            onClick={()=>{ setShowUserMenu(m=>!m); setShowInbox(false); setShowSettings(false) }}
            onMouseEnter={e=>{ if(!showUserMenu) e.currentTarget.style.background='#1a1f2e' }}
            onMouseLeave={e=>{ if(!showUserMenu) e.currentTarget.style.background='transparent' }}>
            <div style={{position:'relative', flexShrink:0}}>
  {profile?.avatar_url ? (
    <img src={profile.avatar_url} alt="avatar" style={{width:30, height:30, borderRadius:'50%', objectFit:'cover'}}/>
  ) : (
    <div style={{width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:700, color:'#fff'}}>
      {(profile?.name||'?')[0].toUpperCase()}
    </div>
  )}
  <div style={{position:'absolute', bottom:0, right:0, width:9, height:9, borderRadius:'50%', background: userStatus==='online'?'#34d399':userStatus==='busy'?'#f59e0b':userStatus==='dnd'?'#f87171':'#64748b', border:'2px solid #0a0d14'}}/>
</div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:'0.8rem', fontWeight:600, color:'#f1f5f9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{profile?.name}</div>
              <div style={{fontSize:'0.68rem', color:'#4a5568'}}>{isAdmin ? 'Administrator' : 'Moderator'}</div>
            </div>
            <span style={{fontSize:'0.6rem', color:'#4a5568'}}>{showUserMenu?'▲':'▼'}</span>
          </div>
        </div>
      </aside>

      <main style={s.main}>
        {children}
      </main>

      {/* Inbox Panel */}
      {showInbox && (
        <div style={{position:'fixed', right:0, top:0, width:320, height:'100vh', background:'#0f1117', borderLeft:'1px solid #1e2433', zIndex:50, display:'flex', flexDirection:'column'}}>
          <div style={{padding:'16px 20px', borderBottom:'1px solid #1e2433', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:'0.9rem', fontWeight:700, color:'#f1f5f9'}}>🔔 Notifications</div>
              <div style={{fontSize:'0.7rem', color:'#4a5568', marginTop:2}}>{unread} unread</div>
            </div>
            <span style={{color:'#4a5568', cursor:'pointer', fontSize:'1rem', padding:4}} onClick={()=>setShowInbox(false)}>✕</span>
          </div>
          <div style={{flex:1, overflowY:'auto'}}>
            {notifications.length === 0 ? (
              <div style={{padding:24, textAlign:'center'}}>
                <div style={{fontSize:'1.5rem', marginBottom:8}}>🔕</div>
                <div style={{color:'#4a5568', fontSize:'0.85rem'}}>All caught up!</div>
              </div>
            ) : notifications.map(n => (
              <div key={n.id} onClick={n.action} style={{padding:'14px 20px', borderBottom:'1px solid #1e2433', cursor:'pointer', display:'flex', gap:12, alignItems:'flex-start'}}
                onMouseEnter={e=>e.currentTarget.style.background='#141820'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{width:36, height:36, borderRadius:10, background:n.color+'18', border:`1px solid ${n.color}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0}}>
                  {n.icon}
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:'0.82rem', fontWeight:600, color:'#f1f5f9', marginBottom:3}}>{n.title}</div>
                  <div style={{fontSize:'0.75rem', color:'#64748b', lineHeight:1.4}}>{n.body}</div>
                </div>
                <div style={{width:6, height:6, borderRadius:'50%', background:n.color, flexShrink:0, marginTop:6}}/>
              </div>
            ))}
          </div>
          {notifications.length > 0 && (
            <div style={{padding:'12px 20px', borderTop:'1px solid #1e2433'}}>
             <button style={{width:'100%', background:'transparent', border:'1px solid #2d3748', color:'#64748b', padding:'8px', borderRadius:8, cursor:'pointer', fontSize:'0.78rem'}} onClick={()=>{ setUnread(0); setShowInbox(false) }}>
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
  <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20}} onClick={()=>setShowSettings(false)}>
    <div style={{background:'#141820', border:'1px solid #1e2433', borderRadius:16, width:'100%', maxWidth:400, maxHeight:'85vh', overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
      <div style={{padding:'20px 24px 16px', borderBottom:'1px solid #1e2433', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <span style={{fontSize:'0.95rem', fontWeight:700, color:'#f1f5f9'}}>⚙️ Settings</span>
        <span style={{color:'#4a5568', cursor:'pointer', fontSize:'1rem'}} onClick={()=>setShowSettings(false)}>✕</span>
      </div>
      <div style={{padding:24, display:'flex', flexDirection:'column', gap:20}}>

        <div>
          <div style={{fontSize:'0.72rem', color:'#4a5568', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10}}>Theme</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
            {THEMES.map(t => (
              <div key={t.id} onClick={()=>updateSetting('theme',t.id)} style={{padding:'10px 12px', borderRadius:8, cursor:'pointer', border:`1px solid ${settings.theme===t.id?t.accent:'#2d3748'}`, background:settings.theme===t.id?t.accent+'22':'#0f1117', display:'flex', alignItems:'center', gap:8}}>
                <div style={{width:14, height:14, borderRadius:3, background:t.bg, border:`2px solid ${t.accent}`}}/>
                <span style={{fontSize:'0.78rem', color:settings.theme===t.id?t.accent:'#94a3b8', fontWeight:settings.theme===t.id?600:400}}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{fontSize:'0.72rem', color:'#4a5568', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10}}>Font Size</div>
          <div style={{display:'flex', gap:8}}>
            {['small','medium','large'].map(size => (
              <div key={size} onClick={()=>updateSetting('fontSize',size)} style={{flex:1, padding:'8px', borderRadius:8, cursor:'pointer', border:`1px solid ${settings.fontSize===size?'#3b82f6':'#2d3748'}`, background:settings.fontSize===size?'#3b82f622':'#0f1117', textAlign:'center', fontSize:'0.78rem', color:settings.fontSize===size?'#60a5fa':'#94a3b8', fontWeight:settings.fontSize===size?600:400}}>
                {size.charAt(0).toUpperCase()+size.slice(1)}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{fontSize:'0.72rem', color:'#4a5568', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10}}>Language</div>
          <div style={{display:'flex', gap:8}}>
            {[['english','🇬🇧 English'],['portuguese','🇵🇹 PT'],['russian','🇷🇺 RU']].map(([lang,label]) => (
              <div key={lang} onClick={()=>updateSetting('language',lang)} style={{flex:1, padding:'8px', borderRadius:8, cursor:'pointer', border:`1px solid ${settings.language===lang?'#3b82f6':'#2d3748'}`, background:settings.language===lang?'#3b82f622':'#0f1117', textAlign:'center', fontSize:'0.72rem', color:settings.language===lang?'#60a5fa':'#94a3b8', fontWeight:settings.language===lang?600:400}}>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{fontSize:'0.72rem', color:'#4a5568', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10}}>Time Format</div>
          <div style={{display:'flex', gap:8}}>
            {['24h','12h'].map(fmt => (
              <div key={fmt} onClick={()=>updateSetting('timeFormat',fmt)} style={{flex:1, padding:'8px', borderRadius:8, cursor:'pointer', border:`1px solid ${settings.timeFormat===fmt?'#3b82f6':'#2d3748'}`, background:settings.timeFormat===fmt?'#3b82f622':'#0f1117', textAlign:'center', fontSize:'0.78rem', color:settings.timeFormat===fmt?'#60a5fa':'#94a3b8', fontWeight:settings.timeFormat===fmt?600:400}}>
                {fmt}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
 </div>
      )}
    </div>
  )
}


// ==================== ROOT APP ====================

export default function App() {
  const [session, setSession]               = useState(null)
  const [profile, setProfile]               = useState(null)
  const [attendance, setAttendance]         = useState(null)
  const [page, setPage]                     = useState('home')
  const [loading, setLoading]               = useState(true)
  const [busy, setBusy]                     = useState(false)
  const [error, setError]                   = useState(null)
  const [showReportPopup, setShowReportPopup] = useState(false)

  // Admin-only overview state
  const [onDuty, setOnDuty]           = useState([])
  const [weeklyHours, setWeeklyHours] = useState([])
  const [upcomingLeave, setUpcomingLeave] = useState([])
  const [pendingCount, setPendingCount]   = useState(0)
  const [adminLoading, setAdminLoading]   = useState(true)

  useEffect(()=>{
    supabase.auth.getSession().then(async ({data:{session}})=>{
      if(!session){window.location.href='/';return}
      setSession(session)
      await loadProfile(session.user.id)
      setLoading(false)
    })
  },[])

  useEffect(() => {
    if (!profile?.id) return
    const updateSeen = () => supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', profile.id)
    updateSeen()
    const interval = setInterval(updateSeen, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [profile?.id])

  useEffect(() => {
    if (!session?.user?.id || !profile) return
    if (profile.role === 'mod') {
      loadAttendance(session.user.id)
      setPage('home')
    } else if (profile.role === 'admin') {
      fetchAdminOverview()
      const firstAllowed = filterAdminNav(profile)?.[0]?.items?.[0]?.id
      setPage(hasPermission(profile,'dashboard') ? 'dashboard' : (firstAllowed || (profile.is_super_admin ? 'permissions' : 'dashboard')))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

  async function loadProfile(uid) {
    const {data}=await supabase.from('profiles').select('*').eq('id',uid).single()
    setProfile(data)
  }

  async function loadAttendance(uid) {
    const {data}=await supabase.from('attendance').select('*').eq('user_id',uid).is('clock_out',null).order('clock_in',{ascending:false}).limit(1).maybeSingle()
    setAttendance(data)
  }

  const fetchAdminOverview = useCallback(async () => {
    setAdminLoading(true)
    const now=new Date(), {monday}=getWeekRange()
    const today=now.toISOString().split('T')[0]
    const in14=new Date(Date.now()+14*86400000).toISOString().split('T')[0]
    const [{data:duty},{data:att},{data:leave},{data:pending},{data:profs}] = await Promise.all([
      supabase.from('attendance').select('id,clock_in,lunch_start,status,user_id,profiles(name,role,last_seen)').is('clock_out',null).order('clock_in'),
      supabase.from('attendance').select('clock_in,clock_out,user_id').gte('clock_in',monday.toISOString()).not('clock_out','is',null),
      supabase.from('vacation_requests').select('id,start_date,end_date,user_id').eq('status','approved').gte('start_date',today).lte('start_date',in14).order('start_date'),
      supabase.from('vacation_requests').select('id').eq('status','pending'),
      supabase.from('profiles').select('id,name,role'),
    ])
    const profileMap={}; (profs||[]).forEach(p=>{profileMap[p.id]=p})
    setOnDuty((duty||[]).filter(r=>profileMap[r.user_id]?.role!=='admin').map(r=>({...r,profiles:profileMap[r.user_id]})))
    const map={}
    ;(att||[]).forEach(row=>{
      const p=profileMap[row.user_id]
      if(!p||p.role==='admin') return
      const mins=Math.round((new Date(row.clock_out)-new Date(row.clock_in))/60000)
      if(!map[p.name]) map[p.name]={name:p.name,minutes:0}
      map[p.name].minutes+=mins
    })
    setWeeklyHours(Object.values(map).sort((a,b)=>b.minutes-a.minutes))
    setUpcomingLeave((leave||[]).filter(r=>profileMap[r.user_id]?.role!=='admin').map(r=>({...r,profiles:profileMap[r.user_id]})))
    setPendingCount(pending?.length||0)
    setAdminLoading(false)
  },[])

  useEffect(()=>{
    if(profile?.role!=='admin') return
    const ch=supabase.channel('admin-duty').on('postgres_changes',{event:'*',schema:'public',table:'attendance'},fetchAdminOverview).subscribe()
    return ()=>supabase.removeChannel(ch)
  },[profile?.role,fetchAdminOverview])

  async function handleAction(action) {
    if (action === 'clock_out') { setShowReportPopup(true); return }
    await doAction(action)
  }

  async function doAction(action) {
    setBusy(true); setError(null)
    try {
      const res = await fetch(`/api/attendance?action=${action}`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ user_id: session.user.id }),
      })
      const body = await res.json()
      if(!res.ok) throw new Error(body.error||'Error')
      await loadAttendance(session.user.id)
    } catch(e) { setError(e.message) }
    finally { setBusy(false) }
  }

  async function handleReportDone() {
    setShowReportPopup(false)
    await doAction('clock_out')
  }

  async function handleLogout() {
    await supabase.auth.signOut(); window.location.href='/'
  }

  if(loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0f1117',color:'#4a5568',fontFamily:'system-ui'}}>Loading…</div>

  const isAdmin = profile?.role === 'admin'
  const canSee = (sectionId) => hasPermission(profile, sectionId)

  return (
    <>
      <style>{`*{box-sizing:border-box}body{margin:0}input,select,textarea{color-scheme:dark}html,body{height:100%}#__next{height:100%}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      {showReportPopup && (
        <DailyReportPopup
          userId={session.user.id}
          attendanceId={attendance?.id}
          shift={profile?.shift}
          onClose={()=>setShowReportPopup(false)}
          onSubmit={handleReportDone}
        />
      )}
      <Layout profile={profile} page={page} setPage={setPage} onLogout={handleLogout}>
        {!isAdmin && (
          <>
            {page==='home'                        && <PageHome profile={profile} attendance={attendance} onAction={handleAction} busy={busy} error={error} userId={session?.user.id} onNavigate={setPage}/>}
            {page==='links'        && canSee('links')        && <PageLinks/>}
            {page==='attendance'   && canSee('attendance')   && <PageAttendance userId={session?.user.id}/>}
            {page==='vacation'     && canSee('vacation')     && <PageVacation userId={session?.user.id} profile={profile} onProfileRefresh={()=>loadProfile(session.user.id)}/>}
            {page==='swaps'        && canSee('swaps')        && <PageSwaps userId={session?.user.id} profile={profile}/>}
            {page==='calendar'     && canSee('calendar')     && <PageCalendar/>}
            {page==='profile'                                && <PageProfile userId={session?.user.id} profile={profile} onRefresh={()=>loadProfile(session.user.id)}/>}
            {page==='reports'      && canSee('reports')      && <PageMyReports userId={session?.user.id} profile={profile}/>}
            {page==='devreports'   && canSee('devreports')   && <PageDevReports userId={session?.user.id}/>}
            {page==='teamreports'  && canSee('teamreports')  && <PageTeamReports/>}
            {page==='applications' && canSee('applications') && <PageApplications userId={session?.user.id}/>}
            {page==='team'         && canSee('team')         && <PageTeam/>}
            {page==='agenda'       && canSee('agenda')       && <PageMeetingAgenda userId={session?.user.id} profile={profile}/>}
            {page==='vip'          && canSee('vip')          && <PageVIPUsers userId={session?.user.id} profile={profile}/>}
          </>
        )}
        {isAdmin && (
          <>
            {page==='permissions' && profile?.is_super_admin && <PagePermissions/>}
            {page==='adminprofile' && <AdminPageProfile userId={session?.user.id} profile={profile} onRefresh={()=>loadProfile(session.user.id)}/>}
            {page==='dashboard'       && canSee('dashboard')       && (adminLoading ? <div style={{padding:40,color:'#4a5568'}}>Loading…</div> : <PageDashboard onDuty={onDuty} weeklyHours={weeklyHours} upcomingLeave={upcomingLeave} pendingCount={pendingCount} adminId={profile?.id}/>)}
            {page==='approvals'       && canSee('approvals')       && <PageApprovals onCountChange={setPendingCount} adminId={profile?.id}/>}
            {page==='moderators'      && canSee('moderators')      && <PageModerators adminId={profile?.id}/>}
            {page==='applications'    && canSee('applications')    && <AdminPageApplications adminId={profile?.id}/>}
            {page==='attendance'      && canSee('attendance')      && <AdminPageAttendance/>}
            {page==='attendancereport'&& canSee('attendancereport')&& <PageAttendanceReport/>}
            {page==='shifts'          && canSee('shifts')          && <PageShifts/>}
            {page==='calendar'        && canSee('calendar')        && <AdminPageCalendar/>}
            {page==='reports'         && canSee('reports')         && <PageReports/>}
            {page==='dailyreports'    && canSee('dailyreports')    && <PageDailyReports/>}
            {page==='devreports'      && canSee('devreports')      && <AdminPageDevReports/>}
            {page==='hours'           && canSee('hours')           && <PageHours/>}
            {page==='announcements'   && canSee('announcements')   && <PageAnnouncements adminId={profile?.id}/>}
            {page==='swapmanager'     && canSee('swapmanager')     && <PageSwapManager adminId={profile?.id}/>}
            {page==='vacationcal'     && canSee('vacationcal')     && <PageVacationCalendar/>}
            {page==='agenda'          && canSee('agenda')          && <AdminPageMeetingAgenda adminId={profile?.id}/>}
          </>
        )}
      </Layout>
    </>
  )
}


// mod-view styles

const s = {
  root:        {display:'flex',height:'100vh',overflow:'hidden',background:'#0f1117',color:'#e2e8f0',fontFamily:"'Inter',system-ui,sans-serif"},
  sidebar:     {width:230,background:'#0a0d14',borderRight:'1px solid #1e2433',display:'flex',flexDirection:'column',flexShrink:0,position:'sticky',top:0,height:'100vh'},
  sideTop:     {padding:'20px 16px 12px'},
  logoRow:     {display:'flex',alignItems:'center',gap:8,marginBottom:4},
  logoIcon:    {width:30,height:30,background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:'#fff'},
  logoText:    {fontSize:'0.95rem',fontWeight:700,letterSpacing:'-0.02em',color:'#f8fafc'},
  roleLabel:   {fontSize:'0.7rem',color:'#4a5568',paddingLeft:38},
  userLabel:   {fontSize:'0.72rem',color:'#64748b',paddingLeft:38,marginTop:2},
  nav:         {padding:'8px',flex:1,overflowY:'auto'},
  navItem:     {display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:8,cursor:'pointer',fontSize:'0.83rem',color:'#94a3b8',marginBottom:2},
  navActive:   {background:'#1e2433',color:'#f1f5f9'},
  sideBottom:  {padding:'12px 8px',borderTop:'1px solid #1e2433',background:'#0a0d14',flexShrink:0},
  logoutBtn:   {display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:8,cursor:'pointer',fontSize:'0.83rem',color:'#64748b',width:'100%',background:'none',border:'none'},
  main:        {flex:1,overflow:'auto',height:'100vh'},
  content:     {padding:'32px 36px',maxWidth:1000,margin:'0 auto'},
  pageHead:    {display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24},
  pageTitle:   {fontSize:'1.3rem',fontWeight:700,margin:'0 0 24px',letterSpacing:'-0.02em',color:'#f8fafc'},
  card:        {background:'#141820',border:'1px solid #1e2433',borderRadius:12,padding:'20px 22px',marginBottom:20},
  cardHead:    {display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16},
  cardTitle:   {fontSize:'0.88rem',fontWeight:600,color:'#f1f5f9'},
  empty:       {color:'#4a5568',fontSize:'0.85rem',padding:'12px 0'},
  shiftGrid:   {display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24},
  shiftItem:   {},
  shiftLabel:  {fontSize:'0.7rem',color:'#4a5568',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4},
  shiftValue:  {fontSize:'0.9rem',fontWeight:500,color:'#e2e8f0'},
  statusBadge: {fontSize:'0.72rem',fontWeight:600,padding:'5px 12px',borderRadius:20},
  actions:     {display:'flex',gap:10,flexWrap:'wrap'},
  btn:         {display:'flex',alignItems:'center',gap:7,padding:'10px 18px',borderRadius:8,border:'none',fontSize:'0.84rem',fontWeight:600,cursor:'pointer'},
  btnGreen:    {background:'#16a34a',color:'#fff'},
  btnAmber:    {background:'#d97706',color:'#fff'},
  btnBlue:     {background:'#2563eb',color:'#fff'},
  btnRed:      {background:'#dc2626',color:'#fff'},
  btnPrimary:  {background:'#3b82f6',color:'#fff',border:'none',borderRadius:8,padding:'9px 18px',fontSize:'0.83rem',fontWeight:600,cursor:'pointer'},
  errorBox:    {background:'#dc262622',border:'1px solid #dc262644',color:'#f87171',fontSize:'0.8rem',padding:'10px 14px',borderRadius:8,marginBottom:16},
  vacRow:      {display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16},
  vacItem:     {textAlign:'center'},
  vacNum:      {fontSize:'2rem',fontWeight:700,color:'#f8fafc',lineHeight:1},
  vacLabel:    {fontSize:'0.7rem',color:'#4a5568',textTransform:'uppercase',letterSpacing:'0.06em',marginTop:6},
  table:       {width:'100%',borderCollapse:'collapse'},
  th:          {textAlign:'left',fontSize:'0.7rem',color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',paddingBottom:10,borderBottom:'1px solid #1e2433',paddingRight:16},
  td:          {padding:'11px 16px 11px 0',fontSize:'0.83rem',color:'#e2e8f0',borderBottom:'1px solid #0f1117'},
  filterRow:   {display:'flex',gap:6},
  filterBtn:   {background:'transparent',border:'1px solid #2d3748',color:'#94a3b8',borderRadius:6,padding:'6px 14px',fontSize:'0.78rem',cursor:'pointer'},
  filterActive:{background:'#1e2433',color:'#f1f5f9',borderColor:'#334155'},
  formGrid:    {display:'grid',gridTemplateColumns:'1fr 1fr',gap:16},
  formGroup:   {display:'flex',flexDirection:'column',gap:6},
  label:       {fontSize:'0.75rem',color:'#94a3b8',fontWeight:500},
  input:       {background:'#0f1117',border:'1px solid #2d3748',borderRadius:8,padding:'9px 12px',color:'#e2e8f0',fontSize:'0.85rem',outline:'none',fontFamily:'inherit'},
  chip:        {fontSize:'0.68rem',color:'#64748b',background:'#1e2433',padding:'3px 8px',borderRadius:4},
}


// admin-view styles

const sa = {
  root:        {display:'flex',height:'100vh',overflow:'hidden',background:'#0f1117',color:'#e2e8f0',fontFamily:"'Inter',system-ui,sans-serif"},
  sidebar:     {width:230,background:'#0a0d14',borderRight:'1px solid #1e2433',display:'flex',flexDirection:'column',flexShrink:0,height:'100vh'},
  sideTop:     {padding:'20px 16px 12px'},
  logoRow:     {display:'flex',alignItems:'center',gap:8,marginBottom:4},
  logoIcon:    {width:30,height:30,background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:'#fff'},
  logoText:    {fontSize:'0.95rem',fontWeight:700,letterSpacing:'-0.02em',color:'#f8fafc'},
  roleLabel:   {fontSize:'0.7rem',color:'#4a5568',paddingLeft:38},
  userLabel:   {fontSize:'0.72rem',color:'#64748b',paddingLeft:38,marginTop:2},
  nav:         {padding:'8px',flex:1,overflowY:'auto'},
  navItem:     {display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:8,cursor:'pointer',fontSize:'0.83rem',color:'#94a3b8',marginBottom:2},
  navActive:   {background:'#1e2433',color:'#f1f5f9'},
  sideBottom:  {padding:'12px 8px',borderTop:'1px solid #1e2433',background:'#0a0d14',flexShrink:0},
  logoutBtn:   {display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:8,cursor:'pointer',fontSize:'0.83rem',color:'#64748b',width:'100%',background:'none',border:'none'},
  main:        {flex:1,overflow:'auto',height:'100vh'},
  content:     {padding:'32px 36px',maxWidth:1100,margin:'0 auto'},
  pageHead:    {display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24},
  pageTitle:   {fontSize:'1.3rem',fontWeight:700,margin:'0 0 24px',letterSpacing:'-0.02em',color:'#f8fafc'},
  empty:       {color:'#4a5568',fontSize:'0.85rem',padding:'12px 0'},
  card:        {background:'#141820',border:'1px solid #1e2433',borderRadius:12,padding:'20px 22px',marginBottom:20},
  cardHead:    {display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:8},
  cardTitle:   {fontSize:'0.88rem',fontWeight:600,color:'#f1f5f9'},
  statRow:     {display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:20},
  statCard:    {background:'#141820',border:'1px solid #1e2433',borderRadius:12,padding:'18px 20px',display:'flex',flexDirection:'column',gap:4},
  statNum:     {fontSize:'2rem',fontWeight:700,lineHeight:1},
  statLabel:   {fontSize:'0.7rem',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em'},
  twoCol:      {display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20},
  hoursRow:    {display:'grid',gridTemplateColumns:'130px 1fr 56px',alignItems:'center',gap:12,marginBottom:10},
  hoursName:   {fontSize:'0.8rem',color:'#94a3b8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'},
  barTrack:    {height:6,background:'#1e2433',borderRadius:99,overflow:'hidden'},
  barFill:     {height:'100%',borderRadius:99,transition:'width 0.4s ease'},
  liveChip:    {display:'flex',alignItems:'center',gap:5,fontSize:'0.62rem',fontWeight:700,letterSpacing:'0.08em',color:'#34d399',background:'rgba(52,211,153,0.08)',border:'1px solid rgba(52,211,153,0.2)',padding:'3px 8px',borderRadius:20},
  liveDot:     {width:6,height:6,borderRadius:'50%',background:'#34d399',animation:'pulse 1.8s ease-in-out infinite'},
  dot:         {width:8,height:8,borderRadius:'50%',flexShrink:0},
  dutyRow:     {display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid #1e2433'},
  chip:        {fontSize:'0.68rem',color:'#64748b',background:'#1e2433',padding:'3px 8px',borderRadius:4},
  badge:       {fontSize:'0.68rem',fontWeight:700,color:'#60a5fa',background:'#1e3a5f',padding:'3px 8px',borderRadius:4},
  pill:        {fontSize:'0.72rem',fontWeight:600,padding:'3px 10px',borderRadius:20},
  approvalBlock:{padding:'16px 0',borderBottom:'1px solid #1e2433'},
  approvalTop:  {display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12},
  approvalName: {fontSize:'0.87rem',fontWeight:500,marginBottom:4},
  approvalMeta: {fontSize:'0.75rem',color:'#64748b'},
  warnBox:     {background:'#f59e0b22',border:'1px solid #f59e0b44',color:'#f59e0b',fontSize:'0.78rem',padding:'6px 10px',borderRadius:6,marginBottom:4},
  errorBox:    {background:'#dc262622',border:'1px solid #dc262644',color:'#f87171',fontSize:'0.8rem',padding:'10px 14px',borderRadius:8,marginBottom:16},
  modAvatar:   {width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',fontWeight:700,flexShrink:0,color:'#fff'},
  table:       {width:'100%',borderCollapse:'collapse'},
  th:          {textAlign:'left',fontSize:'0.7rem',color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',paddingBottom:10,borderBottom:'1px solid #1e2433',paddingRight:16},
  td:          {padding:'11px 16px 11px 0',fontSize:'0.83rem',color:'#e2e8f0',borderBottom:'1px solid #0f1117'},
  filterRow:   {display:'flex',gap:6},
  filterBtn:   {background:'transparent',border:'1px solid #2d3748',color:'#94a3b8',borderRadius:6,padding:'6px 14px',fontSize:'0.78rem',cursor:'pointer'},
  filterActive: {background:'#1e2433',color:'#f1f5f9',borderColor:'#334155'},
  formGrid:    {display:'grid',gridTemplateColumns:'1fr 1fr',gap:16},
  formGroup:   {display:'flex',flexDirection:'column',gap:6},
  label:       {fontSize:'0.75rem',color:'#94a3b8',fontWeight:500},
  input:       {background:'#0f1117',border:'1px solid #2d3748',borderRadius:8,padding:'9px 12px',color:'#e2e8f0',fontSize:'0.85rem',outline:'none',fontFamily:'inherit'},
  btnPrimary:  {background:'#3b82f6',color:'#fff',border:'none',borderRadius:8,padding:'9px 18px',fontSize:'0.83rem',fontWeight:600,cursor:'pointer'},
  btnApprove:  {background:'#16a34a22',color:'#34d399',border:'1px solid #16a34a44',padding:'6px 14px',borderRadius:6,cursor:'pointer',fontSize:'0.78rem',fontWeight:600},
  btnReject:   {background:'#dc262622',color:'#f87171',border:'1px solid #dc262644',padding:'6px 14px',borderRadius:6,cursor:'pointer',fontSize:'0.78rem',fontWeight:600},
  btnSmGreen:  {background:'#16a34a22',color:'#34d399',border:'1px solid #16a34a44',padding:'4px 10px',borderRadius:6,cursor:'pointer',fontSize:'0.75rem',fontWeight:600},
  btnSmRed:    {background:'#dc262622',color:'#f87171',border:'1px solid #dc262644',padding:'4px 10px',borderRadius:6,cursor:'pointer',fontSize:'0.75rem',fontWeight:600},
  btnSmBlue:   {background:'#3b82f622',color:'#60a5fa',border:'1px solid #3b82f644',padding:'4px 10px',borderRadius:6,cursor:'pointer',fontSize:'0.75rem',fontWeight:600},
}
