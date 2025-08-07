import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import AdminDashboard from './pages/adminConsole/admin';
import CustomerOrderList from './pages/adminConsole/CustomerOrderList';
import NewCoupon from './pages/adminConsole/newCoupon';
import UserList from './pages/adminConsole/UserList';
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
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/customer-orders/:userId" element={<CustomerOrderList />} />
      <Route path="/new-coupon" element={<NewCoupon />} />
      <Route path="/user-list" element={<UserList />} />
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
