import React from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

const UserDetailsModal = ({ user, onClose }) => {
  if (!user) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeStyle = (status) => {
    const styles = {
      active: { backgroundColor: '#d4edda', color: '#155724' },
      suspended: { backgroundColor: '#fff3cd', color: '#856404' },
      deleted: { backgroundColor: '#f8d7da', color: '#721c24' }
    };
    return styles[status] || styles.active;
  };

  const getVerificationBadgeStyle = (status) => {
    const styles = {
      verified: { backgroundColor: '#d4edda', color: '#155724' },
      pending: { backgroundColor: '#fff3cd', color: '#856404' },
      rejected: { backgroundColor: '#f8d7da', color: '#721c24' }
    };
    return styles[status] || styles.pending;
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
        maxWidth: '1200px',
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
          borderBottom: '2px solid #eee',
          backgroundColor: '#f8f9fa'
        }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
            Complete User Profile
          </h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 'bold',
              textTransform: 'capitalize',
              backgroundColor: '#e3f2fd',
              color: '#1565c0'
            }}>
              {user.user_type}
            </span>
            <span style={{
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 'bold',
              textTransform: 'capitalize',
              ...getStatusBadgeStyle(user.status)
            }}>
              {user.status}
            </span>
            {(user.user_type === 'seller' || user.user_type === 'both') && (
              <span style={{
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 'bold',
                textTransform: 'capitalize',
                ...getVerificationBadgeStyle(user.verification_status)
              }}>
                Verification: {user.verification_status}
              </span>
            )}
          </div>
        </div>

        <div style={{ padding: '30px' }}>
          {/* Personal Information */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', color: '#2c3e50', marginBottom: '15px', borderBottom: '3px solid #3498db', paddingBottom: '8px' }}>
              Personal Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', color: '#666', fontSize: '14px' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#7f8c8d', marginBottom: '4px' }}>Full Name</div>
                <div style={{ fontSize: '16px', color: '#2c3e50' }}>{user.first_name} {user.last_name}</div>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#7f8c8d', marginBottom: '4px' }}>Email Address</div>
                <div style={{ fontSize: '16px', color: '#2c3e50' }}>{user.email}</div>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#7f8c8d', marginBottom: '4px' }}>Phone Number</div>
                <div style={{ fontSize: '16px', color: '#2c3e50' }}>{user.phone || 'Not provided'}</div>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#7f8c8d', marginBottom: '4px' }}>ID Number</div>
                {user.id_number ? (
                  <div style={{
                    fontSize: '16px',
                    color: '#2c3e50',
                    backgroundColor: '#fff3cd',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    display: 'inline-block'
                  }}>
                    {user.id_number}
                  </div>
                ) : (
                  <div style={{ fontSize: '16px', color: '#95a5a6' }}>Not provided</div>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#7f8c8d', marginBottom: '4px' }}>School/Institution</div>
                <div style={{ fontSize: '16px', color: '#2c3e50' }}>{user.school_name || 'Not provided'}</div>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#7f8c8d', marginBottom: '4px' }}>Registration Date</div>
                <div style={{ fontSize: '16px', color: '#2c3e50' }}>{formatDate(user.created_at)}</div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', color: '#2c3e50', marginBottom: '15px', borderBottom: '3px solid #3498db', paddingBottom: '8px' }}>
              Address Information
            </h3>
            <div style={{ color: '#666', fontSize: '14px' }}>
              {user.street_address && (
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontWeight: 'bold', color: '#7f8c8d', marginBottom: '4px' }}>Street Address</div>
                  <div style={{ fontSize: '16px', color: '#2c3e50' }}>{user.street_address}</div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#7f8c8d', marginBottom: '4px' }}>Suburb</div>
                  <div style={{ fontSize: '16px', color: '#2c3e50' }}>{user.suburb || 'Not provided'}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#7f8c8d', marginBottom: '4px' }}>Town/City</div>
                  <div style={{ fontSize: '16px', color: '#2c3e50' }}>{user.town || 'Not provided'}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#7f8c8d', marginBottom: '4px' }}>Province</div>
                  <div style={{ fontSize: '16px', color: '#2c3e50' }}>{user.province || 'Not provided'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Banking Details - Only for sellers */}
          {(user.user_type === 'seller' || user.user_type === 'both') && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '18px', color: '#2c3e50', marginBottom: '15px', borderBottom: '3px solid #27ae60', paddingBottom: '8px' }}>
                Banking Details (For Payments)
              </h3>
              {user.bank_name || user.bank_account_number ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', color: '#666', fontSize: '14px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#7f8c8d', marginBottom: '4px' }}>Bank Name</div>
                    <div style={{ fontSize: '16px', color: '#2c3e50' }}>{user.bank_name || 'Not provided'}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#7f8c8d', marginBottom: '4px' }}>Account Type</div>
                    <div style={{ fontSize: '16px', color: '#2c3e50', textTransform: 'capitalize' }}>
                      {user.bank_account_type || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#7f8c8d', marginBottom: '4px' }}>Account Number</div>
                    {user.bank_account_number ? (
                      <div style={{
                        fontSize: '16px',
                        color: '#2c3e50',
                        backgroundColor: '#d4edda',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        display: 'inline-block'
                      }}>
                        {user.bank_account_number}
                      </div>
                    ) : (
                      <div style={{ fontSize: '16px', color: '#95a5a6' }}>Not provided</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#7f8c8d', marginBottom: '4px' }}>Branch Code</div>
                    <div style={{ fontSize: '16px', color: '#2c3e50' }}>{user.bank_branch_code || 'Not provided'}</div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', color: '#7f8c8d', textAlign: 'center' }}>
                  No banking details provided yet
                </div>
              )}
            </div>
          )}

          {/* Verification Documents */}
          {(user.id_document_url || user.proof_of_address_url) && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', color: '#2c3e50', marginBottom: '15px', borderBottom: '3px solid #9b59b6', paddingBottom: '8px' }}>
                Verification Documents
              </h3>
              <PhotoProvider>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* ID Document */}
                  <div>
                    <h4 style={{ marginBottom: '10px', color: '#34495e' }}>ID Document</h4>
                    {user.id_document_url ? (
                      <PhotoView src={`http://localhost:3001${user.id_document_url}`}>
                        <img
                          src={`http://localhost:3001${user.id_document_url}`}
                          alt="ID Document"
                          style={{
                            width: '100%',
                            height: '200px',
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
                        height: '200px',
                        borderRadius: '8px',
                        backgroundColor: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        border: '2px dashed #ddd'
                      }}>
                        No document uploaded
                      </div>
                    )}
                  </div>

                  {/* Proof of Address */}
                  <div>
                    <h4 style={{ marginBottom: '10px', color: '#34495e' }}>Proof of Address</h4>
                    {user.proof_of_address_url ? (
                      <PhotoView src={`http://localhost:3001${user.proof_of_address_url}`}>
                        <img
                          src={`http://localhost:3001${user.proof_of_address_url}`}
                          alt="Proof of Address"
                          style={{
                            width: '100%',
                            height: '200px',
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
                        height: '200px',
                        borderRadius: '8px',
                        backgroundColor: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        border: '2px dashed #ddd'
                      }}>
                        No document uploaded
                      </div>
                    )}
                  </div>
                </div>
              </PhotoProvider>
              <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '10px', textAlign: 'center' }}>
                Click on images to view full size
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 30px',
          borderTop: '1px solid #eee',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
