import React from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonCard, IonCardContent, IonButton, IonIcon } from '@ionic/react';
import { alertCircleOutline } from 'ionicons/icons';

const PaymentError: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent>
        <div style={{ padding: '16px', paddingTop: '60px', textAlign: 'center' }}>
          <IonIcon 
            icon={alertCircleOutline} 
            style={{ fontSize: '100px', color: '#F39C12', marginBottom: '20px' }} 
          />
          <h2>Payment Error</h2>
          <IonCard>
            <IonCardContent>
              <p>There was an error processing your payment.</p>
              <p>Please try again or contact support if the problem persists.</p>
              <IonButton expand="block" onClick={() => history.push('/cart')} style={{ marginTop: '20px' }}>
                Try Again
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

export default PaymentError;
