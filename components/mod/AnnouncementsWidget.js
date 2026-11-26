import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function AnnouncementsWidget() {
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
