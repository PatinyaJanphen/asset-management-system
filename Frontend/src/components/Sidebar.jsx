import React, { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiHome, FiChevronUp, FiChevronsDown, FiDatabase, FiUpload, FiFileText } from "react-icons/fi";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const Sidebar = () => {
    const navigation = useNavigate();
    const { userData setUserData, setIsLoggedin  } = useContext(AppContent)
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(true);
    const [isManagementOpen, setIsManagementOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const sendVerificationOtp = async () => {
        try {
            axios.defaults.withCredentials = true

            const { data } = await axios.post('/api/auth/send-verify-otp')
            if (data.success) {
                navigation('/email-verify')
                toast.success(data.message)
            }
            else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const logout = async () => {
        try {
            axios.defaults.withCredentials = true
            const { data } = await axios.post('/api/auth/logout');

            data.success && setIsLoggedin(false)
            data.success && setUserData(false)
            navigation('/')
        } catch (error) {
            toast.error(error.message)
        }
    }



    return (
        <aside className={`bg-white text-gray-600 transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`} >
            <div className="flex justify-center pt-4 pb-2">
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md transition-colors hover:bg-gray-100" >
                    <FiMenu size={24} />
                </button>
            </div>

            <ul className="mt-4">
                <ul className="mt-4">
                    <li onClick={() => navigation('/')} className={`flex items-center gap-2 cursor-pointer px-4 py-3 hover:bg-gray-100 ${location.pathname === '/' ? 'bg-indigo-100' : ''}`}>
                        <FiHome />
                        {isOpen && <span>Dashboard</span>}
                    </li>

                    <li>
                        <div onClick={() => setIsManagementOpen(!isManagementOpen)} className={`flex items-center justify-between cursor-pointer px-4 py-3 hover:bg-gray-100 ${isSettingsOpen ? 'bg-indigo-100' : ''}`}  >
                            <div className="flex items-center gap-2">
                                <FiDatabase />
                                {isOpen && <span>Management </span>}
                            </div>
                            {isOpen && (isManagementOpen ? <FiChevronUp /> : <FiChevronsDown />)}
                        </div>

                        {isManagementOpen && isOpen && (
                            <ul className="ml-10 mt-1 space-y-1 text-sm">
                                <li onClick={() => navigation('/management/assets')} className={`cursor-pointer px-2 py-2 rounded hover:bg-gray-100 ${location.pathname === '/management/assets' ? 'bg-indigo-100' : ''}`} >
                                    Assets
                                </li>
                                {userData && (userData.role === "ADMIN" || userData.role === "ASSET_STAFF") &&
                                    <li onClick={() => navigation('/management/rooms')} className={`cursor-pointer px-2 py-2 rounded hover:bg-gray-100 ${location.pathname === '/management/rooms' ? 'bg-indigo-100' : ''}`} >
                                        Rooms
                                    </li>
                                }
                                {userData && (userData.role === "ADMIN" || userData.role === "ASSET_STAFF") &&
                                    <li onClick={() => navigation('/management/categorys')} className={`cursor-pointer px-2 py-2 rounded hover:bg-gray-100 ${location.pathname === '/management/categorys' ? 'bg-indigo-100' : ''}`} >
                                        Caregories
                                    </li>
                                }
                            </ul>
                        )}
                    </li>
                    {userData && (userData.role === "ADMIN" || userData.role === "ASSET_STAFF") &&
                        <li onClick={() => navigation('/import')} className={`flex items-center gap-2 cursor-pointer px-4 py-3 hover:bg-gray-100 ${location.pathname === '/import' ? 'bg-indigo-100' : ''}`} >
                            <FiUpload />
                            {isOpen && <span>Import File</span>}
                        </li>
                    }
                    {userData && (userData.role === "ADMIN" || userData.role === "ASSET_STAFF") &&
                        <li onClick={() => navigation('/report')} className={`flex items-center gap-2 cursor-pointer px-4 py-3 hover:bg-gray-100 ${location.pathname === '/report' ? 'bg-indigo-100' : ''}`} >
                            <FiFileText />
                            {isOpen && <span>Report</span>}
                        </li>
                    }
                </ul>
            </ul>
        </aside>
    );
};

export default Sidebar;
