import { LUNCH_LIMIT_MIN, LUNCH_WARN_MIN, _audioCtx, lunchMinutesSince, playBeep, unlockLunchAlerts } from '../../lib/shiftTime'
import { useEffect, useRef, useState } from 'react'

// Banner + sound + browser notification + flashing tab title while a mod is
// on lunch. Lives at the app root, so it works on every tab of the dashboard.
export function LunchReminder({ attendance, onEndLunch }) {
  const onLunch = !!attendance && !attendance.clock_out && !!attendance.lunch_start && !attendance.lunch_end
  const [mins, setMins] = useState(0)
  const [soundOn, setSoundOn] = useState(false)
  const lastMilestone = useRef(-1)

  // Browsers only allow sound after the user interacted with the page, so
  // unlock audio on the first click/key anywhere (covers page reloads mid-lunch).
  useEffect(() => {
    function unlock() { unlockLunchAlerts(); setSoundOn(!!_audioCtx && _audioCtx.state === 'running') }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => { window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock) }
  }, [])

  useEffect(() => {
    if (!onLunch) { lastMilestone.current = -1; setMins(0); return }
    function fire(m) {
      playBeep(m >= LUNCH_LIMIT_MIN ? 'alarm' : 'warn')
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          const over = m >= LUNCH_LIMIT_MIN
          new Notification(over ? '🍽 Your lunch is over' : '🍽 Lunch ends soon', {
            body: over ? `You have been on lunch for ${m} min. Please end your lunch.` : `${LUNCH_LIMIT_MIN - m} min left on your lunch.`,
            tag: 'lunch-reminder',
            requireInteraction: over,
          })
        }
      } catch (e) {}
    }
    function tick() {
      const m = lunchMinutesSince(attendance.lunch_start)
      setMins(m)
      setSoundOn(!!_audioCtx && _audioCtx.state === 'running')
      let milestone = null
      if (m >= LUNCH_LIMIT_MIN) milestone = LUNCH_LIMIT_MIN + Math.floor((m - LUNCH_LIMIT_MIN) / 5) * 5 // 30, 35, 40…
      else if (m >= LUNCH_WARN_MIN) milestone = LUNCH_WARN_MIN
      if (milestone !== null && milestone !== lastMilestone.current) {
        lastMilestone.current = milestone
        fire(m)
      }
    }
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [onLunch, attendance?.lunch_start])

  const over = onLunch && mins >= LUNCH_LIMIT_MIN

  // Flash the tab title so it is noticed from another tab/window
  useEffect(() => {
    if (!over || typeof document === 'undefined') return
    const original = document.title
    let on = false
    const id = setInterval(() => { on = !on; document.title = on ? '🍽 LUNCH IS OVER!' : original }, 1000)
    return () => { clearInterval(id); document.title = original }
  }, [over])

  if (!onLunch || mins < LUNCH_WARN_MIN) return null
  const color = over ? '#f87171' : '#f59e0b'
  return (
    <div style={{position:'fixed', top:0, left:0, right:0, zIndex:500, background: over?'#7f1d1d':'#78350f', borderBottom:`2px solid ${color}`, color:'#fff', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'center', gap:16, flexWrap:'wrap', fontSize:'0.88rem', fontWeight:600}}>
      <span>{over ? `🍽 Your lunch is over — ${mins} min / ${LUNCH_LIMIT_MIN} min. Please end your lunch.` : `🍽 Lunch ends in ${LUNCH_LIMIT_MIN - mins} min (${mins} / ${LUNCH_LIMIT_MIN} min).`}</span>
      {!soundOn && <span style={{fontSize:'0.75rem', fontWeight:500, opacity:0.9}}>🔇 Click anywhere on the page to enable the alert sound</span>}
      <button onClick={()=>{ unlockLunchAlerts(); playBeep(over ? 'alarm' : 'warn'); setSoundOn(true) }} style={{background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.5)', padding:'6px 12px', borderRadius:8, fontWeight:600, cursor:'pointer', fontSize:'0.78rem'}}>🔔 Test sound</button>
      <button onClick={onEndLunch} style={{background:'#fff', color: over?'#7f1d1d':'#78350f', border:'none', padding:'6px 14px', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:'0.8rem'}}>End Lunch</button>
    </div>
  )
}
