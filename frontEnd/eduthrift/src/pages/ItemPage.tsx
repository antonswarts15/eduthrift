import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonButtons,
  IonBackButton, IonButton, IonIcon, IonCard, IonCardContent, IonBadge,
  IonToast, IonModal, IonSpinner
} from '@ionic/react';
import { cartOutline, checkmarkCircleOutline, closeCircleOutline, closeOutline, imageOutline } from 'ionicons/icons';
import { useListingsStore } from '../stores/listingsStore';
import { useCartStore } from '../stores/cartStore';
import { useToast } from '../hooks/useToast';
import { itemsApi } from '../services/api';
import { Listing } from '../stores/listingsStore';

const BUNDLE_MINIMUM = 500;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const toAbsoluteUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${API_BASE_URL}${path}`;
};

const mapSellerItem = (item: any): Listing => ({
  id: item.id.toString(),
  name: item.item_name || item.name || 'Unknown Item',
  description: item.description || '',
  price: parseFloat(item.price),
  condition: item.condition_grade || 3,
  school: item.school_name || item.club_name || '',
  size: item.size || 'Standard',
  gender: item.gender || 'Unisex',
  category: item.category || '',
  subcategory: item.subcategory || undefined,
  sport: item.sport || undefined,
  frontPhoto: toAbsoluteUrl(item.front_photo),
  backPhoto: toAbsoluteUrl(item.back_photo),
  dateCreated: item.created_at ? new Date(item.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
  quantity: item.quantity || 1,
  soldOut: item.sold_out || item.quantity === 0 || item.status === 'sold',
  expiryDate: item.expiry_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  isExpired: item.is_expired || false,
  largeItem: item.large_item || false,
  sellerId: item.user_id?.toString() || item.seller_id?.toString() || undefined,
  sellerAlias: item.seller_alias || item.seller_name || undefined,
});

const ItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { getListingById, fetchListingById, decreaseQuantity } = useListingsStore();
  const { addToCart, cartItems } = useCartStore();
  const { isOpen, message, color, showToast, hideToast } = useToast();

  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);
  const [zoomLabel, setZoomLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchedListing, setFetchedListing] = useState<any>(null);
  const [sellerItems, setSellerItems] = useState<Listing[]>([]);
  const [mainQty, setMainQty] = useState(1);
  const [sellerQtys, setSellerQtys] = useState<Record<string, number>>({});

  const storeListing = getListingById(id);
  const listing = storeListing || fetchedListing;

  // Fetch from API if not in store
  useEffect(() => {
    if (!storeListing && id) {
      setLoading(true);
      fetchListingById(id).then((result) => {
        setFetchedListing(result);
        setLoading(false);
      });
    }
  }, [id, storeListing]);

  // Fetch other items from the same seller
  useEffect(() => {
    if (id) {
      itemsApi.getSellerItems(id)
        .then((response) => {
          const items: Listing[] = response.data
            .map(mapSellerItem)
            .filter((item: Listing) => item.id !== id && !item.soldOut && !item.isExpired);
          setSellerItems(items);
          const initial: Record<string, number> = {};
          items.forEach(item => { initial[item.id] = 1; });
          setSellerQtys(initial);
        })
        .catch(() => {
          // Silently ignore — seller items section simply won't appear
        });
    }
  }, [id]);

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/buyer" />
            </IonButtons>
            <IonTitle>Loading...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <IonSpinner />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!listing) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/buyer" />
            </IonButtons>
            <IonTitle>Item Not Found</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <h2>Item not found</h2>
            <p>The item you're looking for doesn't exist.</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const buildCartItem = (item: any, selectedQuantity: number) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    condition: item.condition,
    school: item.school,
    size: item.size,
    gender: item.gender,
    category: item.category,
    subcategory: item.subcategory,
    sport: item.sport,
    frontPhoto: item.frontPhoto,
    backPhoto: item.backPhoto,
    quantity: item.quantity,
    selectedQuantity,
    sellerId: item.sellerId || item.userId || item.seller_id,
    sellerAlias: item.sellerAlias || item.seller_alias,
    largeItem: item.largeItem || item.large_item || false
  });

  const handleAddToCart = () => {
    if (listing.soldOut || listing.quantity === 0) {
      showToast('This item is sold out!', 'danger');
      return;
    }
    addToCart(buildCartItem(listing, mainQty), showToast);
    decreaseQuantity(listing.id);
  };

  const handleAddSellerItemToCart = (item: Listing) => {
    const qty = sellerQtys[item.id] ?? 1;
    addToCart(buildCartItem(item, qty), showToast);
    decreaseQuantity(item.id);
  };

  const getConditionText = (condition: number) => {
    switch (condition) {
      case 1: return 'Brand new (never been used)';
      case 2: return 'Like new but used';
      case 3: return 'Frequently used but not damaged';
      case 4: return 'Used and worn';
      default: return 'Unknown condition';
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/buyer" />
          </IonButtons>
          <IonTitle>{listing.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '16px' }}>
          <IonCard>
            <IonCardContent>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h1 style={{ margin: '0', fontSize: '24px' }}>{listing.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {listing.soldOut || listing.quantity === 0 ? (
                    <IonBadge color="danger">
                      <IonIcon icon={closeCircleOutline} style={{ marginRight: '4px' }} />
                      Sold Out
                    </IonBadge>
                  ) : (
                    <IonBadge color="success">
                      <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '4px' }} />
                      {listing.quantity} left
                    </IonBadge>
                  )}
                </div>
              </div>
              
              {/* Photo display */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => { if (listing.frontPhoto) { setZoomPhoto(listing.frontPhoto); setZoomLabel('Front'); } }}>
                  {listing.frontPhoto && listing.frontPhoto !== 'Front Photo' ? (
                    <img
                      src={listing.frontPhoto}
                      alt="Front"
                      style={{
                        width: '140px', height: '170px', objectFit: 'cover',
                        borderRadius: '8px', border: '2px solid #ddd'
                      }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{
                      width: '140px', height: '170px', backgroundColor: '#f0f0f0', border: '2px solid #ddd',
                      borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column', gap: '4px'
                    }}>
                      <IonIcon icon={imageOutline} style={{ fontSize: '32px', color: '#999' }} />
                      <span style={{ fontSize: '12px', color: '#999' }}>No photo</span>
                    </div>
                  )}
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>Front</p>
                </div>
                <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => { if (listing.backPhoto) { setZoomPhoto(listing.backPhoto); setZoomLabel('Back'); } }}>
                  {listing.backPhoto && listing.backPhoto !== 'Back Photo' ? (
                    <img
                      src={listing.backPhoto}
                      alt="Back"
                      style={{
                        width: '140px', height: '170px', objectFit: 'cover',
                        borderRadius: '8px', border: '2px solid #ddd'
                      }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{
                      width: '140px', height: '170px', backgroundColor: '#f0f0f0', border: '2px solid #ddd',
                      borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column', gap: '4px'
                    }}>
                      <IonIcon icon={imageOutline} style={{ fontSize: '32px', color: '#999' }} />
                      <span style={{ fontSize: '12px', color: '#999' }}>No photo</span>
                    </div>
                  )}
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>Back</p>
                </div>
              </div>
              <p style={{ textAlign: 'center', fontSize: '11px', color: '#aaa', margin: '0 0 8px' }}>Tap photo to enlarge</p>
              
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '28px', color: '#004aad', margin: '0' }}>R{listing.price}</h2>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '16px', lineHeight: '1.5' }}>{listing.description}</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#666' }}>School</p>
                  <p style={{ margin: '0', fontSize: '14px' }}>{listing.school}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#666' }}>Size</p>
                  <p style={{ margin: '0', fontSize: '14px' }}>{listing.size}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#666' }}>Gender</p>
                  <p style={{ margin: '0', fontSize: '14px' }}>{listing.gender}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#666' }}>Condition</p>
                  <p style={{ margin: '0', fontSize: '14px' }}>{getConditionText(listing.condition)}</p>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#666' }}>Category</p>
                <p style={{ margin: '0', fontSize: '14px' }}>
                  {listing.category}
                  {listing.subcategory && ` > ${listing.subcategory}`}
                  {listing.sport && ` > ${listing.sport}`}
                </p>
              </div>

              {/* Quantity stepper */}
              {!listing.soldOut && listing.quantity > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold', color: '#666' }}>Quantity:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IonButton size="small" fill="outline" onClick={() => setMainQty(q => Math.max(1, q - 1))} disabled={mainQty <= 1}>−</IonButton>
                    <span style={{ minWidth: '24px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}>{mainQty}</span>
                    <IonButton size="small" fill="outline" onClick={() => setMainQty(q => Math.min(listing.quantity, q + 1))} disabled={mainQty >= listing.quantity}>+</IonButton>
                  </div>
                  <span style={{ fontSize: '13px', color: '#888' }}>{listing.quantity} available</span>
                </div>
              )}

            </IonCardContent>
          </IonCard>
        </div>

        {/* More from this seller */}
        {sellerItems.length > 0 && (
          <div style={{ padding: '0 16px 16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
              More from this seller
            </h2>
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#666' }}>
              Add multiple items from the same seller to save on delivery costs.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sellerItems.map((item) => {
                const alreadyInCart = cartItems.some(c => c.id === item.id);
                return (
                  <IonCard key={item.id} style={{ margin: 0 }}>
                    <IonCardContent style={{ padding: '10px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {item.frontPhoto ? (
                          <img
                            src={item.frontPhoto}
                            alt={item.name}
                            style={{ width: '64px', height: '78px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd', flexShrink: 0 }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ width: '64px', height: '78px', backgroundColor: '#f0f0f0', borderRadius: '6px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <IonIcon icon={imageOutline} style={{ fontSize: '24px', color: '#999' }} />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: '0 0 2px', fontWeight: 'bold', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                          <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#666' }}>{item.school} · {item.size}</p>
                          <p style={{ margin: '0 0 6px', fontSize: '16px', color: '#004aad', fontWeight: 'bold' }}>R{item.price}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <IonButton size="small" fill="outline" style={{ '--padding-start': '6px', '--padding-end': '6px' }}
                              onClick={() => setSellerQtys(q => ({ ...q, [item.id]: Math.max(1, (q[item.id] ?? 1) - 1) }))}
                              disabled={(sellerQtys[item.id] ?? 1) <= 1}>−</IonButton>
                            <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '15px', fontWeight: 'bold' }}>{sellerQtys[item.id] ?? 1}</span>
                            <IonButton size="small" fill="outline" style={{ '--padding-start': '6px', '--padding-end': '6px' }}
                              onClick={() => setSellerQtys(q => ({ ...q, [item.id]: Math.min(item.quantity, (q[item.id] ?? 1) + 1) }))}
                              disabled={(sellerQtys[item.id] ?? 1) >= item.quantity}>+</IonButton>
                            <span style={{ fontSize: '12px', color: '#888' }}>{item.quantity} available</span>
                          </div>
                          <IonButton
                            size="small"
                            expand="block"
                            disabled={alreadyInCart}
                            onClick={() => handleAddSellerItemToCart(item)}
                          >
                            <IonIcon icon={cartOutline} slot="start" />
                            {alreadyInCart ? 'In Cart' : 'Add to Cart'}
                          </IonButton>
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Add to Cart button */}
        <div style={{ padding: '0 16px 24px' }}>
          <IonButton
            expand="full"
            size="large"
            onClick={handleAddToCart}
            disabled={listing.soldOut || listing.quantity === 0}
          >
            <IonIcon icon={cartOutline} slot="start" />
            {listing.soldOut || listing.quantity === 0 ? 'Sold Out' : 'Add to Cart'}
          </IonButton>
        </div>

        <IonToast
          isOpen={isOpen}
          onDidDismiss={hideToast}
          message={message}
          duration={3000}
          position="bottom"
          color={color}
        />

        {/* Photo zoom modal */}
        <IonModal isOpen={!!zoomPhoto} onDidDismiss={() => setZoomPhoto(null)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{zoomLabel} Photo</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setZoomPhoto(null)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '100%', padding: '16px', backgroundColor: '#000'
            }}>
              {zoomPhoto && (
                <img
                  src={zoomPhoto}
                  alt={`${zoomLabel} photo`}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              )}
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default ItemPage;