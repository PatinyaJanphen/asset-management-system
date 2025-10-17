import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import Asset from "./pages/asset/Asset";
import CreateAsset from "./pages/asset/CreateAsset";
import EditAsset from "./pages/asset/EditAsset";
import Room from "./pages/room/Room";
import CreateRoom from "./pages/room/CreateRoom";
import EditRoom from "./pages/room/EditRoom";
import Setting from "./pages/Setting";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import EmailVerify from "./pages/EmailVerify";
import PageNotFound from "./components/PageNotFound";
import { ToastContainer } from "react-toastify";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Private routes with MainLayout */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />

            {/* Asset routes */}
            <Route element={<PrivateRoute allowedRoles={['ADMIN', 'ASSET_STAFF', 'OWNER']} />}>
              <Route path="/management/assets" element={<Asset />} />
            </Route>
            <Route element={<PrivateRoute allowedRoles={['ADMIN', 'ASSET_STAFF']} />}>
              <Route path="/management/asset/create" element={<CreateAsset />} />
              <Route path="/management/asset/edit/:id" element={<EditAsset />} />
            </Route>

            {/* Room routes */}
            <Route element={<PrivateRoute allowedRoles={['ADMIN', 'ASSET_STAFF']} />}>
              <Route path="/management/rooms" element={<Room />} />
              <Route path="/management/room/create" element={<CreateRoom />} />
              <Route path="/management/room/edit/:id" element={<EditRoom />} />
            </Route>

            <Route path="/setting" element={<Setting />} />
            <Route path="/setting/profile" element={<Profile />} />
            <Route path="/email-verify" element={<EmailVerify />} />
          </Route>
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  )
}

export default App;