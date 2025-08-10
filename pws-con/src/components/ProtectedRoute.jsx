import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      console.log('🔐 Checking authentication...');
      
      const adminSession = localStorage.getItem('adminSession');
      
      if (!adminSession) {
        console.log('❌ No admin session found, redirecting to login');
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate('/admin/login', { replace: true });
        return;
      }

      try {
        const session = JSON.parse(adminSession);
        
        // Check if session has required fields
        if (!session.adminId || !session.username || !session.email || !session.role) {
          console.log('❌ Invalid session data, redirecting to login');
          localStorage.removeItem('adminSession');
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate('/admin/login', { replace: true });
          return;
        }

        // Check if user status is active
        const userStatus = session.status || 'active'; // Default to active for backward compatibility
        if (userStatus !== 'active') {
          console.log('❌ Admin account not active:', userStatus);
          localStorage.removeItem('adminSession');
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate('/admin/login', { replace: true });
          return;
        }

        // Check if session is expired (24 hours)
        const sessionAge = Date.now() - session.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (sessionAge >= maxAge) {
          console.log('❌ Session expired, redirecting to login');
          localStorage.removeItem('adminSession');
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate('/admin/login', { replace: true });
          return;
        }

        // Check if user has admin role
        if (session.role !== 'admin') {
          console.log('❌ User does not have admin role, redirecting to login');
          localStorage.removeItem('adminSession');
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate('/admin/login', { replace: true });
          return;
        }

        console.log('✅ Valid admin session found:', session.username);
        setIsAuthenticated(true);
        setIsLoading(false);

      } catch (error) {
        console.error('❌ Error parsing admin session:', error);
        localStorage.removeItem('adminSession');
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate('/admin/login', { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        fontFamily: 'Poppins, sans-serif',
        backgroundColor: '#f5f7fa'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #010f3c',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '15px'
        }}></div>
        <p style={{ color: '#010f3c', fontSize: '16px', margin: 0 }}>
          Verifying authentication...
        </p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
