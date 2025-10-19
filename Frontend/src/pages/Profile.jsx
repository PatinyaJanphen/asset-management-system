import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import { FiMail, FiPhone, FiEdit3, FiSave, FiX, FiShield, FiKey } from 'react-icons/fi'

const Profile = () => {
    axios.defaults.withCredentials = true
    const { isLoggedin, userData, getUserData  } = useContext(AppContent)
    const navigate = useNavigate()

    const [firstname, setFirstname] = useState('')
    const [lastName, setLastname] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [originalData, setOriginalData] = useState({})

    const onSubmitSave = async (e) => {
        e.preventDefault()
        try {
            const { data } = await axios.post('/api/user/update-data', { firstname, lastname: lastName, phone, email })
            if (data.success) {
                toast.success(data.message)
                setIsEditing(false)
                setOriginalData({ firstname, lastName, phone, email })
                getUserData() // Refresh user data
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleCancel = () => {
        setFirstname(originalData.firstname || '')
        setLastname(originalData.lastname || '')
        setPhone(originalData.phone || '')
        setEmail(originalData.email || '')
        setIsEditing(false)
    }

    const handleEmailVerify = () => {
        navigate('/email-verify')
    }

    const handleResetPassword = () => {
        navigate('/reset-password')
    }

    useEffect(() => {
        if (userData) {
            const userDataCopy = {
                firstname: userData.firstname || '',
                lastname: userData.lastname || '',
                phone: userData.phone || '',
                email: userData.email || ''
            }
            setFirstname(userDataCopy.firstname);
            setLastname(userDataCopy.lastname);
            setPhone(userDataCopy.phone);
            setEmail(userDataCopy.email);
            setOriginalData(userDataCopy);
        }
    }, [userData]);
    return (
        <div className="max-w-2xl mx-auto">
            <h2 className='text-2xl font-medium mb-8 text-gray-800'>ตั้งค่าบัญชี</h2>
            
            {/* Profile Form */}
            <form onSubmit={onSubmitSave} className="space-y-6">
                {/* Edit Controls */}
                <div className="flex justify-between">
                    {!userData?.isAccountVerified && (
                        <button
                            onClick={handleEmailVerify}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                        >
                            <FiShield className="w-4 h-4" />
                            ยืนยันอีเมล
                        </button>
                    )}

                    {!isEditing ? (
                        <button
                            type="button"
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            <FiEdit3 className="w-4 h-4" />
                            แก้ไขข้อมูล
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                            >
                                <FiSave className="w-4 h-4" />
                                บันทึก
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                            >
                                <FiX className="w-4 h-4" />
                                ยกเลิก
                            </button>
                        </div>
                    )}
                </div>

                {/* Form Fields */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="space-y-4">
                        {/* Email Field */}
                        <div className='flex items-center gap-3'>
                            <FiMail className="w-5 h-5 text-gray-500" />
                            <label className="text-sm font-medium text-gray-700 w-20">อีเมล</label>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                className='flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600'
                                type='email'
                                placeholder='อีเมล'
                                readOnly
                            />
                        </div>

                        {/* Phone Field */}
                        <div className='flex items-center gap-3'>
                            <FiPhone className="w-5 h-5 text-gray-500" />
                            <label className="text-sm font-medium text-gray-700 w-20">โทรศัพท์</label>
                            <input
                                onChange={(e) => setPhone(e.target.value)}
                                value={phone}
                                className={`flex-1 px-3 py-2 border rounded-md ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
                                type='text'
                                placeholder='เบอร์โทรศัพท์'
                                disabled={!isEditing}
                            />
                        </div>

                        {/* First Name Field */}
                        <div className='flex items-center gap-3'>
                            <label className="text-sm font-medium text-gray-700 w-20">ชื่อ</label>
                            <input
                                onChange={(e) => setFirstname(e.target.value)}
                                value={firstname}
                                className={`flex-1 px-3 py-2 border rounded-md ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
                                type='text'
                                placeholder='ชื่อ'
                                required
                                disabled={!isEditing}
                            />
                        </div>

                        {/* Last Name Field */}
                        <div className='flex items-center gap-3'>
                            <label className="text-sm font-medium text-gray-700 w-20">นามสกุล</label>
                            <input
                                onChange={(e) => setLastname(e.target.value)}
                                value={lastName}
                                className={`flex-1 px-3 py-2 border rounded-md ${isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
                                type='text'
                                placeholder='นามสกุล'
                                required
                                disabled={!isEditing}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Profile