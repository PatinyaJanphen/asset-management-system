import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import EmailVerify from './pages/EmailVerify'
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword'
import { ToastContainer } from 'react-toastify';
import Profile from './pages/Profile';
import Setting from './pages/Setting';
import { Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/MainLayout';
import Asset from './pages/asset/Asset';
import Room from './pages/room/Room';
import EditRoom from './pages/room/EditRoom';
import Category from './pages/category/Category';
import CreateRoom from './pages/room/CreateRoom';
import CreateCategory from './pages/category/CreateCategory';
import EditCategory from './pages/category/EditCategory';

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        {/* Public routes */}
        <Route path='/login' element={<Login />} />
        <Route path='/reset-password' element={<ResetPassword />} />

        {/* Private routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path='/' element={<Dashboard />} />

            <Route path='/management/assets' element={<Asset />} />

            <Route path='/management/rooms' element={<Room />} />
            <Route path='/management/room/create' element={<CreateRoom />} />
            <Route path='/management/room/edit/:id' element={<EditRoom />} />

            <Route path='/management/categorys' element={<Category />} />
            <Route path='/management/category/create' element={<CreateCategory />} />
            <Route path='/management/category/edit/:id' element={<EditCategory />} />

            <Route path='/setting' element={<Setting />} />
            <Route path='/setting/profile' element={<Profile />} />
            <Route path='/email-verify' element={<EmailVerify />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default App