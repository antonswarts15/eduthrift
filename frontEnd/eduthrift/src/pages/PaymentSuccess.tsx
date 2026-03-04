import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonCard, IonCardContent, IonButton, IonIcon } from '@ionic/react';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { useCartStore } from '../stores/cartStore';

const PaymentSuccess: React.FC = () => {
  const history = useHistory();
  const { clearCart } = useCartStore();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <IonPage>
      <IonContent>
        <div style={{ padding: '16px', paddingTop: '60px', textAlign: 'center' }}>
          <IonIcon 
            icon={checkmarkCircleOutline} 
            style={{ fontSize: '100px', color: '#27AE60', marginBottom: '20px' }} 
          />
          <h2>Payment Successful!</h2>
          <IonCard>
            <IonCardContent>
              <p>Your payment has been processed successfully.</p>
              <p>You will receive a confirmation email shortly.</p>
              <IonButton expand="block" onClick={() => history.push('/orders')} style={{ marginTop: '20px' }}>
                View Orders
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

export default PaymentSuccess;
