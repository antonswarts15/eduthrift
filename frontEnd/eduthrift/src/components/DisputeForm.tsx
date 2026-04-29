import React, { useState } from 'react';
import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonToast,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner
} from '@ionic/react';
import { warningOutline, closeOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { ordersApi } from '../services/api';

interface DisputeFormProps {
  orderNumber: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DISPUTE_TYPES: { value: string; label: string }[] = [
  { value: 'Item not delivered', label: 'Item not delivered' },
  { value: 'Item not as described', label: 'Item not as described' },
  { value: 'Item arrived damaged', label: 'Item arrived damaged' },
  { value: 'Other issue', label: 'Other issue' },
];

const DisputeForm: React.FC<DisputeFormProps> = ({ orderNumber, isOpen, onClose, onSuccess }) => {
  const [disputeType, setDisputeType] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const reset = () => {
    setDisputeType('');
    setDescription('');
    setSubmitting(false);
    setSubmitted(false);
    setErrorMsg('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    if (!disputeType || !description.trim()) {
      setErrorMsg('Please select an issue type and describe the problem.');
      return;
    }
    setSubmitting(true);
    try {
      const reason = `${disputeType}: ${description.trim()}`;
      await ordersApi.raiseDispute(orderNumber, reason);
      setSubmitted(true);
      onSuccess();
    } catch (e: any) {
      setErrorMsg(e.response?.data?.error || 'Failed to submit dispute. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Report an Issue</IonTitle>
          <IonButton fill="clear" slot="end" onClick={handleClose}>
            <IonIcon icon={closeOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '56px', color: '#22C55E' }} />
            <h3 style={{ margin: '16px 0 8px' }}>Dispute Submitted</h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
              Our team will investigate and respond within 24 hours. Funds remain frozen until resolved.
            </p>
            <IonButton expand="block" onClick={handleClose} style={{ marginTop: '24px' }}>
              Close
            </IonButton>
          </div>
        ) : (
          <>
            <div style={{ padding: '12px 0 20px', borderBottom: '1px solid #eee', marginBottom: '16px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#856404', backgroundColor: '#fff3cd', padding: '12px', borderRadius: '8px', lineHeight: '1.6' }}>
                <strong>Note:</strong> Submitting a dispute freezes the funds in escrow while we investigate.
                Our team aims to resolve all disputes within 24 hours.
              </p>
            </div>

            <IonItem>
              <IonLabel position="stacked">Issue Type</IonLabel>
              <IonSelect
                value={disputeType}
                onIonChange={e => setDisputeType(e.detail.value)}
                placeholder="Select an issue type"
              >
                {DISPUTE_TYPES.map(t => (
                  <IonSelectOption key={t.value} value={t.value}>{t.label}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem style={{ marginTop: '12px' }}>
              <IonLabel position="stacked">Description</IonLabel>
              <IonTextarea
                value={description}
                onIonInput={e => setDescription(e.detail.value!)}
                placeholder="Please describe the issue in detail..."
                rows={5}
                maxlength={900}
              />
            </IonItem>

            <IonButton
              expand="block"
              color="warning"
              onClick={submit}
              disabled={submitting}
              style={{ marginTop: '24px' }}
            >
              {submitting ? <IonSpinner name="crescent" /> : (
                <>
                  <IonIcon icon={warningOutline} slot="start" />
                  Submit Dispute
                </>
              )}
            </IonButton>
          </>
        )}
      </IonContent>

      <IonToast
        isOpen={!!errorMsg}
        message={errorMsg}
        duration={4000}
        color="danger"
        onDidDismiss={() => setErrorMsg('')}
      />
    </IonModal>
  );
};

export default DisputeForm;
