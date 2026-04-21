import React, { useState, useEffect } from 'react';
import {
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel,
  IonButton, IonLoading, IonToast, IonIcon, IonSearchbar, IonRadioGroup, IonRadio
} from '@ionic/react';
import { locationOutline, cubeOutline, cashOutline, checkmarkCircleOutline, arrowUndoOutline, cardOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import ShippingService, { PickupPoint, PUDO_BOX_SIZES } from '../services/shipping';
import { useCartStore } from '../stores/cartStore';
import { useUserStore } from '../stores/userStore';
import { getCoordinatesFromAddress } from '../utils/geocoding';
import { getBundleShippingAdvice, BundleShippingAdvice } from '../utils/shippingEstimator';
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

  const isLargeItem = items.some((item: any) => item.largeItem === true);

  // Estimate bundle weight and size to recommend box or courier
  const shippingAdvice: BundleShippingAdvice = getBundleShippingAdvice(items);
  const requiresCourier = isLargeItem || shippingAdvice.isCourierRequired;

  useEffect(() => {
    if (!userProfile) fetchUserProfile();
  }, [userProfile, fetchUserProfile]);

  useEffect(() => {
    if (!userProfile) return;
    const missingBasic = !userProfile.suburb && !userProfile.town;
    const missingStreet = requiresCourier && !userProfile.streetAddress;
    if (missingBasic || missingStreet) setShowAddressModal(true);
  }, [userProfile, requiresCourier]);

  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<string>('');
  const [pickupLocked, setPickupLocked] = useState(false);
  const [pickupSearch, setPickupSearch] = useState('');
  const [selectedBoxSize, setSelectedBoxSize] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'ozow' | 'paystack'>('ozow');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);

  const totalItemAmount = items.reduce((sum: number, item: any) => sum + item.price, 0);
  const buyerProtectionFee = Math.min(Math.max(totalItemAmount * 0.10, 5), 75);
  const selectedBox = PUDO_BOX_SIZES.find(b => b.service_level_code === selectedBoxSize) ?? null;
  const shippingCost = selectedBox?.total_cost || 0;
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
    if (!userProfile?.suburb && !userProfile?.town) return;
    try {
      setLoading(true);
      const coords = getCoordinatesFromAddress({
        suburb: userProfile.suburb || '',
        city: userProfile.town || '',
        province: userProfile.province || ''
      });
      const points = await ShippingService.getPickupPoints({
        type: 'locker', lat: coords.lat, lng: coords.lng, order_closest: true
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
      setToastMessage('Could not load pickup points. Please check your address.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!requiresCourier && userProfile && (userProfile.suburb || userProfile.town)) {
      loadNearbyPickupPoints();
    }
  }, [userProfile, requiresCourier]);

  if (!items || items.length === 0) {
    return (
      <div style={{ padding: '16px' }}>
        <IonCard><IonCardContent>
          <p>No items in cart. Please add items before checkout.</p>
          <IonButton expand="block" onClick={() => history.push('/buyer')}>Browse Items</IonButton>
        </IonCardContent></IonCard>
      </div>
    );
  }

  const processOrder = async () => {
    if (!selectedBoxSize) {
      setToastMessage('Please select a Pudo box size');
      setShowToast(true);
      return;
    }
    if (!selectedPickupPoint && !requiresCourier) {
      setToastMessage('Please select a pickup point');
      setShowToast(true);
      return;
    }
    if (!userProfile) {
      setToastMessage('You must be logged in to place an order.');
      setShowToast(true);
      return;
    }

    setLoading(true);

    const itemsBySeller = items.reduce((groups: Record<string, any[]>, item: any) => {
      const key = item.sellerId || item.seller_id || 'unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {});

    try {
      const depositUrls: string[] = [];

      for (const sellerItems of Object.values(itemsBySeller)) {
        const itemIds = (sellerItems as any[]).map((i: any) => parseInt(i.id));
        const orderResponse = await ordersApi.createOrder({
          itemIds,
          shippingCost,
          pickupPoint: requiresCourier
            ? 'Courier delivery'
            : (pickupPoints.find(p => p.pickup_point_id === selectedPickupPoint)?.name || selectedPickupPoint),
          deliveryLockerId: requiresCourier ? '' : selectedPickupPoint,
          serviceLevelCode: selectedBoxSize
        });

        const backendOrderNumber = orderResponse.data.orderNumber;
        const paymentResponse = paymentMethod === 'paystack'
          ? await paymentsApi.initiatePaystack(backendOrderNumber)
          : await paymentsApi.initiateOzow(backendOrderNumber);
        const redirectUrl = paymentResponse.data.authorizationUrl || paymentResponse.data.paymentUrl;
        if (redirectUrl) depositUrls.push(redirectUrl);
      }

      if (depositUrls.length === 0) throw new Error('No deposit URLs returned');

      await Browser.open({ url: depositUrls[0], presentationStyle: 'popover' });

      App.addListener('resume', () => { Browser.close(); clearCart(); history.replace('/orders'); });
      Browser.addListener('browserFinished', () => { clearCart(); history.replace('/orders'); });

      setLoading(false);
    } catch (error: any) {
      const data = error.response?.data;
      const msg = data?.detail || data?.error || error.message;
      setToastMessage(`Payment failed: ${msg}`);
      setShowToast(true);
      setLoading(false);
    }
  };

  const lockedPickupPoint = pickupPoints.find(p => p.pickup_point_id === selectedPickupPoint) ?? null;

  return (
    <div style={{ padding: '16px' }}>
      <h2>Checkout</h2>

      {/* Order Summary */}
      <IonCard>
        <IonCardHeader><IonCardTitle>Order Summary</IonCardTitle></IonCardHeader>
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
            <IonLabel><strong>Items Total: R{totalItemAmount.toFixed(2)}</strong></IonLabel>
          </IonItem>
        </IonCardContent>
      </IonCard>

      {/* Shipping Estimate Banner */}
      <IonCard style={{ border: `2px solid ${requiresCourier ? '#e74c3c' : '#27ae60'}`, borderRadius: '10px' }}>
        <IonCardContent style={{ padding: '14px' }}>
          <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '14px', color: requiresCourier ? '#c0392b' : '#27ae60' }}>
            {requiresCourier ? '🚚 Courier Required' : `📦 Estimated Bundle Weight: ~${shippingAdvice.totalWeightKg}kg`}
          </p>
          {requiresCourier ? (
            <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{shippingAdvice.courierReason}</p>
          ) : (
            <>
              <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#555' }}>
                Recommended box: <strong>{shippingAdvice.recommendedBox?.service_level_name}</strong> (up to {shippingAdvice.recommendedBox?.max_weight_kg}kg) — R{shippingAdvice.recommendedBox?.total_cost}
              </p>
              {shippingAdvice.warningMessage && (
                <p style={{ margin: 0, fontSize: '12px', color: '#e67e22' }}>⚠️ {shippingAdvice.warningMessage}</p>
              )}
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>
                Weight is estimated based on item types. You can still select a larger box if needed.
              </p>
            </>
          )}
        </IonCardContent>
      </IonCard>

      {/* Pickup Point Selection */}
      {!requiresCourier && (
        <IonCard>
          <IonCardHeader><IonCardTitle>Select Pudo Locker</IonCardTitle></IonCardHeader>
          <IonCardContent>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#666' }}>
              Your area: {[userProfile?.suburb, userProfile?.town, userProfile?.province].filter(Boolean).join(', ') || 'Address not set'}
            </p>
            {pickupPoints.length > 0 ? (
              pickupLocked ? (
                <>
                  <IonItem lines="none">
                    <IonIcon icon={checkmarkCircleOutline} slot="start" color="success" />
                    <IonLabel>
                      <h3>{lockedPickupPoint?.name}</h3>
                      <p>{lockedPickupPoint?.address}</p>
                    </IonLabel>
                  </IonItem>
                  <IonButton fill="outline" size="small" onClick={() => setPickupLocked(false)} style={{ marginTop: '8px' }}>
                    <IonIcon icon={arrowUndoOutline} slot="start" /> Change Locker
                  </IonButton>
                </>
              ) : (
                <>
                  <IonSearchbar
                    value={pickupSearch}
                    onIonInput={e => setPickupSearch((e.target as HTMLIonSearchbarElement).value || '')}
                    placeholder="Search lockers..."
                    style={{ padding: '0 0 8px 0' }}
                  />
                  {pickupPoints
                    .filter(p => !pickupSearch ||
                      p.name.toLowerCase().includes(pickupSearch.toLowerCase()) ||
                      p.address.toLowerCase().includes(pickupSearch.toLowerCase()))
                    .map((point, index) => {
                      const isSelected = selectedPickupPoint === point.pickup_point_id;
                      return (
                        <IonItem key={point.pickup_point_id} button detail={false}
                          onClick={() => { setSelectedPickupPoint(point.pickup_point_id); setPickupLocked(true); }}
                          style={{ '--background': isSelected ? 'var(--ion-color-primary)' : '', '--border-radius': '8px', marginBottom: '6px' }}
                        >
                          <IonIcon icon={locationOutline} slot="start" style={{ color: isSelected ? '#fff' : undefined }} />
                          <IonLabel style={{ color: isSelected ? '#fff' : undefined }}>
                            <h3 style={{ color: isSelected ? '#fff' : undefined }}>
                              {point.name}{index === 0 && !pickupSearch ? ' (Nearest)' : ''}
                            </h3>
                            <p style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : undefined }}>{point.address}</p>
                          </IonLabel>
                          {isSelected && <IonIcon icon={checkmarkCircleOutline} slot="end" style={{ color: '#fff' }} />}
                        </IonItem>
                      );
                    })}
                </>
              )
            ) : (
              <p style={{ color: '#666', fontSize: '14px' }}>No lockers found near your address.</p>
            )}
          </IonCardContent>
        </IonCard>
      )}

      {/* Courier delivery for large/bulky items */}
      {requiresCourier && (
        <IonCard>
          <IonCardHeader><IonCardTitle>Courier Delivery</IonCardTitle></IonCardHeader>
          <IonCardContent>
            <div style={{ padding: '10px', backgroundColor: '#fff3cd', borderRadius: '8px', marginBottom: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#856404' }}>
                This item is too large for a locker and will be delivered by courier to your address.
              </p>
            </div>
            <p style={{ margin: '0', fontSize: '14px' }}>
              {userProfile?.streetAddress
                ? `${userProfile.streetAddress}, ${userProfile.suburb || ''}, ${userProfile.town || ''}, ${userProfile.province || ''}`.replace(/,\s*,/g, ',').trim()
                : 'No street address — please update your profile first.'}
            </p>
            {!userProfile?.streetAddress && (
              <IonButton size="small" fill="outline" onClick={() => setShowAddressModal(true)} style={{ marginTop: '8px' }}>
                Add Delivery Address
              </IonButton>
            )}
          </IonCardContent>
        </IonCard>
      )}

      {/* Pudo Box Size Selection */}
      {(pickupLocked || requiresCourier) && (
        <IonCard>
          <IonCardHeader><IonCardTitle>Select Box Size</IonCardTitle></IonCardHeader>
          <IonCardContent>
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#666' }}>
              Choose the box size that fits your items. All prices are locker-to-locker, anywhere in South Africa.
            </p>
            {PUDO_BOX_SIZES.map(box => {
              const isSelected = selectedBoxSize === box.service_level_code;
              return (
                <IonItem key={box.service_level_code} button detail={false}
                  onClick={() => setSelectedBoxSize(box.service_level_code)}
                  style={{
                    '--background': isSelected ? 'var(--ion-color-primary)' : '',
                    '--border-radius': '8px',
                    marginBottom: '8px'
                  }}
                >
                  <IonIcon icon={cubeOutline} slot="start" style={{ color: isSelected ? '#fff' : undefined }} />
                  <IonLabel style={{ color: isSelected ? '#fff' : undefined }}>
                    <h3 style={{ color: isSelected ? '#fff' : undefined, margin: '0 0 2px' }}>
                      {box.service_level_name} — up to {box.max_weight_kg}kg
                    </h3>
                    <p style={{ color: isSelected ? 'rgba(255,255,255,0.85)' : '#666', margin: '0 0 2px', fontSize: '12px' }}>
                      {box.dimensions}
                    </p>
                    <p style={{ color: isSelected ? 'rgba(255,255,255,0.75)' : '#888', margin: 0, fontSize: '12px' }}>
                      {box.description}
                    </p>
                  </IonLabel>
                  <div slot="end" style={{ textAlign: 'right' }}>
                    <strong style={{ color: isSelected ? '#fff' : 'var(--ion-color-primary)', fontSize: '16px' }}>
                      R{box.total_cost}
                    </strong>
                    {isSelected && <IonIcon icon={checkmarkCircleOutline} style={{ color: '#fff', display: 'block', marginTop: '4px' }} />}
                  </div>
                </IonItem>
              );
            })}
          </IonCardContent>
        </IonCard>
      )}

      {/* Payment Method Selection */}
      {(pickupLocked || requiresCourier) && selectedBoxSize && (
        <IonCard>
          <IonCardHeader><IonCardTitle>Payment Method</IonCardTitle></IonCardHeader>
          <IonCardContent>
            <IonRadioGroup value={paymentMethod} onIonChange={e => setPaymentMethod(e.detail.value)}>
              <IonItem button detail={false}
                onClick={() => setPaymentMethod('ozow')}
                style={{ '--background': paymentMethod === 'ozow' ? 'var(--ion-color-primary)' : '', '--border-radius': '8px', marginBottom: '8px' }}
              >
                <IonIcon icon={cashOutline} slot="start" style={{ color: paymentMethod === 'ozow' ? '#fff' : undefined }} />
                <IonLabel style={{ color: paymentMethod === 'ozow' ? '#fff' : undefined }}>
                  <h3 style={{ color: paymentMethod === 'ozow' ? '#fff' : undefined }}>Instant EFT (Ozow)</h3>
                  <p style={{ color: paymentMethod === 'ozow' ? 'rgba(255,255,255,0.8)' : '#666', fontSize: '12px' }}>
                    Pay directly from your bank account — no card needed
                  </p>
                </IonLabel>
                <IonRadio value="ozow" slot="end" style={{ color: paymentMethod === 'ozow' ? '#fff' : undefined }} />
              </IonItem>
              <IonItem button detail={false}
                onClick={() => setPaymentMethod('paystack')}
                style={{ '--background': paymentMethod === 'paystack' ? 'var(--ion-color-primary)' : '', '--border-radius': '8px' }}
              >
                <IonIcon icon={cardOutline} slot="start" style={{ color: paymentMethod === 'paystack' ? '#fff' : undefined }} />
                <IonLabel style={{ color: paymentMethod === 'paystack' ? '#fff' : undefined }}>
                  <h3 style={{ color: paymentMethod === 'paystack' ? '#fff' : undefined }}>Card Payment (Paystack)</h3>
                  <p style={{ color: paymentMethod === 'paystack' ? 'rgba(255,255,255,0.8)' : '#666', fontSize: '12px' }}>
                    Visa, Mastercard or bank card
                  </p>
                </IonLabel>
                <IonRadio value="paystack" slot="end" style={{ color: paymentMethod === 'paystack' ? '#fff' : undefined }} />
              </IonItem>
            </IonRadioGroup>
          </IonCardContent>
        </IonCard>
      )}

      {/* Order Confirmation Summary */}
      {selectedBoxSize && selectedBox && (pickupLocked || requiresCourier) && (
        <>
          <IonCard style={{ border: '2px solid var(--ion-color-primary)', borderRadius: '12px' }}>
            <IonCardHeader><IonCardTitle>Confirm Your Order</IonCardTitle></IonCardHeader>
            <IonCardContent>

              <IonItem lines="none" style={{ '--padding-start': '0' }}>
                <IonIcon icon={locationOutline} slot="start" color="primary" />
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#888', margin: '0 0 2px' }}>
                    {requiresCourier ? 'COURIER DELIVERY TO' : 'PUDO LOCKER'}
                  </p>
                  <h3 style={{ margin: 0 }}>{requiresCourier ? 'Home / Business Address' : lockedPickupPoint?.name}</h3>
                  <p style={{ margin: 0 }}>{requiresCourier
                    ? [userProfile?.streetAddress, userProfile?.suburb, userProfile?.town, userProfile?.province].filter(Boolean).join(', ')
                    : lockedPickupPoint?.address}
                  </p>
                </IonLabel>
              </IonItem>

              <IonItem lines="none" style={{ '--padding-start': '0' }}>
                <IonIcon icon={cubeOutline} slot="start" color="primary" />
                <IonLabel>
                  <p style={{ fontSize: '11px', color: '#888', margin: '0 0 2px' }}>PUDO BOX SIZE</p>
                  <h3 style={{ margin: 0 }}>{selectedBox.service_level_name} — up to {selectedBox.max_weight_kg}kg</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{selectedBox.dimensions} · {selectedBox.description}</p>
                </IonLabel>
              </IonItem>

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
                  <span style={{ color: '#555' }}>Pudo Shipping ({selectedBox.service_level_name})</span>
                  <span>R{shippingCost.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: '700', borderTop: '1px solid #ddd', paddingTop: '10px', marginTop: '6px' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--ion-color-primary)' }}>R{finalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ marginTop: '14px', padding: '10px 12px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#2d5a2d', lineHeight: '1.5' }}>
                  <strong>✅ Zero seller fees:</strong> Seller receives the full R{totalItemAmount.toFixed(2)}.
                </p>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#2d5a2d', lineHeight: '1.5' }}>
                  <strong>🔒 Buyer Protection (R{buyerProtectionFee.toFixed(2)}):</strong> Held in escrow until you confirm delivery.
                </p>
                <p style={{ margin: '0', fontSize: '12px', color: '#2d5a2d', lineHeight: '1.5' }}>
                  <strong>📦 Pudo Shipping (R{shippingCost.toFixed(2)}):</strong> Locker-to-locker, anywhere in South Africa.
                </p>
              </div>
            </IonCardContent>
          </IonCard>

          <IonButton expand="block" color="success" onClick={processOrder} style={{ margin: '16px 0' }}>
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
      <IonToast isOpen={showToast} message={toastMessage} duration={3000} onDidDismiss={() => setShowToast(false)} />
    </div>
  );
};

export default CheckoutPage;
