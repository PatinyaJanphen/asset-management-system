import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const MainLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Content */}
            <div className="flex-1 flex flex-col">
                <Navbar />
                <main className="p-6 bg-gray-100 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
