import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonBadge,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonToast,
  IonSpinner
} from '@ionic/react';
import { checkmarkCircleOutline, closeCircleOutline, documentOutline, homeOutline, closeOutline, imageOutline, cardOutline } from 'ionicons/icons';
import { adminApi } from '../../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface PendingSeller {
  id: string;
  name: string;
  email: string;
  phone: string;
  school: string;
  idDocument: string;
  proofOfAddress: string;
  bankConfirmation: string;
  submittedAt: string;
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
}

const buildDocUrl = (path: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};

const DocImage: React.FC<{ url: string; alt: string }> = ({ url, alt }) => {
  if (!url) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <IonIcon icon={imageOutline} style={{ fontSize: '48px', color: '#999' }} />
        <p style={{ color: '#999', margin: '8px 0 0' }}>Not uploaded</p>
      </div>
    );
  }
  const isPdf = url.toLowerCase().includes('.pdf');
  if (isPdf) {
    return (
      <div style={{ textAlign: 'center', padding: '16px' }}>
        <IonIcon icon={documentOutline} style={{ fontSize: '48px', color: '#004aad' }} />
        <p style={{ margin: '8px 0 0' }}>
          <a href={url} target="_blank" rel="noopener noreferrer">View PDF</a>
        </p>
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '4px' }}
    />
  );
};

const SellerVerificationTab: React.FC = () => {
  const [pendingSellers, setPendingSellers] = useState<PendingSeller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<PendingSeller | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPendingSellers();
  }, []);

  const loadPendingSellers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getPendingSellers();
      const data = response.data;
      setPendingSellers(data.map((seller: any) => ({
        id: seller.id,
        name: `${seller.first_name} ${seller.last_name}`,
        email: seller.email,
        phone: seller.phone,
        school: seller.school_name,
        idDocument: buildDocUrl(seller.id_document_url),
        proofOfAddress: buildDocUrl(seller.proof_of_address_url),
        bankConfirmation: buildDocUrl(seller.bank_confirmation_url),
        submittedAt: seller.created_at,
        status: seller.verification_status || 'pending'
      })));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load pending sellers');
    } finally {
      setLoading(false);
    }
  };

  const verifySeller = async (sellerId: string) => {
    try {
      await adminApi.verifySeller(sellerId);
      setPendingSellers(prev => prev.map(seller =>
        seller.id === sellerId ? { ...seller, status: 'verified' as const } : seller
      ));
      setToastMessage('Seller verified successfully! They can now list items.');
      setShowToast(true);
      setShowModal(false);
    } catch (err: any) {
      setToastMessage(err.response?.data?.message || 'Failed to verify seller');
      setShowToast(true);
    }
  };

  const rejectSeller = async (sellerId: string) => {
    try {
      await adminApi.rejectSeller(sellerId);
      setPendingSellers(prev => prev.map(seller =>
        seller.id === sellerId ? { ...seller, status: 'rejected' as const } : seller
      ));
      setToastMessage('Seller rejected. They will need to resubmit valid documents.');
      setShowToast(true);
      setShowModal(false);
    } catch (err: any) {
      setToastMessage(err.response?.data?.message || 'Failed to reject seller');
      setShowToast(true);
    }
  };

  const openSellerDetails = (seller: PendingSeller) => {
    setSelectedSeller(seller);
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'verified': return 'success';
      case 'rejected': return 'danger';
      default: return 'medium';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <IonSpinner />
        <p>Loading pending sellers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <IonCard>
        <IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--ion-color-danger)' }}>{error}</p>
          <IonButton fill="outline" onClick={loadPendingSellers}>Retry</IonButton>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <>
      <h3>Seller Verification ({pendingSellers.filter(s => s.status === 'pending').length} pending)</h3>

      {pendingSellers.map(seller => (
        <IonCard key={seller.id}>
          <IonCardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <IonCardTitle>{seller.name}</IonCardTitle>
              <IonBadge color={getStatusColor(seller.status)}>
                {seller.status.toUpperCase()}
              </IonBadge>
            </div>
          </IonCardHeader>
          <IonCardContent>
            <IonItem lines="none">
              <IonLabel>
                <p><strong>Email:</strong> {seller.email}</p>
                <p><strong>Phone:</strong> {seller.phone}</p>
                <p><strong>School:</strong> {seller.school}</p>
                <p><strong>Submitted:</strong> {formatDate(seller.submittedAt)}</p>
              </IonLabel>
            </IonItem>

            {seller.status === 'pending' && (
              <div style={{ marginTop: '12px' }}>
                <IonButton
                  expand="block"
                  fill="outline"
                  onClick={() => openSellerDetails(seller)}
                >
                  Review Documents
                </IonButton>
              </div>
            )}
          </IonCardContent>
        </IonCard>
      ))}

      {pendingSellers.length === 0 && (
        <IonCard>
          <IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
            <p>No pending seller verifications</p>
          </IonCardContent>
        </IonCard>
      )}

      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Review: {selectedSeller?.name}</IonTitle>
            <IonButton fill="clear" slot="end" onClick={() => setShowModal(false)}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {selectedSeller && (
            <div style={{ padding: '16px' }}>
              <IonCard>
                <IonCardContent>
                  <p><strong>Email:</strong> {selectedSeller.email}</p>
                  <p><strong>Phone:</strong> {selectedSeller.phone}</p>
                  <p><strong>School:</strong> {selectedSeller.school}</p>
                </IonCardContent>
              </IonCard>

              <IonCard>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IonIcon icon={documentOutline} />
                    ID / Passport Document
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <DocImage url={selectedSeller.idDocument} alt="ID Document" />
                </IonCardContent>
              </IonCard>

              <IonCard>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IonIcon icon={homeOutline} />
                    Proof of Residence
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <DocImage url={selectedSeller.proofOfAddress} alt="Proof of Address" />
                </IonCardContent>
              </IonCard>

              <IonCard>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IonIcon icon={cardOutline} />
                    Bank Confirmation Letter
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <DocImage url={selectedSeller.bankConfirmation} alt="Bank Confirmation" />
                </IonCardContent>
              </IonCard>

              {selectedSeller.status === 'pending' && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                  <IonButton
                    expand="block"
                    color="success"
                    onClick={() => verifySeller(selectedSeller.id)}
                  >
                    <IonIcon icon={checkmarkCircleOutline} slot="start" />
                    Approve Seller
                  </IonButton>
                  <IonButton
                    expand="block"
                    color="danger"
                    fill="outline"
                    onClick={() => rejectSeller(selectedSeller.id)}
                  >
                    <IonIcon icon={closeCircleOutline} slot="start" />
                    Reject
                  </IonButton>
                </div>
              )}
            </div>
          )}
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        onDidDismiss={() => setShowToast(false)}
      />
    </>
  );
};

export default SellerVerificationTab;
