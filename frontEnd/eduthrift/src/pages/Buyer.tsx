import { IonContent, IonCard, IonCardContent, IonToast } from '@ionic/react';
import { useEffect } from 'react';
import Categories from '../components/Categories';
import adBanner from '../assets/adbanner1.jpg';
import { useToast } from '../hooks/useToast';
import { useListingsStore } from '../stores/listingsStore';
import { useUserStore } from '../stores/userStore';

const Buyer: React.FC = () => {
  const { isOpen, message, color, hideToast } = useToast();
  const { fetchListings } = useListingsStore();
  const { userProfile } = useUserStore();
  
  // Fetch listings with user location on component mount
  useEffect(() => {
    if (userProfile?.town && userProfile?.province) {
      const userLocation = `${userProfile.town}, ${userProfile.province}`;
      fetchListings(userLocation);
    } else {
      fetchListings(); // Fetch without location if not available
    }
  }, [userProfile, fetchListings]);
  
  const handleCategorySelect = (category: string, subcategory?: string, sport?: string, item?: string, schoolName?: string, clubName?: string) => {
    console.log('Buyer selected:', { category, subcategory, sport, item, schoolName, clubName });
  };

  return (
    <IonContent>
      <div style={{ padding: '16px', paddingTop: '60px', display: 'flex', justifyContent: 'center' }}>
        <IonCard style={{ width: '100%', maxWidth: '800px' }}>
          <IonCardContent>
            {/* Ad Banner */}
            <img 
              src={adBanner} 
              alt="Advertisement" 
              style={{ 
                width: '100%', 
                // height: '120px', 
                objectFit: 'cover',
                marginBottom: '20px',
                borderRadius: '8px'
              }} 
            />
            
            <Categories userType="buyer" onCategorySelect={handleCategorySelect} />
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
    </IonContent>
  );
};

export default Buyer;