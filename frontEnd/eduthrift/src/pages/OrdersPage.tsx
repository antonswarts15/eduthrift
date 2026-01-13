import React, { useState } from 'react';
import {
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonCard,
  IonCardContent,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle
} from '@ionic/react';
import { trainOutline as trackingOutline, closeOutline, warningOutline, refreshOutline } from 'ionicons/icons';
import { useOrdersStore } from '../stores/ordersStore';
import EscrowService from '../services/escrow';

const OrdersPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('current');
  const [trackingModal, setTrackingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { orders } = useOrdersStore();

  const currentOrders = orders.filter(order => 
    order.status === 'processing' || order.status === 'paid' || order.status === 'shipped'
  );

  const orderHistory = orders.filter(order => 
    order.status === 'delivered' || order.status === 'cancelled'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'warning';
      case 'paid': return 'success';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getEscrowStatus = (orderId: string) => {
    const escrow = EscrowService.getEscrowByOrderId(orderId);
    return escrow;
  };

  const openTracking = (order: any) => {
    setSelectedOrder(order);
    setTrackingModal(true);
  };

  const getTrackingSteps = (order: any) => {
    const steps = [
      { status: 'Order Placed', completed: true, time: formatDate(order.orderDate) },
      { status: 'Payment Confirmed', completed: order.paymentStatus === 'completed', time: order.paymentStatus === 'completed' ? formatDate(order.orderDate) : '' },
      { status: 'Processing', completed: order.status !== 'processing', time: order.status !== 'processing' ? formatDate(order.orderDate) : '' }
    ];
    
    if (order.shippingProvider === 'pudo') {
      steps.push({ status: 'Ready for Collection', completed: order.status === 'delivered', time: order.status === 'delivered' ? 'Available at Pudo locker' : '' });
    } else {
      steps.push(
        { status: 'Shipped', completed: order.status === 'shipped' || order.status === 'delivered', time: order.status === 'shipped' || order.status === 'delivered' ? 'In transit' : '' },
        { status: 'Delivered', completed: order.status === 'delivered', time: order.status === 'delivered' ? 'Delivered successfully' : '' }
      );
    }
    
    return steps;
  };

  return (
    <IonContent>
      <div style={{ padding: '16px' }}>
        <IonSegment value={selectedTab} onIonChange={e => setSelectedTab(e.detail.value as string)}>
          <IonSegmentButton value="current">
            <IonLabel>Current Orders</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="history">
            <IonLabel>Order History</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {selectedTab === 'current' && (
          <div style={{ marginTop: '16px' }}>
            <h3>Current Orders ({currentOrders.length})</h3>
            {currentOrders.length === 0 ? (
              <IonCard>
                <IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
                  <p>No current orders</p>
                </IonCardContent>
              </IonCard>
            ) : (
              currentOrders.map(order => (
                <IonCard key={order.id}>
                  <IonCardContent>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0' }}>Order {order.id}</h4>
                        <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>{formatDate(order.orderDate)}</p>
                      </div>
                      <IonBadge color={getStatusColor(order.status)}>{order.status}</IonBadge>
                    </div>
                    
                    <div style={{ marginBottom: '12px' }}>
                      {order.items.map((item, index) => (
                        <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                          <div style={{
                            width: '40px', height: '50px', borderRadius: '4px',
                            backgroundImage: `url(${item.frontPhoto})`,
                            backgroundSize: 'cover', backgroundPosition: 'center',
                            border: '1px solid #ddd', flexShrink: 0
                          }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>{item.name}</p>
                            <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>{item.school} • Size: {item.size}</p>
                            <p style={{ margin: '0', fontSize: '12px', color: '#27AE60', fontWeight: 'bold' }}>R{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ borderTop: '1px solid #eee', paddingTop: '12px' }}>
                      <IonGrid>
                        <IonRow>
                          <IonCol size="6">
                            <p style={{ margin: '0', fontSize: '12px' }}><strong>Payment:</strong> {order.paymentMethod}</p>
                            <p style={{ margin: '0', fontSize: '12px' }}><strong>Status:</strong> {order.paymentStatus}</p>
                            {order.paymentMethod === 'paystack' && (
                              <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#666' }}>
                                🛡️ Escrow: {getEscrowStatus(order.id)?.shippingProvider === 'pudo' ? 'Release on collection' : 'Release on delivery'}
                              </p>
                            )}
                          </IonCol>
                          <IonCol size="6" style={{ textAlign: 'right' }}>
                            <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#27AE60' }}>Total: R{order.totalAmount}</p>
                            {order.paymentMethod === 'paystack' && getEscrowStatus(order.id)?.status === 'released' && (
                              <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#27AE60' }}>✓ Payment released</p>
                            )}
                            {order.trackingNumber && (
                              <IonButton size="small" fill="outline" onClick={() => openTracking(order)} style={{ marginTop: '4px' }}>
                                <IonIcon icon={trackingOutline} slot="start" />
                                Track Order
                              </IonButton>
                            )}
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))
            )}
          </div>
        )}

        {selectedTab === 'history' && (
          <div style={{ marginTop: '16px' }}>
            <h3>Order History ({orderHistory.length})</h3>
            {orderHistory.length === 0 ? (
              <IonCard>
                <IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
                  <p>No order history</p>
                </IonCardContent>
              </IonCard>
            ) : (
              orderHistory.map(order => (
                <IonCard key={order.id}>
                  <IonCardContent>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0' }}>Order {order.id}</h4>
                        <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>{formatDate(order.orderDate)}</p>
                      </div>
                      <IonBadge color={getStatusColor(order.status)}>{order.status}</IonBadge>
                    </div>
                    
                    <div style={{ marginBottom: '12px' }}>
                      {order.items.map((item, index) => (
                        <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                          <div style={{
                            width: '40px', height: '50px', borderRadius: '4px',
                            backgroundImage: `url(${item.frontPhoto})`,
                            backgroundSize: 'cover', backgroundPosition: 'center',
                            border: '1px solid #ddd', flexShrink: 0
                          }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>{item.name}</p>
                            <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>{item.school} • Size: {item.size}</p>
                            <p style={{ margin: '0', fontSize: '12px', color: '#27AE60', fontWeight: 'bold' }}>R{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', textAlign: 'right' }}>
                      <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#27AE60' }}>Total: R{order.totalAmount}</p>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))
            )}
          </div>
        )}
        

      </div>
      
      {/* Tracking Modal */}
      <IonModal isOpen={trackingModal} onDidDismiss={() => setTrackingModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Track Order {selectedOrder?.id}</IonTitle>
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
                    <p style={{ margin: '0', fontSize: '14px' }}><strong>Tracking Number:</strong> {selectedOrder.trackingNumber}</p>
                    <p style={{ margin: '0', fontSize: '14px' }}><strong>Shipping Provider:</strong> {selectedOrder.shippingProvider?.toUpperCase()}</p>
                    <p style={{ margin: '0', fontSize: '14px' }}><strong>Pickup Point:</strong> {selectedOrder.pickupPoint}</p>
                  </IonCardContent>
                </IonCard>
                
                <IonCard>
                  <IonCardContent>
                    <h3 style={{ margin: '0 0 16px 0' }}>Order Progress</h3>
                    {getTrackingSteps(selectedOrder).map((step, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          backgroundColor: step.completed ? '#27AE60' : '#ddd',
                          marginRight: '12px', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {step.completed && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0', fontSize: '14px', fontWeight: step.completed ? 'bold' : 'normal' }}>
                            {step.status}
                          </p>
                          {step.time && (
                            <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>{step.time}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </IonCardContent>
                </IonCard>
                
                {selectedOrder.shippingProvider === 'pudo' && selectedOrder.status === 'delivered' && (
                  <IonCard>
                    <IonCardContent style={{ backgroundColor: '#e8f5e8' }}>
                      <p style={{ margin: '0', fontSize: '14px', color: '#2d5a2d' }}>
                        📫 <strong>Ready for Collection!</strong><br/>
                        Your order is available at the Pudo locker. Use tracking number {selectedOrder.trackingNumber} to collect.
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