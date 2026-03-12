function HalfBackground() {
  return (
    <div className='fixed inset-0 flex z-0'>
      {/* Left side - Green background with KU Logo */}
      <div className='w-1/2 bg-primary flex flex-col items-center justify-center p-8'>
        {/* KU Logo */}
        <div className='bg-white bg-opacity-20 rounded-3xl p-12 mb-8'>
          <div className='text-center'>
            <div className='text-6xl font-bold text-white mb-2'>KU</div>
            <div className='h-2 bg-yellow-400 w-full mb-4'></div>
            <div className='text-lg font-semibold text-white'>KASETSART</div>
            <div className='text-lg font-semibold text-white'>UNIVERSITY</div>
          </div>
        </div>
        
        {/* Text */}
        <div className='text-center text-white'>
          <h1 className='text-3xl font-bold mb-2'>Nisit Deeden</h1>
          <p className='text-sm opacity-90'>Online Document Outstanding Student Award</p>
          <p className='text-sm opacity-90'>Submission System</p>
        </div>
      </div>
    </div>
  )
}

export default HalfBackground