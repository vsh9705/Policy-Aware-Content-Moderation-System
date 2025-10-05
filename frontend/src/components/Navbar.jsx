import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <div style={styles.brand}>
          <Shield size={24} style={styles.icon} />
          <span style={styles.brandText}>Content Moderation</span>
        </div>
        
        <div style={styles.rightSection}>
          <span style={styles.username}>Welcome, {user?.username}</span>
          <button onClick={logout} style={styles.logoutBtn}>
            <LogOut size={18} />
            <span style={{ marginLeft: '8px' }}>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
  icon: {
    color: '#3b82f6',
  },
  brandText: {
    color: 'white',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  username: {
    fontSize: '0.9rem',
    color: '#d1d5db',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
};

export default Navbar;