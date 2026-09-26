import Logo from '../components/Logo'
import Icon from '../components/Icon'
import { navigate } from '../routes/AppRoutes'
import '../styles/sitemap.css'

const publicLinks = [
  { label: 'Home', path: '/' },
  { label: 'How it works', path: '/#how' },
  { label: 'For campuses', path: '/campuses' },
  { label: 'Sign in', path: '/sign-in' },
  { label: 'Create account', path: '/sign-up' },
  { label: 'Sign-up', path: '/sign-up', nested: true },
  { label: 'Forgot password', path: '/forgot-password' },
  { label: 'Onboarding', path: '/onboarding' },
  { label: 'Admin sign-in', path: '/admin/sign-in' },
  { label: 'Privacy & Terms', path: '/privacy' },
  { label: 'Sitemap', path: '/sitemap' },
]

function SiteLink({ item }) {
  const go = () => {
    if (item.path.startsWith('/#')) {
      navigate('/')

      window.setTimeout(() => {
        const id = item.path.slice(2)
        document.getElementById(id)?.scrollIntoView({
          behavior: 'smooth',
        })
      }, 30)

      return
    }

    navigate(item.path)
  }

  return (
    <button
      className={`sitemap-link${item.nested ? ' nested' : ''}`}
      onClick={go}
      type="button"
    >
      <span className="sitemap-link-label">
        {item.nested && <Icon name="chevron" size={13} />}
        <span>{item.label}</span>
      </span>

      <span className="sitemap-path">
        {item.displayPath || item.path}
      </span>
    </button>
  )
}

function SitemapCard({ kind, title, subtitle, links }) {
  const icon =
    kind === 'public'
      ? 'home'
      : kind === 'student'
        ? 'user'
        : 'shield'

  return (
    <section className={`sitemap-card sitemap-card-${kind}`}>
      <div className="sitemap-card-heading">
        <span className={`sitemap-card-icon ${kind}`}>
          <Icon name={icon} size={22} />
        </span>

        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="sitemap-divider" />

      <div className="sitemap-links">
        {links.map((item) => (
          <SiteLink
            key={`${item.label}-${item.path}`}
            item={item}
          />
        ))}
      </div>
    </section>
  )
}

function SitemapPage() {
  return (
    <div className="sitemap-page">
      <header className="sitemap-header">
        <button
          className="sitemap-brand"
          onClick={() => navigate('/')}
          type="button"
          aria-label="Go to CampusCoin home"
        >
          <Logo />
        </button>

        <nav
          className="sitemap-nav"
          aria-label="Main navigation"
        >
          <button
            onClick={() => navigate('/#features')}
            type="button"
          >
            Features
          </button>

          <button
            onClick={() => navigate('/#how')}
            type="button"
          >
            How it works
          </button>

          <button
            onClick={() => navigate('/campuses')}
            type="button"
          >
            For campuses
          </button>

          <button
            className="active"
            onClick={() => navigate('/sitemap')}
            type="button"
          >
            Sitemap
          </button>
        </nav>

        <div className="sitemap-actions">
          <button
            className="sitemap-signin"
            onClick={() => navigate('/sign-in')}
            type="button"
          >
            Sign in
          </button>

          <button
            className="sitemap-cta"
            onClick={() => navigate('/sign-up')}
            type="button"
          >
            Get started free
          </button>
        </div>
      </header>

      <main className="sitemap-main">
        <div
          className="sitemap-breadcrumb"
          aria-label="Breadcrumb"
        >
          <button
            onClick={() => navigate('/')}
            type="button"
          >
            <Icon name="home" size={15} />
          </button>

          <Icon name="chevron" size={12} />

          <span>Sitemap</span>
        </div>

        <div className="sitemap-intro">
          <h1>Sitemap</h1>

          <p>
            Find every publicly accessible CampusCoin page and
            see where signed-in areas begin.
          </p>
        </div>

        <div className="sitemap-grid">
          <SitemapCard
            kind="public"
            title="Public"
            subtitle="Open to everyone"
            links={publicLinks}
          />
        </div>
      </main>
    </div>
  )
}

export default SitemapPage