import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonToast,
  IonBadge
} from '@ionic/react';
import { checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { useCartStore } from '../../stores/cartStore';
import { useListingsStore } from '../../stores/listingsStore';

interface BeltsBagsShoesProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'all';
}

type GenderFilter = 'All' | 'Boys' | 'Girls';

const BeltsBagsShoesComponent: React.FC<BeltsBagsShoesProps> = () => {
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('All');
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [photoViewer, setPhotoViewer] = useState<string | null>(null);
  const [addedToCartId, setAddedToCartId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { addToCart } = useCartStore();
  const { listings, fetchListings } = useListingsStore();

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const genderMap: Record<string, string> = { 'Boys': 'Boy', 'Girls': 'Girl' };

  const getFilteredItems = () => {
    return listings.filter(listing => {
      if (listing.category !== 'Belts, bags & shoes') return false;
      if (genderFilter === 'All') return true;
      const mappedGender = genderMap[genderFilter] || genderFilter;
      return listing.gender === mappedGender || listing.gender === 'Unisex';
    }).map(listing => ({
      id: listing.id,
      item: listing.name,
      size: listing.size,
      condition: listing.condition,
      price: listing.price,
      frontPhoto: listing.frontPhoto,
      backPhoto: listing.backPhoto,
      quantity: listing.quantity,
      description: listing.description,
      gender: listing.gender,
      category: listing.category,
      subcategory: listing.subcategory,
      sport: listing.sport,
      school: listing.school
    }));
  };

  const handleAddToCart = (item: any) => {
    if (item.quantity === 0) {
      setToastMessage(`${item.item} is sold out!`);
      setShowToast(true);
      return;
    }

    const cartItem = {
      id: item.id,
      name: item.item,
      description: item.description || `${item.item} - Size: ${item.size}`,
      price: item.price,
      condition: item.condition,
      school: item.school || '',
      size: item.size,
      gender: item.gender || '',
      frontPhoto: item.frontPhoto,
      backPhoto: item.backPhoto,
      category: 'Belts, bags & shoes',
      subcategory: item.subcategory,
      sport: item.sport,
      quantity: 1
    };

    addToCart(cartItem);
    setAddedToCartId(item.id);
    setTimeout(() => setAddedToCartId(null), 2000);
  };

  const getConditionText = (condition: number) => {
    const conditions = { 1: 'Brand new', 2: 'Like new', 3: 'Used but good', 4: 'Used and worn' };
    return conditions[condition as keyof typeof conditions] || 'Unknown';
  };

  const renderPhotoViewer = () => {
    if (!photoViewer) return null;

    return createPortal(
      <div
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        onClick={() => setPhotoViewer(null)}
      >
        <div
          style={{
            backgroundColor: '#fff', borderRadius: '12px', padding: '20px',
            maxWidth: '90%', maxHeight: '90%', position: 'relative',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            style={{
              position: 'absolute', top: '10px', right: '10px',
              background: 'none', border: 'none', fontSize: '24px',
              cursor: 'pointer', color: '#666', zIndex: 10
            }}
            onClick={() => setPhotoViewer(null)}
          >
            ×
          </button>
          <img
            src={photoViewer}
            alt="Zoomed view"
            style={{
              maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain',
              borderRadius: '8px', border: '1px solid #ddd', touchAction: 'pinch-zoom'
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          />
        </div>
      </div>,
      document.body
    );
  };

  const filterChipStyle = (active: boolean) => ({
    padding: '6px 16px',
    borderRadius: '20px',
    border: active ? '2px solid #3498DB' : '1px solid #ccc',
    backgroundColor: active ? '#3498DB' : 'transparent',
    color: active ? '#fff' : '#666',
    fontSize: '13px',
    fontWeight: active ? 'bold' : 'normal' as const,
    cursor: 'pointer'
  });

  // ---------- ITEM DETAIL VIEW ----------
  if (viewingItem) {
    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => setViewingItem(null)}>← Back</IonButton>

        <div style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#666' }}>
            {viewingItem.item}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px', margin: '16px 0', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <img
              src={viewingItem.frontPhoto}
              alt="Front view"
              onClick={() => setPhotoViewer(viewingItem.frontPhoto)}
              style={{
                width: '150px', height: '200px', borderRadius: '8px',
                objectFit: 'cover', border: '1px solid #ddd', cursor: 'pointer'
              }}
            />
            <p style={{ fontSize: '12px', margin: '4px 0', fontWeight: 'bold' }}>Front</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img
              src={viewingItem.backPhoto}
              alt="Back view"
              onClick={() => setPhotoViewer(viewingItem.backPhoto)}
              style={{
                width: '150px', height: '200px', borderRadius: '8px',
                objectFit: 'cover', border: '1px solid #ddd', cursor: 'pointer'
              }}
            />
            <p style={{ fontSize: '12px', margin: '4px 0', fontWeight: 'bold' }}>Back</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', margin: '16px 0' }}>
          <div style={{ marginBottom: '8px' }}><strong>Size:</strong> {viewingItem.size}</div>
          <div style={{ marginBottom: '8px' }}><strong>Condition:</strong> {getConditionText(viewingItem.condition)}</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#E74C3C' }}>R{viewingItem.price}</div>
        </div>

        <IonButton
          expand="full"
          onClick={() => handleAddToCart(viewingItem)}
          disabled={viewingItem.quantity === 0}
          style={{
            marginTop: '16px',
            '--background': addedToCartId === viewingItem.id ? '#28a745' : '',
            '--color': addedToCartId === viewingItem.id ? 'white' : ''
          }}
        >
          {viewingItem.quantity === 0 ? 'Sold Out' :
           addedToCartId === viewingItem.id ? '✓ Added to Cart!' : 'Add to Cart'}
        </IonButton>
        {renderPhotoViewer()}
      </div>
    );
  }

  // ---------- MAIN GRID VIEW ----------
  const items = getFilteredItems();
  const filters: GenderFilter[] = ['All', 'Boys', 'Girls'];

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>Belts, Bags & Shoes</h2>

      {/* Gender filter chips */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} style={filterChipStyle(genderFilter === f)} onClick={() => setGenderFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 16px', color: '#999' }}>
          <p style={{ fontSize: '16px' }}>No items listed yet</p>
          <p style={{ fontSize: '13px' }}>Check back soon for belts, bags & shoes!</p>
        </div>
      ) : (
        <IonGrid>
          <IonRow>
            {items.map((item) => (
              <IonCol size="6" key={item.id}>
                <IonCard button onClick={() => setViewingItem(item)} style={{ backgroundColor: 'transparent', border: '1px solid #444' }}>
                  <IonCardContent style={{ padding: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      <div style={{
                        width: '50px', height: '60px', borderRadius: '4px',
                        backgroundImage: `url(${item.frontPhoto})`,
                        backgroundSize: 'cover', backgroundPosition: 'center'
                      }} />
                      <div style={{
                        width: '50px', height: '60px', borderRadius: '4px',
                        backgroundImage: `url(${item.backPhoto})`,
                        backgroundSize: 'cover', backgroundPosition: 'center'
                      }} />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {item.item}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>
                      Size: {item.size}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                      Condition: {getConditionText(item.condition)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#E74C3C' }}>
                        R{item.price}
                      </div>
                      {item.quantity > 0 ? (
                        <IonBadge color="success" style={{ fontSize: '9px' }}>
                          <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '2px', fontSize: '10px' }} />
                          {item.quantity} available
                        </IonBadge>
                      ) : (
                        <IonBadge color="danger" style={{ fontSize: '9px' }}>
                          <IonIcon icon={closeCircleOutline} style={{ marginRight: '2px', fontSize: '10px' }} />
                          Sold Out
                        </IonBadge>
                      )}
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      )}

      {renderPhotoViewer()}

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="bottom"
        color={toastMessage.includes('successfully') ? 'success' : 'danger'}
      />
    </div>
  );
};

export default BeltsBagsShoesComponent;
