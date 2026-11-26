import { getWeekRange, toLocalISO } from '../lib/utils'
import { DailyReportPopup } from '../components/mod/DailyReportPopup'
import { PageHome } from '../components/mod/PageHome'
import { PageAttendance } from '../components/mod/PageAttendance'
import { PageVacation } from '../components/mod/PageVacation'
import { PageSwaps } from '../components/mod/PageSwaps'
import { PageProfile } from '../components/mod/PageProfile'
import { PageMyReports } from '../components/mod/PageMyReports'
import { PageCalendar } from '../components/mod/PageCalendar'
import { PageTeamReports } from '../components/mod/PageTeamReports'
import { PageDevReports } from '../components/mod/PageDevReports'
import { PageTeam } from '../components/mod/PageTeam'
import { PageLinks } from '../components/mod/PageLinks'
import { PageApplications } from '../components/mod/PageApplications'
import { PageMeetingAgenda } from '../components/mod/PageMeetingAgenda'
import { AdminPageProfile } from '../components/admin/AdminPageProfile'
import { PageDashboard } from '../components/admin/PageDashboard'
import { PageApprovals } from '../components/admin/PageApprovals'
import { PageModerators } from '../components/admin/PageModerators'
import { AdminPageAttendance } from '../components/admin/AdminPageAttendance'
import { PageShifts } from '../components/admin/PageShifts'
import { PageReports } from '../components/admin/PageReports'
import { PageDailyReports } from '../components/admin/PageDailyReports'
import { AdminPageDevReports } from '../components/admin/AdminPageDevReports'
import { AdminPageCalendar } from '../components/admin/AdminPageCalendar'
import { PageHours } from '../components/admin/PageHours'
import { PageAnnouncements } from '../components/admin/PageAnnouncements'
import { PageSwapManager } from '../components/admin/PageSwapManager'
import { PageVacationCalendar } from '../components/admin/PageVacationCalendar'
import { AdminPageApplications } from '../components/admin/AdminPageApplications'
import { PageAttendanceReport } from '../components/admin/PageAttendanceReport'
import { AdminPageMeetingAgenda } from '../components/admin/AdminPageMeetingAgenda'
import { AdminHub } from '../components/shared/AdminHub'
import { Layout } from '../components/shared/Layout'
import { lunchWindowError, unlockLunchAlerts } from '../lib/shiftTime'
import { LunchReminder } from '../components/shared/LunchReminder'
import { ShiftEndReminder } from '../components/shared/ShiftEndReminder'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { filterAdminNav, hasPermission } from '../lib/permissions'

export default function App() {
  const [session, setSession]               = useState(null)
  const [profile, setProfile]               = useState(null)
  const [attendance, setAttendance]         = useState(null)
  const [page, setPage]                     = useState('home')
  const [adminTab, setAdminTab]               = useState(null)   // active tab inside an admin menu entry
  const goPage = (id) => { setAdminTab(null); setPage(id) }
  const [loading, setLoading]               = useState(true)
  const [busy, setBusy]                     = useState(false)
  const [error, setError]                   = useState(null)
  const [showReportPopup, setShowReportPopup] = useState(false)

  // Admin-only overview state
  const [onDuty, setOnDuty]           = useState([])
  const [weeklyHours, setWeeklyHours] = useState([])
  const [upcomingLeave, setUpcomingLeave] = useState([])
  const [pendingCount, setPendingCount]   = useState(0)
  const [adminLoading, setAdminLoading]   = useState(true)

  useEffect(()=>{
    supabase.auth.getSession().then(async ({data:{session}})=>{
      if(!session){window.location.href='/';return}
      setSession(session)
      await loadProfile(session.user.id)
      setLoading(false)
    })
  },[])

  useEffect(() => {
    if (!profile?.id) return
    const updateSeen = () => supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', profile.id)
    updateSeen()
    const interval = setInterval(updateSeen, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [profile?.id])

  useEffect(() => {
    if (!session?.user?.id || !profile) return
    if (profile.role === 'mod') {
      loadAttendance(session.user.id)
      setPage('home')
    } else if (profile.role === 'admin') {
      fetchAdminOverview()
      const firstAllowed = filterAdminNav(profile)?.[0]?.items?.[0]?.id
      setPage(hasPermission(profile,'dashboard') ? 'dashboard' : (firstAllowed || 'dashboard'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

  async function loadProfile(uid) {
    const {data}=await supabase.from('profiles').select('*').eq('id',uid).single()
    setProfile(data)
  }

  async function loadAttendance(uid) {
    const {data}=await supabase.from('attendance').select('*').eq('user_id',uid).is('clock_out',null).order('clock_in',{ascending:false}).limit(1).maybeSingle()
    setAttendance(data)
  }

  const fetchAdminOverview = useCallback(async () => {
    setAdminLoading(true)
    const now=new Date(), {monday}=getWeekRange()
    const today=toLocalISO(now)
    const in14=toLocalISO(new Date(Date.now()+14*86400000))
    const [{data:duty},{data:att},{data:leave},{data:pending},{data:profs}] = await Promise.all([
      supabase.from('attendance').select('id,clock_in,lunch_start,status,user_id,profiles(name,role,last_seen)').is('clock_out',null).order('clock_in'),
      supabase.from('attendance').select('clock_in,clock_out,user_id').gte('clock_in',monday.toISOString()).not('clock_out','is',null),
      supabase.from('vacation_requests').select('id,start_date,end_date,user_id').eq('status','approved').gte('start_date',today).lte('start_date',in14).order('start_date'),
      supabase.from('vacation_requests').select('id').eq('status','pending'),
      supabase.from('profiles').select('id,name,role'),
    ])
    const profileMap={}; (profs||[]).forEach(p=>{profileMap[p.id]=p})
    setOnDuty((duty||[]).filter(r=>profileMap[r.user_id]?.role!=='admin').map(r=>({...r,profiles:profileMap[r.user_id]})))
    const map={}
    ;(att||[]).forEach(row=>{
      const p=profileMap[row.user_id]
      if(!p||p.role==='admin') return
      const mins=Math.round((new Date(row.clock_out)-new Date(row.clock_in))/60000)
      if(!map[p.name]) map[p.name]={name:p.name,minutes:0}
      map[p.name].minutes+=mins
    })
    setWeeklyHours(Object.values(map).sort((a,b)=>b.minutes-a.minutes))
    setUpcomingLeave((leave||[]).filter(r=>profileMap[r.user_id]?.role!=='admin').map(r=>({...r,profiles:profileMap[r.user_id]})))
    setPendingCount(pending?.length||0)
    setAdminLoading(false)
  },[])

  useEffect(()=>{
    if(profile?.role!=='admin') return
    const ch=supabase.channel('admin-duty').on('postgres_changes',{event:'*',schema:'public',table:'attendance'},fetchAdminOverview).subscribe()
    return ()=>supabase.removeChannel(ch)
  },[profile?.role,fetchAdminOverview])

  async function handleAction(action) {
    if (action === 'clock_out') { setShowReportPopup(true); return }
    if (action === 'lunch_start') {
      const msg = lunchWindowError(attendance?.clock_in, profile?.shift)
      if (msg) { setError(msg); return }
    }
    if (action === 'lunch_start' || action === 'clock_in') unlockLunchAlerts()
    await doAction(action)
  }

  async function doAction(action) {
    setBusy(true); setError(null)
    try {
      const res = await fetch(`/api/attendance?action=${action}`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ user_id: session.user.id }),
      })
      const body = await res.json()
      if(!res.ok) throw new Error(body.error||'Error')
      await loadAttendance(session.user.id)
    } catch(e) { setError(e.message) }
    finally { setBusy(false) }
  }

  async function handleReportDone() {
    setShowReportPopup(false)
    await doAction('clock_out')
  }

  async function handleLogout() {
    await supabase.auth.signOut(); window.location.href='/'
  }

  if(loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0f1117',color:'#4a5568',fontFamily:'system-ui'}}>Loading…</div>

  const isAdmin = profile?.role === 'admin'
  const canSee = (sectionId) => hasPermission(profile, sectionId)

  // The page shown for each admin tab (tab ids are the permission ids)
  function renderAdminTab(id) {
    switch (id) {
      case 'dashboard':        return adminLoading ? <div style={{padding:40,color:'#4a5568'}}>Loading…</div> : <PageDashboard onDuty={onDuty} weeklyHours={weeklyHours} upcomingLeave={upcomingLeave} pendingCount={pendingCount} adminId={profile?.id}/>
      case 'approvals':        return <PageApprovals onCountChange={setPendingCount} adminId={profile?.id}/>
      case 'swapmanager':      return <PageSwapManager adminId={profile?.id}/>
      case 'moderators':       return <PageModerators adminId={profile?.id}/>
      case 'applications':     return <AdminPageApplications adminId={profile?.id}/>
      case 'calendar':         return <AdminPageCalendar/>
      case 'shifts':           return <PageShifts/>
      case 'vacationcal':      return <PageVacationCalendar/>
      case 'hours':            return <PageHours/>
      case 'attendance':       return <AdminPageAttendance/>
      case 'attendancereport': return <PageAttendanceReport/>
      case 'dailyreports':     return <PageDailyReports/>
      case 'reports':          return <PageReports/>
      case 'devreports':       return <AdminPageDevReports/>
      case 'announcements':    return <PageAnnouncements adminId={profile?.id}/>
      case 'agenda':           return <AdminPageMeetingAgenda adminId={profile?.id}/>
      default:                 return null
    }
  }

  return (
    <>
      <style>{`*{box-sizing:border-box}body{margin:0}input,select,textarea{color-scheme:dark}html,body{height:100%}#__next{height:100%}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      {showReportPopup && (
        <DailyReportPopup
          userId={session.user.id}
          attendanceId={attendance?.id}
          shift={profile?.shift}
          onClose={()=>setShowReportPopup(false)}
          onSubmit={handleReportDone}
        />
      )}
      {!isAdmin && <LunchReminder attendance={attendance} onEndLunch={()=>handleAction('lunch_end')}/>}
      {!isAdmin && <ShiftEndReminder attendance={attendance} shift={profile?.shift} hidden={showReportPopup} onClockOut={()=>handleAction('clock_out')}/>}
      <Layout profile={profile} page={page} setPage={goPage} onLogout={handleLogout}>
        {!isAdmin && (
          <>
            {page==='home'                        && <PageHome profile={profile} attendance={attendance} onAction={handleAction} busy={busy} error={error} userId={session?.user.id} onNavigate={setPage}/>}
            {page==='links'        && canSee('links')        && <PageLinks/>}
            {page==='attendance'   && canSee('attendance')   && <PageAttendance userId={session?.user.id}/>}
            {page==='vacation'     && canSee('vacation')     && <PageVacation userId={session?.user.id} profile={profile} onProfileRefresh={()=>loadProfile(session.user.id)}/>}
            {page==='swaps'        && canSee('swaps')        && <PageSwaps userId={session?.user.id} profile={profile}/>}
            {page==='calendar'     && canSee('calendar')     && <PageCalendar/>}
            {page==='profile'                                && <PageProfile userId={session?.user.id} profile={profile} onRefresh={()=>loadProfile(session.user.id)}/>}
            {page==='reports'      && canSee('reports')      && <PageMyReports userId={session?.user.id} profile={profile}/>}
            {page==='devreports'   && canSee('devreports')   && <PageDevReports userId={session?.user.id}/>}
            {page==='teamreports'  && canSee('teamreports')  && <PageTeamReports/>}
            {page==='applications' && canSee('applications') && <PageApplications userId={session?.user.id}/>}
            {page==='team'         && canSee('team')         && <PageTeam/>}
            {page==='agenda'       && canSee('agenda')       && <PageMeetingAgenda userId={session?.user.id} profile={profile}/>}
          </>
        )}
        {isAdmin && (
          <>
            {page==='adminprofile' && <AdminPageProfile userId={session?.user.id} profile={profile} onRefresh={()=>loadProfile(session.user.id)}/>}
            {(() => {
              const entry = filterAdminNav(profile).flatMap(g => g.items).find(i => i.id === page)
              if (!entry) return null
              return <AdminHub tabs={entry.tabs} tab={adminTab} setTab={setAdminTab} render={renderAdminTab}/>
            })()}
          </>
        )}
      </Layout>
    </>
  )
}
