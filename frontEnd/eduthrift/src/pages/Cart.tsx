import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';
import { useCartStore } from '../stores/cartStore';

import { getNearestCollectionPoints } from '../utils/geolocation';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { trashOutline } from 'ionicons/icons';

const Cart: React.FC = () => {
  const history = useHistory();
  const { cartItems, removeFromCart } = useCartStore();
  // Mock function to replace context dependency
  const increaseInventory = (id: string, category: string) => {
    // Mock function
  };
  
  useEffect(() => {
    if (!isLoggedIn()) {
      history.push('/login');
    }
  }, [history]);
  
  const [selectedCollectionPoint, setSelectedCollectionPoint] = useState('');
  
  const userAddress = {
    town: 'Johannesburg',
    suburb: 'Sandton',
    province: 'Gauteng'
  };
  
  const collectionPoints = getNearestCollectionPoints(`${userAddress.suburb}, ${userAddress.town}`);
  
  useEffect(() => {
    if (collectionPoints.length > 0) {
      setSelectedCollectionPoint(collectionPoints[0]);
    }
  }, []);
  
  const getConditionText = (condition: number) => {
    const conditions = {
      1: 'Brand new (never been used)',
      2: 'Like new but used',
      3: 'Frequently used but not damaged',
      4: 'Used and worn'
    };
    return conditions[condition as keyof typeof conditions];
  };
  
  const removeItem = (id: string) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      // Determine category based on item properties
      let category = 'stationery'; // default
      if (item.category === 'Club Clothing') category = 'club-clothing';
      else if (item.category === 'Textbooks') category = 'textbooks';
      else if (item.category === 'Training Wear') category = 'training-wear';
      else if (item.category === 'School Uniform') category = 'school-uniform';
      
      removeFromCart(id);
      increaseInventory(id, category);
    }
  };
  
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price, 0);
  
  const handleCheckout = () => {
    if (!isLoggedIn()) {
      history.push('/login');
      return;
    }
    history.push('/checkout-page', { items: cartItems });
  };

  return (
    <IonContent>
      <div style={{ padding: '16px', paddingTop: '60px' }}>
        <h2 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>Shopping Cart</h2>
        
        {cartItems.length === 0 ? (
          <IonCard>
            <IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
              <p>Your cart is empty</p>
            </IonCardContent>
          </IonCard>
        ) : (
          <>
            {cartItems.map((item) => (
              <IonCard key={item.id} style={{ marginBottom: '16px' }}>
                <IonCardContent>
                  <IonGrid>
                    <IonRow>
                      <IonCol size="3">
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <div style={{
                            width: '50px',
                            height: '60px',
                            borderRadius: '4px',
                            backgroundImage: `url(${item.frontPhoto})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: '1px solid #ddd'
                          }} />
                          <div style={{
                            width: '50px',
                            height: '60px',
                            borderRadius: '4px',
                            backgroundImage: `url(${item.backPhoto})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: '1px solid #ddd'
                          }} />
                        </div>
                      </IonCol>
                      <IonCol size="7">
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{item.name}</h3>
                        <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>{item.description}</p>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}><strong>School:</strong> {item.school}</p>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}><strong>Size:</strong> {item.size} | <strong>Gender:</strong> {item.gender}</p>
                        <p style={{ margin: '0', fontSize: '12px' }}><strong>Condition:</strong> {item.condition} - {getConditionText(item.condition)}</p>
                      </IonCol>
                      <IonCol size="2" style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: '#27AE60' }}>R{item.price}</p>
                        <IonButton 
                          fill="clear" 
                          color="danger" 
                          size="small"
                          onClick={() => removeItem(item.id)}
                        >
                          <IonIcon icon={trashOutline} />
                        </IonButton>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCardContent>
              </IonCard>
            ))}
            
            <IonCard style={{ marginBottom: '16px' }}>
              <IonCardContent>
                <h3 style={{ margin: '0 0 12px 0' }}>Delivery Information</h3>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                  <strong>Your Address:</strong> {userAddress.suburb}, {userAddress.town}, {userAddress.province}
                </p>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#888' }}>
                  Note: Items are delivered to collection points only, not to your address.
                </p>
                
                <IonItem style={{ marginBottom: '16px' }}>
                  <IonLabel position="stacked">Select Collection Point</IonLabel>
                  <IonSelect 
                    value={selectedCollectionPoint} 
                    onIonChange={e => setSelectedCollectionPoint(e.detail.value)}
                    placeholder="Choose nearest collection point"
                  >
                    {collectionPoints.map((point, index) => (
                      <IonSelectOption key={index} value={point}>
                        {point} {index === 0 ? '(Nearest)' : ''}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                
                {selectedCollectionPoint === collectionPoints[0] && (
                  <p style={{ fontSize: '12px', color: '#27AE60', marginBottom: '16px', paddingLeft: '16px' }}>
                    ✓ Nearest collection point selected based on your address
                  </p>
                )}
              </IonCardContent>
            </IonCard>
            
            <IonCard>
              <IonCardContent>
                <h3 style={{ margin: '0 0 12px 0' }}>Order Summary</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Items ({cartItems.length}):</span>
                  <span>R{totalAmount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Collection Fee:</span>
                  <span>R0</span>
                </div>
                <hr style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                  <span>Total:</span>
                  <span style={{ color: '#27AE60' }}>R{totalAmount}</span>
                </div>
                
                <IonButton 
                  expand="full" 
                  onClick={handleCheckout}
                  disabled={!selectedCollectionPoint}
                  style={{ marginTop: '16px' }}
                >
                  Proceed to Checkout
                </IonButton>
              </IonCardContent>
            </IonCard>
          </>
        )}
      </div>
    </IonContent>
  );
};

export default Cart;