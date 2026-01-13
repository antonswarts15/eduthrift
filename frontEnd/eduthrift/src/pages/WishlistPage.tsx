import React, { useState } from 'react';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonToast
} from '@ionic/react';
import { heartOutline, addOutline, trashOutline, closeOutline, notificationsOutline } from 'ionicons/icons';
import { useWishlistStore } from '../stores/wishlistStore';

const WishlistPage: React.FC = () => {
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlistStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Form state
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [school, setSchool] = useState('');
  const [size, setSize] = useState('');
  const [gender, setGender] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [notifyWhenAvailable, setNotifyWhenAvailable] = useState(true);

  const handleAddToWishlist = () => {
    if (!itemName || !category) {
      setToastMessage('Please fill in item name and category');
      setShowToast(true);
      return;
    }

    addToWishlist({
      name: itemName,
      category,
      school: school || undefined,
      size: size || undefined,
      gender: gender || undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      notifyWhenAvailable
    });

    setToastMessage('Item added to wishlist!');
    setShowToast(true);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setItemName('');
    setCategory('');
    setSchool('');
    setSize('');
    setGender('');
    setMaxPrice('');
    setNotifyWhenAvailable(true);
  };

  return (
    <IonContent>
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>
            <IonIcon icon={heartOutline} style={{ marginRight: '8px' }} />
            My Wishlist
          </h2>
          <IonButton onClick={() => setIsAddModalOpen(true)}>
            <IonIcon icon={addOutline} slot="start" />
            Add Item
          </IonButton>
        </div>

        {wishlistItems.length === 0 ? (
          <IonCard>
            <IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
              <IonIcon icon={heartOutline} style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
              <p>Your wishlist is empty</p>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Add items you're looking for and get notified when they become available
              </p>
            </IonCardContent>
          </IonCard>
        ) : (
          wishlistItems.map(item => (
            <IonCard key={item.id}>
              <IonCardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px 0' }}>{item.name}</h4>
                    <p style={{ margin: '0 0 4px 0', color: '#666' }}>Category: {item.category}</p>
                    {item.school && <p style={{ margin: '0 0 4px 0', color: '#666' }}>School: {item.school}</p>}
                    {item.size && <p style={{ margin: '0 0 4px 0', color: '#666' }}>Size: {item.size}</p>}
                    {item.gender && <p style={{ margin: '0 0 4px 0', color: '#666' }}>Gender: {item.gender}</p>}
                    {item.maxPrice && <p style={{ margin: '0 0 4px 0', color: '#666' }}>Max Price: R{item.maxPrice}</p>}
                    <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                      Added: {new Date(item.dateAdded).toLocaleDateString()}
                    </p>
                    {item.notifyWhenAvailable && (
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                        <IonIcon icon={notificationsOutline} style={{ fontSize: '16px', color: '#3880ff', marginRight: '4px' }} />
                        <span style={{ fontSize: '12px', color: '#3880ff' }}>Notifications enabled</span>
                      </div>
                    )}
                  </div>
                  <IonButton 
                    fill="clear" 
                    color="danger" 
                    size="small"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          ))
        )}

        {/* Add Item Modal */}
        <IonModal isOpen={isAddModalOpen} onDidDismiss={() => setIsAddModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Add to Wishlist</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsAddModalOpen(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div style={{ padding: '16px' }}>
              <IonItem style={{ marginBottom: '16px' }}>
                <IonInput 
                  label="Item Name *" 
                  labelPlacement="stacked" 
                  value={itemName} 
                  onIonChange={e => setItemName(e.detail.value!)} 
                  placeholder="e.g., School Uniform Shirt"
                />
              </IonItem>

              <IonItem style={{ marginBottom: '16px' }}>
                <IonLabel position="stacked">Category *</IonLabel>
                <IonSelect value={category} onIonChange={e => setCategory(e.detail.value)}>
                  <IonSelectOption value="School & sport uniform">School & Sport Uniform</IonSelectOption>
                  <IonSelectOption value="Club clothing">Club Clothing</IonSelectOption>
                  <IonSelectOption value="Training wear">Training Wear</IonSelectOption>
                  <IonSelectOption value="Belts, bags & shoes">Belts, Bags & Shoes</IonSelectOption>
                  <IonSelectOption value="Sports equipment">Sports Equipment</IonSelectOption>
                  <IonSelectOption value="Textbooks">Textbooks</IonSelectOption>
                  <IonSelectOption value="Stationery">Stationery</IonSelectOption>
                  <IonSelectOption value="Matric dance clothing">Matric Dance Clothing</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem style={{ marginBottom: '16px' }}>
                <IonInput 
                  label="School (optional)" 
                  labelPlacement="stacked" 
                  value={school} 
                  onIonChange={e => setSchool(e.detail.value!)} 
                  placeholder="e.g., Greenwood Primary"
                />
              </IonItem>

              <IonItem style={{ marginBottom: '16px' }}>
                <IonInput 
                  label="Size (optional)" 
                  labelPlacement="stacked" 
                  value={size} 
                  onIonChange={e => setSize(e.detail.value!)} 
                  placeholder="e.g., Medium, Large"
                />
              </IonItem>

              <IonItem style={{ marginBottom: '16px' }}>
                <IonLabel position="stacked">Gender (optional)</IonLabel>
                <IonSelect value={gender} onIonChange={e => setGender(e.detail.value)}>
                  <IonSelectOption value="">Any</IonSelectOption>
                  <IonSelectOption value="Boy">Boy</IonSelectOption>
                  <IonSelectOption value="Girl">Girl</IonSelectOption>
                  <IonSelectOption value="Unisex">Unisex</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem style={{ marginBottom: '16px' }}>
                <IonInput 
                  label="Max Price (optional)" 
                  labelPlacement="stacked" 
                  type="number"
                  value={maxPrice} 
                  onIonChange={e => setMaxPrice(e.detail.value!)} 
                  placeholder="e.g., 100"
                />
              </IonItem>

              <IonItem style={{ marginBottom: '16px' }}>
                <IonLabel>Notify when available</IonLabel>
                <IonToggle 
                  checked={notifyWhenAvailable} 
                  onIonChange={e => setNotifyWhenAvailable(e.detail.checked)}
                />
              </IonItem>

              <IonButton 
                expand="full" 
                onClick={handleAddToWishlist}
                disabled={!itemName || !category}
              >
                Add to Wishlist
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
        />
      </div>
    </IonContent>
  );
};

export default WishlistPage;