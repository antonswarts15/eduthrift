import React from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel } from '@ionic/react';

interface PaymentBreakdownProps {
  itemPrice: number;
  quantity?: number;
}

const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({ itemPrice, quantity = 1 }) => {
  const totalSaleAmount = itemPrice * quantity;
  const platformFee = totalSaleAmount * 0.07; // 7% platform fee (includes TradeSafe escrow fee)
  const sellerPayout = totalSaleAmount - platformFee;

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Payment Breakdown</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonItem lines="none">
          <IonLabel>
            <h3>Sale Amount</h3>
            <p>R{itemPrice} × {quantity}</p>
          </IonLabel>
          <IonLabel slot="end">
            <h3>R{totalSaleAmount.toFixed(2)}</h3>
          </IonLabel>
        </IonItem>
        
        <div style={{ borderTop: '1px solid #e0e0e0', margin: '8px 0' }} />
        
        <IonItem lines="none">
          <IonLabel>
            <h3 style={{ color: '#d32f2f' }}>Platform Fee (7%)</h3>
            <p style={{ fontSize: '12px' }}>Marketplace & escrow service (incl. TradeSafe fee)</p>
          </IonLabel>
          <IonLabel slot="end">
            <h3 style={{ color: '#d32f2f' }}>-R{platformFee.toFixed(2)}</h3>
          </IonLabel>
        </IonItem>
        
        <div style={{ borderTop: '2px solid #4caf50', margin: '8px 0' }} />
        
        <IonItem lines="none">
          <IonLabel>
            <h2 style={{ color: '#4caf50', fontWeight: 'bold' }}>Your Payout</h2>
            <p style={{ fontSize: '12px' }}>Paid within 24-48 hours after delivery</p>
          </IonLabel>
          <IonLabel slot="end">
            <h2 style={{ color: '#4caf50', fontWeight: 'bold' }}>R{sellerPayout.toFixed(2)}</h2>
          </IonLabel>
        </IonItem>
        
        <div style={{ padding: '12px', backgroundColor: '#e8f5e8', borderRadius: '8px', marginTop: '12px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#2d5a2d' }}>
            💰 <strong>Secure Payment:</strong> Funds are held in escrow until buyer confirms delivery. Your payout is automatically transferred to your bank account.
          </p>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default PaymentBreakdown;
