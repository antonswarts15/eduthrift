import React, { useState } from 'react';
import api from '../services/api';

const fmt = (amount) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 2 }).format(amount || 0);

const fmtDate = (dt) =>
  dt ? new Date(dt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const badge = (value, colorMap, defaultColor = '#95a5a6') => {
  const color = colorMap[value?.toUpperCase()] || defaultColor;
  return (
    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: color + '22', color }}>
      {value || '—'}
    </span>
  );
};

const ORDER_STATUS_COLORS = {
  PENDING_PAYMENT: '#e67e22', PAYMENT_CONFIRMED: '#3498db', PROCESSING: '#3498db',
  SHIPPED: '#9b59b6', DELIVERED: '#27ae60', COMPLETED: '#27ae60',
  CANCELLED: '#e74c3c', REFUNDED: '#e74c3c',
};

const VERIFICATION_COLORS = { PENDING: '#e67e22', VERIFIED: '#27ae60', REJECTED: '#e74c3c' };
const USER_TYPE_COLORS = { BUYER: '#3498db', SELLER: '#9b59b6', BOTH: '#27ae60', ADMIN: '#e74c3c' };

const summaryCard = (label, value, color = '#2c3e50') => (
  <div style={{ backgroundColor: 'white', padding: '16px 20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', borderLeft: `4px solid ${color}` }}>
    <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
    <p style={{ margin: '6px 0 0 0', fontSize: '22px', fontWeight: 'bold', color }}>{value}</p>
  </div>
);

const th = { padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '2px solid #eee', whiteSpace: 'nowrap', backgroundColor: '#f8f9fa' };
const td = { padding: '10px 14px', fontSize: '13px', color: '#2c3e50', borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' };

// ── Transaction Report ───────────────────────────────────────────────────────

const TransactionReport = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (status !== 'all') params.status = status;
      const res = await api.get('/admin/reports/transactions', { params });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load transaction report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '20px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#7f8c8d', marginBottom: '4px' }}>From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#7f8c8d', marginBottom: '4px' }}>To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#7f8c8d', marginBottom: '4px' }}>Order Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }}>
            <option value="all">All Statuses</option>
            <option value="PENDING_PAYMENT">Pending Payment</option>
            <option value="PAYMENT_CONFIRMED">Payment Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
        <button onClick={load} disabled={loading}
          style={{ padding: '8px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
          {loading ? 'Loading…' : 'Run Report'}
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#ffe6e6', border: '1px solid #ff4d4d', borderRadius: '8px', padding: '14px', marginBottom: '16px', color: '#cc0000' }}>
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {summaryCard('Total Transactions', data.total_count, '#3498db')}
            {summaryCard('Total Volume', fmt(data.total_volume), '#27ae60')}
            {summaryCard('Platform Fees', fmt(data.total_fees), '#9b59b6')}
          </div>

          {/* Grid */}
          {data.transactions.length === 0 ? (
            <div style={{ backgroundColor: 'white', padding: '40px', textAlign: 'center', borderRadius: '8px', color: '#7f8c8d' }}>
              No transactions found for the selected filters.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                <thead>
                  <tr>
                    <th style={th}>Order #</th>
                    <th style={th}>Date</th>
                    <th style={th}>Buyer</th>
                    <th style={th}>Seller</th>
                    <th style={th}>Item</th>
                    <th style={{ ...th, textAlign: 'right' }}>Total</th>
                    <th style={{ ...th, textAlign: 'right' }}>Platform Fee</th>
                    <th style={{ ...th, textAlign: 'right' }}>Seller Payout</th>
                    <th style={th}>Payment</th>
                    <th style={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((t, i) => (
                    <tr key={t.id} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ ...td, fontWeight: 600, fontFamily: 'monospace' }}>{t.order_number}</td>
                      <td style={td}>{fmtDate(t.created_at)}</td>
                      <td style={td}>
                        <div style={{ fontWeight: 500 }}>{t.buyer_name}</div>
                        <div style={{ fontSize: '11px', color: '#7f8c8d' }}>{t.buyer_email}</div>
                      </td>
                      <td style={td}>
                        <div style={{ fontWeight: 500 }}>{t.seller_name}</div>
                        <div style={{ fontSize: '11px', color: '#7f8c8d' }}>{t.seller_email}</div>
                      </td>
                      <td style={td}>{t.item_name}</td>
                      <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{fmt(t.total_amount)}</td>
                      <td style={{ ...td, textAlign: 'right', color: '#9b59b6' }}>{fmt(t.platform_fee)}</td>
                      <td style={{ ...td, textAlign: 'right', color: '#27ae60' }}>{fmt(t.seller_payout)}</td>
                      <td style={td}>{t.payment_method || '—'}</td>
                      <td style={td}>{badge(t.order_status, ORDER_STATUS_COLORS)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!data && !loading && (
        <div style={{ backgroundColor: 'white', padding: '40px', textAlign: 'center', borderRadius: '8px', color: '#7f8c8d' }}>
          Set filters above and click <strong>Run Report</strong> to view transactions.
        </div>
      )}
    </div>
  );
};

// ── User Report ──────────────────────────────────────────────────────────────

const UserReport = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [userType, setUserType] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (userType !== 'all') params.userType = userType;
      const res = await api.get('/admin/reports/users', { params });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load user report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '20px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#7f8c8d', marginBottom: '4px' }}>Registered From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#7f8c8d', marginBottom: '4px' }}>Registered To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#7f8c8d', marginBottom: '4px' }}>User Type</label>
          <select value={userType} onChange={e => setUserType(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }}>
            <option value="all">All Types</option>
            <option value="BUYER">Buyers</option>
            <option value="SELLER">Sellers</option>
            <option value="BOTH">Both (Buyer + Seller)</option>
          </select>
        </div>
        <button onClick={load} disabled={loading}
          style={{ padding: '8px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
          {loading ? 'Loading…' : 'Run Report'}
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#ffe6e6', border: '1px solid #ff4d4d', borderRadius: '8px', padding: '14px', marginBottom: '16px', color: '#cc0000' }}>
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {summaryCard('Total Users', data.total_count, '#3498db')}
            {summaryCard('Buyers', data.buyer_count, '#3498db')}
            {summaryCard('Sellers', data.seller_count, '#9b59b6')}
            {summaryCard('Pending Verification', data.pending_verifications, '#e67e22')}
            {summaryCard('Verified Sellers', data.verified_count, '#27ae60')}
          </div>

          {/* Grid */}
          {data.users.length === 0 ? (
            <div style={{ backgroundColor: 'white', padding: '40px', textAlign: 'center', borderRadius: '8px', color: '#7f8c8d' }}>
              No users found for the selected filters.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                <thead>
                  <tr>
                    <th style={th}>Name</th>
                    <th style={th}>Email</th>
                    <th style={th}>Phone</th>
                    <th style={th}>Type</th>
                    <th style={th}>Account Status</th>
                    <th style={th}>Verification</th>
                    <th style={th}>School</th>
                    <th style={th}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((u, i) => (
                    <tr key={u.id} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ ...td, fontWeight: 500 }}>{u.first_name} {u.last_name}</td>
                      <td style={td}>{u.email}</td>
                      <td style={td}>{u.phone || '—'}</td>
                      <td style={td}>{badge(u.user_type?.toUpperCase(), USER_TYPE_COLORS)}</td>
                      <td style={td}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                          backgroundColor: u.status === 'active' ? '#27ae6022' : '#e74c3c22',
                          color: u.status === 'active' ? '#27ae60' : '#e74c3c' }}>
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td style={td}>{badge(u.verification_status?.toUpperCase(), VERIFICATION_COLORS)}</td>
                      <td style={td}>{u.school_name || '—'}</td>
                      <td style={td}>{fmtDate(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!data && !loading && (
        <div style={{ backgroundColor: 'white', padding: '40px', textAlign: 'center', borderRadius: '8px', color: '#7f8c8d' }}>
          Set filters above and click <strong>Run Report</strong> to view users.
        </div>
      )}
    </div>
  );
};

// ── Page shell ───────────────────────────────────────────────────────────────

const ReportsPage = () => {
  const [tab, setTab] = useState('transactions');

  const tabStyle = (active) => ({
    padding: '8px 20px',
    border: 'none',
    borderBottom: active ? '3px solid #3498db' : '3px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: active ? 600 : 400,
    color: active ? '#3498db' : '#555',
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Reports</h1>
          <p style={{ margin: '4px 0 0 0', color: '#7f8c8d', fontSize: '14px' }}>Generate and export platform reports</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
        <button style={tabStyle(tab === 'transactions')} onClick={() => setTab('transactions')}>
          Transactions
        </button>
        <button style={tabStyle(tab === 'users')} onClick={() => setTab('users')}>
          Users
        </button>
      </div>

      {tab === 'transactions' && <TransactionReport />}
      {tab === 'users' && <UserReport />}
    </div>
  );
};

export default ReportsPage;
