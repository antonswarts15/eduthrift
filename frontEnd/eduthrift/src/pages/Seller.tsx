import { IonContent, IonCard, IonCardContent, IonButton, IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, timeOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import Categories from '../components/Categories';
import SellerVerification from '../components/SellerVerification';
import { useUserStore } from '../stores/userStore';
import adBanner from '../assets/adbanner1.jpg';

const Seller: React.FC = () => {
  const { userProfile, isSellerVerified, updateProfile } = useUserStore();
  const history = useHistory();

  const handleCategorySelect = (category: string, subcategory?: string, sport?: string, item?: string, schoolName?: string, clubName?: string) => {
    console.log('Seller selected:', { category, subcategory, sport, item, schoolName, clubName });
  };

  const handleVerificationComplete = () => {
    updateProfile({
      sellerVerification: {
        ...userProfile?.sellerVerification,
        status: 'pending',
        submittedAt: new Date().toISOString()
      }
    });
  };

  const verificationStatus = userProfile?.sellerVerification?.status;

  // Show pending state after documents submitted
  if (verificationStatus === 'pending') {
    return (
      <IonContent>
        <div style={{ padding: '16px', paddingTop: '60px', display: 'flex', justifyContent: 'center' }}>
          <IonCard style={{ width: '100%', maxWidth: '600px' }}>
            <IonCardContent style={{ textAlign: 'center', padding: '32px 16px' }}>
              <IonIcon icon={timeOutline} style={{ fontSize: '64px', color: '#ffc107' }} />
              <h2 style={{ margin: '16px 0 8px' }}>Documents Submitted</h2>
              <p style={{ color: '#666', marginBottom: '24px' }}>
                Your verification documents are under review. This typically takes 24–48 hours.
                You'll be able to list items once an admin approves your account.
              </p>
              <IonButton expand="block" onClick={() => history.push('/buyer')}>
                Browse Items
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    );
  }

  // Show verification form if user is not verified as seller
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
