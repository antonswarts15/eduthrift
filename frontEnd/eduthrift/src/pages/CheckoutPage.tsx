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
import ShippingService, { PickupPoint, ShippingRate, Parcel } from '../services/shipping';
import EscrowService from '../services/escrow';
import { useCartStore } from '../stores/cartStore';
import { useUserStore } from '../stores/userStore';
import { useOrdersStore, Order } from '../stores/ordersStore'; // Import Order type
import { useListingsStore } from '../stores/listingsStore';
import { useNotificationStore } from '../stores/notificationStore';
import ShippingWebhookService from '../services/shipping-webhook';
import { getCoordinatesFromAddress } from '../utils/geocoding';
import FeeStructureInfo from '../components/FeeStructureInfo';
import { userApi } from '../services/api';

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

  // Set up webhook callbacks
  useEffect(() => {
    const handleOrderStatusUpdate = (orderId: string, status: string) => { // Use string for status
      updateOrderStatus(orderId, status as Order['status']); // Cast to Order['status'] when calling the store
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
  const [paymentMethod, setPaymentMethod] = useState<'ozow' | ''>('');
  
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Calculate totals
  const totalAmount = items.reduce((sum: number, item: any) => sum + item.price, 0);
  const shippingCost = shippingRates.find(rate => rate.service_level_code === selectedRate)?.total_cost || 0;
  const finalAmount = totalAmount + shippingCost;

  const loadNearbyPickupPoints = async () => {
    console.log('Loading pickup points... User profile:', userProfile);

    if (!userProfile?.suburb && !userProfile?.town) {
      console.log('No address data available yet');
      // Don't show error toast immediately, just log it
      console.log('Address not found in profile');
      return;
    }

    try {
      setLoading(true);
      // Build full address string for geocoding
      const fullAddress = `${userProfile.suburb || ''}, ${userProfile.town || ''}, ${userProfile.province || ''}`.trim();
      console.log('Full address for geocoding:', fullAddress);

      const coords = getCoordinatesFromAddress({
        suburb: userProfile.suburb || '',
        city: userProfile.town || '',
        province: userProfile.province || ''
      });
      console.log('Coordinates:', coords);

      const points = await ShippingService.getPickupPoints({
        type: 'locker',
        lat: coords.lat,
        lng: coords.lng,
        order_closest: true
      });

      console.log('Pickup points received:', points);

      if (Array.isArray(points) && points.length > 0) {
        setPickupPoints(points);
        setSelectedPickupPoint(points[0].pickup_point_id);
        console.log('Pickup points loaded successfully:', points.length);
      } else {
        console.error('No pickup points returned');
        setPickupPoints([]);
        setToastMessage('No pickup points available in your area');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error loading pickup points:', error);
      setPickupPoints([]);
      setToastMessage('Failed to load pickup points. Using mock data.');
      setShowToast(true);

      // Set fallback mock data
      setPickupPoints([
        {
          pickup_point_id: 'PL001',
          name: 'PudoLocker - Sandton City',
          address: 'Sandton City Mall, Johannesburg',
          lat: -26.1076,
          lng: 28.0567,
          type: 'locker',
          provider: 'pudo'
        },
        {
          pickup_point_id: 'PL002',
          name: 'PudoLocker - Rosebank',
          address: 'Rosebank Mall, Johannesburg',
          lat: -26.1448,
          lng: 28.0436,
          type: 'locker',
          provider: 'pudo'
        }
      ]);
      setSelectedPickupPoint('PL001');
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
      const parcel: Parcel = {
        parcel_description: `Educational items (${cartItems.length} items)`,
        submitted_length_cm: 40,
        submitted_width_cm: 30,
        submitted_height_cm: 10,
        submitted_weight_kg: Math.max(1, items.length * 0.5),
        packaging: 'Standard flyer'
      };
      const rateRequest = {
        parcels: [parcel],
        collection_min_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        delivery_min_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
        collection_pickup_point_id: 'CG0000',
        collection_pickup_point_provider: 'tcg-locker',
        delivery_pickup_point_id: selectedPickupPoint,
        delivery_pickup_point_provider: 'tcg-locker'
      };
      const rates = await ShippingService.getRates(rateRequest);
      if (Array.isArray(rates)) {
        setShippingRates(rates);
      } else {
        console.error('Invalid shipping rates response:', rates);
        setShippingRates([]);
      }
    } catch (error) {
      setToastMessage('Failed to calculate shipping rates');
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

    if (paymentMethod === 'ozow') {
      try {
        // Initiate Ozow payment via backend
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/payments/ozow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            amount: finalAmount,
            orderId: orderId,
            customerEmail: userProfile.email,
            customerName: userProfile.name || `${userProfile.firstName} ${userProfile.lastName}`,
            description: `Order ${orderId}`
          })
        });

        const data = await response.json();

        if (data.success && data.paymentUrl) {
          // Redirect to Ozow payment page
          window.location.href = data.paymentUrl;
        } else {
          throw new Error(data.message || 'Failed to initiate payment');
        }
      } catch (error: any) {
        console.error('Ozow payment error:', error);
        setToastMessage(`Payment failed: ${error.message}`);
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
                <IonItem key={point.pickup_point_id}>
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
                <IonItem key={rate.service_level_code}>
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
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Payment Method</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonRadioGroup value={paymentMethod} onIonChange={e => setPaymentMethod(e.detail.value)}>
              <IonItem>
                <IonLabel>
                  <h3>Ozow Instant EFT</h3>
                  <p>Secure instant bank transfer</p>
                </IonLabel>
                <IonRadio slot="end" value="ozow" />
              </IonItem>
            </IonRadioGroup>
          </IonCardContent>
        </IonCard>
      )}

      {selectedRate && paymentMethod && (
        <>
          <IonButton 
            expand="block" 
            color="success"
            onClick={processOrder}
            style={{ margin: '16px 0' }}
          >
            <IonIcon icon={cashOutline} slot="start" />
            Pay with Ozow
          </IonButton>
          
          {paymentMethod === 'ozow' && selectedRate && (
            <div style={{ padding: '12px', backgroundColor: '#e8f5e8', borderRadius: '8px', marginBottom: '16px' }}>
              <p style={{ margin: '0', fontSize: '12px', color: '#2d5a2d' }}>
                🛡️ <strong>Escrow Protection:</strong> Payment held until {selectedRate.includes('pudo') ? 'Pudo collection' : 'CourierGuy delivery'} confirmed.
              </p>
            </div>
          )}
        </>
      )}

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