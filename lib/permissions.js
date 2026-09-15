// Central registry of navigation sections and permission logic.
// Mod sections are always visible to role='mod' users.
// Admin sections are only shown to role='admin' users who either
// have is_super_admin=true, or have the section's id in their
// profiles.permissions array.

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
    { id: 'vip',    label: 'VIP Users',       icon: 'mods' },
  ]},
]

export const ADMIN_NAV_GROUPS = [
  { label: 'Overview', items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dash' },
  ]},
  { label: 'Management', items: [
    { id: 'approvals',    label: 'Approvals',    icon: 'check' },
    { id: 'moderators',   label: 'Moderators',   icon: 'mods' },
    { id: 'applications', label: 'Applications', icon: 'check' },
  ]},
  { label: 'Attendance', items: [
    { id: 'hours',            label: 'Hours & Attendance', icon: 'clock' },
    { id: 'attendance',       label: 'Attendance Logs',    icon: 'clock' },
    { id: 'attendancereport', label: 'Attendance Report',  icon: 'report' },
  ]},
  { label: 'Calendar', items: [
    { id: 'calendar',     label: 'Calendar',          icon: 'cal' },
    { id: 'shifts',       label: 'Shift Schedule',    icon: 'shifts' },
    { id: 'vacationcal',  label: 'Vacation Calendar', icon: 'cal' },
    { id: 'swapmanager',  label: 'Swap Manager',      icon: 'swap' },
  ]},
  { label: 'Communication', items: [
    { id: 'announcements', label: 'Announcements', icon: 'bell' },
    { id: 'agenda',        label: 'Meeting Agenda', icon: 'bell' },
  ]},
  { label: 'Reports', items: [
    { id: 'reports',      label: 'Reports',       icon: 'report' },
    { id: 'dailyreports', label: 'Daily Reports', icon: 'report' },
    { id: 'devreports',   label: 'Dev Reports',   icon: 'report' },
  ]},
]

// Flat list of every gate-able admin section, used to render the
// permissions-management checkboxes.
export const ADMIN_SECTIONS = ADMIN_NAV_GROUPS.flatMap(g =>
  g.items.map(i => ({ id: i.id, label: i.label, group: g.label }))
)

// Mod sections a super-admin can toggle per moderator. 'home' is
// intentionally excluded here — it's always visible (see
// ALWAYS_VISIBLE_MOD_SECTIONS) so a mod with nothing assigned yet
// still has somewhere to land after logging in.
export const ALWAYS_VISIBLE_MOD_SECTIONS = ['home']

export const MOD_SECTIONS = MOD_NAV_GROUPS.flatMap(g =>
  g.items
    .filter(i => !ALWAYS_VISIBLE_MOD_SECTIONS.includes(i.id))
    .map(i => ({ id: i.id, label: i.label, group: g.label }))
)

export function hasPermission(profile, sectionId) {
  if (!profile) return false
  if (ALWAYS_VISIBLE_MOD_SECTIONS.includes(sectionId) && profile.role === 'mod') return true
  if (profile.is_super_admin) return true
  return Array.isArray(profile.permissions) && profile.permissions.includes(sectionId)
}

// Returns ADMIN_NAV_GROUPS filtered down to only the sections this
// profile is allowed to see (empty groups are dropped).
export function filterAdminNav(profile) {
  return ADMIN_NAV_GROUPS
    .map(group => ({ ...group, items: group.items.filter(i => hasPermission(profile, i.id)) }))
    .filter(group => group.items.length > 0)
}

// Same idea for mods: 'home' always makes it through, everything
// else depends on profile.permissions.
export function filterModNav(profile) {
  return MOD_NAV_GROUPS
    .map(group => ({ ...group, items: group.items.filter(i => hasPermission(profile, i.id)) }))
    .filter(group => group.items.length > 0)
}
