import { useState } from 'react'
import { navigate } from '../routes/AppRoutes'
import Icon from '../components/Icon'
import Logo from '../components/Logo'
import { clearStudentSession } from '../utils'
import '../styles/dashboard.css'
import '../styles/money-tools.css'

const categories = [
  { name: 'Food', icon: 'food', tone: 'amber', spent: 214.60, budget: 250, status: 'On track' },
  { name: 'Transport', icon: 'bus', tone: 'blue', spent: 68.40, budget: 90, status: 'On track' },
  { name: 'Hostel/Rent', icon: 'home', tone: 'purple', spent: 300, budget: 300, status: 'At limit' },
  { name: 'Academics', icon: 'grad', tone: 'teal', spent: 84.20, budget: 120, status: 'On track' },
  { name: 'Entertainment', icon: 'ticket', tone: 'peach', spent: 38.40, budget: 60, status: 'On track' },
  { name: 'Subscriptions', icon: 'tv', tone: 'pink', spent: 25.98, budget: 20, status: 'Over budget' },
  { name: 'Miscellaneous', icon: 'folder', tone: 'slate', spent: 11.22, budget: 30, status: 'On track' },
]

const alerts = [
  ['Hostel/Rent is at its limit', 'You have used the full September budget.', 'home', 'At limit'],
  ['Subscriptions is over budget', '$25.98 spent against a $20.00 budget.', 'tv', 'Over'],
  ['Food is approaching its limit', '$214.60 spent · $35.40 remaining.', 'food', '86%'],
]

const tips = [
  { title: 'Cut one food delivery this week', text: 'Skipping one delivery can keep your Food budget below its monthly target.', amount: '$18.40', tone: 'amber', icon: 'food' },
  { title: 'Use your student transport option', text: 'Choose your lower-cost route for the next few library trips.', amount: '$6.20', tone: 'blue', icon: 'bus' },
  { title: 'Pause unused subscriptions', text: 'Review recurring services before the next billing cycle.', amount: '$5.99', tone: 'pink', icon: 'tv' },
  { title: 'Set aside your next income', text: 'Move a small amount into savings when your next payment arrives.', amount: '$20.00', tone: 'teal', icon: 'coins' },
  { title: 'Plan academics spending', text: 'Keep printing and lecture-note costs inside the remaining budget.', amount: '$35.80', tone: 'peach', icon: 'grad' },
]

const bookmarks = [
  ['Food delivery guide', 'A quick reference for reducing delivery spending without cutting meals.', 'amber', 'food'],
  ['September 2026 plan', 'Your saved monthly budget plan and target spending limits.', 'mint', 'target'],
  ['AI budgeting notes', 'How CampusCoin uses your transaction history to surface useful patterns.', 'blue', 'sparkle'],
  ['Lecture week checklist', 'A saved checklist for transport, printing and campus essentials.', 'teal', 'grad'],
]

const reviewRows = [
  ['Sep 23', 'Printing, lecture notes', '$4.50', 'Academics', '91%'],
  ['Sep 22', 'Ride to library', '$6.20', 'Transport', '96%'],
  ['Sep 20', 'Chop & Go delivery', '$18.40', 'Food', '94%'],
  ['Sep 18', 'Cinema night', '$14.00', 'Entertainment', '88%'],
  ['Sep 17', 'Campus Cafe', '$8.50', 'Food', '97%'],
  ['Sep 16', 'Monthly data', '$12.00', 'Subscriptions', '79%'],
  ['Sep 14', 'Textbook rental', '$32.00', 'Academics', '93%'],
  ['Sep 12', 'Bus pass', '$20.00', 'Transport', '95%'],
  ['Sep 09', 'Misc purchase', '$9.20', 'Miscellaneous', '68%'],
  ['Sep 04', 'Spotify', '$5.99', 'Subscriptions', '81%'],
]

function money(v) { return `$${v.toFixed(2)}` }
function pct(v) { return Math.round((v / 870) * 100) }
function toneIcon(tone, icon) { return <span className={`d-icon ${tone}`}><Icon name={icon} size={16}/></span> }

function ToolsShell({ children, page, dark, setDark, notificationOpen, setNotificationOpen }) {
  const nav = [
    ['Dashboard', 'grid', '/dashboard'],
    ['Transactions', 'swap', '/transactions'],
    ['Categories', 'tag', '/categories'],
    ['Budgets', 'target', '/budgets'],
    ['Reports', 'report', '/reports'],
  ]
  const smart = [
    ['AI Insights', 'sparkle', '/ai-insights'],
    ['Saving Tips', 'bulb', '/saving-tips'],
    ['Bookmarks', 'bookmark', '/bookmarks'],
  ]
  const account = [
    ['Import CSV', 'upload', '/import-csv'],
    ['Settings', 'settings', '/settings'],
  ]
  const signOut = () => { clearStudentSession(); navigate('/') }
  return <div className={`dashboard-app money-tools-app ${dark ? 'dark' : ''}`}>
    <aside className="dash-sidebar">
      <button className="dash-brand" onClick={() => navigate('/dashboard')}><Logo/><span className="brand-dot"/></button>
      <div className="side-label">MENU</div>
      <nav>{nav.map(([label, icon, path]) => <button key={label} className={`side-link ${page === label ? 'active' : ''}`} onClick={() => navigate(path)}><Icon name={icon} size={18}/><span>{label}</span>{label === 'Budgets' && <b>3</b>}</button>)}</nav>
      <div className="side-label smart">SMART MONEY</div>
      {smart.map(([label, icon, path]) => <button key={label} className={`side-link ${page === label ? 'active' : ''}`} onClick={() => navigate(path)}><Icon name={icon} size={18}/><span>{label}</span>{label === 'AI Insights' && <b className="new">New</b>}</button>)}
      <div className="side-label smart">ACCOUNT</div>
      {account.map(([label, icon, path]) => <button key={label} className={`side-link ${page === label ? 'active' : ''}`} onClick={() => navigate(path)}><Icon name={icon} size={18}/><span>{label}</span></button>)}
      <div className="side-spacer"/>
      <div className="budget-mini"><div><span>Budget left · Sep</span><strong>85% used</strong></div><em>$127.20</em><div className="mini-track"><i/></div><small>8 days left · $15.90/day</small></div>
      <button className="profile-mini" onClick={signOut} title="Sign out"><span className="avatar">JD</span><span><strong>Jordan Davis</strong><small>Sign out</small></span><Icon name="logout" size={14}/></button>
    </aside>
    <main className="dash-main">
      <header className="dash-topbar">
        <div className="crumb"><Icon name="home" size={15}/><span>›</span><strong>{page}</strong></div>
        <div className="top-actions">
          <div className="global-search"><Icon name="search" size={15}/><input placeholder="Search transactions..."/><kbd>⌘K</kbd></div>
          <button className="top-btn">A</button><button className="top-btn">A</button>
          <button className="top-btn" onClick={() => setDark(v => !v)}><Icon name={dark ? 'sun' : 'moon'} size={17}/></button>
          <button className={`top-btn ${notificationOpen ? 'selected' : ''}`} onClick={() => setNotificationOpen(v => !v)}><Icon name="bell" size={17}/><i/></button>
          <span className="top-avatar">JD</span>
        </div>
      </header>
      {children}
    </main>
    {notificationOpen && <MiniNotifications onClose={() => setNotificationOpen(false)}/>} 
  </div>
}

function MiniNotifications() {
  return <div className="money-notifications"><div><strong>Notifications</strong><b>4 new</b><button>Mark all read</button></div><p>Your September insight is ready</p><p>Food is at 86% of budget</p><p>Possible duplicate found</p><p>Subscriptions is over budget</p></div>
}

function PageFrame({ eyebrow, title, description, actions, children }) {
  return <section className="dash-content money-page"><div className="money-heading"><div><label>{eyebrow}</label><h1>{title}</h1><p>{description}</p></div><div className="money-actions">{actions}</div></div>{children}</section>
}

function BudgetsPage() {
  const [dark, setDark] = useState(false), [notify, setNotify] = useState(false), [progress, setProgress] = useState(false)
  return <ToolsShell page="Budgets" dark={dark} setDark={setDark} notificationOpen={notify} setNotificationOpen={setNotify}>
    <PageFrame eyebrow="BUDGETS · SEP" title="Budgets & alerts" description="Stay ahead of your monthly limits with category budgets and timely alerts." actions={<><button className="tool-btn"><Icon name="target" size={14}/> Monthly plan⌄</button><button className="tool-btn"><Icon name="refresh" size={14}/> Sync now</button><button className="tool-primary" onClick={() => setProgress(v => !v)}><Icon name="plus" size={14}/> Add budget</button></>}>
      <div className="metric-grid four"><Metric label="Sep budget" value="$870.00"/><Metric label="Spent" value="$742.80"/><Metric label="Remaining" value="$127.20" green/><Metric label="Alerts" value="3" danger/></div>
      <div className="alert-list">{alerts.map(([t, d, icon, tag], i) => <div className="alert-row" key={t}>{toneIcon(['pink','amber','blue'][i], icon)}<div><strong>{t}</strong><small>{d}</small></div><b>{tag}</b></div>)}</div>
      <div className="budget-layout"><div className="budget-category-grid">{categories.map((c) => <BudgetCategory key={c.name} {...c} progress={progress}/>)}</div><BudgetAutomation/></div>
    </PageFrame>
  </ToolsShell>
}
function Metric({label,value,green,danger}) { return <div className="metric-card"><span>{label}</span><strong className={green?'green-text':danger?'danger-text':''}>{value}</strong></div> }
function BudgetCategory({name,icon,tone,spent,budget,status,progress}) { const used=Math.min(100,Math.round(spent/budget*100)); return <div className="budget-category"><div className="budget-cat-head">{toneIcon(tone,icon)}<div><strong>{name}</strong><small>{status}</small></div><button><Icon name="edit" size={13}/></button></div>{progress && <div className={`mini-progress ${used>=100?'danger':''}`}><i style={{width:`${used}%`}}/></div>}<div className="budget-cat-foot"><span>{money(spent)} spent</span><b>{money(budget)}</b></div></div> }
function BudgetAutomation(){ const [a,setA]=useState([true,true,true,false]); return <aside className="automation-card"><h3>AI alerts</h3><p>Let CampusCoin watch your budgets and flag changes early.</p>{['Approaching budget limit','Unusual spend detected','Weekly budget check','Auto-adjust suggestions'].map((x,i)=><div className="toggle-row" key={x}><span>{x}</span><button className={a[i]?'on':''} onClick={()=>setA(v=>v.map((x,j)=>j===i?!x:x))}><i/></button></div>)}<div className="automation-note"><Icon name="sparkle" size={15}/><span>AI found 3 budget alerts from your September transactions.</span></div></aside> }

function ReportsPage(){
  const params=new URLSearchParams(window.location.search); const initialFilled=params.get('state')!=='empty';
  const [dark,setDark]=useState(false),[notify,setNotify]=useState(false),[filled,setFilled]=useState(initialFilled),[exportOpen,setExportOpen]=useState(params.get('modal')==='export')
  return <ToolsShell page="Reports" dark={dark} setDark={setDark} notificationOpen={notify} setNotificationOpen={setNotify}>
    <PageFrame eyebrow="INSIGHTS · SEP" title="Reports" description="Understand where your money goes and how your spending changes over time." actions={<><button className="tool-primary" onClick={()=>setExportOpen(true)}><Icon name="download" size={14}/> Export report</button><button className="tool-btn"><Icon name="filter" size={14}/> Filters</button></>}>
      <div className="report-filters"><button>Sep 1 – Sep 30⌄</button><button>All categories⌄</button><button>All transactions⌄</button><div/><button className={filled?'active':''} onClick={()=>setFilled(true)}>Month</button><button onClick={()=>setFilled(false)}>Week</button><button>Day</button></div>
      <div className="report-grid"><CategoryReport filled={filled}/><BudgetActualReport filled={filled}/><DailySpendReport filled={filled}/><TopSpenders/></div>
      <div className="report-banner"><Icon name="sparkle" size={16}/><div><strong>AI report ready</strong><span>We found a few useful patterns in your September spending.</span></div><button>View insight</button></div>
    </PageFrame>
    {exportOpen && <ExportModal onClose={()=>setExportOpen(false)}/>} 
  </ToolsShell>
}
function CategoryReport({filled}){return <div className="report-card"><div className="report-card-title"><div><strong>Spend by category</strong><small>September total</small></div><span className="legend-dot green"/></div><div className="donut-report" style={{'--p':filled?'48%':'0%'}}><b>{filled?'$742.80':'$0.00'}</b><small>total spend</small></div><div className="legend-list">{categories.slice(0,6).map((c,i)=><span key={c.name}><i className={`legend-color l${i}`}/>{c.name}<b>{filled?money(c.spent):'$0.00'}</b></span>)}</div></div>}
function BudgetActualReport({filled}){const vals=[{m:'May',b:690,s:510},{m:'Jun',b:760,s:580},{m:'Jul',b:720,s:610},{m:'Aug',b:820,s:680},{m:'Sep',b:870,s:743}];return <div className="report-card budget-chart-card"><div className="report-card-title"><div><strong>Budget vs actual</strong><small>Monthly comparison</small></div><span className="chart-legend"><i/>Budget <i/>Actual</span></div><div className={`bars ${filled?'filled':''}`}>{vals.map(v=><div className="bar-group" key={v.m}><div className="bars-area"><i style={{height:filled?`${v.b/900*100}%`:'4%'}}/><b style={{height:filled?`${v.s/900*100}%`:'4%'}}/></div><span>{v.m}</span></div>)}</div><div className="chart-summary"><span>Budget<b>{filled?'$870.00':'—'}</b></span><span>Spent<b>{filled?'$742.80':'—'}</b></span><span>Remaining<b className="green-text">{filled?'$127.20':'—'}</b></span></div></div>}
function DailySpendReport({filled}){const bars=[25,90,42,38,52,44,37,50,47,44,78,52,62,40,56,82,65];return <div className="report-card daily-card"><div className="report-card-title"><div><strong>Daily spending</strong><small>September 1–23</small></div></div><div className={`daily-bars ${filled?'filled':''}`}>{bars.map((v,i)=><i key={i} style={{height:filled?`${v}%`:'3%'}}/>)}</div><small className="chart-foot">Low days are shown beside your higher-spend days.</small></div>}
function TopSpenders(){return <div className="report-card top-spenders"><div className="report-card-title"><div><strong>Top categories</strong><small>By September spend</small></div></div>{categories.slice(0,5).map(c=><div className="spender-row" key={c.name}><span>{c.name}<small>{c.status}</small></span><b>{money(c.spent)}</b></div>)}<button className="text-link">View all categories</button></div>}
function ExportModal({onClose}){return <div className="tool-overlay"><div className="export-modal"><button className="close-tool" onClick={onClose}><Icon name="close" size={16}/></button><h2>Export September report</h2><p>Choose the format and data you want to include.</p><div className="export-tabs"><button className="active"><Icon name="receipt" size={15}/> PDF report <b>✓</b></button><button><Icon name="download" size={15}/> CSV data</button></div><div className="check-list">{['Spending summary','Category breakdown','Budget vs actual','Daily spending chart'].map(x=><label key={x}><span>✓</span>{x}</label>)}</div><div className="toggle-row export-toggle"><span>Include AI insights</span><button className="on"><i/></button></div><div className="export-footer"><button onClick={onClose}>Cancel</button><button className="tool-primary"><Icon name="download" size={14}/> Download report</button></div></div></div>}

function AIInsightsPage(){const [dark,setDark]=useState(false),[notify,setNotify]=useState(false);return <ToolsShell page="AI Insights" dark={dark} setDark={setDark} notificationOpen={notify} setNotificationOpen={setNotify}><PageFrame eyebrow="SMART MONEY" title="AI Insights" description="Clear, useful patterns from your September transactions and budgets." actions={<><button className="tool-btn"><Icon name="bookmark" size={14}/> Save insight</button><button className="tool-primary"><Icon name="refresh" size={14}/> Refresh</button></>}><div className="ai-layout"><div><div className="insight-hero"><div className="insight-icon"><Icon name="sparkle" size={19}/></div><div><strong>Your September story</strong><small>Updated today · based on 47 transactions</small><p>Your spending is tracking below the September budget. Food delivery and subscriptions are the two areas with the clearest opportunity to save.</p><p>Rent is fixed, while your flexible spending has been more concentrated around meals and small recurring purchases.</p><div className="insight-actions"><button>Save insight</button><button>Share</button></div></div></div><h3 className="section-mini-title">Key opportunities</h3><div className="opportunity-grid"><Opportunity title="Food delivery" value="−$18.40" text="One fewer delivery this week keeps Food comfortably inside budget." tone="amber" icon="food"/><Opportunity title="Subscriptions" value="−$5.99" text="Review one recurring service before the next billing cycle." tone="pink" icon="tv"/></div><div className="ai-follow"><Icon name="info" size={16}/><span>Potential duplicate: Chop & Go delivery on Sep 20 looks similar to a previous entry.</span><button>Review</button></div></div><aside className="insight-side"><h3>Highlights</h3>{[['Spent','$742.80'],['Biggest category','Hostel/Rent'],['Food','$214.60'],['Remaining','$127.20']].map(([a,b])=><div key={a}><span>{a}</span><strong>{b}</strong></div>)}<div className="side-tip"><strong>Keep going</strong><p>You have 8 days left and about $15.90/day available.</p></div></aside></div></PageFrame></ToolsShell>}
function Opportunity({title,value,text,tone,icon}){return <div className="opportunity"><div className="opp-head">{toneIcon(tone,icon)}<div><strong>{title}</strong><small>Flexible spend</small></div><b>{value}</b></div><p>{text}</p><button className="tool-primary">View tip</button><button className="ghost-btn">Dismiss</button></div>}

function SavingTipsPage(){const [dark,setDark]=useState(false),[notify,setNotify]=useState(false);return <ToolsShell page="Saving Tips" dark={dark} setDark={setDark} notificationOpen={notify} setNotificationOpen={setNotify}><PageFrame eyebrow="SMART MONEY" title="Saving tips" description="Small changes tailored to your current spending and budget targets." actions={<button className="tool-btn">This month⌄</button>}><div className="saving-metrics"><div className="saving-score"><Icon name="zap" size={16}/><span>Potential monthly savings</span><strong>$61.00</strong></div><Metric label="Tips ready" value="5"/><Metric label="Saved" value="1"/><Metric label="Dismissed" value="2"/></div><div className="tip-tabs"><button className="active">All</button><button>Recommended</button><button>Saved</button><button>Dismissed</button></div><div className="tip-list">{tips.map((t,i)=><TipRow key={t.title} {...t} featured={i===0}/>)}</div><div className="saving-note"><Icon name="info" size={14}/> New tips appear as your transaction patterns change.</div></PageFrame></ToolsShell>}
function TipRow({title,text,amount,tone,icon,featured}){return <div className={`tip-row ${featured?'featured':''}`}><span className="tip-check">{featured?'✓':'○'}</span>{toneIcon(tone,icon)}<div className="tip-copy"><strong>{title}</strong><small>{text}</small></div><div className="tip-save"><b>Save {amount}</b><span>per month</span></div><button className="tool-primary">{featured?'Saved':'Save'}</button><button className="ghost-btn">Dismiss</button><Icon name="chevron" size={14}/></div>}

function BookmarksPage(){const [dark,setDark]=useState(false),[notify,setNotify]=useState(false);return <ToolsShell page="Bookmarks" dark={dark} setDark={setDark} notificationOpen={notify} setNotificationOpen={setNotify}><PageFrame eyebrow="SAVED ITEMS" title="Bookmarks & notes" description="Keep useful insights, tips and planning notes close at hand." actions={<><button className="tool-primary"><Icon name="bookmark" size={14}/> New bookmark</button><button className="tool-btn">Sort⌄</button></>}><div className="bookmark-tabs"><button className="active">All</button><button>Tips</button><button>Insights</button><button>Notes</button></div><div className="bookmark-grid">{bookmarks.map(([title,text,tone,icon])=><div className="bookmark-card" key={title}>{toneIcon(tone,icon)}<div className="bookmark-head"><strong>{title}</strong><span>•••</span></div><p>{text}</p><div className="bookmark-actions"><button>Open</button><button><Icon name="edit" size={13}/> Edit</button><button><Icon name="trash" size={13}/> Remove</button></div></div>)}</div></PageFrame></ToolsShell>}

function ImportPage(){const [dark,setDark]=useState(false),[notify,setNotify]=useState(false),[file,setFile]=useState(false);return <ToolsShell page="Import CSV" dark={dark} setDark={setDark} notificationOpen={notify} setNotificationOpen={setNotify}><PageFrame eyebrow="IMPORT DATA" title="Import transactions from CSV" description="Bring your existing transaction history into CampusCoin in a few simple steps." actions={null}><div className="import-steps"><span className="active">1 <b>Upload file</b></span><i/><span>2 <b>Review transactions</b></span><i/><span>3 <b>Done</b></span></div><div className="import-layout"><div><label className="upload-zone"><input type="file" accept=".csv" onChange={()=>setFile(true)}/><span className="upload-icon"><Icon name="upload" size={20}/></span><strong>Drop your CSV here</strong><small>or choose a file from your computer</small><b>Browse files</b></label>{file&&<div className="file-row"><span>{toneIcon('mint','receipt')}</span><div><strong>september-transactions.csv</strong><small>47 rows · 18 KB</small></div><button onClick={()=>setFile(false)}><Icon name="close" size={14}/></button></div>}<button className="tool-primary import-button" disabled={!file} onClick={()=>file&&navigate('/review-categories')}>{file?'Continue to review':'Choose a CSV file'}</button></div><aside className="import-help"><h3>CSV format</h3><p>Use one transaction per row with the following columns.</p><strong>Date · Description · Amount · Category</strong><button>Download sample CSV</button></aside></div><div className="import-note"><Icon name="info" size={15}/><span>Your original transactions will not be changed. CampusCoin will preview and validate the import before saving it.</span></div></PageFrame></ToolsShell>}

function ReviewPage(){const [dark,setDark]=useState(false),[notify,setNotify]=useState(false),[selected,setSelected]=useState({});return <ToolsShell page="Import CSV" dark={dark} setDark={setDark} notificationOpen={notify} setNotificationOpen={setNotify}><PageFrame eyebrow="IMPORT REVIEW" title="Review AI categories" description="Review the suggested categories before adding these transactions to your history." actions={<><button className="tool-btn"><Icon name="arrowleft" size={14}/> Back</button><button className="tool-primary">Import 10 transactions</button></>}><div className="review-steps"><span className="done">✓ Upload file</span><span className="done">✓ Review transactions</span><span className="active">3 Done</span></div><div className="review-tabs"><button>All 10</button><button className="active">AI suggestions 8</button><button>Needs review 2</button><button>Excluded 0</button></div><div className="review-table"><div className="review-head"><span>Transaction</span><span>Amount</span><span>Suggested category</span><span>Confidence</span></div>{reviewRows.map((r,i)=>{const low=i===3||i===8;return <div className={`review-row ${low?'needs-review':''}`} key={r[0]+r[1]}><input type="checkbox" checked={selected[i]!==false} onChange={e=>setSelected(v=>({...v,[i]:e.target.checked}))}/><span><small>{r[0]}</small><strong>{r[1]}</strong></span><b>{r[2]}</b><button className="category-suggest">{r[3]}⌄</button><span className="confidence"><i style={{'--confidence':r[4]}}/>{r[4]}</span></div>})}</div><div className="review-footer"><span>AI categorized 8 of 10 transactions confidently. Two entries need your review.</span><button className="text-link">Review flagged</button></div></PageFrame></ToolsShell>}

function SettingsPage(){const [dark,setDark]=useState(false),[notify,setNotify]=useState(false),[saved,setSaved]=useState(false);return <ToolsShell page="Settings" dark={dark} setDark={setDark} notificationOpen={notify} setNotificationOpen={setNotify}><PageFrame eyebrow="ACCOUNT" title="Profile & settings" description="Manage your profile, preferences, notifications and security."><div className="settings-layout"><aside className="settings-nav"><button className="active">Profile</button><button>Preferences</button><button>Notifications</button><button>Security</button><button>Connected apps</button></aside><div className="settings-main"><SettingsProfile/><SettingsPreferences/><SettingsNotifications/><SettingsSecurity/><div className="settings-footer"><button className="tool-primary" onClick={()=>setSaved(true)}>Save changes</button>{saved&&<span>Changes saved</span>}<button className="ghost-btn">Cancel</button><button className="settings-signout" onClick={()=>{clearStudentSession();navigate('/')}}><Icon name="logout" size={14}/> Sign out</button></div></div></div></PageFrame></ToolsShell>}
function SettingsProfile(){return <div className="settings-card"><h3>Profile</h3><p>Keep your student profile and account details up to date.</p><div className="profile-line"><span className="large-avatar">JD</span><div><strong>Jordan Davis</strong><small>jordan.davis@example.com</small></div><button className="ghost-btn">Change photo</button></div><div className="form-grid"><label>Full name<input value="Jordan Davis" readOnly/></label><label>Email<input value="jordan.davis@example.com" readOnly/></label><label>School<input value="Aptech" readOnly/></label><label>Study level<select defaultValue="Year 2"><option>Year 2</option></select></label></div></div>}
function SettingsPreferences(){return <div className="settings-card"><h3>Money preferences</h3><p>Choose how CampusCoin displays and summarizes your finances.</p><div className="pref-grid"><div><strong>Currency</strong><span>USD · $</span></div><div><strong>Monthly budget</strong><span>$870.00</span></div><div><strong>Week starts</strong><span>Monday</span></div><div><strong>Default view</strong><span>Dashboard</span></div></div></div>}
function SettingsNotifications(){const [a,setA]=useState([false,false,true]);return <div className="settings-card"><h3>Notifications</h3><p>Choose when CampusCoin should send you useful reminders.</p><div className="notification-settings-row"><span><strong>Budget alerts</strong><small>Notify me when a category is close to its limit.</small></span><button className={a[0]?'on':''} onClick={()=>setA(v=>v.map((x,i)=>i===0?!x:x))}><i/></button></div><div className="notification-settings-row"><span><strong>Weekly summary</strong><small>Send a weekly overview of spending and remaining budget.</small></span><button className={a[1]?'on':''} onClick={()=>setA(v=>v.map((x,i)=>i===1?!x:x))}><i/></button></div><div className="notification-settings-row"><span><strong>AI insights</strong><small>Show new insights when a useful pattern is detected.</small></span><button className={a[2]?'on':''} onClick={()=>setA(v=>v.map((x,i)=>i===2?!x:x))}><i/></button></div></div>}
function SettingsSecurity(){return <div className="settings-card"><h3>Security</h3><p>Keep your CampusCoin account protected.</p><div className="security-row"><span><strong>Password</strong><small>Last changed 28 days ago.</small></span><button className="tool-btn">Change password</button></div><div className="security-row"><span><strong>Two-factor authentication</strong><small>Protect your account with an additional sign-in step.</small></span><b className="security-status">Not enabled</b></div></div>}

const pageMap = {
  '/budgets': BudgetsPage,
  '/reports': ReportsPage,
  '/ai-insights': AIInsightsPage,
  '/saving-tips': SavingTipsPage,
  '/bookmarks': BookmarksPage,
  '/import-csv': ImportPage,
  '/review-categories': ReviewPage,
  '/settings': SettingsPage,
}
export default function MoneyToolsPage({ type }) { const Page = pageMap[type] || BudgetsPage; return <Page/> }
