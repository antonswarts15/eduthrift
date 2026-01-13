import React from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

const DocumentModal = ({ seller, onClose, onVerify, onReject }) => {
  if (!seller) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '1000px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            fontSize: '20px',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{
          padding: '30px',
          borderBottom: '1px solid #eee'
        }}>
          <h2 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Seller Verification - Complete Details</h2>

          {/* Personal Information */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', color: '#34495e', marginBottom: '10px', borderBottom: '2px solid #3498db', paddingBottom: '5px' }}>
              Personal Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', color: '#666', fontSize: '14px' }}>
              <div>
                <strong>Name:</strong> {seller.first_name} {seller.last_name}
              </div>
              <div>
                <strong>Email:</strong> {seller.email}
              </div>
              <div>
                <strong>Phone:</strong> {seller.phone || 'Not provided'}
              </div>
              <div>
                <strong>ID Number:</strong> {seller.id_number ? (
                  <span style={{ backgroundColor: '#fff3cd', padding: '2px 6px', borderRadius: '3px', fontFamily: 'monospace' }}>
                    {seller.id_number}
                  </span>
                ) : 'Not provided'}
              </div>
              <div>
                <strong>School:</strong> {seller.school_name || 'Not provided'}
              </div>
              <div>
                <strong>Submitted:</strong> {formatDate(seller.created_at)}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', color: '#34495e', marginBottom: '10px', borderBottom: '2px solid #3498db', paddingBottom: '5px' }}>
              Address Information
            </h3>
            <div style={{ color: '#666', fontSize: '14px' }}>
              {seller.street_address && (
                <div style={{ marginBottom: '5px' }}>
                  <strong>Street Address:</strong> {seller.street_address}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <strong>Suburb:</strong> {seller.suburb || 'Not provided'}
                </div>
                <div>
                  <strong>Town:</strong> {seller.town || 'Not provided'}
                </div>
                <div>
                  <strong>Province:</strong> {seller.province || 'Not provided'}
                </div>
              </div>
            </div>
          </div>

          {/* Banking Details */}
          {(seller.bank_name || seller.bank_account_number) && (
            <div style={{ marginBottom: '10px' }}>
              <h3 style={{ fontSize: '16px', color: '#34495e', marginBottom: '10px', borderBottom: '2px solid #27ae60', paddingBottom: '5px' }}>
                Banking Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', color: '#666', fontSize: '14px' }}>
                <div>
                  <strong>Bank:</strong> {seller.bank_name || 'Not provided'}
                </div>
                <div>
                  <strong>Account Type:</strong> {seller.bank_account_type || 'Not provided'}
                </div>
                <div>
                  <strong>Account Number:</strong> {seller.bank_account_number ? (
                    <span style={{ backgroundColor: '#d4edda', padding: '2px 6px', borderRadius: '3px', fontFamily: 'monospace' }}>
                      {seller.bank_account_number}
                    </span>
                  ) : 'Not provided'}
                </div>
                <div>
                  <strong>Branch Code:</strong> {seller.bank_branch_code || 'Not provided'}
                </div>
              </div>
            </div>
          )}

          {/* Verification Status */}
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <strong>Verification Status:</strong>{' '}
            <span style={{
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: '#fff3cd',
              color: '#856404',
              fontWeight: 'bold'
            }}>
              {seller.verification_status}
            </span>
          </div>
        </div>

        {/* Documents */}
        <div style={{ padding: '30px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50' }}>Uploaded Documents</h3>

          <PhotoProvider>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* ID Document */}
              <div>
                <h4 style={{ marginBottom: '10px', color: '#34495e' }}>ID Document</h4>
                {seller.id_document_url ? (
                  <PhotoView src={`http://localhost:3001${seller.id_document_url}`}>
                    <img
                      src={`http://localhost:3001${seller.id_document_url}`}
                      alt="ID Document"
                      style={{
                        width: '100%',
                        height: '250px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: '2px solid #ddd'
                      }}
                    />
                  </PhotoView>
                ) : (
                  <div style={{
                    width: '100%',
                    height: '250px',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999'
                  }}>
                    No document uploaded
                  </div>
                )}
                <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                  Click to zoom
                </p>
              </div>

              {/* Proof of Address */}
              <div>
                <h4 style={{ marginBottom: '10px', color: '#34495e' }}>Proof of Address</h4>
                {seller.proof_of_address_url ? (
                  <PhotoView src={`http://localhost:3001${seller.proof_of_address_url}`}>
                    <img
                      src={`http://localhost:3001${seller.proof_of_address_url}`}
                      alt="Proof of Address"
                      style={{
                        width: '100%',
                        height: '250px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: '2px solid #ddd'
                      }}
                    />
                  </PhotoView>
                ) : (
                  <div style={{
                    width: '100%',
                    height: '250px',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999'
                  }}>
                    No document uploaded
                  </div>
                )}
                <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                  Click to zoom
                </p>
              </div>
            </div>
          </PhotoProvider>
        </div>

        {/* Action Buttons */}
        <div style={{
          padding: '20px 30px',
          borderTop: '1px solid #eee',
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to REJECT this seller? They will not be able to sell items.')) {
                onReject(seller.id);
              }
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reject
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to VERIFY this seller? They will be able to list items for sale.')) {
                onVerify(seller.id);
              }
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;
