import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonBadge
} from '@ionic/react';
import { fitnessOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { useCartStore } from '../../stores/cartStore';
import { useListingsStore } from '../../stores/listingsStore';

interface TrainingWearProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'all';
}

type GenderFilter = 'All' | 'Boys' | 'Girls' | 'Unisex';

const TrainingWearComponent: React.FC<TrainingWearProps> = () => {
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('All');
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [photoViewer, setPhotoViewer] = useState<string | null>(null);
  const [sizeFilter, setSizeFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState<number | undefined>();
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [addedToCartId, setAddedToCartId] = useState<string | null>(null);
  const { addToCart } = useCartStore();
  const { listings, fetchListings } = useListingsStore();

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const getConditionText = (condition: number) => {
    const conditions = { 1: 'Brand new', 2: 'Like new', 3: 'Used but good', 4: 'Used and worn' };
    return conditions[condition as keyof typeof conditions] || 'Unknown';
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
      category: 'Training Wear',
      subcategory: item.subcategory,
      sport: item.sport,
      quantity: 1
    };

    addToCart(cartItem);
    setAddedToCartId(item.id);
    setTimeout(() => setAddedToCartId(null), 2000);
  };

  const genderMap: Record<string, string> = { 'Boys': 'Boy', 'Girls': 'Girl' };

  const getFilteredItems = () => {
    let items = listings.filter(listing => {
      if (listing.category !== 'Training wear') return false;
      if (genderFilter === 'All') return true;
      const mappedGender = genderMap[genderFilter] || genderFilter;
      return listing.gender === mappedGender;
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

    if (sizeFilter) {
      items = items.filter(item => item.size.toLowerCase().includes(sizeFilter.toLowerCase()));
    }
    if (conditionFilter) {
      items = items.filter(item => item.condition === conditionFilter);
    }
    if (priceRange.min) {
      items = items.filter(item => item.price >= parseInt(priceRange.min));
    }
    if (priceRange.max) {
      items = items.filter(item => item.price <= parseInt(priceRange.max));
    }

    return items;
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
    border: active ? '2px solid #27AE60' : '1px solid #ccc',
    backgroundColor: active ? '#27AE60' : 'transparent',
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

        <div style={{
          marginBottom: '20px', textAlign: 'center',
          backgroundColor: 'rgba(39, 174, 96, 0.1)', border: '2px solid #27AE60',
          borderRadius: '12px', padding: '16px'
        }}>
          <IonIcon icon={fitnessOutline} style={{ fontSize: '32px', color: '#27AE60', marginBottom: '8px' }} />
          <h2 style={{ margin: '0', color: '#27AE60', fontSize: '18px', fontWeight: 'bold' }}>
            Sporting Clothing
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
            Training & Athletic Wear
          </p>
        </div>

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
  const filters: GenderFilter[] = ['All', 'Boys', 'Girls', 'Unisex'];

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Training Wear</h2>

      {/* Sporting Clothing header */}
      <div style={{
        marginBottom: '16px', textAlign: 'center',
        backgroundColor: 'rgba(39, 174, 96, 0.1)', border: '2px solid #27AE60',
        borderRadius: '12px', padding: '16px'
      }}>
        <IonIcon icon={fitnessOutline} style={{ fontSize: '32px', color: '#27AE60', marginBottom: '8px' }} />
        <h2 style={{ margin: '0', color: '#27AE60', fontSize: '18px', fontWeight: 'bold' }}>
          Sporting Clothing
        </h2>
        <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
          Training & Athletic Wear
        </p>
      </div>

      {/* Gender filter chips */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} style={filterChipStyle(genderFilter === f)} onClick={() => setGenderFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {/* Size / Condition / Price filters */}
      <div style={{ backgroundColor: 'transparent', border: '1px solid #444', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>Filters</h4>
        <IonGrid>
          <IonRow>
            <IonCol size="4">
              <IonInput
                label="Size"
                labelPlacement="stacked"
                value={sizeFilter}
                onIonChange={e => setSizeFilter(e.detail.value!)}
                placeholder="e.g. L, M, 10"
                style={{ fontSize: '12px' }}
              />
            </IonCol>
            <IonCol size="4">
              <IonSelect
                label="Condition"
                labelPlacement="stacked"
                value={conditionFilter}
                onIonChange={e => setConditionFilter(e.detail.value)}
                placeholder="Any"
              >
                <IonSelectOption value={undefined}>Any</IonSelectOption>
                <IonSelectOption value={1}>Brand new</IonSelectOption>
                <IonSelectOption value={2}>Like new</IonSelectOption>
                <IonSelectOption value={3}>Used but good</IonSelectOption>
                <IonSelectOption value={4}>Used and worn</IonSelectOption>
              </IonSelect>
            </IonCol>
            <IonCol size="4">
              <div style={{ display: 'flex', gap: '4px' }}>
                <IonInput
                  label="Min Price"
                  labelPlacement="stacked"
                  type="number"
                  value={priceRange.min}
                  onIonChange={e => setPriceRange({...priceRange, min: e.detail.value!})}
                  placeholder="0"
                />
                <IonInput
                  label="Max Price"
                  labelPlacement="stacked"
                  type="number"
                  value={priceRange.max}
                  onIonChange={e => setPriceRange({...priceRange, max: e.detail.value!})}
                  placeholder="999"
                />
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 16px', color: '#999' }}>
          <p style={{ fontSize: '16px' }}>No items listed yet</p>
          <p style={{ fontSize: '13px' }}>Check back soon for training wear!</p>
        </div>
      ) : (
        <IonGrid>
          <IonRow>
            {items.map((item) => (
              <IonCol size="6" key={item.id}>
                <IonCard button onClick={() => setViewingItem(item)} style={{ backgroundColor: 'transparent', border: '1px solid #444' }}>
                  <IonCardContent style={{ padding: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      <img
                        src={item.frontPhoto}
                        alt="Front"
                        style={{ width: '50px', height: '60px', borderRadius: '4px', objectFit: 'cover' }}
                      />
                      <img
                        src={item.backPhoto}
                        alt="Back"
                        style={{ width: '50px', height: '60px', borderRadius: '4px', objectFit: 'cover' }}
                      />
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

export default TrainingWearComponent;
