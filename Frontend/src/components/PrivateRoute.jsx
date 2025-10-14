import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AppContent } from "../context/AppContext";

const PrivateRoute = () => {
    const { isLoggedin, loadingAuth } = useContext(AppContent);

    if (loadingAuth) return <div></div>;
    if (!isLoggedin) return <Navigate to="login" replace />
    return <Outlet />;
}

export default PrivateRoute