import React, { useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel
} from '@ionic/react';
import { informationCircleOutline, closeOutline } from 'ionicons/icons';

const FeeStructureInfo: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <IonButton 
        fill="clear" 
        size="small" 
        onClick={() => setShowModal(true)}
        style={{ fontSize: '12px', height: '24px' }}
      >
        <IonIcon icon={informationCircleOutline} slot="start" />
        Fee Info
      </IonButton>

      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Fee Structure</IonTitle>
            <IonButton fill="clear" slot="end" onClick={() => setShowModal(false)}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '16px' }}>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Transparent Pricing</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem lines="none">
                  <IonLabel>
                    <h3>Service Fee (10%)</h3>
                    <p>Covers secure payments, buyer protection, escrow services, and platform maintenance</p>
                  </IonLabel>
                </IonItem>
                
                <IonItem lines="none">
                  <IonLabel>
                    <h3>Shipping Fee</h3>
                    <p>Pudo/CourierGuy delivery costs - varies by distance and service level</p>
                  </IonLabel>
                </IonItem>
                
                <IonItem lines="none">
                  <IonLabel>
                    <h3>Payment Processing</h3>
                    <p>Paystack fees (2.9% + R2) are included in our service fee - no extra charges</p>
                  </IonLabel>
                </IonItem>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>What You Get</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem lines="none">
                  <IonLabel>
                    <p>✓ Secure escrow protection</p>
                    <p>✓ Buyer guarantee - money back if item not as described</p>
                    <p>✓ Dispute resolution service</p>
                    <p>✓ Tracking and delivery confirmation</p>
                    <p>✓ Customer support</p>
                  </IonLabel>
                </IonItem>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
      </IonModal>
    </>
  );
};

export default FeeStructureInfo;