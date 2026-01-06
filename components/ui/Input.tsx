import React from 'react'

interface InputProps {
  label: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  name?: string
  required?: boolean
}

function Input({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  name,
  required = false 
}: InputProps) {
  return (
    <div className='mb-4'>
      <label className='text-primary font-medium block mb-1'>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className='border border-primary p-2 rounded border-2 text-txt-primary max-w-full w-full focus:outline-none focus:ring-2 focus:ring-primary'
        placeholder={placeholder}
      />
    </div>
  )
}

export default Input