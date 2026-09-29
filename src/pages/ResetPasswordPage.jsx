import { useEffect, useState } from 'react'
import AuthLayout from '../layouts/AuthLayout'
import AuthField from '../components/AuthField'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { navigate } from '../routes/AppRoutes'
import { resetPassword } from '../api/authApi'

function ResetPasswordPage() {
  const [otpId, setOtpId] = useState('')
  const [email, setEmail] = useState('')

  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('campuscoin.passwordReset')

      if (!stored) {
        navigate('/forgot-password')
        return
      }

      const resetData = JSON.parse(stored)

      if (!resetData?.otpId) {
        sessionStorage.removeItem('campuscoin.passwordReset')
        navigate('/forgot-password')
        return
      }

      setOtpId(resetData.otpId)
      setEmail(resetData.email || '')
    } catch (err) {
      console.error('Failed to load password reset session:', err)
      sessionStorage.removeItem('campuscoin.passwordReset')
      navigate('/forgot-password')
    }
  }, [])

  /*
   * PASSWORD VALIDATION
   *
   * Requirements:
   * - At least 12 characters
   * - At least one number
   * - At least one special character
   */
  const passwordRequirements = {
    minLength: password.length >= 12,
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  const isPasswordValid =
    passwordRequirements.minLength &&
    passwordRequirements.number &&
    passwordRequirements.special

  const passwordsMatch =
    password.length > 0 &&
    confirm.length > 0 &&
    password === confirm

  const canSubmit =
    otp.length === 6 &&
    isPasswordValid &&
    passwordsMatch &&
    !loading

  const handleOtpChange = (event) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, 6)

    setOtp(value)
    setError('')
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
    setError('')
  }

  const handleConfirmChange = (event) => {
    setConfirm(event.target.value)
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    if (!otpId) {
      setError('Your password reset session has expired. Please request a new code.')
      return
    }

    if (otp.length !== 6) {
      setError('Please enter the 6-digit verification code.')
      return
    }

    if (!isPasswordValid) {
      setError(
        'Password must be at least 12 characters and include at least one number and one special character.'
      )
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      await resetPassword(
        otpId,
        otp,
        password
      )

      sessionStorage.removeItem('campuscoin.passwordReset')

      navigate('/password-updated')
    } catch (err) {
      console.error('Password reset failed:', err)

      setError(
        err?.message ||
          'Unable to reset your password. Please check the verification code and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="auth-form-container">
        <div className="auth-header">
          <div className="auth-icon">
            <Icon name="lock" size={22} />
          </div>

          <h1>Reset your password</h1>

          <p>
            Enter the verification code sent to{' '}
            <strong>{email || 'your email'}</strong> and create a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <AuthField
            label="Verification code"
            type="text"
            value={otp}
            onChange={handleOtpChange}
            placeholder="Enter 6-digit code"
            inputMode="numeric"
            maxLength={6}
          />

         <AuthField
  label="New password"
  type="password"
  value={password}
  onChange={handlePasswordChange}
  placeholder="Enter your new password"
  autoComplete="new-password"
/>

          {password.length > 0 && (
            <div className="password-requirements">
              <p>Password requirements:</p>

              <div
                className={
                  passwordRequirements.minLength ? 'valid' : ''
                }
              >
                <Icon
                  name={
                    passwordRequirements.minLength
                      ? 'check'
                      : 'close'
                  }
                  size={13}
                />
                <span>At least 12 characters</span>
              </div>

              <div
                className={
                  passwordRequirements.number ? 'valid' : ''
                }
              >
                <Icon
                  name={
                    passwordRequirements.number
                      ? 'check'
                      : 'close'
                  }
                  size={13}
                />
                <span>At least one number</span>
              </div>

              <div
                className={
                  passwordRequirements.special ? 'valid' : ''
                }
              >
                <Icon
                  name={
                    passwordRequirements.special
                      ? 'check'
                      : 'close'
                  }
                  size={13}
                />
                <span>At least one special character</span>
              </div>
            </div>
          )}

          <AuthField
  label="Confirm new password"
  type="password"
  value={confirm}
  onChange={handleConfirmChange}
  placeholder="Confirm your new password"
  autoComplete="new-password"
/>

          {confirm.length > 0 && (
            <div
              className={`password-match ${
                passwordsMatch ? 'valid' : ''
              }`}
            >
              <Icon
                name={passwordsMatch ? 'check' : 'close'}
                size={13}
              />

              <span>
                {passwordsMatch
                  ? 'Passwords match'
                  : 'Passwords do not match'}
              </span>
            </div>
          )}

          {error && (
            <div className="auth-error">
              <Icon name="alert" size={15} />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="auth-submit"
            disabled={!canSubmit}
          >
            {loading ? 'Updating password...' : 'Update password'}
          </Button>
        </form>

        <button
          type="button"
          className="auth-back-link"
          onClick={() => navigate('/forgot-password')}
        >
          <Icon name="arrow-left" size={15} />
          Back to forgot password
        </button>
      </div>
    </AuthLayout>
  )
}

export default ResetPasswordPage