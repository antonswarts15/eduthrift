import React, { useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonItem
} from '@ionic/react';

interface PricingBreakdownProps {
  itemPrice: number;
  shippingCost: number;
}

const PricingBreakdown: React.FC<PricingBreakdownProps> = ({ itemPrice, shippingCost }) => {
  const [pricingModel, setPricingModel] = useState<'buyer_pays_extra' | 'seller_pays_fee'>('buyer_pays_extra');

  const serviceFeeRate = 0.1; // 10%
  const serviceFee = itemPrice * serviceFeeRate;

  const buyerPaysExtraModel = {
    itemPrice,
    serviceFee,
    shipping: shippingCost,
    totalBuyerPays: itemPrice + serviceFee + shippingCost,
    sellerReceives: itemPrice,
    platformRevenue: serviceFee
  };

  const sellerPaysFeeModel = {
    itemPrice,
    serviceFee,
    shipping: shippingCost,
    totalBuyerPays: itemPrice + shippingCost,
    sellerReceives: itemPrice - serviceFee,
    platformRevenue: serviceFee
  };

  const currentModel = pricingModel === 'buyer_pays_extra' ? buyerPaysExtraModel : sellerPaysFeeModel;

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Pricing Model Comparison</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonSegment value={pricingModel} onIonChange={e => setPricingModel(e.detail.value as any)}>
          <IonSegmentButton value="buyer_pays_extra">
            <IonLabel>Buyer Pays Extra</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="seller_pays_fee">
            <IonLabel>Seller Pays Fee</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <div style={{ marginTop: '20px' }}>
          <h4>{pricingModel === 'buyer_pays_extra' ? 'Model 1: Buyer Pays Service Fee' : 'Model 2: Seller Pays Service Fee'}</h4>
          
          <IonItem lines="none">
            <IonLabel>
              <h3>Item Price: R{itemPrice}</h3>
            </IonLabel>
          </IonItem>

          {pricingModel === 'buyer_pays_extra' && (
            <IonItem lines="none">
              <IonLabel>
                <p>+ Service Fee (10%): R{serviceFee.toFixed(2)}</p>
              </IonLabel>
            </IonItem>
          )}

          <IonItem lines="none">
            <IonLabel>
              <p>+ Shipping: R{shippingCost}</p>
            </IonLabel>
          </IonItem>

          <IonItem lines="none" style={{ borderTop: '1px solid #ddd', marginTop: '8px', paddingTop: '8px' }}>
            <IonLabel>
              <h2 style={{ color: '#e74c3c' }}>Buyer Pays: R{currentModel.totalBuyerPays.toFixed(2)}</h2>
            </IonLabel>
          </IonItem>

          <IonItem lines="none">
            <IonLabel>
              <h3 style={{ color: '#27ae60' }}>Seller Receives: R{currentModel.sellerReceives.toFixed(2)}</h3>
              {pricingModel === 'seller_pays_fee' && (
                <p style={{ color: '#666', fontSize: '12px' }}>
                  (R{itemPrice} - R{serviceFee.toFixed(2)} service fee)
                </p>
              )}
            </IonLabel>
          </IonItem>

          <IonItem lines="none">
            <IonLabel>
              <p style={{ color: '#3498db' }}>Platform Revenue: R{currentModel.platformRevenue.toFixed(2)}</p>
            </IonLabel>
          </IonItem>
        </div>

        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
            {pricingModel === 'buyer_pays_extra' ? 'Pros & Cons - Buyer Pays Extra:' : 'Pros & Cons - Seller Pays Fee:'}
          </h4>
          {pricingModel === 'buyer_pays_extra' ? (
            <div style={{ fontSize: '12px' }}>
              <p style={{ margin: '4px 0', color: '#27ae60' }}>✓ Seller gets full asking price</p>
              <p style={{ margin: '4px 0', color: '#27ae60' }}>✓ Transparent fee structure</p>
              <p style={{ margin: '4px 0', color: '#e74c3c' }}>✗ Higher total cost for buyer</p>
              <p style={{ margin: '4px 0', color: '#e74c3c' }}>✗ May reduce conversion rates</p>
            </div>
          ) : (
            <div style={{ fontSize: '12px' }}>
              <p style={{ margin: '4px 0', color: '#27ae60' }}>✓ Lower total cost for buyer</p>
              <p style={{ margin: '4px 0', color: '#27ae60' }}>✓ Better conversion rates</p>
              <p style={{ margin: '4px 0', color: '#e74c3c' }}>✗ Seller receives less than asking price</p>
              <p style={{ margin: '4px 0', color: '#e74c3c' }}>✗ May need to adjust listing prices</p>
            </div>
          )}
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default PricingBreakdown;