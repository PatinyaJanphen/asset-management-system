import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiArrowLeft, FiSearch } from 'react-icons/fi';

const PageNotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="text-8xl font-bold text-gray-300">404</div>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    This Page Not Found
                </h1>

                <p className="text-gray-600 mb-8">
                    Sorry, the page you are looking for does not exist.
                </p>

                <div className="space-y-3 flex justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-transparent border border-blue-500 text-blue-500 font-medium py-3 px-4 rounded-md transition-colors hover:bg-blue-500 hover:text-white mx-auto flex items-center justify-center gap-2"
                    >
                        GO BACK HOME
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PageNotFound;
