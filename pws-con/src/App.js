import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/adminConsole/admin';
import CustomerOrderList from './pages/adminConsole/CustomerOrderList';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/customer-orders/:userId" element={<CustomerOrderList />} />
      </Routes>
    </Router>
  );
}

export default App;
