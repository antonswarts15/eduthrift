import React, { useState } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
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
  IonIcon
} from '@ionic/react';
import { warningOutline, closeOutline } from 'ionicons/icons';

interface DisputeFormProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

const DisputeForm: React.FC<DisputeFormProps> = ({ orderId, isOpen, onClose }) => {
  const [disputeType, setDisputeType] = useState('');
  const [description, setDescription] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const submitDispute = async () => {
    if (!disputeType || !description.trim()) {
      setToastMessage('Please select dispute type and provide description');
      setShowToast(true);
      return;
    }

    try {
      const response = await fetch('/api/disputes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId,
          disputeType,
          description
        })
      });

      if (response.ok) {
        setToastMessage('Dispute submitted successfully. Our team will investigate within 24 hours.');
        setShowToast(true);
        onClose();
      } else {
        setToastMessage('Failed to submit dispute');
        setShowToast(true);
      }
    } catch (error) {
      setToastMessage('Failed to submit dispute');
      setShowToast(true);
    }
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Report Issue</IonTitle>
            <IonButton fill="clear" slot="end" onClick={onClose}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '16px' }}>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>
                  <IonIcon icon={warningOutline} style={{ marginRight: '8px' }} />
                  What's the issue?
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem>
                  <IonLabel position="stacked">Issue Type</IonLabel>
                  <IonSelect value={disputeType} onIonChange={e => setDisputeType(e.detail.value)}>
                    <IonSelectOption value="non_delivery">Item not delivered</IonSelectOption>
                    <IonSelectOption value="item_not_as_described">Item not as described</IonSelectOption>
                    <IonSelectOption value="damaged_item">Item damaged</IonSelectOption>
                    <IonSelectOption value="other">Other issue</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Description</IonLabel>
                  <IonTextarea
                    value={description}
                    onIonInput={e => setDescription(e.detail.value!)}
                    placeholder="Please describe the issue in detail..."
                    rows={4}
                  />
                </IonItem>

                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
                  <p style={{ margin: '0', fontSize: '12px', color: '#856404' }}>
                    <strong>Note:</strong> Filing a dispute will pause any automatic refund process while we investigate. 
                    Our team will review your case within 24 hours.
                  </p>
                </div>

                <IonButton 
                  expand="block" 
                  color="warning"
                  onClick={submitDispute}
                  style={{ marginTop: '16px' }}
                >
                  Submit Dispute
                </IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={4000}
        onDidDismiss={() => setShowToast(false)}
      />
    </>
  );
};

export default DisputeForm;