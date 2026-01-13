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
import { cameraOutline, imageOutline, pencilOutline, bookOutline, colorPaletteOutline, cutOutline, bagOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { generatePlaceholder } from '../../utils/imagePlaceholder';
import { useCartStore } from '../../stores/cartStore';


interface StationeryProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'all';
}

const Stationery: React.FC<StationeryProps> = ({ userType, onItemSelect, categoryFilter = 'all' }) => {
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [photoViewer, setPhotoViewer] = useState<string | null>(null);
  const [conditionFilter, setConditionFilter] = useState<number | undefined>();
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState<{[key: string]: boolean}>({});
  const { addToCart } = useCartStore();
  
  const getItemQuantity = (id: string, category: string) => {
    const item = mockItems.find(i => i.id.toString() === id);
    return item ? item.quantity : 0;
  };
  
  const decreaseInventory = (id: string, category: string) => {
    // Mock function
  };

  const mockItems = [
    {
      id: 1, item: 'HB Pencils', condition: 1, price: 15, quantity: 3,
      frontPhoto: generatePlaceholder('#3498DB', 'HB Pencils', 120, 150),
      backPhoto: generatePlaceholder('#3498DB', 'Pack Back', 120, 150)
    },
    {
      id: 2, item: 'A4 exercise books (72-page)', condition: 2, price: 25, quantity: 2,
      frontPhoto: generatePlaceholder('#E74C3C', 'Exercise Book', 120, 150),
      backPhoto: generatePlaceholder('#E74C3C', 'Book Back', 120, 150)
    },
    {
      id: 3, item: 'Colouring pencils (12-pack)', condition: 1, price: 45, quantity: 1,
      frontPhoto: generatePlaceholder('#27AE60', 'Colour Pencils', 120, 150),
      backPhoto: generatePlaceholder('#27AE60', 'Pack Back', 120, 150)
    },
    {
      id: 4, item: '30cm ruler', condition: 3, price: 8, quantity: 0,
      frontPhoto: generatePlaceholder('#F39C12', 'Ruler 30cm', 120, 150),
      backPhoto: generatePlaceholder('#F39C12', 'Ruler Back', 120, 150)
    },
    {
      id: 5, item: 'Glue stick', condition: 2, price: 12, quantity: 4,
      frontPhoto: generatePlaceholder('#8E44AD', 'Glue Stick', 120, 150),
      backPhoto: generatePlaceholder('#8E44AD', 'Glue Back', 120, 150)
    }
  ];

  const getFilteredItems = () => {
    let items = mockItems;
    
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
    const currentQuantity = getItemQuantity(item.id.toString(), 'stationery');
    if (currentQuantity === 0) {
      setToastMessage(`${item.item} is sold out!`);
      setShowToast(true);
      return;
    }

    if (quantity > currentQuantity) {
      setToastMessage(`Only ${currentQuantity} items available!`);
      setShowToast(true);
      return;
    }

    for (let i = 0; i < quantity; i++) {
      const cartItem = {
        id: `${item.id}-${Date.now()}-${i}`,
        name: item.item,
        description: `${item.item} - Condition: ${getConditionText(item.condition)}`,
        price: item.price,
        condition: item.condition,
        school: '',
        size: '',
        gender: '',
        frontPhoto: item.frontPhoto,
        backPhoto: item.backPhoto,
        category: 'Stationery',
        quantity: 1
      };
      
      if (i === 0) {
        // Only show toast for the first item to avoid multiple toasts
        addToCart(cartItem, (message, color) => {
          setToastMessage(`${quantity} x ${item.item} added to cart!`);
          setShowToast(true);
        });
      } else {
        addToCart(cartItem);
      }
    }
    
    decreaseInventory(item.id.toString(), 'stationery');
  };

  const getConditionText = (condition: number) => {
    const conditions = { 1: 'Brand new', 2: 'Like new', 3: 'Used but good', 4: 'Used and worn' };
    return conditions[condition as keyof typeof conditions] || 'Unknown';
  };

  const stationeryCategories = {
    'Writing Instruments': {
      items: ['HB Pencils', '2B Pencils (Art)', 'Blue ballpoint pens', 'Black ballpoint pens', 'Red ballpoint pens', 'Highlighters (assorted colours)', 'Whiteboard markers', 'Permanent markers'],
      icon: pencilOutline,
      color: '#3498DB'
    },
    'Paper & Books': {
      items: ['A4 exercise books (72-page)', 'A4 exercise books (192-page)', 'A4 hardcover books', 'A4 exam pads (punched)', 'A5 exercise books', 'Flip file (30 pocket)', 'Flip file (50 pocket)', 'Scrapbook'],
      icon: bookOutline,
      color: '#E74C3C'
    },
    'Drawing & Colouring': {
      items: ['Colouring pencils (12-pack)', 'Crayons (12-pack)', 'Oil pastels (12-pack)', 'Watercolour paint set', 'Paintbrushes (various sizes)', 'Erasers (white, soft)', 'Sharpener (with container)'],
      icon: colorPaletteOutline,
      color: '#27AE60'
    },
    'Measuring & Cutting': {
      items: ['30cm ruler', '15cm ruler', 'Pair of scissors (blunt tip for juniors)', 'Pair of scissors (sharp tip for seniors)', 'Mathematical set (compass, protractor, etc.)'],
      icon: cutOutline,
      color: '#F39C12'
    },
    'Adhesives': {
      items: ['Glue stick', 'White liquid glue', 'Sticky tape (clear)', 'Masking tape'],
      icon: pencilOutline,
      color: '#8E44AD'
    },
    'Storage & Organisation': {
      items: ['Pencil case', 'Book covers (plastic)', 'Labels (self-adhesive)', 'School bag'],
      icon: bagOutline,
      color: '#1ABC9C'
    }
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
          <div style={{ marginBottom: '8px' }}><strong>Condition:</strong> {getConditionText(viewingItem.condition)}</div>
          <div style={{ marginBottom: '8px', fontSize: '18px', fontWeight: 'bold', color: '#E74C3C' }}>R{viewingItem.price}</div>
          <div style={{ marginBottom: '8px' }}><strong>Available:</strong> {getItemQuantity(viewingItem.id.toString(), 'stationery')}</div>
        </div>

        <IonItem style={{ marginBottom: '16px' }}>
          <IonLabel position="stacked">Quantity</IonLabel>
          <IonSelect 
            value={selectedQuantity} 
            onIonChange={e => setSelectedQuantity(e.detail.value)}
          >
            {Array.from({ length: getItemQuantity(viewingItem.id.toString(), 'stationery') }, (_, i) => i + 1).map(num => (
              <IonSelectOption key={num} value={num}>{num}</IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonButton 
          expand="full" 
          onClick={() => {
            handleAddToCart(viewingItem, selectedQuantity);
            setAddedToCart(prev => ({...prev, [viewingItem.id]: true}));
            setTimeout(() => setAddedToCart(prev => ({...prev, [viewingItem.id]: false})), 2000);
          }}
          disabled={getItemQuantity(viewingItem.id.toString(), 'stationery') === 0}
          color={addedToCart[viewingItem.id] ? 'success' : 'primary'}
          style={{ marginTop: '16px' }}
        >
          {getItemQuantity(viewingItem.id.toString(), 'stationery') === 0 ? 'Sold Out' : 
           addedToCart[viewingItem.id] ? '✓ Added to Cart!' : `Add ${selectedQuantity} to Cart`}
        </IonButton>
        {renderPhotoViewer()}
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      {categoryFilter === 'all' && <h2 style={{ margin: 0, marginBottom: '16px' }}>Stationery</h2>}

      <h3 style={{ margin: '16px 0', color: '#666' }}>Available Stationery Items</h3>
      
      <div style={{ backgroundColor: 'transparent', border: '1px solid #444', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>Filters</h4>
        <IonGrid>
          <IonRow>
            <IonCol size="6">
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
            <IonCol size="6">
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
        {Object.entries(stationeryCategories).map(([category, categoryData]) => {
          const categoryItems = getFilteredItems().filter(item => {
            return categoryData.items.includes(item.item);
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
                    {categoryItems.map((item) => (
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
                            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                              Condition: {getConditionText(item.condition)}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#E74C3C' }}>
                                R{item.price}
                              </div>
                              {getItemQuantity(item.id.toString(), 'stationery') > 0 ? (
                                <IonBadge color="success" style={{ fontSize: '9px' }}>
                                  <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '2px', fontSize: '10px' }} />
                                  {getItemQuantity(item.id.toString(), 'stationery')} available
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

export default Stationery;