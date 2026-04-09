import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonCard, IonCardContent, IonButton, IonIcon } from '@ionic/react';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { useCartStore } from '../stores/cartStore';

const PaymentSuccess: React.FC = () => {
  const history = useHistory();
  const { clearCart } = useCartStore();

  const params = new URLSearchParams(window.location.search);
  const reference = params.get('reference');

  useEffect(() => {
    clearCart();
    // Auto-redirect to orders after 3 seconds
    const timer = setTimeout(() => history.replace('/orders'), 3000);
    return () => clearTimeout(timer);
  }, [clearCart, history]);

  return (
    <IonPage>
      <IonContent>
        <div style={{ padding: '16px', paddingTop: '60px', textAlign: 'center' }}>
          <IonIcon
            icon={checkmarkCircleOutline}
            style={{ fontSize: '100px', color: '#27AE60', marginBottom: '20px' }}
          />
          <h2>Payment Submitted!</h2>
          <IonCard>
            <IonCardContent>
              {reference && (
                <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Order: {reference}</p>
              )}
              <p>Your funds are now held in TradeSafe escrow.</p>
              <p>They will be released to the seller once you confirm delivery.</p>
              <p style={{ fontSize: '13px', color: '#888' }}>Redirecting to your orders...</p>
              <IonButton expand="block" onClick={() => history.replace('/orders')} style={{ marginTop: '20px' }}>
                View My Orders
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PaymentSuccess;
