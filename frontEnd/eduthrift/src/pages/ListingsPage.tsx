import React, { useState } from 'react';
import {
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonToast
} from '@ionic/react';
import { createOutline, trashOutline, closeOutline, warningOutline } from 'ionicons/icons';
import { useListingsStore, Listing } from '../stores/listingsStore';
import { useNotificationStore } from '../stores/notificationStore';

const ListingsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('current');
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { listings, updateListing, deleteListing, getListingsNearExpiry, getDaysUntilExpiry, relistItem } = useListingsStore();
  const { addNotification } = useNotificationStore();

  const listingsNearExpiry = getListingsNearExpiry();

  const listingHistory = [
    { id: 3, item: 'Science Textbook', price: 'R150', status: 'Sold', date: '2024-01-12' },
    { id: 4, item: 'Hockey Stick', price: 'R180', status: 'Sold', date: '2024-01-08' }
  ];
  
  const handleEditListing = (listing: Listing) => {
    setEditingListing({ ...listing });
    setIsEditModalOpen(true);
  };
  
  const handleSaveListing = () => {
    if (editingListing) {
      updateListing(editingListing.id, editingListing);
      setToastMessage('Listing updated successfully!');
      setShowToast(true);
      addNotification('Listing Updated', `${editingListing.name} has been updated`);
      setIsEditModalOpen(false);
      setEditingListing(null);
    }
  };
  
  const handleRemoveListing = (id: string, name: string) => {
    deleteListing(id);
    setToastMessage('Listing deleted successfully!');
    setShowToast(true);
    addNotification('Listing Deleted', `${name} has been removed from your listings`);
  };

  const handleRelistItem = (id: string, name: string) => {
    relistItem(id);
    setToastMessage(`${name} has been relisted successfully!`);
    setShowToast(true);
    addNotification('Item Relisted', `${name} has been relisted for another month.`);
  };
  
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingListing(null);
  };

  return (
    <IonContent>
      <div style={{ padding: '16px' }}>
        <IonSegment value={selectedTab} onIonChange={e => setSelectedTab(e.detail.value as string)}>
          <IonSegmentButton value="current">
            <IonLabel>Currently Listed</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="history">
            <IonLabel>Listing History</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {selectedTab === 'current' && (
          <div style={{ marginTop: '16px' }}>
            <h3>Currently Listed Items</h3>

            {listingsNearExpiry.length > 0 && (
              <IonCard style={{ border: '1px solid var(--ion-color-warning)', marginBottom: '16px' }}>
                <IonCardContent>
                  <h4 style={{ display: 'flex', alignItems: 'center', margin: '0 0 12px 0', color: 'var(--ion-color-warning)' }}>
                    <IonIcon icon={warningOutline} style={{ marginRight: '8px' }} />
                    Listings Expiring Soon
                  </h4>
                  {listingsNearExpiry.map(listing => (
                    <div key={listing.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '8px', border: '1px solid #eee', borderRadius: '4px' }}>
                      <div>
                        <p style={{ margin: '0', fontWeight: 'bold' }}>{listing.name}</p>
                        <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                          Expires in {getDaysUntilExpiry(listing)} days
                        </p>
                      </div>
                      <IonButton 
                        size="small" 
                        fill="outline"
                        onClick={() => handleRelistItem(listing.id, listing.name)}
                      >
                        Relist
                      </IonButton>
                    </div>
                  ))}
                </IonCardContent>
              </IonCard>
            )}

            {listings.length === 0 ? (
              <IonCard>
                <IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
                  <p>No items listed yet</p>
                </IonCardContent>
              </IonCard>
            ) : (
              listings.map(listing => (
                <IonCard key={listing.id}>
                  <IonCardContent>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 8px 0' }}>{listing.name}</h4>
                        <p style={{ margin: '0 0 4px 0', color: '#666' }}>{listing.school}</p>
                        <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{listing.description}</p>
                        <p style={{ margin: '0 0 4px 0' }}>Price: <strong>R{listing.price}</strong></p>
                        <p style={{ margin: '0 0 4px 0' }}>Size: {listing.size} | Gender: {listing.gender}</p>
                        <p style={{ margin: '0 0 4px 0' }}>Quantity: <strong>{listing.quantity}</strong> {listing.soldOut || listing.quantity === 0 ? '(Sold Out)' : 'available'}</p>
                        <p style={{ margin: '0' }}>Listed: {listing.dateCreated}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                        <IonButton 
                          fill="clear" 
                          size="small" 
                          onClick={() => handleEditListing(listing)}
                        >
                          <IonIcon icon={createOutline} />
                        </IonButton>
                        <IonButton 
                          fill="clear" 
                          color="danger" 
                          size="small"
                          onClick={() => handleRemoveListing(listing.id, listing.name)}
                        >
                          <IonIcon icon={trashOutline} />
                        </IonButton>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))
            )}
          </div>
        )}

        {selectedTab === 'history' && (
          <div style={{ marginTop: '16px' }}>
            <h3>Listing History</h3>
            {listingHistory.map(listing => (
              <IonCard key={listing.id}>
                <IonCardContent>
                  <h4>{listing.item}</h4>
                  <p>Price: {listing.price}</p>
                  <p>Status: {listing.status}</p>
                  <p>Date: {listing.date}</p>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}
        
        {/* Edit Modal */}
        <IonModal isOpen={isEditModalOpen} onDidDismiss={handleCloseModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit Listing</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={handleCloseModal}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {editingListing && (
              <div style={{ padding: '16px' }}>
                <IonItem style={{ marginBottom: '16px' }}>
                  <IonInput 
                    label="Item Name" 
                    labelPlacement="stacked" 
                    value={editingListing.name} 
                    onIonChange={e => setEditingListing({...editingListing, name: e.detail.value!})} 
                  />
                </IonItem>
                
                <IonItem style={{ marginBottom: '16px' }}>
                  <IonInput 
                    label="School Name" 
                    labelPlacement="stacked" 
                    value={editingListing.school} 
                    onIonChange={e => setEditingListing({...editingListing, school: e.detail.value!})} 
                  />
                </IonItem>
                
                <IonItem style={{ marginBottom: '16px' }}>
                  <IonInput 
                    label="Description" 
                    labelPlacement="stacked" 
                    value={editingListing.description} 
                    onIonChange={e => setEditingListing({...editingListing, description: e.detail.value!})} 
                  />
                </IonItem>
                
                <IonItem style={{ marginBottom: '16px' }}>
                  <IonInput 
                    label="Price (ZAR)" 
                    labelPlacement="stacked" 
                    type="number"
                    value={editingListing.price} 
                    onIonChange={e => setEditingListing({...editingListing, price: parseInt(e.detail.value!) || 0})} 
                  />
                </IonItem>
                
                <IonItem style={{ marginBottom: '16px' }}>
                  <IonLabel position="stacked">Condition Grade</IonLabel>
                  <IonSelect 
                    value={editingListing.condition} 
                    onIonChange={e => setEditingListing({...editingListing, condition: e.detail.value})}
                  >
                    <IonSelectOption value={1}>1 - Brand new (never been used)</IonSelectOption>
                    <IonSelectOption value={2}>2 - Like new but used</IonSelectOption>
                    <IonSelectOption value={3}>3 - Frequently used but not damaged</IonSelectOption>
                    <IonSelectOption value={4}>4 - Used and worn</IonSelectOption>
                  </IonSelect>
                </IonItem>
                
                <IonItem style={{ marginBottom: '16px' }}>
                  <IonInput 
                    label="Size" 
                    labelPlacement="stacked" 
                    value={editingListing.size} 
                    onIonChange={e => setEditingListing({...editingListing, size: e.detail.value!})} 
                  />
                </IonItem>
                
                <IonItem style={{ marginBottom: '16px' }}>
                  <IonLabel position="stacked">Gender</IonLabel>
                  <IonSelect 
                    value={editingListing.gender} 
                    onIonChange={e => setEditingListing({...editingListing, gender: e.detail.value})}
                  >
                    <IonSelectOption value="Boy">Boy</IonSelectOption>
                    <IonSelectOption value="Girl">Girl</IonSelectOption>
                    <IonSelectOption value="Unisex">Unisex</IonSelectOption>
                  </IonSelect>
                </IonItem>
                
                <IonItem style={{ marginBottom: '16px' }}>
                  <IonInput 
                    label="Quantity Available" 
                    labelPlacement="stacked" 
                    type="number"
                    min="0"
                    value={editingListing.quantity} 
                    onIonChange={e => setEditingListing({...editingListing, quantity: parseInt(e.detail.value!) || 0})} 
                  />
                </IonItem>
                
                <IonButton 
                  expand="full" 
                  onClick={handleSaveListing}
                  style={{ marginTop: '20px' }}
                >
                  Save Changes
                </IonButton>
              </div>
            )}
          </IonContent>
        </IonModal>
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
          color="success"
        />
      </div>
    </IonContent>
  );
};

export default ListingsPage;