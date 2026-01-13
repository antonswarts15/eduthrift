import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonToast,
  IonLoading,
  IonBadge
} from '@ionic/react';
import { downloadOutline, checkmarkCircleOutline, locationOutline, timeOutline } from 'ionicons/icons';
import EscrowService from '../services/escrow';

const SellerShippingPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadPendingOrders();
  }, []);

  const loadPendingOrders = async () => {
    // Mock orders that need shipping
    setOrders([
      {
        orderId: 'ORD-1234567890',
        buyerName: 'John Doe',
        items: [
          { name: 'School Uniform Long Sleeve Shirt', price: 85 },
          { name: 'School Blazer', price: 150 }
        ],
        total: 270, // Including shipping
        status: 'payment_held',
        pickupPoint: {
          name: 'PudoLocker - Sandton City',
          address: 'Sandton City Mall, 83 Rivonia Rd, Sandhurst',
          id: 'PL001'
        },
        shippingLabel: 'https://pudo.co.za/labels/SHIP_1234567890.pdf',
        trackingNumber: 'PUD1234567890',
        createdAt: new Date().toISOString()
      }
    ]);
  };

  const downloadShippingLabel = (labelUrl: string, orderId: string) => {
    // In real implementation, this would download the PDF
    window.open(labelUrl, '_blank');
    setToastMessage('Shipping label downloaded. Print and attach to package.');
    setShowToast(true);
  };

  const confirmShipped = async (orderId: string, trackingNumber: string) => {
    try {
      setLoading(true);
      
      // Update order status
      setOrders(prev => prev.map(order => 
        order.orderId === orderId 
          ? { ...order, status: 'shipped' }
          : order
      ));
      
      setToastMessage('Shipment confirmed! Buyer will be notified when item arrives at locker.');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to confirm shipment');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'payment_held': return 'warning';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'collected': return 'success';
      default: return 'medium';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'payment_held': return 'Ready to Ship';
      case 'shipped': return 'In Transit';
      case 'delivered': return 'At Locker';
      case 'collected': return 'Completed';
      default: return status;
    }
  };

  return (
    <div style={{ padding: '16px', paddingTop: '60px' }}>
      <h2>Orders to Ship</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        Payment is held in escrow until buyer collects items from Pudo locker.
      </p>

      {orders.map((order) => (
        <IonCard key={order.orderId}>
          <IonCardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <IonCardTitle>Order #{order.orderId.slice(-6)}</IonCardTitle>
              <IonBadge color={getStatusColor(order.status)}>
                {getStatusText(order.status)}
              </IonBadge>
            </div>
          </IonCardHeader>
          <IonCardContent>
            {/* Order Details */}
            <div style={{ marginBottom: '16px' }}>
              <p><strong>Buyer:</strong> {order.buyerName}</p>
              <p><strong>Total:</strong> R{order.total} (held in escrow)</p>
              <p><strong>Items:</strong></p>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                {order.items.map((item: any, index: number) => (
                  <li key={index}>{item.name} - R{item.price}</li>
                ))}
              </ul>
            </div>

            {/* Shipping Instructions */}
            <IonCard style={{ margin: '0', backgroundColor: '#f8f9fa' }}>
              <IonCardContent>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <IonIcon icon={locationOutline} style={{ marginRight: '8px', color: '#007bff' }} />
                  <strong>Ship to Pudo Locker:</strong>
                </div>
                <p style={{ margin: '0 0 8px 24px' }}>{order.pickupPoint.name}</p>
                <p style={{ margin: '0 0 16px 24px', fontSize: '14px', color: '#666' }}>
                  {order.pickupPoint.address}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <IonIcon icon={timeOutline} style={{ marginRight: '8px', color: '#28a745' }} />
                  <strong>Tracking:</strong> {order.trackingNumber}
                </div>
              </IonCardContent>
            </IonCard>

            {/* Action Buttons */}
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
              {order.status === 'payment_held' && (
                <>
                  <IonButton 
                    expand="block" 
                    fill="outline"
                    onClick={() => downloadShippingLabel(order.shippingLabel, order.orderId)}
                  >
                    <IonIcon icon={downloadOutline} slot="start" />
                    Download Shipping Label
                  </IonButton>
                  
                  <IonButton 
                    expand="block" 
                    color="success"
                    onClick={() => confirmShipped(order.orderId, order.trackingNumber)}
                  >
                    <IonIcon icon={checkmarkCircleOutline} slot="start" />
                    Confirm Item Shipped
                  </IonButton>
                </>
              )}
              
              {order.status === 'shipped' && (
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#e3f2fd', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, color: '#1976d2' }}>
                    ✓ Item shipped! Payment will be released when buyer collects from locker.
                  </p>
                </div>
              )}
            </div>
          </IonCardContent>
        </IonCard>
      ))}

      {orders.length === 0 && (
        <IonCard>
          <IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
            <p>No orders pending shipment</p>
          </IonCardContent>
        </IonCard>
      )}

      <IonLoading isOpen={loading} message="Processing..." />
      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={4000}
        onDidDismiss={() => setShowToast(false)}
      />
    </div>
  );
};

export default SellerShippingPage;