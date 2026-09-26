import { useState } from 'react'
import AuthLayout from '../layouts/AuthLayout'
import AuthField from '../components/AuthField'
import Button from '../components/Button'
import { navigate } from '../routes/AppRoutes'
function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  return <AuthLayout title="Forgot your password?" subtitle="Enter your email and we'll send you a secure reset link." icon="mail" brandEyebrow="PASSWORD HELP" brandTitle="Locked out? It happens during exams." brandDescription="Reset your password securely and get back to your CampusCoin account in just a few steps.">
    <form className="auth-form" onSubmit={e => {e.preventDefault(); navigate('/check-inbox')}}>
      <AuthField label="University email" type="email" placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} />
      <Button type="submit" className="auth-submit">Send OTP</Button>
    </form>
    <button className="auth-back-link" onClick={() => navigate('/sign-in')}><span>←</span> Back to sign in</button>
  </AuthLayout>
}
export default ForgotPasswordPage
