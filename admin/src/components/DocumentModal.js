import React from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const buildDocUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};

const DocViewer = ({ url, label }) => {
  if (!url) {
    return (
      <div style={{
        width: '100%',
        height: '250px',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999',
        border: '2px dashed #ddd'
      }}>
        Not uploaded
      </div>
    );
  }

  if (url.toLowerCase().endsWith('.pdf')) {
    return (
      <div style={{
        width: '100%',
        height: '250px',
        borderRadius: '8px',
        backgroundColor: '#f0f4ff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #c5d3f0'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#2980b9', fontWeight: 'bold', fontSize: '14px' }}
        >
          View PDF — {label}
        </a>
      </div>
    );
  }

  return (
    <PhotoView src={url}>
      <img
        src={url}
        alt={label}
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
  );
};

const DocumentModal = ({ seller, onClose, onVerify, onReject }) => {
  const idDocUrl = buildDocUrl(seller?.id_document_url);
  const proofDocUrl = buildDocUrl(seller?.proof_of_address_url);
  const bankDocUrl = buildDocUrl(seller?.bank_confirmation_url);

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
        maxWidth: '1100px',
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
        <div style={{ padding: '30px', borderBottom: '1px solid #eee' }}>
          <h2 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Seller Verification — Complete Details</h2>

          {/* Personal Information */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', color: '#34495e', marginBottom: '10px', borderBottom: '2px solid #3498db', paddingBottom: '5px' }}>
              Personal Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', color: '#666', fontSize: '14px' }}>
              <div><strong>Name:</strong> {seller.first_name} {seller.last_name}</div>
              <div><strong>Email:</strong> {seller.email}</div>
              <div><strong>Phone:</strong> {seller.phone || 'Not provided'}</div>
              <div>
                <strong>ID Number:</strong>{' '}
                {seller.id_number ? (
                  <span style={{ backgroundColor: '#fff3cd', padding: '2px 6px', borderRadius: '3px', fontFamily: 'monospace' }}>
                    {seller.id_number}
                  </span>
                ) : 'Not provided'}
              </div>
              <div><strong>School:</strong> {seller.school_name || 'Not provided'}</div>
              <div><strong>Submitted:</strong> {formatDate(seller.created_at)}</div>
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
                <div><strong>Suburb:</strong> {seller.suburb || 'Not provided'}</div>
                <div><strong>Town:</strong> {seller.town || 'Not provided'}</div>
                <div><strong>Province:</strong> {seller.province || 'Not provided'}</div>
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
                <div><strong>Bank:</strong> {seller.bank_name || 'Not provided'}</div>
                <div><strong>Account Type:</strong> {seller.bank_account_type || 'Not provided'}</div>
                <div>
                  <strong>Account Number:</strong>{' '}
                  {seller.bank_account_number ? (
                    <span style={{ backgroundColor: '#d4edda', padding: '2px 6px', borderRadius: '3px', fontFamily: 'monospace' }}>
                      {seller.bank_account_number}
                    </span>
                  ) : 'Not provided'}
                </div>
                <div><strong>Branch Code:</strong> {seller.bank_branch_code || 'Not provided'}</div>
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

        {/* Documents — 3 columns */}
        <div style={{ padding: '30px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50' }}>Uploaded Documents</h3>

          <PhotoProvider>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div>
                <h4 style={{ marginBottom: '10px', color: '#34495e' }}>ID Document</h4>
                <DocViewer url={idDocUrl} label="ID Document" />
                <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                  {idDocUrl && !idDocUrl.toLowerCase().endsWith('.pdf') ? 'Click to zoom' : ' '}
                </p>
              </div>

              <div>
                <h4 style={{ marginBottom: '10px', color: '#34495e' }}>Proof of Address</h4>
                <DocViewer url={proofDocUrl} label="Proof of Address" />
                <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                  {proofDocUrl && !proofDocUrl.toLowerCase().endsWith('.pdf') ? 'Click to zoom' : ' '}
                </p>
              </div>

              <div>
                <h4 style={{ marginBottom: '10px', color: '#34495e' }}>Bank Confirmation Letter</h4>
                <DocViewer url={bankDocUrl} label="Bank Confirmation" />
                <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                  {bankDocUrl && !bankDocUrl.toLowerCase().endsWith('.pdf') ? 'Click to zoom' : ' '}
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
