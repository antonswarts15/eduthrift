import React, { useState, useEffect } from 'react';
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
  IonToast,
  IonAlert,
  IonLoading,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import { createOutline, trashOutline, closeOutline, warningOutline } from 'ionicons/icons';
import { useListingsStore, Listing } from '../stores/listingsStore';
import { useNotificationStore } from '../stores/notificationStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ListingsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('current');
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<string>('success');
  const [deleteAlert, setDeleteAlert] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' });
  const [isSaving, setIsSaving] = useState(false);

  const { myListings, isLoading, fetchMyListings, updateListing, deleteListing, getListingsNearExpiry, getDaysUntilExpiry, relistItem } = useListingsStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  const listingsNearExpiry = getListingsNearExpiry();

  // Derive listing history from sold/zero-quantity items
  const listingHistory = myListings.filter(l => l.soldOut || l.quantity === 0);
  const currentListings = myListings.filter(l => !l.soldOut && l.quantity > 0);

  const handleRefresh = async (event: CustomEvent) => {
    await fetchMyListings();
    event.detail.complete();
  };

  const handleEditListing = (listing: Listing) => {
    setEditingListing({ ...listing });
    setIsEditModalOpen(true);
  };

  const handleSaveListing = async () => {
    if (!editingListing) return;
    setIsSaving(true);
    try {
      await updateListing(editingListing.id, editingListing);
      setToastMessage('Listing updated successfully!');
      setToastColor('success');
      setShowToast(true);
      addNotification('Listing Updated', `${editingListing.name} has been updated`);
      setIsEditModalOpen(false);
      setEditingListing(null);
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to update listing');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveListing = async (id: string, name: string) => {
    try {
      await deleteListing(id);
      setToastMessage('Listing deleted successfully!');
      setToastColor('success');
      setShowToast(true);
      addNotification('Listing Deleted', `${name} has been removed from your listings`);
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to delete listing');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const handleRelistItem = (id: string, name: string) => {
    relistItem(id);
    setToastMessage(`${name} has been relisted successfully!`);
    setToastColor('success');
    setShowToast(true);
    addNotification('Item Relisted', `${name} has been relisted for another month.`);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingListing(null);
  };

  const getPhotoUrl = (photo: string) => {
    if (!photo) return '';
    if (photo.startsWith('http') || photo.startsWith('data:')) return photo;
    return `${API_BASE_URL}${photo}`;
  };

  return (
    <IonContent>
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent />
      </IonRefresher>

      <IonLoading isOpen={isLoading} message="Loading listings..." />

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

            {currentListings.length === 0 && !isLoading ? (
              <IonCard>
                <IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
                  <p>No items listed yet</p>
                </IonCardContent>
              </IonCard>
            ) : (
              currentListings.map(listing => (
                <IonCard key={listing.id}>
                  <IonCardContent>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      {/* Photo thumbnails */}
                      <div style={{ display: 'flex', gap: '6px', marginRight: '12px', flexShrink: 0 }}>
                        {listing.frontPhoto && (
                          <img
                            src={getPhotoUrl(listing.frontPhoto)}
                            alt="Front"
                            style={{ width: '50px', height: '65px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                          />
                        )}
                        {listing.backPhoto && (
                          <img
                            src={getPhotoUrl(listing.backPhoto)}
                            alt="Back"
                            style={{ width: '50px', height: '65px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                          />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 8px 0' }}>{listing.name}</h4>
                        <p style={{ margin: '0 0 4px 0', color: '#666' }}>{listing.school}</p>
                        <p style={{ margin: '0 0 4px 0' }}>Price: <strong>R{listing.price}</strong></p>
                        <p style={{ margin: '0 0 4px 0' }}>Size: {listing.size} | Gender: {listing.gender}</p>
                        <p style={{ margin: '0 0 4px 0' }}>Quantity: <strong>{listing.quantity}</strong> available</p>
                        <p style={{ margin: '0' }}>Listed: {listing.dateCreated}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginLeft: '8px', flexShrink: 0 }}>
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
                          onClick={() => setDeleteAlert({ isOpen: true, id: listing.id, name: listing.name })}
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
            {listingHistory.length === 0 ? (
              <IonCard>
                <IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
                  <p>No sold items yet</p>
                </IonCardContent>
              </IonCard>
            ) : (
              listingHistory.map(listing => (
                <IonCard key={listing.id}>
                  <IonCardContent>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {listing.frontPhoto && (
                        <img
                          src={getPhotoUrl(listing.frontPhoto)}
                          alt="Front"
                          style={{ width: '50px', height: '65px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                      )}
                      <div>
                        <h4 style={{ margin: '0 0 4px 0' }}>{listing.name}</h4>
                        <p style={{ margin: '0 0 4px 0' }}>Price: <strong>R{listing.price}</strong></p>
                        <p style={{ margin: '0 0 4px 0', color: '#E74C3C' }}>Status: Sold Out</p>
                        <p style={{ margin: '0', color: '#666', fontSize: '13px' }}>Listed: {listing.dateCreated}</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))
            )}
          </div>
        )}

        {/* Delete Confirmation Alert */}
        <IonAlert
          isOpen={deleteAlert.isOpen}
          onDidDismiss={() => setDeleteAlert({ isOpen: false, id: '', name: '' })}
          header="Delete Listing"
          message={`Are you sure you want to delete "${deleteAlert.name}"? This cannot be undone.`}
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            {
              text: 'Delete',
              role: 'destructive',
              handler: () => handleRemoveListing(deleteAlert.id, deleteAlert.name)
            }
          ]}
        />

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
                {/* Read-only photo display */}
                {(editingListing.frontPhoto || editingListing.backPhoto) && (
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
                    {editingListing.frontPhoto && (
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#666' }}>Front</p>
                        <img
                          src={getPhotoUrl(editingListing.frontPhoto)}
                          alt="Front"
                          style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                      </div>
                    )}
                    {editingListing.backPhoto && (
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#666' }}>Back</p>
                        <img
                          src={getPhotoUrl(editingListing.backPhoto)}
                          alt="Back"
                          style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                      </div>
                    )}
                  </div>
                )}

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
                  disabled={isSaving}
                  style={{ marginTop: '20px' }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
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
          color={toastColor}
        />
      </div>
    </IonContent>
  );
};

export default ListingsPage;
