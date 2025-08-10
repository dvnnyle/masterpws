import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import AdminDashboard from './pages/adminConsole/admin';
import CustomerOrderList from './pages/adminConsole/CustomerOrderList';
import NewCoupon from './pages/adminConsole/newCoupon';
import UserList from './pages/adminConsole/UserList';
import NewsForm from './pages/adminConsole/NewsForm';
import AdminLogin from './pages/adminConsole/security/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppRoutes() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check for redirect path from 404.html
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath && redirectPath !== '/') {
      sessionStorage.removeItem('redirectPath');
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/customer-orders/:userId" element={
        <ProtectedRoute>
          <CustomerOrderList />
        </ProtectedRoute>
      } />
      <Route path="/new-coupon" element={
        <ProtectedRoute>
          <NewCoupon />
        </ProtectedRoute>
      } />
      <Route path="/user-list" element={
        <ProtectedRoute>
          <UserList />
        </ProtectedRoute>
      } />
      <Route path="/news-form" element={
        <ProtectedRoute>
          <NewsForm />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
