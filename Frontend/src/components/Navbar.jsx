import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";

const Navbar = () => {
    const { userData } = useContext(AppContent);
    const navigate = useNavigate();

    return (
        <nav className="w-full flex justify-between items-center py-4 px-6 bg-white shadow-md">
            <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>Asset-ss</h1>

            {userData ? (
                <div className="relative group">
                    <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white">
                        {userData.firstname[0].toUpperCase() + userData.lastname[0].toUpperCase()}
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                >
                    Login
                </button>
            )}
        </nav>
    );
};

export default Navbar;
