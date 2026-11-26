import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function AdminBirthdayList() {
  const [people, setPeople] = useState([])
  useEffect(() => {
    supabase.from('profiles').select('id,name,birthday,avatar_url').eq('role','mod').neq('status','left').not('birthday','is',null)
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
