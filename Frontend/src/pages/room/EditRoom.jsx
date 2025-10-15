import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContent } from '../../context/AppContext'

const EditRoom = () => {
    const { backendUrl } = useContext(AppContent)
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [room, setRoom] = useState({
        code: '',
        name: '',
        description: ''
    })

    useEffect(() => {
        fetchRoom()
    }, [id])

    const fetchRoom = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(`${backendUrl}/api/room/get/${id}`)
            if (data.success) {
                setRoom({
                    code: data.data.code,
                    name: data.data.name,
                    description: data.data.description
                })

            } else {
                toast.error(data.message)
                navigate('/management/rooms')
            }
        } catch (error) {
            toast.error(error.message)
            navigate('/management/rooms')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setRoom(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!room.code || !room.name || !room.description) {
            toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
            return
        }

        try {
            setSaving(true)
            const { data } = await axios.put(`${backendUrl}/api/room/update/${id}`, room)

            if (data.success) {
                toast.success('แก้ไขข้อมูล Room สำเร็จ!')
                navigate('/management/rooms')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        navigate('/management/rooms')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">แก้ไขข้อมูล Room</h1>
                <button
                    onClick={handleCancel}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                        รหัสห้อง *
                    </label>
                    <input
                        type="text"
                        id="code"
                        name="code"
                        value={room.code}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="เช่น R001, R002"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        ชื่อห้อง *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={room.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="เช่น ห้องประชุมใหญ่, ห้องทำงาน"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        คำอธิบาย *
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={room.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="อธิบายรายละเอียดของห้อง..."
                        required
                    />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                กำลังบันทึก...
                            </div>
                        ) : (
                            'บันทึกการเปลี่ยนแปลง'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditRoom