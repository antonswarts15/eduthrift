import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonIcon,
  IonToast,
  IonButton
} from '@ionic/react';
import { checkmarkCircleOutline, warningOutline, storefrontOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import DocumentUploadComponent from './DocumentUploadComponent';

interface SellerVerificationProps {
  onVerificationComplete: () => void;
}

const SellerVerification: React.FC<SellerVerificationProps> = ({ onVerificationComplete }) => {
  const { userProfile, fetchUserProfile } = useUserStore();
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  // Fetch user profile on component mount to get document paths
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const isDocumentsUploaded = userProfile?.idDocumentPath
    && userProfile?.proofOfResidencePath
    && userProfile?.bankConfirmationPath;

  const handleUploadSuccess = async () => {
    setToastMessage('Documents uploaded successfully. Refreshing profile...');
    setToastColor('success');
    setShowToast(true);
    await fetchUserProfile(); // Re-fetch profile to update state
    onVerificationComplete(); // Notify parent to set status to pending
  };

  return (
    <div style={{ padding: '0' }}>
      <IonCard style={{ borderRadius: '16px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', margin: 0 }}>
        <IonCardContent style={{ padding: '28px 20px 24px' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '700', color: '#111', textAlign: 'center' }}>
            Seller Verification
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#666', textAlign: 'center', lineHeight: '1.55' }}>
            Upload the required documents to start selling on Eduthrift.
          </p>

          {!isDocumentsUploaded ? (
            <DocumentUploadComponent
              initialIdDocumentPath={userProfile?.idDocumentPath}
              initialProofOfResidencePath={userProfile?.proofOfResidencePath}
              initialBankConfirmationPath={userProfile?.bankConfirmationPath}
              onUploadSuccess={handleUploadSuccess}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
              <div style={{
                width: '68px', height: '68px', borderRadius: '50%',
                backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 20px'
              }}>
                <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '36px', color: '#22C55E' }} />
              </div>
              <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: '700', color: '#111' }}>
                Documents Submitted!
              </h3>
              <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6', margin: '0 0 4px' }}>
                Our team will review your application within 24–48 hours.
              </p>
              <p style={{ color: '#888', fontSize: '13px', margin: '0 0 24px' }}>
                You'll be able to list items once approved.
              </p>
              <IonButton
                expand="block"
                fill="outline"
                onClick={() => history.push('/buyer')}
                style={{ '--border-radius': '10px' } as any}
              >
                <IonIcon icon={storefrontOutline} slot="start" />
                Browse Listings
              </IonButton>
            </div>
          )}

          <div style={{ marginTop: '20px', padding: '14px 16px', backgroundColor: '#FFFBEB', borderRadius: '10px', border: '1px solid #FDE68A' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <IonIcon icon={warningOutline} style={{ fontSize: '16px', color: '#D97706', flexShrink: 0 }} />
              <strong style={{ color: '#92400E', fontSize: '13px' }}>Important</strong>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#92400E', lineHeight: '1.7' }}>
              • Listings are active for <strong>1 calendar month</strong> — relist after 30 days<br/>
              • Verification typically takes 24–48 hours
            </p>
          </div>
        </IonCardContent>
      </IonCard>

      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        onDidDismiss={() => setShowToast(false)}
        color={toastColor}
      />
    </div>
  );
};

export default SellerVerification;