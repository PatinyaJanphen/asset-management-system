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
import Asset from './pages/Asset';
import Room from './pages/Room';
import Category from './pages/Category';

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
            <Route path='/management/categorys' element={<Category />} />

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