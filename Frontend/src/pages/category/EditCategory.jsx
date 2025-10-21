import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContent } from '../../context/AppContext'

const EditCategory = () => {
    const { backendUrl } = useContext(AppContent)
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [category, setCategory] = useState({
        name: '',
        description: ''
    })

    useEffect(() => {
        fetchCategory()
    }, [id])

    const fetchCategory = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(`${backendUrl}/api/category/get/${id}`)
            if (data.success) {
                setCategory({
                    name: data.data.name,
                    description: data.data.description
                })
            } else {
                toast.error(data.message)
                navigate('/management/categorys')
            }
        } catch (error) {
            toast.error(error.message)
            navigate('/management/categorys')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setCategory(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!category.name || !category.description) {
            toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
            return
        }

        try {
            setSaving(true)
            const { data } = await axios.put(`${backendUrl}/api/category/update/${id}`, {
                categoryId: id,
                name: category.name,
                description: category.description,
            })

            if (data.success) {
                toast.success('แก้ไขข้อมูล category สำเร็จ!')
                navigate('/management/categorys')
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
        navigate('/management/category')
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
                <h1 className="text-2xl font-bold text-gray-800">แก้ไขข้อมูล Category</h1>
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
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={category.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="เช่น คอมพิวเตอร์, เครื่องเขียน"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={category.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="อธิบายรายละเอียดของหมวดหมู่..."
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
                        className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default EditCategory