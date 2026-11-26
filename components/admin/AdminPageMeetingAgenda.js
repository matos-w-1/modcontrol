import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function AdminPageMeetingAgenda({ adminId }) {
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
                  by {mods[selected.submitted_by]?.name||'Unknown'} · {new Date(selected.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})} at {new Date(selected.created_at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit', hour12:true})}
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
                  <span style={{fontSize:'0.7rem',color:'#4a5568'}}>by {mods[item.submitted_by]?.name||'Unknown'} · {new Date(item.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})} {new Date(item.created_at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit', hour12:true})}</span>
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
