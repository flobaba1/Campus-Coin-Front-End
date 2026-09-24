
import { useState } from 'react'
import { navigate } from '../routes/AppRoutes'
import Icon from '../components/Icon'
import { DashboardShell } from './DashboardPage'

const rows=[
['Campus Cafe','Food','Sep 23, 2026',-8.50,'food','amber','AI'],
['Ride to library','Transport','Sep 22, 2026',-6.20,'bus','blue',''],
['Library desk shift','Part-time Job','Sep 21, 2026',160,'briefcase','mint','Edited'],
['Chop & Go delivery','Food','Sep 20, 2026',-18.40,'food','amber','Duplicate?'],
['Chop & Go delivery','Food','Sep 20, 2026',-18.40,'food','amber','Duplicate?'],
['Stationery pack','Academics','Sep 19, 2026',-12.30,'grad','teal',''],
['Cinema night','Entertainment','Sep 18, 2026',-14,'ticket','peach',''],
['Video streaming','Subscriptions','Sep 15, 2026',-15.99,'tv','pink','Monthly'],
['Music streaming','Subscriptions','Sep 15, 2026',-9.99,'tv','pink','Monthly'],
['Birthday gift for Aunt','Gift','Sep 10, 2026',50,'gift','mint',''],
['Library desk shift','Part-time Job','Sep 7, 2026',160,'briefcase','mint',''],
['Scholarship stipend','Scholarship','Sep 5, 2026',250,'grad','mint',''],
['Calculus textbook','Academics','Sep 3, 2026',-54,'grad','teal','Large'],
['Monthly allowance','Allowance','Sep 1, 2026',600,'wallet','mint','Monthly'],
['Hostel rent','Hostel/Rent','Sep 1, 2026',-300,'home','purple','Monthly'],
]
function money(n){return `${n<0?'−':'+'}$${Math.abs(n).toFixed(2)}`}
function toneIcon(tone,icon){return <span className={`d-icon ${tone}`}><Icon name={icon} size={16}/></span>}
function TransactionsPage(){
 const params=new URLSearchParams(window.location.search)
 const [dark,setDark]=useState(false),[notificationOpen,setNotificationOpen]=useState(false),[search,setSearch]=useState(''),[drawer,setDrawer]=useState(params.get('drawer')==='1'?rows[2]:null)
 const filtered=rows.filter(r=>r[0].toLowerCase().includes(search.toLowerCase()))
 return <DashboardShell dark={dark} setDark={setDark} notificationOpen={notificationOpen} setNotificationOpen={setNotificationOpen} page="Transactions" search={search} setSearch={setSearch}>
  <section className="dash-content transaction-page">
   <div className="dash-heading"><div><label>HISTORY</label><h1>Transactions</h1><p>Every income and expense you have logged. Edits keep a full version history.</p></div><div className="heading-actions"><button className="outline-btn"><Icon name="upload" size={15}/> Import CSV</button><button className="primary-btn" onClick={()=>navigate('/dashboard?add=expense')}><Icon name="plus" size={16}/> Add transaction</button></div></div>
   <div className="metric-row"><Metric icon="arrowup" tone="mint" label="Income · Sep" value="$1,220.00"/><Metric icon="arrowdown" tone="blue" label="Expenses · Sep" value="$742.80"/><Metric icon="wallet" tone="slate" label="Net balance" value="$477.20"/><Metric icon="receipt" tone="slate" label="Entries" value="47"/></div>
   <div className="alert-row"><div className="alert duplicate"><span>▣</span><div><b>Possible duplicate</b><small>Chop & Go delivery, $18.40, was logged twice on Sep 20.</small></div><button>Keep both</button><button>Remove one</button></div><div className="alert large"><span>⚠</span><div><b>Unusually large</b><small>Calculus textbook, $54.00, is 3.1× your average Academics purchase.</small></div><button>Looks right</button><button onClick={()=>setDrawer(rows[12])}>Edit</button></div></div>
   <div className="transactions-layout"><div className="table-card"><div className="table-tools"><div className="table-search"><Icon name="search" size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search description or amount"/></div><div className="pill-tabs"><button className="active">All</button><button>Income</button><button>Expenses</button></div><button className="filter-btn">All categories⌄</button><button className="filter-btn">▣ Sep 1 to 30, 2026</button></div><table><thead><tr><th>DESCRIPTION</th><th>CATEGORY</th><th>DATE</th><th>AMOUNT</th><th/></tr></thead><tbody>{filtered.map((r,i)=><tr key={i} className={r[6]?.includes('Duplicate')?'highlight-row':''}><td><div className="table-desc">{toneIcon(r[5],r[4])}<span><b>{r[0]}</b>{r[6]&&<em className={r[6]==='Large'?'warn':''}>{r[6]}</em>}</span></div></td><td><span className={`category-pill ${r[5]}`}>• {r[1]}</span></td><td>{r[2]}</td><td className={r[3]>0?'positive':''}><b>{money(r[3])}</b></td><td><button onClick={()=>setDrawer(r)}><Icon name="edit" size={15}/></button><button><Icon name="trash" size={15}/></button></td></tr>)}</tbody></table><div className="pagination"><span>Showing 1 to {filtered.length} of 47</span><div><button>‹</button><button className="active">1</button><button>2</button><button>3</button><button>4</button><button>›</button></div></div></div><aside className="transaction-side"><SideList title="Recently viewed" items={['Calculus textbook','Hostel rent','Video streaming']}/><SideList title="Recently edited" items={['Library desk shift','Campus Cafe']}/><div className="dash-card recurring"><h3>Recurring</h3><small>Auto-logged each month</small>{[['Monthly allowance','+$600.00','Next Oct 1'],['Hostel rent','−$300.00','Next Oct 1'],['Video streaming','−$15.99','Next Oct 15'],['Music streaming','−$9.99','Next Oct 15']].map(x=><div><Icon name="repeat" size={14}/><span>{x[0]}</span><b>{x[1]}<small>{x[2]}</small></b></div>)}</div></aside></div>
  </section>
  {drawer&&<TransactionDrawer row={drawer} onClose={()=>setDrawer(null)}/>}
 </DashboardShell>
}
function Metric({icon,tone,label,value}){return <div className="metric-card">{toneIcon(tone,icon)}<span>{label}<b>{value}</b></span></div>}
function SideList({title,items}){return <div className="dash-card side-list"><h3>{title}</h3><small>Synced across your devices</small>{items.map((x,i)=><div key={x}>{toneIcon(['teal','purple','pink'][i%3],'grad')}<span><b>{x}</b><small>{i?'Viewed yesterday':'Viewed 2h ago'}</small></span></div>)}</div>}
function TransactionDrawer({row,onClose}){return <div className="modal-backdrop"><aside className="transaction-drawer"><div className="drawer-head"><h2>Transaction details</h2><button onClick={onClose}><Icon name="close" size={18}/></button></div><div className="drawer-summary">{toneIcon(row[5],row[4])}<div><b>{row[0]}</b><small>Income · Sep 21, 2026</small></div><strong>{money(row[3])}</strong></div><div className="expense-tabs"><button className={row[3]<0?'active':''}>Expense</button><button className={row[3]>0?'active':''}>Income</button></div>{[['Amount',money(row[3])],['Description',row[0]],['Category','Part-time Job'],['Date','Mon, Sep 21, 2026'],['Note (optional)','Weekend shift, paid by transfer']].map(x=><label key={x[0]}>{x[0]}<div className="field-input"><input value={x[1]} readOnly/></div></label>)}<div className="edit-history"><b>◷ Edit history <em>2 versions</em></b><p>● Amount changed from $150.00 to $160.00<br/><small>You · Sep 21, 6:04 PM</small></p><p>● Created with category Part-time Job (AI suggestion accepted)<br/><small>You · Sep 21, 5:58 PM</small></p></div><div className="drawer-footer"><button className="danger">Delete</button><button onClick={onClose}>Cancel</button><button className="primary-btn" onClick={onClose}>✓ Save changes</button></div></aside></div>}
export default TransactionsPage
