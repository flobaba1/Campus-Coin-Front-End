import { useState, useEffect } from 'react'

import AuthLayout from '../layouts/AuthLayout'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { navigate } from '../routes/AppRoutes'

function CheckInboxPage() {
  const [resendSeconds, setResendSeconds] = useState(45)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (resendSeconds <= 0) return

    const timer = setInterval(() => {
      setResendSeconds((prev) => Math.max(prev - 1, 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [resendSeconds])

  const formatResendTime = () => {
    const minutes = Math.floor(resendSeconds / 60)
    const seconds = resendSeconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  function handleOtpChange(event) {
    const value = event.target.value.replace(/\D/g, '').slice(0, 6)

    setOtp(value)
    setError('')
  }

  function handleVerifyOtp(event) {
    event.preventDefault()

    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP sent to your email.')
      return
    }

    // Temporary verification.
    // Connect this to the backend OTP verification endpoint later.

    navigate('/reset-password')
  }

  function handleResendOtp() {
    if (resendSeconds > 0) return

    setError('')

    // Connect to the backend resend-OTP endpoint later.

    setResendSeconds(45)
  }

  return (
    <AuthLayout
      title="Check your OTP"
      subtitle="We sent a 6-digit OTP to jordan@university.edu. The OTP expires in 10 minutes."
      icon="mail"
      brandEyebrow="PASSWORD HELP"
      brandTitle="Locked out? It happens during exams."
      brandDescription="Reset your password securely and get back to your CampusCoin account in just a few steps."
    >
      <form onSubmit={handleVerifyOtp}>
        <div className="auth-info-box">
          <Icon name="info" size={17} />

          <p>
            Enter the 6-digit OTP sent to your email address. Check your spam
            or promotions folder if you cannot find it.
          </p>
        </div>

        <div className="auth-field otp-field">
          <label htmlFor="otp">OTP</label>

          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={handleOtpChange}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            aria-describedby={error ? 'otp-error' : undefined}
          />
        </div>

        {error && (
          <div className="auth-error" id="otp-error" role="alert">
            {error}
          </div>
        )}

        <Button type="submit" className="auth-submit">
          Verify OTP
        </Button>

        <Button
          type="button"
          variant="secondary"
          className="auth-resend"
          onClick={handleResendOtp}
          disabled={resendSeconds > 0}
        >
          {resendSeconds > 0
            ? `Resend OTP in ${formatResendTime()}`
            : 'Resend OTP'}
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

export default CheckInboxPage