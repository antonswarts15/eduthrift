import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonToast,
  IonLoading,
  IonBadge
} from '@ionic/react';
import { checkmarkCircleOutline, locationOutline } from 'ionicons/icons';
import api from '../services/api';

const SellerShippingPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadPendingOrders();
  }, []);

  const loadPendingOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      const sellerOrders = (response.data.sellerOrders || []).filter(
        (o: any) => o.orderStatus === 'PAYMENT_CONFIRMED' || o.orderStatus === 'PROCESSING' || o.orderStatus === 'SHIPPED'
      );
      setOrders(sellerOrders);
    } catch {
      setToastMessage('Failed to load orders. Please try again.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const confirmShipped = async (orderNumber: string) => {
    try {
      setLoading(true);
      await api.put(`/orders/${orderNumber}/status`, { status: 'SHIPPED' });
      setOrders(prev =>
        prev.map(order =>
          order.orderNumber === orderNumber ? { ...order, orderStatus: 'SHIPPED' } : order
        )
      );
      setToastMessage('Shipment confirmed. Buyer will be notified.');
      setShowToast(true);
    } catch {
      setToastMessage('Failed to confirm shipment. Please try again.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAYMENT_CONFIRMED': return 'warning';
      case 'PROCESSING': return 'warning';
      case 'SHIPPED': return 'primary';
      case 'DELIVERED': return 'success';
      default: return 'medium';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAYMENT_CONFIRMED': return 'Ready to Ship';
      case 'PROCESSING': return 'Preparing';
      case 'SHIPPED': return 'In Transit';
      case 'DELIVERED': return 'Delivered';
      default: return status;
    }
  };

  return (
    <div style={{ padding: '16px', paddingTop: '60px' }}>
      <h2>Orders to Ship</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        Payment is held in TradeSafe escrow until the buyer receives their items.
      </p>

      {orders.map((order) => (
        <IonCard key={order.orderNumber}>
          <IonCardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <IonCardTitle>Order #{order.orderNumber?.slice(-6)}</IonCardTitle>
              <IonBadge color={getStatusColor(order.orderStatus)}>
                {getStatusText(order.orderStatus)}
              </IonBadge>
            </div>
          </IonCardHeader>
          <IonCardContent>
            <div style={{ marginBottom: '16px' }}>
              <p><strong>Item:</strong> {order.itemName}</p>
              <p><strong>Quantity:</strong> {order.quantity}</p>
              <p><strong>Total (held in escrow):</strong> R{order.totalAmount}</p>
            </div>

            {order.pickupPoint && (
              <IonCard style={{ margin: '0 0 12px', backgroundColor: '#f0f7ff', border: '1px solid #004aad' }}>
                <IonCardContent>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <IonIcon icon={locationOutline} style={{ marginRight: '8px', color: '#004aad' }} />
                    <strong style={{ color: '#004aad' }}>Buyer's Pudo Locker</strong>
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{order.pickupPoint}</p>
                  {order.trackingNumber && (
                    <div style={{ backgroundColor: '#fff', borderRadius: '6px', padding: '10px', border: '1px solid #cce0ff' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#666' }}>WAYBILL / TRACKING NUMBER</p>
                      <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#004aad', letterSpacing: '1px' }}>
                        {order.trackingNumber}
                      </p>
                    </div>
                  )}
                  <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#555', lineHeight: '1.5' }}>
                    📦 Drop the item at <strong>any Pudo locker</strong> using the waybill above. The buyer will be notified to collect.
                  </p>
                </IonCardContent>
              </IonCard>
            )}

            <div style={{ marginTop: '16px' }}>
              {(order.orderStatus === 'PAYMENT_CONFIRMED' || order.orderStatus === 'PROCESSING') && (
                <IonButton
                  expand="block"
                  color="success"
                  onClick={() => confirmShipped(order.orderNumber)}
                >
                  <IonIcon icon={checkmarkCircleOutline} slot="start" />
                  Confirm Item Shipped
                </IonButton>
              )}

              {order.orderStatus === 'SHIPPED' && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, color: '#1976d2' }}>
                    Item shipped. Payment will be released once the buyer confirms delivery.
                  </p>
                </div>
              )}
            </div>
          </IonCardContent>
        </IonCard>
      ))}

      {!loading && orders.length === 0 && (
        <IonCard>
          <IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
            <p>No orders pending shipment</p>
          </IonCardContent>
        </IonCard>
      )}

      <IonLoading isOpen={loading} message="Loading..." />
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
