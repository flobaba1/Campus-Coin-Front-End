import Logo from './Logo'
import { navigate } from '../routes/AppRoutes'

function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-brand">
        <Logo />
        <p className="footer-tagline">Smart spending, student style.</p>
        <p className="footer-note">Guidance only. CampusCoin does not provide financial advice or process payments.</p>
      </div>
      <div className="footer-column">
        <h4>Product</h4>
        <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</button>
        <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How it works</button>
        <button>For campuses</button>
      </div>
      <div className="footer-column">
        <h4>Account</h4>
        <button onClick={() => navigate('/sign-in')}>Sign in</button>
        <button onClick={() => navigate('/sign-up')}>Create account</button>
        <button onClick={() => navigate('/forgot-password')}>Reset password</button>
      </div>
      <div className="footer-column">
        <h4>Site</h4>

        <button
          className="green-link"
          onClick={() => navigate('/sitemap')}
        >
          Sitemap
        </button>

        <button onClick={() => navigate('/privacy')}>
          Privacy
        </button>

        <button onClick={() => navigate('/terms')}>
          Terms
        </button>

        <button onClick={() => navigate('/admin/sign-in')}>
          Admin sign-in
        </button>
      </div>
    </footer>
  )
}

export default Footer
