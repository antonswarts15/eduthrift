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
import { shirtOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline, imageOutline, cartOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import SchoolSelector from '../SchoolSelector';
import { useListingsStore } from '../../stores/listingsStore';
import { useCartStore } from '../../stores/cartStore';
import { useToast } from '../../hooks/useToast';

interface GenericSportEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?: boolean;
  sportName: string;
  sportCategories: any;
}

const GenericSportEquipmentComponent: React.FC<GenericSportEquipmentProps> = ({ 
  userType, onItemSelect, categoryFilter = 'all', schoolName: propSchoolName, 
  hideSchoolClubSelection = false, sportName, sportCategories 
}) => {
  const [selectedItem, setSelectedItem] = useState('');
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [condition, setCondition] = useState<number | undefined>();
  const [price, setPrice] = useState('');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const [organizationType, setOrganizationType] = useState<'school' | 'club' | ''>(propSchoolName ? 'school' : '');
  const [schoolName, setSchoolName] = useState(propSchoolName || '');
  const [clubName, setClubName] = useState('');
  const [size, setSize] = useState('');
  const [team, setTeam] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [viewingItem, setViewingItem] = useState<any>(null);
  const { addListing, listings, decreaseQuantity, fetchListings } = useListingsStore();
  const { addToCart } = useCartStore();
  const { isOpen: showToast, message: toastMessage, color: toastColor, showToast: displayToast, hideToast } = useToast();
  const [photoViewer, setPhotoViewer] = useState<string | null>(null);
  const [addedToCartId, setAddedToCartId] = useState<string | null>(null);

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
      setTeam('');
    };
  }, [fetchListings]);

  const getSizeOptions = (item: string) => {
    if (item.toLowerCase().includes('ball')) {
      return ['Size 3 (Mini)', 'Size 4 (Youth)', 'Size 5 (Adult)'];
    }
    if (item.toLowerCase().includes('boots') || item.toLowerCase().includes('shoes')) {
      return ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
    }
    if (item.toLowerCase().includes('jersey') || item.toLowerCase().includes('shorts') || item.toLowerCase().includes('shirt')) {
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
    }
    return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  };

  const getFilteredCategories = () => {
    switch (categoryFilter) {
      case 'clothing':
        // Convert generic Clothing to gender-specific categories
        if (sportCategories['Clothing']) {
          return {
            'Boys Clothing': {
              items: sportCategories['Clothing'].items,
              icon: sportCategories['Clothing'].icon,
              color: sportCategories['Clothing'].color
            },
            'Girls Clothing': {
              items: sportCategories['Clothing'].items,
              icon: sportCategories['Clothing'].icon,
              color: sportCategories['Clothing'].color
            }
          };
        }
        return {};
      case 'footwear':
        return sportCategories['Footwear'] ? { 'Footwear': sportCategories['Footwear'] } : {};
      case 'equipment-protective-accessories': {
        const filtered: any = {};
        if (sportCategories['Equipment']) filtered['Equipment'] = sportCategories['Equipment'];
        if (sportCategories['Protective Gear']) filtered['Protective Gear'] = sportCategories['Protective Gear'];
        if (sportCategories['Accessories']) filtered['Accessories'] = sportCategories['Accessories'];
        return filtered;
      }
      default:
        return sportCategories;
    }
  };

  const getItemCount = (itemName: string) => {
    return listings.filter(listing => 
      listing.name === itemName && 
      (listing.category === `${sportName} Equipment` || (listing.sport === sportName && listing.category === 'School & sport uniform')) &&
      listing.quantity > 0 &&
      (categoryFilter !== 'clothing' || listing.gender === selectedGender || listing.gender === 'Unisex')
    ).reduce((total, listing) => total + listing.quantity, 0);
  };



  const getAvailableItems = () => {
    if (userType === 'buyer' && (schoolName || clubName)) {
      // Filter actual listings based on selected item and gender
      const filteredListings = listings.filter(listing => 
        listing.name === selectedItem &&
        listing.quantity > 0 &&
        (categoryFilter !== 'clothing' || listing.gender === selectedGender || listing.gender === 'Unisex')
      );
      
      if (filteredListings.length > 0) {
        return filteredListings.map(listing => ({
          id: listing.id,
          item: listing.name,
          size: listing.size,
          condition: listing.condition,
          price: listing.price,
          frontPhoto: listing.frontPhoto,
          backPhoto: listing.backPhoto,
          school: listing.school,
          soldOut: false,
          quantity: listing.quantity,
          description: listing.description,
          gender: listing.gender,
          category: listing.category,
          subcategory: listing.subcategory,
          sport: listing.sport
        }));
      }
      return [];
    }
    return [];
  };

  const getConditionText = (condition: number) => {
    const conditions = { 1: 'Brand new', 2: 'Like new', 3: 'Used but good', 4: 'Used and worn' };
    return conditions[condition as keyof typeof conditions] || 'Unknown';
  };

  const handleAddToCart = (item: any, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (item.soldOut || item.quantity === 0) {
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
    if (userType === 'buyer') {
      // For buyers, show available items first
      setShowItemDetails(false);
    } else {
      // For sellers, go to item details form
      setShowItemDetails(true);
    }
  };

  const handleBackFromDetails = () => {
    setShowItemDetails(false);
    setSelectedItem('');
    setSize('');
    setTeam('');
    setCondition(undefined);
    setPrice('');
    setFrontPhoto(null);
    setBackPhoto(null);
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

  const validateFields = () => {
    const missingFields = [];
    if (!size) missingFields.push('Size');
    if (!team) missingFields.push('Team');
    if (!condition) missingFields.push('Condition');
    if (userType === 'seller') {
      if (!price) missingFields.push('Price');
      if (!frontPhoto) missingFields.push('Front Photo');
      if (!backPhoto) missingFields.push('Back Photo');
    }
    return missingFields;
  };

  const handleSubmit = () => {
    const missingFields = validateFields();
    if (missingFields.length > 0) {
      displayToast(`Please fill in: ${missingFields.join(', ')}`, 'danger');
      return;
    }

    const itemData = {
      id: Date.now().toString(),
      name: selectedItem,
      description: `${selectedItem} - Size: ${size}, Team: ${team}`,
      school: organizationType === 'school' ? schoolName : '',
      gender: categoryFilter === 'clothing' ? selectedGender : 'Unisex',
      size,
      condition: condition || 1,
      price: userType === 'seller' ? parseInt(price) : 0,
      frontPhoto: frontPhoto || '',
      backPhoto: backPhoto || '',
      category: `${sportName} Equipment`,
      dateCreated: new Date().toLocaleDateString(),
      quantity: 1
    };

    if (userType === 'seller') {
      addListing(itemData);
      displayToast(`${selectedItem} listed successfully!`, 'success');
    }

    setShowItemDetails(false);
    setSelectedItem('');
    setSize('');
    setTeam('');
    setCondition(undefined);
    setPrice('');
    setFrontPhoto(null);
    setBackPhoto(null);
  };

  if (showItemDetails) {
    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={handleBackFromDetails}>← Back</IonButton>
        
        <div style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#666' }}>
            {selectedItem}
          </span>
        </div>
        
        {userType === 'buyer' ? (
          <>
            {getAvailableItems().length > 0 ? (
              <div style={{ margin: '16px 0' }}>
                <div style={{ marginBottom: '12px', padding: '0 16px' }}>
                  <h4 style={{ margin: '0', color: '#666', fontSize: '14px' }}>Available ({getAvailableItems().length})</h4>
                </div>
                
                {getAvailableItems().map(item => (
                  <IonCard key={item.id} style={{ margin: '8px 16px' }}>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhotoViewer(item.frontPhoto);
                            }}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhotoViewer(item.backPhoto);
                            }}
                          >
                            {!item.backPhoto && 'Back'}
                          </div>
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.school}</span>
                            {item.soldOut || item.quantity === 0 ? (
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
                              onClick={(e) => {
                                handleAddToCart(item, e);
                                setAddedToCartId(item.id);
                                setTimeout(() => setAddedToCartId(null), 2000);
                              }}
                              disabled={item.soldOut || item.quantity === 0}
                              style={{
                                '--background': addedToCartId === item.id ? '#28a745' : '',
                                '--color': addedToCartId === item.id ? 'white' : ''
                              }}
                            >
                              <IonIcon icon={cartOutline} slot="start" />
                              {item.soldOut || item.quantity === 0 ? 'Sold Out' : 
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
              <IonLabel position="stacked">Size *</IonLabel>
              <IonSelect value={size} onIonChange={e => setSize(e.detail.value)} placeholder="Select Size">
                {getSizeOptions(selectedItem).map(sizeOption => (
                  <IonSelectOption key={sizeOption} value={sizeOption}>{sizeOption}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Team *</IonLabel>
              <IonSelect value={team} onIonChange={e => setTeam(e.detail.value)} placeholder="Select Team">
                <IonSelectOption value="1st Team">1st Team</IonSelectOption>
                <IonSelectOption value="2nd Team">2nd Team</IonSelectOption>
                <IonSelectOption value="3rd Team">3rd Team</IonSelectOption>
                <IonSelectOption value="4th Team">4th Team</IonSelectOption>
                <IonSelectOption value="5th Team">5th Team</IonSelectOption>
                <IonSelectOption value="U19">U19</IonSelectOption>
                <IonSelectOption value="U16">U16</IonSelectOption>
                <IonSelectOption value="U14">U14</IonSelectOption>
                <IonSelectOption value="General">General</IonSelectOption>
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

            <IonButton expand="full" onClick={handleSubmit} style={{ marginTop: '16px' }}>
              List Item
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
                  border: '1px solid #ddd'
                }}
              />
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  return (
    <div>
      {categoryFilter === 'all' && <h2>{sportName} Equipment</h2>}
      {categoryFilter === 'clothing' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>{sportName} Clothing - {selectedGender}</h2>
          <IonButton fill="outline" size="small" onClick={() => setSelectedGender('')}>
            Change Gender
          </IonButton>
        </div>
      )}
      
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
      
      {!propSchoolName && !hideSchoolClubSelection && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#666', fontSize: '16px' }}>Select Organization Type</h3>
          <IonGrid>
            <IonRow>
              <IonCol size="6">
                <IonCard 
                  button 
                  onClick={() => setOrganizationType('school')}
                  style={{
                    border: organizationType === 'school' ? '2px solid #3498DB' : '1px solid #444',
                    backgroundColor: 'transparent'
                  }}
                >
                  <IonCardContent style={{ textAlign: 'center', padding: '16px' }}>
                    <IonIcon 
                      icon={schoolOutline} 
                      size="large" 
                      style={{ 
                        color: organizationType === 'school' ? '#3498DB' : '#666',
                        marginBottom: '8px' 
                      }} 
                    />
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: organizationType === 'school' ? '#3498DB' : '#333'
                    }}>
                      School
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="6">
                <IonCard 
                  button 
                  onClick={() => setOrganizationType('club')}
                  style={{
                    border: organizationType === 'club' ? '2px solid #E74C3C' : '1px solid #444',
                    backgroundColor: 'transparent'
                  }}
                >
                  <IonCardContent style={{ textAlign: 'center', padding: '16px' }}>
                    <IonIcon 
                      icon={peopleOutline} 
                      size="large" 
                      style={{ 
                        color: organizationType === 'club' ? '#E74C3C' : '#666',
                        marginBottom: '8px' 
                      }} 
                    />
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: organizationType === 'club' ? '#E74C3C' : '#333'
                    }}>
                      Club
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
          
          {organizationType === 'school' && (
            <div style={{ marginTop: '16px' }}>
              <SchoolSelector 
                value={schoolName} 
                onSchoolChange={setSchoolName}
                placeholder="Select or enter school name"
              />
            </div>
          )}
          
          {organizationType === 'club' && (
            <IonItem style={{ marginTop: '16px' }}>
              <IonInput 
                label="Club Name" 
                labelPlacement="stacked" 
                value={clubName} 
                onIonChange={e => setClubName(e.detail.value!)} 
                placeholder="Enter club name"
              />
            </IonItem>
          )}
        </div>
      )}

      {categoryFilter === 'clothing' ? (
        <div>
          {(() => {
            const genderKey = selectedGender === 'Boy' ? 'Boys Clothing' : 'Girls Clothing';
            const clothingItems = getFilteredCategories()[genderKey]?.items || [];
            return (
              <IonGrid>
                <IonRow>
                  {clothingItems.map((item: string, index: number) => (
                    <IonCol size="6" key={index}>
                      <IonCard button onClick={() => handleItemClick(item)} style={{ backgroundColor: 'transparent', border: '1px solid #444' }}>
                        <IonCardContent style={{ textAlign: 'center', padding: '12px' }}>
                          <IonIcon icon={imageOutline} size="large" style={{ marginBottom: '8px', opacity: 0.5 }} />
                          <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{item}</div>
                          {userType === 'buyer' && getItemCount(item) > 0 && (
                            <div style={{ fontSize: '11px', color: '#3498DB', marginTop: '4px' }}>
                              {getItemCount(item)} available
                            </div>
                          )}
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            );
          })()}
        </div>
      ) : (
        <IonAccordionGroup>
          {Object.entries(getFilteredCategories()).map(([category, categoryData]: [string, any]) => {
            // Skip gender-specific categories if we're in clothing mode and have selected a gender
            if (selectedGender && 
                (category === 'Boys Clothing' || category === 'Girls Clothing')) {
              return null;
            }
            
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
                                <div style={{ fontSize: '11px', color: '#3498DB', marginTop: '4px' }}>
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
            );
          })}
        </IonAccordionGroup>
      )}
      
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

export default GenericSportEquipmentComponent;