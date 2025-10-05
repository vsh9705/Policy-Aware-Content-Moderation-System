import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <div style={styles.brand}>
          <div style={styles.iconWrapper}>
            <Shield size={28} style={styles.icon} />
          </div>
          <div style={styles.brandText}>
            <div style={styles.brandTitle}>Content Moderation AI</div>
            <div style={styles.brandSubtitle}>AI-Powered Policy Enforcement</div>
          </div>
        </div>
        
        <div style={styles.rightSection}>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.username || 'User'}</div>
            <div style={styles.userRole}>Administrator</div>
          </div>
          <button onClick={logout} style={styles.logoutBtn}>
            <LogOut size={18} />
            <span style={{ marginLeft: '8px' }}>Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    color: 'white',
    padding: '1rem 0',
    backdropFilter: 'blur(10px)',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: 'white',
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'white',
    lineHeight: 1.2,
  },
  brandSubtitle: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    fontWeight: '400',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  userInfo: {
    textAlign: 'right',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'white',
    lineHeight: 1.2,
  },
  userRole: {
    fontSize: '0.75rem',
    color: '#9ca3af',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
};

export default Navbar;