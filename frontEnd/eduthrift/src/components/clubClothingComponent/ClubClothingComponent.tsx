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
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBadge,
  IonToast
} from '@ionic/react';
import { cameraOutline, imageOutline, shirtOutline, bagOutline, peopleOutline, fitnessOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import ClubSelector from '../ClubSelector';
import { generatePlaceholder } from '../../utils/imagePlaceholder';
import { useCartStore } from '../../stores/cartStore';


interface ClubClothingProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  clubName?: string;
}

const ClubClothingComponent: React.FC<ClubClothingProps> = ({ userType, onItemSelect, categoryFilter = 'all', clubName: propClubName }) => {
  const [selectedItem, setSelectedItem] = useState('');
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [condition, setCondition] = useState<number | undefined>();
  const [price, setPrice] = useState('');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const [clubName, setClubName] = useState(propClubName || '');
  const [size, setSize] = useState('');
  const [showItemView, setShowItemView] = useState(false);
  const [selectedAvailableItem, setSelectedAvailableItem] = useState<any>(null);
  const [sizeFilter, setSizeFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState<number | undefined>();
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [addedToCartId, setAddedToCartId] = useState<number | null>(null);
  const { addToCart } = useCartStore();
  
  const getItemQuantity = (id: string, category: string) => {
    const item = availableItems.find(i => i.id.toString() === id);
    return item ? item.quantity : 0;
  };
  
  const decreaseInventory = (id: string, category: string) => {
    // Mock function
  };

  const childrenSizes = ['4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const teenSizes = ['XS (28)', 'S (30)', 'M (32)', 'L (34)', 'XL (36)', 'XXL (38)'];
  const bagSizes = ['One Size'];

  const availableItems = [
    {
      id: 1, item: 'Club jersey', size: 'M (32)', condition: 2, price: 95, quantity: 2,
      frontPhoto: generatePlaceholder('#E74C3C', 'Jersey Front', 150, 200),
      backPhoto: generatePlaceholder('#E74C3C', 'Jersey Back', 150, 200)
    },
    {
      id: 2, item: 'Training shirt', size: 'L (34)', condition: 1, price: 70, quantity: 1,
      frontPhoto: generatePlaceholder('#3498DB', 'Training Front', 150, 200),
      backPhoto: generatePlaceholder('#3498DB', 'Training Back', 150, 200)
    },
    {
      id: 3, item: 'Club shorts', size: 'M (32)', condition: 3, price: 55, quantity: 3,
      frontPhoto: generatePlaceholder('#27AE60', 'Shorts Front', 150, 200),
      backPhoto: generatePlaceholder('#27AE60', 'Shorts Back', 150, 200)
    },
    {
      id: 4, item: 'Club tracksuit', size: 'L (34)', condition: 2, price: 160, quantity: 0,
      frontPhoto: generatePlaceholder('#8E44AD', 'Tracksuit Front', 150, 200),
      backPhoto: generatePlaceholder('#8E44AD', 'Tracksuit Back', 150, 200)
    },
    {
      id: 5, item: 'Club bag', size: 'One Size', condition: 1, price: 85, quantity: 1,
      frontPhoto: generatePlaceholder('#F39C12', 'Bag Front', 150, 200),
      backPhoto: generatePlaceholder('#F39C12', 'Bag Back', 150, 200)
    }
  ];

  const getAllAvailableItems = () => {
    if (userType === 'buyer' && clubName) {
      return availableItems;
    }
    return [];
  };

  const getFilteredItems = () => {
    let items = getAllAvailableItems();
    
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
    const currentQuantity = getItemQuantity(item.id.toString(), 'club-clothing');
    if (currentQuantity === 0) {
      setToastMessage(`${item.item} is sold out!`);
      setShowToast(true);
      return;
    }

    const cartItem = {
      id: item.id,
      name: item.item,
      description: `${item.item} - Size: ${item.size}`,
      price: item.price,
      condition: item.condition,
      school: '',
      size: item.size,
      gender: '',
      frontPhoto: item.frontPhoto,
      backPhoto: item.backPhoto,
      category: 'Club Clothing',
      quantity: 1
    };

    addToCart(cartItem, (message, color) => {
      setAddedToCartId(item.id);
      setTimeout(() => setAddedToCartId(null), 2000);
    });
    decreaseInventory(item.id.toString(), 'club-clothing');
  };

  const getConditionText = (condition: number) => {
    const conditions = { 1: 'Brand new', 2: 'Like new', 3: 'Used but good', 4: 'Used and worn' };
    return conditions[condition as keyof typeof conditions] || 'Unknown';
  };

  const clubCategories = {
    'Boys Club Wear': {
      items: ['Club jersey', 'Training shirt', 'Club shorts', 'Club socks', 'Warm-up jacket', 'Club polo', 'Training vest', 'Club hoodie'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Girls Club Wear': {
      items: ['Club jersey', 'Training shirt', 'Club shorts', 'Club skirt', 'Club socks', 'Warm-up jacket', 'Club polo', 'Training vest', 'Club hoodie'],
      icon: shirtOutline,
      color: '#E74C3C'
    },
    'Unisex Items': {
      items: ['Club tracksuit', 'Training shorts', 'Training pants', 'Base layer', 'Compression shirt', 'Training bib', 'Sweatshirt', 'Club bag', 'Water bottle', 'Club cap', 'Club scarf', 'Wristbands', 'Club towel', 'Equipment bag'],
      icon: bagOutline,
      color: '#27AE60'
    }
  };

  const getFilteredCategories = () => {
    return clubCategories;
  };

  const getSizeOptions = (item: string) => {
    const bagItems = ['Club bag', 'Equipment bag', 'Water bottle'];
    if (bagItems.includes(item)) {
      return bagSizes;
    }
    return [...childrenSizes, ...teenSizes];
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
      clubName
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
        
        {/* Prominent Club Header */}
        {clubName && (
          <div style={{ 
            marginBottom: '20px', 
            textAlign: 'center', 
            backgroundColor: 'rgba(231, 76, 60, 0.1)', 
            border: '2px solid #E74C3C', 
            borderRadius: '12px', 
            padding: '16px' 
          }}>
            <IonIcon 
              icon={peopleOutline} 
              style={{ 
                fontSize: '32px', 
                color: '#E74C3C', 
                marginBottom: '8px' 
              }} 
            />
            <h2 style={{ 
              margin: '0', 
              color: '#E74C3C', 
              fontSize: '18px', 
              fontWeight: 'bold' 
            }}>
              {clubName}
            </h2>
            <p style={{ 
              margin: '4px 0 0 0', 
              color: '#666', 
              fontSize: '14px' 
            }}>
              Selected Club
            </p>
          </div>
        )}
        
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
              style={{ 
                '--padding-start': '0', 
                '--padding-end': '0',
                width: '150px', 
                height: '200px'
              }}
              onClick={() => setZoomedPhoto(selectedAvailableItem.frontPhoto)}
            >
              <div style={{
                width: '150px', height: '200px', borderRadius: '8px',
                backgroundImage: `url(${selectedAvailableItem.frontPhoto})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                border: '1px solid #ddd'
              }} />
            </IonButton>
            <p style={{ fontSize: '12px', margin: '4px 0', fontWeight: 'bold' }}>Front</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <IonButton 
              fill="clear" 
              style={{ 
                '--padding-start': '0', 
                '--padding-end': '0',
                width: '150px', 
                height: '200px'
              }}
              onClick={() => setZoomedPhoto(selectedAvailableItem.backPhoto)}
            >
              <div style={{
                width: '150px', height: '200px', borderRadius: '8px',
                backgroundImage: `url(${selectedAvailableItem.backPhoto})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                border: '1px solid #ddd'
              }} />
            </IonButton>
            <p style={{ fontSize: '12px', margin: '4px 0', fontWeight: 'bold' }}>Back</p>
          </div>
        </div>
        
        {/* Photo Zoom Overlay */}
        {zoomedPhoto && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setZoomedPhoto(null)}
          >
            <div 
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '20px',
                maxWidth: '90%',
                maxHeight: '90%',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  zIndex: 10
                }}
                onClick={() => setZoomedPhoto(null)}
              >
                ×
              </button>
              <img 
                src={zoomedPhoto}
                alt="Zoomed view"
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  touchAction: 'pinch-zoom'
                }}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', margin: '16px 0' }}>
          <div style={{ marginBottom: '8px' }}><strong>Size:</strong> {selectedAvailableItem.size}</div>
          <div style={{ marginBottom: '8px' }}><strong>Condition:</strong> {getConditionText(selectedAvailableItem.condition)}</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#E74C3C' }}>R{selectedAvailableItem.price}</div>
        </div>

        <IonButton 
          expand="full" 
          onClick={() => handleAddToCart(selectedAvailableItem)}
          disabled={getItemQuantity(selectedAvailableItem.id.toString(), 'club-clothing') === 0}
          style={{ 
            marginTop: '16px',
            '--background': addedToCartId === selectedAvailableItem.id ? '#28a745' : '',
            '--color': addedToCartId === selectedAvailableItem.id ? 'white' : ''
          }}
        >
          {getItemQuantity(selectedAvailableItem.id.toString(), 'club-clothing') === 0 ? 'Sold Out' : 
           addedToCartId === selectedAvailableItem.id ? '✓ Added to Cart!' : 'Add to Cart'}
        </IonButton>
      </div>
    );
  }

  if (showItemDetails) {
    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => setShowItemDetails(false)}>← Back</IonButton>
        
        {/* Prominent Club Header */}
        {clubName && (
          <div style={{ 
            marginBottom: '20px', 
            textAlign: 'center', 
            backgroundColor: 'rgba(231, 76, 60, 0.1)', 
            border: '2px solid #E74C3C', 
            borderRadius: '12px', 
            padding: '16px' 
          }}>
            <IonIcon 
              icon={peopleOutline} 
              style={{ 
                fontSize: '32px', 
                color: '#E74C3C', 
                marginBottom: '8px' 
              }} 
            />
            <h2 style={{ 
              margin: '0', 
              color: '#E74C3C', 
              fontSize: '18px', 
              fontWeight: 'bold' 
            }}>
              {clubName}
            </h2>
            <p style={{ 
              margin: '4px 0 0 0', 
              color: '#666', 
              fontSize: '14px' 
            }}>
              Selected Club
            </p>
          </div>
        )}
        
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
            {getSizeOptions(selectedItem).map(sizeOption => (
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
      {categoryFilter === 'all' && <h2>Club Clothing</h2>}
      
      {/* Prominent Club Header */}
      {propClubName && (
        <div style={{ 
          marginBottom: '20px', 
          textAlign: 'center', 
          backgroundColor: 'rgba(231, 76, 60, 0.1)', 
          border: '2px solid #E74C3C', 
          borderRadius: '12px', 
          padding: '16px' 
        }}>
          <IonIcon 
            icon={peopleOutline} 
            style={{ 
              fontSize: '32px', 
              color: '#E74C3C', 
              marginBottom: '8px' 
            }} 
          />
          <h2 style={{ 
            margin: '0', 
            color: '#E74C3C', 
            fontSize: '18px', 
            fontWeight: 'bold' 
          }}>
            {propClubName}
          </h2>
          <p style={{ 
            margin: '4px 0 0 0', 
            color: '#666', 
            fontSize: '14px' 
          }}>
            Selected Club
          </p>
        </div>
      )}
      
      {/* Club Selection - only show if no club name provided */}
      {!propClubName && (
        <div style={{ marginBottom: '20px' }}>
          <ClubSelector 
            value={clubName} 
            onClubChange={setClubName}
            placeholder="Select or enter club name"
          />
        </div>
      )}

      {/* Available Items Grid for Buyers or Category Selection for Sellers */}
      {userType === 'buyer' && clubName ? (
        <div>
          <h3 style={{ margin: '16px 0', color: '#666' }}>Available Items from {clubName}</h3>
          
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
            {Object.entries(getFilteredCategories()).map(([category, categoryData]) => {
              const categoryItems = getFilteredItems().filter(item => {
                if (category === 'Boys Club Wear') {
                  return categoryData.items.includes(item.item);
                } else if (category === 'Girls Club Wear') {
                  return categoryData.items.includes(item.item);
                } else if (category === 'Unisex Items') {
                  return categoryData.items.includes(item.item);
                }
                return false;
              });
              
              if (categoryItems.length === 0) return null;
              
              return (
                <IonAccordion key={category} value={category}>
                  <IonItem slot="header" style={{ '--background': 'transparent' }}>
                    <IonIcon 
                      icon={categoryData.icon} 
                      style={{ 
                        fontSize: '24px', 
                        color: categoryData.color, 
                        marginRight: '12px'
                      }} 
                    />
                    <IonLabel>
                      <h3 style={{ 
                        margin: '0', 
                        fontWeight: 'bold', 
                        color: categoryData.color,
                        fontSize: '16px'
                      }}>
                        {category} ({categoryItems.length})
                      </h3>
                    </IonLabel>
                  </IonItem>
                  <div slot="content" style={{ padding: '8px' }}>
                    <IonGrid>
                      <IonRow>
                        {categoryItems.map((availableItem) => (
                          <IonCol size="6" key={availableItem.id}>
                            <IonCard button onClick={() => handleAvailableItemClick(availableItem)} style={{ backgroundColor: 'transparent', border: '1px solid #444' }}>
                              <IonCardContent style={{ padding: '8px' }}>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                                  <div style={{
                                    width: '50px', height: '60px', borderRadius: '4px',
                                    backgroundImage: `url(${availableItem.frontPhoto})`,
                                    backgroundSize: 'cover', backgroundPosition: 'center'
                                  }} />
                                  <div style={{
                                    width: '50px', height: '60px', borderRadius: '4px',
                                    backgroundImage: `url(${availableItem.backPhoto})`,
                                    backgroundSize: 'cover', backgroundPosition: 'center'
                                  }} />
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#E74C3C' }}>
                                    R{availableItem.price}
                                  </div>
                                  {getItemQuantity(availableItem.id.toString(), 'club-clothing') > 0 ? (
                                    <IonBadge color="success" style={{ fontSize: '9px' }}>
                                      <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '2px', fontSize: '10px' }} />
                                      {getItemQuantity(availableItem.id.toString(), 'club-clothing')} available
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
            })}
          </IonAccordionGroup>
        </div>
      ) : (
        <IonAccordionGroup disabled={!clubName}>
          {Object.entries(getFilteredCategories()).map(([category, categoryData]) => (
            <IonAccordion key={category} value={category} disabled={!clubName}>
              <IonItem slot="header" style={{ '--background': 'transparent', opacity: !clubName ? 0.5 : 1 }}>
                <IonIcon 
                  icon={categoryData.icon} 
                  style={{ 
                    fontSize: '24px', 
                    color: categoryData.color, 
                    marginRight: '12px'
                  }} 
                />
                <IonLabel>
                  <h3 style={{ 
                    margin: '0', 
                    fontWeight: 'bold', 
                    color: categoryData.color,
                    fontSize: '16px'
                  }}>
                    {category}
                  </h3>
                </IonLabel>
              </IonItem>
              <div slot="content" style={{ padding: '8px' }}>
                <IonGrid>
                  <IonRow>
                    {categoryData.items.map((item: string, index: number) => (
                      <IonCol size="6" key={index}>
                        <IonCard button onClick={() => clubName && handleItemClick(item)} style={{ backgroundColor: 'transparent', border: '1px solid #444', opacity: !clubName ? 0.5 : 1, cursor: !clubName ? 'not-allowed' : 'pointer' }}>
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
            </IonAccordion>
          ))}
        </IonAccordionGroup>
      )}
      
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

export default ClubClothingComponent;