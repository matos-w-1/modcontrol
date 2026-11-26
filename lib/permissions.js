// Central registry of the navigation menus for moderators and admins.

export const MOD_NAV_GROUPS = [
  { label: 'Overview',   items: [
    { id: 'home',  label: 'Dashboard',  icon: 'home' },
    { id: 'links', label: 'Work Links', icon: 'link' },
  ]},
  { label: 'Scheduling', items: [
    { id: 'attendance', label: 'Attendance', icon: 'clock' },
    { id: 'calendar',   label: 'Calendar',   icon: 'cal' },
  ]},
  { label: 'Requests',   items: [
    { id: 'vacation', label: 'Vacation Requests', icon: 'palm' },
    { id: 'swaps',    label: 'Shift Swaps',       icon: 'swap' },
  ]},
  { label: 'Reports',    items: [
    { id: 'reports',      label: 'My Reports',    icon: 'report' },
    { id: 'teamreports',  label: 'Team Reports',  icon: 'report' },
    { id: 'devreports',   label: 'Dev Reports',   icon: 'report' },
    { id: 'applications', label: 'Applications',  icon: 'report' },
  ]},
  { label: 'Team', items: [
    { id: 'team',   label: 'Team',            icon: 'mods' },
    { id: 'agenda', label: 'Meeting Agenda',  icon: 'report' },
  ]},
]

// The admin menu has one entry per area. Each entry groups related pages as tabs.
export const ADMIN_NAV = [
  { id: 'dashboard',     label: 'Dashboard',     icon: 'dash',   tabs: [{ id: 'dashboard', label: 'Dashboard' }] },
  { id: 'requests',      label: 'Requests',      icon: 'check',  tabs: [{ id: 'approvals', label: 'Pending' }, { id: 'swapmanager', label: 'Swap history' }] },
  { id: 'staff',         label: 'Team',          icon: 'mods',   tabs: [{ id: 'moderators', label: 'Moderators' }, { id: 'applications', label: 'Applications' }] },
  { id: 'schedule',      label: 'Schedule',      icon: 'cal',    tabs: [{ id: 'calendar', label: 'Calendar' }, { id: 'shifts', label: 'Shifts' }, { id: 'vacationcal', label: 'Vacations' }] },
  { id: 'attendancehub', label: 'Attendance',    icon: 'clock',  tabs: [{ id: 'hours', label: 'Hours' }, { id: 'attendance', label: 'Logs' }, { id: 'attendancereport', label: 'Report' }] },
  { id: 'reporthub',     label: 'Reports',       icon: 'report', tabs: [{ id: 'dailyreports', label: 'Daily' }, { id: 'reports', label: 'Reports' }, { id: 'devreports', label: 'Dev' }] },
  { id: 'comms',         label: 'Communication', icon: 'bell',   tabs: [{ id: 'announcements', label: 'Announcements' }, { id: 'agenda', label: 'Meeting agenda' }] },
]

// Kept as a single group so the sidebar code can render it like before.
export const ADMIN_NAV_GROUPS = [{ label: 'Menu', items: ADMIN_NAV }]

// Everyone who is logged in sees every page of their role: admins see the whole
// admin menu and moderators see the whole moderator menu. There is no per-person gating.
export function hasPermission(profile) {
  return !!profile
}

// Returns the admin menu filtered down to the entries (and tabs) this profile
// is allowed to see. Entries with no allowed tab are dropped.
export function filterAdminNav(profile) {
  return ADMIN_NAV_GROUPS
    .map(group => ({
      ...group,
      items: group.items
        .map(entry => ({ ...entry, tabs: entry.tabs.filter(t => hasPermission(profile, t.id)) }))
        .filter(entry => entry.tabs.length > 0),
    }))
    .filter(group => group.items.length > 0)
}

// Same idea for mods: 'home' always makes it through, everything
// else depends on profile.permissions.
export function filterModNav(profile) {
  return MOD_NAV_GROUPS
    .map(group => ({ ...group, items: group.items.filter(i => hasPermission(profile, i.id)) }))
    .filter(group => group.items.length > 0)
}
