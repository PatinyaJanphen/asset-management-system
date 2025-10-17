import React, { useContext, useEffect } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate()
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent)

  const [state, setState] = useState('Login')
  const [email, setEmail] = useState('')
  const [firstname, setFristname] = useState('')
  const [lastname, setLastname] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordMatchError, setPasswordMatchError] = useState('')

  const onSubitHandler = async (e) => {
    try {
      e.preventDefault()

      if (state === 'Sign Up') {
        const { data } = await axios.post(backendUrl + '/api/auth/register', { email, firstname, lastname, username, password })
        if (data.success) {
          setIsLoggedin(true)
          getUserData()
          navigate('/')
        }
        else {
          toast.error(data.message)
        }
      }
      else {
        const { data } = await axios.post(backendUrl + '/api/auth/login', { email, password })
        if (data.success) {
          setIsLoggedin(true)
          await getUserData()
          navigate('/')
        }
        else {
          toast.error(data.message)
        }
      }
    }
    catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (state === 'Sign Up' && passwordConfirm) {
      if (password !== passwordConfirm) {
        setPasswordMatchError('Password do not match')
      } else {
        setPasswordMatchError('')
      }
    } else {
      setPasswordMatchError('')
    }
  }, [password, passwordConfirm, state])

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gray-100'>
      <div className='bg-white p-10 rounded-lg shadow-lg w-full sm:w-96 text-sm'>
        <h2 className='text-3xl font-semibold text-black text-center mb-3'>
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </h2>
        <p className='text-center text-sm mb-6'>
          {state === 'Sign Up' ? 'Create your account' : 'Login to your account!'}
        </p>

        <form onSubmit={onSubitHandler}>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#ebebeb]'>
            <input onChange={e => setEmail(e.target.value)} value={email} className='bg-transparent outline-none text-black' type='email' placeholder='Email' required />
          </div>

          {state === 'Sign Up' && (
            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#ebebeb]'>
              <input onChange={e => setUsername(e.target.value)} value={username} className='bg-transparent outline-none text-black' type='text' placeholder='Username' required />
            </div>
          )}

          {state === 'Sign Up' && (
            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#ebebeb]'>
              <input onChange={e => setFristname(e.target.value)} value={firstname} className='bg-transparent outline-none text-black' type='text' placeholder='First name' required />
            </div>
          )}

          {state === 'Sign Up' && (
            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#ebebeb]'>
              <input onChange={e => setLastname(e.target.value)} value={lastname} className='bg-transparent outline-none text-black' type='text' placeholder='Last name' required />
            </div>
          )}

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#ebebeb]'>
            <input onChange={e => setPassword(e.target.value)} value={password} className='bg-transparent outline-none text-black' type='password' placeholder='Password' required />
          </div>

          {state === 'Sign Up' && (
            <div className='mb-4 flex flex-col w-full'>
              <div className='flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#ebebeb]'>
                <input onChange={e => setPasswordConfirm(e.target.value)} value={passwordConfirm} className='bg-transparent outline-none text-black' type='password' placeholder='Password confirm' required />

              </div>
              {passwordMatchError && (
                <span className="text-red-400 text-xs mt-1 px-2">{passwordMatchError}</span>
              )}
            </div>

          )}

          {state === 'Login' && (
            <p onClick={() => navigate('/reset-password')} className='mb-4 text-gray-300 cursor-pointer hover:text-indigo-300'>
              Forgot password?
            </p>
          )}

          <button className='w-full py-2.5 rounded-full bg-gradient-to-r bg-purple-600 text-white font-medium'>
            {state}
          </button>
        </form>

        {state === 'Sign Up' ? (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Already  have an account? {''}
            <span onClick={() => setState('Login')} className='text-blue-400 cursor-pointer underline'>Login here</span>
          </p>
        ) :
          (
            <p className='text-gray-400 text-center text-xs mt-4'>
              Don't have an account? {''}
              <span onClick={() => setState('Sign Up')} className='text-blue-400 cursor-pointer underline'>Sign up</span>
            </p>
          )
        }


      </div>
    </div>
  )
}

export default Login