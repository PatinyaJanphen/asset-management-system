import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { FiChevronDown, FiLogOut, FiMail, FiPhone, FiUser } from "react-icons/fi";

const Navbar = () => {
    const { userData, setUserData } = useContext(AppContent);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUserData(null);
        navigate("/login");
    };
    return (
        <nav className="w-full flex justify-between items-center py-4 px-6 bg-white shadow-md">
            <h1
                className="text-2xl font-bold cursor-pointer"
                onClick={() => navigate("/")}
            >
                Asset-ss
            </h1>

            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-2 font-semibold text-gray-800 hover:text-blue-600"
                >
                    {userData.firstname.toUpperCase()}
                    <FiChevronDown
                        className={`transition-transform ${open ? "rotate-180" : ""}`}
                    />
                </button>

                {open && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 p-3 z-50">
                        <div className="px-3 py-2 border-b border-gray-100 flex flex-col items-center">
                            <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white mb-2">
                                {userData.firstname[0].toUpperCase() + userData.lastname[0].toUpperCase()}
                            </div>
                        </div>
                        <div className="px-3 py-2 border-b border-gray-100">
                            <p className="font-semibold text-gray-800 flex items-center gap-2">
                                <FiUser /> {userData.firstname} {userData.lastname}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                <FiMail /> {userData.email}
                            </p>
                            {userData.phone && (
                                <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                    <FiPhone /> {userData.phone}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col mt-2">
                            <button
                                onClick={() => navigate("/setting/profile")}
                                className="text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                            >
                                ดูโปรไฟล์
                            </button>
                            <button
                                onClick={handleLogout}
                                className="text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
                            >
                                <FiLogOut /> ออกจากระบบ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
