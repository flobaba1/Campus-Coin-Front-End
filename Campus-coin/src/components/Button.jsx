function Button({ children, variant = 'primary', className = '', onClick, type = 'button' }) {
  return (
    <button type={type} className={`cc-button cc-button-${variant} ${className}`} onClick={onClick}>
      {children}
    </button>
  )
}

export default Button
