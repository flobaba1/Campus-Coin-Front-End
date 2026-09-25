import { useState } from 'react'
import AuthLayout from '../layouts/AuthLayout'
import AuthField from '../components/AuthField'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { navigate } from '../routes/AppRoutes'
function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  return <AuthLayout title="Choose a new password" subtitle="Link verified for jordan@university.edu. Create a password you have not used before." icon="lock">
    <form className="auth-form" onSubmit={e => {e.preventDefault(); navigate('/password-updated')}}>
      <AuthField label="New password" type="password" placeholder="Enter a new password" value={password} onChange={e => setPassword(e.target.value)} />
      <AuthField label="Confirm new password" type="password" placeholder="Repeat your new password" value={confirm} onChange={e => setConfirm(e.target.value)} />
      <div className="password-rules">
        <span><Icon name="circlecheck" size={15}/> At least 12 characters</span>
        <span><Icon name="circlecheck" size={15}/> Includes a number and a symbol</span>
        <span><Icon name="circlecheck" size={15}/> Different from your last password</span>
      </div>
      <Button type="submit" className="auth-submit">Update password</Button>
    </form>
  </AuthLayout>
}
export default ResetPasswordPage
