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
import { imageOutline, cartOutline, checkmarkCircleOutline, closeCircleOutline, bagOutline, shirtOutline, footstepsOutline } from 'ionicons/icons';
import { useCartStore } from '../../stores/cartStore';
import { useListingsStore } from '../../stores/listingsStore';
import { useToast } from '../../hooks/useToast';
import { validateImageFile } from '../../utils/imageEnhancer';

interface BeltsBagsShoesProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'all';
}

const beltsBagsShoesCategories: Record<string, { items: string[]; icon: string; color: string }> = {
  'Boys': {
    items: ['School shoes', 'Sports shoes', 'Training shoes', 'School belt', 'School bag', 'Sports bag', 'Boot bag', 'Duffel bag'],
    icon: footstepsOutline,
    color: '#004aad'
  },
  'Girls': {
    items: ['School shoes', 'Sports shoes', 'Training shoes', 'School belt', 'School bag', 'Sports bag', 'Ballet shoes', 'Duffel bag'],
    icon: footstepsOutline,
    color: '#E74C3C'
  },
  'Unisex': {
    items: ['Backpack', 'Lunchbag', 'Pencil case', 'Water bottle bag', 'Flip flops', 'Rain boots', 'Kit bag', 'Suitcase', 'Totebag'],
    icon: bagOutline,
    color: '#27AE60'
  }
};

const BeltsBagsShoesComponent: React.FC<BeltsBagsShoesProps> = ({ userType, onItemSelect }) => {
  const [selectedItem, setSelectedItem] = useState('');
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [condition, setCondition] = useState<number | undefined>();
  const [price, setPrice] = useState('');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const [size, setSize] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [photoViewer, setPhotoViewer] = useState<string | null>(null);
  const [addedToCartId, setAddedToCartId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addListing, listings, decreaseQuantity, fetchListings } = useListingsStore();
  const { addToCart } = useCartStore();
  const { isOpen: showToast, message: toastMessage, color: toastColor, showToast: displayToast, hideToast } = useToast();

  useEffect(() => {
    fetchListings();
    return () => {
      setSelectedItem('');
      setShowItemDetails(false);
      setCondition(undefined);
      setPrice('');
      setFrontPhoto(null);
      setBackPhoto(null);
      setSize('');
    };
  }, [fetchListings]);

  const getSizeOptions = (item: string) => {
    if (item.toLowerCase().includes('shoe') || item.toLowerCase().includes('boots') || item.toLowerCase().includes('flop')) {
      return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
    }
    if (item.toLowerCase().includes('belt')) {
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    }
    return ['One Size'];
  };

  const getItemCount = (itemName: string) => {
    return listings.filter(listing =>
      listing.name === itemName &&
      listing.category === 'Belts, bags & shoes' &&
      listing.quantity > 0
    ).reduce((total, listing) => total + listing.quantity, 0);
  };

  const getAvailableItems = () => {
    if (userType !== 'buyer') return [];
    return listings.filter(listing =>
      listing.name === selectedItem &&
      listing.category === 'Belts, bags & shoes' &&
      listing.quantity > 0
    ).map(listing => ({
      id: listing.id,
      item: listing.name,
      size: listing.size,
      condition: listing.condition,
      price: listing.price,
      frontPhoto: listing.frontPhoto,
      backPhoto: listing.backPhoto,
      school: listing.school,
      quantity: listing.quantity,
      description: listing.description,
      gender: listing.gender,
      category: listing.category,
      subcategory: listing.subcategory,
      sport: listing.sport
    }));
  };

  const getConditionText = (condition: number) => {
    const conditions: Record<number, string> = { 1: 'Brand new', 2: 'Like new', 3: 'Used but good', 4: 'Used and worn' };
    return conditions[condition] || 'Unknown';
  };

  const handleAddToCart = (item: any, event: React.MouseEvent) => {
    event.stopPropagation();
    if (item.quantity === 0) {
      displayToast('This item is sold out!', 'danger');
      return;
    }
    const cartItem = {
      id: item.id,
      name: item.item,
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
      quantity: 1
    };
    addToCart(cartItem, displayToast);
    decreaseQuantity(item.id);
  };

  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    setShowItemDetails(true);
  };

  const handleBackFromDetails = () => {
    setShowItemDetails(false);
    setSelectedItem('');
    setSize('');
    setCondition(undefined);
    setPrice('');
    setFrontPhoto(null);
    setBackPhoto(null);
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
          displayToast(validation.error || 'Invalid image file', 'danger');
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
          displayToast('Failed to read image file. Please try a different image.', 'danger');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const validateFields = () => {
    const missingFields = [];
    if (!selectedGender) missingFields.push('Gender');
    if (!size) missingFields.push('Size');
    if (!condition) missingFields.push('Condition');
    if (userType === 'seller') {
      if (!price) missingFields.push('Price');
      if (!frontPhoto) missingFields.push('Front Photo');
      if (!backPhoto) missingFields.push('Back Photo');
    }
    return missingFields;
  };

  const handleSubmit = async () => {
    const missingFields = validateFields();
    if (missingFields.length > 0) {
      displayToast(`Please fill in: ${missingFields.join(', ')}`, 'danger');
      return;
    }

    const itemData = {
      id: Date.now().toString(),
      name: selectedItem,
      description: `${selectedItem} - Size: ${size}`,
      school: '',
      gender: selectedGender || 'Unisex',
      size,
      condition: condition || 1,
      price: userType === 'seller' ? parseInt(price) : 0,
      frontPhoto: frontPhoto || '',
      backPhoto: backPhoto || '',
      category: 'Belts, bags & shoes',
      dateCreated: new Date().toLocaleDateString(),
      quantity: 1
    };

    if (userType === 'seller') {
      setIsSubmitting(true);
      try {
        await addListing(itemData);
        displayToast(`${selectedItem} listed successfully!`, 'success');
        handleBackFromDetails();
      } catch (error: any) {
        displayToast(error.message || 'Failed to list item. Please check your connection and try again.', 'danger');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Item details view
  if (showItemDetails) {
    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={handleBackFromDetails}>← Back</IonButton>

        <div style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#666' }}>{selectedItem}</span>
        </div>

        {userType === 'buyer' ? (
          <>
            {getAvailableItems().length > 0 ? (
              <div style={{ margin: '16px 0' }}>
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{ margin: '0', color: '#666', fontSize: '14px' }}>Available ({getAvailableItems().length})</h4>
                </div>
                {getAvailableItems().map(item => (
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
                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.item}</span>
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
                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#004aad' }}>R{item.price}</span>
                            <IonButton
                              size="small"
                              onClick={(e) => {
                                handleAddToCart(item, e);
                                setAddedToCartId(item.id);
                                setTimeout(() => setAddedToCartId(null), 2000);
                              }}
                              disabled={item.quantity === 0}
                              style={{
                                '--background': addedToCartId === item.id ? '#28a745' : '',
                                '--color': addedToCartId === item.id ? 'white' : ''
                              }}
                            >
                              <IonIcon icon={cartOutline} slot="start" />
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
              <IonLabel position="stacked">Gender *</IonLabel>
              <IonSelect value={selectedGender} onIonChange={e => setSelectedGender(e.detail.value)} placeholder="Select Gender">
                <IonSelectOption value="Boy">Boy</IonSelectOption>
                <IonSelectOption value="Girl">Girl</IonSelectOption>
                <IonSelectOption value="Unisex">Unisex</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Size *</IonLabel>
              <IonSelect value={size} onIonChange={e => setSize(e.detail.value)} placeholder="Select Size">
                {getSizeOptions(selectedItem).map(s => (
                  <IonSelectOption key={s} value={s}>{s}</IonSelectOption>
                ))}
              </IonSelect>
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
              <IonInput
                label="Price (ZAR) *"
                labelPlacement="stacked"
                type="number"
                value={price}
                onIonChange={e => setPrice(e.detail.value!)}
                placeholder="Enter selling price"
              />
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
          </>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={hideToast}
          message={toastMessage}
          duration={3000}
          position="bottom"
          color={toastColor}
        />
        {photoViewer && createPortal(
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
                  borderRadius: '8px', border: '1px solid #ddd'
                }}
              />
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // Main view with accordions
  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>Belts, Bags & Shoes</h2>

      <IonAccordionGroup>
        {Object.entries(beltsBagsShoesCategories).map(([category, categoryData]) => (
          <IonAccordion key={category} value={category}>
            <IonItem slot="header" style={{ '--background': 'transparent' }}>
              <IonIcon
                icon={categoryData.icon}
                style={{ fontSize: '24px', color: categoryData.color, marginRight: '12px' }}
              />
              <IonLabel>
                <h3 style={{ margin: '0', fontWeight: 'bold', color: categoryData.color, fontSize: '16px' }}>
                  {category}
                </h3>
              </IonLabel>
            </IonItem>
            <div slot="content" style={{ padding: '8px' }}>
              <IonGrid>
                <IonRow>
                  {categoryData.items.map((item: string, index: number) => (
                    <IonCol size="6" key={index}>
                      <IonCard button onClick={() => handleItemClick(item)} style={{ backgroundColor: 'transparent', border: '1px solid #444' }}>
                        <IonCardContent style={{ textAlign: 'center', padding: '12px' }}>
                          <IonIcon icon={imageOutline} size="large" style={{ marginBottom: '8px', opacity: 0.5 }} />
                          <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{item}</div>
                          {userType === 'buyer' && getItemCount(item) > 0 && (
                            <div style={{ fontSize: '11px', color: '#004aad', marginTop: '4px' }}>
                              {getItemCount(item)} available
                            </div>
                          )}
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

      <IonToast
        isOpen={showToast}
        onDidDismiss={hideToast}
        message={toastMessage}
        duration={3000}
        position="bottom"
        color={toastColor}
      />
    </div>
  );
};

export default BeltsBagsShoesComponent;
