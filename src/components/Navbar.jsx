import { useEffect, useRef, useState } from 'react'
import Logo from './Logo'
import Button from './Button'
import { navigate } from '../routes/AppRoutes'
import ThemeToggle from './ThemeToggle'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navbarRef = useRef(null)
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    if (!menuOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu()
    }
    const handlePointerDown = (event) => {
      if (!navbarRef.current?.contains(event.target)) closeMenu()
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [menuOpen])

  return (
    <header ref={navbarRef} className={`navbar${menuOpen ? ' menu-open' : ''}`}>
      <button
        className="logo-button"
        onClick={() => scrollTo("top")}
        aria-label="CampusCoin home"
      >
        <Logo />
      </button>
      <nav className="nav-links" id="primary-navigation" aria-label="Primary navigation">        
        <button onClick={() => { scrollTo("features"); closeMenu() }}>Features</button>
        <button onClick={() => { scrollTo("how-it-works"); closeMenu() }}>How it works</button>
        <button onClick={() => { scrollTo("privacy"); closeMenu() }}>For campuses</button>
        <button onClick={() => { navigate("/sitemap"); closeMenu() }}>Sitemap</button>
        <div className="mobile-nav-account-actions">
          <button className="nav-sign-in mobile-nav-sign-in" onClick={() => { navigate('/sign-in'); closeMenu() }}>Sign in</button>
          <Button className="mobile-nav-cta" onClick={() => { navigate('/sign-up'); closeMenu() }}>Get started free</Button>
        </div>
      </nav>
      <div className="nav-actions">
        <ThemeToggle />
        <button className="nav-sign-in" onClick={() => navigate('/sign-in')}>Sign in</button>
        <Button onClick={() => navigate('/sign-up')}>Get started free</Button>
        <button
          className="nav-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
