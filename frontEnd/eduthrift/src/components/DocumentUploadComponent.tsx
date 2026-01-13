import React, { useState } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonToast,
  IonButton,
  IonIcon,
  IonLabel
} from '@ionic/react';
import { cloudUploadOutline, documentTextOutline, checkmarkCircleOutline } from 'ionicons/icons';
import PhotoCapture from './PhotoCapture';
import { userApi } from '../services/api';

interface DocumentUploadComponentProps {
  // Optional props to pass initial document paths if user already uploaded
  initialIdDocumentPath?: string;
  initialProofOfResidencePath?: string;
  onUploadSuccess?: () => void; // Callback after successful upload
}

const DocumentUploadComponent: React.FC<DocumentUploadComponentProps> = ({
  initialIdDocumentPath,
  initialProofOfResidencePath,
  onUploadSuccess
}) => {
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [proofOfAddress, setProofOfAddress] = useState<File | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!idDocument && !proofOfAddress) {
      setToastMessage('Please select at least one document to upload');
      setShowToast(true);
      return;
    }

    try {
      setUploading(true);
      
      const uploadPromises = [];
      if (idDocument) {
        uploadPromises.push(userApi.uploadIdDocument(idDocument));
      }
      if (proofOfAddress) {
        uploadPromises.push(userApi.uploadProofOfResidence(proofOfAddress));
      }

      await Promise.all(uploadPromises);
      
      setToastMessage('Documents uploaded and compressed successfully!');
      setShowToast(true);
      
      // Clear selections
      setIdDocument(null);
      setProofOfAddress(null);
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setToastMessage(`Upload failed: ${error.response?.data?.error || error.message}`);
      setShowToast(true);
    } finally {
      setUploading(false);
    }
  };

  return (
    <IonCard>
      <IonCardHeader>
        <h2 className="ion-text-center">
          <IonIcon icon={documentTextOutline} style={{ marginRight: '8px' }} />
          Document Verification
        </h2>
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', margin: '8px 0 0 0' }}>
          Upload clear photos of your documents. Images will be automatically optimized.
        </p>
      </IonCardHeader>
      <IonCardContent>
        <IonGrid>
          {/* ID Document */}
          <IonRow>
            <IonCol size="12">
              <div style={{ marginBottom: '16px' }}>
                <IonLabel>
                  <h3>ID Document</h3>
                  <p>Driver's license, passport, or national ID</p>
                </IonLabel>
                <PhotoCapture
                  onPhotoSelected={setIdDocument}
                  photoType="DOCUMENT"
                  buttonText={idDocument ? 'Change ID Document' : 'Add ID Document'}
                  disabled={uploading}
                />
                {idDocument && (
                  <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
                    <IonIcon icon={checkmarkCircleOutline} color="success" style={{ marginRight: '8px' }} />
                    <span style={{ fontSize: '14px', color: '#2d5a2d' }}>
                      {idDocument.name} ({(idDocument.size / 1024 / 1024).toFixed(2)}MB)
                    </span>
                  </div>
                )}
              </div>
            </IonCol>
          </IonRow>

          {/* Proof of Address */}
          <IonRow>
            <IonCol size="12">
              <div style={{ marginBottom: '16px' }}>
                <IonLabel>
                  <h3>Proof of Address</h3>
                  <p>Utility bill, bank statement, or lease agreement</p>
                </IonLabel>
                <PhotoCapture
                  onPhotoSelected={setProofOfAddress}
                  photoType="DOCUMENT"
                  buttonText={proofOfAddress ? 'Change Proof of Address' : 'Add Proof of Address'}
                  disabled={uploading}
                />
                {proofOfAddress && (
                  <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
                    <IonIcon icon={checkmarkCircleOutline} color="success" style={{ marginRight: '8px' }} />
                    <span style={{ fontSize: '14px', color: '#2d5a2d' }}>
                      {proofOfAddress.name} ({(proofOfAddress.size / 1024 / 1024).toFixed(2)}MB)
                    </span>
                  </div>
                )}
              </div>
            </IonCol>
          </IonRow>

          {/* Upload Button */}
          <IonRow>
            <IonCol size="12">
              <IonButton 
                expand="full" 
                onClick={handleUpload} 
                disabled={(!idDocument && !proofOfAddress) || uploading}
                color="primary"
              >
                <IonIcon icon={cloudUploadOutline} slot="start" />
                {uploading ? 'Uploading & Compressing...' : 'Upload Documents'}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonCardContent>
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color={toastMessage.includes('success') ? 'success' : 'danger'}
      />
    </IonCard>
  );
};

export default DocumentUploadComponent;