import { useId, useState } from 'react' 
import Icon from './Icon' 

function AuthField({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  hint, 
  required = true, 
  code = false, 
  icon, }) { 
    const id = useId() 
    const [showPassword, setShowPassword] = useState(false) 
    const inputType = type === 'password' 
    ? showPassword 
    ? 'text' 
    : 'password' 
    : type 
    
    return ( 
    <div
     className="auth-field"
     >
     <label htmlFor={id}>{label}</label>
      <div 
      className={`auth-input-wrap ${ code ? 'auth-code-input' : '' }`} 
      > 
      {icon && ( <Icon name={icon} size={18} /> )} 
      <input 
      id={id} 
      type={inputType} 
      placeholder={placeholder} 
      value={value} 
      onChange={onChange} 
      required={required} 
      /> 
      {type === 'password' && 
      ( 
      <button 
        type="button" 
        className="auth-eye" 
        aria-label={ showPassword ? 'Hide password' : 'Show password' } 
        onClick={() => setShowPassword(prev => !prev) } 
        > 
        <Icon
  name={showPassword ? 'eyeOff' : 'eye'}
  size={18}
/> </button>
 )} 
</div> 
{hint && ( <p className="auth-field-hint"> {hint} </p> )} 
</div>
  ) 
} 
    
    export default AuthField