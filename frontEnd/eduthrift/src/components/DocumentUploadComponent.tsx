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
  initialIdDocumentPath?: string;
  initialProofOfResidencePath?: string;
  initialBankConfirmationPath?: string;
  onUploadSuccess?: () => void;
}

const DocumentUploadComponent: React.FC<DocumentUploadComponentProps> = ({
  initialIdDocumentPath,
  initialProofOfResidencePath,
  initialBankConfirmationPath,
  onUploadSuccess
}) => {
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [proofOfAddress, setProofOfAddress] = useState<File | null>(null);
  const [bankConfirmation, setBankConfirmation] = useState<File | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const allSelected = idDocument && proofOfAddress && bankConfirmation;

  const handleUpload = async () => {
    if (!allSelected) {
      setToastMessage('Please select all three documents before uploading');
      setShowToast(true);
      return;
    }

    try {
      setUploading(true);

      await Promise.all([
        userApi.uploadIdDocument(idDocument!),
        userApi.uploadProofOfResidence(proofOfAddress!),
        userApi.uploadBankConfirmation(bankConfirmation!),
      ]);

      setIdDocument(null);
      setProofOfAddress(null);
      setBankConfirmation(null);

      setToastMessage('Documents uploaded successfully!');
      setShowToast(true);

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error: any) {
      setToastMessage(`Upload failed: ${error.response?.data?.error || error.message}`);
      setShowToast(true);
    } finally {
      setUploading(false);
    }
  };

  const DocRow = ({
    label,
    subtitle,
    file,
    initialPath,
    onSelect,
    buttonText,
  }: {
    label: string;
    subtitle: string;
    file: File | null;
    initialPath?: string;
    onSelect: (f: File) => void;
    buttonText: string;
  }) => (
    <IonRow>
      <IonCol size="12">
        <div style={{ marginBottom: '16px' }}>
          <IonLabel>
            <h3>{label}</h3>
            <p>{subtitle}</p>
          </IonLabel>
          {initialPath && !file && (
            <div style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
              <IonIcon icon={checkmarkCircleOutline} color="success" style={{ marginRight: '8px' }} />
              <span style={{ fontSize: '13px', color: '#2d5a2d' }}>Previously uploaded</span>
            </div>
          )}
          <PhotoCapture
            onPhotoSelected={onSelect}
            photoType="DOCUMENT"
            buttonText={file ? `Change ${label}` : buttonText}
            disabled={uploading}
          />
          {file && (
            <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
              <IonIcon icon={checkmarkCircleOutline} color="success" style={{ marginRight: '8px' }} />
              <span style={{ fontSize: '14px', color: '#2d5a2d' }}>
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
              </span>
            </div>
          )}
        </div>
      </IonCol>
    </IonRow>
  );

  return (
    <IonCard>
      <IonCardHeader>
        <h2 className="ion-text-center">
          <IonIcon icon={documentTextOutline} style={{ marginRight: '8px' }} />
          Document Verification
        </h2>
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', margin: '8px 0 0 0' }}>
          All three documents are required before your application can be reviewed.
        </p>
      </IonCardHeader>
      <IonCardContent>
        <IonGrid>
          <DocRow
            label="ID Document"
            subtitle="Driver's licence, passport, or national ID"
            file={idDocument}
            initialPath={initialIdDocumentPath}
            onSelect={setIdDocument}
            buttonText="Add ID Document"
          />
          <DocRow
            label="Proof of Address"
            subtitle="Utility bill, bank statement, or lease agreement (not older than 3 months)"
            file={proofOfAddress}
            initialPath={initialProofOfResidencePath}
            onSelect={setProofOfAddress}
            buttonText="Add Proof of Address"
          />
          <DocRow
            label="Bank Account Confirmation Letter"
            subtitle="Official bank letter confirming your account details — needed to pay you"
            file={bankConfirmation}
            initialPath={initialBankConfirmationPath}
            onSelect={setBankConfirmation}
            buttonText="Add Bank Confirmation"
          />

          <IonRow>
            <IonCol size="12">
              <IonButton
                expand="full"
                onClick={handleUpload}
                disabled={!allSelected || uploading}
                color="primary"
              >
                <IonIcon icon={cloudUploadOutline} slot="start" />
                {uploading ? 'Uploading...' : 'Upload All Documents'}
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
        color={toastMessage.includes('successfully') ? 'success' : 'danger'}
      />
    </IonCard>
  );
};

export default DocumentUploadComponent;
