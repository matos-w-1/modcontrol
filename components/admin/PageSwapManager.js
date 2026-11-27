import { fmtDate } from '../../lib/utils'
import { AddSwapPanel } from './AddSwapPanel'
import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function PageSwapManager({ adminId }) {
  const [swaps, setSwaps]   = useState([])
  const [debts, setDebts]   = useState([])
  const [mods, setMods]     = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [modList, setModList] = useState([])   // active moderators, for the Add swap form
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    const [{ data:sw },{ data:db },{ data:p }] = await Promise.all([
      supabase.from('shift_swaps').select('*').order('created_at',{ascending:false}),
      supabase.from('swap_debts').select('*').order('created_at',{ascending:false}),
      supabase.from('profiles').select('id,name,role,status,shift,days_off,rotating_days_off,rotating_days_off_alt'),
    ])
    const map={}; (p||[]).forEach(x=>map[x.id]=x.name)
    setMods(map); setDebts(db||[])
    setModList((p||[]).filter(x=>x.role==='mod' && !['left','inactive'].includes(x.status)).sort((x,y)=>x.name.localeCompare(y.name)))
    setSwaps(filter==='all'?sw||[]:(sw||[]).filter(x=>x.status===filter))
    setLoading(false)
  }

  async function settle(id) {
    await supabase.from('swap_debts').update({ settled:true, settled_at:new Date().toISOString() }).eq('id', id)
    load()
  }

  // Delete a swap (for example one added by mistake). Its swap debt goes with it.
  async function removeSwap(r) {
    if (!window.confirm(`Delete the swap ${mods[r.requester_id]} ↔ ${mods[r.target_id]} (${fmtDate(r.swap_date)} ↔ ${fmtDate(r.target_date)})? Any swap debt linked to it is deleted too.`)) return
    await supabase.from('swap_debts').delete().eq('swap_id', r.id)
    await supabase.from('shift_swaps').delete().eq('id', r.id)
    load()
  }

  const statusColor = { pending:'#f59e0b', pending_admin:'#60a5fa', approved:'#34d399', declined:'#f87171' }
  const openDebts = debts.filter(d=>!d.settled)

  return (
    <div style={sa.content}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap'}}>
        <h1 style={sa.pageTitle}>Swap Manager</h1>
        {!showAdd && <button style={sa.btnPrimary} onClick={()=>setShowAdd(true)}>+ Add swap</button>}
      </div>
      {showAdd && <AddSwapPanel mods={modList} onCancel={()=>setShowAdd(false)} onDone={()=>{ setShowAdd(false); load() }}/>}
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
            <button style={sa.btnSmRed} onClick={()=>removeSwap(r)} title="Delete this swap">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
