import { sa } from '../../lib/styles'

export function TimeInput12({ value, onChange, width }) {
  // Stores "HH:MM" (24h) but shows hour / minute / AM-PM selects
  const m = /^(\d{1,2}):(\d{2})/.exec(value||'')
  const h24 = m ? parseInt(m[1],10) : null
  const min = m ? m[2] : '00'
  const ap = h24===null ? 'AM' : (h24>=12 ? 'PM' : 'AM')
  const h12 = h24===null ? '' : String(h24%12===0?12:h24%12)
  const emit = (hh, mm, a) => {
    if (!hh) return onChange('')
    let h = parseInt(hh,10)%12
    if (a==='PM') h += 12
    onChange(`${String(h).padStart(2,'0')}:${mm}`)
  }
  const st = { ...sa.input, width:'auto', padding:'6px 4px' }
  return (
    <span style={{display:'inline-flex', gap:3, width}}>
      <select style={st} value={h12} onChange={e=>emit(e.target.value,min,ap)}>
        <option value="">--</option>
        {[12,1,2,3,4,5,6,7,8,9,10,11].map(h=><option key={h} value={h}>{h}</option>)}
      </select>
      <select style={st} value={min} onChange={e=>emit(h12||'12',e.target.value,ap)}>
        {['00','15','30','45'].map(x=><option key={x} value={x}>{x}</option>)}
      </select>
      <select style={st} value={ap} onChange={e=>emit(h12||'12',min,e.target.value)}>
        <option>AM</option><option>PM</option>
      </select>
    </span>
  )
}
