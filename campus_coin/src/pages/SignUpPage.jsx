import { useState } from 'react'
import AuthLayout from '../layouts/AuthLayout'
import AuthField from '../components/AuthField'
import Button from '../components/Button'
import { navigate } from '../routes/AppRoutes'

function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  return (
    <AuthLayout title="Create your account" subtitle="Set up CampusCoin in about two minutes." icon="user">
      <form className="auth-form" onSubmit={(e) => { e.preventDefault(); navigate('/onboarding') }}>
        <AuthField label="Full name" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
        <AuthField label="University email" type="email" placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} />
        <AuthField label="Password" type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} hint="At least 12 characters, including a number and a symbol." />
        <label className="auth-checkbox"><input type="checkbox" required /><span>I agree to the Terms and Privacy Policy.</span></label>
        <Button type="submit" className="auth-submit">Create account</Button>
      </form>
      <p className="auth-switch">Already have an account? <button onClick={() => navigate('/sign-in')}>Sign in</button></p>
    </AuthLayout>
  )
}
export default SignUpPage
