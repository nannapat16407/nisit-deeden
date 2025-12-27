import React from 'react'

function Input({ children }: { children: React.ReactNode }) {
  return (
    <div className='mb-4'>
      <input
        type='text'
        className='mt-3 border border-primary p-2 rounded text-txt-primary'
        placeholder={`enter ${children}`}
      />
    </div>
  )
}

export default Input