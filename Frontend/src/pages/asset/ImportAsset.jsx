import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContent } from '../../context/AppContext';

const ImportAsset = () => {
    const { backendUrl } = useContext(AppContent);
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [importResult, setImportResult] = useState(null);


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
            
            const { data } = await axios.post(
                backendUrl + '/api/asset/import',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (data.success) {
                setImportResult(data.data);
                setFile(null);
                
                // รีเซ็ต input file
                const fileInput = document.getElementById('fileInput');
                if (fileInput) fileInput.value = '';
                
                toast.success(data.message);
            } else {
                setImportResult(data.data);
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/asset/template', {
                responseType: 'blob',
            });

            // สร้าง URL สำหรับดาวน์โหลด
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'asset_template.xlsx');
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

    const handleBack = () => {
        navigate('/management/assets');
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">นำเข้าข้อมูลสินทรัพย์</h2>
                <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
                >
                    ← กลับ
                </button>
            </div>

            {/* คำแนะนำ */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">คำแนะนำการใช้งาน</h3>
                <ul className="text-blue-700 space-y-1 text-sm">
                    <li>• รองรับไฟล์ .xlsx, .xls และ .csv</li>
                    <li>• ดาวน์โหลด template เพื่อดูรูปแบบไฟล์ที่ถูกต้อง</li>
                    <li>• ใช้ชื่อหมวดหมู่, รหัสห้อง และอีเมลเจ้าของแทน ID</li>
                    <li>• รหัสสินทรัพย์และชื่อสินทรัพย์จำเป็นต้องกรอก</li>
                </ul>
            </div>

            {/* คำเตือน */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                        <h4 className="font-semibold text-yellow-800 mb-1">คำเตือนสำคัญ</h4>
                        <p className="text-yellow-700 text-sm">
                            ระบบจะตรวจสอบข้อมูลทั้งหมดก่อนเริ่มบันทึก หากพบ email, หมวดหมู่ หรือห้องที่ไม่มีในระบบ 
                            การอัปโหลดจะถูกยกเลิกทั้งหมด กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนอัปโหลด
                        </p>
                    </div>
                </div>
            </div>

            {/* ดาวน์โหลด Template */}
            <div className="mb-6">
                <button
                    onClick={handleDownloadTemplate}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    ดาวน์โหลด Template
                </button>
            </div>

            {/* อัปโหลดไฟล์ */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div className="mb-4">
                    <label htmlFor="fileInput" className="cursor-pointer">
                        <span className="text-lg font-medium text-gray-700">
                            คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                        </span>
                        <input
                            id="fileInput"
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                </div>
                <p className="text-sm text-gray-500">
                    รองรับไฟล์ .xlsx, .xls และ .csv ขนาดไม่เกิน 10MB
                </p>
                
                {file && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-700">
                            <strong>ไฟล์ที่เลือก:</strong> {file.name}
                        </p>
                        <p className="text-green-600 text-sm">
                            ขนาด: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                )}
            </div>

            {/* ปุ่มอัปโหลด */}
            <div className="flex justify-center mb-6">
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
                        !file || uploading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                >
                    {uploading ? (
                        <div className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            กำลังประมวลผล...
                        </div>
                    ) : (
                        'นำเข้าข้อมูล'
                    )}
                </button>
            </div>


            {/* ผลลัพธ์การนำเข้า */}
            {importResult && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {importResult.successRows > 0 ? 'ผลการนำเข้าข้อมูล' : 'การนำเข้าข้อมูลไม่สำเร็จ'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white p-4 rounded-lg border">
                            <div className="text-2xl font-bold text-blue-600">{importResult.totalRows}</div>
                            <div className="text-sm text-gray-600">จำนวนแถวทั้งหมด</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                            <div className="text-2xl font-bold text-green-600">{importResult.successRows}</div>
                            <div className="text-sm text-gray-600">นำเข้าสำเร็จ</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                            <div className="text-2xl font-bold text-red-600">{importResult.failedRows}</div>
                            <div className="text-sm text-gray-600">นำเข้าล้มเหลว</div>
                        </div>
                    </div>

                    {importResult.errors && importResult.errors.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold text-red-600 mb-2">
                                รายการข้อผิดพลาด ({importResult.errors.length} รายการ):
                            </h4>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                                {importResult.errors.map((error, index) => (
                                    <div key={index} className="text-red-700 text-sm mb-2 p-2 bg-white rounded border-l-4 border-red-400">
                                        <span className="font-medium">•</span> {error}
                                    </div>
                                ))}
                            </div>
                            
                            {importResult.successRows === 0 && (
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <span className="text-yellow-800 font-medium">
                                            การอัปโหลดถูกยกเลิกเนื่องจากพบข้อผิดพลาด กรุณาแก้ไขข้อมูลและลองใหม่อีกครั้ง
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-4 flex gap-2">
                        {importResult.successRows > 0 && (
                            <button
                                onClick={() => navigate('/management/assets')}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                            >
                                ดูรายการสินทรัพย์
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setImportResult(null);
                                setFile(null);
                                const fileInput = document.getElementById('fileInput');
                                if (fileInput) fileInput.value = '';
                            }}
                            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                                importResult.successRows > 0 
                                    ? 'bg-gray-500 text-white hover:bg-gray-600' 
                                    : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                        >
                            {importResult.successRows > 0 ? 'นำเข้าไฟล์ใหม่' : 'ลองใหม่อีกครั้ง'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportAsset;
