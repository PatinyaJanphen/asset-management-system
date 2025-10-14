import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { AppContent } from '../context/AppContext'
import { FiMail, FiPhone } from 'react-icons/fi'

const Profile = () => {
    axios.defaults.withCredentials = true
    const { backendUrl, isLoggedin, userData, getUserData } = useContext(AppContent)

    const [firstname, setFirstname] = useState('')
    const [lastName, setLastname] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')

    const onSubmitSave = async (e, index) => {
        e.preventDefault()
        try {
            const { data } = await axios.post(backendUrl + '/api/user/update-data', { firstname, lastName, phone, email })
            data.success ? toast.success(data.message) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (userData) {
            setFirstname(userData.firstname || '');
            setLastname(userData.lastname || '');
            setPhone(userData.phone || '');
            setEmail(userData.email || '');
        }
    }, [userData]);
    return (
        <div >
            <h2 className='text-3xl font-semibold mb-5'>Profile</h2>

            <form onSubmit={onSubmitSave} >
                <button className='w-20 py-2 mb-2 bg-gradient-to-r from-indigo-800 to-indigo-900 text-white rounded-full'>Save</button>

                <div className="bg-white p-4 rounded-lg shadow mb-5">
                    <div className="text-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#636676]'>
                            Email: <input onChange={(e) => setEmail(e.target.value)} value={email} className='bg-transparent outline-none text-amber-50' type='email' placeholder='Email' readOnly />
                        </div>
                        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                            Phone: <input onChange={(e) => setPhone(e.target.value)} value={phone} className='bg-transparent outline-none text-amber-50' type='text' placeholder='Phone' />
                        </div>
                        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                            First name:<input onChange={(e) => setFirstname(e.target.value)} value={firstname} className='bg-transparent outline-none text-amber-50' type='text' placeholder='First name' required />
                        </div>
                        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                            Last name: <input onChange={(e) => setLastname(e.target.value)} value={lastName} className='bg-transparent outline-none text-amber-50' type='text' placeholder='Last name' required />
                        </div>

                    </div>
                </div>
            </form>
        </div >
    )
}

export default Profile