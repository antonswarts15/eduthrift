import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonIcon,
  IonToast
} from '@ionic/react';
import { checkmarkCircleOutline, warningOutline } from 'ionicons/icons';
import { useUserStore } from '../stores/userStore'; // Import useUserStore
import DocumentUploadComponent from './DocumentUploadComponent'; // Import the new component

interface SellerVerificationProps {
  onVerificationComplete: () => void;
}

const SellerVerification: React.FC<SellerVerificationProps> = ({ onVerificationComplete }) => {
  const { userProfile, fetchUserProfile } = useUserStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  // Fetch user profile on component mount to get document paths
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Check if both documents are uploaded
  const isDocumentsUploaded = userProfile?.idDocumentPath && userProfile?.proofOfResidencePath;

  const handleUploadSuccess = async () => {
    setToastMessage('Documents uploaded successfully. Refreshing profile...');
    setToastColor('success');
    setShowToast(true);
    await fetchUserProfile(); // Re-fetch profile to update state
    onVerificationComplete(); // Notify parent to set status to pending
  };

  return (
    <div style={{ padding: '16px' }}>
      <IonCard>
        <IonCardContent>
          <h2 style={{ margin: '0 0 16px 0', textAlign: 'center' }}>Seller Verification Required</h2>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#666', textAlign: 'center' }}>
            To start selling on EduThrift, please upload the following documents for verification:
          </p>

          {!isDocumentsUploaded ? (
            <DocumentUploadComponent
              initialIdDocumentPath={userProfile?.idDocumentPath}
              initialProofOfResidencePath={userProfile?.proofOfResidencePath}
              onUploadSuccess={handleUploadSuccess}
            />
          ) : (
            <div className="ion-text-center ion-padding">
              <IonIcon icon={checkmarkCircleOutline} color="success" style={{ fontSize: '64px' }} />
              <h3>Verification Documents Submitted!</h3>
              <p>Your documents are under review. Verification typically takes 24-48 hours.</p>
              <p>You'll be able to list items once an admin approves your account.</p>
            </div>
          )}

          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <IonIcon icon={warningOutline} style={{ color: '#856404', marginRight: '8px' }} />
              <strong style={{ color: '#856404' }}>Important Notice</strong>
            </div>
            <p style={{ margin: '0', fontSize: '12px', color: '#856404' }}>
              • Your listings will be active for <strong>1 calendar month</strong> only<br/>
              • After 30 days, you'll need to relist your items<br/>
              • Verification typically takes 24-48 hours
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