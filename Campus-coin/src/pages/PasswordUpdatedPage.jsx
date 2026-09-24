import AuthLayout from '../layouts/AuthLayout'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { navigate } from '../routes/AppRoutes'
function PasswordUpdatedPage() {
 return <AuthLayout title="Password updated" subtitle="You can now sign in with your new password." icon="check">
   <div className="password-updated-mark"><Icon name="circlecheck" size={28}/></div>
   <Button className="auth-submit" onClick={() => navigate('/sign-in')}>Continue to sign in</Button>
 </AuthLayout>
}
export default PasswordUpdatedPage
