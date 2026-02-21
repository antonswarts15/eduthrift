import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonBadge,
  IonToast,
  IonModal,
  IonSpinner
} from '@ionic/react';
import { cartOutline, checkmarkCircleOutline, closeCircleOutline, closeOutline, imageOutline } from 'ionicons/icons';
import { useListingsStore } from '../stores/listingsStore';
import { useCartStore } from '../stores/cartStore';
import { useToast } from '../hooks/useToast';

const ItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { getListingById, fetchListingById, decreaseQuantity } = useListingsStore();
  const { addToCart } = useCartStore();
  const { isOpen, message, color, showToast, hideToast } = useToast();

  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);
  const [zoomLabel, setZoomLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchedListing, setFetchedListing] = useState<any>(null);

  const storeListing = getListingById(id);
  const listing = storeListing || fetchedListing;

  // Fetch from API if not in store
  useEffect(() => {
    if (!storeListing && id) {
      setLoading(true);
      fetchListingById(id).then((result) => {
        setFetchedListing(result);
        setLoading(false);
      });
    }
  }, [id, storeListing]);

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/buyer" />
            </IonButtons>
            <IonTitle>Loading...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <IonSpinner />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!listing) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/buyer" />
            </IonButtons>
            <IonTitle>Item Not Found</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <h2>Item not found</h2>
            <p>The item you're looking for doesn't exist.</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const handleAddToCart = () => {
    if (listing.soldOut || listing.quantity === 0) {
      showToast('This item is sold out!', 'danger');
      return;
    }

    const cartItem = {
      id: listing.id,
      name: listing.name,
      description: listing.description,
      price: listing.price,
      condition: listing.condition,
      school: listing.school,
      size: listing.size,
      gender: listing.gender,
      category: listing.category,
      subcategory: listing.subcategory,
      sport: listing.sport,
      frontPhoto: listing.frontPhoto,
      backPhoto: listing.backPhoto
    };

    addToCart(cartItem, showToast);
    decreaseQuantity(listing.id);
  };

  const getConditionText = (condition: number) => {
    switch (condition) {
      case 1: return 'Brand new (never been used)';
      case 2: return 'Like new but used';
      case 3: return 'Frequently used but not damaged';
      case 4: return 'Used and worn';
      default: return 'Unknown condition';
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/buyer" />
          </IonButtons>
          <IonTitle>{listing.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '16px' }}>
          <IonCard>
            <IonCardContent>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h1 style={{ margin: '0', fontSize: '24px' }}>{listing.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {listing.soldOut || listing.quantity === 0 ? (
                    <IonBadge color="danger">
                      <IonIcon icon={closeCircleOutline} style={{ marginRight: '4px' }} />
                      Sold Out
                    </IonBadge>
                  ) : (
                    <IonBadge color="success">
                      <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '4px' }} />
                      {listing.quantity} left
                    </IonBadge>
                  )}
                </div>
              </div>
              
              {/* Photo display */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => { if (listing.frontPhoto) { setZoomPhoto(listing.frontPhoto); setZoomLabel('Front'); } }}>
                  {listing.frontPhoto && listing.frontPhoto !== 'Front Photo' ? (
                    <img
                      src={listing.frontPhoto}
                      alt="Front"
                      style={{
                        width: '140px', height: '170px', objectFit: 'cover',
                        borderRadius: '8px', border: '2px solid #ddd'
                      }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{
                      width: '140px', height: '170px', backgroundColor: '#f0f0f0', border: '2px solid #ddd',
                      borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column', gap: '4px'
                    }}>
                      <IonIcon icon={imageOutline} style={{ fontSize: '32px', color: '#999' }} />
                      <span style={{ fontSize: '12px', color: '#999' }}>No photo</span>
                    </div>
                  )}
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>Front</p>
                </div>
                <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => { if (listing.backPhoto) { setZoomPhoto(listing.backPhoto); setZoomLabel('Back'); } }}>
                  {listing.backPhoto && listing.backPhoto !== 'Back Photo' ? (
                    <img
                      src={listing.backPhoto}
                      alt="Back"
                      style={{
                        width: '140px', height: '170px', objectFit: 'cover',
                        borderRadius: '8px', border: '2px solid #ddd'
                      }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{
                      width: '140px', height: '170px', backgroundColor: '#f0f0f0', border: '2px solid #ddd',
                      borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column', gap: '4px'
                    }}>
                      <IonIcon icon={imageOutline} style={{ fontSize: '32px', color: '#999' }} />
                      <span style={{ fontSize: '12px', color: '#999' }}>No photo</span>
                    </div>
                  )}
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>Back</p>
                </div>
              </div>
              <p style={{ textAlign: 'center', fontSize: '11px', color: '#aaa', margin: '0 0 8px' }}>Tap photo to enlarge</p>
              
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '28px', color: '#3880ff', margin: '0' }}>R{listing.price}</h2>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '16px', lineHeight: '1.5' }}>{listing.description}</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#666' }}>School</p>
                  <p style={{ margin: '0', fontSize: '14px' }}>{listing.school}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#666' }}>Size</p>
                  <p style={{ margin: '0', fontSize: '14px' }}>{listing.size}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#666' }}>Gender</p>
                  <p style={{ margin: '0', fontSize: '14px' }}>{listing.gender}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#666' }}>Condition</p>
                  <p style={{ margin: '0', fontSize: '14px' }}>{getConditionText(listing.condition)}</p>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#666' }}>Category</p>
                <p style={{ margin: '0', fontSize: '14px' }}>
                  {listing.category}
                  {listing.subcategory && ` > ${listing.subcategory}`}
                  {listing.sport && ` > ${listing.sport}`}
                </p>
              </div>
              
              <IonButton 
                expand="full" 
                size="large"
                onClick={handleAddToCart}
                disabled={listing.soldOut || listing.quantity === 0}
                style={{ marginTop: '20px' }}
              >
                <IonIcon icon={cartOutline} slot="start" />
                {listing.soldOut || listing.quantity === 0 ? 'Sold Out' : 'Add to Cart'}
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
        
        <IonToast
          isOpen={isOpen}
          onDidDismiss={hideToast}
          message={message}
          duration={3000}
          position="bottom"
          color={color}
        />

        {/* Photo zoom modal */}
        <IonModal isOpen={!!zoomPhoto} onDidDismiss={() => setZoomPhoto(null)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{zoomLabel} Photo</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setZoomPhoto(null)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '100%', padding: '16px', backgroundColor: '#000'
            }}>
              {zoomPhoto && (
                <img
                  src={zoomPhoto}
                  alt={`${zoomLabel} photo`}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              )}
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default ItemPage;