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
  IonImg
} from '@ionic/react';
import { checkmarkCircleOutline, closeCircleOutline, documentOutline, homeOutline, closeOutline } from 'ionicons/icons';

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

  useEffect(() => {
    loadPendingSellers();
  }, []);

  const loadPendingSellers = async () => {
    try {
      const response = await fetch('/admin/sellers/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setPendingSellers(data.map((seller: any) => ({
          id: seller.id,
          name: `${seller.first_name} ${seller.last_name}`,
          email: seller.email,
          phone: seller.phone,
          school: seller.school_name,
          idDocument: seller.id_document_url || 'https://via.placeholder.com/400x300/cccccc/666666?text=ID+Document',
          proofOfAddress: seller.proof_of_address_url || 'https://via.placeholder.com/400x300/cccccc/666666?text=Proof+of+Address',
          submittedAt: seller.created_at,
          status: seller.verification_status
        })));
      }
    } catch (error) {
      console.error('Error loading sellers:', error);
      // Fallback to mock data
      setPendingSellers([
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+27 82 123 4567',
          school: 'Johannesburg High School',
          idDocument: 'https://via.placeholder.com/400x300/cccccc/666666?text=ID+Document',
          proofOfAddress: 'https://via.placeholder.com/400x300/cccccc/666666?text=Proof+of+Address',
          submittedAt: '2024-01-15T10:30:00Z',
          status: 'pending'
        }
      ]);
    }
  };

  const verifySeller = async (sellerId: string) => {
    try {
      const response = await fetch(`/admin/sellers/${sellerId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setPendingSellers(prev => prev.map(seller => 
          seller.id === sellerId 
            ? { ...seller, status: 'verified' as const }
            : seller
        ));
        
        setToastMessage('Seller verified successfully! They can now upload products.');
        setShowToast(true);
        setShowModal(false);
      }
    } catch (error) {
      setToastMessage('Failed to verify seller');
      setShowToast(true);
    }
  };

  const rejectSeller = async (sellerId: string) => {
    try {
      const response = await fetch(`/admin/sellers/${sellerId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setPendingSellers(prev => prev.map(seller => 
          seller.id === sellerId 
            ? { ...seller, status: 'rejected' as const }
            : seller
        ));
        
        setToastMessage('Seller rejected. They will be notified to submit valid documents.');
        setShowToast(true);
        setShowModal(false);
      }
    } catch (error) {
      setToastMessage('Failed to reject seller');
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
                  <IonImg 
                    src={selectedSeller.idDocument} 
                    alt="ID Document"
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                  />
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
                  <IonImg 
                    src={selectedSeller.proofOfAddress} 
                    alt="Proof of Address"
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                  />
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