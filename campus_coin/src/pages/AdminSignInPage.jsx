import { useState } from 'react'
import AuthLayout from '../layouts/AuthLayout'
import AuthField from '../components/AuthField'
import Button from '../components/Button'
import { navigate } from '../routes/AppRoutes'
import { loadDemoUsers, setAdminSession } from '../utils'

function AdminSignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loadDemoUsers()
      const admin = data.admins.find(item =>
        item.email.toLowerCase() === email.trim().toLowerCase() &&
        item.password === password &&
        item.authenticatorCode === code.trim()
      )
      if (!admin) {
        setError('Invalid admin email, password, or authenticator code.')
        return
      }
      setAdminSession(admin)
      navigate('/admin/overview')
    } catch {
      setError('The demo admin account file could not be loaded. Please run the app with Vite.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Campus admin sign in"
      subtitle="Restricted access for authorised CampusCoin administrators."
      icon="shield"
      className="admin-auth"
      brandEyebrow="CampusCoin administration"
      brandTitle="Manage the campus money experience with confidence."
      brandDescription="Review student activity, manage categories, publish guidance, and keep the CampusCoin experience running smoothly."
    >
      <form className="auth-form admin-auth-form" onSubmit={handleSubmit}>
        <AuthField label="Admin email" type="email" placeholder="admin@campuscoin.com" value={email} onChange={e => setEmail(e.target.value)} />
        <AuthField label="Password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} />
        <AuthField label="Authenticator code" placeholder="6-digit code from authenticator" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} code />
        {error && <div className="auth-error" role="alert">{error}</div>}
        <div className="admin-demo-code">
          <span>Demo authenticator code</span>
          <strong>123456</strong>
        </div>
        <Button type="submit" className="auth-submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in to admin console'}</Button>
      </form>
      <p className="auth-switch">Student? <button onClick={() => navigate('/sign-in')}>Use student sign in</button></p>
      <button className="auth-back-link admin-home-link" onClick={() => navigate('/')}>Back to CampusCoin</button>
    </AuthLayout>
  )
}

export default AdminSignInPage
