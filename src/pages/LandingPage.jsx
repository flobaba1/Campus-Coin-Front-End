import Navbar from '../components/Navbar'
import Button from '../components/Button'
import FeatureCard from '../components/FeatureCard'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import { navigate } from '../routes/AppRoutes'
import '../styles/landing.css'

const features = [
  { icon: 'plus', title: 'Quick add', text: 'Log income or an expense in under 10 seconds, with recurring entries for allowance and subscriptions.', tone: 'green' },
  { icon: 'sparkles', title: 'Smart categories', text: 'Type "Campus Cafe" and AI suggests Food. It learns from your corrections, and you can always override.', tone: 'green' },
  { icon: 'target', title: 'Budgets & alerts', text: 'Set a cap per category and get an in-app alert at 85% and when you go over.', tone: 'gold' },
  { icon: 'chart', title: 'Reports & exports', text: 'Category breakdowns, six-month trends, and daily or weekly summaries. Export to PDF or image.', tone: 'blue' },
  { icon: 'bulb', title: 'Tips from your data', text: 'Ranked by how much they could save you. Pin the useful ones, dismiss the rest.', tone: 'orange' },
  { icon: 'upload', title: 'CSV import', text: 'Bring past months in one go. AI suggests categories for every row before you import.', tone: 'purple' },
]

function BudgetRow({ icon, tone, label, percent, status, fill }) {
  return (
    <div className="budget-row">
      <div className={`budget-icon ${tone}`}><Icon name={icon} size={14} /></div>
      <div className="budget-content">
        <div className="budget-label"><strong>{label}</strong><span className={status === 'Over' ? 'over' : ''}>{status || `${percent}%`}</span></div>
        <div className="progress"><span style={{ width: `${fill}%` }} /></div>
      </div>
    </div>
  )
}

function LandingPage() {
  return (
    <div className="landing" id="top">
      <Navbar />

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="hero-badge"><Icon name="grad" size={12} /> Built for college and university students</div>
            <h1>Know where your allowance goes. Keep more of it.</h1>
            <p className="hero-description">CampusCoin is a free budget and expense tracker for students. Log income and spending in seconds, set category budgets, and get plain-language tips from your own habits. No bank login needed.</p>
            <div className="hero-actions">
              <Button onClick={() => navigate('/sign-up')}>Create free account <Icon name="arrow" size={20} /></Button>
              <Button variant="secondary" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'})}>See how it works</Button>
            </div>
            <div className="hero-points">
              <span><Icon name="check" size={16} /> Free for students</span>
              <span><Icon name="check" size={16} /> Works on any device</span>
              <span><Icon name="check" size={16} /> AI optional</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="CampusCoin dashboard preview">
            <div className="balance-card">
              <p>September balance</p>
              <strong>$477.20</strong>
              <div className="balance-stats">
                <div><span>Income</span><b>$1,220.00</b></div>
                <div><span>Spent</span><b>$742.80</b></div>
              </div>
            </div>

            <div className="budget-card">
              <h3>Category budgets</h3>
              <BudgetRow icon="food" tone="gold" label="Food" percent={86} fill={86} />
              <BudgetRow icon="bus" tone="blue" label="Transport" percent={76} fill={76} />
              <BudgetRow icon="tv" tone="pink" label="Subscriptions" status="Over" fill={100} />
            </div>

            <div className="ai-chip">
              <span className="chip-icon"><Icon name="sparkles" size={16} /></span>
              <div><b>Food delivery is up 40%</b><span>A $15 weekly cap saves about $24</span></div>
            </div>

            <div className="quick-chip">
              <span className="quick-icon"><Icon name="food" size={15} /></span>
              <div><b>Campus Cafe</b><span>Food · AI sorted</span></div>
              <strong>−$8.50</strong>
            </div>
          </div>
        </section>

        <section className="features-section section-light" id="features">
          <div className="section-heading">
            <span>Features</span>
            <h2>Everything a student budget needs, nothing it does not</h2>
          </div>
          <div className="feature-grid">
            {features.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
          </div>
        </section>

        <section className="how-section section-light" id="how-it-works">
          <div className="section-heading compact">
            <span>How it works</span>
            <h2>Three steps to a calmer month</h2>
          </div>
          <div className="steps-grid">
            {[
              ['1', 'Create your account', 'Add your allowance baseline and a savings goal. About two minutes.'],
              ['2', 'Log as you go', 'Quick add from your phone or laptop, or import a CSV of past months.'],
              ['3', 'Get your monthly insight', 'See what changed, what it cost you, and one simple thing to try next.'],
            ].map(([number, title, text]) => (
              <article className="step-card" key={number}>
                <div className="step-number">{number}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="privacy-section" id="privacy">
          <div className="privacy-copy">
            <h2>Your money data stays yours</h2>
            <p>No bank login, no real payments, no selling data. AI suggestions are advisory and you can switch them off.</p>
          </div>
          <div className="privacy-cards">
            <div><Icon name="lock" size={24} /><b>Encrypted</b></div>
            <div><Icon name="shield" size={24} /><b>Private by default</b></div>
            <div><Icon name="ban" size={24} /><b>No ads</b></div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Start your first month with CampusCoin</h2>
          <p>Free for students. Set up in two minutes.</p>
          <Button onClick={() => navigate('/sign-up')}>Create free account <Icon name="arrow" size={20} /></Button>
        </section>
      </main>

      <div id="footer"><Footer /></div>
    </div>
  )
}

export default LandingPage
