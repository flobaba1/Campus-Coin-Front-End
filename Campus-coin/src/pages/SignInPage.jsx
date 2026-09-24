import { useState } from 'react'
import AuthLayout from '../layouts/AuthLayout'
import AuthField from '../components/AuthField'
import Button from '../components/Button'
import { navigate } from '../routes/AppRoutes'
import { loadDemoUsers, setStudentSession } from '../utils'

function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loadDemoUsers()
      const user = data.students.find(item => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password)
      if (!user) {
        setError('Incorrect email or password. For the demo, use olu...@gmail.com / techwiz.')
        return
      }
      setStudentSession(user)
      navigate('/dashboard')
    } catch {
      setError('The demo account file could not be loaded. Please run the app with Vite.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to your CampusCoin account." icon="lock">
      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthField label="Email address" type="email" placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} />
        <div>
          <AuthField label="Password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="button" className="auth-inline-link" onClick={() => navigate('/forgot-password')}>Forgot password?</button>
        </div>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <Button type="submit" className="auth-submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>
      </form>
      <div className="auth-divider"><span>or</span></div>
      <p className="auth-switch">New to CampusCoin? <button onClick={() => navigate('/sign-up')}>Create an account</button></p>
      <div className="auth-admin-link">
        <span>Campus admin?</span>
        <button type="button" onClick={() => navigate('/admin/sign-in')}>Sign in to admin console</button>
      </div>
    </AuthLayout>
  )
}
export default SignInPage
