import { useState } from 'react'

import AuthLayout from '../layouts/AuthLayout'
import AuthField from '../components/AuthField'
import Button from '../components/Button'

import { navigate } from '../routes/AppRoutes'

import { signin } from '../api/authApi'
import { setStudentSession } from '../utils'

function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')

  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)

    try {
      console.log('CampusCoin signin request:', {
        email: email.trim(),
        password: '********',
      })

      /*
       * Call:
       * POST /api/auth/signin
       */
      const response = await signin(
        email.trim(),
        password
      )

      console.log(
        'CampusCoin signin response:',
        response
      )

      /*
       * We don't yet know the exact structure of the
       * backend signin response.
       *
       * For now, preserve the response so we can inspect
       * it in Developer Tools.
       */
      if (response) {
        try {
          setStudentSession(response)
        } catch (sessionError) {
          console.warn(
            'Could not save backend signin response as session:',
            sessionError
          )
        }
      }

      navigate('/dashboard')
    } catch (error) {
      console.error(
        'CampusCoin signin failed:',
        error
      )

      setError(
        error.message ||
          'Unable to sign in. Please check your email and password.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your CampusCoin account."
      icon="lock"
      brandEyebrow="SMART MONEY, STUDENT STYLE"
      brandTitle="Smart spending, student style."
      brandDescription="Log your allowance, gigs and scholarships, set simple budgets, and understand your spending without connecting a bank account."
    >
      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >
        <AuthField
          label="Email address"
          type="email"
          placeholder="you@university.edu"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
        />

        <div>
          <AuthField
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />

          <button
            type="button"
            className="auth-inline-link"
            onClick={() => navigate('/forgot-password')}
            disabled={loading}
          >
            Forgot password?
          </button>
        </div>

        {error && (
          <div
            className="auth-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <p className="auth-switch">
        New to CampusCoin?{' '}
        <button
          type="button"
          onClick={() => navigate('/sign-up')}
          disabled={loading}
        >
          Create an account
        </button>
      </p>

      <div className="auth-admin-link">
        <span>Campus admin?</span>

        <button
          type="button"
          onClick={() => navigate('/admin/sign-in')}
          disabled={loading}
        >
          Sign in to admin console
        </button>
      </div>
    </AuthLayout>
  )
}

export default SignInPage