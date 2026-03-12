import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

function Button({ 
  children, 
  onClick, 
  type = 'button', 
  fullWidth = true,
  variant = 'primary',
  disabled = false
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`my-6 bg-primary text-white font-bold py-2 px-8 rounded cursor-pointer hover:bg-primary-hover transition-colors ${
        fullWidth ? 'w-full' : ''
      } ${variant === 'secondary' ? 'bg-gray-500 hover:bg-gray-600' : ''} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  )
}

export default Button