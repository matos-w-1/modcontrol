import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://vqoxhaggxgwfktuvtoyw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxb3hoYWdneGd3Zmt0dXZ0b3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyOTgxMTQsImV4cCI6MjA5Njg3NDExNH0.Jt93SSFA-d4tAkQxR208puLBd47MavkFYK2MQsys9pQ'
)

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
}

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

  const NAV_GROUPS = [
  { label:'Overview',   items:[{ id:'home',  label:'Dashboard', icon:Icon.home },{ id:'links', label:'Work Links', icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> }] },
  { label:'Scheduling', items:[{ id:'attendance', label:'Attendance', icon:Icon.clock },{ id:'calendar', label:'Calendar', icon:Icon.cal }] },
  { label:'Requests',   items:[{ id:'vacation', label:'Vacation Requests', icon:Icon.palm },{ id:'swaps', label:'Shift Swaps', icon:Icon.swap }] },
  { label:'Reports',    items:[{ id:'reports', label:'My Reports', icon:Icon.report },{ id:'teamreports', label:'Team Reports', icon:Icon.report },{ id:'devreports', label:'Dev Reports', icon:Icon.report },{ id:'applications', label:'Applications', icon:Icon.report }] },
{ label:'Team', items:[{ id:'team', label:'Team', icon:Icon.mods },{ id:'agenda', label:'Meeting Agenda', icon:Icon.report },{ id:'vip', label:'VIP Users', icon:Icon.mods }] },]

  const THEMES = [
    { id:'dark',     label:'Dark',     bg:'#0f1117', accent:'#3b82f6' },
    { id:'midnight', label:'Midnight', bg:'#0a0a1a', accent:'#8b5cf6' },
    { id:'forest',   label:'Forest',   bg:'#0a1a0f', accent:'#34d399' },
    { id:'ocean',    label:'Ocean',    bg:'#0a1520', accent:'#06b6d4' },
  ]

  useEffect(() => {
    if (!profile?.id) return
    loadSettings()
    loadNotifications()
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
<span style={{fontSize:'1.1rem', fontWeight:800, color:'#f8fafc', letterSpacing:'-0.02em', cursor:'pointer'}} onClick={()=>setPage('home')}>ROLLTWO</span>              <div style={{fontSize:'0.68rem', color:'#4a5568', marginTop:1, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:600}}>Mod Control</div>
            </div>
            <div style={{position:'relative', cursor:'pointer', padding:6, borderRadius:8}}
              onClick={()=>{ setShowInbox(i=>!i); setShowSettings(false); setShowUserMenu(false) }}
              onMouseEnter={e=>e.currentTarget.style.background='#1a1f2e'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <svg width="16" height="16" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {unread > 0 && <span style={{position:'absolute', top:2, right:2, width:14, height:14, borderRadius:'50%', background:'#f87171', fontSize:'0.55rem', fontWeight:700, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'}}>{unread}</span>}
            </div>
          </div>
        </div>

        <nav style={s.nav}>
          {NAV_GROUPS.map(group => (
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
        </nav>

        <div style={{padding:'8px', borderTop:'1px solid #1e2433', position:'relative'}}>
          {showUserMenu && (
            <div style={{position:'absolute', bottom:'100%', left:8, right:8, background:'#1a1f2e', border:'1px solid #2d3748', borderRadius:10, padding:6, marginBottom:4, zIndex:100}}>
              <div style={{padding:'6px 10px 8px', borderBottom:'1px solid #1e2433', marginBottom:4}}>
                <div style={{fontSize:'0.82rem', fontWeight:600, color:'#f1f5f9'}}>{profile?.name}</div>
                <div style={{fontSize:'0.7rem', color:'#4a5568', marginTop:1}}>{profile?.shift||'—'}</div>
              </div>
              {[
                { label:'My Profile', icon:'👤', action:()=>{ setPage('profile'); setShowUserMenu(false) } },
                { label:'Settings',   icon:'⚙️', action:()=>{ setShowSettings(true); setShowUserMenu(false) } },
                { label:'Help',       icon:'❓', action:()=>{ window.open('https://t.me/matos_w', '_blank'); setShowUserMenu(false) } },,
                { label:'Sign Out',   icon:'🚪', action:onLogout, danger:true },
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
              <div style={{fontSize:'0.68rem', color:'#4a5568'}}>Moderator</div>
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
        {r.status==='lunch'?'🍽 Lunch':'● Working'}
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
  const [form, setForm]         = useState({ start_date:'', end_date:'' })
  const [saving, setSaving]     = useState(false)
  const [warnings, setWarnings] = useState([])
  const [formError, setFormError] = useState(null)

  useEffect(() => { loadRequests() }, [])

  async function loadRequests() {
    const {data} = await supabase.from('vacation_requests').select('*').eq('user_id',userId).order('submitted_at',{ascending:false})
    setRequests(data||[]); setLoading(false)
  }

  function validateRequest() {
    const warns=[], start=new Date(form.start_date), end=new Date(form.end_date)
    const today=new Date(); today.setHours(0,0,0,0)
    const days=businessDays(start,end), notice=Math.ceil((start-today)/86400000)
    const remaining=(profile?.vacation_allowance??15)-(profile?.vacation_used??0)-(profile?.vacation_pending??0)
    if(days>remaining) warns.push(`⚠️ Requesting ${days} days but only ${remaining} remaining.`)
    if(days>5) warns.push(`⚠️ Maximum 5 consecutive days allowed (requesting ${days}).`)
    if(notice<21) warns.push(`⚠️ Minimum 21 days notice required (you have ${notice} days).`)
    if(end<start) warns.push(`⚠️ End date must be after start date.`)
    setWarnings(warns)
    return { days, valid: warns.length===0 }
  }

  async function submitRequest() {
    setFormError(null)
    if(!form.start_date||!form.end_date){setFormError('Please select both dates.');return}
    const {days} = validateRequest()
    setSaving(true)
    const {error} = await supabase.from('vacation_requests').insert({
      user_id:userId, start_date:form.start_date, end_date:form.end_date,
      days_requested:days, status:'pending', submitted_at:new Date().toISOString(), validation_warnings:warnings,
    })
    if(error){setFormError(error.message);setSaving(false);return}
    await supabase.from('profiles').update({vacation_pending:(profile?.vacation_pending??0)+days}).eq('id',userId)
    setShowForm(false); setForm({start_date:'',end_date:''}); setWarnings([])
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
          <div style={s.formGrid}>
            <div style={s.formGroup}><label style={s.label}>Start Date</label><input style={s.input} type="date" value={form.start_date} onChange={e=>{setForm(f=>({...f,start_date:e.target.value}));setWarnings([])}}/></div>
            <div style={s.formGroup}><label style={s.label}>End Date</label><input style={s.input} type="date" value={form.end_date} onChange={e=>{setForm(f=>({...f,end_date:e.target.value}));setWarnings([])}}/></div>
          </div>
          {form.start_date&&form.end_date&&(
            <div style={{marginTop:12}}>
              <button style={{...s.filterBtn,marginBottom:12}} onClick={validateRequest}>Check Eligibility</button>
              {warnings.map((w,i)=><div key={i} style={{background:'#f59e0b22',border:'1px solid #f59e0b44',color:'#f59e0b',fontSize:'0.8rem',padding:'8px 12px',borderRadius:8,marginBottom:8}}>{w}</div>)}
              {warnings.length===0&&<div style={{background:'#34d39922',border:'1px solid #34d39944',color:'#34d399',fontSize:'0.8rem',padding:'8px 12px',borderRadius:8,marginBottom:8}}>✓ {businessDays(new Date(form.start_date),new Date(form.end_date))} business days — eligible.</div>}
            </div>
          )}
          {formError&&<div style={s.errorBox}>{formError}</div>}
          <button style={{...s.btnPrimary,marginTop:16}} disabled={saving} onClick={submitRequest}>{saving?'Submitting…':'Submit Request'}</button>
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

  const isVipManager = profile?.is_vip_manager
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
        {isVipManager && <button style={s.btnPrimary} onClick={()=>{ setForm({platform:'rustmagic',username:'',steam_id:'',trade_url:'',discord_id:'',deposit_range:'',registered:false,notes:''}); setShowForm(true) }}>+ Add User</button>}
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

export default function Dashboard() {
  const [session, setSession]               = useState(null)
  const [profile, setProfile]               = useState(null)
  const [attendance, setAttendance]         = useState(null)
  const [page, setPage]                     = useState('home')
  const [loading, setLoading]               = useState(true)
  const [busy, setBusy]                     = useState(false)
  const [error, setError]                   = useState(null)
  const [showReportPopup, setShowReportPopup] = useState(false)

  useEffect(()=>{
    supabase.auth.getSession().then(async ({data:{session}})=>{
      if(!session){window.location.href='/';return}
      setSession(session)
      await loadProfile(session.user.id)
      await loadAttendance(session.user.id)
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



  async function loadProfile(uid) {
    const {data}=await supabase.from('profiles').select('*').eq('id',uid).single()
    if(data?.role==='admin'){window.location.href='/admin';return}
    setProfile(data)
  }

  async function loadAttendance(uid) {
    const {data}=await supabase.from('attendance').select('*').eq('user_id',uid).is('clock_out',null).order('clock_in',{ascending:false}).limit(1).maybeSingle()
    setAttendance(data)
  }

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

  return (
    <>
      <style>{`*{box-sizing:border-box}body{margin:0}input,select,textarea{color-scheme:dark}html,body{height:100%}#__next{height:100%}`}</style>
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
       {page==='home'         && <PageHome profile={profile} attendance={attendance} onAction={handleAction} busy={busy} error={error} userId={session?.user.id} onNavigate={setPage}/>}
{page==='links'        && <PageLinks/>}
{page==='attendance'   && <PageAttendance userId={session?.user.id}/>}
{page==='vacation'     && <PageVacation userId={session?.user.id} profile={profile} onProfileRefresh={()=>loadProfile(session.user.id)}/>}
{page==='swaps'        && <PageSwaps userId={session?.user.id} profile={profile}/>}
{page==='calendar'     && <PageCalendar/>}
{page==='profile'      && <PageProfile userId={session?.user.id} profile={profile} onRefresh={()=>loadProfile(session.user.id)}/>}
{page==='reports'      && <PageMyReports userId={session?.user.id} profile={profile}/>}
{page==='devreports'   && <PageDevReports userId={session?.user.id}/>}
{page==='teamreports'  && <PageTeamReports/>}
{page==='applications' && <PageApplications userId={session?.user.id}/>}
{page==='team'         && <PageTeam/>}
{page==='agenda' && <PageMeetingAgenda userId={session?.user.id} profile={profile}/>}
{page==='vip' && <PageVIPUsers userId={session?.user.id} profile={profile}/>}
      </Layout>
    </>
  )
}

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