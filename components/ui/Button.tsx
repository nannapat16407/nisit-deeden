import React from 'react'

function Button({ children }: { children: React.ReactNode }) {
  return (
    <>
      <button className='bg-primary text-white font-bold py-2 px-8 rounded cursor-pointer hover:bg-primary-hover'>
        {children}
      </button>
    </>
  )
}

export default Button