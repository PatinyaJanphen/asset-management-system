import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import { toast } from 'react-toastify'

const ResetPassword = () => {
  axios.defaults.withCredentials = true
  const { backendUrl, isLoggedin, userData, getUserData } = useContext(AppContent)

  const navigate = useNavigate()
  const inputRefs = React.useRef([])
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [isEmailSent, setIsEmailSent] = useState('')
  const [otp, setOtp] = useState(0)
  const [isOtpSubmit, setIsOtpSubmit] = useState(false)
  const [passwordMatchError, setPasswordMatchError] = useState('')

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

  const onSubmitEmail = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/send-reset-password-otp', { email })
      data.success ? toast.success(data.message) : toast.error(data.message)
      data.success && setIsEmailSent(true)
    }
    catch (error) {
      toast.error(error.message)
    }
  }

  const onSubmitOtp = async (e) => {
    e.preventDefault()
    const otpArray = inputRefs.current.map(e => e.value)
    setOtp(otpArray.join(''))
    setIsOtpSubmit(true)
  }

  const onSubmitNewpassword = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/reset-password', { email, otp, newPassword })
      data.success ? toast.success(data.message) : toast.error(data.message)
      data.success && navigate('/login')
    }
    catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (newPasswordConfirm) {
      if (newPassword !== newPasswordConfirm) {
        setPasswordMatchError('Passwords do not match')
      } else {
        setPasswordMatchError('')
      }
    } else {
      setPasswordMatchError('')
    }
  }, [newPassword, newPasswordConfirm])

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>

      {/* email */}
      {!isEmailSent &&
        <form onSubmit={onSubmitEmail} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset password</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit code sent to your email.</p>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <input className='text-white' type='email' placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3'>Submit</button>
        </form>
      }

      {/* OTP form */}
      {!isOtpSubmit && isEmailSent &&
        <form onSubmit={onSubmitOtp} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>Email Verify OTP</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit code sent to your email.</p>
          <div className='flex justify-between mb-8' onPaste={handlePaste}>
            {Array(6).fill(0).map((_, index) => (
              <input className='w-12 h-12 bg-[#333a5c] text-white text-center text-xl rounded-md'
                type='text' maxLength={1} key={index} required
                ref={e => inputRefs.current[index] = e}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)} />
            ))}
          </div>
          <button className='w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>Verify email</button>
        </form>
      }


      {/* new password */}
      {isOtpSubmit && isEmailSent &&
        <form onSubmit={onSubmitNewpassword} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>New password</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter the new password.</p>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <input className='text-white' type='password' placeholder='New password' value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          </div>
          <div className='mb-4 flex flex-col w-full'>
            <div className='flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]'>
              <input className='text-white' type='password' placeholder='New password confirm' value={newPasswordConfirm} onChange={e => setNewPasswordConfirm(e.target.value)} required />
            </div>
            {passwordMatchError && (
              <span className="text-red-400 text-xs mt-1 px-2">{passwordMatchError}</span>
            )}
          </div>


          <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3'>Submit</button>
        </form>
      }

    </div >
  )
}

export default ResetPassword