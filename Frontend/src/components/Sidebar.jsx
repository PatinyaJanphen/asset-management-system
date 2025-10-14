import React, { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiHome, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const Sidebar = () => {
    const navigation = useNavigate();
    const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(AppContent)
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(true);

    const sendVerificationOtp = async () => {
        try {
            axios.defaults.withCredentials = true

            const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp')
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
            const { data } = await axios.post(backendUrl + '/api/auth/logout');

            data.success && setIsLoggedin(false)
            data.success && setUserData(false)
            navigation('/')
        } catch (error) {
            toast.error(error.message)
        }
    }



    return (
        <aside className={`bg-gray-900 text-white transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`} >
            <div className="flex justify-center pt-4 pb-2">
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors" >
                    <FiMenu size={24} />
                </button>
            </div>

            <ul className="mt-4">
                <ul className="mt-4">
                    <li onClick={() => navigation('/')} className={`flex items-center gap-2 cursor-pointer px-4 py-3 hover:bg-gray-700 ${location.pathname === '/' ? 'bg-indigo-600' : ''}`}>
                        <FiHome />
                        {isOpen && <span>Dashboard</span>}
                    </li>

                    <li onClick={() => navigation('/setting')} className={`flex items-center gap-2 cursor-pointer px-4 py-3 hover:bg-gray-700 ${location.pathname === '/setting' ? 'bg-indigo-600' : ''}`}>
                        <FiSettings />
                        {isOpen && <span>Settings</span>}
                    </li>

                    <li onClick={() => navigation('/profile')} className={`flex items-center gap-2 cursor-pointer px-4 py-3 hover:bg-gray-700 ${location.pathname === '/profile' ? 'bg-indigo-600' : ''}`} >
                        <FiUser />
                        {isOpen && <span>Profile</span>}
                    </li>

                    <li onClick={logout} className="flex items-center gap-2 cursor-pointer px-4 py-3 hover:bg-gray-700"   >
                        <FiLogOut />
                        {isOpen && <span>Logout</span>}
                    </li>
                </ul>

            </ul>
        </aside>
    );
};

export default Sidebar;
