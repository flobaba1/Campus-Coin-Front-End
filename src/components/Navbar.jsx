import { useState } from 'react'
import Logo from './Logo'
import Button from './Button'
import { navigate } from '../routes/AppRoutes'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const navigateTo = (path) => {
    setMenuOpen(false)
    navigate(path)
  }

  return (
    <header className={`navbar${menuOpen ? ' is-open' : ''}`}>
      <button className="logo-button" onClick={() => scrollTo('top')} aria-label="CampusCoin home">
        <Logo />
      </button>
      <button
        className="nav-menu-toggle"
        type="button"
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      <div className="nav-menu" id="primary-navigation">
        <nav className="nav-links" aria-label="Primary navigation">
          <button onClick={() => scrollTo('features')}>Features</button>
          <button onClick={() => scrollTo('how-it-works')}>How it works</button>
          <button onClick={() => scrollTo('privacy')}>For campuses</button>
          <button onClick={() => navigateTo('/sitemap')}>Sitemap</button>
        </nav>
        <div className="nav-actions">
          <button className="nav-sign-in" onClick={() => navigateTo('/sign-in')}>Sign in</button>
          <Button onClick={() => navigateTo('/sign-up')}>Get started free</Button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
