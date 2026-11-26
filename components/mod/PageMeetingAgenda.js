import { s } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function PageMeetingAgenda({ userId }) {
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
                  by {selected.profiles?.name||'Unknown'} · {new Date(selected.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})} at {new Date(selected.created_at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit', hour12:true})}
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
                  <span style={{fontSize:'0.7rem',color:'#4a5568'}}>by {item.profiles?.name||'Unknown'} · {new Date(item.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})} {new Date(item.created_at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit', hour12:true})}</span>
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
