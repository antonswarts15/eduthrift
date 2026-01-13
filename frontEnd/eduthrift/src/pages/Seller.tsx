import { IonContent, IonCard, IonCardContent } from '@ionic/react';
import Categories from '../components/Categories';
import SellerVerification from '../components/SellerVerification';
import { useUserStore } from '../stores/userStore';
import adBanner from '../assets/adbanner1.jpg';

const Seller: React.FC = () => {
  const { userProfile, isSellerVerified, updateProfile } = useUserStore();
  
  const handleCategorySelect = (category: string, subcategory?: string, sport?: string, item?: string, schoolName?: string, clubName?: string) => {
    console.log('Seller selected:', { category, subcategory, sport, item, schoolName, clubName });
  };

  const handleVerificationComplete = () => {
    updateProfile({
      sellerVerification: {
        ...userProfile?.sellerVerification,
        status: 'verified',
        verifiedAt: new Date().toISOString()
      }
    });
  };

  // Show verification if user is not verified as seller
  if (!isSellerVerified()) {
    return (
      <IonContent>
        <div style={{ paddingTop: '60px' }}>
          <SellerVerification onVerificationComplete={handleVerificationComplete} />
        </div>
      </IonContent>
    );
  }

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
            
            <Categories userType="seller" onCategorySelect={handleCategorySelect} />
          </IonCardContent>
        </IonCard>
      </div>
    </IonContent>
  );
};

export default Seller;
