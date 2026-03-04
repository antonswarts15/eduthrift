import React from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonCard, IonCardContent, IonButton, IonIcon } from '@ionic/react';
import { closeCircleOutline } from 'ionicons/icons';

const PaymentCancel: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent>
        <div style={{ padding: '16px', paddingTop: '60px', textAlign: 'center' }}>
          <IonIcon 
            icon={closeCircleOutline} 
            style={{ fontSize: '100px', color: '#E74C3C', marginBottom: '20px' }} 
          />
          <h2>Payment Cancelled</h2>
          <IonCard>
            <IonCardContent>
              <p>Your payment was cancelled.</p>
              <p>No charges have been made to your account.</p>
              <IonButton expand="block" onClick={() => history.push('/cart')} style={{ marginTop: '20px' }}>
                Return to Cart
              </IonButton>
              <IonButton expand="block" fill="outline" onClick={() => history.push('/buyer')}>
                Continue Shopping
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PaymentCancel;
