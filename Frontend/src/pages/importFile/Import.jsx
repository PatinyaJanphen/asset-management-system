import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContent } from '../../context/AppContext';
import { FileUploadProgress, ImportProgress } from '../../components/ProgressIndicator';

const Import = () => {
    const { backendUrl, userData } = useContext(AppContent);
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState('asset');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [importStep, setImportStep] = useState(1);
    const [currentStep, setCurrentStep] = useState('uploading');

    const importTypes = [
        { value: 'asset', label: 'สินทรัพย์ (Asset)', description: 'นำเข้าข้อมูลสินทรัพย์' },
        { value: 'room', label: 'ห้อง (Room)', description: 'นำเข้าข้อมูลห้อง' },
        { value: 'category', label: 'หมวดหมู่ (Category)', description: 'นำเข้าข้อมูลหมวดหมู่' },
        { value: 'user', label: 'ผู้ใช้ (User)', description: 'นำเข้าข้อมูลผู้ใช้' }
    ];

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const allowedTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
                'application/vnd.ms-excel', // .xls
                'text/csv' // .csv
            ];

            if (allowedTypes.includes(selectedFile.type) ||
                selectedFile.name.endsWith('.xlsx') ||
                selectedFile.name.endsWith('.xls') ||
                selectedFile.name.endsWith('.csv')) {
                setFile(selectedFile);
                setImportResult(null);
            } else {
                toast.error('รองรับเฉพาะไฟล์ .xlsx, .xls และ .csv เท่านั้น');
                e.target.value = '';
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('กรุณาเลือกไฟล์ที่ต้องการนำเข้า');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            setImportResult(null);
            setUploadProgress(0);
            setImportStep(1);
            setCurrentStep('uploading');

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const { data } = await axios.post(
                backendUrl + `/api/import/${selectedType}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            clearInterval(progressInterval);
            setUploadProgress(100);
            setCurrentStep('processing');
            setImportStep(2);

            // Simulate processing step
            setTimeout(() => {
                setCurrentStep('saving');
                setImportStep(3);
            }, 1000);

            if (data.success) {
                setImportResult(data.data);
                setFile(null);
                const fileInput = document.getElementById('fileInput');
                if (fileInput) fileInput.value = '';
                toast.success(data.message);
            } else {
                setImportResult(data.data);
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Import error:', error);
            console.error('Error response:', error.response?.data);
            const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล';
            const errorList = error.response?.data?.data?.errors || [errorMessage];

            setImportResult(error.response?.data?.data || null);
            toast.error(errorMessage);
        } finally {
            setUploading(false);
            setUploadProgress(0);
            setImportStep(1);
            setCurrentStep('uploading');
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get(backendUrl + `/api/import/template/${selectedType}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${selectedType}_template.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('ดาวน์โหลด template สำเร็จ');
        } catch (error) {
            console.error('Download template error:', error);
            toast.error('เกิดข้อผิดพลาดในการดาวน์โหลด template');
        }
    };

    const handleReset = () => {
        setImportResult(null);
        setFile(null);
        setUploadProgress(0);
        setImportStep(1);
        setCurrentStep('uploading');
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">ระบบ Import ข้อมูล</h1>
                <button
                    onClick={() => navigate('/import/import-history')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    ประวัติ Import
                </button>
            </div>

            {/* เลือกประเภท Import */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    เลือกประเภทข้อมูลที่ต้องการ Import
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {importTypes.map((type) => (
                        (type.value !== 'user' || (type.value === 'user' && userData.role === 'ADMIN')) && (
                            <div
                                key={type.value}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedType === type.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                onClick={() => {
                                    setSelectedType(type.value);
                                    handleReset();
                                }}
                            >
                                <h3 className="font-medium text-gray-900">{type.label}</h3>
                                <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                            </div>
                        )
                    ))}
                </div>
            </div>

            {/* อัปโหลดไฟล์ */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    เลือกไฟล์ที่ต้องการนำเข้า
                </label>
                <div className="flex items-center gap-4">
                    <input
                        id="fileInput"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <button
                        onClick={handleDownloadTemplate}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 text-sm font-medium"
                    >
                        ดาวน์โหลด Template
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    รองรับไฟล์ .xlsx, .xls และ .csv
                </p>
            </div>

            {/* ปุ่ม Import */}
            <div className="mb-6">
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`px-6 py-2 rounded-md font-medium transition-colors duration-200 ${!file || uploading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                >
                    {uploading ? 'กำลังนำเข้าข้อมูล...' : 'นำเข้าข้อมูล'}
                </button>
            </div>

            {/* แสดงสถานะการอัพโหลด */}
            {uploading && (
                <div className="mb-6 space-y-4">
                    <FileUploadProgress
                        progress={uploadProgress}
                        fileName={file?.name || ''}
                        fileSize={file?.size || 0}
                        status="uploading"
                    />
                    <ImportProgress
                        step={importStep}
                        totalSteps={3}
                        currentStep={currentStep}
                        progress={uploadProgress}
                        message={`กำลังนำเข้าข้อมูล${importTypes.find(t => t.value === selectedType)?.label || ''}`}
                    />
                </div>
            )}

            {/* แสดงผลลัพธ์ */}
            {importResult && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">ผลการนำเข้าข้อมูล</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600">จำนวนแถวทั้งหมด</p>
                            <p className="text-2xl font-bold text-gray-900">{importResult.totalRows}</p>
                        </div>
                        <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600">สำเร็จ</p>
                            <p className="text-2xl font-bold text-green-600">{importResult.successRows}</p>
                        </div>
                        <div className="bg-white p-3 rounded-md">
                            <p className="text-sm text-gray-600">ล้มเหลว</p>
                            <p className="text-2xl font-bold text-red-600">{importResult.failedRows}</p>
                        </div>
                    </div>

                    {importResult.errors && importResult.errors.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-md font-medium text-gray-900 mb-2">รายการข้อผิดพลาด:</h4>
                            <div className="bg-red-50 border border-red-200 rounded-md p-3 max-h-40 overflow-y-auto">
                                {importResult.errors.map((error, index) => (
                                    <p key={index} className="text-sm text-red-700 mb-1">
                                        {error}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={handleReset}
                            className={`px-4 py-2 rounded-md transition-colors duration-200 ${importResult.successRows > 0
                                ? 'bg-gray-500 text-white hover:bg-gray-600'
                                : 'bg-red-500 text-white hover:bg-red-600'
                                }`}
                        >
                            {importResult.successRows > 0 ? 'นำเข้าไฟล์ใหม่' : 'ลองใหม่อีกครั้ง'}
                        </button>

                        {importResult.importId && (
                            <button
                                onClick={() => navigate(`/import/import-history`)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                            >
                                ดูประวัติ Import
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Import;
