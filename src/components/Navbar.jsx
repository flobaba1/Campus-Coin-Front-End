import Logo from './Logo'
import Button from './Button'
import { navigate } from '../routes/AppRoutes'
import ThemeToggle from './ThemeToggle'

function Navbar() {
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <header className="navbar">
      <button
        className="logo-button"
        onClick={() => scrollTo("top")}
        aria-label="CampusCoin home"
      >
        <Logo />
      </button>
      <nav className="nav-links" aria-label="Primary navigation">
        <button onClick={() => scrollTo("features")}>Features</button>
        <button onClick={() => scrollTo("how-it-works")}>How it works</button>
        <button onClick={() => scrollTo("privacy")}>For campuses</button>
        <button onClick={() => navigate("/sitemap")}>Sitemap</button>
      </nav>
      <div className="nav-actions"><ThemeToggle />
        <button className="nav-sign-in" onClick={() => navigate('/sign-in')}>Sign in</button>
        <Button onClick={() => navigate('/sign-up')}>Get started free</Button>
      </div>
    </header>
  );
}

export default Navbar;
