
import { useMemo, useState } from 'react'
import { navigate } from '../routes/AppRoutes'
import Icon from '../components/Icon'
import Logo from '../components/Logo'
import { clearStudentSession } from '../utils'
import '../styles/dashboard.css'

const baseTransactions = [
  {id:1,name:'Campus Cafe',category:'Food',date:'Sep 23',amount:-8.50,icon:'food',tone:'amber',ai:true},
  {id:2,name:'Ride to library',category:'Transport',date:'Sep 22',amount:-6.20,icon:'bus',tone:'blue'},
  {id:3,name:'Library desk shift',category:'Part-time Job',date:'Sep 21',amount:160,icon:'briefcase',tone:'mint',edited:true},
  {id:4,name:'Chop & Go delivery',category:'Food',date:'Sep 20',amount:-18.40,icon:'food',tone:'amber',duplicate:true},
  {id:5,name:'Cinema night',category:'Entertainment',date:'Sep 18',amount:-14,icon:'ticket',tone:'peach'},
]

const categories = [
  {name:'Subscriptions',value:25.98,budget:20,tone:'pink',icon:'tv'},
  {name:'Food',value:214.60,budget:250,tone:'amber',icon:'food'},
  {name:'Transport',value:68.40,budget:90,tone:'blue',icon:'bus'},
  {name:'Academics',value:84.20,budget:120,tone:'teal',icon:'grad'},
  {name:'Entertainment',value:38.40,budget:60,tone:'peach',icon:'ticket'},
]

const notifications = [
  ['Your September insight is ready','Food delivery rose 40%','sparkle','Today, 9:14 AM'],
  ['Food is at 86% of budget','$35.40 left for 8 days','bell','Today, 9:02 AM'],
  ['Possible duplicate found','Chop & Go delivery, Sep 20','receipt','Sep 20'],
  ['Subscriptions is over budget','$25.98 on $20.00 spend','ban','Sep 15'],
  ['Hostel/Rent reached its limit','Paid in full for September','home','Sep 1'],
]

function money(n){return `${n < 0 ? '−' : '+'}$${Math.abs(n).toFixed(2)}`}
function toneIcon(tone,icon){return <span className={`d-icon ${tone}`}><Icon name={icon} size={17}/></span>}

function DashboardShell({children, dark, setDark, notificationOpen, setNotificationOpen, page='Dashboard', search, setSearch}){
  const nav = [
    ['Dashboard','grid','/dashboard'],
    ['Transactions','swap','/transactions'],
    ['Categories','tag','/categories'],
    ['Budgets','target','/budgets'],
    ['Reports','report','/reports'],
  ]
  const smart = [
    ['AI Insights','sparkle','/ai-insights'],
    ['Saving Tips','bulb','/saving-tips'],
    ['Bookmarks','bookmark','/bookmarks'],
  ]
  const account = [
    ['Import CSV','upload','/import-csv'],
    ['Settings','settings','/settings'],
  ]
  const signOut = () => { clearStudentSession(); navigate('/') }
  return <div className={`dashboard-app ${dark?'dark':''}`}>
    <aside className="dash-sidebar">
      <button className="dash-brand" onClick={()=>navigate('/dashboard')}><Logo/><span className="brand-dot"/></button>
      <div className="side-label">MENU</div>
      <nav>
        {nav.map(([label,icon,path])=><button key={label} className={`side-link ${page===label?'active':''}`} onClick={()=>navigate(path)}>
          <Icon name={icon} size={18}/><span>{label}</span>{label==='Budgets'&&<b>3</b>}
        </button>)}
      </nav>
      <div className="side-label smart">SMART MONEY</div>
      {smart.map(([label,icon,path])=><button className={`side-link ${page===label?'active':''}`} key={label} onClick={()=>navigate(path)}><Icon name={icon} size={18}/><span>{label}</span>{label==='AI Insights'&&<b className="new">New</b>}</button>)}
      <div className="side-label smart">ACCOUNT</div>
      {account.map(([label,icon,path])=><button className={`side-link ${page===label?'active':''}`} key={label} onClick={()=>navigate(path)}><Icon name={icon} size={18}/><span>{label}</span></button>)}
      <div className="side-spacer"/>
      <div className="budget-mini"><div><span>Budget left · Sep</span><strong>85% used</strong></div><em>$127.20</em><div className="mini-track"><i/></div><small>8 days left · $15.90/day</small></div>
      <button className="profile-mini" onClick={signOut} title="Sign out"><span className="avatar">JD</span><span><strong>Jordan Davis</strong><small>Sign out</small></span><Icon name="logout" size={16}/></button>
    </aside>
    <main className="dash-main">
      <header className="dash-topbar">
        <div className="crumb"><Icon name="home" size={15}/><span>›</span><strong>{page}</strong></div>
        <div className="top-actions">
          <div className="global-search"><Icon name="search" size={15}/><input value={search??''} onChange={e=>setSearch?.(e.target.value)} placeholder="Search transactions..."/><kbd>⌘K</kbd></div>
          <button className="top-btn">A</button><button className="top-btn">A</button>
          <button className="top-btn" onClick={()=>setDark(v=>!v)}><Icon name={dark?'sun':'moon'} size={17}/></button>
          <div className="notify-wrap"><button className={`top-btn ${notificationOpen?'selected':''}`} onClick={()=>setNotificationOpen(v=>!v)}><Icon name="bell" size={17}/><i/></button>
          {notificationOpen&&<NotificationPanel/>}</div>
          <span className="top-avatar">JD</span>
        </div>
      </header>
      {children}
    </main>
  </div>
}

function NotificationPanel(){
 return <div className="notification-panel">
   <div className="notif-head"><strong>Notifications</strong><b>4 new</b><button>Mark all read</button></div>
   {notifications.map((n,i)=><div className="notif-item" key={i}>{toneIcon(['mint','amber','purple','pink','blue'][i],n[2])}<div><strong>{n[0]}</strong><p>{n[1]}</p><small>{n[3]}</small></div><i/></div>)}
   <button className="notif-settings">Notification settings</button>
 </div>
}

function DashboardPage(){
 const params=new URLSearchParams(window.location.search)
 const initialAdd=params.get('add')
 const initialState=params.get('state')
 const initialAi=initialState==='ai' || params.get('ai')==='1'
 const initialSaved=initialState==='saved'
 const [dark,setDark]=useState(params.get('theme')==='dark'),[notificationOpen,setNotificationOpen]=useState(params.get('state')==='notifications'),[modal,setModal]=useState(initialAdd||(initialAi?'expense':null)),[toast,setToast]=useState(initialSaved),[search,setSearch]=useState('')
 const [expense,setExpense]=useState(initialAi?4.50:0)
 const [saved,setSaved]=useState(initialSaved)
 const loading=initialState==='loading'
 const aiSuggestion=initialAi

 const transactions=useMemo(()=>baseTransactions.filter(t=>t.name.toLowerCase().includes(search.toLowerCase())),[search])
 const spent=saved?747.30:742.80
 const remaining=870-spent
 const addExpense=()=>{setSaved(true);setModal(null);setToast(true);setTimeout(()=>setToast(false),3500)}
 return <DashboardShell dark={dark} setDark={setDark} notificationOpen={notificationOpen} setNotificationOpen={setNotificationOpen} search={search} setSearch={setSearch}>
   <section className="dash-content">
    <div className="dash-heading"><div><label>WEDNESDAY, SEPTEMBER 23</label><h1>Good morning, Jordan</h1><p>Here's how your September money is moving.</p></div><div className="heading-actions"><button className="outline-btn"><Icon name="upload" size={15}/> Import CSV</button><button className="income-btn" onClick={()=>setModal('income')}><Icon name="arrowup" size={15}/> Add income</button><button className="primary-btn" onClick={()=>setModal('expense')}><Icon name="plus" size={16}/> Add expense</button></div></div>
    <div className="dashboard-grid">
      <BalanceCard spent={spent}/>
      <BudgetCard spent={spent}/>
      <TopCategory/>
      <SpendingCard spent={spent} loading={loading}/>
      <div className="right-stack"><InsightCard loading={loading} onRead={()=>{}}/><SavingTips/></div>
      <CategoryBudgets saved={saved}/>
      <RecentTransactions saved={saved} transactions={transactions}/>
    </div>
   </section>
   {modal==='expense'&&<TransactionModal ai={aiSuggestion} amount={expense} setAmount={setExpense} onClose={()=>setModal(null)} onSave={addExpense}/>}
   {modal==='income'&&<TransactionModal income amount={600} setAmount={()=>{}} onClose={()=>setModal(null)} onSave={()=>setModal(null)}/>}
   {toast&&<div className="toast"><span>✓</span><div><strong>Expense saved</strong><small>$4.50 to Academics · budget 74% used</small></div><button onClick={()=>setToast(false)}>Undo</button></div>}
 </DashboardShell>
}

function BalanceCard({spent}){const balance=(1220-spent).toFixed(2);const [whole,cents]=balance.split('.');return <div className="balance-card"><div className="balance-top"><span>SEPTEMBER BALANCE</span><Icon name="eye" size={18}/></div><div className="balance-amount"><strong>${whole}</strong><em>.{cents}</em></div><p>Income minus expenses, Sep 1 to 23</p><div className="balance-stats"><div>{toneIcon('blue','downleft')}<span>Income<b>$1,220.00</b></span></div><div>{toneIcon('blue','upright')}<span>Expenses<b>${spent.toFixed(2)}</b></span></div></div></div>}
function BudgetCard({spent}){let pct=Math.round(spent/870*100);return <div className="dash-card budget-card"><div className="card-title"><div><strong>Budget vs actual</strong><small>September 1 to 30</small></div><Icon name="more" size={18}/></div><div className="budget-body"><div className="donut" style={{'--p':`${pct*3.6}deg`}}><b>{pct}%</b><small>used</small></div><div><span>Spent<b>${spent.toFixed(2)}</b></span><span>Budget<b>$870.00</b></span><span>Remaining<b className="green-text">${(870-spent).toFixed(2)}</b></span></div></div><div className="days-left">◷ &nbsp;8 days left · about ${((870-spent)/8).toFixed(2)} a day</div></div>}
function TopCategory(){return <div className="dash-card top-category"><div className="card-title"><strong>Top category</strong><Icon name="more" size={18}/></div><div className="cat-highlight">{toneIcon('purple','home')}<div><strong>Hostel/Rent</strong><span>$300.00 · 40.4% of spend</span></div></div><div className="purple-track"><i/></div><small>Runner-up <b>Food · $214.60</b></small><p>Rent is fixed; Food is your biggest flexible spend.</p></div>}
function SpendingCard({spent,loading}){return <div className="dash-card spending-card"><div className="card-title"><div><strong>Spending pace</strong><small>Cumulative spend, September 1 to 23, against your $870 budget</small></div><div className="seg"><button className="active">Month</button><button>Week</button></div></div>{loading?<><div className="spend-loading-total"><span className="skeleton"/><span className="skeleton short"/></div><div className="chart-skeleton"><span/><span/><span/><span/><span/><span/></div></>:<><div className="spend-total"><strong>${spent.toFixed(2)}</strong><span>↘ 8.9% less than Aug 23</span></div><div className="fake-chart"><div className="budget-line">Budget $870</div><svg viewBox="0 0 520 190" preserveAspectRatio="none"><defs><linearGradient id="fillg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9de1c8" stopOpacity=".65"/><stop offset="1" stopColor="#9de1c8" stopOpacity=".08"/></linearGradient></defs><path d="M0 140 C65 112 120 120 180 105 S270 100 320 75 S420 65 520 30 L520 190 L0 190Z" fill="url(#fillg)"/><path d="M0 140 C65 112 120 120 180 105 S270 100 320 75 S420 65 520 30" fill="none" stroke="#008b62" strokeWidth="2.5"/><circle cx="520" cy="30" r="4" fill="#fff" stroke="#008b62" strokeWidth="2"/></svg><div className="chart-labels"><span>$0</span><span>$300</span><span>$600</span><span>$900</span></div></div><div className="spend-stats"><span>Daily average<b>$32.30</b></span><span>Biggest day<b>Sep 1 · $312.40</b></span><span>No-spend days<b>4 of 23</b></span></div></>}</div>}
function InsightCard({loading}){return <div className="insight-card"><div className="insight-title">{toneIcon('mint','sparkle')}<strong>September insight</strong><Icon name="bookmark" size={16}/></div>{loading?<><div className="skeleton"/><div className="skeleton mid"/><div className="skeleton short"/><p className="analysing">◔ Analysing 47 September transactions...</p></>:<><p>Food delivery rose 40% this month ($60.00 in August to $84.00 so far). A $15 weekly delivery cap would save about $24 by month end.</p><button>Read full insight <Icon name="arrow" size={15}/></button><small>AI suggestion · advisory only</small></>}</div>}
function SavingTips(){return <div className="dash-card tips-card"><div className="card-title"><div><strong>Top saving tips</strong><small>Ranked by potential monthly savings</small></div><button>View all</button></div>{[['food','amber','Cap food delivery at $15 a week','Save ~$24/mo'],['bus','blue','Take the campus shuttle twice a week','Save ~$18/mo'],['tv','pink','Keep one streaming service, pause the other','Save $9.99/mo']].map((x,i)=><div className="tip-row" key={i}>{toneIcon(x[1],x[0])}<div><strong>{x[2]}</strong><small>{x[3]}</small></div><button>♧</button><button>×</button></div>)}</div>}
function CategoryBudgets({saved}){return <div className="dash-card category-budgets"><div className="card-title"><div><strong>Category budgets</strong><small>Real-time consumption, September</small></div><button>Manage</button></div>{categories.map((c,i)=>{let val=c.value+(saved&&c.name==='Academics'?4.5:0),pct=Math.min(100,val/c.budget*100);return <div className="budget-row" key={c.name}>{toneIcon(c.tone,c.icon)}<div className="budget-row-main"><div><strong>{c.name}</strong><span>${val.toFixed(2)} / ${c.budget.toFixed(2)}</span></div><div className="progress"><i style={{width:`${pct}%`}} className={pct>100?'over':''}/></div><small>{pct>100?`Over by $${(val-c.budget).toFixed(2)}`:`${Math.round(pct)}%${pct>85?' · near limit':''}`}</small></div></div>})}</div>}
function RecentTransactions({saved}){let list=[...(saved?[{id:9,name:'Printing, lecture notes',category:'Academics',date:'Sep 23',amount:-4.5,icon:'grad',tone:'teal',ai:true}]:[]),...baseTransactions];return <div className="dash-card recent-card"><div className="card-title"><div><strong>Recent transactions</strong><small>Latest activity across income and expenses</small></div><button onClick={()=>navigate('/transactions')}>View all</button></div>{list.slice(0,5).map(t=><div className="recent-row" key={t.id}>{toneIcon(t.tone,t.icon)}<div><strong>{t.name} {t.ai&&<em>✦ AI</em>}</strong><small>{t.category} · {t.date}</small></div><b className={t.amount>0?'positive':''}>{money(t.amount)}</b></div>)}</div>}

function TransactionModal({ai,income=false,amount,setAmount,onClose,onSave}){
 const [description,setDescription]=useState(ai?'Printing, lecture notes':'')
 const [category,setCategory]=useState(ai?'Academics':'')
 return <div className="modal-backdrop"><div className={`transaction-modal ${ai?'ai-modal':''}`}><div className="modal-head"><div><h2>Add transaction</h2><p>Log it in seconds. Categories are suggested as you type.</p></div><button onClick={onClose}><Icon name="close" size={18}/></button></div><div className="expense-tabs"><button className={!income?'active':''}>Expense</button><button className={income?'active':''}>Income</button></div><label>Amount<div className="amount-input"><span>$</span><input value={amount.toFixed(2)} onChange={e=>setAmount?.(Number(e.target.value)||0)}/></div></label><label>Description<div className="field-input"><Icon name="receipt" size={16}/><input value={description} onChange={e=>setDescription(e.target.value)} placeholder="e.g. Campus Cafe, bus fare, textbook"/></div></label>{(ai||description.trim().length>0)&&<div className="ai-suggestion">{toneIcon('mint','sparkle')}<div><strong>Suggested category: Academics</strong><small>91% match · based on “printing” and your past entries</small></div><button>Change</button></div>}<div className="category-select"><div className="label-row"><label>Category</label><button>Manage categories</button></div><div className="chips">{['Food','Transport','Hostel/Rent','Academics','Subscriptions','Entertainment','Miscellaneous'].map(x=><button key={x} className={category===x?'selected':''} onClick={()=>setCategory(x)}>{x}</button>)}<button>＋ New</button></div></div><div className="date-grid"><label>Date<div className="field-input"><Icon name="calendar" size={16}/><input value="Wed, Sep 23, 2026" readOnly/></div></label><label>Repeat<div className="repeat-field"><Icon name="repeat" size={16}/>Monthly <i/></div></label></div><div className="modal-footer"><small>Press Enter to save · Esc to close</small><button onClick={onClose}>Cancel</button><button className="primary-btn" onClick={onSave}>✓ Save {income?'income':'expense'}</button></div></div></div>
}

export { DashboardShell, NotificationPanel }
export default DashboardPage
