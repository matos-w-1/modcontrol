import { SHIFT_COLORS } from '../../lib/utils'
import { TimeInput12 } from '../shared/TimeInput12'
import { sa } from '../../lib/styles'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function PageShifts() {
  const [mods, setMods]       = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView]       = useState('schedule')
  const [editMod, setEditMod] = useState(null)

  const DAYS        = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  const SHIFTS      = ['Morning Shift','Afternoon Shift','Night Shift']
  const SHIFT_TIMES = { 'Morning Shift':'9 AM–5 PM','Afternoon Shift':'5 PM–12 AM','Night Shift':'12 AM–9 AM' }
  const SHIFT_COLOR = SHIFT_COLORS

  useEffect(() => { load() }, [])

async function load() {
  const [{ data }, { data:overridesData }] = await Promise.all([
    supabase.from('profiles').select('id,name,shift,status,days_off,mod_group,rotating_days_off,rotating_days_off_alt').eq('role','mod').neq('status','left').order('name'),
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
    if (daysOff.includes(day)) return { label:'OFF', color:'#be123c', bg:'#be123c33' }
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
          {nightEn.length>0     && <ShiftTable title={`Night Shift · ${SHIFT_TIMES['Night Shift']} Lisbon time`}     rows={nightEn}     accent={SHIFT_COLORS['Night Shift']}/>}
          {morningEn.length>0   && <ShiftTable title={`Morning Shift · ${SHIFT_TIMES['Morning Shift']} Lisbon time`}   rows={morningEn}   accent={SHIFT_COLORS['Morning Shift']}/>}
          {afternoonEn.length>0 && <ShiftTable title={`Afternoon Shift · ${SHIFT_TIMES['Afternoon Shift']} Lisbon time`} rows={afternoonEn} accent={SHIFT_COLORS['Afternoon Shift']}/>}
          {russianMods.length>0 && (
            <>
              <div style={{fontSize:'0.75rem', color:'#f59e0b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', margin:'24px 0 12px'}}>🇷🇺 Russian Moderators</div>
              <ShiftTable title='Schedule' rows={russianMods} accent='#94a3b8'/>
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
      <TimeInput12 value={o.start_time} onChange={v=>setEditMod(em=>({...em, overrides:em.overrides.map((x,j)=>j===i?{...x,start_time:v}:x)}))}/>
      <span style={{color:'#64748b'}}>to</span>
      <TimeInput12 value={o.end_time} onChange={v=>setEditMod(em=>({...em, overrides:em.overrides.map((x,j)=>j===i?{...x,end_time:v}:x)}))}/>
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
