import React, { useState, useEffect } from 'react';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminDashboardNav from '../comps/AdminDashboardNav';
import { 
  FiUsers, 
  FiShoppingCart, 
  FiDollarSign, 
  FiTrendingUp,
  FiCalendar,
  FiSearch,
  FiDownload,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock
} from 'react-icons/fi';
import '../styles/admin.css';


export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    capturedRevenue: 0,
    refundedRevenue: 0,
    pendingRevenue: 0,
    todayOrders: 0,
    capturedOrders: 0,
    refundedOrders: 0,
    pendingOrders: 0
  });

  // Load refunded items from localStorage (same as CustomerOrderList)
  const [refundedItems, setRefundedItems] = useState({});
  const [refundedOrders, setRefundedOrders] = useState({});

  useEffect(() => {
    // Load refunded state from localStorage on mount
    const refundedItemsLS = JSON.parse(localStorage.getItem("refundedItems") || "{}");
    const refundedOrdersLS = JSON.parse(localStorage.getItem("refundedOrders") || "{}");
    setRefundedItems(refundedItemsLS);
    setRefundedOrders(refundedOrdersLS);
  }, []);

  // Helper function to determine order status (same as CustomerOrderList)
  const getOrderStatus = (order) => {
    const isFullyRefunded = refundedOrders[order.orderReference];
    const isCaptured = order.captureStatus === 'CAPTURED';
    // Check for partial refunds
    const orderItems = order.items || order.products || [];
    let hasPartialRefunds = false;
    let totalRefundedAmount = 0;
    orderItems.forEach(item => {
      const key = `${order.orderReference}_${item.name}`;
      const refundedQty = refundedItems[key] || 0;
      if (refundedQty > 0 && refundedQty < (item.quantity || 1)) {
        hasPartialRefunds = true;
      }
      totalRefundedAmount += refundedQty * (item.price || 0);
    });
    if (isFullyRefunded) {
      return 'fully-refunded';
    }
    if (hasPartialRefunds || totalRefundedAmount > 0) {
      return 'partially-refunded';
    }
    if (isCaptured) {
      return 'captured-paid';
    }
    return 'pending-authorized';
  };

  // Helper function to get status display info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'captured-paid':
        return { label: 'Paid', emoji: '✅' };
      case 'fully-refunded':
        return { label: 'Refunded', emoji: '💰' };
      case 'partially-refunded':
        return { label: 'Refunded', emoji: '💰' };
      case 'pending-authorized':
      default:
        return { label: 'Canceled', emoji: '❌' };
    }
  };

  // Helper function to calculate refund amounts for an order
  const getRefundInfo = (order) => {
    const orderItems = order.items || order.products || [];
    let totalRefundedAmount = 0;
    orderItems.forEach(item => {
      const key = `${order.orderReference}_${item.name}`;
      const refundedQty = refundedItems[key] || 0;
      totalRefundedAmount += refundedQty * (item.price || 0);
    });
    return { totalRefundedAmount };
  };

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = [];
      const allOrders = [];
      for (const userDoc of usersSnapshot.docs) {
        const userData = { id: userDoc.id, ...userDoc.data() };
        usersData.push(userData);
        // Fetch orders for each user
        const ordersSnapshot = await getDocs(collection(db, 'users', userDoc.id, 'newOrders'));
        ordersSnapshot.docs.forEach(orderDoc => {
          const orderData = orderDoc.data();
          if (orderData.orderReference) {
            allOrders.push({
              id: orderDoc.id,
              userId: userDoc.id,
              userName: userData.name || 'Unknown',
              userEmail: userData.email || 'No email',
              ...orderData
            });
          }
        });
      }
      setOrders(allOrders);
      // Calculate enhanced stats with revenue breakdown
      const today = new Date().toDateString();
      const todayOrders = allOrders.filter(order =>
        new Date(order.createdAt?.toDate()).toDateString() === today
      );
      const totalRevenue = allOrders.reduce((sum, order) => {
        return sum + (order.totalPrice || 0);
      }, 0);
      // Count orders by status and calculate revenue breakdown
      let capturedCount = 0;
      let refundedCount = 0;
      let pendingCount = 0;
      let partiallyRefundedCount = 0;
      let capturedRevenue = 0;
      let refundedRevenue = 0;
      let pendingRevenue = 0;
      allOrders.forEach(order => {
        const status = getOrderStatus(order);
        const refundInfo = getRefundInfo(order);
        const orderTotal = order.totalPrice || 0;
        switch (status) {
          case 'captured-paid':
            capturedCount++;
            capturedRevenue += orderTotal - refundInfo.totalRefundedAmount;
            refundedRevenue += refundInfo.totalRefundedAmount;
            break;
          case 'fully-refunded':
            refundedCount++;
            refundedRevenue += orderTotal;
            break;
          case 'partially-refunded':
            partiallyRefundedCount++;
            capturedRevenue += orderTotal - refundInfo.totalRefundedAmount;
            refundedRevenue += refundInfo.totalRefundedAmount;
            break;
          case 'pending-authorized':
          default:
            pendingCount++;
            pendingRevenue += orderTotal;
            break;
        }
      });
      setStats({
        totalUsers: usersData.length,
        totalOrders: allOrders.length,
        totalRevenue: totalRevenue,
        capturedRevenue: capturedRevenue,
        refundedRevenue: refundedRevenue,
        pendingRevenue: pendingRevenue,
        todayOrders: todayOrders.length,
        capturedOrders: capturedCount,
        refundedOrders: refundedCount,
        pendingOrders: pendingCount + partiallyRefundedCount
      });
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refundedItems, refundedOrders]);

  // Filter orders based on search and date
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyerName?.toLowerCase().includes(searchTerm.toLowerCase());
    if (dateFilter === 'today') {
      const today = new Date().toDateString();
      return matchesSearch && new Date(order.createdAt?.toDate()).toDateString() === today;
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return matchesSearch && new Date(order.createdAt?.toDate()) > weekAgo;
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return matchesSearch && new Date(order.createdAt?.toDate()) > monthAgo;
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="admin-loading">
        <FiRefreshCw className="loading-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <p>Error: {error}</p>
        <button onClick={fetchData}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <AdminDashboardNav />
      <div className="admin-dashboard">
        {/* Header */}
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="admin-actions">
            <button className="refresh-btn" onClick={fetchData}>
              <FiRefreshCw />
              Refresh
            </button>
            <button className="export-btn">
              <FiDownload />
              Export Data
            </button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users">
              <FiUsers />
            </div>
            <div className="stat-content">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orders">
              <FiShoppingCart />
            </div>
            <div className="stat-content">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon revenue">
              <FiDollarSign />
            </div>
            <div className="stat-content">
              <h3>{stats.totalRevenue.toFixed(0)} NOK</h3>
              <p>Total Revenue</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#27ae60' }}>
              <FiDollarSign />
            </div>
            <div className="stat-content">
              <h3>{stats.capturedRevenue.toFixed(0)} NOK</h3>
              <p>Captured Revenue</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e74c3c' }}>
              <FiDollarSign />
            </div>
            <div className="stat-content">
              <h3>{stats.refundedRevenue.toFixed(0)} NOK</h3>
              <p>Refunded Revenue</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f39c12' }}>
              <FiDollarSign />
            </div>
            <div className="stat-content">
              <h3>{stats.pendingRevenue.toFixed(0)} NOK</h3>
              <p>Pending Revenue</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon today">
              <FiTrendingUp />
            </div>
            <div className="stat-content">
              <h3>{stats.todayOrders}</h3>
              <p>Today's Orders</p>
            </div>
          </div>
          {/* New Status Cards */}
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#27ae60' }}>
              <FiCheckCircle />
            </div>
            <div className="stat-content">
              <h3>{stats.capturedOrders}</h3>
              <p>Captured</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f39c12' }}>
              <FiClock />
            </div>
            <div className="stat-content">
              <h3>{stats.pendingOrders}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e74c3c' }}>
              <FiXCircle />
            </div>
            <div className="stat-content">
              <h3>{stats.refundedOrders}</h3>
              <p>Refunded</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filters">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search orders, users, emails, buyer names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="date-filter">
            <FiCalendar />
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Orders Table with Enhanced Info */}
        <div className="admin-table-container">
          <h2>Orders ({filteredOrders.length})</h2>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const status = getOrderStatus(order);
                  const statusInfo = getStatusInfo(status);
                  return (
                    <tr key={order.id}>
                      <td>
                        <span className="order-id">#{order.orderReference?.substring(0, 8)}</span>
                      </td>
                      <td>
                        <div className="customer-info">
                          <span className="customer-name">{order.buyerName || order.userName}</span>
                          <br />
                          <span className="customer-email">{order.userEmail}</span>
                          <br />
                          <span className="customer-phone">{order.phoneNumber || 'No phone'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="amount">{order.totalPrice?.toFixed(0)} NOK</span>
                      </td>
                      <td>
                        <div className="status">
                          <span className={`status-main ${status}`}>
                            {statusInfo.label}
                          </span>
                          <span className={`capture-status ${order.captureStatus?.toLowerCase() || 'pending'}`}>
                            {order.captureStatus || 'PENDING'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="order-dates">
                          <div className="purchase-date">
                            {order.datePurchased ? new Date(order.datePurchased).toLocaleDateString('no-NO', {
                              day: '2-digit',
                              month: '2-digit', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            }) : 'N/A'}
                          </div>
                          {order.createdAt && (
                            <div className="created-date">
                              {new Date(order.createdAt.toDate()).toLocaleDateString('no-NO', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="view-btn" 
                            title="View Customer Orders"
                            onClick={() => window.open(`/customer-orders/${order.userId}`, '_blank')}
                          >
                            <FiShoppingCart />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
