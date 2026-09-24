import './Logo.css'

function Logo({ compact = false }) {
  return (
    <div className="brand" aria-label="CampusCoin">
      <span className="brand-mark" aria-hidden="true">
        C<span className="brand-coin" />
      </span>
      {!compact && (
        <span className="brand-name">
          <span>Campus</span><strong>Coin</strong>
        </span>
      )}
    </div>
  )
}

export default Logo
