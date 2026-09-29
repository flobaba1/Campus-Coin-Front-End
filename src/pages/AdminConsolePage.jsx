import { useEffect, useState } from 'react'
import { navigate } from '../routes/AppRoutes'
import Icon from '../components/Icon'
import Logo from '../components/Logo'
import {
  createAdminCategory,
  deleteAdminCategory,
  activateAdminUser,
  getAdminCategoryAnalytics,
  getAdminCategories,
  getAdminDailyActiveStudents,
  getAdminDailyTransactions,
  getAdminNotifications,
  getRecentAdminAuditLogs,
  getAdminUsers,
  createAdminNotification,
  deleteAdminNotification,
  suspendAdminUser,
  updateAdminNotification,
  updateAdminCategory,
} from '../api/adminApi'
import { clearAdminSession, getAdminSession, isAdminAuthenticated } from '../utils'
import '../styles/admin.css'

const defaultCategories = [
  ['Food', '18,492 entries', 'food', 'amber'],
  ['Transport', '12,904 entries', 'bus', 'blue'],
  ['Hostel / Rent', '8,120 entries', 'home', 'purple'],
  ['Academics', '6,840 entries', 'grad', 'teal'],
  ['Subscriptions', '5,402 entries', 'tv', 'pink'],
  ['Entertainment', '4,210 entries', 'ticket', 'peach'],
  ['Health', '3,084 entries', 'activity', 'mint'],
  ['Miscellaneous', '2,740 entries', 'folder', 'slate'],
]

const defaultIncomeCategories = [
  ['Allowance', 'Recurring student income', 'coins', 'mint'],
  ['Part-time Job', 'Work and shifts', 'briefcase', 'blue'],
  ['Scholarship', 'Awards and funding', 'grad', 'purple'],
  ['Gift', 'Family and gifts', 'gift', 'peach'],
  ['Refund', 'Refunds and reversals', 'refresh', 'teal'],
  ['Other income', 'Other sources', 'folder', 'slate'],
]

function AdminShell({ page, children }) {
  const [search, setSearch] = useState('')
  const [userCount, setUserCount] = useState(null)
  const [notification, setNotification] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, title: '3 new moderation events', time: 'Just now', read: false },
    { id: 2, title: '2 users need review', time: '18 minutes ago', read: false },
    { id: 3, title: 'Weekly usage report ready', time: '1 hour ago', read: true },
  ])
  const [admin, setAdmin] = useState(getAdminSession())
  const [interfaceScale, setInterfaceScale] = useState(1)
  const unreadNotifications = notifications.filter(item => !item.read).length
  useEffect(() => {
    if (!isAdminAuthenticated()) navigate('/admin/sign-in')
  }, [])

  useEffect(() => {
    let isCurrent = true

    async function loadUserCount() {
      try {
        const response = await getAdminUsers()
        const users = Array.isArray(response) ? response : response?.users
        if (isCurrent && Array.isArray(users)) setUserCount(users.length)
      } catch (error) {
        console.error('Unable to load user count for admin navigation:', error)
      }
    }

    loadUserCount()
    return () => { isCurrent = false }
  }, [])

  useEffect(() => {
    function handleAnnouncementAdded(event) {
      setNotifications(current => [{ id: Date.now(), title: `New announcement added: ${event.detail.title}`, time: 'Just now', read: false }, ...current])
    }
    window.addEventListener('admin-announcement-added', handleAnnouncementAdded)
    return () => window.removeEventListener('admin-announcement-added', handleAnnouncementAdded)
  }, [])

  function signOut() {
    clearAdminSession()
    navigate('/')
  }

  const nav = [
    ['Overview', 'grid', '/admin/overview'],
    ['Users', 'activity', '/admin/users'],
    ['Default Categories', 'tag', '/admin/categories'],
    ['Tips & Announcements', 'bulb', '/admin/announcements'],
  ]
  const currentPath = nav.find(item => item[0] === page)?.[2] || '/admin/overview'

  return <div className="admin-console-app" data-interface-scale={interfaceScale}>
    <aside className="admin-sidebar">
      <button className="admin-brand" onClick={() => navigate('/admin/overview')}><Logo/><span className="brand-dot"/></button>
      <div className="admin-side-label">ADMIN CONSOLE</div>
      <nav className="admin-nav">
        {nav.map(([label, icon, path]) => <button key={label} className={page === label ? 'active' : ''} onClick={() => navigate(path)}><Icon name={icon} size={17}/><span>{label}</span>{label === 'Users' && <b>{userCount === null ? '—' : userCount.toLocaleString()}</b>}</button>)}
      </nav>
      <div className="admin-side-label">SYSTEM</div>
      <button className="admin-nav-link" onClick={() => navigate('/')}><Icon name="logout" size={17}/><span>Exit console</span></button>
      <div className="admin-sidebar-spacer"/>
      <div className="admin-security-note"><Icon name="shield" size={15}/><span>Admin actions are logged and audited.</span></div>
      <button className="admin-profile" onClick={signOut}><span className="admin-avatar">{admin?.name?.slice(0,2).toUpperCase() || 'IS'}</span><span><strong>{admin?.name || 'Isreal'}</strong><small>Administrator</small></span><Icon name="logout" size={15}/></button>
    </aside>
    <main className="admin-main">
      <header className="admin-topbar">
        <div className="admin-crumb"><button className="admin-crumb-home" title="Admin overview" aria-label="Admin overview" onClick={() => navigate('/admin/overview')}><Icon name="home" size={14}/></button><span>›</span><button className="admin-crumb-page" onClick={() => navigate(currentPath)}>{page}</button></div>
        <div className="admin-top-actions">
          <div className="admin-search"><Icon name="search" size={14}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users, categories..."/><kbd>⌘K</kbd></div>
          <button className="admin-top-btn" title="Decrease interface size" aria-label="Decrease interface size" onClick={()=>setInterfaceScale(0.9)}>A</button><button className="admin-top-btn" title="Increase interface size" aria-label="Increase interface size" onClick={()=>setInterfaceScale(1.1)}>A</button>
          <div className="admin-notify-wrap"><button className="admin-top-btn" title="Notifications" aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ''}`} onClick={()=>setNotification(v=>!v)}><Icon name="bell" size={16}/>{unreadNotifications > 0 && <i>{unreadNotifications}</i>}</button>{notification&&<div className="admin-notification"><div className="admin-notification-head"><strong>Admin notifications</strong>{unreadNotifications > 0 && <button onClick={()=>setNotifications(items=>items.map(item=>({...item, read:true})))}>Mark all read</button>}</div>{notifications.map(item=><button className={`admin-notification-item ${item.read ? 'read' : ''}`} key={item.id} onClick={()=>setNotifications(items=>items.map(current=>current.id === item.id ? {...current, read:true} : current))}><span>{item.title}</span><small>{item.time}</small></button>)}</div>}</div>
          <span className="admin-top-avatar">{admin?.name?.slice(0,2).toUpperCase() || 'IS'}</span>
        </div>
      </header>
      {children}
    </main>
  </div>
}

function AdminFrame({ eyebrow, title, description, actions, children }) {
  return <section className="admin-content"><div className="admin-heading"><div><label>{eyebrow}</label><h1>{title}</h1><p>{description}</p></div><div className="admin-heading-actions">{actions}</div></div>{children}</section>
}

function Stat({ label, value, note, tone='' }) { return <div className="admin-stat"><span>{label}</span><strong className={tone}>{value}</strong><small>{note}</small></div> }

function MonthSelector() {
  const months = ['September 2026', 'August 2026', 'July 2026', 'June 2026', 'May 2026', 'April 2026', 'March 2026', 'February 2026', 'January 2026']
  const [selected, setSelected] = useState('September 2026')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    function handleClick(event) {
      if (!event.target.closest('.admin-date-picker')) setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return <div className={`admin-date-picker ${open ? 'open' : ''}`}>
    <button type="button" className="admin-date-picker__button" onClick={() => setOpen(v => !v)}>
      <span className="admin-date-picker__icon"><Icon name="calendar" size={14}/></span>
      <span>{selected}</span>
    </button>
    <button type="button" className="admin-date-picker__toggle" aria-label="Choose month" onClick={() => setOpen(v => !v)}>
      <Icon name="arrowdown" size={12}/>
    </button>
    {open && <div className="admin-date-picker__menu" role="listbox" aria-label="Select month">
      {months.map(month => <button key={month} type="button" className={month === selected ? 'active' : ''} onClick={() => { setSelected(month); setOpen(false) }}>{month}</button>)}
    </div>}
  </div>
}

function FilterDropdown({ label, value, options, icon, onChange }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    function handleClick(event) {
      if (!event.target.closest('.admin-filter')) setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return <div className={`admin-filter ${open ? 'open' : ''}`}>
    <button type="button" className="admin-filter__button" onClick={() => setOpen(v => !v)}>
      {icon && <span className="admin-filter__icon"><Icon name={icon} size={14}/></span>}
      <span>{value || label}</span>
      <span className="admin-filter__caret"><Icon name="arrowdown" size={12}/></span>
    </button>
    {open && <div className="admin-filter__menu" role="listbox" aria-label={label}>
      {options.map(option => <button key={option} type="button" className={option === value ? 'active' : ''} onClick={() => { onChange(option); setOpen(false) }}>{option}</button>)}
    </div>}
  </div>
}

function OverviewPage() {
  const [categoryAnalytics, setCategoryAnalytics] = useState([])
  const [categoryAnalyticsLoading, setCategoryAnalyticsLoading] = useState(true)
  const [categoryAnalyticsError, setCategoryAnalyticsError] = useState('')
  const [dailyActivity, setDailyActivity] = useState([])
  const [dailyActivityLoading, setDailyActivityLoading] = useState(true)
  const [dailyActivityError, setDailyActivityError] = useState('')
  const [dailyTransactions, setDailyTransactions] = useState([])
  const [dailyTransactionsLoading, setDailyTransactionsLoading] = useState(true)
  const [dailyTransactionsError, setDailyTransactionsError] = useState('')
  const [activeStudentCount, setActiveStudentCount] = useState(null)
  const [activeAccountCount, setActiveAccountCount] = useState(null)
  const [accountCount, setAccountCount] = useState(null)
  const [activeStudentsError, setActiveStudentsError] = useState(false)
  const [liveNotificationCount, setLiveNotificationCount] = useState(null)
  const [liveNotificationsError, setLiveNotificationsError] = useState(false)
  const [recentAuditLogs, setRecentAuditLogs] = useState([])
  const [auditLogsLoading, setAuditLogsLoading] = useState(true)
  const [auditLogsError, setAuditLogsError] = useState('')

  useEffect(() => {
    async function fetchCategoryAnalytics() {
      try {
        const response = await getAdminCategoryAnalytics(30)
        const entries = Array.isArray(response) ? response : []
        setCategoryAnalytics(entries.filter(entry =>
          entry?.categoryName && Number.isFinite(Number(entry.transactionCount)) && Number.isFinite(Number(entry.percentage))
        ))
        setCategoryAnalyticsError('')
      } catch (error) {
        console.error('Unable to load category analytics:', error)
        setCategoryAnalyticsError(error.message || 'Unable to load category analytics.')
      } finally {
        setCategoryAnalyticsLoading(false)
      }
    }

    fetchCategoryAnalytics()
  }, [])

  useEffect(() => {
    async function fetchActiveStudents() {
      try {
        const response = await getAdminUsers()
        const users = Array.isArray(response) ? response : response?.users
        const accountUsers = Array.isArray(users) ? users : []
        const isActive = user => {
          const status = String(user.status || user.accountStatus || user.userStatus || '').toUpperCase()
          const enabled = user.enabled ?? user.active ?? user.isActive
          return status ? status === 'ACTIVE' : enabled !== false
        }
        const activeUsers = accountUsers.filter(isActive)
        const activeStudents = activeUsers.filter(user => {
          const role = String(user.role || user.userRole || '').toUpperCase()
          return !role || role === 'STUDENT'
        })

        setActiveStudentCount(activeStudents.length)
        setActiveAccountCount(activeUsers.length)
        setAccountCount(accountUsers.length)
      } catch (error) {
        console.error('Unable to load active students for overview:', error)
        setActiveStudentsError(true)
      }
    }

    fetchActiveStudents()
  }, [])

  useEffect(() => {
    async function fetchLiveNotifications() {
      try {
        const response = await getAdminNotifications()
        const notifications = Array.isArray(response) ? response : []
        const now = Date.now()
        const liveCount = notifications.filter(notification => {
          const expiration = new Date(notification.validUntil).getTime()
          return Number.isFinite(expiration) && expiration > now
        }).length

        setLiveNotificationCount(liveCount)
      } catch (error) {
        console.error('Unable to load live notifications for overview:', error)
        setLiveNotificationsError(true)
      }
    }

    fetchLiveNotifications()
  }, [])

  useEffect(() => {
    async function fetchRecentAuditLogs() {
      try {
        const response = await getRecentAdminAuditLogs()
        setRecentAuditLogs(Array.isArray(response) ? response : [])
        setAuditLogsError('')
      } catch (error) {
        console.error('Unable to load recent admin audit logs:', error)
        setAuditLogsError(error.message || 'Unable to load recent activity.')
      } finally {
        setAuditLogsLoading(false)
      }
    }

    fetchRecentAuditLogs()
  }, [])

  useEffect(() => {
    async function fetchDailyActivity() {
      try {
        const response = await getAdminDailyActiveStudents(30)
        const entries = Array.isArray(response) ? response : []
        setDailyActivity(entries.filter(entry =>
          entry?.date && Number.isFinite(Number(entry.count))
        ))
        setDailyActivityError('')
      } catch (error) {
        console.error('Unable to load daily active-student analytics:', error)
        setDailyActivityError(error.message || 'Unable to load active-student analytics.')
      } finally {
        setDailyActivityLoading(false)
      }
    }

    fetchDailyActivity()
  }, [])

  useEffect(() => {
    async function fetchDailyTransactions() {
      try {
        const response = await getAdminDailyTransactions(14)
        const entries = Array.isArray(response) ? response : []
        setDailyTransactions(entries.filter(entry =>
          entry?.date && Number.isFinite(Number(entry.count))
        ))
        setDailyTransactionsError('')
      } catch (error) {
        console.error('Unable to load daily transaction analytics:', error)
        setDailyTransactionsError(error.message || 'Unable to load transaction analytics.')
      } finally {
        setDailyTransactionsLoading(false)
      }
    }

    fetchDailyTransactions()
  }, [])

  const activityAxisStep = Math.max(1, Math.ceil(Math.max(...dailyActivity.map(entry => Number(entry.count)), 0) / 4))
  const activityAxisMax = activityAxisStep * 4
  const activityPoints = dailyActivity.map((entry, index) => {
    const x = dailyActivity.length === 1 ? 310 : index * 620 / (dailyActivity.length - 1)
    const y = 205 - Number(entry.count) / activityAxisMax * 170
    return { x, y, date: entry.date }
  })
  const activityLinePath = activityPoints.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')
  const activityAreaPath = activityPoints.length
    ? `M 0 205 ${activityPoints.map(point => `L ${point.x} ${point.y}`).join(' ')} L 620 205 Z`
    : ''
  const activityDateTicks = [...new Set([0, Math.round((dailyActivity.length - 1) / 3), Math.round((dailyActivity.length - 1) * 2 / 3), dailyActivity.length - 1])]
    .filter(index => dailyActivity[index])
  const dailyTransactionMaximum = Math.max(...dailyTransactions.map(entry => Number(entry.count)), 0)
  const dailyTransactionTotal = dailyTransactions.reduce((total, entry) => total + Number(entry.count), 0)
  const transactionDateTicks = [...new Set([0, Math.round((dailyTransactions.length - 1) / 2), dailyTransactions.length - 1])]
    .filter(index => dailyTransactions[index])
  const formatAuditLogAge = createdAt => {
    const timestamp = new Date(createdAt).getTime()
    if (!Number.isFinite(timestamp)) return 'Time unavailable'

    const elapsedMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000))
    if (elapsedMinutes < 1) return 'Just now'
    if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`
    const elapsedHours = Math.floor(elapsedMinutes / 60)
    if (elapsedHours < 24) return `${elapsedHours}h ago`
    return `${Math.floor(elapsedHours / 24)}d ago`
  }

  return <AdminShell page="Overview"><AdminFrame eyebrow="ADMIN · OVERVIEW" title="Usage overview" description="System-wide activity across all student accounts. Figures exclude disabled users." actions={<MonthSelector/>}>
    <div className="admin-stat-grid">
      <Stat label="Active students" value={activeStudentCount === null ? '—' : activeStudentCount.toLocaleString()} note={activeStudentsError ? 'Unable to load count' : activeStudentCount === null ? 'Loading from accounts…' : 'Active student accounts'} />
      <Stat label="Active accounts" value={activeAccountCount === null ? '—' : activeAccountCount.toLocaleString()} note={activeStudentsError ? 'Unable to load count' : accountCount === null ? 'Loading from accounts…' : `${accountCount ? Math.round((activeAccountCount / accountCount) * 100) : 0}% of all accounts`} tone="green"/>
      <Stat label="Transactions" value={dailyTransactionsLoading || dailyTransactionsError ? '—' : dailyTransactionTotal.toLocaleString()} note={dailyTransactionsError ? 'Unable to load count' : dailyTransactionsLoading ? 'Loading transactions…' : 'Last 14 days'} />
      <Stat label="Live notifications" value={liveNotificationCount === null ? '—' : liveNotificationCount.toLocaleString()} note={liveNotificationsError ? 'Unable to load count' : liveNotificationCount === null ? 'Loading notifications…' : 'Not expired'} tone="green"/>
    </div>
    <div className="admin-overview-grid">
      <div className="admin-panel usage-panel"><div className="panel-head"><div><strong>Active students</strong><small>Daily active students · Last 30 days</small></div></div>{dailyActivityLoading ? <div className="admin-empty-state">Loading activity…</div> : dailyActivityError ? <div className="admin-empty-state" role="alert">{dailyActivityError}</div> : activityPoints.length ? <div className="area-chart"><div className="chart-y">{[4, 3, 2, 1, 0].map(step=><span key={step}>{(activityAxisStep * step).toLocaleString()}</span>)}</div><svg viewBox="0 0 620 210" preserveAspectRatio="none" role="img" aria-label="Daily active students over the last 30 days"><defs><linearGradient id="adminArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#107f55" stopOpacity=".25"/><stop offset="1" stopColor="#107f55" stopOpacity=".03"/></linearGradient></defs><path d={activityAreaPath} fill="url(#adminArea)"/><path d={activityLinePath} fill="none" stroke="#107f55" strokeWidth="2"/></svg><div className="chart-x">{activityDateTicks.map(index=><span key={dailyActivity[index].date}>{new Date(`${dailyActivity[index].date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>)}</div></div> : <div className="admin-empty-state">No daily activity data available.</div>}</div>
      <div className="admin-panel category-panel"><div className="panel-head"><div><strong>Most-used categories</strong><small>Share of transactions · Last 30 days</small></div><button type="button" onClick={() => navigate('/admin/categories')}>View all</button></div>{categoryAnalyticsLoading ? <div className="admin-empty-state">Loading category analytics…</div> : categoryAnalyticsError ? <div className="admin-empty-state" role="alert">{categoryAnalyticsError}</div> : categoryAnalytics.length ? categoryAnalytics.slice(0, 6).map(category=>{const percentage=Math.min(100,Math.max(0,Number(category.percentage))); const count=Number(category.transactionCount); const categoryName=category.categoryName; const tone=getCategoryTone(categoryName); return <div className="category-bar" key={categoryName} title={`${count.toLocaleString()} transactions`}><span>{categoryName}</span><div><i className={tone} style={{width:`${percentage}%`}}/></div><b>{percentage.toLocaleString(undefined,{maximumFractionDigits:1})}%</b></div>}) : <div className="admin-empty-state">No category transaction data available.</div>}</div>
      <div className="admin-panel transaction-chart"><div className="panel-head"><div><strong>Transactions per day</strong><small>Last 14 days</small></div><span>{dailyTransactionsLoading ? 'Loading…' : dailyTransactionsError ? 'Unavailable' : `${dailyTransactionTotal.toLocaleString()} total`}</span></div>{dailyTransactionsLoading ? <div className="admin-empty-state">Loading transactions…</div> : dailyTransactionsError ? <div className="admin-empty-state" role="alert">{dailyTransactionsError}</div> : dailyTransactions.length ? <><div className="bar-chart">{dailyTransactions.map(entry=>{const count=Number(entry.count); const height=dailyTransactionMaximum ? count / dailyTransactionMaximum * 100 : 0; return <i key={entry.date} title={`${new Date(`${entry.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${count.toLocaleString()} transactions`} aria-label={`${entry.date}: ${count} transactions`} style={{height:`${height}%`}}/>})}</div><div className="chart-x">{transactionDateTicks.map(index=><span key={dailyTransactions[index].date}>{new Date(`${dailyTransactions[index].date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>)}</div></> : <div className="admin-empty-state">No transaction data available.</div>}</div>
      <div className="admin-panel activity-panel"><div className="panel-head"><div><strong>Recent activity</strong><small>Latest admin events</small></div><span>Latest 4</span></div>{auditLogsLoading ? <div className="admin-empty-state">Loading recent activity…</div> : auditLogsError ? <div className="admin-empty-state" role="alert">{auditLogsError}</div> : recentAuditLogs.length ? recentAuditLogs.map((entry,index)=><div className="activity-row" key={entry.auditLogId}><span className={`activity-dot d${index % 4}`}/><div><strong>{entry.summary || entry.action || 'Admin activity'}</strong><small>{entry.actorName ? `Admin ID ${entry.actorName} · ` : ''}{formatAuditLogAge(entry.createdAt)}</small></div></div>) : <div className="admin-empty-state">No recent admin activity.</div>}</div>
    </div>
  </AdminFrame></AdminShell>
}

function getAcademicYearNumber(value) {
  const normalized = String(value || '').trim().toLowerCase()
  const levelMatch = normalized.match(/\b(?:level\s*)?(100|200|300|400)\s*(?:level|l)?\b/)
  if (levelMatch) return Number(levelMatch[1]) / 100

  const yearMatch = normalized.match(/\byear\s*([1-4])\b|\b([1-4])(?:st|nd|rd|th)?\s*year\b/)
  if (yearMatch) return Number(yearMatch[1] || yearMatch[2])

  const wordYearMatch = normalized.match(/\b(first|one|second|two|third|three|fourth|four)\b/)
  const wordYears = { first: 1, one: 1, second: 2, two: 2, third: 3, three: 3, fourth: 4, four: 4 }
  return wordYearMatch ? wordYears[wordYearMatch[1]] : null
}

function UsersPage() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selected, setSelected] = useState(null)
  const [suspendingUser, setSuspendingUser] = useState(false)
  const [activatingUser, setActivatingUser] = useState(null)
  const [suspendError, setSuspendError] = useState('')
  const [notice, setNotice] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [yearFilter, setYearFilter] = useState('Year 1–4')

  const statusOptions = ['All statuses', 'Active', 'Suspended', 'Pending']
  const yearOptions = ['Year 1–4', 'Year 1', 'Year 2', 'Year 3', 'Year 4']
  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await getAdminUsers()
        const data = Array.isArray(response) ? response : response?.users
        const rows = Array.isArray(data) ? data.map((user, index) => {
          const statusValue = String(user.status || user.accountStatus || user.userStatus || '').toUpperCase()
          const enabled = user.enabled ?? user.active ?? user.isActive
          const status = statusValue
            ? statusValue.includes('SUSPEND') || statusValue.includes('DISABLE')
              ? 'Suspended'
              : statusValue.charAt(0) + statusValue.slice(1).toLowerCase()
            : enabled === false ? 'Suspended' : 'Active'
          const createdAt = user.createdAt || user.created_at
          const joined = createdAt && !Number.isNaN(new Date(createdAt).getTime())
            ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—'
          const name = user.name || user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Unnamed user'
          const year = user.academicYear || user.profile?.academicYear || user.yearOfStudy || user.year || '—'

          return [name, user.email || '', joined, year, status, user.userId || user.id || user.email || index]
        }) : []

        setUsers(rows)
        setLoadError('')
      } catch (error) {
        setLoadError(error.message || 'Unable to load users from the backend.')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  const filtered = users.filter(u => {
    const matchesQuery = `${u[0]} ${u[1]}`.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = statusFilter === 'All statuses' || u[4] === statusFilter
    const selectedYear = Number(yearFilter.match(/\d+/)?.[0])
    const matchesYear = yearFilter === 'Year 1–4' || getAcademicYearNumber(u[3]) === selectedYear
    return matchesQuery && matchesStatus && matchesYear
  })

  async function activateAccount(user) {
    setActivatingUser(user[5])
    setLoadError('')
    try {
      await activateAdminUser(user[5])
      setUsers(current => current.map(item =>
        item[5] === user[5] ? [...item.slice(0, 4), 'Active', item[5]] : item
      ))
      setNotice(`${user[0]}'s account is now active.`)
    } catch (error) {
      setLoadError(error.message || 'Unable to activate this user.')
    } finally {
      setActivatingUser(null)
    }
  }

  async function suspendUser() {
    if (!selected) return

    const userToSuspend = selected
    setSuspendingUser(true)
    setSuspendError('')
    try {
      await suspendAdminUser(userToSuspend[5])
      setUsers(current => current.map(user =>
        user[5] === userToSuspend[5]
          ? [...user.slice(0, 4), 'Suspended', user[5]]
          : user
      ))
      setSelected(null)
      setLoadError('')
      setNotice(`${userToSuspend[0]}'s account was suspended.`)
    } catch (error) {
      setSuspendError(error.message || 'Unable to suspend this user.')
    } finally {
      setSuspendingUser(false)
    }
  }

  return <AdminShell page="Users"><AdminFrame eyebrow="ADMIN · USERS" title="User accounts" description="View, edit or disable student accounts. Transaction details stay private to each student." actions={<button className="admin-primary"><Icon name="download" size={14}/> Export list</button>}>
    <div className="admin-table-toolbar"><div className="admin-local-search"><Icon name="search" size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search users..."/></div><div className="admin-filter-group"><FilterDropdown label="All statuses" value={statusFilter} options={statusOptions} icon="filter" onChange={setStatusFilter}/><FilterDropdown label="Year 1–4" value={yearFilter} options={yearOptions} onChange={setYearFilter}/></div></div>
    {notice && <div className="admin-action-notice" role="status"><Icon name="check" size={15}/><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Dismiss notification"><Icon name="close" size={13}/></button></div>}
    {loadError && <div className="admin-action-notice" role="alert"><Icon name="info" size={15}/><span>{loadError}</span></div>}
    <div className="admin-panel user-table"><div className="user-head"><span>User</span><span>Joined</span><span>Academic year</span><span>Status</span><span>Actions</span></div>{loading ? <div className="admin-empty-state">Loading users…</div> : filtered.length ? filtered.map(u=><div className="user-row" key={u[5]}><div className="user-cell"><span className="user-mini-avatar">{u[0].split(' ').map(x=>x[0]).join('').slice(0,2)}</span><span><strong>{u[0]}</strong><small>{u[1]}</small></span></div><span>{u[2]}</span><span>{u[3]}</span><b className={`status ${u[4].toLowerCase()}`}>{u[4]}</b><div className="row-actions">{u[4] === 'Suspended' && <button title="Activate account" aria-label={`Activate ${u[0]}`} onClick={()=>activateAccount(u)} disabled={activatingUser === u[5]}><Icon name="circlecheck" size={14}/></button>}{u[4] !== 'Suspended' && u[4] !== 'Deactivated' && <button title="Suspend account" aria-label={`Suspend ${u[0]}`} onClick={()=>{setSuspendError(''); setSelected(u)}}><Icon name="ban" size={14}/></button>}</div></div>) : <div className="admin-empty-state">{loadError ? 'Users could not be loaded.' : 'No users match your filters.'}</div>}</div>
    <div className="admin-table-footer"><div><button>‹</button><b>1</b><button>2</button><button>3</button><button>›</button></div></div>
    <div className="admin-info-banner"><Icon name="lock" size={15}/><span>Admins can see account details and activity counts, never individual transactions or notes. Every action here is written to the audit log.</span></div>
    {selected && <DisableModal user={selected} onClose={()=>setSelected(null)} onConfirm={suspendUser} submitting={suspendingUser} error={suspendError}/>} 
  </AdminFrame></AdminShell>
}

function DisableModal({ user, onClose, onConfirm, submitting, error }) {
  return <div className="admin-modal-backdrop"><div className="disable-modal"><div className="modal-warning"><Icon name="ban" size={20}/></div><h2>Suspend {user[0]}?</h2><p>This user will be unable to access their account until it is reactivated.</p>{error && <div className="admin-action-notice" role="alert"><Icon name="info" size={15}/><span>{error}</span></div>}<div className="disable-actions"><button type="button" onClick={onClose} disabled={submitting}>Cancel</button><button className="danger-btn" type="button" onClick={onConfirm} disabled={submitting}><Icon name="ban" size={14}/> {submitting ? 'Suspending…' : 'Suspend account'}</button></div></div></div>
}

function CategoriesAdminPage() {
  const [categories, setCategories] = useState([])
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [name, setName] = useState('')
  const [newType, setNewType] = useState('EXPENSE')
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('EXPENSE')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const getCategoryId = category => category?.categoryId || category?.id || category?.category_id

  async function loadCategories() {
    try {
      setLoading(true)
      const data = await getAdminCategories()
      setCategories(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      setError(err.message || 'Unable to load categories from the backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const expenseCategories = categories.filter(category => String(category.type).toUpperCase() === 'EXPENSE')
  const incomeCategories = categories.filter(category => String(category.type).toUpperCase() === 'INCOME')

  async function addCategory(e) {
    e.preventDefault()

    if (!name.trim()) return

    try {
      setSubmitting(true)
      const payload = {
        name: name.trim(),
        type: newType.toUpperCase(),
      }

      const created = await createAdminCategory(payload)
      setCategories(current => [created, ...current])
      setName('')
      setNewType('EXPENSE')
      setAdding(false)
      setError('')
    } catch (err) {
      setError(err.message || 'Unable to create category.')
    } finally {
      setSubmitting(false)
    }
  }

  async function saveEditedCategory(e) {
    e.preventDefault()

    if (!editing) return

    try {
      setSubmitting(true)
      const categoryId = getCategoryId(editing)
      const payload = {
        name: editName.trim(),
        type: editType.toUpperCase(),
      }

      const updated = await updateAdminCategory(categoryId, payload)
      setCategories(current =>
        current.map(category => (getCategoryId(category) === categoryId ? { ...category, ...updated } : category))
      )
      setEditing(null)
      setEditName('')
      setEditType('EXPENSE')
      setError('')
    } catch (err) {
      setError(err.message || 'Unable to update category.')
    } finally {
      setSubmitting(false)
    }
  }

  async function removeCategory() {
    if (!deleting) return

    try {
      setSubmitting(true)
      const categoryId = getCategoryId(deleting)
      await deleteAdminCategory(categoryId)
      setCategories(current => current.filter(category => getCategoryId(category) !== categoryId))
      setDeleting(null)
      setError('')
    } catch (err) {
      setError(err.message || 'Unable to delete category.')
    } finally {
      setSubmitting(false)
    }
  }

  return <AdminShell page="Default Categories"><AdminFrame eyebrow="ADMIN · TAXONOMY" title="Default categories" description="Available to every student. Changes apply to new entries; past entries keep their category." actions={<button className="admin-primary" onClick={()=>setAdding(true)}><Icon name="plus" size={14}/> Add category</button>}>
    {error && <div className="admin-action-notice" role="alert"><Icon name="info" size={15}/><span>{error}</span><button onClick={()=>setError('')} aria-label="Dismiss error"><Icon name="close" size={13}/></button></div>}

    {loading ? (
      <div className="admin-panel"><div className="panel-head"><div><strong>Loading categories…</strong><small>Please wait</small></div></div></div>
    ) : (
      <div className="category-admin-grid">
        <div className="admin-panel category-admin-card">
          <div className="panel-head"><div><strong>Expense</strong><small>{expenseCategories.length} default categories</small></div></div>
          {expenseCategories.length ? expenseCategories.map(category => <AdminCategoryRow key={getCategoryId(category)} c={category} onEdit={()=>{ setEditing(category); setEditName(category.name); setEditType(String(category.type).toUpperCase()) }} onDelete={()=>setDeleting(category)} />) : <div className="admin-empty-state">No expense categories yet.</div>}
        </div>

        <div className="admin-panel category-admin-card">
          <div className="panel-head"><div><strong>Income</strong><small>{incomeCategories.length} default categories</small></div></div>
          {incomeCategories.length ? incomeCategories.map(category => <AdminCategoryRow key={getCategoryId(category)} c={category} onEdit={()=>{ setEditing(category); setEditName(category.name); setEditType(String(category.type).toUpperCase()) }} onDelete={()=>setDeleting(category)} />) : <div className="admin-empty-state">No income categories yet.</div>}
        </div>
      </div>
    )}

    <div className="admin-info-banner category-delete-note"><Icon name="info" size={15}/><span><strong>Deleting a default category</strong><small>Entries using it move to Miscellaneous or Other Income. Students are told in-app. Consider hiding it instead.</small></span></div>

    {adding && <div className="admin-inline-modal"><form onSubmit={addCategory}><div><strong>New default category</strong><button type="button" onClick={()=>setAdding(false)} aria-label="Close add category"><Icon name="close" size={15}/></button></div><label>Category name<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Campus events"/></label><label>Type<select value={newType} onChange={e=>setNewType(e.target.value)}><option value="EXPENSE">Expense</option><option value="INCOME">Income</option></select></label><div><button className="admin-primary" type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create category'}</button></div></form></div>}

    {editing && <div className="admin-inline-modal"><form onSubmit={saveEditedCategory}><div><strong>Edit category</strong><button type="button" onClick={()=>setEditing(null)} aria-label="Close edit category"><Icon name="close" size={15}/></button></div><label>Category name<input autoFocus value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Category name"/></label><label>Type<select value={editType} onChange={e=>setEditType(e.target.value)}><option value="EXPENSE">Expense</option><option value="INCOME">Income</option></select></label><div><button className="admin-primary" type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save changes'}</button></div></form></div>}

    {deleting && <DeleteCategoryModal category={deleting} type={String(deleting.type).toUpperCase() === 'EXPENSE' ? 'Expense' : 'Income'} onClose={()=>setDeleting(null)} onConfirm={removeCategory}/>} 
  </AdminFrame></AdminShell>
}

function getCategoryIcon(name, type) {
  const normalized = String(name || '').toLowerCase()
  const categoryType = String(type || '').toLowerCase()

  if (normalized.includes('food')) return 'food'
  if (normalized.includes('transport')) return 'bus'
  if (normalized.includes('entertain')) return 'ticket'
  if (normalized.includes('school') || normalized.includes('education') || normalized.includes('academ')) return 'grad'
  if (normalized.includes('bill') || normalized.includes('utility') || normalized.includes('rent') || normalized.includes('hostel')) return 'home'
  if (normalized.includes('subscription') || normalized.includes('media')) return 'tv'
  if (normalized.includes('allowance') || normalized.includes('freelance') || normalized.includes('part-time') || normalized.includes('gift') || normalized.includes('income')) return 'coins'
  if (normalized.includes('scholar')) return 'grad'
  if (normalized.includes('refund')) return 'refresh'
  if (normalized.includes('misc') || normalized.includes('other')) return 'folder'
  if (normalized.includes('health')) return 'activity'
  if (normalized.includes('saving')) return 'wallet'
  if (normalized.includes('shopping')) return 'bag'

  return categoryType === 'income' ? 'coins' : 'tag'
}

function getCategoryTone(name, type) {
  const normalized = String(name || '').toLowerCase()

  if (normalized.includes('food')) return 'amber'
  if (normalized.includes('transport')) return 'blue'
  if (normalized.includes('rent') || normalized.includes('hostel')) return 'purple'
  if (normalized.includes('school') || normalized.includes('education') || normalized.includes('academ')) return 'teal'
  if (normalized.includes('subscription') || normalized.includes('media')) return 'pink'
  if (normalized.includes('entertain')) return 'peach'
  if (normalized.includes('health') || normalized.includes('saving')) return 'mint'
  if (normalized.includes('misc') || normalized.includes('other')) return 'slate'
  if (normalized.includes('allowance') || normalized.includes('freelance') || normalized.includes('part-time') || normalized.includes('gift') || normalized.includes('scholar') || normalized.includes('income')) return 'mint'

  return String(type || '').toLowerCase() === 'income' ? 'mint' : 'slate'
}

function AdminCategoryRow({ c, onEdit, onDelete }) {
  const isDefault = Boolean(c.defaultCategory)
  const categoryName = c.name || 'Unnamed category'
  const tone = getCategoryTone(categoryName, c.type)

  return <div className="admin-category-row"><span className={`admin-cat-icon ${tone}`}><Icon name={getCategoryIcon(categoryName, c.type)} size={15}/></span><span><strong>{categoryName}</strong><small>{isDefault ? 'Default category' : 'Custom category'}</small></span><b className={isDefault ? '' : 'category-hidden'}>{isDefault ? 'Default' : 'Custom'}</b><button title="Edit category" onClick={onEdit}><Icon name="edit" size={13}/></button><button className="danger-icon" title="Delete category" onClick={onDelete}><Icon name="trash" size={13}/></button></div>
}

function DeleteCategoryModal({ category, type, onClose, onConfirm }) {
  const destination = type === 'Expense' ? 'Miscellaneous' : 'Other Income'
  const categoryName = category?.name || category?.categoryName || 'this category'

  return <div className="admin-modal-backdrop"><div className="disable-modal delete-category-modal"><div className="modal-warning"><Icon name="trash" size={20}/></div><h2>Delete {categoryName}?</h2><p>Entries using it move to {destination}. Students are told in-app. Consider hiding it instead.</p><div className="disable-actions"><button onClick={onClose}>Cancel</button><button className="danger-btn" onClick={onConfirm}><Icon name="trash" size={14}/> Delete category</button></div></div></div>
}

function getDefaultNotificationExpiry() {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

function AnnouncementsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [previewing, setPreviewing] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState('Food')
  const [validUntil, setValidUntil] = useState(getDefaultNotificationExpiry)
  const [type, setType] = useState('GENERAL')
  const [status, setStatus] = useState('UNREAD')
  const [recipientId, setRecipientId] = useState('')
  const [placement, setPlacement] = useState('Tips')
  const categoryOptions = ['Food', 'Transport', 'Academics', 'Campus news']
  const categoryIcon = { Food: 'food', Transport: 'bus', Academics: 'grad', 'Campus news': 'bulb' }
  const [templateFilter, setTemplateFilter] = useState('All notifications')
  const templateFilterOptions = ['All notifications', 'Tips', 'Announcement']

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await getAdminNotifications()
        const notifications = Array.isArray(response) ? response : []
        setItems(notifications.sort((first, second) =>
          new Date(second.createdAt || 0) - new Date(first.createdAt || 0)
        ))
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load notifications.')
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [])

  const visibleItems = items.filter(item => {
    if (templateFilter === 'All notifications') return true
    if (templateFilter === 'Tips') {
      const itemPlacement = String(item.placement || '').toLowerCase()
      return itemPlacement.includes('tip') || itemPlacement.includes('saving')
    }
    if (templateFilter === 'Announcement') {
      const itemPlacement = String(item.placement || '').toLowerCase()
      return itemPlacement.includes('announcement') || itemPlacement === 'notification' || itemPlacement === 'dashboard insight'
    }
    return item.validUntil && new Date(item.validUntil) < new Date()
  })

  function startNewAnnouncement() {
    setEditingId(null)
    setTitle('')
    setMessage('')
    setCategory('')
    setValidUntil(getDefaultNotificationExpiry())
    setType('GENERAL')
    setStatus('UNREAD')
    setRecipientId('')
    setPlacement('Tips')
    setError('')
    setEditing(true)
  }

  function editNotification(notification) {
    setEditingId(notification.notificationId)
    setTitle(notification.title || '')
    setMessage(notification.message || '')
    setCategory(notification.category || '')
    setValidUntil(notification.validUntil?.slice(0, 16) || getDefaultNotificationExpiry())
    setType(notification.type || 'GENERAL')
    setStatus(notification.status || 'UNREAD')
    setRecipientId(notification.recipientId || '')
    const savedPlacement = String(notification.placement || '').toLowerCase()
    setPlacement(savedPlacement.includes('tip') || savedPlacement.includes('saving') ? 'Tips' : 'Announcement')
    setError('')
    setEditing(true)
  }

  async function saveTemplate() {
    if (!title.trim() || !message.trim() || !validUntil || !placement.trim()) {
      setError('Title, message, expiration date, and placement are required.')
      return
    }
    if (new Date(validUntil) <= new Date()) {
      setError('Expiration date must be in the future.')
      return
    }

    const payload = {
      title: title.trim(),
      message: message.trim(),
      validUntil,
      type,
      placement: placement.trim(),
      category: category || null,
      status,
      recipientId: recipientId.trim() || null,
    }

    setSubmitting(true)
    setError('')
    try {
      if (editingId) {
        const updated = await updateAdminNotification(editingId, payload)
        setItems(current => current.map(item => item.notificationId === editingId ? updated : item))
        setNotice('Notification updated.')
      } else {
        const created = await createAdminNotification(payload)
        setItems(current => [created, ...current])
        window.dispatchEvent(new CustomEvent('admin-announcement-added', { detail: { title: created.title } }))
        setNotice('Notification created.')
      }
      setEditing(false)
      setEditingId(null)
      setTitle('')
      setMessage('')
      setCategory('')
      setValidUntil(getDefaultNotificationExpiry())
      setType('GENERAL')
      setStatus('UNREAD')
      setRecipientId('')
      setPlacement('Tips')
    } catch (saveError) {
      setError(saveError.message || 'Unable to save notification.')
    } finally {
      setSubmitting(false)
    }
  }

  async function removeNotification() {
    if (!deleting) return
    setSubmitting(true)
    setError('')
    try {
      await deleteAdminNotification(deleting.notificationId)
      setItems(current => current.filter(item => item.notificationId !== deleting.notificationId))
      setNotice('Notification deleted.')
      setDeleting(null)
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete notification.')
    } finally {
      setSubmitting(false)
    }
  }

  return <AdminShell page="Tips & Announcements"><AdminFrame eyebrow="ADMIN · CONTENT" title="Tips & announcements" description="Templates for the saving-tips engine and campus-wide messages." actions={<><button className="admin-btn" onClick={()=>setPreviewing(true)}>Preview</button><button className="admin-primary" onClick={startNewAnnouncement}><Icon name="plus" size={14}/> New announcement</button></>}>
    {notice && <div className="admin-action-notice" role="status"><Icon name="check" size={15}/><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Dismiss notification"><Icon name="close" size={13}/></button></div>}
    {error && <div className="admin-action-notice" role="alert"><Icon name="info" size={15}/><span>{error}</span><button onClick={()=>setError('')} aria-label="Dismiss error"><Icon name="close" size={13}/></button></div>}
    <div className="announcement-layout"><div className="admin-panel announcement-list"><div className="panel-head"><div><strong>Notifications</strong><small>{loading ? 'Loading notifications…' : `${visibleItems.length} of ${items.length} notifications`}</small></div><FilterDropdown label="All notifications" value={templateFilter} options={templateFilterOptions} icon="filter" onChange={setTemplateFilter}/></div>{loading ? <div className="admin-empty-state">Loading notifications…</div> : visibleItems.length ? visibleItems.map(item=>{const itemCategory=item.category || ''; const notificationType=String(item.type || 'GENERAL').toLowerCase(); const notificationTypeLabel=notificationType === 'user' ? 'User' : notificationType === 'admin' ? 'Admin' : 'General'; const placement=String(item.placement || 'Notification'); const placementClass=placement.toLowerCase().replace(/[^a-z0-9]+/g,'-'); const expirationDate=item.validUntil ? new Date(item.validUntil) : null; const expired=expirationDate && expirationDate < new Date(); const expirationText=expirationDate ? `${expired ? 'Expired' : 'Expires'} ${expirationDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}` : 'No expiration'; return <div className="announcement-row" key={item.notificationId}><div className="announcement-icon"><Icon name={categoryIcon[itemCategory] || 'bulb'} size={15}/></div><div className="announcement-copy"><div className="notification-meta"><span className={`notification-type ${notificationType}`}>{notificationTypeLabel}</span><span className={`notification-placement ${placementClass}`}>{placement}</span><span className={`notification-expiry ${expired ? 'expired' : 'valid'}`}>{expirationText}</span></div><strong>{item.title}</strong><small>{item.message}</small></div><span className={`notification-status ${String(item.status || 'NA').toLowerCase()}`}>{item.status || 'NA'}</span><button title="Edit notification" aria-label={`Edit ${item.title}`} onClick={()=>editNotification(item)}><Icon name="edit" size={14}/></button><button title="Delete notification" aria-label={`Delete ${item.title}`} onClick={()=>setDeleting(item)}><Icon name="trash" size={14}/></button></div>}) : <div className="admin-empty-state">No notifications match this filter.</div>}</div>
      <div className="admin-panel announcement-editor">
        <div className="panel-head"><div><strong>{editing ? editingId ? 'Edit notification' : 'New notification' : 'Notification editor'}</strong><small>Student-facing content</small></div><span>Live preview</span></div>
        <label>Title<input value={title} onChange={e=>setTitle(e.target.value)} maxLength={255} placeholder="e.g. September spending tip"/></label>
        <label>Message<textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Write the message students will see..."/></label>
        <div className="editor-grid">
          <label>Type<select value={type} onChange={e=>setType(e.target.value)}><option value="GENERAL">General</option><option value="USER">User</option><option value="ADMIN">Admin</option></select></label>
          <label>Status<select value={status} onChange={e=>setStatus(e.target.value)}><option value="UNREAD">Unread</option><option value="READ">Read</option><option value="NA">Not applicable</option></select></label>
        </div>
        <div className="editor-grid">
          <label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option value="">No category</option>{categoryOptions.map(option=><option key={option}>{option}</option>)}</select></label>
          <label>Placement<select value={placement} onChange={e=>setPlacement(e.target.value)}><option value="Announcement">Announcement</option><option value="Tips">Tips</option></select></label>
        </div>
        <label>Valid until<input type="datetime-local" value={validUntil} onChange={e=>setValidUntil(e.target.value)}/></label>
        <label>Recipient ID <small>(optional; leave blank for all recipients)</small><input value={recipientId} onChange={e=>setRecipientId(e.target.value)} maxLength={36} placeholder="Recipient UUID"/></label>
        <div className="editor-preview"><span><Icon name={categoryIcon[category] || 'bulb'} size={12}/> {(category || type).toUpperCase()}</span><strong>{title || 'Your announcement title'}</strong><p>{message || 'Your message will appear here.'}</p></div>
        <button className="admin-primary" onClick={saveTemplate} disabled={submitting}>{submitting ? 'Saving…' : editingId ? 'Save changes' : 'Create notification'}</button>
        {editing && <button className="admin-btn" type="button" onClick={()=>{setEditing(false);setEditingId(null);setError('')}} disabled={submitting}>Cancel editing</button>}
      </div>
    </div>
      {previewing && <div className="admin-modal-backdrop"><div className="disable-modal announcement-preview-modal"><div className="panel-head"><div><strong>Student preview</strong><small>How this message appears to students</small></div><button type="button" onClick={()=>setPreviewing(false)} aria-label="Close preview"><Icon name="close" size={15}/></button></div><div className="editor-preview"><span><Icon name={categoryIcon[category] || 'bulb'} size={12}/> {(category || type).toUpperCase()}</span><strong>{title || 'Your announcement title'}</strong><p>{message || 'Your message will appear here.'}</p></div><div className="disable-actions"><button onClick={()=>setPreviewing(false)}>Close preview</button></div></div></div>}
      {deleting && <div className="admin-modal-backdrop"><div className="disable-modal"><div className="modal-warning"><Icon name="trash" size={20}/></div><h2>Delete notification?</h2><p>This permanently deletes “{deleting.title}”. This action cannot be undone.</p><div className="disable-actions"><button type="button" onClick={()=>setDeleting(null)} disabled={submitting}>Cancel</button><button className="danger-btn" type="button" onClick={removeNotification} disabled={submitting}><Icon name="trash" size={14}/>{submitting ? ' Deleting…' : ' Delete notification'}</button></div></div></div>}
  </AdminFrame></AdminShell>
}

export default function AdminConsolePage({ type='overview' }) {
  const map = { overview: OverviewPage, users: UsersPage, categories: CategoriesAdminPage, announcements: AnnouncementsPage }
  const Page = map[type] || OverviewPage
  return <Page/>
}
