import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';
import { useCartStore } from '../stores/cartStore';
import { itemsApi } from '../services/api';
import {
  IonContent, IonCard, IonCardContent, IonButton, IonIcon, IonGrid, IonRow, IonCol
} from '@ionic/react';
import { trashOutline, warningOutline } from 'ionicons/icons';

const Cart: React.FC = () => {
  const history = useHistory();
  const { cartItems, removeFromCart, updateQuantity } = useCartStore();
  const [itemCount, setItemCount] = useState<number>(0);
  const [minimumActive, setMinimumActive] = useState<boolean>(false);

  useEffect(() => {
    itemsApi.getItemCount().then(res => {
      setItemCount(res.data.count);
      setMinimumActive(res.data.minimumActive);
    }).catch(() => {});
  }, []);
  // Mock function to replace context dependency
  const increaseInventory = (id: string, category: string) => {
    // Mock function
  };
  
  useEffect(() => {
    if (!isLoggedIn()) {
      history.push('/login');
    }
  }, [history]);
  
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
  
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * (item.selectedQuantity ?? 1), 0);
  
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
                        <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold', color: '#27AE60' }}>
                          R{(item.price * (item.selectedQuantity ?? 1)).toFixed(2)}
                        </p>
                        {item.selectedQuantity > 1 && (
                          <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>R{item.price} each</p>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <IonButton size="small" fill="outline" style={{ '--padding-start': '5px', '--padding-end': '5px', height: '24px' }}
                              onClick={() => updateQuantity(item.id, Math.max(1, (item.selectedQuantity ?? 1) - 1))}
                              disabled={(item.selectedQuantity ?? 1) <= 1}>−</IonButton>
                            <span style={{ fontSize: '14px', fontWeight: 'bold', minWidth: '16px', textAlign: 'center' }}>{item.selectedQuantity ?? 1}</span>
                            <IonButton size="small" fill="outline" style={{ '--padding-start': '5px', '--padding-end': '5px', height: '24px' }}
                              onClick={() => updateQuantity(item.id, Math.min(item.quantity ?? 99, (item.selectedQuantity ?? 1) + 1))}
                              disabled={(item.selectedQuantity ?? 1) >= (item.quantity ?? 99)}>+</IonButton>
                          </div>
                          <IonButton
                            fill="clear"
                            color="danger"
                            size="small"
                            onClick={() => removeItem(item.id)}
                          >
                            <IonIcon icon={trashOutline} />
                          </IonButton>
                        </div>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCardContent>
              </IonCard>
            ))}
            
            <IonCard>
              <IonCardContent>
                <h3 style={{ margin: '0 0 12px 0' }}>Order Summary</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Items ({cartItems.reduce((s, i) => s + (i.selectedQuantity ?? 1), 0)}):</span>
                  <span>R{totalAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#666' }}>
                  <span>PUDO Delivery:</span>
                  <span style={{ fontSize: '12px' }}>Calculated per seller at checkout</span>
                </div>
                <hr style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                  <span>Subtotal:</span>
                  <span style={{ color: '#27AE60' }}>R{totalAmount.toFixed(2)}</span>
                </div>
                <p style={{ fontSize: '12px', color: '#888', marginTop: '8px', marginBottom: '0' }}>
                  {cartItems.length > 1
                    ? `${cartItems.length} items — shipping calculated per seller bundle at checkout`
                    : 'Shipping calculated at checkout'}
                </p>

                {/* R500 minimum warning */}
                {!minimumActive && totalAmount < 500 && (
                  <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: '#fff8e1', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <IonIcon icon={warningOutline} style={{ color: '#f39c12', fontSize: '18px', flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ margin: 0, fontSize: '12px', color: '#856404', lineHeight: '1.5' }}>
                      <strong>Heads up:</strong> Once the platform reaches 100 listings ({itemCount}/100), a minimum bundle value of <strong>R500 per seller</strong> will apply. Your current total is R{totalAmount.toFixed(2)}.
                    </p>
                  </div>
                )}

                {minimumActive && totalAmount < 500 && (
                  <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: '#ffebee', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <IonIcon icon={warningOutline} style={{ color: '#e74c3c', fontSize: '18px', flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ margin: 0, fontSize: '12px', color: '#c62828', lineHeight: '1.5' }}>
                      <strong>Minimum not met:</strong> A minimum bundle value of R500 per seller is required. Please add more items to reach R{(500 - totalAmount).toFixed(2)} more.
                    </p>
                  </div>
                )}
                
                <IonButton 
                  expand="full" 
                  onClick={handleCheckout}
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