import { useState } from 'react'
import AuthLayout from '../layouts/AuthLayout'
import AuthField from '../components/AuthField'
import Button from '../components/Button'
import { navigate } from '../routes/AppRoutes'
function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  return <AuthLayout title="Forgot your password?" subtitle="Enter your email and we'll send you a secure reset link." icon="mail">
    <form className="auth-form" onSubmit={e => {e.preventDefault(); navigate('/check-inbox')}}>
      <AuthField label="University email" type="email" placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} />
      <Button type="submit" className="auth-submit">Send reset link</Button>
    </form>
    <button className="auth-back-link" onClick={() => navigate('/sign-in')}><span>←</span> Back to sign in</button>
  </AuthLayout>
}
export default ForgotPasswordPage
