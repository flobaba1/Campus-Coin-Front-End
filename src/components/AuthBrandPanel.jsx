import Logo from './Logo'
import Icon from './Icon'
import { navigate } from '../routes/AppRoutes'

function AuthBrandPanel({ eyebrow = 'Student finance, simplified', title = 'Know where your allowance goes. Keep more of it.', description = 'Log allowance, gigs and scholarships, set simple budgets, and understand your spending without connecting a bank account.' }) {
  return (
    <aside className="auth-brand-panel">
      <button className="auth-brand-logo" onClick={() => navigate('/')} aria-label="CampusCoin home"><Logo /></button>

      <div className="auth-brand-copy">
        <span className="auth-brand-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="auth-preview-stack" aria-hidden="true">
        <div className="auth-preview-transaction">
          <div className="auth-preview-icon"><Icon name="food" size={19} /></div>
          <div><b>Campus Cafe</b><span><Icon name="sparkles" size={12} /> AI sorted this into Food</span></div>
          <strong>−$8.50</strong>
        </div>
        <div className="auth-preview-budget">
          <div><span>Food budget</span><b>$214.60 of $250.00</b></div>
          <i><em /></i>
        </div>
      </div>

      <div className="auth-brand-benefits">
        <span><Icon name="circlecheck" size={15} /> No bank login needed</span>
        <span><Icon name="circlecheck" size={15} /> Private by default</span>
        <span><Icon name="circlecheck" size={15} /> Free for students</span>
      </div>
      <div className="auth-rings" aria-hidden="true"><i /><i /><i /></div>
    </aside>
  )
}

export default AuthBrandPanel
