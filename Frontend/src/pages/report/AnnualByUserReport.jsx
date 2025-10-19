import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserFilter } from '../../components/Filter'
import { AppContent } from '../../context/AppContext'
import { FiCalendar, FiBarChart2, FiUsers } from 'react-icons/fi'
import axios from 'axios'

const AnnualByUserReport = () => {
    const {  } = useContext(AppContent)
    const navigate = useNavigate()
    const [selectedUsers, setSelectedUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [year, setYear] = useState(new Date().getFullYear())

    const handleUserChange = (users) => {
        setSelectedUsers(users)
    }

    const resetReport = () => {
        setSelectedUsers([])
        setYear(new Date().getFullYear())
    }

    const generateReport = async () => {
        if (selectedUsers.length === 0) {
            alert('กรุณาเลือกผู้ใช้อย่างน้อย 1 คน')
            return
        }

        setLoading(true)
        try {
            const filterParams = {
                year: year,
                userIds: selectedUsers.map(user => user.id)
            }

            const response = await axios.post(`/api/report/annual-by-user`, filterParams, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.data.success) {
                const data = response.data.data
                if (data) {
                    // ตรวจสอบ assets
                    if (!data.assets) {
                        data.assets = []
                    }

                    // ส่งข้อมูลไปยังหน้า Preview
                    navigate('/report/preview', {
                        state: {
                            reportData: data,
                            filterInfo: {
                                year: year,
                                selectedUsers: selectedUsers,
                                reportType: 'annual-by-user'
                            }
                        }
                    })
                } else {
                    alert('ไม่พบข้อมูลรายงาน')
                }
            } else {
                alert(response.data.message || 'เกิดข้อผิดพลาดในการสร้างรายงาน')
            }
            setLoading(false)

        } catch (error) {
            console.error('Error generating report:', error)
            if (error.response) {
                alert(error.response.data.message || 'เกิดข้อผิดพลาดในการสร้างรายงาน')
            } else {
                alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
            }
            setLoading(false)
        }
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FiUsers className="text-indigo-600" />
                    รายงานประจำปีตามผู้ใช้
                </h2>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">ปี:</label>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="2020"
                        max="2030"
                    />
                </div>
            </div>

            {/* Filter Section */}
            <div className="mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                    <UserFilter
                        selectedUsers={selectedUsers}
                        onUserChange={handleUserChange}
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <div className="flex gap-2">
                        <button
                            onClick={generateReport}
                            disabled={loading || selectedUsers.length === 0}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <FiBarChart2 size={16} />
                            {loading ? 'กำลังสร้างรายงาน...' : 'พรีวิวข้อมูล'}
                        </button>

                        <button
                            onClick={resetReport}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2"
                        >
                            รีเซ็ต
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnnualByUserReport
