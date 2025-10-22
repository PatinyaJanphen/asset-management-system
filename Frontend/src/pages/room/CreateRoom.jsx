import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContent } from '../../context/AppContext'

const CreateRoom = () => {
    const navigate = useNavigate()
    const { backendUrl } = useContext(AppContent)

    const [room, setRoom] = useState({
        code: '',
        name: '',
        description: ''
    })

    const [saving, setSaving] = useState(false)

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
            const { data } = await axios.post(`${backendUrl}/api/room/create`, room)

            if (data.success) {
                toast.success('สร้างห้องใหม่สำเร็จ!')
                navigate('/management/rooms')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        navigate('/management/rooms')
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">เพิ่มห้องใหม่</h1>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="อธิบายรายละเอียดของห้อง..."
                        required
                    />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                กำลังบันทึก...
                            </div>
                        ) : (
                            'บันทึกข้อมูล'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CreateRoom
