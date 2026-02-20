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
import { checkmarkCircleOutline, closeCircleOutline, documentOutline, homeOutline, closeOutline, imageOutline } from 'ionicons/icons';
import api, { adminApi } from '../../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface PendingSeller {
  id: string;
  name: string;
  email: string;
  phone: string;
  school: string;
  idDocument: string;
  proofOfAddress: string;
  submittedAt: string;
  status: 'pending' | 'verified' | 'rejected';
}

const SellerVerificationTab: React.FC = () => {
  const [pendingSellers, setPendingSellers] = useState<PendingSeller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<PendingSeller | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docImages, setDocImages] = useState<{ id: string | null; proof: string | null }>({ id: null, proof: null });
  const [loadingDocs, setLoadingDocs] = useState(false);

  useEffect(() => {
    loadPendingSellers();
  }, []);

  const loadPendingSellers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getPendingSellers();
      const data = response.data;
      setPendingSellers(data.map((seller: any) => {
        const buildUrl = (path: string | null) => {
          if (!path) return '';
          if (path.startsWith('http')) return path;
          return `${API_BASE_URL}${path}`;
        };
        return {
          id: seller.id,
          name: `${seller.first_name} ${seller.last_name}`,
          email: seller.email,
          phone: seller.phone,
          school: seller.school_name,
          idDocument: buildUrl(seller.id_document_url),
          proofOfAddress: buildUrl(seller.proof_of_address_url),
          submittedAt: seller.created_at,
          status: seller.verification_status || 'pending'
        };
      }));
    } catch (err: any) {
      console.error('Error loading sellers:', err);
      setError(err.response?.data?.message || 'Failed to load pending sellers');
    } finally {
      setLoading(false);
    }
  };

  const verifySeller = async (sellerId: string) => {
    try {
      await adminApi.verifySeller(sellerId);
      setPendingSellers(prev => prev.map(seller =>
        seller.id === sellerId
          ? { ...seller, status: 'verified' as const }
          : seller
      ));
      setToastMessage('Seller verified successfully! They can now upload products.');
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
        seller.id === sellerId
          ? { ...seller, status: 'rejected' as const }
          : seller
      ));
      setToastMessage('Seller rejected. They will be notified to submit valid documents.');
      setShowToast(true);
      setShowModal(false);
    } catch (err: any) {
      setToastMessage(err.response?.data?.message || 'Failed to reject seller');
      setShowToast(true);
    }
  };

  const openSellerDetails = async (seller: PendingSeller) => {
    setSelectedSeller(seller);
    setShowModal(true);
    setDocImages({ id: null, proof: null });
    setLoadingDocs(true);

    try {
      const [idResp, proofResp] = await Promise.allSettled([
        api.get(`/auth/document/${seller.id}/id`, { responseType: 'blob' }),
        api.get(`/auth/document/${seller.id}/proof`, { responseType: 'blob' })
      ]);

      setDocImages({
        id: idResp.status === 'fulfilled' ? URL.createObjectURL(idResp.value.data) : null,
        proof: proofResp.status === 'fulfilled' ? URL.createObjectURL(proofResp.value.data) : null
      });
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setLoadingDocs(false);
    }
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
            <IonTitle>Verify Seller: {selectedSeller?.name}</IonTitle>
            <IonButton fill="clear" slot="end" onClick={() => setShowModal(false)}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {selectedSeller && (
            <div style={{ padding: '16px' }}>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={documentOutline} style={{ marginRight: '8px' }} />
                    ID Document
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {loadingDocs ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}><IonSpinner /></div>
                  ) : docImages.id ? (
                    <img
                      src={docImages.id}
                      alt="ID Document"
                      style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                      <IonIcon icon={imageOutline} style={{ fontSize: '48px', color: '#999' }} />
                      <p style={{ color: '#999' }}>No ID document uploaded</p>
                    </div>
                  )}
                </IonCardContent>
              </IonCard>

              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={homeOutline} style={{ marginRight: '8px' }} />
                    Proof of Address
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {loadingDocs ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}><IonSpinner /></div>
                  ) : docImages.proof ? (
                    <img
                      src={docImages.proof}
                      alt="Proof of Address"
                      style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                      <IonIcon icon={imageOutline} style={{ fontSize: '48px', color: '#999' }} />
                      <p style={{ color: '#999' }}>No proof of address uploaded</p>
                    </div>
                  )}
                </IonCardContent>
              </IonCard>

              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <IonButton
                  expand="block"
                  color="success"
                  onClick={() => verifySeller(selectedSeller.id)}
                >
                  <IonIcon icon={checkmarkCircleOutline} slot="start" />
                  Verify Seller
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
