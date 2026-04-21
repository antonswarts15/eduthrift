import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonCard, IonCardContent } from '@ionic/react';
import Categories from '../components/Categories';
import SellerVerification from '../components/SellerVerification';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import adBanner from '../assets/adbanner1.jpg';

const Seller: React.FC = () => {
  const history = useHistory();
  const { isAuthenticated } = useAuthStore();
  const { userProfile, fetchUserProfile } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated) {
      history.replace('/login');
      return;
    }
    fetchUserProfile();
  }, [isAuthenticated]);

  if (!isAuthenticated || !userProfile) return null;

  const verificationStatus = userProfile.sellerVerification?.status;
  const isVerified = verificationStatus === 'verified';

  if (!isVerified) {
    return (
      <IonContent>
        <div style={{ padding: '16px', paddingTop: '60px' }}>
          {verificationStatus === 'pending' ? (
            <IonCard>
              <IonCardContent style={{ textAlign: 'center', padding: '32px 16px' }}>
                <h2 style={{ marginBottom: '12px' }}>Documents Under Review</h2>
                <p style={{ color: '#666', fontSize: '15px' }}>
                  Thank you for submitting your documents. Our team will review your application within 24–48 hours.
                  You'll be able to list items once approved.
                </p>
                <p style={{ color: '#999', fontSize: '13px', marginTop: '16px' }}>
                  Questions? Email <a href="mailto:support@eduthrift.co.za">support@eduthrift.co.za</a>
                </p>
              </IonCardContent>
            </IonCard>
          ) : verificationStatus === 'rejected' ? (
            <IonCard>
              <IonCardContent style={{ padding: '16px' }}>
                <h2 style={{ textAlign: 'center', color: '#e74c3c', marginBottom: '12px' }}>Verification Rejected</h2>
                <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
                  Your previous documents were not approved. Please resubmit with clearer copies.
                </p>
                <SellerVerification onVerificationComplete={fetchUserProfile} />
              </IonCardContent>
            </IonCard>
          ) : (
            <SellerVerification onVerificationComplete={fetchUserProfile} />
          )}
        </div>
      </IonContent>
    );
  }

  return (
    <IonContent>
      <div style={{ padding: '16px', paddingTop: '60px', display: 'flex', justifyContent: 'center' }}>
        <IonCard style={{ width: '100%', maxWidth: '800px' }}>
          <IonCardContent>
            <img
              src={adBanner}
              alt="Advertisement"
              style={{ width: '100%', objectFit: 'cover', marginBottom: '20px', borderRadius: '8px' }}
            />
            <Categories userType="seller" onCategorySelect={() => {}} />
          </IonCardContent>
        </IonCard>
      </div>
    </IonContent>
  );
};

export default Seller;
