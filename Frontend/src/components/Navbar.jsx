import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = () => {
    const navigation = useNavigate();
    const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(AppContent)

    const sendVerificationOtp = async () => {
        try {
            axios.defaults.withCredentials = true

            const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp')
            if (data.success) {
                navigation('/email-verify')
                toast.success(data.message)
            }
            else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const logout = async () => {
        try {
            axios.defaults.withCredentials = true
            const { data } = await axios.post(backendUrl + '/api/auth/logout');

            data.success && setIsLoggedin(false)
            data.success && setUserData(false)
            navigation('/')
        } catch (error) {
            toast.error(error.m)
        }
    }

    return (
        <div className="w-full flex justify-between items-center py-4 sm:p-6 sm:px-24 absolute top-0 bg-white dark:bg-gray-800">
            <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
                <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Asset-ss</span>
            </a>
            {userData ?
                <div className='relative group'>
                    <div className='w-8 h-8 flex justify-center items-center rounded-full bg-black text-white cursor-pointer'>
                        {userData.firstname[0].toUpperCase() + userData.lastname[0].toUpperCase()}
                    </div>
                    <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black roundede pt-10'>
                        <ul className='list-none m-0 p-2 bg-gray-100 text-sm'>
                            <li className='py-1 px-2 hover:bg-gray-200 cursor-pointer'>Profile</li>
                            {!userData.isAccountVerified &&
                                <li onClick={sendVerificationOtp} className='py-1 px-2 hover:bg-gray-200 cursor-pointer'>Verify email</li>
                            }
                            <li className='py-1 px-2 hover:bg-gray-200 cursor-pointer'>Settings</li>
                            <li onClick={logout} className='py-1 px-2 hover:bg-gray-200 cursor-pointer'>Logout</li>
                        </ul>
                    </div>
                </div>
                :
                <button onClick={() => { navigation('/login') }}
                    className="flex items-center gap-2 border border-bluw-600 rounded-full px-6 py-2 text-blue-600 hover:bg-blue-50 transition-all dark:text-white dark:border-white dark:hover:bg-gray-700">
                    Login
                </button>
            }
        </div>


    )
}

export default Navbar