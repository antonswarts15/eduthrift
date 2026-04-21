import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonCard, IonCardContent, IonButton, IonIcon } from '@ionic/react';
import { timeOutline, storefrontOutline, alertCircleOutline } from 'ionicons/icons';
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
        <div style={{ padding: '20px 16px', paddingTop: '48px', maxWidth: '480px', margin: '0 auto' }}>
          {verificationStatus === 'pending' ? (
            <IonCard style={{ borderRadius: '16px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', margin: 0 }}>
              <IonCardContent style={{ padding: '40px 28px 32px', textAlign: 'center' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  backgroundColor: '#FFF8E7', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 24px'
                }}>
                  <IonIcon icon={timeOutline} style={{ fontSize: '36px', color: '#F59E0B' }} />
                </div>

                <h2 style={{ margin: '0 0 12px', fontSize: '21px', fontWeight: '700', color: '#111', letterSpacing: '-0.3px' }}>
                  Documents Under Review
                </h2>
                <p style={{ color: '#555', fontSize: '15px', lineHeight: '1.65', margin: '0 0 6px' }}>
                  Thank you for submitting your documents. Our team will review your application within 24–48 hours.
                </p>
                <p style={{ color: '#888', fontSize: '13px', margin: '0 0 32px' }}>
                  You'll be able to list items as soon as you're approved.
                </p>

                <IonButton
                  expand="block"
                  fill="outline"
                  onClick={() => history.push('/buyer')}
                  style={{ '--border-radius': '10px', fontWeight: '600', marginBottom: '16px' } as any}
                >
                  <IonIcon icon={storefrontOutline} slot="start" />
                  Browse Listings
                </IonButton>

                <p style={{ color: '#bbb', fontSize: '12px', margin: 0 }}>
                  Questions?{' '}
                  <a href="mailto:support@eduthrift.co.za" style={{ color: 'var(--ion-color-primary)' }}>
                    support@eduthrift.co.za
                  </a>
                </p>
              </IonCardContent>
            </IonCard>
          ) : verificationStatus === 'rejected' ? (
            <>
              <IonCard style={{ borderRadius: '16px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', margin: '0 0 16px' }}>
                <IonCardContent style={{ padding: '28px 24px', textAlign: 'center' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 20px'
                  }}>
                    <IonIcon icon={alertCircleOutline} style={{ fontSize: '32px', color: '#EF4444' }} />
                  </div>
                  <h2 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: '700', color: '#111' }}>
                    Verification Rejected
                  </h2>
                  <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px' }}>
                    Your previous documents were not approved. Please resubmit with clearer copies.
                  </p>
                  <IonButton
                    expand="block"
                    fill="outline"
                    onClick={() => history.push('/buyer')}
                    style={{ '--border-radius': '10px' } as any}
                  >
                    <IonIcon icon={storefrontOutline} slot="start" />
                    Browse Listings
                  </IonButton>
                </IonCardContent>
              </IonCard>
              <SellerVerification onVerificationComplete={fetchUserProfile} />
            </>
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
