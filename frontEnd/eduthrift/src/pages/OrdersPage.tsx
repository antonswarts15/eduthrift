import React, { useState, useEffect } from 'react';
import {
  IonContent, IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardContent,
  IonBadge, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonModal,
  IonHeader, IonToolbar, IonTitle, IonSpinner, IonAlert
} from '@ionic/react';
import { trainOutline as trackingOutline, closeOutline, closeCircleOutline, warningOutline } from 'ionicons/icons';
import { useOrdersStore } from '../stores/ordersStore';
import { useCartStore } from '../stores/cartStore';
import api from '../services/api';
import DisputeForm from '../components/DisputeForm';

const OrdersPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('current');
  const [trackingModal, setTrackingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelConfirmOrder, setCancelConfirmOrder] = useState<string | null>(null);
  const [disputeOrderNumber, setDisputeOrderNumber] = useState<string | null>(null);
  const { orders, fetchOrders } = useOrdersStore();
  const { clearCart } = useCartStore();

  const handleCancelOrder = async (orderNumber: string) => {
    try {
      await api.put(`/orders/${orderNumber}/status`, { status: 'CANCELLED' });
      clearCart();
      await fetchOrders();
    } catch {
      // silently ignore — order status will refresh on next fetch
    }
    setCancelConfirmOrder(null);
  };

  useEffect(() => {
    fetchOrders().finally(() => setLoading(false));
  }, []);

  const currentOrders = orders.filter(order =>
    ['processing', 'paid', 'shipped', 'pending_payment', 'payment_confirmed'].includes(order.status)
  );

  const orderHistory = orders.filter(order =>
    ['delivered', 'cancelled', 'completed', 'refunded'].includes(order.status)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'payment_confirmed': return 'success';
      case 'processing': return 'warning';
      case 'paid': return 'success';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      case 'refunded': return 'medium';
      default: return 'medium';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'Awaiting Payment';
      case 'payment_confirmed': return 'Payment Confirmed';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'refunded': return 'Refunded';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-ZA');

  const openTracking = (order: any) => { setSelectedOrder(order); setTrackingModal(true); };

  const renderOrderCard = (order: any) => (
    <IonCard key={order.id} style={{ marginBottom: '12px' }}>
      <IonCardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <h4 style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: 'bold' }}>{order.id}</h4>
            <p style={{ margin: '0', fontSize: '12px', color: '#888' }}>{formatDate(order.orderDate)}</p>
            {order.isBuyer && order.sellerAlias && (
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#666' }}>
                From: <strong>{order.sellerAlias}</strong>
              </p>
            )}
            {!order.isBuyer && order.buyerAlias && (
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#666' }}>
                To: <strong>{order.buyerAlias}</strong>
              </p>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
            <IonBadge color={getStatusColor(order.status)}>{getStatusLabel(order.status)}</IonBadge>
            {order.disputeStatus === 'OPEN' && (
              <IonBadge color="warning">Dispute Open</IonBadge>
            )}
            {order.disputeStatus === 'RESOLVED_REFUND' && (
              <IonBadge color="medium">Refunded</IonBadge>
            )}
            {order.disputeStatus === 'RESOLVED_RELEASE' && (
              <IonBadge color="success">Dispute Resolved</IonBadge>
            )}
          </div>
        </div>

        {order.items && order.items.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            {order.items.map((item: any, index: number) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                {item.frontPhoto && (
                  <div style={{
                    width: '40px', height: '50px', borderRadius: '4px',
                    backgroundImage: `url(${item.frontPhoto})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    border: '1px solid #ddd', flexShrink: 0
                  }} />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>{item.name}</p>
                  <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>{item.school} • Size: {item.size}</p>
                  <p style={{ margin: '0', fontSize: '12px', color: '#27AE60', fontWeight: 'bold' }}>R{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ borderTop: '1px solid #eee', paddingTop: '12px' }}>
          <IonGrid>
            <IonRow>
              <IonCol size="6">
                <p style={{ margin: '0', fontSize: '12px' }}><strong>Payment:</strong> TradeSafe Escrow</p>
                {order.pickupPoint && (
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>
                    📦 {order.pickupPoint}
                  </p>
                )}
              </IonCol>
              <IonCol size="6" style={{ textAlign: 'right' }}>
                <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#27AE60' }}>
                  R{order.totalAmount}
                </p>
                {order.trackingNumber && (
                  <IonButton size="small" fill="outline" onClick={() => openTracking(order)} style={{ marginTop: '4px' }}>
                    <IonIcon icon={trackingOutline} slot="start" />
                    Track
                  </IonButton>
                )}
                {order.isBuyer && order.status === 'pending_payment' && (
                  <IonButton
                    size="small"
                    fill="outline"
                    color="danger"
                    onClick={() => setCancelConfirmOrder(order.id)}
                    style={{ marginTop: '4px' }}
                  >
                    <IonIcon icon={closeCircleOutline} slot="start" />
                    Cancel
                  </IonButton>
                )}
                {order.isBuyer
                  && ['payment_confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)
                  && !order.deliveryConfirmed
                  && (!order.disputeStatus || order.disputeStatus === 'NONE') && (
                  <IonButton
                    size="small"
                    fill="outline"
                    color="warning"
                    onClick={() => setDisputeOrderNumber(order.id)}
                    style={{ marginTop: '4px' }}
                  >
                    <IonIcon icon={warningOutline} slot="start" />
                    Report Issue
                  </IonButton>
                )}
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonCardContent>
    </IonCard>
  );

  return (
    <IonContent>
      <div style={{ padding: '16px' }}>
        <IonSegment value={selectedTab} onIonChange={e => setSelectedTab(e.detail.value as string)}>
          <IonSegmentButton value="current"><IonLabel>Current Orders</IonLabel></IonSegmentButton>
          <IonSegmentButton value="history"><IonLabel>Order History</IonLabel></IonSegmentButton>
        </IonSegment>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}><IonSpinner /></div>
        ) : (
          <>
            {selectedTab === 'current' && (
              <div style={{ marginTop: '16px' }}>
                <h3>Current Orders ({currentOrders.length})</h3>
                {currentOrders.length === 0 ? (
                  <IonCard><IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
                    <p>No current orders</p>
                  </IonCardContent></IonCard>
                ) : currentOrders.map(renderOrderCard)}
              </div>
            )}

            {selectedTab === 'history' && (
              <div style={{ marginTop: '16px' }}>
                <h3>Order History ({orderHistory.length})</h3>
                {orderHistory.length === 0 ? (
                  <IonCard><IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
                    <p>No order history</p>
                  </IonCardContent></IonCard>
                ) : orderHistory.map(renderOrderCard)}
              </div>
            )}
          </>
        )}
      </div>

      {disputeOrderNumber && (
        <DisputeForm
          orderNumber={disputeOrderNumber}
          isOpen={!!disputeOrderNumber}
          onClose={() => setDisputeOrderNumber(null)}
          onSuccess={() => { setDisputeOrderNumber(null); fetchOrders(); }}
        />
      )}

      <IonAlert
        isOpen={!!cancelConfirmOrder}
        onDidDismiss={() => setCancelConfirmOrder(null)}
        header="Cancel Order"
        message="Are you sure you want to cancel this order? The items will be returned to the marketplace and your cart will be cleared."
        buttons={[
          { text: 'Keep Order', role: 'cancel' },
          { text: 'Cancel Order', role: 'destructive', handler: () => handleCancelOrder(cancelConfirmOrder!) }
        ]}
      />

      <IonModal isOpen={trackingModal} onDidDismiss={() => setTrackingModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Track {selectedOrder?.id}</IonTitle>
            <IonButton fill="clear" slot="end" onClick={() => setTrackingModal(false)}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '16px' }}>
            {selectedOrder && (
              <>
                <IonCard>
                  <IonCardContent>
                    <h3 style={{ margin: '0 0 8px 0' }}>Tracking Information</h3>
                    <p style={{ margin: '0 0 4px', fontSize: '14px' }}>
                      <strong>Tracking Number:</strong> {selectedOrder.trackingNumber}
                    </p>
                    <p style={{ margin: '0 0 4px', fontSize: '14px' }}>
                      <strong>Pickup Point:</strong> {selectedOrder.pickupPoint}
                    </p>
                    <p style={{ margin: '0', fontSize: '14px' }}>
                      <strong>Status:</strong> {getStatusLabel(selectedOrder.status)}
                    </p>
                  </IonCardContent>
                </IonCard>

                {selectedOrder.status === 'shipped' && (
                  <IonCard>
                    <IonCardContent style={{ backgroundColor: '#e8f5e8' }}>
                      <p style={{ margin: '0', fontSize: '14px', color: '#2d5a2d' }}>
                        📫 <strong>Ready for Collection!</strong><br />
                        Your order is available at the Pudo locker. Use tracking number{' '}
                        <strong>{selectedOrder.trackingNumber}</strong> to collect.
                      </p>
                    </IonCardContent>
                  </IonCard>
                )}
              </>
            )}
          </div>
        </IonContent>
      </IonModal>
    </IonContent>
  );
};

export default OrdersPage;
