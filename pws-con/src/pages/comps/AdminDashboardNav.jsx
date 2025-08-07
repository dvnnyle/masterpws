import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiSettings,
  FiBarChart2,
  FiGift,
  FiLogOut,
  FiUser,
  FiEdit3
} from 'react-icons/fi';

export default function AdminDashboardNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: FiBarChart2, label: 'Dashboard' },
    { path: '/user-list', icon: FiUsers, label: 'Users' },
    { path: '/new-coupon', icon: FiGift, label: 'Coupons' },
    { path: '/NewsForm', icon: FiEdit3, label: 'News' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          {/* Logo/Brand */}
          <div style={styles.brand}>
            <FiUser style={styles.brandIcon} />
            <span style={styles.brandText}>Admin Console</span>
          </div>

          {/* Navigation Items */}
          <div style={styles.navItems}>
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    ...styles.navItem,
                    ...(isActive(item.path) ? styles.navItemActive : {})
                  }}
                  className="nav-item-hover"
                >
                  <IconComponent style={styles.navIcon} />
                  <span style={styles.navLabel}>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div style={styles.rightActions}>
            <button
              onClick={() => navigate('/')}
              style={styles.actionButton}
              title="Home"
            >
              <FiHome style={styles.actionIcon} />
            </button>
            <button
              onClick={() => navigate('/Settings')}
              style={styles.actionButton}
              title="Settings"
            >
              <FiSettings style={styles.actionIcon} />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to log out?')) {
                  navigate('/');
                }
              }}
              style={styles.logoutButton}
              title="Logout"
            >
              <FiLogOut style={styles.actionIcon} />
            </button>
          </div>
        </div>
      </nav>

      {/* Custom CSS styles */}
      <style jsx>{`
        .nav-item-hover:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          transform: translateY(-1px);
        }

        .nav-item-hover {
          transition: all 0.3s ease;
        }

        .nav-item-hover:active {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .nav-container {
            padding: 0 15px !important;
          }
          
          .nav-items {
            gap: 8px !important;
          }
          
          .nav-item {
            padding: 8px 12px !important;
            font-size: 14px !important;
          }
          
          .nav-label {
            display: none !important;
          }
          
          .brand-text {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          .nav-item {
            padding: 8px !important;
            min-width: 40px !important;
          }
        }
      `}</style>
    </>
  );
}

const styles = {
  navbar: {
    position: 'static',
    width: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },

  navContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 30px',
    height: '70px',
    maxWidth: '1400px',
    margin: '0 auto'
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: 'white',
    fontWeight: '700',
    fontSize: '20px'
  },

  brandIcon: {
    fontSize: '28px',
    padding: '8px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '10px'
  },

  brandText: {
    letterSpacing: '0.5px'
  },

  navItems: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },

  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '25px',
    color: 'rgba(255, 255, 255, 0.9)',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    minWidth: 'fit-content'
  },

  navItemActive: {
    background: 'rgba(255, 255, 255, 0.25)',
    color: 'white',
    fontWeight: '600',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
  },

  navIcon: {
    fontSize: '18px'
  },

  navLabel: {
    whiteSpace: 'nowrap'
  },

  rightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },

  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    background: 'rgba(255, 255, 255, 0.15)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },

  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    background: 'rgba(231, 76, 60, 0.8)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },

  actionIcon: {
    fontSize: '18px'
  }
};
