import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
const Report = () => {
  const navigate = useNavigate()
  const [isReportOneOpen, setIsReportOpen] = useState(false)
  return (
    <div>
      <h2 className='mb-5 text-2xl font-bold text-gray-800'>Report</h2>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <ul className='grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 mb-5'>
          <li className='bg-amber-100 rounded-2xl'>
            <div onClick={() => setIsReportOpen(!isReportOneOpen)}
              className="flex font-bold items-center gap-2 bg-amber-400 px-5 py-2 rounded-2xl cursor-pointer">
              1.Annual report
            </div>
            {isReportOneOpen && (
              <ul className="ml-10 mt-3 mb-5 space-y-1 text-sm">
                <li onClick={() => navigate('/report/annual')} className='my-2 cursor-pointer'>
                  1.1 รายงานทรัพย์สิน
                </li>
              </ul>
            )
            }
          </li>
        </ul>
      </div>
    </div>

  )
}

export default Report