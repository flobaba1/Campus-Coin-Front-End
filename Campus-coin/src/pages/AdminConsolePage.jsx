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

const announcements = [
  ['September finance tips', 'Help students review spending before month end.', 'Published', true],
  ['Tips: food delivery', 'A short guide to keeping Food budgets on track.', 'Published', true],
  ['AI insight notice', 'Explain how advisory AI insights are generated.', 'Published', true],
  ['CSV import update', 'A small reminder about supported import columns.', 'Draft', false],
]

function AdminShell({ page, children }) {
  const [search, setSearch] = useState('')
  const [notification, setNotification] = useState(false)
  const [admin, setAdmin] = useState(getAdminSession())
  useEffect(() => {
    if (!isAdminAuthenticated()) navigate('/admin/sign-in')
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

  return <div className="admin-console-app">
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
        <div className="admin-crumb"><Icon name="home" size={14}/><span>›</span><strong>{page}</strong></div>
        <div className="admin-top-actions">
          <div className="admin-search"><Icon name="search" size={14}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users, categories..."/><kbd>⌘K</kbd></div>
          <button className="admin-top-btn">A</button><button className="admin-top-btn">A</button>
          <div className="admin-notify-wrap"><button className="admin-top-btn" onClick={()=>setNotification(v=>!v)}><Icon name="bell" size={16}/><i/></button>{notification&&<div className="admin-notification"><strong>Admin notifications</strong><p>3 new moderation events</p><p>2 users need review</p><p>Weekly usage report ready</p></div>}</div>
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

function OverviewPage() {
  return <AdminShell page="Overview"><AdminFrame eyebrow="ADMIN · OVERVIEW" title="Usage overview" description="A high-level view of student activity, transactions and platform health." actions={<><button className="admin-btn">September 2026⌄</button><button className="admin-primary"><Icon name="download" size={14}/> Export CSV</button></>}>
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
  const [selected, setSelected] = useState(null)
  const filtered = adminUsers.filter(u => `${u[0]} ${u[1]}`.toLowerCase().includes(query.toLowerCase()))
  return <AdminShell page="Users"><AdminFrame eyebrow="ADMIN · USERS" title="User accounts" description="Review student accounts, status and recent activity." actions={<button className="admin-primary"><Icon name="download" size={14}/> Export list</button>}>
    <div className="admin-table-toolbar"><div className="admin-local-search"><Icon name="search" size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search users..."/></div><div><button className="admin-btn"><Icon name="filter" size={14}/> All statuses⌄</button><button className="admin-btn">Year 1–4⌄</button></div></div>
    <div className="admin-panel user-table"><div className="user-head"><span>User</span><span>Last active</span><span>Study level</span><span>Status</span><span>Actions</span></div>{filtered.map((u,i)=><div className="user-row" key={u[1]}><div className="user-cell"><span className="user-mini-avatar">{u[0].split(' ').map(x=>x[0]).join('').slice(0,2)}</span><span><strong>{u[0]}</strong><small>{u[1]}</small></span></div><span>{u[2]}</span><span>{u[3]}</span><b className={`status ${u[4].toLowerCase()}`}>{u[4]}</b><div className="row-actions"><button title="Edit"><Icon name="edit" size={14}/></button><button title="Disable" onClick={()=>setSelected(u)}><Icon name="ban" size={14}/></button><button title="More"><Icon name="more" size={15}/></button></div></div>)}</div>
    <div className="admin-table-footer"><span>Showing {filtered.length} of 9,842 users</span><div><button>‹</button><b>1</b><button>2</button><button>3</button><button>›</button></div></div>
    {selected && <DisableModal user={selected} onClose={()=>setSelected(null)}/>} 
  </AdminFrame></AdminShell>
}

function DisableModal({ user, onClose }) {
  return <div className="admin-modal-backdrop"><div className="disable-modal"><div className="modal-warning"><Icon name="ban" size={20}/></div><h2>Disable {user[0]}?</h2><p>This will block the student from signing in and prevent new transactions until the account is re-enabled.</p><label>Reason <textarea defaultValue="Account review required"/></label><div className="disable-actions"><button onClick={onClose}>Cancel</button><button className="danger-btn" onClick={onClose}><Icon name="ban" size={14}/> Disable account</button></div></div></div>
}

function CategoriesAdminPage() {
  const [categories, setCategories] = useState(defaultCategories)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  function addCategory(e) { e.preventDefault(); if (!name.trim()) return; setCategories(v => [...v, [name.trim(), '0 entries', 'tag', 'mint']]); setName(''); setAdding(false) }
  return <AdminShell page="Default Categories"><AdminFrame eyebrow="ADMIN · TAXONOMY" title="Default categories" description="Manage the categories available to every CampusCoin student account." actions={<button className="admin-primary" onClick={()=>setAdding(true)}><Icon name="plus" size={14}/> Add category</button>}>
    <div className="category-admin-grid"><div className="admin-panel category-admin-card"><div className="panel-head"><div><strong>Expense</strong><small>8 default categories</small></div><button>Sort⌄</button></div>{categories.slice(0,6).map(c=><AdminCategoryRow key={c[0]} c={c}/>)}</div><div className="admin-panel category-admin-card"><div className="panel-head"><div><strong>Income</strong><small>6 default categories</small></div><button>Sort⌄</button></div>{[['Allowance','Recurring student income','coins','mint'],['Part-time Job','Work and shifts','briefcase','blue'],['Scholarship','Awards and funding','grad','purple'],['Gift','Family and gifts','gift','peach'],['Refund','Refunds and reversals','refresh','teal'],['Other income','Other sources','folder','slate']].map(c=><AdminCategoryRow key={c[0]} c={c}/>)}</div></div>
    <div className="admin-info-banner"><Icon name="info" size={15}/><span>Default categories are available to all students. Changes apply to new transactions and do not rename existing student categories.</span></div>
    {adding&&<div className="admin-inline-modal"><form onSubmit={addCategory}><div><strong>New default category</strong><button type="button" onClick={()=>setAdding(false)}><Icon name="close" size={15}/></button></div><label>Category name<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Campus events"/></label><label>Type<select><option>Expense</option><option>Income</option></select></label><div><button type="button" onClick={()=>setAdding(false)}>Cancel</button><button className="admin-primary" type="submit">Create category</button></div></form></div>}
  </AdminFrame></AdminShell>
}
function AdminCategoryRow({c}) { return <div className="admin-category-row"><span className={`admin-cat-icon ${c[3]}`}><Icon name={c[2]} size={15}/></span><span><strong>{c[0]}</strong><small>{c[1]}</small></span><b>Active</b><button><Icon name="edit" size={13}/></button><button className="danger-icon"><Icon name="trash" size={13}/></button></div> }

function AnnouncementsPage() {
  const [items, setItems] = useState(announcements)
  const [editing, setEditing] = useState(false)
  return <AdminShell page="Tips & Announcements"><AdminFrame eyebrow="ADMIN · CONTENT" title="Tips & announcements" description="Manage the guidance and announcements shown to students." actions={<><button className="admin-btn">Preview</button><button className="admin-primary" onClick={()=>setEditing(true)}><Icon name="plus" size={14}/> New announcement</button></>}>
    <div className="announcement-layout"><div className="admin-panel announcement-list"><div className="panel-head"><div><strong>Published & drafts</strong><small>{items.length} content items</small></div><button>Filter⌄</button></div>{items.map((a,i)=><div className="announcement-row" key={a[0]}><div className="announcement-icon"><Icon name={i===0?'sparkle':i===1?'food':i===2?'shield':'upload'} size={15}/></div><div><strong>{a[0]}</strong><small>{a[1]}</small></div><span className={`publish-status ${a[3]?'published':'draft'}`}>{a[2]}</span><button className={`switch ${a[3]?'on':''}`} onClick={()=>setItems(v=>v.map((x,j)=>j===i?[x[0],x[1],x[3]?'Draft':'Published',!x[3]]:x))}><i/></button><button onClick={()=>setEditing(true)}><Icon name="edit" size={14}/></button></div>)}</div>
      <div className="admin-panel announcement-editor"><div className="panel-head"><div><strong>{editing?'Edit template':'Edit template'}</strong><small>Student-facing content</small></div><span>Live preview</span></div><label>Title<input defaultValue="September spending tip"/></label><label>Message<textarea defaultValue="Your Food budget is getting close to its September limit. Review recent delivery spending and consider a weekly cap."/></label><div className="editor-grid"><label>Audience<select defaultValue="All students"><option>All students</option><option>Year 1</option><option>Year 2</option></select></label><label>Language<select defaultValue="English"><option>English</option></select></label></div><label>Placement<select defaultValue="Saving tips"><option>Saving tips</option><option>Dashboard insight</option><option>Notification</option></select></label><div className="editor-preview"><span>PREVIEW</span><strong>September spending tip</strong><p>Your Food budget is getting close to its September limit.</p></div><button className="admin-primary" onClick={()=>setEditing(false)}>Save template</button></div></div>
  </AdminFrame></AdminShell>
}

export default function AdminConsolePage({ type='overview' }) {
  const map = { overview: OverviewPage, users: UsersPage, categories: CategoriesAdminPage, announcements: AnnouncementsPage }
  const Page = map[type] || OverviewPage
  return <Page/>
}
