import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CategoryFilter, RoomFilter } from '../../components/Filter'
import { AppContent } from '../../context/AppContext'
import { FiCalendar, FiBarChart2 } from 'react-icons/fi'
import axios from 'axios'

const AnnualReport = () => {
    const { backendUrl } = useContext(AppContent)
    const navigate = useNavigate()
    const [selectedCategories, setSelectedCategories] = useState([])
    const [selectedRooms, setSelectedRooms] = useState([])
    const [loading, setLoading] = useState(false)
    const [year, setYear] = useState(new Date().getFullYear())

    const handleCategoryChange = (categories) => {
        setSelectedCategories(categories)
    }

    const handleRoomChange = (rooms) => {
        setSelectedRooms(rooms)
    }

    const resetReport = () => {
        setSelectedCategories([])
        setSelectedRooms([])
        setYear(new Date().getFullYear())
    }

    const generateReport = async () => {
        setLoading(true)
        try {
            const filterParams = {
                year: year,
                categoryIds: selectedCategories,
                roomIds: selectedRooms
            }

            console.log('Generating annual report with filters:', filterParams)

            const response = await axios.post(`${backendUrl}/api/report/annual`, filterParams, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.data.success) {
                // ตรวจสอบและเพิ่มค่าเริ่มต้นสำหรับข้อมูลที่อาจเป็น undefined
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
                                selectedCategories: selectedCategories,
                                selectedRooms: selectedRooms
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
                    <FiCalendar className="text-indigo-600" />
                    รายงานประจำปี
                </h2>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Filter Section */}
            <div className="mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CategoryFilter
                        selectedCategories={selectedCategories}
                        onCategoryChange={handleCategoryChange}
                    />
                    <RoomFilter
                        selectedRooms={selectedRooms}
                        onRoomChange={handleRoomChange}
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <div className="flex gap-2">
                        <button
                            onClick={generateReport}
                            disabled={loading}
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

export default AnnualReport
