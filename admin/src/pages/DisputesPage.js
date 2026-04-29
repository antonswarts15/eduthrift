import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const DisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolving, setResolving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/orders/disputes');
      setDisputes(res.data || []);
    } catch {
      setError('Failed to load disputes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resolve = async (orderNumber, resolution) => {
    setResolving(orderNumber + resolution);
    try {
      await api.post(`/admin/orders/${orderNumber}/resolve-dispute`, { resolution });
      await load();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to resolve dispute.');
    } finally {
      setResolving(null);
    }
  };

  const formatDate = (s) => s ? new Date(s).toLocaleString('en-ZA') : '—';

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>Open Disputes</h2>
        <button onClick={load} style={{ padding: '8px 16px', cursor: 'pointer' }}>Refresh</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : disputes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#666', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <p style={{ fontSize: '18px' }}>No open disputes</p>
          <p style={{ fontSize: '14px' }}>All disputes have been resolved.</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={th}>Order</th>
              <th style={th}>Item</th>
              <th style={th}>Buyer</th>
              <th style={th}>Seller</th>
              <th style={th}>Amount</th>
              <th style={th}>Raised At</th>
              <th style={th}>Reason</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {disputes.map((d) => (
              <tr key={d.orderNumber} style={{ borderBottom: '1px solid #eee' }}>
                <td style={td}><strong>{d.orderNumber}</strong></td>
                <td style={td}>{d.itemName}</td>
                <td style={td}>{d.buyerName}<br /><span style={{ color: '#888', fontSize: '12px' }}>{d.buyerEmail}</span></td>
                <td style={td}>{d.sellerName}<br /><span style={{ color: '#888', fontSize: '12px' }}>{d.sellerEmail}</span></td>
                <td style={td}>R{d.totalAmount}</td>
                <td style={td}>{formatDate(d.disputeRaisedAt)}</td>
                <td style={{ ...td, maxWidth: '260px', wordBreak: 'break-word' }}>{d.disputeReason}</td>
                <td style={td}>
                  <button
                    onClick={() => resolve(d.orderNumber, 'refund')}
                    disabled={!!resolving}
                    style={{ ...btn, backgroundColor: '#dc3545', color: '#fff', marginRight: '8px' }}
                  >
                    {resolving === d.orderNumber + 'refund' ? '...' : 'Refund Buyer'}
                  </button>
                  <button
                    onClick={() => resolve(d.orderNumber, 'release')}
                    disabled={!!resolving}
                    style={{ ...btn, backgroundColor: '#28a745', color: '#fff' }}
                  >
                    {resolving === d.orderNumber + 'release' ? '...' : 'Release to Seller'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const th = { padding: '10px 12px', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #ddd' };
const td = { padding: '10px 12px', verticalAlign: 'top' };
const btn = { padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' };

export default DisputesPage;
