import Logo from '../components/Logo'
import Icon from '../components/Icon'
import { navigate } from '../routes/AppRoutes'
import '../styles/sitemap.css'

const groups=[
 {title:'Product',links:[['Features','#features'],['How it works','#how-it-works'],['For campuses','#privacy'],['Get started','/sign-up']]},
 {title:'Account',links:[['Sign in','/sign-in'],['Create account','/sign-up'],['Forgot password','/forgot-password'],['Admin console','/admin/sign-in']]},
 {title:'Recovery',links:[['Check your inbox','/check-inbox'],['Set new password','/reset-password'],['Password updated','/password-updated']]},
 {title:'Support',links:[['Privacy','#'],['Terms','#'],['Contact','#']]},
]
function SitemapPage(){
 const go=(path)=> path.startsWith('/') ? navigate(path) : navigate('/')
 return <div className="sitemap-page"><header><button onClick={()=>navigate('/')}><Logo/></button><button className="sitemap-home" onClick={()=>navigate('/')}>Back to site <Icon name="arrow" size={16}/></button></header><main><div className="sitemap-intro"><span>Site</span><h1>Sitemap</h1><p>Everything you need to explore CampusCoin, create an account, recover access, or reach the administration console.</p></div><div className="sitemap-grid">{groups.map(g=><section key={g.title}><h2>{g.title}</h2>{g.links.map(([label,path])=><button key={label} onClick={()=>go(path)}><span>{label}</span><Icon name="arrow" size={15}/></button>)}</section>)}</div></main><footer><Logo/><p>Smart spending, student style.</p></footer></div>
}
export default SitemapPage
