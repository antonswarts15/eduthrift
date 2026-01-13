import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="logo">Eduthrift Admin</div>
        <nav>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/sellers">Verify Sellers</Link></li>
            <li><Link to="/reports">Reports</Link></li>
            <li><Link to="/admin-users">Manage Admins</Link></li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </aside>
      <main className="content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
