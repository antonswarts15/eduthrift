import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError(err.response?.data?.error || 'Failed to load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-ZA').format(num);
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p>Welcome to the Eduthrift Admin Console.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ height: '20px', backgroundColor: '#ecf0f1', borderRadius: '4px', marginBottom: '10px', width: '60%' }}></div>
              <div style={{ height: '32px', backgroundColor: '#ecf0f1', borderRadius: '4px', width: '40%' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Dashboard</h1>
        <div style={{ backgroundColor: '#ffe6e6', border: '1px solid #ff4d4d', borderRadius: '8px', padding: '20px', marginTop: '20px' }}>
          <p style={{ color: '#cc0000', margin: '0 0 10px 0' }}>{error}</p>
          <button
            onClick={fetchStats}
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to the Eduthrift Admin Console.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={fetchStats}
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '5px'
            }}
          >
            Refresh
          </button>
          {lastUpdated && (
            <p style={{ fontSize: '12px', color: '#7f8c8d', margin: 0 }}>
              Last updated: {formatTime(lastUpdated)}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#e67e22' }}>Pending Verifications</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#e67e22', margin: 0 }}>
            {formatNumber(stats?.pendingVerifications || 0)}
          </p>
          <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>Sellers awaiting approval</p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#3498db' }}>Total Users</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3498db', margin: 0 }}>
            {formatNumber(stats?.totalUsers || 0)}
          </p>
          <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
            {formatNumber(stats?.activeUsers || 0)} active
          </p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#27ae60' }}>Total Sales</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#27ae60', margin: 0 }}>
            {formatCurrency(stats?.totalSales || 0)}
          </p>
          <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
            {formatNumber(stats?.totalOrders || 0)} orders
          </p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#9b59b6' }}>Platform Fees</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#9b59b6', margin: 0 }}>
            {formatCurrency(stats?.platformFees || 0)}
          </p>
          <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
            {formatNumber(stats?.recentTransactions || 0)} in last 30 days
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
