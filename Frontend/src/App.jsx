import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import Asset from "./pages/asset/Asset";
import CreateAsset from "./pages/asset/CreateAsset";
import EditAsset from "./pages/asset/EditAsset";
import Room from "./pages/room/Room";
import CreateRoom from "./pages/room/CreateRoom";
import EditRoom from "./pages/room/EditRoom";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import EmailVerify from "./pages/EmailVerify";
import PageNotFound from "./components/PageNotFound";
import { ToastContainer } from "react-toastify";
import PrivateRoute from "./components/PrivateRoute";
import Category from "./pages/category/Category";
import CreateCategory from "./pages/category/CreateCategory";
import EditCategory from "./pages/category/CreateCategory";
import Import from "./pages/importFile/Import";
import ImportHistory from "./pages/importFile/ImportHistory";
import Report from "./pages/report/Report";
import AnnualReport from "./pages/report/AnnualReport";
import AnnualByUserReport from "./pages/report/AnnualByUserReport";
import ReportPreview from "./pages/report/ReportPreview";

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

            {/* categorys routes */}
            <Route element={<PrivateRoute allowedRoles={['ADMIN', 'ASSET_STAFF']} />}>
              <Route path="/management/categorys" element={<Category />} />
              <Route path="/management/category/create" element={<CreateCategory />} />
              <Route path="/management/category/edit/:id" element={<EditCategory />} />
            </Route>

            {/* Report routes */}
            <Route element={<PrivateRoute allowedRoles={['ADMIN', 'ASSET_STAFF']} />}>
              <Route path="/report" element={<Report />} />
              <Route path="/report/annual" element={<AnnualReport />} />
              <Route path="/report/annual-by-user" element={<AnnualByUserReport />} />
              <Route path="/report/preview" element={<ReportPreview />} />
            </Route>

            {/* Import routes */}
            <Route element={<PrivateRoute allowedRoles={['ADMIN', 'ASSET_STAFF']} />}>
              <Route path="/import" element={<Import />} />
              <Route path="/import/import-history" element={<ImportHistory />} />
            </Route>

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