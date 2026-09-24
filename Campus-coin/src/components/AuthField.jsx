import { useId } from 'react'
import Icon from './Icon'

function AuthField({ label, type = 'text', placeholder, value, onChange, hint, required = true, code = false }) {
  const id = useId()
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className={`auth-input-wrap ${code ? 'auth-code-input' : ''}`}>
        <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} />
        {type === 'password' && <button type="button" className="auth-eye" aria-label="Show password"><Icon name="eye" size={18} /></button>}
      </div>
      {hint && <p className="auth-field-hint">{hint}</p>}
    </div>
  )
}

export default AuthField
