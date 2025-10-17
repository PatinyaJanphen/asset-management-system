import React, { useContext, useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContent } from '../../context/AppContext'

const CreateAsset = () => {
  const navigate = useNavigate()
  const { backendUrl } = useContext(AppContent)

  const [asset, setAsset] = useState({
    code: '',
    name: '',
    description: '',
    serial_number: '',
    categoryId: '',
    roomId: '',
    ownerId: '',
    status: 'AVAILABLE',
    purchase_at: '',
    value: '',
    is_active: true
  })

  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [rooms, setRooms] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, roomsRes, usersRes] = await Promise.all([
          axios.get(`${backendUrl}/api/category/all`),
          axios.get(`${backendUrl}/api/room/all`),
          axios.get(`${backendUrl}/api/user/all-data`)
        ])

        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data || [])
          console.log('Categories set:', categoriesRes.data.data)
        }
        if (roomsRes.data.success) {
          const roomsWithDisplayName = (roomsRes.data.data || []).map(room => ({
            ...room,
            displayName: `${room.name} (${room.code})`
          }))
          setRooms(roomsWithDisplayName)
          console.log('Rooms set:', roomsWithDisplayName)
        }
        if (usersRes.data.success) {
          const usersWithFullName = (usersRes.data.userData || []).map(user => ({
            ...user,
            fullName: `${user.firstname} ${user.lastname}`
          }))
          setUsers(usersWithFullName)
          console.log('Users set:', usersWithFullName)
        }
      } catch (error) {
        toast.error('เกิดข้อผิดพลาดในการดึงข้อมูล')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [backendUrl])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setAsset(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!asset.code || !asset.name) {
      toast.error('กรุณากรอกรหัสและชื่อสินทรัพย์')
      return
    }

    try {
      setSaving(true)
      console.log('Creating asset:', asset)
      const { data } = await axios.post(`${backendUrl}/api/asset/create`, asset)

      if (data.success) {
        toast.success('สร้างสินทรัพย์ใหม่สำเร็จ!')
        navigate('/management/assets')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Error creating asset:', error)
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างสินทรัพย์')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/management/assets')
  }

  console.log('Current state:', { categories, rooms, users, loading })

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">เพิ่มสินทรัพย์ใหม่</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* รหัสสินทรัพย์ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รหัสสินทรัพย์ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={asset.code}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น AST-001"
              required
            />
          </div>

          {/* ชื่อสินทรัพย์ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อสินทรัพย์ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={asset.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น คอมพิวเตอร์เดสก์ท็อป"
              required
            />
          </div>

          {/* หมายเลขซีเรียล */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมายเลขซีเรียล
            </label>
            <input
              type="text"
              name="serial_number"
              value={asset.serial_number}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น SN123456789"
            />
          </div>

          {/* หมวดหมู่ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมวดหมู่
            </label>
            <SearchableDropdown
              options={categories}
              value={asset.categoryId}
              onChange={(value) => setAsset(prev => ({ ...prev, categoryId: value }))}
              placeholder={`เลือกหมวดหมู่ (${categories.length} รายการ)`}
              displayKey="name"
              valueKey="id"
              searchKey="name"
            />
          </div>

          {/* ห้อง */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ห้อง
            </label>
            <SearchableDropdown
              options={rooms}
              value={asset.roomId}
              onChange={(value) => setAsset(prev => ({ ...prev, roomId: value }))}
              placeholder={`เลือกห้อง (${rooms.length} รายการ)`}
              displayKey="displayName"
              valueKey="id"
              searchKey="name"
            />
          </div>

          {/* เจ้าของ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เจ้าของ
            </label>
            <SearchableDropdown
              options={users}
              value={asset.ownerId}
              onChange={(value) => setAsset(prev => ({ ...prev, ownerId: value }))}
              placeholder={`เลือกเจ้าของ (${users.length} รายการ)`}
              displayKey="fullName"
              valueKey="id"
              searchKey="fullName"
            />
          </div>

          {/* สถานะ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              สถานะ
            </label>
            <select
              name="status"
              value={asset.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="AVAILABLE">พร้อมใช้งาน</option>
              <option value="ASSIGNED">มอบหมายแล้ว</option>
              <option value="MAINTENANCE">ซ่อมบำรุง</option>
              <option value="RETIRED">ปลดระวาง</option>
            </select>
          </div>

          {/* วันที่ซื้อ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วันที่ซื้อ
            </label>
            <input
              type="date"
              name="purchase_at"
              value={asset.purchase_at}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* มูลค่า */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              มูลค่า (บาท)
            </label>
            <input
              type="number"
              name="value"
              value={asset.value}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* คำอธิบาย */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            คำอธิบาย
          </label>
          <textarea
            name="description"
            value={asset.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับสินทรัพย์"
          />
        </div>

        {/* สถานะใช้งาน */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_active"
            checked={asset.is_active}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            สถานะใช้งาน
          </label>
        </div>

        {/* ปุ่ม */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
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

// DebouncedInput component สำหรับการค้นหา
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 300,
  ...props
}) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, onChange, debounce])

  return (
    <input {...props} value={value} onChange={e => setValue(e.target.value)} />
  )
}

// SearchableDropdown component
function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder,
  displayKey,
  valueKey = 'id',
  searchKey,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.searchable-dropdown')) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options
    return options.filter(option => {
      const searchValue = searchKey ? option[searchKey] : option[displayKey]
      return searchValue?.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [options, searchTerm, displayKey, searchKey])

  const selectedOption = options.find(option => option[valueKey] == value)

  const handleSelect = (option) => {
    onChange(option[valueKey])
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setSearchTerm('')
    }
  }

  return (
    <div className={`relative searchable-dropdown ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex justify-between items-center"
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption[displayKey] : placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <DebouncedInput
              type="text"
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={`ค้นหา... (${filteredOptions.length} รายการ)`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option[valueKey]}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${option[valueKey] == value ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                    }`}
                >
                  {option[displayKey]}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-sm">
                ไม่พบข้อมูล
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateAsset