import { useEffect, useState } from 'react'
import { navigate } from '../routes/AppRoutes'
import Icon from '../components/Icon'
import Logo from '../components/Logo'
import { clearAdminSession, getAdminSession, isAdminAuthenticated } from '../utils'
import '../styles/admin.css'

const adminUsers = [
  ['Amaka Davis', 'amaka.davis@campus.edu', 'Sep 23, 2026', 'Year 2', 'Active'],
  ['Chinedu Okafor', 'chinedu.okafor@campus.edu', 'Sep 22, 2026', 'Year 3', 'Active'],
  ['Maya Williams', 'maya.williams@campus.edu', 'Sep 20, 2026', 'Year 1', 'Active'],
  ['Daniel Cole', 'daniel.cole@campus.edu', 'Sep 19, 2026', 'Year 4', 'Suspended'],
  ['Fatima Bello', 'fatima.bello@campus.edu', 'Sep 18, 2026', 'Year 2', 'Active'],
  ['Samuel Adeyemi', 'samuel.adeyemi@campus.edu', 'Sep 17, 2026', 'Year 3', 'Active'],
  ['Grace Mensah', 'grace.mensah@campus.edu', 'Sep 16, 2026', 'Year 1', 'Active'],
  ['David Clark', 'david.clark@campus.edu', 'Sep 14, 2026', 'Year 2', 'Active'],
]

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

const announcements = [
  ['September finance tips', 'Help students review spending before month end.', 'Published', true],
  ['Tips: food delivery', 'A short guide to keeping Food budgets on track.', 'Published', true],
  ['AI insight notice', 'Explain how advisory AI insights are generated.', 'Published', true],
  ['CSV import update', 'A small reminder about supported import columns.', 'Draft', false],
]

function AdminShell({ page, children }) {
  const [search, setSearch] = useState('')
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
        {nav.map(([label, icon, path]) => <button key={label} className={page === label ? 'active' : ''} onClick={() => navigate(path)}><Icon name={icon} size={17}/><span>{label}</span>{label === 'Users' && <b>9.8k</b>}</button>)}
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
  return <AdminShell page="Overview"><AdminFrame eyebrow="ADMIN · OVERVIEW" title="Usage overview" description="System-wide activity across all student accounts. Figures exclude disabled users." actions={<><MonthSelector /><button className="admin-primary"><Icon name="download" size={14}/> Export CSV</button></>}>
    <div className="admin-stat-grid"><Stat label="Active students" value="14,208" note="+6.4% vs Aug"/><Stat label="Active accounts" value="9,842" note="69.3% of students" tone="green"/><Stat label="Transactions" value="507,615" note="+12.8% vs Aug"/><Stat label="AI suggestions accepted" value="91%" note="of reviewed suggestions" tone="green"/></div>
    <div className="admin-overview-grid">
      <div className="admin-panel usage-panel"><div className="panel-head"><div><strong>Active students</strong><small>Daily active students · September</small></div><button>Last 30 days⌄</button></div><div className="area-chart"><div className="chart-y"><span>16k</span><span>12k</span><span>8k</span><span>4k</span><span>0</span></div><svg viewBox="0 0 620 210" preserveAspectRatio="none"><defs><linearGradient id="adminArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#107f55" stopOpacity=".25"/><stop offset="1" stopColor="#107f55" stopOpacity=".03"/></linearGradient></defs><path d="M0 150 C65 128 100 135 150 126 S250 140 300 126 S380 128 430 105 S510 78 620 44 L620 205 L0 205Z" fill="url(#adminArea)"/><path d="M0 150 C65 128 100 135 150 126 S250 140 300 126 S380 128 430 105 S510 78 620 44" fill="none" stroke="#107f55" strokeWidth="2"/></svg><div className="chart-x"><span>Sep 1</span><span>Sep 8</span><span>Sep 15</span><span>Sep 23</span></div></div></div>
      <div className="admin-panel category-panel"><div className="panel-head"><div><strong>Most-used categories</strong><small>Share of all transactions</small></div><button>View all</button></div>{[['Food','36%','amber'],['Transport','19%','blue'],['Academics','14%','teal'],['Hostel/Rent','12%','purple'],['Subscriptions','9%','pink'],['Entertainment','6%','peach']].map(([x,p,t])=><div className="category-bar" key={x}><span>{x}</span><div><i className={t} style={{width:p}}/></div><b>{p}</b></div>)}</div>
      <div className="admin-panel transaction-chart"><div className="panel-head"><div><strong>Transactions per day</strong><small>Last 14 days</small></div><span>507,615 total</span></div><div className="bar-chart">{[32,46,55,49,63,78,58,71,84,91,72,87,68,77].map((h,i)=><i key={i} style={{height:`${h}%`}}/> )}</div><div className="chart-x"><span>Sep 10</span><span>Sep 17</span><span>Sep 23</span></div></div>
      <div className="admin-panel activity-panel"><div className="panel-head"><div><strong>Recent activity</strong><small>Latest admin events</small></div><button>View audit log</button></div>{['Admin edited Food category','AI policy updated for September','New announcement published','User account suspended'].map((x,i)=><div className="activity-row" key={x}><span className={`activity-dot d${i}`}/><div><strong>{x}</strong><small>{['2 minutes ago','18 minutes ago','1 hour ago','3 hours ago'][i]}</small></div></div>)}</div>
    </div>
  </AdminFrame></AdminShell>
}

function UsersPage() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState(adminUsers)
  const [selected, setSelected] = useState(null)
  const [deletingUser, setDeletingUser] = useState(null)
  const [editing, setEditing] = useState(null)
  const [menuUser, setMenuUser] = useState(null)
  const [notice, setNotice] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [yearFilter, setYearFilter] = useState('Year 1–4')

  const statusOptions = ['All statuses', 'Active', 'Suspended', 'Pending']
  const yearOptions = ['Year 1–4', 'Year 1', 'Year 2', 'Year 3', 'Year 4']

  const filtered = users.filter(u => {
    const matchesQuery = `${u[0]} ${u[1]}`.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = statusFilter === 'All statuses' || u[4] === statusFilter
    const matchesYear = yearFilter === 'Year 1–4' || u[3] === yearFilter
    return matchesQuery && matchesStatus && matchesYear
  })

  function saveUser(updatedUser) {
    setUsers(current => current.map(user => user[1] === updatedUser[1] ? updatedUser : user))
    setEditing(null)
    setNotice(`${updatedUser[0]}'s account was updated.`)
  }

  function activateAccount(user) {
    setMenuUser(null)
    setUsers(current => current.map(item => item[1] === user[1] ? [...item.slice(0, 4), 'Active'] : item))
    setNotice(`${user[0]}'s account is now active.`)
  }

  function deleteUser() {
    if (!deletingUser) return
    setUsers(current => current.filter(user => user[1] !== deletingUser[1]))
    setNotice(`${deletingUser[0]}'s account was deleted.`)
    setDeletingUser(null)
    setMenuUser(null)
  }

  return <AdminShell page="Users"><AdminFrame eyebrow="ADMIN · USERS" title="User accounts" description="View, edit or disable student accounts. Transaction details stay private to each student." actions={<button className="admin-primary"><Icon name="download" size={14}/> Export list</button>}>
    <div className="admin-table-toolbar"><div className="admin-local-search"><Icon name="search" size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search users..."/></div><div className="admin-filter-group"><FilterDropdown label="All statuses" value={statusFilter} options={statusOptions} icon="filter" onChange={setStatusFilter}/><FilterDropdown label="Year 1–4" value={yearFilter} options={yearOptions} onChange={setYearFilter}/></div></div>
    {notice && <div className="admin-action-notice" role="status"><Icon name="check" size={15}/><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Dismiss notification"><Icon name="close" size={13}/></button></div>}
    <div className="admin-panel user-table"><div className="user-head"><span>User</span><span>Last active</span><span>Academic year</span><span>Status</span><span>Actions</span></div>{filtered.map(u=><div className="user-row" key={u[1]}><div className="user-cell"><span className="user-mini-avatar">{u[0].split(' ').map(x=>x[0]).join('').slice(0,2)}</span><span><strong>{u[0]}</strong><small>{u[1]}</small></span></div><span>{u[2]}</span><span>{u[3]}</span><b className={`status ${u[4].toLowerCase()}`}>{u[4]}</b><div className="row-actions"><button title="Edit account" onClick={()=>setEditing(u)}><Icon name="edit" size={14}/></button><button title="Disable account" onClick={()=>{setMenuUser(null); setSelected(u)}}><Icon name="ban" size={14}/></button><div className="row-menu-wrap"><button title="More actions" onClick={()=>setMenuUser(menuUser === u[1] ? null : u[1])}><Icon name="moreVertical" size={15}/></button>{menuUser === u[1] && <div className="row-menu">{u[4] === 'Suspended' && <button onClick={()=>activateAccount(u)}>Activate account</button>}<button className="danger-text" onClick={()=>{setMenuUser(null); setDeletingUser(u)}}>Delete user</button></div>}</div></div></div>)}</div>
    <div className="admin-table-footer"><div><button>‹</button><b>1</b><button>2</button><button>3</button><button>›</button></div></div>
    <div className="admin-info-banner"><Icon name="lock" size={15}/><span>Admins can see account details and activity counts, never individual transactions or notes. Every action here is written to the audit log.</span></div>
    {editing && <EditUserModal user={editing} onClose={()=>setEditing(null)} onSave={saveUser}/>} 
    {selected && <DisableModal user={selected} onClose={()=>setSelected(null)}/>} 
    {deletingUser && <DeleteUserModal user={deletingUser} onClose={()=>setDeletingUser(null)} onConfirm={deleteUser}/>} 
  </AdminFrame></AdminShell>
}

function DeleteUserModal({ user, onClose, onConfirm }) {
  return <div className="admin-modal-backdrop"><div className="disable-modal"><div className="modal-warning"><Icon name="trash" size={20}/></div><h2>Delete {user[0]}?</h2><p>This permanently removes the student account and its access. This action cannot be undone.</p><div className="disable-actions"><button onClick={onClose}>Cancel</button><button className="danger-btn" onClick={onConfirm}><Icon name="trash" size={14}/> Delete user</button></div></div></div>
}

function EditUserModal({ user, onClose, onSave }) {
  const [name, email, lastActive, initialYear, initialStatus] = user
  const [form, setForm] = useState({ name, email, year: initialYear, status: initialStatus })
  function submit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return
    onSave([form.name.trim(), form.email.trim(), lastActive, form.year, form.status])
  }
  return <div className="admin-modal-backdrop"><form className="disable-modal edit-user-modal" onSubmit={submit}><div className="modal-warning"><Icon name="edit" size={20}/></div><h2>Edit account</h2><label>Full name<input value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/></label><label>Email address<input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/></label><div className="edit-user-fields"><label>Academic year<select value={form.year} onChange={e=>setForm({...form, year:e.target.value})}>{['Year 1','Year 2','Year 3','Year 4'].map(year=><option key={year}>{year}</option>)}</select></label><label>Status<select value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>{['Active','Suspended','Pending'].map(status=><option key={status}>{status}</option>)}</select></label></div><div className="disable-actions"><button type="button" onClick={onClose}>Cancel</button><button className="admin-primary edit-save-button" type="submit">Save changes</button></div></form></div>
}

function DisableModal({ user, onClose }) {
  return <div className="admin-modal-backdrop"><div className="disable-modal"><div className="modal-warning"><Icon name="ban" size={20}/></div><h2>Disable {user[0]}?</h2><p>They will be signed out and unable to sign in until an admin enables the account again. Their data is kept, not deleted.</p><label>Reason <small>(saved to audit log)</small><input defaultValue="Requested by student via support ticket #4821"/></label><div className="disable-actions"><button onClick={onClose}>Cancel</button><button className="danger-btn" onClick={onClose}><Icon name="ban" size={14}/> Disable account</button></div></div></div>
}

function CategoriesAdminPage() {
  const [categories, setCategories] = useState(() => defaultCategories.map(category => [...category, true]))
  const [incomeCategories, setIncomeCategories] = useState(() => defaultIncomeCategories.map(category => [...category, true]))
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [name, setName] = useState('')
  function addCategory(e) { e.preventDefault(); if (!name.trim()) return; setCategories(v => [...v, [name.trim(), '0 entries', 'tag', 'mint', true]]); setName(''); setAdding(false) }
  function toggleCategory(setter, categoryName) { setter(current => current.map(category => category[0] === categoryName ? [...category.slice(0, 4), !category[4]] : category)) }
  function deleteCategory() {
    if (!deleting) return
    const setter = deleting.type === 'Expense' ? setCategories : setIncomeCategories
    setter(current => current.filter(category => category[0] !== deleting.category[0]))
    setDeleting(null)
  }
  return <AdminShell page="Default Categories"><AdminFrame eyebrow="ADMIN · TAXONOMY" title="Default categories" description="Available to every student. Changes apply to new entries; past entries keep their category." actions={<button className="admin-primary" onClick={()=>setAdding(true)}><Icon name="plus" size={14}/> Add category</button>}>
    <div className="category-admin-grid"><div className="admin-panel category-admin-card"><div className="panel-head"><div><strong>Expense</strong><small>8 default categories</small></div></div>{categories.slice(0,6).map(c=><AdminCategoryRow key={c[0]} c={c} onToggle={()=>toggleCategory(setCategories, c[0])} onDelete={()=>setDeleting({type:'Expense', category:c})}/>)}</div><div className="admin-panel category-admin-card"><div className="panel-head"><div><strong>Income</strong><small>6 default categories</small></div></div>{incomeCategories.map(c=><AdminCategoryRow key={c[0]} c={c} onToggle={()=>toggleCategory(setIncomeCategories, c[0])} onDelete={()=>setDeleting({type:'Income', category:c})}/>)}</div></div>
    <div className="admin-info-banner category-delete-note"><Icon name="info" size={15}/><span><strong>Deleting a default category</strong><small>Entries using it move to Miscellaneous or Other Income. Students are told in-app. Consider hiding it instead.</small></span></div>
    {adding&&<div className="admin-inline-modal"><form onSubmit={addCategory}><div><strong>New default category</strong><button type="button" onClick={()=>setAdding(false)} aria-label="Close add category"><Icon name="close" size={15}/></button></div><label>Category name<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Campus events"/></label><label>Type<select><option>Expense</option><option>Income</option></select></label><div><button className="admin-primary" type="submit">Create category</button></div></form></div>}
    {deleting && <DeleteCategoryModal category={deleting.category} type={deleting.type} onClose={()=>setDeleting(null)} onConfirm={deleteCategory}/>} 
  </AdminFrame></AdminShell>
}
function AdminCategoryRow({c, onToggle, onDelete}) { const visible = c[4] !== false; return <div className="admin-category-row"><span className={`admin-cat-icon ${c[3]}`}><Icon name={c[2]} size={15}/></span><span><strong>{c[0]}</strong><small>{c[1]}</small></span><b className={visible ? '' : 'category-hidden'}>{visible ? 'Visible' : 'Hidden'}</b><button title={visible ? 'Hide category' : 'Show category'} onClick={onToggle}><Icon name="edit" size={13}/></button><button className="danger-icon" title="Delete category" onClick={onDelete}><Icon name="trash" size={13}/></button></div> }

function DeleteCategoryModal({ category, type, onClose, onConfirm }) {
  const destination = type === 'Expense' ? 'Miscellaneous' : 'Other Income'
  return <div className="admin-modal-backdrop"><div className="disable-modal delete-category-modal"><div className="modal-warning"><Icon name="trash" size={20}/></div><h2>Delete {category[0]}?</h2><p>Entries using this category will move to {destination}. Students will be told in-app. This category cannot be restored.</p><div className="disable-actions"><button onClick={onClose}>Cancel</button><button className="danger-btn" onClick={onConfirm}><Icon name="trash" size={14}/> Delete category</button></div></div></div>
}

function AnnouncementsPage() {
  const [items, setItems] = useState(announcements)
  const [editing, setEditing] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [title, setTitle] = useState('September spending tip')
  const [message, setMessage] = useState('Your Food budget is getting close to its September limit. Review recent delivery spending and consider a weekly cap.')
  const [category, setCategory] = useState('Food')
  const categoryOptions = ['Food', 'Transport', 'Academics', 'Campus news']
  const categoryIcon = { Food: 'food', Transport: 'bus', Academics: 'grad', 'Campus news': 'bulb' }
  const [templateFilter, setTemplateFilter] = useState('All templates')
  const templateFilterOptions = ['All templates', 'Saving tips', 'Campus announcements', 'Drafts']
  const visibleItems = items.filter((item, index) => {
    if (templateFilter === 'All templates') return true
    if (templateFilter === 'Drafts') return !item[3]
    if (templateFilter === 'Saving tips') return index < 3
    return index >= 3
  })
  function startNewAnnouncement() { setTitle(''); setMessage(''); setCategory('Food'); setEditing(true) }
  function saveTemplate() { if (!title.trim() || !message.trim()) return; setItems(current => [...current, [title.trim(), message.trim(), 'Draft', false, category]]); window.dispatchEvent(new CustomEvent('admin-announcement-added', { detail: { title: title.trim() } })); setEditing(false) }
  return <AdminShell page="Tips & Announcements"><AdminFrame eyebrow="ADMIN · CONTENT" title="Tips & announcements" description="Templates for the saving-tips engine and campus-wide messages." actions={<><button className="admin-btn" onClick={()=>setPreviewing(true)}>Preview</button><button className="admin-primary" onClick={startNewAnnouncement}><Icon name="plus" size={14}/> New announcement</button></>}>
    <div className="announcement-layout"><div className="admin-panel announcement-list"><div className="panel-head"><div><strong>Tip templates</strong><small>{visibleItems.length} of {items.length} content items</small></div><FilterDropdown label="All templates" value={templateFilter} options={templateFilterOptions} icon="filter" onChange={setTemplateFilter}/></div>{visibleItems.map(a=>{ const index = items.indexOf(a); const itemCategory = a[4] || (index < 2 ? 'Food' : index === 2 ? 'Academics' : 'Campus news'); return <div className="announcement-row" key={a[0]}><div className="announcement-icon"><Icon name={categoryIcon[itemCategory]} size={15}/></div><div><strong>{a[0]}</strong><small>{a[1]}</small></div><span className={`publish-status ${a[3]?'published':'draft'}`}>{a[2]}</span><button className={`switch ${a[3]?'on':''}`} onClick={()=>setItems(v=>v.map((x,j)=>j===index?[x[0],x[1],x[3]?'Draft':'Published',!x[3],x[4]]:x))}><i/></button><button onClick={()=>setEditing(true)}><Icon name="edit" size={14}/></button></div>})}</div>
      <div className="admin-panel announcement-editor"><div className="panel-head"><div><strong>{editing?'New template':'Edit template'}</strong><small>Student-facing content</small></div><span>Live preview</span></div><label>Title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. September spending tip"/></label><label>Message<textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Write the message students will see..."/></label><div className="editor-grid"><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{categoryOptions.map(option=><option key={option}>{option}</option>)}</select></label><label>Audience<select defaultValue="All students"><option>All students</option><option>Year 1</option><option>Year 2</option></select></label></div><label>Language<select defaultValue="English"><option>English</option></select></label><label>Placement<select defaultValue="Saving tips"><option>Saving tips</option><option>Dashboard insight</option><option>Notification</option></select></label><div className="editor-preview"><span><Icon name={categoryIcon[category]} size={12}/> {category.toUpperCase()}</span><strong>{title || 'Your announcement title'}</strong><p>{message || 'Your message will appear here.'}</p></div><button className="admin-primary" onClick={saveTemplate}>Save template</button></div></div>
      {previewing && <div className="admin-modal-backdrop"><div className="disable-modal announcement-preview-modal"><div className="panel-head"><div><strong>Student preview</strong><small>How this message appears to students</small></div><button type="button" onClick={()=>setPreviewing(false)} aria-label="Close preview"><Icon name="close" size={15}/></button></div><div className="editor-preview"><span><Icon name={categoryIcon[category]} size={12}/> {category.toUpperCase()}</span><strong>{title || 'Your announcement title'}</strong><p>{message || 'Your message will appear here.'}</p></div><div className="disable-actions"><button onClick={()=>setPreviewing(false)}>Close preview</button></div></div></div>}
  </AdminFrame></AdminShell>
}

export default function AdminConsolePage({ type='overview' }) {
  const map = { overview: OverviewPage, users: UsersPage, categories: CategoriesAdminPage, announcements: AnnouncementsPage }
  const Page = map[type] || OverviewPage
  return <Page/>
}
