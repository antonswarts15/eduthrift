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
  IonAccordionGroup
} from '@ionic/react';
import { cameraOutline, imageOutline, bagOutline, walletOutline, footstepsOutline, manOutline, womanOutline } from 'ionicons/icons';
import { generatePlaceholder } from '../../utils/imagePlaceholder';

interface BeltsBagsShoesProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'all';
}

const BeltsBagsShoesComponent: React.FC<BeltsBagsShoesProps> = ({ userType, onItemSelect }) => {
  const [selectedGender, setSelectedGender] = useState('');
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [photoViewer, setPhotoViewer] = useState<string | null>(null);
  const [addedToCartId, setAddedToCartId] = useState<number | null>(null);

  const mockItems = [
    {
      id: 1, item: 'School shoes', size: '8', condition: 2, price: 120,
      frontPhoto: generatePlaceholder('#2C3E50', 'Shoes Front', 120, 150),
      backPhoto: generatePlaceholder('#2C3E50', 'Shoes Back', 120, 150)
    },
    {
      id: 2, item: 'School bag', size: 'One Size', condition: 1, price: 150,
      frontPhoto: generatePlaceholder('#E67E22', 'Bag Front', 120, 150),
      backPhoto: generatePlaceholder('#E67E22', 'Bag Back', 120, 150)
    },
    {
      id: 3, item: 'Belt', size: 'M', condition: 3, price: 40,
      frontPhoto: generatePlaceholder('#8B4513', 'Belt Front', 120, 150),
      backPhoto: generatePlaceholder('#8B4513', 'Belt Back', 120, 150)
    }
  ];

  const getConditionText = (condition: number) => {
    const conditions = { 1: 'Brand new', 2: 'Like new', 3: 'Used but good', 4: 'Used and worn' };
    return conditions[condition as keyof typeof conditions] || 'Unknown';
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
          <div style={{ marginBottom: '8px' }}><strong>Size:</strong> {viewingItem.size}</div>
          <div style={{ marginBottom: '8px' }}><strong>Condition:</strong> {getConditionText(viewingItem.condition)}</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#E74C3C' }}>R{viewingItem.price}</div>
        </div>

        <IonButton 
          expand="full" 
          onClick={() => {
            onItemSelect?.(viewingItem);
            setAddedToCartId(viewingItem.id);
            setTimeout(() => setAddedToCartId(null), 2000);
          }} 
          style={{ 
            marginTop: '16px',
            '--background': addedToCartId === viewingItem.id ? '#28a745' : '',
            '--color': addedToCartId === viewingItem.id ? 'white' : ''
          }}
        >
          {addedToCartId === viewingItem.id ? '✓ Added to Cart!' : 'Add to Cart'}
        </IonButton>
        {renderPhotoViewer()}
      </div>
    );
  }

  if (!selectedGender) {
    return (
      <div style={{ padding: '16px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Select Gender</h2>
        <IonGrid>
          <IonRow>
            <IonCol size="6">
              <IonCard button onClick={() => setSelectedGender('Boy')} style={{ textAlign: 'center', padding: '20px' }}>
                <IonIcon icon={manOutline} size="large" style={{ color: '#3498DB', marginBottom: '8px' }} />
                <h3 style={{ margin: 0, color: '#3498DB' }}>Boy</h3>
              </IonCard>
            </IonCol>
            <IonCol size="6">
              <IonCard button onClick={() => setSelectedGender('Girl')} style={{ textAlign: 'center', padding: '20px' }}>
                <IonIcon icon={womanOutline} size="large" style={{ color: '#E74C3C', marginBottom: '8px' }} />
                <h3 style={{ margin: 0, color: '#E74C3C' }}>Girl</h3>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
        {renderPhotoViewer()}
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>Belts, Bags & Shoes - {selectedGender}</h2>
        <IonButton fill="outline" size="small" onClick={() => setSelectedGender('')}>
          Change Gender
        </IonButton>
      </div>

      <h3 style={{ margin: '16px 0', color: '#666' }}>Available Items</h3>

      <IonGrid>
        <IonRow>
          {mockItems.map((item) => (
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
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>
                    Size: {item.size}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                    Condition: {getConditionText(item.condition)}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#E74C3C' }}>
                    R{item.price}
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          ))}
        </IonRow>
      </IonGrid>
      {renderPhotoViewer()}
    </div>
  );
};

export default BeltsBagsShoesComponent;