import { fmtDate } from '../../lib/utils'
import { s } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function SwapDebts({ userId }) {
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
