import AuthLayout from '../layouts/AuthLayout'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { navigate } from '../routes/AppRoutes'
function PasswordUpdatedPage() {
 return <AuthLayout title="Password updated" subtitle="You can now sign in with your new password." icon="check" brandEyebrow="PASSWORD HELP" brandTitle="Locked out? It happens during exams." brandDescription="Reset your password securely and get back to your CampusCoin account in just a few steps.">
   <div className="password-updated-mark"><Icon name="circlecheck" size={28}/></div>
   <Button className="auth-submit" onClick={() => navigate('/sign-in')}>Continue to sign in</Button>
 </AuthLayout>
}
export default PasswordUpdatedPage
