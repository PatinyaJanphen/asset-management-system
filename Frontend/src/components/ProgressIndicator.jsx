import React from 'react';
import { FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';

// Progress Indicator Component
export const ProgressIndicator = ({
    current = 0,
    total = 100,
    status = 'processing', // processing, success, error
    message = '',
    showPercentage = true,
    className = ''
}) => {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    const getStatusIcon = () => {
        switch (status) {
            case 'success':
                return <FiCheck className="w-5 h-5 text-green-500" />;
            case 'error':
                return <FiX className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <FiAlertTriangle className="w-5 h-5 text-yellow-500" />;
            default:
                return (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                );
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'success':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500';
            case 'warning':
                return 'bg-yellow-500';
            default:
                return 'bg-blue-500';
        }
    };

    return (
        <div className={`bg-white rounded-lg p-6 shadow-sm border ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {getStatusIcon()}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">
                            {status === 'processing' && 'กำลังประมวลผล...'}
                            {status === 'success' && 'เสร็จสิ้น'}
                            {status === 'error' && 'เกิดข้อผิดพลาด'}
                            {status === 'warning' && 'มีข้อผิดพลาดบางส่วน'}
                        </h3>
                        {message && (
                            <p className="text-sm text-gray-600 mt-1">{message}</p>
                        )}
                    </div>
                </div>
                {showPercentage && (
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
                        <div className="text-sm text-gray-500">{current} / {total}</div>
                    </div>
                )}
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                    className={`h-3 rounded-full transition-all duration-300 ${getStatusColor()}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>

            {status === 'processing' && (
                <div className="text-sm text-gray-600">
                    กรุณารอสักครู่ กำลังประมวลผลข้อมูล...
                </div>
            )}
        </div>
    );
};

// Import Progress Component
export const ImportProgress = ({
    step = 1,
    totalSteps = 3,
    currentStep = 'uploading',
    progress = 0,
    message = '',
    className = ''
}) => {
    const steps = [
        { key: 'uploading', label: 'อัปโหลดไฟล์', icon: '📤' },
        { key: 'processing', label: 'ประมวลผลข้อมูล', icon: '⚙️' },
        { key: 'saving', label: 'บันทึกข้อมูล', icon: '💾' }
    ];

    return (
        <div className={`bg-white rounded-lg p-6 shadow-sm border ${className}`}>
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">ความคืบหน้าการ Import</h3>
                <p className="text-sm text-gray-600">{message}</p>
            </div>

            <div className="space-y-4">
                {steps.map((stepItem, index) => {
                    const isActive = stepItem.key === currentStep;
                    const isCompleted = index < step - 1;
                    const isPending = index >= step - 1 && !isActive;

                    return (
                        <div key={stepItem.key} className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isCompleted
                                ? 'bg-green-500 text-white'
                                : isActive
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                }`}>
                                {isCompleted ? '✓' : index + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{stepItem.icon}</span>
                                    <span className={`font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                                        }`}>
                                        {stepItem.label}
                                    </span>
                                </div>
                                {isActive && (
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// File Upload Progress Component
export const FileUploadProgress = ({
    progress = 0,
    fileName = '',
    fileSize = 0,
    status = 'uploading',
    className = ''
}) => {
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className={`bg-white rounded-lg p-4 shadow-sm border ${className}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-lg">📄</span>
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 truncate max-w-xs">
                            {fileName}
                        </div>
                        <div className="text-sm text-gray-500">
                            {formatFileSize(fileSize)}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{progress}%</div>
                    <div className="text-sm text-gray-500">
                        {status === 'uploading' && 'กำลังอัปโหลด...'}
                        {status === 'processing' && 'กำลังประมวลผล...'}
                        {status === 'success' && 'เสร็จสิ้น'}
                        {status === 'error' && 'เกิดข้อผิดพลาด'}
                    </div>
                </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-300 ${status === 'error' ? 'bg-red-500' :
                        status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressIndicator;
