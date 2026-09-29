import { useState } from 'react'
import AuthLayout from '../layouts/AuthLayout'
import AuthField from '../components/AuthField'
import Button from '../components/Button'
import { navigate } from '../routes/AppRoutes'
import { forgotPassword } from '../api/authApi'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError('Please enter your university email.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await forgotPassword(trimmedEmail)

      if (!response?.otpId) {
        throw new Error('Unable to start password reset. Please try again.')
      }

      /*
       * Store the OTP ID temporarily so the reset page can send it
       * together with the OTP code and new password.
       */
      sessionStorage.setItem(
        'campuscoin.passwordReset',
        JSON.stringify({
          email: trimmedEmail,
          otpId: response.otpId,
        })
      )

      navigate('/reset-password')
    } catch (err) {
      setError(
        err?.message ||
          'Unable to send the OTP. Please check your email and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a secure OTP."
      icon="mail"
      brandEyebrow="PASSWORD HELP"
      brandTitle="Locked out? It happens during exams."
      brandDescription="Reset your password securely and get back to your CampusCoin account in just a few steps."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthField
          label="University email"
          type="email"
          placeholder="you@university.edu"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
        />

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </Button>
      </form>

      <button
        type="button"
        className="auth-back-link"
        onClick={() => navigate('/sign-in')}
      >
        <span>←</span> Back to sign in
      </button>
    </AuthLayout>
  )
}

export default ForgotPasswordPage