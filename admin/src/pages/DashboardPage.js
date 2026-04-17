import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);

  const formatNumber = (num) =>
    new Intl.NumberFormat('en-ZA').format(num || 0);

  const card = ({ label, value, sub, color = '#3498db', onClick, alert = false }) => (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: alert ? `0 2px 8px ${color}55` : '0 2px 4px rgba(0,0,0,0.1)',
        border: alert ? `2px solid ${color}` : '1px solid transparent',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.boxShadow = `0 4px 12px rgba(0,0,0,0.15)`; }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.boxShadow = alert ? `0 2px 8px ${color}55` : '0 2px 4px rgba(0,0,0,0.1)'; }}
    >
      <h3 style={{ margin: '0 0 8px 0', color: '#555', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
        {onClick && <span style={{ marginLeft: '6px', fontSize: '11px', color: '#aaa' }}>↗</span>}
      </h3>
      <p style={{ fontSize: '32px', fontWeight: 'bold', color, margin: 0 }}>{value}</p>
      {sub && <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px', marginBottom: 0 }}>{sub}</p>}
    </div>
  );

  const sectionHeader = (title, description) => (
    <div style={{ margin: '32px 0 12px 0' }}>
      <h2 style={{ margin: 0, fontSize: '16px', color: '#2c3e50' }}>{title}</h2>
      {description && <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#7f8c8d' }}>{description}</p>}
    </div>
  );

  if (loading) {
    return (
      <div>
        <h1>Dashboard</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '20px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ height: '12px', backgroundColor: '#ecf0f1', borderRadius: '4px', marginBottom: '12px', width: '60%' }} />
              <div style={{ height: '32px', backgroundColor: '#ecf0f1', borderRadius: '4px', width: '40%' }} />
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
          <button onClick={fetchStats} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const failedPayouts = stats?.failedPayouts || 0;
  const manualPayouts = stats?.manualPayoutsRequired || 0;
  const hasPayoutAlerts = failedPayouts > 0 || manualPayouts > 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0' }}>Dashboard</h1>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>Eduthrift platform overview</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={fetchStats}
            style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginBottom: '4px' }}
          >
            Refresh
          </button>
          {lastUpdated && (
            <p style={{ fontSize: '11px', color: '#7f8c8d', margin: 0 }}>
              Updated {lastUpdated.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>

      {/* Payout alerts banner */}
      {hasPayoutAlerts && (
        <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '14px 18px', marginTop: '20px', display: 'flex', gap: '24px', alignItems: 'center' }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <strong style={{ color: '#856404' }}>Payout action required</strong>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#856404' }}>
              {failedPayouts > 0 && `${failedPayouts} failed payout${failedPayouts > 1 ? 's' : ''} need attention. `}
              {manualPayouts > 0 && `${manualPayouts} Ozow order${manualPayouts > 1 ? 's' : ''} require manual EFT to sellers.`}
            </p>
          </div>
        </div>
      )}

      {/* Users */}
      {sectionHeader('Users', 'Platform registrations and verification queue')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {card({
          label: 'Total Users',
          value: formatNumber(stats?.totalUsers),
          sub: `${formatNumber(stats?.activeUsers)} active`,
          color: '#3498db',
          onClick: () => navigate('/admin-users'),
        })}
        {card({
          label: 'Pending Verifications',
          value: formatNumber(stats?.pendingVerifications),
          sub: 'Sellers awaiting approval',
          color: stats?.pendingVerifications > 0 ? '#e67e22' : '#27ae60',
          onClick: () => navigate('/sellers'),
          alert: stats?.pendingVerifications > 0,
        })}
      </div>

      {/* Financial */}
      {sectionHeader('Financial', 'Sourced from the double-entry ledger — append-only, audit-grade')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {card({
          label: 'Gross Merchandise Value',
          value: formatCurrency(stats?.totalGmv),
          sub: `${formatNumber(stats?.completedOrders)} completed orders`,
          color: '#27ae60',
        })}
        {card({
          label: 'Platform Revenue (lifetime)',
          value: formatCurrency(stats?.platformRevenue),
          sub: `${formatCurrency(stats?.revenueThisMonth)} this month`,
          color: '#9b59b6',
        })}
        {card({
          label: 'Escrow Balance',
          value: formatCurrency(stats?.escrowBalance),
          sub: 'Funds currently held for buyers',
          color: '#2980b9',
        })}
        {card({
          label: 'Outstanding Seller Payouts',
          value: formatCurrency(stats?.outstandingSellerPayouts),
          sub: 'Accrued but not yet transferred',
          color: stats?.outstandingSellerPayouts > 0 ? '#e67e22' : '#27ae60',
          alert: stats?.outstandingSellerPayouts > 0,
        })}
      </div>

      {/* Payout Safety */}
      {sectionHeader('Payout Safety', 'Orders requiring intervention')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {card({
          label: 'Failed Payouts',
          value: formatNumber(failedPayouts),
          sub: failedPayouts > 0 ? 'Retry logic will reattempt automatically' : 'All payouts healthy',
          color: failedPayouts > 0 ? '#e74c3c' : '#27ae60',
          alert: failedPayouts > 0,
        })}
        {card({
          label: 'Manual EFT Required',
          value: formatNumber(manualPayouts),
          sub: manualPayouts > 0 ? 'Ozow orders — manually EFT sellers' : 'Nothing pending',
          color: manualPayouts > 0 ? '#e67e22' : '#27ae60',
          alert: manualPayouts > 0,
        })}
        {card({
          label: 'Total Orders',
          value: formatNumber(stats?.totalOrders),
          sub: `${formatNumber(stats?.completedOrders)} completed`,
          color: '#34495e',
        })}
      </div>
    </div>
  );
};

export default DashboardPage;
