import React, { useState, useEffect } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonToast,
  IonBadge,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons
} from '@ionic/react';
import { cartOutline, checkmarkCircleOutline, closeCircleOutline, closeOutline, notificationsOutline, heartOutline } from 'ionicons/icons';
import { useCartStore } from '../../stores/cartStore';
import { useListingsStore } from '../../stores/listingsStore';
import { useWishlistStore } from '../../stores/wishlistStore';

interface MatricDanceProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: string;
}

type GenderFilter = 'All' | 'Girls' | 'Boys' | 'Accessories';

const MatricDanceComponent: React.FC<MatricDanceProps> = () => {
  const { addToCart } = useCartStore();
  const { listings, fetchListings, decreaseQuantity } = useListingsStore();
  const { addToWishlist } = useWishlistStore();

  const [genderFilter, setGenderFilter] = useState<GenderFilter>('All');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [photoModal, setPhotoModal] = useState<{ isOpen: boolean; photo: string; title: string }>({ isOpen: false, photo: '', title: '' });

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const getConditionText = (condition: number) => {
    switch (condition) {
      case 1: return 'Brand new';
      case 2: return 'Like new';
      case 3: return 'Good condition';
      case 4: return 'Used';
      default: return 'Unknown';
    }
  };

  const genderMap: Record<string, string> = { 'Girls': 'Girl', 'Boys': 'Boy' };

  const getFilteredItems = () => {
    return listings.filter(listing => {
      if (listing.category !== 'Matric dance clothing') return false;
      if (genderFilter === 'All') return true;
      if (genderFilter === 'Accessories') return listing.gender === 'Unisex';
      const mappedGender = genderMap[genderFilter] || genderFilter;
      return listing.gender === mappedGender;
    });
  };

  const handleAddToCart = (listing: any, event: React.MouseEvent) => {
    event.stopPropagation();

    if (listing.soldOut || listing.quantity === 0) {
      setToastMessage('This item is sold out!');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    const cartItem = {
      id: String(listing.id),
      name: listing.name,
      description: listing.description || `${listing.name} - Size ${listing.size}`,
      price: listing.price,
      condition: listing.condition,
      school: listing.school || '',
      size: listing.size || '',
      gender: listing.gender || '',
      category: 'Matric dance clothing',
      subcategory: listing.subcategory,
      sport: listing.sport,
      frontPhoto: listing.frontPhoto || '',
      backPhoto: listing.backPhoto || '',
      quantity: 1
    };

    addToCart(cartItem);
    decreaseQuantity(listing.id);
  };

  const handleNotifyMe = (listing: any, event: React.MouseEvent) => {
    event.stopPropagation();
    addToWishlist({
      name: listing.name,
      category: 'Matric dance clothing',
      subcategory: listing.subcategory,
      sport: listing.sport,
      school: listing.school,
      size: listing.size,
      gender: listing.gender,
      notifyWhenAvailable: true
    });
    setToastMessage('Added to wishlist! You\'ll be notified when available.');
    setToastColor('success');
    setShowToast(true);
  };

  const filterChipStyle = (active: boolean) => ({
    padding: '6px 16px',
    borderRadius: '20px',
    border: active ? '2px solid #8E44AD' : '1px solid #ccc',
    backgroundColor: active ? '#8E44AD' : 'transparent',
    color: active ? '#fff' : '#666',
    fontSize: '13px',
    fontWeight: active ? 'bold' : 'normal' as const,
    cursor: 'pointer'
  });

  const filteredListings = getFilteredItems();
  const filters: GenderFilter[] = ['All', 'Girls', 'Boys', 'Accessories'];

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>Matric Dance</h2>

      {/* Gender filter chips */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} style={filterChipStyle(genderFilter === f)} onClick={() => setGenderFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {filteredListings.length === 0 ? (
        <div style={{ padding: '16px', textAlign: 'center', color: '#666', backgroundColor: '#f8f9fa', borderRadius: '8px', margin: '16px 0' }}>
          <p style={{ margin: '0 0 12px 0' }}>No matric dance items available yet</p>
          <IonButton
            size="small"
            fill="outline"
            onClick={() => {
              addToWishlist({
                name: 'Matric dance clothing',
                category: 'Matric dance clothing',
                notifyWhenAvailable: true
              });
              setToastMessage('Added to wishlist! You\'ll be notified when available.');
              setToastColor('success');
              setShowToast(true);
            }}
          >
            <IonIcon icon={heartOutline} slot="start" />
            Add to Wishlist
          </IonButton>
        </div>
      ) : (
        <div style={{ margin: '16px 0' }}>
          <div style={{ marginBottom: '12px', padding: '0 16px' }}>
            <h4 style={{ margin: '0', color: '#666', fontSize: '14px' }}>Available ({filteredListings.length})</h4>
          </div>

          {filteredListings.map(listing => (
            <IonCard key={listing.id} style={{ margin: '8px 16px' }}>
              <IonCardContent style={{ padding: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  {/* Photo thumbnails */}
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <div
                      style={{
                        width: '40px', height: '50px', backgroundColor: listing.frontPhoto ? 'transparent' : '#f0f0f0',
                        border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '8px', color: '#999', textAlign: 'center',
                        lineHeight: '1.2', cursor: 'pointer',
                        backgroundImage: listing.frontPhoto ? `url(${listing.frontPhoto})` : 'none',
                        backgroundSize: 'cover', backgroundPosition: 'center'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoModal({ isOpen: true, photo: listing.frontPhoto, title: `${listing.name} - Front Photo` });
                      }}
                    >
                      {!listing.frontPhoto && 'Front'}
                    </div>
                    <div
                      style={{
                        width: '40px', height: '50px', backgroundColor: listing.backPhoto ? 'transparent' : '#f0f0f0',
                        border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '8px', color: '#999', textAlign: 'center',
                        lineHeight: '1.2', cursor: 'pointer',
                        backgroundImage: listing.backPhoto ? `url(${listing.backPhoto})` : 'none',
                        backgroundSize: 'cover', backgroundPosition: 'center'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoModal({ isOpen: true, photo: listing.backPhoto, title: `${listing.name} - Back Photo` });
                      }}
                    >
                      {!listing.backPhoto && 'Back'}
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{listing.name}</span>
                      {listing.soldOut || listing.quantity === 0 ? (
                        <IonBadge color="danger" style={{ fontSize: '9px' }}>
                          <IonIcon icon={closeCircleOutline} style={{ marginRight: '2px', fontSize: '10px' }} />
                          Sold Out
                        </IonBadge>
                      ) : (
                        <IonBadge color="success" style={{ fontSize: '9px' }}>
                          <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '2px', fontSize: '10px' }} />
                          {listing.quantity} left
                        </IonBadge>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginBottom: '6px', fontSize: '12px', color: '#666' }}>
                      <span>Size: {listing.size}</span>
                      <span>{getConditionText(listing.condition)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#3880ff' }}>R{listing.price}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {listing.soldOut || listing.quantity === 0 ? (
                          <IonButton
                            size="small"
                            fill="outline"
                            onClick={(e) => handleNotifyMe(listing, e)}
                          >
                            <IonIcon icon={notificationsOutline} slot="start" />
                            Notify Me
                          </IonButton>
                        ) : (
                          <IonButton
                            size="small"
                            onClick={(e) => handleAddToCart(listing, e)}
                          >
                            <IonIcon icon={cartOutline} slot="start" />
                            Add to Cart
                          </IonButton>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      <IonModal isOpen={photoModal.isOpen} onDidDismiss={() => setPhotoModal({ isOpen: false, photo: '', title: '' })}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{photoModal.title}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setPhotoModal({ isOpen: false, photo: '', title: '' })}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <div style={{ padding: '20px', textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {photoModal.photo ? (
            <img
              src={photoModal.photo}
              alt={photoModal.title}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}
            />
          ) : (
            <div style={{
              width: '300px', height: '400px', backgroundColor: '#f5f5f5', border: '2px solid #ddd',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', color: '#666'
            }}>
              Photo Preview
            </div>
          )}
        </div>
      </IonModal>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="bottom"
        color={toastColor}
      />
    </div>
  );
};

export default MatricDanceComponent;
