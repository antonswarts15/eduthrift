import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonButtons,
  IonBackButton, IonButton, IonIcon, IonCard, IonCardContent, IonBadge,
  IonToast, IonModal, IonSpinner, IonCheckbox
} from '@ionic/react';
import {
  cartOutline, checkmarkCircleOutline, closeCircleOutline,
  closeOutline, imageOutline, checkboxOutline, squareOutline
} from 'ionicons/icons';
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
  category: item.category || 'Other',
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

const conditionLabel = (c: number) => {
  switch (c) {
    case 1: return 'Brand new';
    case 2: return 'Like new';
    case 3: return 'Good condition';
    case 4: return 'Well used';
    default: return 'Unknown';
  }
};

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
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  const storeListing = getListingById(id);
  const listing = storeListing || fetchedListing;

  useEffect(() => {
    if (!storeListing && id) {
      setLoading(true);
      fetchListingById(id).then((result) => {
        setFetchedListing(result);
        setLoading(false);
      });
    }
  }, [id, storeListing]);

  useEffect(() => {
    if (id) {
      itemsApi.getSellerItems(id)
        .then((response) => {
          const items: Listing[] = response.data
            .map(mapSellerItem)
            .filter((item: Listing) => item.id !== id && !item.soldOut && !item.isExpired);
          setSellerItems(items);
        })
        .catch(() => { /* silently ignore */ });
    }
  }, [id]);

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonBackButton defaultHref="/buyer" /></IonButtons>
            <IonTitle>Loading...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '16px', textAlign: 'center' }}><IonSpinner /></div>
        </IonContent>
      </IonPage>
    );
  }

  if (!listing) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonBackButton defaultHref="/buyer" /></IonButtons>
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

  // ── Cart helpers ──────────────────────────────────────────────────────────

  const buildCartItem = (item: Listing, selectedQuantity: number) => ({
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
    sellerId: item.sellerId,
    sellerAlias: item.sellerAlias,
    largeItem: item.largeItem || false,
  });

  const handleAddToCart = () => {
    if (listing.soldOut || listing.quantity === 0) {
      showToast('This item is sold out!', 'danger');
      return;
    }
    addToCart(buildCartItem(listing, mainQty), showToast);
    decreaseQuantity(listing.id);
  };

  // ── Seller items — grouped selection ─────────────────────────────────────

  const grouped = sellerItems.reduce((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, Listing[]>);

  const categories = Object.keys(grouped).sort();

  const toggleItem = (itemId: string) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  const toggleCategory = (catItems: Listing[]) => {
    const ids = catItems.map(i => i.id);
    const allSelected = ids.every(id => selectedItemIds.has(id));
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (allSelected) ids.forEach(id => next.delete(id));
      else ids.forEach(id => next.add(id));
      return next;
    });
  };

  const selectedItems = sellerItems.filter(i => selectedItemIds.has(i.id));
  const selectedTotal = selectedItems.reduce((sum, i) => sum + i.price, 0);

  const handleAddSelected = () => {
    selectedItems.forEach(item => {
      if (!cartItems.some(c => c.id === item.id)) {
        addToCart(buildCartItem(item, 1), showToast);
        decreaseQuantity(item.id);
      }
    });
    setSelectedItemIds(new Set());
  };

  const alreadyInCart = (itemId: string) => cartItems.some(c => c.id === itemId);

  // Extra bottom padding so content doesn't hide behind floating bar or tab bar
  const bottomPad = selectedItems.length > 0 ? 140 : 88;

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
        <div style={{ padding: '16px', paddingBottom: `${bottomPad}px` }}>

          {/* ── Main item card ────────────────────────────────────────── */}
          <IonCard>
            <IonCardContent>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h1 style={{ margin: 0, fontSize: '22px', flex: 1, paddingRight: '8px' }}>{listing.name}</h1>
                {listing.soldOut || listing.quantity === 0 ? (
                  <IonBadge color="danger">
                    <IonIcon icon={closeCircleOutline} style={{ marginRight: '4px' }} />Sold Out
                  </IonBadge>
                ) : (
                  <IonBadge color="success">
                    <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '4px' }} />{listing.quantity} left
                  </IonBadge>
                )}
              </div>

              {/* Photos */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', justifyContent: 'center' }}>
                {[{ photo: listing.frontPhoto, label: 'Front' }, { photo: listing.backPhoto, label: 'Back' }].map(({ photo, label }) => (
                  <div key={label} style={{ textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => { if (photo) { setZoomPhoto(photo); setZoomLabel(label); } }}>
                    {photo && photo !== `${label} Photo` ? (
                      <img src={photo} alt={label}
                        style={{ width: '140px', height: '170px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #ddd' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div style={{ width: '140px', height: '170px', backgroundColor: '#f0f0f0', border: '2px solid #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '4px' }}>
                        <IonIcon icon={imageOutline} style={{ fontSize: '32px', color: '#999' }} />
                        <span style={{ fontSize: '12px', color: '#999' }}>No photo</span>
                      </div>
                    )}
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>{label}</p>
                  </div>
                ))}
              </div>
              <p style={{ textAlign: 'center', fontSize: '11px', color: '#aaa', margin: '0 0 12px' }}>Tap photo to enlarge</p>

              <h2 style={{ fontSize: '28px', color: '#004aad', margin: '0 0 12px' }}>R{listing.price}</h2>

              <p style={{ margin: '0 0 16px', fontSize: '15px', lineHeight: '1.5' }}>{listing.description}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                {[
                  { label: 'School', value: listing.school },
                  { label: 'Size', value: listing.size },
                  { label: 'Gender', value: listing.gender },
                  { label: 'Condition', value: conditionLabel(listing.condition) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ margin: '0 0 2px', fontWeight: 'bold', fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                    <p style={{ margin: 0, fontSize: '14px' }}>{value}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 2px', fontWeight: 'bold', fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</p>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  {listing.category}{listing.subcategory && ` › ${listing.subcategory}`}{listing.sport && ` › ${listing.sport}`}
                </p>
              </div>

              {/* Quantity stepper */}
              {!listing.soldOut && listing.quantity > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold', color: '#666', fontSize: '14px' }}>Qty:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IonButton size="small" fill="outline" onClick={() => setMainQty(q => Math.max(1, q - 1))} disabled={mainQty <= 1}>−</IonButton>
                    <span style={{ minWidth: '24px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}>{mainQty}</span>
                    <IonButton size="small" fill="outline" onClick={() => setMainQty(q => Math.min(listing.quantity, q + 1))} disabled={mainQty >= listing.quantity}>+</IonButton>
                  </div>
                  <span style={{ fontSize: '12px', color: '#888' }}>{listing.quantity} available</span>
                </div>
              )}
            </IonCardContent>
          </IonCard>

          {/* ── Main Add to Cart ──────────────────────────────────────── */}
          <div style={{ margin: '8px 0 24px' }}>
            <IonButton expand="block" size="large" onClick={handleAddToCart}
              disabled={listing.soldOut || listing.quantity === 0}>
              <IonIcon icon={cartOutline} slot="start" />
              {listing.soldOut || listing.quantity === 0 ? 'Sold Out' : 'Add to Cart'}
            </IonButton>
          </div>

          {/* ── More from this seller ─────────────────────────────────── */}
          {sellerItems.length > 0 && (
            <div>
              {/* Section heading */}
              <div style={{ marginBottom: '4px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', color: '#1a1a1a' }}>
                  More from this seller
                </h2>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#666' }}>
                  Select items below — shared delivery saves you money.
                </p>
              </div>

              {categories.map(cat => {
                const catItems = grouped[cat];
                const allCatSelected = catItems.every(i => selectedItemIds.has(i.id));
                const someCatSelected = catItems.some(i => selectedItemIds.has(i.id));

                return (
                  <div key={cat} style={{ marginBottom: '20px' }}>
                    {/* Category header */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      backgroundColor: '#f0f4ff', borderRadius: '8px',
                      padding: '8px 12px', marginBottom: '8px',
                    }}>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: '#004aad', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                        {cat}
                        <span style={{ fontWeight: 400, color: '#667', marginLeft: '6px' }}>({catItems.length})</span>
                      </span>
                      <button
                        onClick={() => toggleCategory(catItems)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: '12px', color: '#004aad', fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: '4px', padding: 0,
                        }}
                      >
                        <IonIcon
                          icon={allCatSelected ? checkboxOutline : squareOutline}
                          style={{ fontSize: '16px', color: allCatSelected ? '#004aad' : someCatSelected ? '#004aad' : '#aaa' }}
                        />
                        {allCatSelected ? 'Deselect all' : 'Select all'}
                      </button>
                    </div>

                    {/* Items in this category */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {catItems.map(item => {
                        const selected = selectedItemIds.has(item.id);
                        const inCart = alreadyInCart(item.id);

                        return (
                          <div
                            key={item.id}
                            onClick={() => !inCart && toggleItem(item.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '10px',
                              backgroundColor: selected ? '#f0f4ff' : 'white',
                              border: selected ? '1.5px solid #004aad' : '1.5px solid #e0e0e0',
                              borderRadius: '10px', padding: '10px',
                              cursor: inCart ? 'default' : 'pointer',
                              transition: 'border-color 0.15s, background-color 0.15s',
                              opacity: inCart ? 0.6 : 1,
                            }}
                          >
                            {/* Checkbox */}
                            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}
                              onClick={e => { e.stopPropagation(); if (!inCart) toggleItem(item.id); }}>
                              <IonCheckbox
                                checked={selected || inCart}
                                disabled={inCart}
                                onIonChange={() => { if (!inCart) toggleItem(item.id); }}
                                style={{ '--size': '20px', '--border-radius': '4px' } as any}
                              />
                            </div>

                            {/* Thumbnail */}
                            {item.frontPhoto ? (
                              <img src={item.frontPhoto} alt={item.name}
                                style={{ width: '60px', height: '74px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd', flexShrink: 0 }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                              <div style={{ width: '60px', height: '74px', backgroundColor: '#f5f5f5', borderRadius: '6px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <IonIcon icon={imageOutline} style={{ fontSize: '22px', color: '#bbb' }} />
                              </div>
                            )}

                            {/* Details */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1a1a1a' }}>
                                {item.name}
                              </p>
                              {item.size && item.size !== 'Standard' && (
                                <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#888' }}>Size {item.size}</p>
                              )}
                              <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#888' }}>{conditionLabel(item.condition)}</p>
                              <p style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#004aad' }}>R{item.price}</p>
                            </div>

                            {/* Cart badge */}
                            {inCart && (
                              <IonBadge color="success" style={{ flexShrink: 0, fontSize: '10px' }}>In cart</IonBadge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <IonToast isOpen={isOpen} onDidDismiss={hideToast} message={message} duration={3000} position="bottom" color={color} />

        {/* Photo zoom modal */}
        <IonModal isOpen={!!zoomPhoto} onDidDismiss={() => setZoomPhoto(null)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{zoomLabel} Photo</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setZoomPhoto(null)}><IonIcon icon={closeOutline} /></IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '16px', backgroundColor: '#000' }}>
              {zoomPhoto && <img src={zoomPhoto} alt={`${zoomLabel} photo`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />}
            </div>
          </IonContent>
        </IonModal>
      </IonContent>

      {/* ── Floating selection bar ────────────────────────────────────────── */}
      {selectedItems.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '56px',   // sits just above the tab bar
          left: 0,
          right: 0,
          zIndex: 200,
          padding: '10px 16px',
          backgroundColor: '#004aad',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 -3px 12px rgba(0,74,173,0.35)',
        }}>
          <div style={{ color: 'white' }}>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>
              {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: '13px', opacity: 0.85, marginLeft: '8px' }}>
              R{selectedTotal.toFixed(0)}
            </span>
          </div>
          <IonButton
            size="small"
            style={{ '--background': 'white', '--color': '#004aad', '--border-radius': '8px', fontWeight: 700, minWidth: '140px' }}
            onClick={handleAddSelected}
          >
            <IonIcon icon={cartOutline} slot="start" />
            Add {selectedItems.length} to Cart
          </IonButton>
        </div>
      )}
    </IonPage>
  );
};

export default ItemPage;
