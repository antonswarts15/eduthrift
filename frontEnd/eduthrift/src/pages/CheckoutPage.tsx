import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonButton,
  IonLoading,
  IonToast,
  IonIcon,
  IonSearchbar
} from '@ionic/react';
import { locationOutline, timeOutline, cashOutline, checkmarkCircleOutline, arrowUndoOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import ShippingService, { PickupPoint, ShippingRate } from '../services/shipping';
import { useCartStore } from '../stores/cartStore';
import { useUserStore } from '../stores/userStore';
import { getCoordinatesFromAddress } from '../utils/geocoding';
import { userApi, ordersApi, paymentsApi } from '../services/api';
import AddressModal, { AddressData } from '../components/AddressModal';

const CheckoutPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { cartItems, clearCart } = useCartStore();
  const { userProfile, fetchUserProfile } = useUserStore();


  const locationItems = (location.state as any)?.items;
  const items = Array.isArray(locationItems) ? locationItems :
                Array.isArray(cartItems) ? cartItems : [];

  // Detect if any item in the cart is oversized (requires courier, not locker)
  const isLargeItem = items.some((item: any) => item.largeItem === true);

  // Fetch user profile when the component mounts
  useEffect(() => {
    if (!userProfile) {
      fetchUserProfile();
    }
  }, [userProfile, fetchUserProfile]);

  // Check if address is missing and show modal
  useEffect(() => {
    if (!userProfile) return;
    const missingBasic = !userProfile.suburb && !userProfile.town;
    const missingStreet = isLargeItem && !userProfile.streetAddress;
    if (missingBasic || missingStreet) {
      setShowAddressModal(true);
    }
  }, [userProfile, isLargeItem]);

  // Set up webhook callbacks
const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<string>('');
  const [pickupLocked, setPickupLocked] = useState(false);
  const [pickupSearch, setPickupSearch] = useState('');
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);

  const [selectedRate, setSelectedRate] = useState<string>('');
  const [paymentMethod] = useState<'tradesafe'>('tradesafe');
  
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Calculate totals — Vinted model: buyer pays item + protection fee + shipping
  const totalItemAmount = items.reduce((sum: number, item: any) => sum + item.price, 0);
  const buyerProtectionFee = Math.min(Math.max(totalItemAmount * 0.10, 5), 50);
  const shippingCost = shippingRates.find(rate => rate.service_level_code === selectedRate)?.total_cost || 0;
  const finalAmount = totalItemAmount + buyerProtectionFee + shippingCost;

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

  // Load pickup points only for normal (non-large) items
  useEffect(() => {
    if (!isLargeItem && userProfile && (userProfile.suburb || userProfile.town)) {
      loadNearbyPickupPoints();
    }
  }, [userProfile, isLargeItem]);

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
      let rates: ShippingRate[];
      if (isLargeItem) {
        rates = await ShippingService.getCourierRates(items[0]?.id);
      } else {
        rates = await ShippingService.getRates({
          delivery_pickup_point_id: selectedPickupPoint,
          item_id: items[0]?.id
        });
      }
      if (Array.isArray(rates) && rates.length > 0) {
        setShippingRates(rates);
      } else {
        setShippingRates([]);
        setToastMessage('No shipping rates available. Please check your address and try again.');
        setShowToast(true);
      }
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to calculate shipping rates. Please try again.');
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

    // Group items by seller — each seller = one order + one TradeSafe escrow
    const itemsBySeller = items.reduce((groups: Record<string, any[]>, item: any) => {
      const key = item.sellerId || item.seller_id || 'unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {});

    try {
      const depositUrls: string[] = [];

      for (const sellerItems of Object.values(itemsBySeller)) {
        const sellerShippingCost = shippingRates.find(
          rate => rate.service_level_code === selectedRate
        )?.total_cost || 0;

        // Create one order per seller
        for (const item of sellerItems as any[]) {
          const orderResponse = await ordersApi.createOrder({
            itemId: item.id,
            quantity: 1,
            shippingCost: sellerShippingCost,
            pickupPoint: isLargeItem
              ? 'Courier delivery'
              : (pickupPoints.find(p => p.pickup_point_id === selectedPickupPoint)?.name || selectedPickupPoint),
            deliveryLockerId: isLargeItem ? '' : selectedPickupPoint,
            serviceLevelCode: selectedRate
          });

          const backendOrderNumber = orderResponse.data.orderNumber;
          const paymentResponse = await paymentsApi.initiateTradeSafe(backendOrderNumber);
          const { depositUrl } = paymentResponse.data;
          if (depositUrl) depositUrls.push(depositUrl);
        }
      }

      if (depositUrls.length === 0) throw new Error('No deposit URLs returned');

      // Open the first TradeSafe payment — buyer will complete each one
      // For multi-seller carts, open first URL; remaining handled after return
      await Browser.open({ url: depositUrls[0], presentationStyle: 'popover' });

      App.addListener('resume', () => {
        Browser.close();
        clearCart();
        history.replace('/orders');
      });

      Browser.addListener('browserFinished', () => {
        clearCart();
        history.replace('/orders');
      });

      setLoading(false);

    } catch (error: any) {
      const data = error.response?.data;
      const msg = data?.detail || data?.error || error.message;
      setToastMessage(`Payment failed: ${msg}`);
      setShowToast(true);
      setLoading(false);
    }
  };

  // Derived values for the confirmation summary
  const selectedRateObj = shippingRates.find(r => r.service_level_code === selectedRate) ?? null;
  const lockedPickupPoint = !isLargeItem
    ? pickupPoints.find(p => p.pickup_point_id === selectedPickupPoint) ?? null
    : null;
  const courierAddress = isLargeItem && userProfile
    ? [userProfile.streetAddress, userProfile.suburb, userProfile.town, userProfile.province]
        .filter(Boolean).join(', ')
    : '';

  const serviceLabelFor = (name: string, code: string): string => {
    const s = (name + ' ' + code).toLowerCase();
    if (s.includes('express') || s.includes('exp') || s.includes('overnight') || s.includes('prio')) return 'Express';
    if (s.includes('eco') || s.includes('standard') || s.includes('std') || s.includes('economy')) return 'Standard';
    return name;
  };

  const formatDeliveryDate = (raw: string): string => {
    if (!raw) return '';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
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
              <strong>Subtotal: R{totalItemAmount}</strong>
            </IonLabel>
          </IonItem>
        </IonCardContent>
      </IonCard>

      {isLargeItem ? (
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Courier Delivery</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div style={{ padding: '10px', backgroundColor: '#fff3cd', borderRadius: '8px', marginBottom: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#856404' }}>
                This item is too large for a locker. It will be delivered to your home or business address by courier.
              </p>
            </div>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
              <strong>Delivery address:</strong>
            </p>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
              {userProfile?.streetAddress
                ? `${userProfile.streetAddress}, ${userProfile.suburb || ''}, ${userProfile.town || ''}, ${userProfile.province || ''} ${userProfile.postalCode || ''}`.replace(/,\s*,/g, ',').trim()
                : 'No street address on profile — please update your profile first.'}
            </p>
            {!userProfile?.streetAddress && (
              <IonButton size="small" fill="outline" onClick={() => setShowAddressModal(true)}>
                Add Delivery Address
              </IonButton>
            )}
          </IonCardContent>
        </IonCard>
      ) : (
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Select Pickup Point</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
              <strong>Your area:</strong> {userProfile?.suburb || userProfile?.town || userProfile?.province
                ? `${userProfile.suburb || ''}, ${userProfile.town || ''}, ${userProfile.province || ''}`
                : 'Address not set'}
            </p>
            {pickupPoints.length > 0 ? (
              pickupLocked ? (() => {
                const locked = pickupPoints.find(p => p.pickup_point_id === selectedPickupPoint);
                return locked ? (
                  <>
                    <IonItem lines="none">
                      <IonIcon icon={checkmarkCircleOutline} slot="start" color="success" />
                      <IonLabel>
                        <h3>{locked.name}</h3>
                        <p>{locked.address}</p>
                      </IonLabel>
                    </IonItem>
                    <IonButton fill="outline" size="small" onClick={() => setPickupLocked(false)} style={{ marginTop: '8px' }}>
                      <IonIcon icon={arrowUndoOutline} slot="start" />
                      Change Pickup Point
                    </IonButton>
                  </>
                ) : null;
              })() : (
                <>
                  <IonSearchbar
                    value={pickupSearch}
                    onIonInput={e => setPickupSearch((e.target as HTMLIonSearchbarElement).value || '')}
                    placeholder="Search pickup points..."
                    style={{ padding: '0 0 8px 0' }}
                  />
                  {pickupPoints
                    .filter(p =>
                      !pickupSearch ||
                      p.name.toLowerCase().includes(pickupSearch.toLowerCase()) ||
                      p.address.toLowerCase().includes(pickupSearch.toLowerCase())
                    )
                    .map((point, index) => {
                      const isPickupSelected = selectedPickupPoint === point.pickup_point_id;
                      return (
                        <IonItem
                          key={point.pickup_point_id}
                          button
                          detail={false}
                          onClick={() => { setSelectedPickupPoint(point.pickup_point_id); setPickupLocked(true); }}
                          style={{
                            '--background': isPickupSelected ? 'var(--ion-color-primary)' : '',
                            '--border-radius': '8px',
                            marginBottom: '6px',
                          }}
                        >
                          <IonIcon icon={locationOutline} slot="start" style={{ color: isPickupSelected ? '#fff' : undefined }} />
                          <IonLabel style={{ color: isPickupSelected ? '#fff' : undefined }}>
                            <h3 style={{ color: isPickupSelected ? '#fff' : undefined }}>
                              {point.name}{index === 0 && !pickupSearch ? ' (Nearest)' : ''}
                            </h3>
                            <p style={{ color: isPickupSelected ? 'rgba(255,255,255,0.8)' : undefined }}>
                              {point.address}
                            </p>
                          </IonLabel>
                          {isPickupSelected && (
                            <IonIcon icon={checkmarkCircleOutline} slot="end" style={{ color: '#fff' }} />
                          )}
                        </IonItem>
                      );
                    })}
                </>
              )
            ) : (
              <p style={{ color: '#666', fontSize: '14px' }}>No pickup points found near your address.</p>
            )}
          </IonCardContent>
        </IonCard>
      )}

      {/* Calculate Shipping — shown until rates are loaded */}
      {shippingRates.length === 0 && (
        <IonButton
          expand="block"
          onClick={calculateShipping}
          disabled={isLargeItem ? !userProfile?.streetAddress : !selectedPickupPoint || !pickupLocked}
          style={{ margin: '16px 0' }}
        >
          {isLargeItem ? 'Get Courier Rates' : 'Calculate Shipping'}
        </IonButton>
      )}

      {/* Shipping service selection */}
      {shippingRates.length > 0 && (
        <IonCard>
          <IonCardHeader style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <IonCardTitle>Shipping Service</IonCardTitle>
            <IonButton
              fill="clear"
              size="small"
              onClick={() => { setShippingRates([]); setSelectedRate(''); }}
              style={{ fontSize: '12px' }}
            >
              <IonIcon icon={arrowUndoOutline} slot="start" />
              Recalculate
            </IonButton>
          </IonCardHeader>
          <IonCardContent>
            {shippingRates.map(rate => {
              const isSelected = selectedRate === rate.service_level_code;
              return (
                <IonItem
                  key={rate.service_level_code}
                  button
                  detail={false}
                  onClick={() => setSelectedRate(rate.service_level_code)}
                  style={{
                    '--background': isSelected ? 'var(--ion-color-primary)' : '',
                    '--color': isSelected ? '#fff' : '',
                    '--border-radius': '8px',
                    marginBottom: '6px',
                  }}
                >
                  <IonIcon icon={timeOutline} slot="start" style={{ color: isSelected ? '#fff' : undefined }} />
                  <IonLabel style={{ color: isSelected ? '#fff' : undefined }}>
                    <h3>{serviceLabelFor(rate.service_level_name, rate.service_level_code)} Delivery</h3>
                    <p style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : undefined }}>
                      {rate.delivery_date ? `Est. delivery: ${formatDeliveryDate(rate.delivery_date)}` : rate.service_level_name}
                    </p>
                  </IonLabel>
                  <IonLabel slot="end">
                    <strong style={{ color: isSelected ? '#fff' : undefined }}>R{rate.total_cost}</strong>
                  </IonLabel>
                  {isSelected && (
                    <IonIcon icon={checkmarkCircleOutline} slot="end" style={{ color: '#fff' }} />
                  )}
                </IonItem>
              );
            })}
          </IonCardContent>
        </IonCard>
      )}

      {/* Order confirmation summary — shown once a service is selected */}
      {selectedRate && selectedRateObj && (
        <>
          <IonCard style={{ border: '2px solid var(--ion-color-primary)', borderRadius: '12px' }}>
            <IonCardHeader>
              <IonCardTitle>Confirm Your Order</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>

              {/* Delivery destination */}
              <IonItem lines="none" style={{ '--padding-start': '0' }}>
                <IonIcon icon={locationOutline} slot="start" color="primary" />
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#888', margin: '0 0 2px' }}>
                    {isLargeItem ? 'COURIER DELIVERY TO' : 'PUDO LOCKER'}
                  </p>
                  <h3 style={{ margin: 0 }}>
                    {isLargeItem ? 'Home / Business Address' : lockedPickupPoint?.name}
                  </h3>
                  <p style={{ margin: 0 }}>
                    {isLargeItem ? courierAddress : lockedPickupPoint?.address}
                  </p>
                </IonLabel>
              </IonItem>

              {/* Service level */}
              <IonItem lines="none" style={{ '--padding-start': '0' }}>
                <IonIcon icon={timeOutline} slot="start" color="primary" />
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#888', margin: '0 0 2px' }}>SHIPPING SERVICE</p>
                  <h3 style={{ margin: 0 }}>
                    {serviceLabelFor(selectedRateObj.service_level_name, selectedRateObj.service_level_code)} Delivery
                  </h3>
                  <p style={{ margin: 0 }}>
                    {selectedRateObj.delivery_date
                      ? `Est. delivery: ${formatDeliveryDate(selectedRateObj.delivery_date)}`
                      : selectedRateObj.service_level_name}
                  </p>
                </IonLabel>
              </IonItem>

              {/* Cost breakdown */}
              <div style={{ borderTop: '1px solid #eee', marginTop: '12px', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                  <span style={{ color: '#555' }}>Items</span>
                  <span>R{totalItemAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                  <span style={{ color: '#555' }}>Buyer Protection Fee</span>
                  <span>R{buyerProtectionFee.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                  <span style={{ color: '#555' }}>Shipping (Pudo)</span>
                  <span>R{shippingCost.toFixed(2)}</span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '17px', fontWeight: '700',
                  borderTop: '1px solid #ddd', paddingTop: '10px', marginTop: '6px'
                }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--ion-color-primary)' }}>R{finalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Fee explanation */}
              <div style={{ marginTop: '14px', padding: '10px 12px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#2d5a2d', lineHeight: '1.5' }}>
                  <strong>✅ Zero seller fees:</strong> The seller receives the full item price of R{totalItemAmount.toFixed(2)}.
                </p>
                <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#2d5a2d', lineHeight: '1.5' }}>
                  <strong>🔒 Buyer Protection Fee (R{buyerProtectionFee.toFixed(2)}):</strong> Covers TradeSafe escrow and platform costs. Your payment is held safely until you confirm delivery.
                </p>
                <p style={{ margin: '0', fontSize: '12px', color: '#2d5a2d', lineHeight: '1.5' }}>
                  <strong>📦 Shipping (R{shippingCost.toFixed(2)}):</strong> Paid directly to Pudo for delivery to your selected locker.
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
            Proceed to Payment
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
          province: userProfile?.province,
          postalCode: userProfile?.postalCode
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