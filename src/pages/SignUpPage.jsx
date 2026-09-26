import { useState } from 'react'
import AuthLayout from '../layouts/AuthLayout'
import AuthField from '../components/AuthField'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { navigate } from '../routes/AppRoutes'

function SignUpPage() {
  const savedPayload = window.history.state?.onboardingPayload?.profile || {}
  const [name, setName] = useState(savedPayload.fullName || '')
  const [email, setEmail] = useState(savedPayload.email || '')
  const [password, setPassword] = useState(savedPayload.password || '')
  const [showPassword, setShowPassword] = useState(false)
  const [academicYear, setAcademicYear] = useState(savedPayload.academicYear || 'Year 2')
  const [accepted, setAccepted] = useState(savedPayload.accepted ?? true)

  const passwordRules = [
    ['12+ characters', password.length >= 12],
    ['A number', /\d/.test(password)],
    ['A symbol', /[^A-Za-z0-9]/.test(password)],
    ['Not your email', password && !password.toLowerCase().includes(email.split('@')[0].toLowerCase())],
  ]

  const strong = passwordRules.every(([, ok]) => ok)

  const incomingPayload = window.history.state?.onboardingPayload

  function submit(e) {
    e.preventDefault()
    if (!accepted) return

    navigate('/onboarding', {
      onboardingPayload: {
        ...(incomingPayload || {}),
        profile: {
          ...(incomingPayload?.profile || {}),
          fullName: name,
          email,
          password,
          academicYear,
          accepted,
        },
      },
    })
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes a minute. You can add your goals next."
      icon="user"
      brandEyebrow="FREE FOR STUDENTS"
      brandTitle="Take control of your money in 2 minutes."
      brandDescription="Log allowance, gigs and scholarships, see where every dollar goes, and get plain-language tips from your own habits."
      className="signup-auth"
    >
      <form className="auth-form signup-form" onSubmit={submit}>
        <AuthField label="Full name" placeholder="Jordan Davis" value={name} onChange={e => setName(e.target.value)} icon="user" />
        <AuthField label="Email address" type="email" placeholder="jordan@university.edu" value={email} onChange={e => setEmail(e.target.value)} icon="mail" />

        <div className="auth-field signup-password-field">
          <label>Password</label>
          <div className="auth-input-wrap">
            <Icon name="lock" size={19} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-eye"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(prev => !prev)}
            >
              <Icon name="eye" size={18} />
            </button>
          </div>
          <div className="password-strength-bars" aria-hidden="true">
            {[0, 1, 2, 3].map(i => <i key={i} className={passwordRules[i][1] ? 'is-valid' : ''} />)}
          </div>
          <div className="password-rule-row">
            {passwordRules.map(([label, ok]) => (
              <span key={label} className={ok ? 'is-valid' : ''}>
                <Icon name={ok ? 'checkplain' : 'plus'} size={13} /> {label}
              </span>
            ))}
          </div>
          <strong className={`password-strength-label ${strong ? 'is-valid' : ''}`}>{strong ? 'Strong password' : 'Password requirements'}</strong>
        </div>

        <div className="auth-field">
          <label htmlFor="academic-year">Academic year</label>
          <div className="auth-select-wrap">
            <Icon name="grad" size={18} />
            <select id="academic-year" value={academicYear} onChange={e => setAcademicYear(e.target.value)}>
              <option>Year 1</option>
              <option>Year 2</option>
              <option>Year 3</option>
              <option>Year 4</option>
              <option>Final year</option>
              <option>Postgraduate</option>
            </select>
            <Icon name="chevron" size={16} />
          </div>
        </div>

        <label className="signup-consent">
          <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} required />
          <span>I agree to the Terms and Privacy Policy. CampusCoin gives guidance, not financial advice.</span>
        </label>

        <Button type="submit" className="auth-submit signup-submit">Continue</Button>
      </form>
      <p className="auth-switch signup-switch">Already have an account? <button type="button" onClick={() => navigate('/sign-in')}>Sign in</button></p>
    </AuthLayout>
  )
}

export default SignUpPage
