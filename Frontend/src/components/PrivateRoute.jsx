import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AppContent } from "../context/AppContext";

const PrivateRoute = () => {
    const { isLoggedin, loadingAuth } = useContext(AppContent);

    if (loadingAuth) {
        return
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
            </div>
        </div>
    }

    if (!isLoggedin) return <Navigate to="login" replace />
    return <Outlet />;
}

export default PrivateRoute