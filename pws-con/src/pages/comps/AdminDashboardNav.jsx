import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiSettings,
  FiBarChart2,
  FiGift,
  FiLogOut,
  FiUser,
  FiEdit3,
  FiMenu,
  FiX
} from 'react-icons/fi';
import logo from '../../assets/pw.svg';

export default function AdminDashboardNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', icon: FiBarChart2, label: 'Dashboard' },
    { path: '/user-list', icon: FiUsers, label: 'Users' },
    { path: '/new-coupon', icon: FiGift, label: 'Coupons' },
    { path: '/news-form', icon: FiEdit3, label: 'News' }
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  return (
    <>
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          {/* Logo/Brand */}
          <div style={styles.brand}>
            <img src={logo} alt="PWS Logo" style={styles.brandIcon} className="brand-icon" />
            <span style={styles.brandText}>Admin Console</span>
          </div>

          {/* Hamburger Menu Button (Mobile Only) */}
          <button
            style={styles.hamburgerButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="hamburger-button"
          >
            {isMobileMenuOpen ? (
              <FiX style={styles.hamburgerIcon} />
            ) : (
              <FiMenu style={styles.hamburgerIcon} />
            )}
          </button>

          {/* Navigation Items (Desktop) */}
          <div style={styles.navItems} className="desktop-nav-items">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
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
              onClick={() => handleNavigation('/')}
              style={styles.actionButton}
              title="Home"
              className="desktop-action-button"
            >
              <FiHome style={styles.actionIcon} />
            </button>
            <button
              onClick={() => handleNavigation('/user-list')}
              style={styles.actionButton}
              title="Settings"
              className="desktop-action-button"
            >
              <FiSettings style={styles.actionIcon} />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to log out?')) {
                  // Clear the admin session
                  localStorage.removeItem('adminSession');
                  // Navigate to admin login page
                  navigate('/admin/login');
                }
              }}
              style={styles.logoutButton}
              title="Logout"
              className="desktop-action-button"
            >
              <FiLogOut style={styles.actionIcon} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div style={styles.mobileDropdown} className="mobile-dropdown">
            <div style={styles.mobileDropdownContent}>
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    style={{
                      ...styles.mobileNavItem,
                      ...(isActive(item.path) ? styles.mobileNavItemActive : {})
                    }}
                    className="mobile-nav-item-hover"
                  >
                    <IconComponent style={styles.mobileNavIcon} />
                    <span style={styles.mobileNavLabel}>{item.label}</span>
                  </button>
                );
              })}
              
              {/* Mobile Actions */}
              <div style={styles.mobileActionsContainer}>
                <button
                  onClick={() => handleNavigation('/')}
                  style={styles.mobileActionItem}
                  className="mobile-nav-item-hover"
                >
                  <FiHome style={styles.mobileNavIcon} />
                  <span style={styles.mobileNavLabel}>Home</span>
                </button>
                <button
                  onClick={() => handleNavigation('/user-list')}
                  style={styles.mobileActionItem}
                  className="mobile-nav-item-hover"
                >
                  <FiSettings style={styles.mobileNavIcon} />
                  <span style={styles.mobileNavLabel}>Settings</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to log out?')) {
                      localStorage.removeItem('adminSession');
                      navigate('/admin/login');
                    }
                  }}
                  style={styles.mobileLogoutItem}
                  className="mobile-nav-item-hover"
                >
                  <FiLogOut style={styles.mobileNavIcon} />
                  <span style={styles.mobileNavLabel}>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
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

        .mobile-nav-item-hover:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .mobile-nav-item-hover {
          transition: all 0.3s ease;
        }

        .hamburger-button {
          display: none !important;
        }

        .mobile-dropdown {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Tablet and small desktop styles */
        @media (max-width: 1024px) {
          .nav-container {
            padding: 0 20px !important;
            max-width: none !important;
          }
          
          .nav-items {
            gap: 10px !important;
          }
          
          .nav-item {
            padding: 8px 14px !important;
            font-size: 15px !important;
          }
        }

        /* Mobile landscape and small tablets */
        @media (max-width: 768px) {
          .hamburger-button {
            display: flex !important;
          }

          .desktop-nav-items {
            display: none !important;
          }

          .desktop-action-button {
            display: none !important;
          }

          .nav-container {
            padding: 0 20px !important;
            height: 65px !important;
            justify-content: space-between !important;
          }

          .brand {
            flex: 0 0 auto !important;
          }

          .brand-text {
            display: none !important;
          }

          .brand-icon {
            width: 48px !important;
            height: 48px !important;
            padding: 0 !important;
          }

          .right-actions {
            flex: 0 0 auto !important;
            justify-content: flex-end !important;
          }
        }

        /* Mobile portrait */
        @media (max-width: 480px) {
          .nav-container {
            padding: 0 16px !important;
            height: 60px !important;
          }

          .brand {
            min-width: 44px !important;
          }

          .brand-icon {
            width: 48px !important;
            height: 48px !important;
            padding: 0 !important;
          }
        }

        /* Very small screens */
        @media (max-width: 360px) {
          .nav-container {
            padding: 0 12px !important;
            height: 55px !important;
          }

          .brand {
            min-width: 40px !important;
          }

          .brand-icon {
            width: 44px !important;
            height: 44px !important;
            padding: 0 !important;
          }

          .hamburger-button {
            width: 44px !important;
            height: 44px !important;
          }
        }
      `}</style>
    </>
  );
}

const styles = {
  navbar: {
    position: 'relative',
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
    width: '48px',
    height: '48px',
    padding: '0',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '14px',
    objectFit: 'contain'
  },

  brandText: {
    letterSpacing: '0.5px'
  },

  navItems: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    overflow: 'hidden'
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
    minWidth: 'fit-content',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent'
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
    transition: 'all 0.3s ease',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent'
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
    transition: 'all 0.3s ease',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent'
  },

  actionIcon: {
    fontSize: '18px'
  },

  // Hamburger Menu Styles
  hamburgerButton: {
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    borderRadius: '14px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    marginLeft: 'auto',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },

  hamburgerIcon: {
    fontSize: '22px'
  },

  // Mobile Dropdown Styles
  mobileDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 999,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
  },

  mobileDropdownContent: {
    padding: '20px 15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  mobileNavItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '12px',
    color: 'rgba(255, 255, 255, 0.9)',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    textAlign: 'left',
    width: '100%',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent'
  },

  mobileNavItemActive: {
    background: 'rgba(255, 255, 255, 0.25)',
    color: 'white',
    fontWeight: '600'
  },

  mobileNavIcon: {
    fontSize: '18px',
    minWidth: '18px'
  },

  mobileNavLabel: {
    fontSize: '16px',
    fontWeight: '500'
  },

  mobileActionsContainer: {
    marginTop: '8px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  mobileActionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '12px',
    color: 'rgba(255, 255, 255, 0.8)',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    textAlign: 'left',
    width: '100%',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent'
  },

  mobileLogoutItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'rgba(231, 76, 60, 0.2)',
    border: '1px solid rgba(231, 76, 60, 0.3)',
    borderRadius: '12px',
    color: 'rgba(231, 76, 60, 1)',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    textAlign: 'left',
    width: '100%',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent'
  }
};
