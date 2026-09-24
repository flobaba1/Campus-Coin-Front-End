import Icon from './Icon'

function FeatureCard({ icon, title, text, tone = 'green' }) {
  return (
    <article className="feature-card">
      <div className={`feature-icon ${tone}`}><Icon name={icon} size={22} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}

export default FeatureCard
