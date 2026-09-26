import { useEffect } from 'react'
import AuthBrandPanel from '../components/AuthBrandPanel'
import Logo from '../components/Logo'
import Icon from '../components/Icon'
import { navigate } from '../routes/AppRoutes'
import '../styles/auth.css'

function AuthLayout({
  children,
  title,
  subtitle,
  icon = 'mail',
  brand = true,
  admin = false,
  className = '',
  brandEyebrow,
  brandTitle,
  brandDescription,
  topContent,
}) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (admin) {
    return <div className={`admin-shell ${className}`}>{children}</div>
  }

  return (
    <div className={`auth-shell ${className}`}>
      {brand && (
        <AuthBrandPanel
          eyebrow={brandEyebrow}
          title={brandTitle}
          description={brandDescription}
        />
      )}

      <main className="auth-form-panel">
        <div className="auth-form-inner">
          <button
            className="mobile-auth-logo"
            onClick={() => navigate('/')}
          >
            <Logo />
          </button>

          {/* Optional content displayed above the title/icon */}
          {topContent}

          <div className="auth-title-block">
            <div className="auth-title-icon">
              <Icon
                name={icon === 'user' ? 'grad' : icon}
                size={26}
              />
            </div>

            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          {children}
        </div>
      </main>
    </div>
  )
}

export default AuthLayout