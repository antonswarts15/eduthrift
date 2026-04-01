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
                    <h3>Platform Fee (10%) — charged to seller</h3>
                    <p>Deducted from the seller's payout. Covers TradeSafe escrow fees, payment processing, buyer protection, and platform maintenance. Buyers pay no platform fee.</p>
                  </IonLabel>
                </IonItem>

                <IonItem lines="none">
                  <IonLabel>
                    <h3>Shipping Fee — paid by buyer</h3>
                    <p>Pudo locker or CourierGuy delivery cost, calculated at checkout based on distance and service level. This goes directly to the carrier and is not part of the platform fee.</p>
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