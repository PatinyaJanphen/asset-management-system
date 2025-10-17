import React, { useContext, useState, useEffect } from 'react'
import { LineChart, PieChart } from '@mui/x-charts';
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContent } from '../context/AppContext';

const Dashboard = () => {
  const { backendUrl, userData } = useContext(AppContent)

  const [summary, setSummary] = useState({
    totalAsset: 0,
    totalInuse: 0,
    totalReair: 0,
    totalUsers: 0,
    assetByCategory: [],
    assetsAddedByMonth: []
  })

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  const fetchSummary = async () => {
    try {
      const isAdminLike = (role) => ['ADMIN', 'ASSET_STAFF'].includes(role)

      let url = isAdminLike(userData.role) ? backendUrl + '/api/dashboard/summary'
        : backendUrl + '/api/dashboard/summary/owner'

      if (isAdminLike(userData.role) && dateRange.startDate && dateRange.endDate) {
        url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      }

      const { data } = await axios.get(url)
      if (data.success) {
        setSummary({
          totalAsset: data.data.totalAsset,
          totalInuse: data.data.totalInuse,
          totalReair: data.data.totalReair,
          totalUsers: data.data.totalUsers,
          assetByCategory: data.data.assetByCategory,
          assetsAddedByMonth: data.data.assetsAddedByMonth
        })
      }
      else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchSummary()
    }
  }, [dateRange])

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetDateRange = () => {
    setDateRange({
      startDate: '',
      endDate: ''
    })
  }

  return (
    <>
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:${userData.role === 'OWNER' ? 'grid-cols-3' : 'grid-cols-4'} gap-4 mb-5`}>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Assets</h3>
          <p className="text-2xl font-bold">{summary.totalAsset}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Assets In Use</h3>
          <p className="text-2xl font-bold">{summary.totalInuse}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Assets To Repair</h3>
          <p className="text-2xl font-bold">{summary.totalReair}</p>
        </div>
        {(userData.role === "ADMIN" || userData.role === "ASSET_STAFF") &&
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Total Users</h3>
            <p className="text-2xl font-bold">{summary.totalUsers}</p>
          </div>
        }
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4 mb-5">
        {summary.assetByCategory.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow mt-6">
            <h3 className="text-lg font-semibold mb-3">Assets by Category</h3>
            <PieChart
              series={[
                {
                  data: summary.assetByCategory.map(c => ({
                    id: c.categoryId,
                    value: c.count,
                    label: c.categoryName,
                  })),
                },
              ]}
              width={400}
              height={250}
            />
          </div>
        )}

        {(userData.role === "ADMIN" || userData.role === "ASSET_STAFF") && (
          <div className="bg-white p-4 rounded-lg shadow mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Assets Added by Month</h3>
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  placeholder="วันที่เริ่มต้น"
                />
                <span className="text-gray-500">ถึง</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  placeholder="วันที่สิ้นสุด"
                />
                <button
                  onClick={resetDateRange}
                  className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
                >
                  รีเซ็ต
                </button>
              </div>
            </div>

            {summary.assetsAddedByMonth.length > 0 ? (
              <LineChart
                series={[
                  {
                    data: summary.assetsAddedByMonth.map(i => i.count),
                    label: 'New Assets',
                    showMark: true,
                    markSize: 8,
                    markShape: 'circle',
                  },
                ]}
                xAxis={[
                  {
                    data: summary.assetsAddedByMonth.map(i => i.month),
                    scaleType: 'point',
                  },
                ]}
                yAxis={[
                  {
                    scaleType: 'linear',
                    tickMinStep: 1,
                  },
                ]}
                slotProps={{
                  line: {
                    strokeWidth: 3,
                  },
                  mark: {
                    fill: '#1976d2',
                    stroke: '#1976d2',
                    strokeWidth: 2,
                  },
                }}
                tooltip={{
                  trigger: 'axis',
                  formatter: (params) => {
                    const data = params[0];
                    return `${data.name}: ${data.value} Assets`;
                  }
                }}
                height={300}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                {dateRange.startDate && dateRange.endDate
                  ? 'ไม่มีข้อมูลในช่วงเวลาที่เลือก'
                  : 'กรุณาเลือกช่วงเวลาเพื่อดูกราฟ'
                }
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default Dashboard