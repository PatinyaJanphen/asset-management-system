import React, { useContext, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContent } from '../../context/AppContext'
import {
    flexRender,
    getCoreRowModel,
    getFacetedMinMaxValues,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'

const Asset = () => {
    const { userData  } = useContext(AppContent)
    const navigate = useNavigate()
    const [assets, setAssets] = useState([])
    const [loading, setLoading] = useState(true)
    const [columnFilters, setColumnFilters] = useState([])

    const fetchAssets = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get('/api/asset/all')
            if (data.success) {
                setAssets(data.data || [])
            } else {
                toast.error(data.message)
                setAssets([])
            }
        } catch (error) {
            toast.error(error.message)
            setAssets([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAssets()
    }, [])

    const handleEditRoom = (assets) => {
        navigate(`/management/asset/edit/${assets.id}`)
    }

    const columns = useMemo(
        () => [
            {
                accessorKey: 'code',
                header: 'รหัสสินทรัพย์',
                cell: info => info.getValue(),
                meta: {
                    filterVariant: 'text',
                },
            },
            {
                accessorKey: 'name',
                header: 'ชื่อสินทรัพย์',
                cell: info => info.getValue(),
                meta: {
                    filterVariant: 'text',
                },
            },
            {
                accessorKey: 'status',
                header: 'สถานะ',
                cell: info => {
                    const status = info.getValue()
                    const statusMap = {
                        'AVAILABLE': 'พร้อมใช้งาน',
                        'ASSIGNED': 'มอบหมายแล้ว',
                        'MAINTENANCE': 'ซ่อมบำรุง',
                        'RETIRED': 'ปลดระวาง'
                    }
                    return statusMap[status] || status
                },
                meta: {
                    filterVariant: 'text',
                },
            },
            {
                accessorKey: 'category',
                header: 'หมวดหมู่',
                cell: info => {
                    const category = info.row.original.category
                    return category ? category.name : '-'
                },
                meta: {
                    filterVariant: 'text',
                },
            },
            {
                accessorKey: 'room',
                header: 'ห้อง',
                cell: info => {
                    const room = info.row.original.room
                    return room ? `${room.name} (${room.code})` : '-'
                },
                meta: {
                    filterVariant: 'text',
                },
            },
            {
                accessorKey: 'owner',
                header: 'เจ้าของ',
                cell: info => {
                    const owner = info.row.original.owner
                    return owner ? `${owner.firstname} ${owner.lastname}` : '-'
                },
                meta: {
                    filterVariant: 'text',
                },
            },
            ...(userData && (userData.role === "ADMIN" || userData.role === "ASSET_STAFF")
                ? [{
                    id: 'actions',
                    header: 'การดำเนินการ',
                    cell: ({ row }) => (
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEditRoom(row.original)}
                                className="px-3 py-1 bg-amber-300 text-black rounded hover:bg-amber-400 text-sm"
                            >
                                แก้ไข
                            </button>
                        </div>
                    ),
                }]
                : []),
        ],
        []
    )

    const table = useReactTable({
        data: assets,
        columns,
        state: {
            columnFilters,
        },
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        debugTable: true,
        debugHeaders: true,
        debugColumns: false,
    })

    if (loading) {
        return (
            <div className="p-4 bg-white rounded shadow">
                <div className="text-center">Loading...</div>
            </div>
        )
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">จัดการสินทรัพย์</h2>
                {userData && (userData.role === "ADMIN" || userData.role === "ASSET_STAFF") &&
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                            onClick={() => { navigate('/management/asset/create') }}
                        >+ เพิ่มสินทรัพย์ </button>
                    </div>
                }
            </div>
            <table className="min-w-full border border-gray-300">
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id} className="bg-gray-100">
                            {headerGroup.headers.map(header => {
                                return (
                                    <th key={header.id} colSpan={header.colSpan} className="border border-gray-300 p-2">
                                        {header.isPlaceholder ? null : (
                                            <>
                                                <div
                                                    {...{
                                                        className: header.column.getCanSort()
                                                            ? 'cursor-pointer select-none'
                                                            : '',
                                                        onClick: header.column.getToggleSortingHandler(),
                                                    }}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {{
                                                        asc: ' 🔼',
                                                        desc: ' 🔽',
                                                    }[header.column.getIsSorted()] ?? null}
                                                </div>
                                                {header.column.getCanFilter() ? (
                                                    <div>
                                                        <Filter column={header.column} />
                                                    </div>
                                                ) : null}
                                            </>
                                        )}
                                    </th>
                                )
                            })}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => {
                        return (
                            <tr key={row.id} className="hover:bg-gray-50">
                                {row.getVisibleCells().map(cell => {
                                    return (
                                        <td key={cell.id} className="border border-gray-300 p-2">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            <div className="h-2" />

            <div className="flex items-center gap-2">
                <button
                    className="border rounded p-1"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                >
                    {'<<'}
                </button>
                <button
                    className="border rounded p-1"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    {'<'}
                </button>
                <button
                    className="border rounded p-1"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    {'>'}
                </button>
                <button
                    className="border rounded p-1"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                >
                    {'>>'}
                </button>
                <span className="flex items-center gap-1">
                    <div>Page</div>
                    <strong>
                        {table.getState().pagination.pageIndex + 1} of{' '}
                        {table.getPageCount()}
                    </strong>
                </span>
                <span className="flex items-center gap-1">
                    | Go to page:
                    <input
                        type="number"
                        defaultValue={table.getState().pagination.pageIndex + 1}
                        onChange={e => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0
                            table.setPageIndex(page)
                        }}
                        className="border p-1 rounded w-16"
                    />
                </span>
                <select
                    value={table.getState().pagination.pageSize}
                    onChange={e => {
                        table.setPageSize(Number(e.target.value))
                    }}
                >
                    {[10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>

            <div>{table.getPrePaginationRowModel().rows.length} Rows</div>

        </div>
    )
}

function Filter({ column }) {
    const { filterVariant } = column.columnDef.meta ?? {}

    const columnFilterValue = column.getFilterValue()

    const sortedUniqueValues = useMemo(
        () =>
            filterVariant === 'range'
                ? []
                : Array.from(column.getFacetedUniqueValues().keys())
                    .sort()
                    .slice(0, 5000),
        [column.getFacetedUniqueValues(), filterVariant]
    )

    return filterVariant === 'range' ? (
        <div>
            <div className="flex space-x-2">
                <DebouncedInput
                    type="number"
                    min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
                    max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
                    value={columnFilterValue?.[0] ?? ''}
                    onChange={value =>
                        column.setFilterValue((old) => [value, old?.[1]])
                    }
                    placeholder={`Min ${column.getFacetedMinMaxValues()?.[0] !== undefined
                        ? `(${column.getFacetedMinMaxValues()?.[0]})`
                        : ''
                        }`}
                    className="w-24 border shadow rounded"
                />
                <DebouncedInput
                    type="number"
                    min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
                    max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
                    value={columnFilterValue?.[1] ?? ''}
                    onChange={value =>
                        column.setFilterValue((old) => [old?.[0], value])
                    }
                    placeholder={`Max ${column.getFacetedMinMaxValues()?.[1]
                        ? `(${column.getFacetedMinMaxValues()?.[1]})`
                        : ''
                        }`}
                    className="w-24 border shadow rounded"
                />
            </div>
            <div className="h-1" />
        </div>
    ) : filterVariant === 'select' ? (
        <select
            onChange={e => column.setFilterValue(e.target.value)}
            value={columnFilterValue?.toString()}
        >
            <option value="">All</option>
            {sortedUniqueValues.map((value, index) => (
                <option value={value} key={`${column.id}-select-${index}`}>
                    {value}
                </option>
            ))}
        </select>
    ) : (
        <>
            <datalist id={column.id + 'list'}>
                {sortedUniqueValues.map((value, index) => (
                    <option value={value} key={`${column.id}-${index}`} />
                ))}
            </datalist>
            <DebouncedInput
                type="text"
                value={columnFilterValue ?? ''}
                onChange={value => column.setFilterValue(value)}
                placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
                className="w-36 border shadow rounded"
                list={column.id + 'list'}
            />
            <div className="h-1" />
        </>
    )
}

function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 500,
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
    }, [value])

    return (
        <input {...props} value={value} onChange={e => setValue(e.target.value)} />
    )
}

export default Asset;
