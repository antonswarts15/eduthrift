import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonButton,
  IonRadioGroup,
  IonRadio,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonLoading,
  IonToast,
  IonList,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { locationOutline, timeOutline, cashOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import ShippingService, { PickupPoint, ShippingRate } from '../services/shipping';
import { useCartStore } from '../stores/cartStore';
import { useUserStore } from '../stores/userStore';
import { useOrdersStore, Order } from '../stores/ordersStore'; // Import Order type
import { useListingsStore } from '../stores/listingsStore';
import { useNotificationStore } from '../stores/notificationStore';
import ShippingWebhookService from '../services/shipping-webhook';
import { getCoordinatesFromAddress } from '../utils/geocoding';
import FeeStructureInfo from '../components/FeeStructureInfo';
import { userApi, ordersApi, paymentsApi } from '../services/api';
import AddressModal, { AddressData } from '../components/AddressModal';

const CheckoutPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { cartItems, clearCart } = useCartStore();
  const { userProfile, fetchUserProfile } = useUserStore();

  const { addOrder, updateOrderStatus, updatePaymentStatus, updateTrackingInfo } = useOrdersStore();
  const { decreaseQuantity } = useListingsStore();
  const { addNotification } = useNotificationStore();

  // Fetch user profile when the component mounts
  useEffect(() => {
    if (!userProfile) {
      fetchUserProfile();
    }
  }, [userProfile, fetchUserProfile]);

  // Check if address is missing and show modal
  useEffect(() => {
    if (userProfile && !userProfile.suburb && !userProfile.town) {
      setShowAddressModal(true);
    }
  }, [userProfile]);

  // Set up webhook callbacks
  useEffect(() => {
    const validStatuses: Order['status'][] = ['processing', 'paid', 'shipped', 'delivered', 'cancelled', 'pending_payment', 'awaiting_eft'];
    const handleOrderStatusUpdate = (orderId: string, status: string) => {
      if (validStatuses.includes(status as Order['status'])) {
        updateOrderStatus(orderId, status as Order['status']);
      }
    };
    ShippingWebhookService.setCallbacks(addNotification, handleOrderStatusUpdate);
  }, [addNotification, updateOrderStatus]);
  
  const locationItems = (location.state as any)?.items;
  const items = Array.isArray(locationItems) ? locationItems : 
                Array.isArray(cartItems) ? cartItems : [];
  
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<string>('');
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);

  const [selectedRate, setSelectedRate] = useState<string>('');
  const [paymentMethod] = useState<'tradesafe'>('tradesafe');
  
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Calculate totals
  const totalAmount = items.reduce((sum: number, item: any) => sum + item.price, 0);
  const shippingCost = shippingRates.find(rate => rate.service_level_code === selectedRate)?.total_cost || 0;
  const finalAmount = totalAmount + shippingCost;

  const handleAddressSave = async (addressData: AddressData) => {
    try {
      setLoading(true);
      await userApi.updateProfile(addressData);
      await fetchUserProfile();
      setShowAddressModal(false);
      setToastMessage('Address saved successfully');
      setShowToast(true);
    } catch {
      setToastMessage('Failed to save address. Please try again.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyPickupPoints = async () => {
    if (!userProfile?.suburb && !userProfile?.town) {
      return;
    }

    try {
      setLoading(true);
      const coords = getCoordinatesFromAddress({
        suburb: userProfile.suburb || '',
        city: userProfile.town || '',
        province: userProfile.province || ''
      });

      const points = await ShippingService.getPickupPoints({
        type: 'locker',
        lat: coords.lat,
        lng: coords.lng,
        order_closest: true
      });

      if (Array.isArray(points) && points.length > 0) {
        setPickupPoints(points);
        setSelectedPickupPoint(points[0].pickup_point_id);
      } else {
        setPickupPoints([]);
        setToastMessage('No pickup points available in your area');
        setShowToast(true);
      }
    } catch {
      setPickupPoints([]);
      setToastMessage('Could not load pickup points for your area. Please check your address and try again.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Add a specific effect to reload pickup points when userProfile changes
  useEffect(() => {
    if (userProfile && (userProfile.suburb || userProfile.town)) {
        loadNearbyPickupPoints();
    }
  }, [userProfile]); // This dependency ensures it runs when profile is loaded/updated

  if (!items || items.length === 0) {
    return (
      <div style={{ padding: '16px' }}>
        <IonCard>
          <IonCardContent>
            <p>No items in cart. Please add items before checkout.</p>
            <IonButton expand="block" onClick={() => history.push('/buyer')}>Browse Items</IonButton>
          </IonCardContent>
        </IonCard>
      </div>
    );
  }

  const calculateShipping = async () => {
    if (!items.length) return;
    try {
      setLoading(true);
      const rateRequest = {
        delivery_pickup_point_id: selectedPickupPoint,
        item_id: items[0]?.id
      };
      const rates = await ShippingService.getRates(rateRequest);
      if (Array.isArray(rates)) {
        setShippingRates(rates);
      } else {
        console.error('Invalid shipping rates response:', rates);
        setShippingRates([]);
      }
    } catch {
      setToastMessage('Failed to calculate shipping rates. Please try again.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const processOrder = async () => {
    if (!selectedRate || !paymentMethod) {
      setToastMessage('Please select shipping and payment options');
      setShowToast(true);
      return;
    }

    if (!userProfile) {
      setToastMessage('You must be logged in to place an order.');
      setShowToast(true);
      return;
    }

    setLoading(true);

    const totalAmount = items.reduce((sum: number, item: any) => sum + item.price, 0);
    const shippingCost = shippingRates.find(rate => rate.service_level_code === selectedRate)?.total_cost || 0;
    const finalAmount = totalAmount + shippingCost; // No service fee added to buyer

    const orderId = addOrder({
      items: items,
      totalAmount: finalAmount,
      status: 'pending_payment',
      paymentMethod,
      paymentStatus: 'pending',
      pickupPoint: pickupPoints.find(p => p.pickup_point_id === selectedPickupPoint)?.name || selectedPickupPoint
    });
    addNotification('Order Created', `Your order ${orderId} is pending payment.`);

    if (paymentMethod === 'tradesafe') {
      try {
        // Step 1: Create the backend order to get a server-side order number
        const firstItem = items[0];
        const orderResponse = await ordersApi.createOrder({
          itemId: firstItem.id,
          quantity: 1,
          shippingCost: shippingCost,
          pickupPoint: pickupPoints.find(p => p.pickup_point_id === selectedPickupPoint)?.name || selectedPickupPoint,
          deliveryLockerId: selectedPickupPoint,
          serviceLevelCode: selectedRate
        });
        const backendOrderNumber = orderResponse.data.orderNumber;

        // Step 2: Create TradeSafe escrow transaction and get deposit URL
        const paymentResponse = await paymentsApi.initiateTradeSafe(backendOrderNumber);
        const { depositUrl } = paymentResponse.data;

        if (!depositUrl) {
          throw new Error('No deposit URL returned from TradeSafe');
        }

        // Step 3: Redirect buyer to TradeSafe to fund the escrow
        window.location.href = depositUrl;

      } catch (error: any) {
        setToastMessage(`Payment failed: ${error.response?.data?.error || error.message}`);
        setShowToast(true);
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <h2>Checkout</h2>
      
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Order Summary</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {items.map((item: any, index: number) => (
            <IonItem key={index}>
              <IonLabel>
                <h3>{item.name || item.item_name}</h3>
                <p>R{item.price}</p>
              </IonLabel>
            </IonItem>
          ))}
          <IonItem>
            <IonLabel>
              <strong>Subtotal: R{totalAmount}</strong>
            </IonLabel>
          </IonItem>
          {selectedRate && (
            <IonItem>
              <IonLabel>
                <strong>Shipping: R{shippingCost}</strong>
              </IonLabel>
            </IonItem>
          )}
          {selectedRate && (
            <IonItem>
              <IonLabel color="success">
                <strong>Total: R{finalAmount}</strong>
              </IonLabel>
            </IonItem>
          )}
        </IonCardContent>
      </IonCard>

      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Select Pickup Point</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#666' }}>
            <strong>Your Address:</strong> {userProfile?.suburb || userProfile?.town || userProfile?.province ?
              `${userProfile.suburb || 'N/A'}, ${userProfile.town || 'N/A'}, ${userProfile.province || 'N/A'}` :
              'Address not set'
            }
          </p>
          {pickupPoints.length > 0 ? (
            <IonRadioGroup value={selectedPickupPoint} onIonChange={e => setSelectedPickupPoint(e.detail.value)}>
              {pickupPoints.map((point, index) => (
                <IonItem key={point.pickup_point_id} button onClick={() => setSelectedPickupPoint(point.pickup_point_id)}>
                  <IonIcon icon={locationOutline} slot="start" />
                  <IonLabel>
                    <h3>{point.name} {index === 0 ? '(Nearest)' : ''}</h3>
                    <p>{point.address}</p>
                  </IonLabel>
                  <IonRadio slot="end" value={point.pickup_point_id} />
                </IonItem>
              ))}
            </IonRadioGroup>
          ) : (
            <p>Loading pickup points...</p>
          )}
        </IonCardContent>
      </IonCard>

      <IonButton 
        expand="block" 
        onClick={calculateShipping}
        disabled={!selectedPickupPoint}
        style={{ margin: '16px 0' }}
      >
        Calculate Shipping
      </IonButton>

      {shippingRates.length > 0 && (
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Shipping Options</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonRadioGroup value={selectedRate} onIonChange={e => setSelectedRate(e.detail.value)}>
              {shippingRates.map(rate => (
                <IonItem key={rate.service_level_code} button onClick={() => setSelectedRate(rate.service_level_code)}>
                  <IonIcon icon={timeOutline} slot="start" />
                  <IonLabel>
                    <h3>{rate.service_level_name}</h3>
                    <p>Delivery: {rate.delivery_date}</p>
                  </IonLabel>
                  <IonLabel slot="end">
                    <h3>R{rate.total_cost}</h3>
                  </IonLabel>
                  <IonRadio slot="end" value={rate.service_level_code} />
                </IonItem>
              ))}
            </IonRadioGroup>
          </IonCardContent>
        </IonCard>
      )}

      {selectedRate && (
        <>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Payment Method</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div style={{ padding: '12px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600', color: '#2d5a2d' }}>TradeSafe Escrow</p>
                <p style={{ margin: '0', fontSize: '12px', color: '#2d5a2d' }}>
                  <strong>Escrow Protection:</strong> Payment held by TradeSafe until delivery confirmed. Funds released to seller only after you accept the item.
                </p>
              </div>
            </IonCardContent>
          </IonCard>

          <IonButton
            expand="block"
            color="success"
            onClick={processOrder}
            style={{ margin: '16px 0' }}
          >
            <IonIcon icon={cashOutline} slot="start" />
            Pay with TradeSafe
          </IonButton>
        </>
      )}

      <AddressModal
        isOpen={showAddressModal}
        onDismiss={() => setShowAddressModal(false)}
        onSave={handleAddressSave}
        initialData={{
          streetAddress: userProfile?.streetAddress,
          suburb: userProfile?.suburb,
          town: userProfile?.town,
          province: userProfile?.province
        }}
      />

      <IonLoading isOpen={loading} message="Processing..." />
      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        onDidDismiss={() => setShowToast(false)}
      />
    </div>
  );
};

export default CheckoutPage;