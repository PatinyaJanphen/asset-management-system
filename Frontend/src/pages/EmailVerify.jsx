import axios from 'axios'
import React, { useContext, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'

const EmailVerify = () => {
  axios.defaults.withCredentials = true
  const inputRefs = React.useRef([])
  const { isLoggedin, userData, getUserData  } = useContext(AppContent)
  const navigate = useNavigate()

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e, index) => {
    const paste = e.clipboardData.getData('text')
    const pasteArray = paste.split('')
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char
      }
    })
  }

  const onSubmitHandle = async (e) => {
    try {
      e.preventDefault();
      const otpArray = inputRefs.current.map(e => e.value)
      const otp = otpArray.join('')

      const { data } = await axios.post('/api/auth/verify-account', { otp })

      if (data.success) {
        toast.success(data.message)
        getUserData() // Refresh user data to get updated verification status
        navigate('/setting/profile')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    isLoggedin && userData && userData.isAccountVerified && navigate('/')
  }, [isLoggedin, userData])

  // Send OTP when component mounts
  useEffect(() => {
    const sendOtp = async () => {
      try {
        const { data } = await axios.post('/api/auth/send-verify-otp')
        if (data.success) {
          toast.success(data.message)
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }
    
    if (isLoggedin && userData) {
      sendOtp()
    }
  }, [isLoggedin, userData, backendUrl])

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gray-100'>
      <form onSubmit={onSubmitHandle} className='bg-white p-10 rounded-lg shadow-lg w-full sm:w-96 text-sm'>
        <h1 className='text-black text-2xl font-semibold text-center mb-4'>Email Verify OTP</h1>
        <p className='text-center mb-6 text-black'>Enter the 6-digit code sent to your email.</p>
        <div className='flex justify-between mb-8' onPaste={handlePaste}>
          {Array(6).fill(0).map((_, index) => (
            <input className='w-12 h-12 bg-[#ebebeb] text-black text-center text-xl rounded-md'
              type='text' maxLength={1} key={index} required
              ref={e => inputRefs.current[index] = e}
              onInput={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)} />
          ))}
        </div>
        <button className='w-full py-2.5 rounded-full bg-gradient-to-r bg-purple-600 text-white font-medium'>Verify email</button>
      </form>
    </div>
  )
}

export default EmailVerify