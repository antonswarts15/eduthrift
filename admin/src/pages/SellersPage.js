import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';
import DocumentModal from '../components/DocumentModal';

const SellersPage = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState(null);

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  const fetchPendingSellers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/sellers/pending');
      setSellers(response.data);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      toast.error('Failed to load pending sellers');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    const loadingToast = toast.loading('Verifying seller...');
    try {
      await api.put(`/admin/sellers/${id}/verify`, {});
      toast.dismiss(loadingToast);
      toast.success('Seller verified successfully! They can now list items.');
      setSelectedSeller(null);
      fetchPendingSellers();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error verifying seller:', error);
      toast.error('Failed to verify seller');
    }
  };

  const handleReject = async (id) => {
    const loadingToast = toast.loading('Rejecting seller...');
    try {
      await api.put(`/admin/sellers/${id}/reject`, {});
      toast.dismiss(loadingToast);
      toast.success('Seller verification rejected');
      setSelectedSeller(null);
      fetchPendingSellers();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error rejecting seller:', error);
      toast.error('Failed to reject seller');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div>
        <h1>Pending Seller Verifications</h1>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          marginTop: '20px'
        }}>
          <p>Loading pending sellers...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-right" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>Pending Seller Verifications</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>
            {sellers.length} {sellers.length === 1 ? 'seller' : 'sellers'} waiting for verification
          </p>
        </div>
        <button
          onClick={fetchPendingSellers}
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Refresh
        </button>
      </div>

      {sellers.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          padding: '60px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
          <h2 style={{ color: '#27ae60', marginBottom: '10px' }}>All caught up!</h2>
          <p style={{ color: '#7f8c8d' }}>There are no pending seller verifications at the moment.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                <th style={{ padding: '15px', borderBottom: '2px solid #eee' }}>Seller Details</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #eee' }}>Contact</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #eee' }}>Submitted</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #eee' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map(seller => (
                <tr key={seller.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {seller.first_name} {seller.last_name}
                    </div>
                    {seller.school_name && (
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        {seller.school_name}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '2px' }}>
                      {seller.email}
                    </div>
                    {seller.phone && (
                      <div style={{ fontSize: '13px', color: '#888' }}>
                        {seller.phone}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '15px', fontSize: '13px', color: '#666' }}>
                    {formatDate(seller.created_at)}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <button
                      onClick={() => setSelectedSeller(seller)}
                      style={{
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      View Documents
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSeller && (
        <DocumentModal
          seller={selectedSeller}
          onClose={() => setSelectedSeller(null)}
          onVerify={handleVerify}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default SellersPage;
