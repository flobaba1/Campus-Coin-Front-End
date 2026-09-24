import AuthLayout from '../layouts/AuthLayout'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { navigate } from '../routes/AppRoutes'
function CheckInboxPage() {
  return <AuthLayout title="Check your inbox" subtitle="We sent a reset link to jordan@university.edu. The link expires in 30 minutes." icon="mail">
    <div className="auth-info-box"><Icon name="info" size={17}/><p>Not there? Check spam or promotions. Links from CampusCoin are sent from our verified domain.</p></div>
    <Button className="auth-submit" onClick={() => navigate('/reset-password')}>Open email app</Button>
    <Button variant="secondary" className="auth-resend" onClick={() => {}}>Resend link in 0:45</Button>
    <button className="auth-back-link" onClick={() => navigate('/sign-in')}><span>←</span> Back to sign in</button>
  </AuthLayout>
}
export default CheckInboxPage
