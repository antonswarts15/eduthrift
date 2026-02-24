import React, { useState, useEffect } from 'react';
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
import { cameraOutline, imageOutline, manOutline, womanOutline, roseOutline, ribbonOutline, diamondOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { useCartStore } from '../../stores/cartStore';
import { useListingsStore } from '../../stores/listingsStore';


interface MatricDanceProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'all';
}

const MatricDanceComponent: React.FC<MatricDanceProps> = ({ userType, onItemSelect, categoryFilter = 'all' }) => {
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [condition, setCondition] = useState<number | undefined>();
  const [price, setPrice] = useState('');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const [size, setSize] = useState('');
  const [showItemView, setShowItemView] = useState(false);
  const [selectedAvailableItem, setSelectedAvailableItem] = useState<any>(null);
  const [sizeFilter, setSizeFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState<number | undefined>();
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
  const [addedToCartId, setAddedToCartId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { addToCart } = useCartStore();
  const { listings, fetchListings } = useListingsStore();

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '4', '6', '8', '10', '12', '14', '16'];

  const getFilteredItems = (gender?: string) => {
    let items = listings.filter(listing => {
      if (listing.category !== 'Matric dance clothing') return false;
      if (gender && listing.gender !== gender && listing.gender !== 'Unisex') return false;
      return true;
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
      category: 'Matric dance clothing',
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

  const categories = {
    'Dresses': {
      items: ['Evening dress', 'Cocktail dress', 'Ball gown', 'A-line dress', 'Mermaid dress', 'Prom dress'],
      icon: roseOutline,
      color: '#E74C3C'
    },
    'Suits & Formal Wear': {
      items: ['Tuxedo', 'Suit', 'Blazer', 'Dress shirt', 'Bow tie', 'Tie', 'Waistcoat', 'Dress pants'],
      icon: ribbonOutline,
      color: '#2C3E50'
    },
    'Accessories & Shoes': {
      items: ['Formal shoes', 'Heels', 'Clutch bag', 'Jewelry', 'Cufflinks', 'Pocket square', 'Belt'],
      icon: diamondOutline,
      color: '#8E44AD'
    }
  };

  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    setShowItemDetails(true);
  };

  const handleAvailableItemClick = (item: any) => {
    setSelectedAvailableItem(item);
    setShowItemView(true);
  };

  const handlePhotoUpload = (type: 'front' | 'back') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (type === 'front') {
            setFrontPhoto(event.target?.result as string);
          } else {
            setBackPhoto(event.target?.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSubmit = () => {
    const itemData = {
      item: selectedItem,
      size,
      condition,
      price,
      frontPhoto,
      backPhoto,
      gender: selectedGender
    };
    onItemSelect?.(itemData);
    setShowItemDetails(false);
    setSelectedItem('');
    setSize('');
  };

  if (showItemView && selectedAvailableItem) {
    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => setShowItemView(false)}>← Back</IonButton>

        <div style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
          <span style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#666'
          }}>
            {selectedAvailableItem.item}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px', margin: '16px 0', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <IonButton
              fill="clear"
              onClick={() => setZoomedPhoto(selectedAvailableItem.frontPhoto)}
              style={{ padding: 0, margin: 0, '--border-radius': '8px' }}
            >
              <img
                src={selectedAvailableItem.frontPhoto}
                alt="Front view"
                style={{
                  width: '150px', height: '200px', borderRadius: '8px',
                  objectFit: 'cover', border: '1px solid #ddd'
                }}
              />
            </IonButton>
            <p style={{ fontSize: '12px', margin: '4px 0', fontWeight: 'bold' }}>Front</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <IonButton
              fill="clear"
              onClick={() => setZoomedPhoto(selectedAvailableItem.backPhoto)}
              style={{ padding: 0, margin: 0, '--border-radius': '8px' }}
            >
              <img
                src={selectedAvailableItem.backPhoto}
                alt="Back view"
                style={{
                  width: '150px', height: '200px', borderRadius: '8px',
                  objectFit: 'cover', border: '1px solid #ddd'
                }}
              />
            </IonButton>
            <p style={{ fontSize: '12px', margin: '4px 0', fontWeight: 'bold' }}>Back</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', margin: '16px 0' }}>
          <div style={{ marginBottom: '8px' }}><strong>Size:</strong> {selectedAvailableItem.size}</div>
          <div style={{ marginBottom: '8px' }}><strong>Condition:</strong> {getConditionText(selectedAvailableItem.condition)}</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#E74C3C' }}>R{selectedAvailableItem.price}</div>
        </div>

        <IonButton 
          expand="full" 
          onClick={() => handleAddToCart(selectedAvailableItem)}
          disabled={selectedAvailableItem.quantity === 0}
          style={{ 
            marginTop: '16px',
            '--background': addedToCartId === selectedAvailableItem.id ? '#28a745' : '',
            '--color': addedToCartId === selectedAvailableItem.id ? 'white' : ''
          }}
        >
          {selectedAvailableItem.quantity === 0 ? 'Sold Out' : 
           addedToCartId === selectedAvailableItem.id ? '✓ Added to Cart!' : 'Add to Cart'}
        </IonButton>
      </div>
    );
  }

  if (showItemDetails) {
    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => setShowItemDetails(false)}>← Back</IonButton>

        <div style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
          <span style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#666'
          }}>
            {selectedItem}
          </span>
        </div>

        <IonItem>
          <IonLabel position="stacked">Size</IonLabel>
          <IonSelect value={size} onIonChange={e => setSize(e.detail.value)} placeholder="Select Size">
            {sizes.map(sizeOption => (
              <IonSelectOption key={sizeOption} value={sizeOption}>{sizeOption}</IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Condition Grade</IonLabel>
          <IonSelect value={condition} onIonChange={e => setCondition(parseInt(e.detail.value))}>
            <IonSelectOption value={1}>1 - Brand new</IonSelectOption>
            <IonSelectOption value={2}>2 - Like new</IonSelectOption>
            <IonSelectOption value={3}>3 - Used but good</IonSelectOption>
            <IonSelectOption value={4}>4 - Used and worn</IonSelectOption>
          </IonSelect>
        </IonItem>

        {userType === 'seller' && (
          <>
            <IonItem>
              <IonInput label="Price (ZAR)" type="number" value={price} onIonChange={e => setPrice(e.detail.value!)} />
            </IonItem>

            <div style={{ display: 'flex', gap: '16px', margin: '16px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  onClick={() => handlePhotoUpload('front')}
                  style={{
                    width: '120px', height: '150px', border: '2px dashed #ccc', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    backgroundImage: frontPhoto ? `url(${frontPhoto})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center'
                  }}
                >
                  {!frontPhoto && <IonIcon icon={cameraOutline} size="large" />}
                </div>
                <p style={{ fontSize: '12px', margin: '4px 0' }}>Front Photo</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  onClick={() => handlePhotoUpload('back')}
                  style={{
                    width: '120px', height: '150px', border: '2px dashed #ccc', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    backgroundImage: backPhoto ? `url(${backPhoto})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center'
                  }}
                >
                  {!backPhoto && <IonIcon icon={cameraOutline} size="large" />}
                </div>
                <p style={{ fontSize: '12px', margin: '4px 0' }}>Back Photo</p>
              </div>
            </div>
          </>
        )}

        <IonButton expand="full" onClick={handleSubmit} style={{ marginTop: '16px' }}>
          {userType === 'seller' ? 'List Item' : 'Add to Cart'}
        </IonButton>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 16px 0' }}>Matric Dance</h2>

      {userType === 'buyer' ? (
        <div>
          <h3 style={{ margin: '16px 0', color: '#666' }}>Available Items</h3>

          {/* Filters */}
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

          <IonAccordionGroup>
            {['Boys', 'Girls', 'Unisex'].map((gender) => {
              const genderItems = getFilteredItems(gender);
              if (genderItems.length === 0) return null;

              return (
                <IonAccordion key={gender} value={gender}>
                  <IonItem slot="header" style={{ '--background': 'transparent' }}>
                    <IonIcon
                      icon={gender === 'Boys' ? manOutline : gender === 'Girls' ? womanOutline : diamondOutline}
                      style={{
                        fontSize: '24px',
                        color: gender === 'Boys' ? '#2C3E50' : gender === 'Girls' ? '#E74C3C' : '#8E44AD',
                        marginRight: '12px'
                      }}
                    />
                    <IonLabel>
                      <h3 style={{
                        margin: '0',
                        fontWeight: 'bold',
                        color: gender === 'Boys' ? '#2C3E50' : gender === 'Girls' ? '#E74C3C' : '#8E44AD',
                        fontSize: '16px'
                      }}>
                        {gender} ({genderItems.length})
                      </h3>
                    </IonLabel>
                  </IonItem>
                  <div slot="content" style={{ padding: '8px' }}>
                    <IonGrid>
                      <IonRow>
                        {genderItems.map((availableItem) => (
                          <IonCol size="6" key={availableItem.id}>
                            <IonCard button onClick={() => handleAvailableItemClick(availableItem)} style={{ backgroundColor: 'transparent', border: '1px solid #444' }}>
                              <IonCardContent style={{ padding: '8px' }}>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                                  <img
                                    src={availableItem.frontPhoto}
                                    alt="Front"
                                    style={{
                                      width: '50px', height: '60px', borderRadius: '4px',
                                      objectFit: 'cover'
                                    }}
                                  />
                                  <img
                                    src={availableItem.backPhoto}
                                    alt="Back"
                                    style={{
                                      width: '50px', height: '60px', borderRadius: '4px',
                                      objectFit: 'cover'
                                    }}
                                  />
                                </div>
                                <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                                  {availableItem.item}
                                </div>
                                <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>
                                  Size: {availableItem.size}
                                </div>
                                <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                                  Condition: {getConditionText(availableItem.condition)}
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#E74C3C' }}>
                                  R{availableItem.price}
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
            })}
          </IonAccordionGroup>
        </div>
      ) : (
        <IonAccordionGroup>
          {['Boys', 'Girls', 'Unisex'].map((gender) => (
            <IonAccordion key={gender} value={gender}>
              <IonItem slot="header" style={{ '--background': 'transparent' }}>
                <IonIcon
                  icon={gender === 'Boys' ? manOutline : gender === 'Girls' ? womanOutline : diamondOutline}
                  style={{
                    fontSize: '24px',
                    color: gender === 'Boys' ? '#2C3E50' : gender === 'Girls' ? '#E74C3C' : '#8E44AD',
                    marginRight: '12px'
                  }}
                />
                <IonLabel>
                  <h3 style={{
                    margin: '0',
                    fontWeight: 'bold',
                    color: gender === 'Boys' ? '#2C3E50' : gender === 'Girls' ? '#E74C3C' : '#8E44AD',
                    fontSize: '16px'
                  }}>
                    {gender}
                  </h3>
                </IonLabel>
              </IonItem>
              <div slot="content" style={{ padding: '8px' }}>
                <IonGrid>
                  <IonRow>
                    {Object.entries(categories).map(([category, categoryData]) => (
                      <IonCol size="12" key={category}>
                        <div style={{ marginBottom: '16px' }}>
                          <h4 style={{ margin: '0 0 8px 0', color: categoryData.color, fontSize: '14px' }}>
                            <IonIcon icon={categoryData.icon} style={{ marginRight: '8px' }} />
                            {category}
                          </h4>
                          <IonGrid>
                            <IonRow>
                              {categoryData.items.map((item: string, index: number) => (
                                <IonCol size="6" key={index}>
                                  <IonCard button onClick={() => handleItemClick(item)} style={{ backgroundColor: 'transparent', border: '1px solid #444' }}>
                                    <IonCardContent style={{ textAlign: 'center', padding: '12px' }}>
                                      <IonIcon icon={imageOutline} size="large" style={{ marginBottom: '8px', opacity: 0.5 }} />
                                      <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{item}</div>
                                    </IonCardContent>
                                  </IonCard>
                                </IonCol>
                              ))}
                            </IonRow>
                          </IonGrid>
                        </div>
                      </IonCol>
                    ))}
                  </IonRow>
                </IonGrid>
              </div>
            </IonAccordion>
          ))}
        </IonAccordionGroup>
      )}

      {/* Photo Zoom Overlay */}
      {zoomedPhoto && (
        <div
          onClick={() => setZoomedPhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            cursor: 'pointer'
          }}
        >
          <img
            src={zoomedPhoto}
            alt="Zoomed view"
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: '8px',
              touchAction: 'pinch-zoom'
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default MatricDanceComponent;