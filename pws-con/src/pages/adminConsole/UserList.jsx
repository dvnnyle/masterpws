import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { 
  FiUsers, 
  FiTrash2, 
  FiEye, 
  FiShoppingCart,
  FiMail,
  FiPhone,
  FiUser,
  FiRefreshCw
} from 'react-icons/fi';
import AdminDashboardNav from '../comps/AdminDashboardNav';
import "../styles/UserList.css";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all users and their orders from Firestore
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch users
        const usersCol = collection(db, "users");
        const userSnapshot = await getDocs(usersCol);
        const userList = userSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);

        // Fetch newOrders subcollection for each user
        const ordersByUser = {};
        for (const user of userList) {
          const ordersColRef = collection(db, "users", user.id, "newOrders");
          const ordersSnapshot = await getDocs(ordersColRef);
          ordersByUser[user.id] = ordersSnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter(order => order.orderReference); // Only include orders with reference
        }
        setOrders(ordersByUser);
      } catch (err) {
        setError("Could not fetch users or orders: " + err.message);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Delete user
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter(u => u.id !== userId));
      
      // Remove user's orders from state
      const newOrders = { ...orders };
      delete newOrders[userId];
      setOrders(newOrders);
    } catch (err) {
      alert("Could not delete user: " + err.message);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total orders and revenue
  const totalUsers = users.length;
  const totalOrders = Object.values(orders).flat().length;
  const totalRevenue = Object.values(orders).flat().reduce((sum, order) => 
    sum + (order.totalPrice || 0), 0
  );

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-container">
          <FiRefreshCw className="loading-spinner" />
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error-container">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminDashboardNav />
      <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">User Management</h1>
          <p className="admin-subtitle">Manage all users and their orders</p>
        </div>
        <div className="admin-stats">
          <div className="stat-item">
            <FiUsers />
            <span>{totalUsers} Users</span>
          </div>
          <div className="stat-item">
            <FiShoppingCart />
            <span>{totalOrders} Orders</span>
          </div>
          <div className="stat-item">
            <span>{totalRevenue.toFixed(0)} NOK Revenue</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-box">
          <FiUser />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <div className="table-header">
          <h2>Users ({filteredUsers.length})</h2>
        </div>
        
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>
                  <div className="th-content">
                    <FiUser />
                    <span>Name</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <FiMail />
                    <span>Email</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <FiPhone />
                    <span>Phone</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <FiShoppingCart />
                    <span>Orders</span>
                  </div>
                </th>
                <th>Total Spent</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                const userOrders = orders[user.id] || [];
                const validOrders = userOrders.filter(order => order && Object.keys(order).length > 1);
                const totalSpent = validOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
                
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          <FiUser />
                        </div>
                        <span className="user-name">{user.name || "No name"}</span>
                      </div>
                    </td>
                    <td>
                      <span className="user-email">{user.email || "No email"}</span>
                    </td>
                    <td>
                      <span className="user-phone">{user.phone || "No phone"}</span>
                    </td>
                    <td>
                      {validOrders.length > 0 ? (
                        <Link
                          to={`/customer-orders/${user.id}`}
                          className="orders-link"
                        >
                          <FiShoppingCart />
                          <span>{validOrders.length} orders</span>
                        </Link>
                      ) : (
                        <span className="no-orders">No orders</span>
                      )}
                    </td>
                    <td>
                      <span className="total-spent">
                        {totalSpent > 0 ? `${totalSpent.toFixed(0)} NOK` : "0 NOK"}
                      </span>
                    </td>
                    <td>
                      <span className="join-date">
                        {user.createdAt 
                          ? new Date(user.createdAt.toDate()).toLocaleDateString('no-NO')
                          : "Unknown"
                        }
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/customer-orders/${user.id}`}
                          className="view-btn"
                          title="View Orders"
                        >
                          <FiEye />
                        </Link>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(user.id)}
                          title="Delete User"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && searchTerm && (
          <div className="no-results">
            <p>No users found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
