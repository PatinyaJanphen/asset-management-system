import React, { useContext } from 'react'
import { AppContent } from '../context/AppContext'

const Header = () => {
  const { userData } = useContext(AppContent)
  return (
    <div className='flex flex-col items-center mt-20 px-4 text-center'>
      <h1 className="้flex item-center gap-2 text-xl sm:text-3xl">Hey {userData ? userData.firstname +" "+ userData.lastname : 'Devloper'}!</h1>
      <h2 className="text-3xl sm:text-5xl font-semibold mb-4">Welcome to Asset-ss</h2>
      <p className='mb-8 max-w-md'>Your one-stop solution for managing and tracking your digital assets efficiently.</p>
      <button className='border border-gray-500 rounded-full px-8 py-2 hoover:bg-gray-100 transitio-all'>Get Started</button>
    </div>
  )
}

export default Header