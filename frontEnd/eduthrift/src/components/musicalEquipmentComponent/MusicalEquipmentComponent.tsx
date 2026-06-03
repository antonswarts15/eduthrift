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
import {
  musicalNotesOutline, imageOutline, checkmarkCircleOutline, closeCircleOutline, ellipsisHorizontalOutline
} from 'ionicons/icons';
import { useCartStore } from '../../stores/cartStore';
import { useListingsStore } from '../../stores/listingsStore';
import { validateImageFile } from '../../utils/imageEnhancer';
import musicPng from '../../assets/music.png';

interface MusicalEquipmentComponentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'all';
}

const musicalEquipmentCategories = {
  'String Instruments': {
    items: ['Acoustic guitar', 'Electric guitar', 'Bass guitar', 'Violin', 'Viola', 'Cello', 'Double bass', 'Ukulele', 'Banjo', 'Harp'],
    color: '#8E44AD'
    // TODO: add icon PNG for String Instruments when asset is available
  },
  'Wind Instruments': {
    items: ['Trumpet', 'Trombone', 'French horn', 'Tuba', 'Clarinet', 'Saxophone', 'Flute', 'Oboe', 'Recorder', 'Bassoon'],
    color: '#004aad'
    // TODO: add icon PNG for Wind Instruments when asset is available
  },
  'Percussion': {
    items: ['Drum kit', 'Snare drum', 'Djembe', 'Marimba', 'Xylophone', 'Cajon', 'Cymbals', 'Tambourine', 'Bongos', 'Congas'],
    color: '#E74C3C'
    // TODO: add icon PNG for Percussion when asset is available
  },
  'Keyboard': {
    items: ['Upright piano', 'Grand piano', 'Digital piano', 'Keyboard / Synthesizer', 'Electric organ', 'Accordion'],
    color: '#27AE60'
    // TODO: add icon PNG for Keyboard when asset is available
  },
  'Accessories': {
    items: ['Guitar amp', 'Instrument case', 'Music stand', 'Drum sticks', 'Violin bow', 'Cello bow', 'Guitar strings', 'Reed set', 'Tuner', 'Metronome', 'Sheet music folder'],
    color: '#F39C12'
    // TODO: add icon PNG for Accessories when asset is available
  }
};

const MusicalEquipmentComponent: React.FC<MusicalEquipmentComponentProps> = ({ userType, onItemSelect, categoryFilter = 'all' }) => {
  // Buyer state
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [photoViewer, setPhotoViewer] = useState<string | null>(null);
  const [conditionFilter, setConditionFilter] = useState<number | undefined>();
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState<{ [key: string]: boolean }>({});
  const { addToCart } = useCartStore();

  // Seller state
  const [selectedItem, setSelectedItem] = useState('');
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [condition, setCondition] = useState<number | undefined>();
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Shared
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { listings, fetchListings, addListing } = useListingsStore();

  useEffect(() => {
    if (userType === 'buyer') fetchListings();
  }, [userType, fetchListings]);

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

    if (conditionFilter) items = items.filter(item => item.condition === conditionFilter);
    if (priceRange.min) items = items.filter(item => item.price >= parseInt(priceRange.min));
    if (priceRange.max) items = items.filter(item => item.price <= parseInt(priceRange.max));
    return items;
  };

  const getConditionText = (cond: number) => {
    const conditions = { 1: 'Brand new', 2: 'Like new', 3: 'Used but good', 4: 'Used and worn' };
    return conditions[cond as keyof typeof conditions] || 'Unknown';
  };

  const handleAddToCart = (item: any, qty: number = 1) => {
    if (item.quantity === 0) {
      setToastMessage(`${item.item} is sold out!`);
      setShowToast(true);
      return;
    }
    if (qty > item.quantity) {
      setToastMessage(`Only ${item.quantity} items available!`);
      setShowToast(true);
      return;
    }
    for (let i = 0; i < qty; i++) {
      addToCart({
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
      });
    }
    setToastMessage(`${qty} x ${item.item} added to cart!`);
    setShowToast(true);
  };

  const handlePhotoUpload = (type: 'front' | 'back') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setToastMessage(validation.error || 'Invalid image file');
        setShowToast(true);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'front') setFrontPhoto(event.target?.result as string);
        else setBackPhoto(event.target?.result as string);
      };
      reader.onerror = () => {
        setToastMessage('Failed to read image file. Please try a different image.');
        setShowToast(true);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSubmit = async () => {
    const missingFields = [];
    if (!condition) missingFields.push('Condition');
    if (!price) missingFields.push('Price');
    if (!quantity) missingFields.push('Quantity');
    if (!frontPhoto) missingFields.push('Front Photo');
    if (!backPhoto) missingFields.push('Back Photo');

    if (missingFields.length > 0) {
      setToastMessage(`Please fill in: ${missingFields.join(', ')}`);
      setShowToast(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await addListing({
        id: Date.now().toString(),
        name: selectedItem,
        description: `${selectedItem} - Quantity: ${quantity}`,
        school: '',
        gender: 'Unisex',
        size: 'Standard',
        condition: condition || 1,
        price: parseInt(price),
        frontPhoto: frontPhoto || '',
        backPhoto: backPhoto || '',
        category: 'Musical equipment',
        dateCreated: new Date().toLocaleDateString(),
        quantity: parseInt(quantity)
      });
      setToastMessage(`${selectedItem} listed successfully!`);
      setShowToast(true);
      setShowItemDetails(false);
      setSelectedItem('');
      setCondition(undefined);
      setPrice('');
      setQuantity('1');
      setFrontPhoto(null);
      setBackPhoto(null);
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to list item');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPhotoViewer = () => {
    if (!photoViewer) return null;
    return createPortal(
      <div
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => setPhotoViewer(null)}
      >
        <div
          style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', maxWidth: '90%', maxHeight: '90%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
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

  const banner = (

     <div style={{ marginBottom: '16px', textAlign: 'center', backgroundColor: '#8E44AD', borderRadius: '12px', padding: '16px' }}>
      <div style={{
        width: '70px', height: '70px', margin: '0 auto 1px',
        backgroundColor: 'white',
        WebkitMaskImage: `url(${musicPng})`,
        maskImage: `url(${musicPng})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center'
      } as React.CSSProperties} />
      <h2 style={{ margin: '0', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>Musical Equipment</h2>
      <p style={{ margin: '1px 0 0 0', color: 'white', fontSize: '14px' }}>
        {userType === 'seller' ? 'Select the instrument or accessory to list' : 'Instruments & accessories'}
      </p>
    </div>
  );

  // Seller: item listing form
  if (userType === 'seller' && showItemDetails) {
    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => setShowItemDetails(false)}>← Back</IonButton>

        <div style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#666' }}>{selectedItem}</span>
        </div>

        <IonItem>
          <IonLabel position="stacked">Quantity *</IonLabel>
          <IonInput type="number" value={quantity} onIonChange={e => setQuantity(e.detail.value!)} placeholder="Enter quantity" min="1" />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Condition Grade *</IonLabel>
          <IonSelect value={condition} onIonChange={e => setCondition(parseInt(e.detail.value))}>
            <IonSelectOption value={1}>1 - Brand new</IonSelectOption>
            <IonSelectOption value={2}>2 - Like new</IonSelectOption>
            <IonSelectOption value={3}>3 - Used but good</IonSelectOption>
            <IonSelectOption value={4}>4 - Used and worn</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Price (ZAR) *</IonLabel>
          <IonInput type="number" value={price} onIonChange={e => setPrice(e.detail.value!)} placeholder="Enter selling price" />
        </IonItem>

        <div style={{ display: 'flex', gap: '16px', margin: '16px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              onClick={() => handlePhotoUpload('front')}
              style={{
                width: '120px', height: '150px', border: '2px dashed #ccc', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                backgroundImage: frontPhoto ? `url(${frontPhoto})` : 'none',
                backgroundSize: 'cover', backgroundPosition: 'center',
                backgroundColor: !frontPhoto ? '#f0f0f0' : 'transparent'
              }}
            >
              {!frontPhoto && <IonIcon icon={imageOutline} size="large" />}
            </div>
            <p style={{ fontSize: '12px', margin: '4px 0' }}>Front Photo *</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              onClick={() => handlePhotoUpload('back')}
              style={{
                width: '120px', height: '150px', border: '2px dashed #ccc', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                backgroundImage: backPhoto ? `url(${backPhoto})` : 'none',
                backgroundSize: 'cover', backgroundPosition: 'center',
                backgroundColor: !backPhoto ? '#f0f0f0' : 'transparent'
              }}
            >
              {!backPhoto && <IonIcon icon={imageOutline} size="large" />}
            </div>
            <p style={{ fontSize: '12px', margin: '4px 0' }}>Back Photo *</p>
          </div>
        </div>

        <IonButton expand="full" onClick={handleSubmit} disabled={isSubmitting} style={{ marginTop: '16px' }}>
          {isSubmitting ? 'Listing...' : 'List Item'}
        </IonButton>

        <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMessage} duration={2000} position="bottom" color={toastMessage.includes('successfully') ? 'success' : 'danger'} />
      </div>
    );
  }

  // Buyer: item detail view
  if (userType === 'buyer' && viewingItem) {
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
          {viewingItem.quantity === 0 ? 'Sold Out' : addedToCart[viewingItem.id] ? '✓ Added to Cart!' : `Add ${selectedQuantity} to Cart`}
        </IonButton>
        {renderPhotoViewer()}
      </div>
    );
  }

  // Seller: category browse list
  if (userType === 'seller') {
    return (
      <div style={{ padding: '16px' }}>
        {banner}
        <IonAccordionGroup>
          {Object.entries(musicalEquipmentCategories).map(([category, categoryData]) => (
            <IonAccordion key={category} value={category}>
              <IonItem slot="header" style={{ '--background': 'transparent' }}>
                {/* TODO: replace musicalNotesOutline with a category-specific PNG when asset is available */}
                <IonIcon icon={musicalNotesOutline} style={{ fontSize: '24px', color: categoryData.color, marginRight: '12px' }} />
                <IonLabel>
                  <h3 style={{ margin: '0', fontWeight: 'bold', color: categoryData.color, fontSize: '16px' }}>{category}</h3>
                </IonLabel>
              </IonItem>
              <div slot="content" style={{ padding: '8px' }}>
                <IonGrid>
                  <IonRow>
                    {categoryData.items.map((item, index) => (
                      <IonCol size="6" key={index}>
                        <IonCard button onClick={() => { setSelectedItem(item); setShowItemDetails(true); }} style={{ backgroundColor: 'transparent', border: '1px solid #444' }}>
                          <IonCardContent style={{ textAlign: 'center', padding: '12px' }}>
                            <IonIcon icon={musicalNotesOutline} size="large" style={{ marginBottom: '8px', opacity: 0.5 }} />
                            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{item}</div>
                          </IonCardContent>
                        </IonCard>
                      </IonCol>
                    ))}
                  </IonRow>
                </IonGrid>
              </div>
            </IonAccordion>
          ))}
        </IonAccordionGroup>
        <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMessage} duration={2000} position="bottom" color={toastMessage.includes('successfully') ? 'success' : 'danger'} />
      </div>
    );
  }

  // Buyer: filtered listings
  const allFilteredItems = getFilteredItems();
  const categorizedItems = new Set();

  return (
    <div style={{ padding: '16px' }}>
      {banner}

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {([
            { label: 'All', value: undefined },
            { label: 'Brand new', value: 1 },
            { label: 'Like new', value: 2 },
            { label: 'Used - good', value: 3 },
            { label: 'Used - worn', value: 4 },
          ] as { label: string; value: number | undefined }[]).map(c => (
            <button key={c.label} onClick={() => setConditionFilter(c.value)} style={{
              padding: '5px 12px', borderRadius: '20px', border: 'none',
              backgroundColor: conditionFilter === c.value ? '#8E44AD' : '#f0f0f0',
              color: conditionFilter === c.value ? 'white' : '#555',
              fontSize: '12px', fontWeight: conditionFilter === c.value ? '600' : '400',
              cursor: 'pointer', whiteSpace: 'nowrap'
            }}>{c.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IonInput label="From (R)" labelPlacement="floating" type="number" value={priceRange.min}
            onIonChange={e => setPriceRange({ ...priceRange, min: e.detail.value! })} placeholder="0" />
          <span style={{ color: '#bbb', fontWeight: 'bold', flexShrink: 0 }}>—</span>
          <IonInput label="To (R)" labelPlacement="floating" type="number" value={priceRange.max}
            onIonChange={e => setPriceRange({ ...priceRange, max: e.detail.value! })} placeholder="Any" />
        </div>
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
                {/* TODO: replace musicalNotesOutline with a category-specific PNG when asset is available */}
                <IonIcon icon={musicalNotesOutline} style={{ fontSize: '24px', color: categoryData.color, marginRight: '12px' }} />
                <IonLabel>
                  <h3 style={{ margin: '0', fontWeight: 'bold', color: categoryData.color, fontSize: '16px' }}>
                    {category} ({categoryItems.length})
                  </h3>
                </IonLabel>
              </IonItem>
              <div slot="content" style={{ padding: '8px' }}>
                {categoryItems.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>No items listed yet in this category</div>
                ) : (
                  <IonGrid>
                    <IonRow>
                      {categoryItems.map(item => (
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
                  <h3 style={{ margin: '0', fontWeight: 'bold', color: '#95A5A6', fontSize: '16px' }}>Other ({otherItems.length})</h3>
                </IonLabel>
              </IonItem>
              <div slot="content" style={{ padding: '8px' }}>
                <IonGrid>
                  <IonRow>
                    {otherItems.map(item => (
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

export default MusicalEquipmentComponent;
