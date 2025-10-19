import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContent } from '../../context/AppContext';

const ImportHistory = () => {
    const {  } = useContext(AppContent);
    const navigate = useNavigate();
    const [imports, setImports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });
    const [selectedImport, setSelectedImport] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchImportHistory();
    }, [pagination.currentPage]);

    const fetchImportHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/import/history`, {
                params: {
                    page: pagination.currentPage,
                    limit: pagination.itemsPerPage
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                setImports(response.data.data.imports);
                setPagination(response.data.data.pagination);
            } else {
                toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการ import');
            }
        } catch (error) {
            console.error('Error fetching import history:', error);
            toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการ import');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (importId) => {
        try {
            const response = await axios.get(`/api/import/detail/${importId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                setSelectedImport(response.data.data);
                setShowDetailModal(true);
            } else {
                toast.error('เกิดข้อผิดพลาดในการดึงรายละเอียดการ import');
            }
        } catch (error) {
            console.error('Error fetching import detail:', error);
            toast.error('เกิดข้อผิดพลาดในการดึงรายละเอียดการ import');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (importRecord) => {
        if (importRecord.failedRows === 0) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    สำเร็จทั้งหมด
                </span>
            );
        } else if (importRecord.successRows === 0) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    ล้มเหลวทั้งหมด
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    บางส่วนสำเร็จ
                </span>
            );
        }
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">ประวัติการ Import ข้อมูล</h1>
                        <p className="text-gray-600 mt-1">ดูประวัติการนำเข้าข้อมูลสินทรัพย์ทั้งหมด</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/management/asset')}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            กลับ
                        </button>
                    </div>
                </div>
            </div>

            {/* สถิติรวม */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg  shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">{pagination.totalItems}</div>
                    <div className="text-sm text-gray-600">การ Import ทั้งหมด</div>
                </div>
                <div className="bg-white p-4 rounded-lg  shadow-sm">
                    <div className="text-2xl font-bold text-green-600">
                        {imports.filter(imp => imp.failedRows === 0).length}
                    </div>
                    <div className="text-sm text-gray-600">สำเร็จทั้งหมด</div>
                </div>
                <div className="bg-white p-4 rounded-lg  shadow-sm">
                    <div className="text-2xl font-bold text-yellow-600">
                        {imports.filter(imp => imp.successRows > 0 && imp.failedRows > 0).length}
                    </div>
                    <div className="text-sm text-gray-600">บางส่วนสำเร็จ</div>
                </div>
                <div className="bg-white p-4 rounded-lg  shadow-sm">
                    <div className="text-2xl font-bold text-red-600">
                        {imports.filter(imp => imp.successRows === 0).length}
                    </div>
                    <div className="text-sm text-gray-600">ล้มเหลวทั้งหมด</div>
                </div>
            </div>

            {/* ตารางประวัติ */}
            <div className="bg-white rounded-lg  shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">รายการ Import</h3>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-600">กำลังโหลด...</span>
                    </div>
                ) : imports.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่มีข้อมูลการ Import</h3>
                        <p className="mt-1 text-sm text-gray-500">ยังไม่มีการนำเข้าข้อมูลสินทรัพย์</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ไฟล์
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            สถานะ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ผลลัพธ์
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ผู้ Import
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            วันที่
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            การดำเนินการ
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {imports.map((importRecord) => (
                                        <tr key={importRecord.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <svg className="h-8 w-8 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {importRecord.filename}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(importRecord)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-center">
                                                        <div className="text-lg font-semibold text-blue-600">{importRecord.totalRows}</div>
                                                        <div className="text-xs text-gray-500">ทั้งหมด</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-lg font-semibold text-green-600">{importRecord.successRows}</div>
                                                        <div className="text-xs text-gray-500">สำเร็จ</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-lg font-semibold text-red-600">{importRecord.failedRows}</div>
                                                        <div className="text-xs text-gray-500">ล้มเหลว</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {importRecord.importedBy ? (
                                                    <div>
                                                        <div className="font-medium">{importRecord.importedBy.name}</div>
                                                        <div className="text-gray-500">{importRecord.importedBy.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">ไม่ระบุ</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(importRecord.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleViewDetail(importRecord.id)}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                >
                                                    ดูรายละเอียด
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="px-6 py-3 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        แสดง {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} ถึง{' '}
                                        {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} จาก{' '}
                                        {pagination.totalItems} รายการ
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            disabled={pagination.currentPage === 1}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            ก่อนหน้า
                                        </button>
                                        <span className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md">
                                            {pagination.currentPage}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                            disabled={pagination.currentPage === pagination.totalPages}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            ถัดไป
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal รายละเอียด */}
            {showDetailModal && selectedImport && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">รายละเอียดการ Import</h3>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">ชื่อไฟล์</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedImport.filename}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">วันที่ Import</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatDate(selectedImport.created_at)}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ผู้ Import</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedImport.importedBy ? `${selectedImport.importedBy.name} (${selectedImport.importedBy.email})` : 'ไม่ระบุ'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{selectedImport.totalRows}</div>
                                        <div className="text-sm text-gray-600">จำนวนแถวทั้งหมด</div>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">{selectedImport.successRows}</div>
                                        <div className="text-sm text-gray-600">นำเข้าสำเร็จ</div>
                                    </div>
                                    <div className="text-center p-3 bg-red-50 rounded-lg">
                                        <div className="text-2xl font-bold text-red-600">{selectedImport.failedRows}</div>
                                        <div className="text-sm text-gray-600">นำเข้าล้มเหลว</div>
                                    </div>
                                </div>

                                {selectedImport.errorLog && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียด Error</label>
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                                            <pre className="text-sm text-red-800 whitespace-pre-wrap">{selectedImport.errorLog}</pre>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
                                >
                                    ปิด
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportHistory;
