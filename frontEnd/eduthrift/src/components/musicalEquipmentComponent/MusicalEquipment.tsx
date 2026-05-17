import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonAccordion,
  IonAccordionGroup,
  IonToast,
  IonBadge
} from '@ionic/react';
import { musicalNotesOutline, checkmarkCircleOutline, closeCircleOutline, ellipsisHorizontalOutline } from 'ionicons/icons';
import { useCartStore } from '../../stores/cartStore';
import { useListingsStore } from '../../stores/listingsStore';

interface MusicalEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'all';
}

const MusicalEquipment: React.FC<MusicalEquipmentProps> = ({ userType, onItemSelect, categoryFilter = 'all' }) => {
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [photoViewer, setPhotoViewer] = useState<string | null>(null);
  const [conditionFilter, setConditionFilter] = useState<number | undefined>();
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState<{ [key: string]: boolean }>({});
  const { addToCart } = useCartStore();
  const { listings, fetchListings } = useListingsStore();

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const musicalEquipmentCategories = {
    'String Instruments': {
      items: ['Acoustic guitar', 'Electric guitar', 'Bass guitar', 'Violin', 'Viola', 'Cello', 'Double bass', 'Ukulele', 'Banjo', 'Harp'],
      color: '#8E44AD'
    },
    'Wind Instruments': {
      items: ['Trumpet', 'Trombone', 'French horn', 'Tuba', 'Clarinet', 'Saxophone', 'Flute', 'Oboe', 'Recorder', 'Bassoon'],
      color: '#004aad'
    },
    'Percussion': {
      items: ['Drum kit', 'Snare drum', 'Djembe', 'Marimba', 'Xylophone', 'Cajon', 'Cymbals', 'Tambourine', 'Bongos', 'Congas'],
      color: '#E74C3C'
    },
    'Keyboard': {
      items: ['Upright piano', 'Grand piano', 'Digital piano', 'Keyboard / Synthesizer', 'Electric organ', 'Accordion'],
      color: '#27AE60'
    },
    'Accessories': {
      items: ['Guitar amp', 'Instrument case', 'Music stand', 'Drum sticks', 'Violin bow', 'Cello bow', 'Guitar strings', 'Reed set', 'Tuner', 'Metronome', 'Sheet music folder'],
      color: '#F39C12'
    }
  };

  const getFilteredItems = () => {
    let items = listings
      .filter(listing => listing.category === 'Musical equipment')
      .map(listing => ({
        id: listing.id,
        item: listing.name,
        condition: listing.condition,
        price: listing.price,
        quantity: listing.quantity,
        frontPhoto: listing.frontPhoto,
        backPhoto: listing.backPhoto,
        description: listing.description,
        size: listing.size,
        gender: listing.gender,
        category: listing.category,
        subcategory: listing.subcategory,
        sport: listing.sport,
        school: listing.school
      }));

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

  const handleAddToCart = (item: any, quantity: number = 1) => {
    if (item.quantity === 0) {
      setToastMessage(`${item.item} is sold out!`);
      setShowToast(true);
      return;
    }
    if (quantity > item.quantity) {
      setToastMessage(`Only ${item.quantity} items available!`);
      setShowToast(true);
      return;
    }
    for (let i = 0; i < quantity; i++) {
      const cartItem = {
        id: `${item.id}-${Date.now()}-${i}`,
        name: item.item,
        description: item.description || `${item.item} - Condition: ${getConditionText(item.condition)}`,
        price: item.price,
        condition: item.condition,
        school: item.school || '',
        size: item.size || '',
        gender: item.gender || '',
        frontPhoto: item.frontPhoto,
        backPhoto: item.backPhoto,
        category: 'Musical equipment',
        subcategory: item.subcategory,
        sport: item.sport,
        quantity: 1
      };
      addToCart(cartItem);
    }
    setToastMessage(`${quantity} x ${item.item} added to cart!`);
    setShowToast(true);
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
            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666', zIndex: 10 }}
            onClick={() => setPhotoViewer(null)}
          >×</button>
          <img
            src={photoViewer}
            alt="Zoomed view"
            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid #ddd', touchAction: 'pinch-zoom' }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          />
        </div>
      </div>,
      document.body
    );
  };

  if (viewingItem) {
    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => setViewingItem(null)}>← Back</IonButton>
        <div style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#666' }}>{viewingItem.item}</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', margin: '16px 0', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <img src={viewingItem.frontPhoto} alt="Front view" onClick={() => setPhotoViewer(viewingItem.frontPhoto)}
              style={{ width: '150px', height: '200px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ddd', cursor: 'pointer' }} />
            <p style={{ fontSize: '12px', margin: '4px 0', fontWeight: 'bold' }}>Front</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src={viewingItem.backPhoto} alt="Back view" onClick={() => setPhotoViewer(viewingItem.backPhoto)}
              style={{ width: '150px', height: '200px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ddd', cursor: 'pointer' }} />
            <p style={{ fontSize: '12px', margin: '4px 0', fontWeight: 'bold' }}>Back</p>
          </div>
        </div>
        <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', margin: '16px 0' }}>
          <div style={{ marginBottom: '8px' }}><strong>Condition:</strong> {getConditionText(viewingItem.condition)}</div>
          <div style={{ marginBottom: '8px', fontSize: '18px', fontWeight: 'bold', color: '#E74C3C' }}>R{viewingItem.price}</div>
          <div style={{ marginBottom: '8px' }}><strong>Available:</strong> {viewingItem.quantity}</div>
        </div>
        <IonItem style={{ marginBottom: '16px' }}>
          <IonLabel position="stacked">Quantity</IonLabel>
          <IonSelect value={selectedQuantity} onIonChange={e => setSelectedQuantity(e.detail.value)}>
            {Array.from({ length: viewingItem.quantity }, (_, i) => i + 1).map(num => (
              <IonSelectOption key={num} value={num}>{num}</IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
        <IonButton
          expand="full"
          onClick={() => {
            handleAddToCart(viewingItem, selectedQuantity);
            setAddedToCart(prev => ({ ...prev, [viewingItem.id]: true }));
            setTimeout(() => setAddedToCart(prev => ({ ...prev, [viewingItem.id]: false })), 2000);
          }}
          disabled={viewingItem.quantity === 0}
          color={addedToCart[viewingItem.id] ? 'success' : 'primary'}
          style={{ marginTop: '16px' }}
        >
          {viewingItem.quantity === 0 ? 'Sold Out' :
            addedToCart[viewingItem.id] ? '✓ Added to Cart!' : `Add ${selectedQuantity} to Cart`}
        </IonButton>
        {renderPhotoViewer()}
      </div>
    );
  }

  const allFilteredItems = getFilteredItems();
  const categorizedItems = new Set();

  return (
    <div style={{ padding: '16px' }}>
      <div style={{
        marginBottom: '16px', textAlign: 'center',
        backgroundColor: 'rgba(142, 68, 173, 0.1)', border: '2px solid #8E44AD',
        borderRadius: '12px', padding: '16px'
      }}>
        <IonIcon icon={musicalNotesOutline} style={{ fontSize: '32px', color: '#8E44AD', marginBottom: '8px' }} />
        <h2 style={{ margin: '0', color: '#8E44AD', fontSize: '18px', fontWeight: 'bold' }}>
          Musical Equipment
        </h2>
        <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
          Instruments & accessories
        </p>
      </div>

      <div style={{ backgroundColor: 'transparent', border: '1px solid #444', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>Filters</h4>
        <IonGrid>
          <IonRow>
            <IonCol size="6">
              <IonSelect label="Condition" labelPlacement="stacked" value={conditionFilter} onIonChange={e => setConditionFilter(e.detail.value)} placeholder="Any">
                <IonSelectOption value={undefined}>Any</IonSelectOption>
                <IonSelectOption value={1}>Brand new</IonSelectOption>
                <IonSelectOption value={2}>Like new</IonSelectOption>
                <IonSelectOption value={3}>Used but good</IonSelectOption>
                <IonSelectOption value={4}>Used and worn</IonSelectOption>
              </IonSelect>
            </IonCol>
            <IonCol size="6">
              <div style={{ display: 'flex', gap: '4px' }}>
                <IonInput label="Min Price" labelPlacement="stacked" type="number" value={priceRange.min} onIonChange={e => setPriceRange({ ...priceRange, min: e.detail.value! })} placeholder="0" />
                <IonInput label="Max Price" labelPlacement="stacked" type="number" value={priceRange.max} onIonChange={e => setPriceRange({ ...priceRange, max: e.detail.value! })} placeholder="999" />
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </div>

      <IonAccordionGroup>
        {Object.entries(musicalEquipmentCategories).map(([category, categoryData]) => {
          const categoryItems = allFilteredItems.filter(item => {
            const matches = categoryData.items.some(catItem =>
              item.item.toLowerCase().includes(catItem.toLowerCase()) ||
              catItem.toLowerCase().includes(item.item.toLowerCase())
            );
            if (matches) categorizedItems.add(item.id);
            return matches;
          });

          return (
            <IonAccordion key={category} value={category}>
              <IonItem slot="header" style={{ '--background': 'transparent' }}>
                <IonIcon icon={musicalNotesOutline} style={{ fontSize: '24px', color: categoryData.color, marginRight: '12px' }} />
                <IonLabel>
                  <h3 style={{ margin: '0', fontWeight: 'bold', color: categoryData.color, fontSize: '16px' }}>
                    {category} ({categoryItems.length})
                  </h3>
                </IonLabel>
              </IonItem>
              <div slot="content" style={{ padding: '8px' }}>
                {categoryItems.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
                    No items listed yet in this category
                  </div>
                ) : (
                  <IonGrid>
                    <IonRow>
                      {categoryItems.map((item) => (
                        <IonCol size="6" key={item.id}>
                          <IonCard button onClick={() => setViewingItem(item)} style={{ backgroundColor: 'transparent', border: '1px solid #444' }}>
                            <IonCardContent style={{ padding: '8px' }}>
                              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                                <div style={{ width: '50px', height: '60px', borderRadius: '4px', backgroundImage: `url(${item.frontPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                <div style={{ width: '50px', height: '60px', borderRadius: '4px', backgroundImage: `url(${item.backPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>{item.item}</div>
                              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Condition: {getConditionText(item.condition)}</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#E74C3C' }}>R{item.price}</div>
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
              </div>
            </IonAccordion>
          );
        })}

        {(() => {
          const otherItems = allFilteredItems.filter(item => !categorizedItems.has(item.id));
          if (otherItems.length === 0) return null;
          return (
            <IonAccordion key="Other" value="Other">
              <IonItem slot="header" style={{ '--background': 'transparent' }}>
                <IonIcon icon={ellipsisHorizontalOutline} style={{ fontSize: '24px', color: '#95A5A6', marginRight: '12px' }} />
                <IonLabel>
                  <h3 style={{ margin: '0', fontWeight: 'bold', color: '#95A5A6', fontSize: '16px' }}>
                    Other ({otherItems.length})
                  </h3>
                </IonLabel>
              </IonItem>
              <div slot="content" style={{ padding: '8px' }}>
                <IonGrid>
                  <IonRow>
                    {otherItems.map((item) => (
                      <IonCol size="6" key={item.id}>
                        <IonCard button onClick={() => setViewingItem(item)} style={{ backgroundColor: 'transparent', border: '1px solid #444' }}>
                          <IonCardContent style={{ padding: '8px' }}>
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                              <div style={{ width: '50px', height: '60px', borderRadius: '4px', backgroundImage: `url(${item.frontPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                              <div style={{ width: '50px', height: '60px', borderRadius: '4px', backgroundImage: `url(${item.backPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>{item.item}</div>
                            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Condition: {getConditionText(item.condition)}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#E74C3C' }}>R{item.price}</div>
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
              </div>
            </IonAccordion>
          );
        })()}
      </IonAccordionGroup>

      {renderPhotoViewer()}

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="bottom"
        color={toastMessage.includes('added') || toastMessage.includes('successfully') ? 'success' : 'danger'}
      />
    </div>
  );
};

export default MusicalEquipment;
