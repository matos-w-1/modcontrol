import { SHIFT_WARN_MIN, fmtMinutes, playBeep, shiftEndFor } from '../../lib/shiftTime'
import { useEffect, useRef, useState } from 'react'

// Bottom banner + sound + browser notification reminding a mod to clock out.
export function ShiftEndReminder({ attendance, shift, hidden, onClockOut }) {
  const active = !!attendance && !attendance.clock_out && !!shift
  const [info, setInfo] = useState(null)
  const lastMilestone = useRef(null)

  useEffect(() => {
    if (!active) { lastMilestone.current = null; setInfo(null); return }
    const end = shiftEndFor(attendance.clock_in, shift)
    if (!end) { setInfo(null); return }
    function fire(over, left, overMins) {
      playBeep(over ? 'alarm' : 'warn')
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(over ? '⏰ Your shift has ended' : '⏰ Your shift ends soon', {
            body: over ? `Your shift ended${overMins > 0 ? ' ' + fmtMinutes(overMins) + ' ago' : ''}. Please clock out.` : `${left} min left. Remember to clock out.`,
            tag: 'shift-end-reminder',
            requireInteraction: over,
          })
        }
      } catch (e) {}
    }
    function tick() {
      const diff = end - Date.now()
      const over = diff <= 0
      const left = Math.ceil(diff / 60000)
      const overMins = over ? Math.floor(-diff / 60000) : 0
      setInfo({ over, left, overMins })
      let milestone = null
      if (over) milestone = 'over-' + Math.floor(overMins / 5)   // at the end, then every 5 min
      else if (left <= SHIFT_WARN_MIN) milestone = 'warn'
      if (milestone !== null && milestone !== lastMilestone.current) {
        lastMilestone.current = milestone
        fire(over, left, overMins)
      }
    }
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [active, attendance?.clock_in, shift])

  if (!active || hidden || !info) return null
  if (!info.over && info.left > SHIFT_WARN_MIN) return null
  const over = info.over
  const color = over ? '#f87171' : '#f59e0b'
  return (
    <div style={{position:'fixed', bottom:0, left:0, right:0, zIndex:400, background: over?'#7f1d1d':'#78350f', borderTop:`2px solid ${color}`, color:'#fff', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'center', gap:16, flexWrap:'wrap', fontSize:'0.88rem', fontWeight:600}}>
      <span>{over ? `⏰ Your shift has ended${info.overMins > 0 ? ' ' + fmtMinutes(info.overMins) + ' ago' : ''}. Please clock out.` : `⏰ Your shift ends in ${info.left} min. Remember to clock out.`}</span>
      <button onClick={onClockOut} style={{background:'#fff', color: over?'#7f1d1d':'#78350f', border:'none', padding:'6px 14px', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:'0.8rem'}}>Clock Out</button>
    </div>
  )
}
