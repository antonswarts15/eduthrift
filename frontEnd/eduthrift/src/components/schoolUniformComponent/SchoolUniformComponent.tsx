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
import { cameraOutline, imageOutline, shirtOutline, bagOutline, schoolOutline, peopleOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import SchoolSelector from '../SchoolSelector';
import { useCartStore } from '../../stores/cartStore';
import { useListingsStore, Listing } from '../../stores/listingsStore';
import { validateImageFile } from '../../utils/imageEnhancer';


interface SchoolUniformProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
}

const SchoolUniformComponent: React.FC<SchoolUniformProps> = ({ userType, onItemSelect, categoryFilter = 'all', schoolName: propSchoolName }) => {
  const [selectedItem, setSelectedItem] = useState('');
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [condition, setCondition] = useState<number | undefined>();
  const [price, setPrice] = useState('');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState(propSchoolName || '');
  const [size, setSize] = useState('');
  const [showItemView, setShowItemView] = useState(false);
  const [selectedAvailableItem, setSelectedAvailableItem] = useState<any>(null);
  const [sizeFilter, setSizeFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState<number | undefined>();
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [photoViewer, setPhotoViewer] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [addedToCartId, setAddedToCartId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToCart } = useCartStore();
  const { listings, fetchListings, addListing } = useListingsStore();

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const childrenSizes = ['4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const teenSizes = ['XS (28)', 'S (30)', 'M (32)', 'L (34)', 'XL (36)', 'XXL (38)'];
  const bagSizes = ['One Size'];

  const getFilteredItems = () => {
    if (userType !== 'buyer' || !schoolName) {
      console.log('SchoolUniform: Not showing items - userType:', userType, 'schoolName:', schoolName);
      return [];
    }

    console.log('SchoolUniform: Filtering items for school:', schoolName);
    console.log('SchoolUniform: Total listings:', listings.length);
    
    let items = listings.filter(listing => {
      if (listing.category !== 'School & sport uniform') return false;
      if (listing.school !== schoolName) return false;
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
    
    console.log('SchoolUniform: Filtered items for', schoolName, ':', items.length);
    
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

  const getConditionText = (condition: number) => {
    const conditions = { 1: 'Brand new', 2: 'Like new', 3: 'Used but good', 4: 'Used and worn' };
    return conditions[condition as keyof typeof conditions] || 'Unknown';
  };

  const uniformCategories = {
    'Boys Uniform': {
      items: ['Short sleeve shirts', 'Long sleeve shirts', 'Trousers', 'Shorts', 'Jersey or pullover', 'Blazer', 'Tie'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Girls Uniform': {
      items: ['Blouse','Short sleeve shirts', 'Long sleeve shirts', 'Trousers', 'Skirt or tunic', 'Dress', 'Jersey or pullover', 'Blazer', 'Tie', 'Tights'],
      icon: shirtOutline,
      color: '#E74C3C'
    },
    'Unisex Items': {
      items: ['School tracksuit', 'School T-shirt', 'Socks','PE shorts', 'Rain jacket', 'Windbreaker', 'Hat or cap', 'Beanie/scarf/gloves', 'School bag', 'Drimac', 'Duffelbag', 'Sportsbag', 'Lunchbag', 'Totebag', 'Backpack', 'Suitcase'],
      icon: bagOutline,
      color: '#27AE60'
    }
  };

  const getFilteredCategories = () => {
    switch (categoryFilter) {
      case 'clothing':
        return { 
          'Boys Uniform': uniformCategories['Boys Uniform'],
          'Girls Uniform': uniformCategories['Girls Uniform'],
          'Unisex Items': {
            ...uniformCategories['Unisex Items'],
            items: uniformCategories['Unisex Items'].items.filter(item => 
              !['School bag', 'Drimac', 'Duffelbag', 'Sportsbag', 'Lunchbag', 'Totebag', 'Backpack', 'Suitcase'].includes(item)
            )
          }
        };
      default:
        return uniformCategories;
    }
  };

  const getSizeOptions = (item: string) => {
    const bagItems = ['School bag', 'Drimac', 'Duffelbag', 'Sportsbag', 'Lunchbag', 'Totebag', 'Backpack', 'Suitcase'];
    if (bagItems.includes(item)) {
      return bagSizes;
    }
    return [...childrenSizes, ...teenSizes];
  };

  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    setShowItemDetails(true);
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
      school: schoolName,
      size: item.size,
      gender: item.gender || '',
      frontPhoto: item.frontPhoto,
      backPhoto: item.backPhoto,
      category: item.category || 'School Uniform',
      subcategory: item.subcategory,
      sport: item.sport,
      quantity: 1
    };

    addToCart(cartItem);
    setAddedToCartId(item.id);
    setTimeout(() => setAddedToCartId(null), 2000);
  };

  const handleAvailableItemClick = (item: any) => {
    setSelectedAvailableItem(item);
    setShowItemView(true);
  };

  const handlePhotoUpload = (type: 'front' | 'back') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          setToastMessage(validation.error || 'Invalid image file');
          setShowToast(true);
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          if (type === 'front') {
            setFrontPhoto(event.target?.result as string);
          } else {
            setBackPhoto(event.target?.result as string);
          }
        };
        reader.onerror = () => {
          setToastMessage('Failed to read image file. Please try a different image.');
          setShowToast(true);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const renderPhotoViewer = () => {
    if (!photoViewer) return null;
    
    return createPortal(
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={() => setPhotoViewer(null)}
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
            onClick={() => setPhotoViewer(null)}
          >
            ×
          </button>
          <img 
            src={photoViewer}
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
      </div>,
      document.body
    );
  };



  const handleSubmit = async () => {
    console.log('SchoolUniform: handleSubmit called, userType:', userType);
    if (userType === 'seller') {
      const missingFields = [];
      if (!size) missingFields.push('Size');
      if (!condition) missingFields.push('Condition');
      if (!price) missingFields.push('Price');
      if (!frontPhoto) missingFields.push('Front Photo');
      if (!backPhoto) missingFields.push('Back Photo');
      
      if (missingFields.length > 0) {
        console.log('SchoolUniform: Missing fields:', missingFields);
        setToastMessage(`Please fill in: ${missingFields.join(', ')}`);
        setShowToast(true);
        return;
      }

      const itemData = {
        id: Date.now().toString(),
        name: selectedItem,
        description: `${selectedItem} - Size: ${size}`,
        school: schoolName,
        gender: 'Unisex',
        size,
        condition: condition || 1,
        price: parseInt(price),
        frontPhoto: frontPhoto || '',
        backPhoto: backPhoto || '',
        category: 'School & sport uniform',
        dateCreated: new Date().toLocaleDateString(),
        quantity: 1
      };

      console.log('SchoolUniform: Submitting item:', itemData.name);
      setIsSubmitting(true);
      
      try {
        await addListing(itemData);
        console.log('SchoolUniform: Item listed successfully');
        setToastMessage(`${selectedItem} listed successfully!`);
        setShowToast(true);
        setShowItemDetails(false);
        setSelectedItem('');
        setSize('');
        setCondition(undefined);
        setPrice('');
        setFrontPhoto(null);
        setBackPhoto(null);
      } catch (error: any) {
        console.error('SchoolUniform: Error listing item:', error);
        setToastMessage(error.message || 'Failed to list item');
        setShowToast(true);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const itemData = {
        item: selectedItem,
        size,
        condition,
        price,
        frontPhoto,
        backPhoto,
        schoolName
      };
      onItemSelect?.(itemData);
      setShowItemDetails(false);
      setSelectedItem('');
      setSize('');
    }
  };

  if (showItemView && selectedAvailableItem) {
    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => setShowItemView(false)}>← Back</IonButton>
        
        {/* Prominent School Header */}
        {schoolName && (
          <div style={{ 
            marginBottom: '20px', 
            textAlign: 'center', 
            backgroundColor: 'rgba(52, 152, 219, 0.1)', 
            border: '2px solid #3498DB', 
            borderRadius: '12px', 
            padding: '16px' 
          }}>
            <IonIcon 
              icon={schoolOutline} 
              style={{ 
                fontSize: '32px', 
                color: '#3498DB', 
                marginBottom: '8px' 
              }} 
            />
            <h2 style={{ 
              margin: '0', 
              color: '#3498DB', 
              fontSize: '18px', 
              fontWeight: 'bold' 
            }}>
              {schoolName}
            </h2>
            <p style={{ 
              margin: '4px 0 0 0', 
              color: '#666', 
              fontSize: '14px' 
            }}>
              Selected School
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
            <img
              src={selectedAvailableItem.frontPhoto}
              alt="Front view"
              onClick={() => setPhotoViewer(selectedAvailableItem.frontPhoto)}
              style={{
                width: '150px', height: '200px', borderRadius: '8px',
                objectFit: 'cover', border: '1px solid #ddd', cursor: 'pointer'
              }}
            />
            <p style={{ fontSize: '12px', margin: '4px 0', fontWeight: 'bold' }}>Front</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img
              src={selectedAvailableItem.backPhoto}
              alt="Back view"
              onClick={() => setPhotoViewer(selectedAvailableItem.backPhoto)}
              style={{
                width: '150px', height: '200px', borderRadius: '8px',
                objectFit: 'cover', border: '1px solid #ddd', cursor: 'pointer'
              }}
            />
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
        {renderPhotoViewer()}
      </div>
    );
  }

  if (showItemDetails) {
    const availableItems = getFilteredItems().filter(listing => listing.item === selectedItem);

    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => setShowItemDetails(false)}>← Back</IonButton>

        {/* Prominent School Header */}
        {schoolName && (
          <div style={{
            marginBottom: '20px',
            textAlign: 'center',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            border: '2px solid #3498DB',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <IonIcon
              icon={schoolOutline}
              style={{
                fontSize: '32px',
                color: '#3498DB',
                marginBottom: '8px'
              }}
            />
            <h2 style={{
              margin: '0',
              color: '#3498DB',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              {schoolName}
            </h2>
            <p style={{
              margin: '4px 0 0 0',
              color: '#666',
              fontSize: '14px'
            }}>
              Selected School
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

        {userType === 'buyer' ? (
          <>
            {availableItems.length > 0 ? (
              <div style={{ margin: '16px 0' }}>
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{ margin: '0', color: '#666', fontSize: '14px' }}>Available ({availableItems.length})</h4>
                </div>
                {availableItems.map(item => (
                  <IonCard key={item.id} style={{ margin: '8px 0' }}>
                    <IonCardContent style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                          <div
                            style={{
                              width: '40px', height: '50px', backgroundColor: item.frontPhoto ? 'transparent' : '#f0f0f0',
                              border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontSize: '8px', color: '#999', textAlign: 'center',
                              lineHeight: '1.2', cursor: 'pointer',
                              backgroundImage: item.frontPhoto ? `url(${item.frontPhoto})` : 'none',
                              backgroundSize: 'cover', backgroundPosition: 'center'
                            }}
                            onClick={() => setPhotoViewer(item.frontPhoto)}
                          >
                            {!item.frontPhoto && 'Front'}
                          </div>
                          <div
                            style={{
                              width: '40px', height: '50px', backgroundColor: item.backPhoto ? 'transparent' : '#f0f0f0',
                              border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontSize: '8px', color: '#999', textAlign: 'center',
                              lineHeight: '1.2', cursor: 'pointer',
                              backgroundImage: item.backPhoto ? `url(${item.backPhoto})` : 'none',
                              backgroundSize: 'cover', backgroundPosition: 'center'
                            }}
                            onClick={() => setPhotoViewer(item.backPhoto)}
                          >
                            {!item.backPhoto && 'Back'}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.school}</span>
                            {item.quantity === 0 ? (
                              <IonBadge color="danger" style={{ fontSize: '9px' }}>
                                <IonIcon icon={closeCircleOutline} style={{ marginRight: '2px', fontSize: '10px' }} />
                                Sold Out
                              </IonBadge>
                            ) : (
                              <IonBadge color="success" style={{ fontSize: '9px' }}>
                                <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '2px', fontSize: '10px' }} />
                                {item.quantity} left
                              </IonBadge>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '6px', fontSize: '12px', color: '#666' }}>
                            <span>Size: {item.size}</span>
                            <span>{getConditionText(item.condition)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#3880ff' }}>R{item.price}</span>
                            <IonButton
                              size="small"
                              onClick={() => {
                                handleAddToCart(item);
                              }}
                              disabled={item.quantity === 0}
                              style={{
                                '--background': addedToCartId === item.id ? '#28a745' : '',
                                '--color': addedToCartId === item.id ? 'white' : ''
                              }}
                            >
                              {item.quantity === 0 ? 'Sold Out' :
                               addedToCartId === item.id ? '✓ Added!' : 'Add to Cart'}
                            </IonButton>
                          </div>
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                ))}
              </div>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: '#666', backgroundColor: '#f8f9fa', borderRadius: '8px', margin: '16px 0' }}>
                <p style={{ margin: '0' }}>No {selectedItem} available yet</p>
              </div>
            )}
          </>
        ) : (
          <>
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

            <IonButton expand="full" onClick={() => { console.log('Button clicked!'); handleSubmit(); }} disabled={isSubmitting} style={{ marginTop: '16px' }}>
              {isSubmitting ? 'Listing...' : 'List Item'}
            </IonButton>
          </>
        )}
        {renderPhotoViewer()}
      </div>
    );
  }

  return (
    <div>
      {categoryFilter === 'all' && <h2>School Uniform</h2>}
      
      {/* Prominent School Header */}
      {propSchoolName && (
        <div style={{ 
          marginBottom: '20px', 
          textAlign: 'center', 
          backgroundColor: 'rgba(52, 152, 219, 0.1)', 
          border: '2px solid #3498DB', 
          borderRadius: '12px', 
          padding: '16px' 
        }}>
          <IonIcon 
            icon={schoolOutline} 
            style={{ 
              fontSize: '32px', 
              color: '#3498DB', 
              marginBottom: '8px' 
            }} 
          />
          <h2 style={{ 
            margin: '0', 
            color: '#3498DB', 
            fontSize: '18px', 
            fontWeight: 'bold' 
          }}>
            {propSchoolName}
          </h2>
          <p style={{ 
            margin: '4px 0 0 0', 
            color: '#666', 
            fontSize: '14px' 
          }}>
            Selected School
          </p>
        </div>
      )}
      
      {/* School Selection - only show if no school name provided */}
      {!propSchoolName && (
        <div style={{ marginBottom: '20px' }}>
          <SchoolSelector 
            value={schoolName} 
            onSchoolChange={setSchoolName}
            placeholder="Select or enter school name"
          />
        </div>
      )}

      {/* Available Items Grid for Buyers or Category Selection for Sellers */}
      {userType === 'buyer' && schoolName ? (
        <IonAccordionGroup>
          {Object.entries(getFilteredCategories()).map(([category, categoryData]) => (
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
                    {category}
                  </h3>
                </IonLabel>
              </IonItem>
              <div slot="content" style={{ padding: '8px' }}>
                <IonGrid>
                  <IonRow>
                    {categoryData.items.map((item: string, index: number) => {
                      const itemCount = getFilteredItems().filter(listing => listing.item === item).reduce((total: number, listing: any) => total + listing.quantity, 0);
                      return (
                        <IonCol size="6" key={index}>
                          <IonCard button onClick={() => handleItemClick(item)} style={{ backgroundColor: 'transparent', border: '1px solid #444' }}>
                            <IonCardContent style={{ textAlign: 'center', padding: '12px' }}>
                              <IonIcon icon={imageOutline} size="large" style={{ marginBottom: '8px', opacity: 0.5 }} />
                              <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{item}</div>
                              {itemCount > 0 && (
                                <div style={{ fontSize: '11px', color: '#3498DB', marginTop: '4px' }}>
                                  {itemCount} available
                                </div>
                              )}
                            </IonCardContent>
                          </IonCard>
                        </IonCol>
                      );
                    })}
                  </IonRow>
                </IonGrid>
              </div>
            </IonAccordion>
          ))}
        </IonAccordionGroup>
      ) : categoryFilter === 'clothing' ? (
        <IonAccordionGroup disabled={!schoolName}>
          {Object.entries(getFilteredCategories()).map(([category, categoryData]) => (
            <IonAccordion key={category} value={category} disabled={!schoolName}>
              <IonItem slot="header" style={{ '--background': 'transparent', opacity: !schoolName ? 0.5 : 1 }}>
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
                        <IonCard button onClick={() => schoolName && handleItemClick(item)} style={{ backgroundColor: 'transparent', border: '1px solid #444', opacity: !schoolName ? 0.5 : 1, cursor: !schoolName ? 'not-allowed' : 'pointer' }}>
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
      ) : (
        <IonAccordionGroup disabled={!schoolName}>
          {Object.entries(getFilteredCategories()).map(([category, categoryData]) => (
            <IonAccordion key={category} value={category} disabled={!schoolName}>
              <IonItem slot="header" style={{ '--background': 'transparent', opacity: !schoolName ? 0.5 : 1 }}>
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
                        <IonCard button onClick={() => schoolName && handleItemClick(item)} style={{ backgroundColor: 'transparent', border: '1px solid #444', opacity: !schoolName ? 0.5 : 1, cursor: !schoolName ? 'not-allowed' : 'pointer' }}>
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

export default SchoolUniformComponent;