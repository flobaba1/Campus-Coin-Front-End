import { useState } from 'react'

import Button from '../components/Button'
import Icon from '../components/Icon'
import Logo from '../components/Logo'

import { navigate } from '../routes/AppRoutes'
import { loadDemoUsers, setAdminSession } from '../utils'

import '../styles/admin-auth.css'

function AdminSignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')

    if (!email.trim()) {
      setError('Please enter your admin email.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)

    try {
      const data = await loadDemoUsers()

      const admin = data.admins?.find(
        item =>
          item.email?.toLowerCase() ===
            email.trim().toLowerCase() &&
          item.password === password
      )

      if (!admin) {
        setError('Incorrect admin email or password.')
        return
      }

      setAdminSession(admin)

      navigate('/admin/overview')
    } catch (err) {
      console.error('Admin sign-in failed:', err)

      setError(
        'The admin account file could not be loaded. Please run the app with Vite.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-auth-page">
      <header className="admin-auth-header">
        <button
          type="button"
          className="admin-auth-logo"
          onClick={() => navigate('/')}
          aria-label="CampusCoin home"
        >
          <Logo />
        </button>

        <button
          type="button"
          className="admin-console-badge"
        >
          <Icon name="shield" size={13} />
          <span>Admin console</span>
        </button>
      </header>

      <main className="admin-auth-main">
        <section className="admin-auth-card">
          <div className="admin-auth-icon">
            <Icon name="shield" size={25} />
          </div>

          <h1>Administrator sign-in</h1>

          <p className="admin-auth-description">
            Restricted access. Every sign-in and change is
            recorded in the audit log.
          </p>

          <form
            className="admin-auth-form"
            onSubmit={handleSubmit}
          >
            <div className="admin-auth-field">
              <label htmlFor="admin-email">
                Admin email
              </label>

              <div className="admin-auth-input">
                <Icon name="mail" size={18} />

                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  placeholder="admin@campuscoin.app"
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="admin-auth-field">
              <label htmlFor="admin-password">
                Password
              </label>

              <div className="admin-auth-input">
                <Icon name="lock" size={18} />

                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  placeholder="Enter your password"
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() =>
                    setShowPassword(previous => !previous)
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                  disabled={loading}
                >
                  <Icon
                    name={showPassword ? 'eyeoff' : 'eye'}
                    size={18}
                  />
                </button>
              </div>
            </div>

            {error && (
              <div
                className="admin-auth-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="admin-auth-submit"
              disabled={loading}
            >
              <Icon name="shield" size={17} />

              {loading
                ? 'Signing in…'
                : 'Sign in to console'}
            </Button>
          </form>

          <div className="admin-auth-student">
            <span>Student?</span>

            <button
              type="button"
              onClick={() => navigate('/sign-in')}
            >
              Go to student sign-in
            </button>
          </div>
        </section>

        <p className="admin-auth-footer">
          Unauthorised access attempts are blocked after 5
          tries and reported.
        </p>
      </main>
    </div>
  )
}

export default AdminSignInPage