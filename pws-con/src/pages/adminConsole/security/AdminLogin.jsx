import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import '../../styles/AdminLogin.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();

  // Check if admin is already logged in
  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
      const session = JSON.parse(adminSession);
      // Check if session is still valid (24 hours)
      const sessionAge = Date.now() - session.timestamp;
      if (sessionAge < 24 * 60 * 60 * 1000) {
        console.log('Valid admin session found, redirecting...');
        navigate('/');
        return;
      } else {
        // Session expired, remove it
        localStorage.removeItem('adminSession');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!username.trim() || !email.trim()) {
      setError('Please enter both username and email');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Attempting admin login for:', { username: username.trim(), email: email.trim() });
      
      // Query the adminUsers collection
      const adminUsersRef = collection(db, 'adminUsers');
      const snapshot = await getDocs(adminUsersRef);
      
      let adminFound = false;
      let adminData = null;

      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📋 Checking admin user:', doc.id, data);
        
        // Check if username and email match
        if (data.username === username.trim() && data.email === email.trim()) {
          adminFound = true;
          adminData = {
            id: doc.id,
            ...data
          };
          console.log('✅ Admin user found:', adminData);
        }
      });

      if (adminFound && adminData.role === 'admin') {
        // Check if admin status allows login
        const userStatus = adminData.status || 'active'; // Default to active if no status field
        
        if (userStatus !== 'active') {
          console.log('❌ Admin account not active:', userStatus);
          setError(`Account is ${userStatus}. Please contact system administrator.`);
          setLoading(false);
          return;
        }
        
        // Successful login
        console.log('🎉 Admin login successful!');
        setLoginSuccess(true);
        
        // Store admin session
        const sessionData = {
          adminId: adminData.id,
          username: adminData.username,
          email: adminData.email,
          role: adminData.role,
          status: adminData.status,
          timestamp: Date.now()
        };
        localStorage.setItem('adminSession', JSON.stringify(sessionData));
        
        // Show success message briefly then redirect
        setTimeout(() => {
          navigate('/');
        }, 1500);
        
      } else {
        console.log('❌ Invalid admin credentials');
        setError('Invalid username or email. Please check your credentials.');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loginSuccess) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card success">
          <div className="success-animation">
            <div className="checkmark">✓</div>
          </div>
          <h2>Login Successful!</h2>
          <p>Welcome back, {username}</p>
          <p>Redirecting to admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>PlayWorld Admin</h1>
          <p>Administrator Login</p>
        </div>

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>Authorized personnel only</p>
          <small>For support, contact system administrator</small>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
