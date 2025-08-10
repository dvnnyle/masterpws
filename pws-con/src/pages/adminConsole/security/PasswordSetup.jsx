import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../../../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import '../../styles/PasswordSetup.css';

const PasswordSetup = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminData, setAdminData] = useState(null);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const adminId = searchParams.get('id');

  // Password validation
  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(pwd)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(pwd)) return 'Password must contain at least one number';
    return null;
  };

  // Check if token is valid
  useEffect(() => {
    const checkToken = async () => {
      if (!token || !adminId) {
        setError('Invalid or missing setup link');
        setChecking(false);
        return;
      }

      try {
        // In a real implementation, you'd verify the token against your database
        // For now, we'll simulate token validation
        const adminRef = doc(db, 'adminUsers', adminId);
        const adminSnap = await getDoc(adminRef);
        
        if (!adminSnap.exists()) {
          setError('Admin user not found');
          setChecking(false);
          return;
        }

        const admin = adminSnap.data();
        
        // Check if admin already has a password set
        if (admin.hasPassword) {
          setError('Password has already been set for this account');
          setChecking(false);
          return;
        }

        // In production, verify the token matches what was sent
        // For demo purposes, we'll accept any token
        setAdminData({ id: adminId, ...admin });
        setTokenValid(true);
        setChecking(false);
      } catch (err) {
        console.error('Token verification error:', err);
        setError('Failed to verify setup link');
        setChecking(false);
      }
    };

    checkToken();
  }, [token, adminId]);

  const handlePasswordSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // In production, you'd hash the password before storing
      // For demo purposes, we'll just mark that password is set
      const adminRef = doc(db, 'adminUsers', adminId);
      await updateDoc(adminRef, {
        hasPassword: true,
        passwordSetAt: new Date(),
        setupToken: null // Invalidate the token
      });

      console.log('✅ Password setup successful for admin:', adminData.username);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/admin/login');
      }, 3000);
      
    } catch (err) {
      console.error('❌ Password setup error:', err);
      setError('Failed to set up password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="password-setup-container">
        <div className="password-setup-card">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Verifying setup link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="password-setup-container">
        <div className="password-setup-card error">
          <div className="error-icon">❌</div>
          <h2>Invalid Setup Link</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/admin/login')}
            className="back-button"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="password-setup-container">
        <div className="password-setup-card success">
          <div className="success-animation">
            <div className="checkmark">✓</div>
          </div>
          <h2>Password Set Successfully!</h2>
          <p>Welcome to PlayWorld Admin, {adminData?.username}</p>
          <p>Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="password-setup-container">
      <div className="password-setup-card">
        <div className="password-setup-header">
          <h1>Set Up Your Password</h1>
          <p>Complete your PlayWorld Admin account setup</p>
        </div>

        {adminData && (
          <div className="account-info">
            <h3>Account Details</h3>
            <div className="info-row">
              <span className="label">Username:</span>
              <span className="value">{adminData.username}</span>
            </div>
            <div className="info-row">
              <span className="label">Email:</span>
              <span className="value">{adminData.email}</span>
            </div>
            <div className="info-row">
              <span className="label">Role:</span>
              <span className="value admin-role">Administrator</span>
            </div>
          </div>
        )}

        <form onSubmit={handlePasswordSetup} className="password-setup-form">
          <div className="form-group">
            <label htmlFor="password">Create Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a secure password"
              disabled={loading}
              required
            />
            <div className="password-requirements">
              <small>Password must contain:</small>
              <ul>
                <li className={password.length >= 8 ? 'valid' : ''}>At least 8 characters</li>
                <li className={/(?=.*[a-z])/.test(password) ? 'valid' : ''}>One lowercase letter</li>
                <li className={/(?=.*[A-Z])/.test(password) ? 'valid' : ''}>One uppercase letter</li>
                <li className={/(?=.*\d)/.test(password) ? 'valid' : ''}>One number</li>
              </ul>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              disabled={loading}
              required
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
            className="setup-button"
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Setting up password...
              </>
            ) : (
              'Set Up Password'
            )}
          </button>
        </form>

        <div className="password-setup-footer">
          <p>Already have access? <a href="/admin/login">Sign in here</a></p>
        </div>
      </div>
    </div>
  );
};

export default PasswordSetup;
