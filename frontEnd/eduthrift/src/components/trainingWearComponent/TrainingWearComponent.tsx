import React, { useState } from 'react';
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
import { cameraOutline, imageOutline, fitnessOutline, shirtOutline, footstepsOutline, manOutline, womanOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { generatePlaceholder } from '../../utils/imagePlaceholder';
import { useCartStore } from '../../stores/cartStore';


interface TrainingWearProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'all';
}

const TrainingWearComponent: React.FC<TrainingWearProps> = ({ userType, onItemSelect }) => {
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [photoViewer, setPhotoViewer] = useState<string | null>(null);
  const [sizeFilter, setSizeFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState<number | undefined>();
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [addedToCartId, setAddedToCartId] = useState<number | null>(null);
  const { addToCart } = useCartStore();
  // Mock functions to replace context dependency
  const getItemQuantity = (id: string, category: string) => {
    return Math.floor(Math.random() * 5) + 1;
  };
  
  const decreaseInventory = (id: string, category: string) => {
    // Mock function
  };

  const mockItems = [
    {
      id: 1, item: 'Training shirt', size: 'M (32)', condition: 2, price: 85, gender: 'Boys',
      frontPhoto: generatePlaceholder('#3498DB','Shirt Front',120, 150 ),
      backPhoto: generatePlaceholder('#3498DB','Shirt Back',120, 150 )
    },
    {
      id: 2, item: 'Training shorts', size: 'L (34)', condition: 1, price: 70, gender: 'Boys',
      frontPhoto: generatePlaceholder('#27AE60','Shorts Front',120, 150),
      backPhoto: generatePlaceholder( '#27AE60','Shorts Back',120, 150)
    },
    {
      id: 3, item: 'Compression shirt', size: 'S (30)', condition: 3, price: 60, gender: 'Girls',
      frontPhoto: generatePlaceholder('#E74C3C','Compression Front',120, 150),
      backPhoto: generatePlaceholder('#E74C3C','Compression Back',120, 150)
    },
    {
      id: 4, item: 'Running shoes', size: '10', condition: 2, price: 220, gender: 'Unisex',
      frontPhoto: generatePlaceholder('#F39C12','Shoes Front',120, 150),
      backPhoto: generatePlaceholder('#F39C12','Shoes Back',120, 150)
    },
    {
      id: 5, item: 'Tracksuit', size: 'M (32)', condition: 1, price: 180, gender: 'Girls',
      frontPhoto: generatePlaceholder('#8E44AD','Tracksuit Front',120, 150),
      backPhoto: generatePlaceholder('#8E44AD','Tracksuit Back',120, 150)
    }
  ];

  const getConditionText = (condition: number) => {
    const conditions = { 1: 'Brand new', 2: 'Like new', 3: 'Used but good', 4: 'Used and worn' };
    return conditions[condition as keyof typeof conditions] || 'Unknown';
  };

  const handleAddToCart = (item: any) => {
    const currentQuantity = getItemQuantity(item.id.toString(), 'training-wear');
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
      gender: item.gender,
      frontPhoto: item.frontPhoto,
      backPhoto: item.backPhoto,
      category: 'Training Wear',
      quantity: 1
    };

    addToCart(cartItem);
    decreaseInventory(item.id.toString(), 'training-wear');
    setAddedToCartId(item.id);
    setTimeout(() => setAddedToCartId(null), 2000);
  };

  const getFilteredItems = (gender?: string) => {
    let items = mockItems;

    // Filter by gender if specified
    if (gender) {
      items = items.filter(item => item.gender === gender || item.gender === 'Unisex');
    }

    // Apply size filter
    if (sizeFilter) {
      items = items.filter(item => item.size.toLowerCase().includes(sizeFilter.toLowerCase()));
    }

    // Apply condition filter
    if (conditionFilter) {
      items = items.filter(item => item.condition === conditionFilter);
    }

    // Apply price range filters
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

  if (viewingItem) {
    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => setViewingItem(null)}>← Back</IonButton>

        {/* Prominent Training Wear Header */}
        <div style={{
          marginBottom: '20px',
          textAlign: 'center',
          backgroundColor: 'rgba(39, 174, 96, 0.1)',
          border: '2px solid #27AE60',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <IonIcon
            icon={fitnessOutline}
            style={{
              fontSize: '32px',
              color: '#27AE60',
              marginBottom: '8px'
            }}
          />
          <h2 style={{
            margin: '0',
            color: '#27AE60',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            Sporting Clothing
          </h2>
          <p style={{
            margin: '4px 0 0 0',
            color: '#666',
            fontSize: '14px'
          }}>
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
          disabled={getItemQuantity(viewingItem.id.toString(), 'training-wear') === 0}
          style={{ 
            marginTop: '16px',
            '--background': addedToCartId === viewingItem.id ? '#28a745' : '',
            '--color': addedToCartId === viewingItem.id ? 'white' : ''
          }}
        >
          {getItemQuantity(viewingItem.id.toString(), 'training-wear') === 0 ? 'Sold Out' : 
           addedToCartId === viewingItem.id ? '✓ Added to Cart!' : 'Add to Cart'}
        </IonButton>
        {renderPhotoViewer()}
      </div>
    );
  }



  return (
    <div>
      <h2>Training Wear</h2>

      {/* Prominent Training Wear Header */}
      <div style={{
        marginBottom: '20px',
        textAlign: 'center',
        backgroundColor: 'rgba(39, 174, 96, 0.1)',
        border: '2px solid #27AE60',
        borderRadius: '12px',
        padding: '16px'
      }}>
        <IonIcon
          icon={fitnessOutline}
          style={{
            fontSize: '32px',
            color: '#27AE60',
            marginBottom: '8px'
          }}
        />
        <h2 style={{
          margin: '0',
          color: '#27AE60',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          Sporting Clothing
        </h2>
        <p style={{
          margin: '4px 0 0 0',
          color: '#666',
          fontSize: '14px'
        }}>
          Training & Athletic Wear
        </p>
      </div>

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
                  icon={gender === 'Boys' ? manOutline : gender === 'Girls' ? womanOutline : fitnessOutline}
                  style={{
                    fontSize: '24px',
                    color: gender === 'Boys' ? '#3498DB' : gender === 'Girls' ? '#E74C3C' : '#27AE60',
                    marginRight: '12px'
                  }}
                />
                <IonLabel>
                  <h3 style={{
                    margin: '0',
                    fontWeight: 'bold',
                    color: gender === 'Boys' ? '#3498DB' : gender === 'Girls' ? '#E74C3C' : '#27AE60',
                    fontSize: '16px'
                  }}>
                    {gender} ({genderItems.length})
                  </h3>
                </IonLabel>
              </IonItem>
              <div slot="content" style={{ padding: '8px' }}>
                <IonGrid>
                  <IonRow>
                    {genderItems.map((item) => (
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
                              {getItemQuantity(item.id.toString(), 'training-wear') > 0 ? (
                                <IonBadge color="success" style={{ fontSize: '9px' }}>
                                  <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '2px', fontSize: '10px' }} />
                                  {getItemQuantity(item.id.toString(), 'training-wear')} available
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