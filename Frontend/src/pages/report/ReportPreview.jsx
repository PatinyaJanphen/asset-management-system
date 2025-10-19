import React, { useState, useContext, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table'
import { AppContent } from '../../context/AppContext'
import { FiDownload, FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import axios from 'axios'

const ReportPreview = () => {
    const {  } = useContext(AppContent)
    const navigate = useNavigate()
    const location = useLocation()

    const [reportData, setReportData] = useState(null)
    const [exporting, setExporting] = useState(false)
    const [filterInfo, setFilterInfo] = useState({
        year: new Date().getFullYear(),
        selectedCategories: [],
        selectedRooms: [],
        selectedUsers: [],
        reportType: 'annual'
    })
    const [categoryNames, setCategoryNames] = useState([])
    const [roomNames, setRoomNames] = useState([])
    const [globalFilter, setGlobalFilter] = useState('')

    // กำหนด columns สำหรับตาราง
    const columns = useMemo(() => [
        {
            accessorKey: 'index',
            header: 'ลำดับ',
            cell: ({ row }) => (
                <div className="text-center text-gray-600 font-medium">
                    {row.index + 1}
                </div>
            ),
            size: 80,
        },
        {
            accessorKey: 'code',
            header: 'หมายเลขสินทรัพย์',
            cell: ({ getValue }) => (
                <div className="font-medium text-gray-900">{getValue() || ''}</div>
            ),
            size: 150,
        },
        {
            accessorKey: 'name',
            header: 'ชื่อครุภัณฑ์',
            cell: ({ getValue }) => (
                <div className="font-medium text-gray-900">{getValue()}</div>
            ),
            size: 200,
        },
        {
            accessorKey: 'value',
            header: 'ต้นทุนต่อหน่วย',
            cell: ({ getValue }) => (
                <div className="text-gray-900 text-right">{(getValue() || 0).toLocaleString()} บาท</div>
            ),
            size: 120,
        },
        {
            accessorKey: 'serialNumber',
            header: 'หมายเลขซีเรียล',
            cell: ({ getValue }) => (
                <div className="text-gray-900">{getValue() || ''}</div>
            ),
            size: 150,
        },
        {
            accessorKey: 'status',
            header: 'สถานะ',
            cell: ({ getValue }) => {
                const status = getValue()
                const statusConfig = {
                    'ASSIGNED': { label: 'กำลังใช้งาน', class: 'bg-green-100 text-green-800' },
                    'AVAILABLE': { label: 'ว่าง', class: 'bg-blue-100 text-blue-800' },
                    'MAINTENANCE': { label: 'ซ่อมแซม', class: 'bg-yellow-100 text-yellow-800' },
                    'DISPOSED': { label: 'จำหน่าย', class: 'bg-red-100 text-red-800' }
                }
                const config = statusConfig[status] || { label: status, class: 'bg-gray-100 text-gray-800' }
                return (
                    <span className={`px-2 py-1 text-xs rounded-full ${config.class}`}>
                        {config.label}
                    </span>
                )
            },
            size: 120,
        },
        {
            accessorKey: 'owner',
            header: 'ผู้รับผิดชอบ',
            cell: ({ getValue }) => {
                const owner = getValue()
                if (owner && owner !== 'ไม่ระบุผู้รับผิดชอบ') {
                    return (
                        <div className="text-gray-900">
                            {owner}
                        </div>
                    )
                }
                return <div className="text-gray-900"></div>
            },
            size: 150,
        },
        {
            accessorKey: 'room',
            header: 'สถานที่ใช้งาน',
            cell: ({ getValue }) => (
                <div className="text-gray-900">{getValue() || ''}</div>
            ),
            size: 150,
        },
    ], [])

    const tableData = useMemo(() => {
        if (!reportData) return []

        if (filterInfo.reportType === 'annual-by-user') {
            const allAssets = []
            if (reportData.userGroups) {
                reportData.userGroups.forEach(userGroup => {
                    userGroup.assets.forEach(asset => {
                        allAssets.push({
                            ...asset,
                            owner: userGroup.user.name
                        })
                    })
                })
            }
            return allAssets
        } else {
            return reportData.assets || []
        }
    }, [reportData, filterInfo.reportType])

    // สร้าง table instance
    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
        columnResizeMode: 'onChange',
    })

    useEffect(() => {
        // รับข้อมูลจาก state ที่ส่งมาจากหน้า AnnualReport
        if (location.state) {
            setFilterInfo(location.state.filterInfo)
            setReportData(location.state.reportData)
        } else {
            // ถ้าไม่มีข้อมูล ให้กลับไปหน้า AnnualReport
            navigate('/report/annual')
        }
    }, [location.state, navigate])

    // ดึงข้อมูลหมวดหมู่และห้อง
    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const [categoriesResponse, roomsResponse] = await Promise.all([
                    axios.get(`/api/category/all`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }),
                    axios.get(`/api/room/all`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                ])

                if (categoriesResponse.data.success) {
                    setCategoryNames(categoriesResponse.data.data)
                }
                if (roomsResponse.data.success) {
                    setRoomNames(roomsResponse.data.data)
                }
            } catch (error) {
                console.error('Error fetching filter data:', error)
            }
        }

        fetchFilterData()
    }, [backendUrl])

    // ฟังก์ชันแปลง ID เป็นชื่อ
    const getCategoryNames = () => {
        if (!filterInfo.selectedCategories || filterInfo.selectedCategories.length === 0) return 'ทั้งหมด'
        return filterInfo.selectedCategories.map(id => {
            const category = categoryNames.find(cat => cat.id === id)
            return category ? category.name : `ID: ${id}`
        }).join(', ')
    }

    const getRoomNames = () => {
        if (!filterInfo.selectedRooms || filterInfo.selectedRooms.length === 0) return 'ทั้งหมด'
        return filterInfo.selectedRooms.map(id => {
            const room = roomNames.find(r => r.id === id)
            return room ? room.name : `ID: ${id}`
        }).join(', ')
    }

    const getUserNames = () => {
        if (!filterInfo.selectedUsers || filterInfo.selectedUsers.length === 0) return 'ทั้งหมด'
        return filterInfo.selectedUsers.map(user => user.name).join(', ')
    }

    const exportReport = async () => {
        if (!reportData) {
            alert('กรุณาสร้างรายงานก่อน')
            return
        }

        setExporting(true)
        try {
            let filterParams, endpoint, filename

            if (filterInfo.reportType === 'annual-by-user') {
                filterParams = {
                    year: filterInfo.year,
                    userIds: filterInfo.selectedUsers
                }
                endpoint = '/api/report/export/annual-by-user/excel'
                filename = `annual_by_user_report_${filterInfo.year}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`
            } else {
                filterParams = {
                    year: filterInfo.year,
                    categoryIds: filterInfo.selectedCategories,
                    roomIds: filterInfo.selectedRooms
                }
                endpoint = '/api/report/export/excel'
                filename = `annual_report_${filterInfo.year}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`
            }

            const response = await axios.post(`${backendUrl}${endpoint}`, filterParams, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                responseType: 'blob'
            })

            // สร้าง URL สำหรับดาวน์โหลดไฟล์
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', filename)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

        } catch (error) {
            console.error('Error exporting report:', error)
            if (error.response) {
                alert(error.response.data.message || 'เกิดข้อผิดพลาดในการส่งออกรายงาน')
            } else {
                alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
            }
        } finally {
            setExporting(false)
        }
    }

    const goBack = () => {
        if (filterInfo.reportType === 'annual-by-user') {
            navigate('/report/annual-by-user')
        } else {
            navigate('/report/annual')
        }
    }

    if (!reportData) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="text-center py-8">
                    <div className="text-gray-500">
                        <div className="text-lg font-medium mb-2">ไม่พบข้อมูลรายงาน</div>
                        <div className="text-sm">กรุณากลับไปสร้างรายงานใหม่</div>
                    </div>
                    <button
                        onClick={goBack}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2 mx-auto"
                    >
                        <FiArrowLeft size={16} />
                        กลับไปสร้างรายงาน
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={goBack}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">

                            พรีวิวรายงานประจำปี
                        </h2>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={exportReport}
                        disabled={exporting}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <FiDownload size={16} />
                        {exporting ? 'กำลังส่งออก...' : 'ส่งออกรายงาน'}
                    </button>
                </div>
            </div>

            {/* รายการครุภัณฑ์ */}
            {tableData && tableData.length > 0 ? (
                <div>
                    {/* TanStack Table */}
                    <div className="overflow-auto max-h-96 border border-gray-200 rounded-lg scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th
                                                key={header.id}
                                                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                                                onClick={header.column.getToggleSortingHandler()}
                                                style={{
                                                    cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                                    width: header.getSize()
                                                }}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                {{
                                                    asc: ' 🔼',
                                                    desc: ' 🔽',
                                                }[header.column.getIsSorted()] ?? null}

                                                {/* Column Resize Handle */}
                                                {header.column.getCanResize() && (
                                                    <div
                                                        onMouseDown={header.getResizeHandler()}
                                                        onTouchStart={header.getResizeHandler()}
                                                        className="absolute right-0 top-0 h-full w-1 bg-gray-300 cursor-col-resize select-none touch-none hover:bg-gray-400"
                                                        style={{
                                                            transform: 'translateX(50%)',
                                                        }}
                                                    />
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {table.getRowModel().rows.map((row, index) => (
                                    <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        {row.getVisibleCells().map(cell => (
                                            <td
                                                key={cell.id}
                                                className="px-4 py-2 text-sm"
                                                style={{ width: cell.column.getSize() }}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">
                                {table.getFilteredRowModel().rows.length > 0 ? (
                                    <>
                                        แสดง {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} ถึง{' '}
                                        {Math.min(
                                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                            table.getFilteredRowModel().rows.length
                                        )}{' '}
                                        จากทั้งหมด {table.getFilteredRowModel().rows.length} รายการ
                                        {globalFilter && (
                                            <span className="text-blue-600 ml-1">(กรองแล้ว)</span>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-red-600">ไม่พบข้อมูลที่ตรงกับการค้นหา</span>
                                )}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                หน้าแรก
                            </button>
                            <button
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiChevronLeft size={16} />
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-700">
                                หน้า {table.getState().pagination.pageIndex + 1} จาก {table.getPageCount()}
                            </span>
                            <button
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiChevronRight size={16} />
                            </button>
                            <button
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                หน้าสุดท้าย
                            </button>
                        </div>
                    </div>

                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-700">แสดง:</span>
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={e => table.setPageSize(Number(e.target.value))}
                            className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {[5, 10, 20, 30, 40, 50].map(pageSize => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize} รายการ
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                    <div className="text-gray-500">
                        <div className="text-lg font-medium mb-2">ไม่พบข้อมูลครุภัณฑ์</div>
                        <div className="text-sm">ไม่มีครุภัณฑ์ที่ตรงกับเงื่อนไขที่เลือก</div>
                    </div>
                </div>
            )}

            {/* Footer Info */}
            <div className="text-sm text-gray-600 mt-1">
                <ul className='font-medium'>
                    <li>
                        ปี: {filterInfo.year}
                    </li>
                    {filterInfo.reportType === 'annual-by-user' ? (
                        <li key="user-filter">
                            ผู้ใช้: {getUserNames()}
                        </li>
                    ) : (
                        <>
                            <li>
                                หมวดหมู่: {getCategoryNames()}
                            </li>
                            <li>
                                ห้อง: {getRoomNames()}
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    )
}

export default ReportPreview
