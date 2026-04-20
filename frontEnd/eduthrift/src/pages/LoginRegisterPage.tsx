import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonToast,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBadge,
  IonSpinner
} from '@ionic/react';
import { logInOutline, personAddOutline, eyeOutline, eyeOffOutline, locationOutline, arrowBackOutline, warningOutline, refreshOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { useListingsStore } from '../stores/listingsStore';
import { Listing } from '../stores/listingsStore';
import { userApi } from '../services/api';
import './LoginRegisterPage.css';

// Assets
import LoginVideo from '../assets/Loginvid.mp4';
import LogoImage from '../assets/logo.png';

const LoginRegisterPage: React.FC = () => {
  const [segment, setSegment] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerSuburb, setRegisterSuburb] = useState('');
  const [registerTown, setRegisterTown] = useState('');
  const [registerProvince, setRegisterProvince] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [expiryListings, setExpiryListings] = useState<Listing[]>([]);
  const [relistingId, setRelistingId] = useState<string | null>(null);

  const history = useHistory();
  const location = useLocation();
  const { login: authLogin } = useAuthStore();
  const { fetchUserProfile } = useUserStore();
  const { fetchMyListings, getListingsNearExpiry, getDaysUntilExpiry, relistItem } = useListingsStore();

  // Read segment query param to support direct navigation to register tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const segmentParam = params.get('segment');
    if (segmentParam === 'register') {
      setSegment('register');
    }
  }, [location.search]);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      setToastMessage('Please enter both email and password');
      setToastColor('danger');
      setShowToast(true);
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await userApi.login(loginEmail, loginPassword);
      if (response.data.token) {
        authLogin(response.data.token);
        await fetchUserProfile();
        await fetchMyListings();
        const nearExpiry = getListingsNearExpiry();
        if (nearExpiry.length > 0) {
          setExpiryListings(nearExpiry);
          setShowExpiryModal(true);
        } else {
          setToastMessage('Login successful!');
          setToastColor('success');
          setShowToast(true);
          history.push('/home');
        }
      } else {
        throw new Error('No token received');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
      setToastMessage(errorMessage);
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword ||
        !registerPhone || !registerSuburb || !registerTown || !registerProvince) {
      setToastMessage('Please fill in all fields including your location details');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (registerPassword.length < 8) {
      setToastMessage('Password must be at least 8 characters');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setToastMessage('Passwords do not match');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await userApi.register({
        firstName: registerName.split(' ')[0],
        lastName: registerName.split(' ').slice(1).join(' ') || registerName,
        email: registerEmail,
        password: registerPassword,
        phone: registerPhone,
        suburb: registerSuburb,
        town: registerTown,
        province: registerProvince,
        userType: 'both'
      });

      if (response.data.token) {
        authLogin(response.data.token);
        await fetchUserProfile();
        setToastMessage('Registration successful! Location saved for personalized search.');
        setToastColor('success');
        setShowToast(true);
        history.push('/home');
      } else {
        throw new Error('No token received');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      setToastMessage(errorMessage);
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <IonPage className="login-register-page">
        <IonContent fullscreen className="login-content">
          {/* Background video */}
          <video
              className="background-video"
              autoPlay
              loop
              muted
              playsInline
          >
            <source src={LoginVideo} type="video/mp4" />
          </video>

          {/* Foreground content */}
          <IonGrid className="ion-padding content-overlay">
            <IonRow className="ion-justify-content-center" style={{ paddingTop: '40px' }}>
              <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="5">
                <IonCard>
                  <IonCardHeader className="ion-text-center">
                    <img
                        src={LogoImage}
                        alt="Eduthrift Logo"
                        className="login-logo"
                    />
                    <IonSegment
                        value={segment}
                        onIonChange={e => setSegment(e.detail.value as 'login' | 'register')}
                    >
                      <IonSegmentButton value="login">
                        <IonIcon icon={logInOutline} />
                        <IonLabel>Login</IonLabel>
                      </IonSegmentButton>
                      <IonSegmentButton value="register">
                        <IonIcon icon={personAddOutline} />
                        <IonLabel>Register</IonLabel>
                      </IonSegmentButton>
                    </IonSegment>
                  </IonCardHeader>

                  <IonCardContent>
                    {segment === 'login' ? (
                        <>
                          <IonItem>
                            <IonLabel position="floating">Email</IonLabel>
                            <IonInput
                                type="email"
                                value={loginEmail}
                                onIonInput={e => setLoginEmail((e.target as HTMLIonInputElement).value as string || '')}
                            />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="floating">Password</IonLabel>
                            <IonInput
                                type={showLoginPassword ? 'text' : 'password'}
                                value={loginPassword}
                                onIonInput={e => setLoginPassword((e.target as HTMLIonInputElement).value as string || '')}
                            />
                            <IonButton fill="clear" slot="end" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                              <IonIcon icon={showLoginPassword ? eyeOffOutline : eyeOutline} />
                            </IonButton>
                          </IonItem>
                          <IonButton expand="block" className="ion-margin-top" onClick={handleLogin} disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                          </IonButton>
                        </>
                    ) : (
                        <>
                          <IonItem>
                            <IonLabel position="floating">Full Name *</IonLabel>
                            <IonInput
                                value={registerName}
                                onIonInput={e => setRegisterName((e.target as HTMLIonInputElement).value as string || '')}
                                placeholder="John Smith"
                            />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="floating">Email *</IonLabel>
                            <IonInput
                                type="email"
                                value={registerEmail}
                                onIonInput={e => setRegisterEmail((e.target as HTMLIonInputElement).value as string || '')}
                                placeholder="john@example.com"
                            />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="floating">Phone Number *</IonLabel>
                            <IonInput
                                type="tel"
                                value={registerPhone}
                                onIonInput={e => setRegisterPhone((e.target as HTMLIonInputElement).value as string || '')}
                                placeholder="082 123 4567"
                            />
                          </IonItem>
                          
                          {/* Location Section */}
                          <div style={{ margin: '16px 0', padding: '8px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                              <IonIcon icon={locationOutline} style={{ marginRight: '8px', color: '#0066cc' }} />
                              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#0066cc' }}>Location (for personalized search & delivery)</span>
                            </div>
                            
                            <IonItem>
                              <IonLabel position="floating">Province *</IonLabel>
                              <IonSelect value={registerProvince} onIonChange={e => setRegisterProvince(e.detail.value)}>
                                <IonSelectOption value="Gauteng">Gauteng</IonSelectOption>
                                <IonSelectOption value="Western Cape">Western Cape</IonSelectOption>
                                <IonSelectOption value="KwaZulu-Natal">KwaZulu-Natal</IonSelectOption>
                                <IonSelectOption value="Eastern Cape">Eastern Cape</IonSelectOption>
                                <IonSelectOption value="Free State">Free State</IonSelectOption>
                                <IonSelectOption value="Limpopo">Limpopo</IonSelectOption>
                                <IonSelectOption value="Mpumalanga">Mpumalanga</IonSelectOption>
                                <IonSelectOption value="North West">North West</IonSelectOption>
                                <IonSelectOption value="Northern Cape">Northern Cape</IonSelectOption>
                              </IonSelect>
                            </IonItem>
                            
                            <IonItem>
                              <IonLabel position="floating">Town/City *</IonLabel>
                              <IonInput
                                  value={registerTown}
                                  onIonInput={e => setRegisterTown((e.target as HTMLIonInputElement).value as string || '')}
                                  placeholder="Johannesburg"
                              />
                            </IonItem>

                            <IonItem>
                              <IonLabel position="floating">Suburb *</IonLabel>
                              <IonInput
                                  value={registerSuburb}
                                  onIonInput={e => setRegisterSuburb((e.target as HTMLIonInputElement).value as string || '')}
                                  placeholder="Sandton"
                              />
                            </IonItem>
                          </div>
                          
                          <IonItem>
                            <IonLabel position="floating">Password *</IonLabel>
                            <IonInput
                                type={showRegisterPassword ? 'text' : 'password'}
                                value={registerPassword}
                                onIonInput={e => setRegisterPassword((e.target as HTMLIonInputElement).value as string || '')}
                            />
                            <IonButton fill="clear" slot="end" onClick={() => setShowRegisterPassword(!showRegisterPassword)}>
                              <IonIcon icon={showRegisterPassword ? eyeOffOutline : eyeOutline} />
                            </IonButton>
                          </IonItem>
                          <IonItem>
                            <IonLabel position="floating">Confirm Password *</IonLabel>
                            <IonInput
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={registerConfirmPassword}
                                onIonInput={e => setRegisterConfirmPassword((e.target as HTMLIonInputElement).value as string || '')}
                            />
                            <IonButton fill="clear" slot="end" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                              <IonIcon icon={showConfirmPassword ? eyeOffOutline : eyeOutline} />
                            </IonButton>
                          </IonItem>
                          <IonButton expand="block" className="ion-margin-top" onClick={handleRegister} disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                          </IonButton>
                          <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '12px' }}>
                            By creating an account you agree to our{' '}
                            <a href="/terms-of-service" style={{ color: '#004aad' }}>Terms of Service</a>
                            {' '}and{' '}
                            <a href="/privacy-policy" style={{ color: '#004aad' }}>Privacy Policy</a>.
                          </p>
                        </>
                    )}
                  </IonCardContent>
                </IonCard>
                {/* Back to browse — below card, inside column so it scrolls with content */}
                <div style={{ textAlign: 'center', padding: '16px 0 32px' }}>
                  <IonButton
                    fill="solid"
                    onClick={() => history.goBack()}
                    style={{ '--background': '#004aad', '--color': 'white', '--border-radius': '5px', textTransform: 'none' }}
                  >
                    <IonIcon icon={arrowBackOutline} slot="start" />
                    Continue browsing without logging in
                  </IonButton>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>

          <IonToast
              isOpen={showToast}
              message={toastMessage}
              duration={2000}
              color={toastColor}
              onDidDismiss={() => setShowToast(false)}
          />
        </IonContent>

        {/* ── Expiry reminder modal (shown after login if listings are expiring soon) ── */}
        <IonModal isOpen={showExpiryModal} onDidDismiss={() => { setShowExpiryModal(false); history.push('/home'); }}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Listings Expiring Soon</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', padding: '14px', backgroundColor: '#fff8e1', borderRadius: '10px' }}>
                <IonIcon icon={warningOutline} style={{ fontSize: '28px', color: '#f39c12', flexShrink: 0 }} />
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '15px', color: '#333' }}>
                    {expiryListings.length} listing{expiryListings.length > 1 ? 's' : ''} expiring within 14 days
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                    Relist now to keep them visible to buyers — it's free.
                  </p>
                </div>
              </div>

              {expiryListings.map(listing => {
                const days = getDaysUntilExpiry(listing);
                const urgent = days <= 3;
                return (
                  <div key={listing.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px', marginBottom: '10px',
                    border: `1.5px solid ${urgent ? '#e74c3c' : '#f39c12'}`,
                    borderRadius: '10px', backgroundColor: 'white',
                  }}>
                    {listing.frontPhoto ? (
                      <img src={listing.frontPhoto} alt={listing.name}
                        style={{ width: '56px', height: '68px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '56px', height: '68px', backgroundColor: '#f5f5f5', borderRadius: '6px', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '14px', color: '#1a1a1a' }}>{listing.name}</p>
                      <IonBadge color={urgent ? 'danger' : 'warning'} style={{ fontSize: '11px' }}>
                        {days === 0 ? 'Expires today' : `${days} day${days === 1 ? '' : 's'} left`}
                      </IonBadge>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#004aad', fontWeight: 700 }}>R{listing.price}</p>
                    </div>
                    <IonButton
                      size="small"
                      fill="solid"
                      disabled={relistingId === listing.id}
                      onClick={async () => {
                        setRelistingId(listing.id);
                        try {
                          await relistItem(listing.id);
                          setExpiryListings(prev => prev.filter(l => l.id !== listing.id));
                        } finally {
                          setRelistingId(null);
                        }
                      }}
                      style={{ '--background': '#004aad', flexShrink: 0 }}
                    >
                      {relistingId === listing.id
                        ? <IonSpinner name="crescent" style={{ width: '18px', height: '18px' }} />
                        : <><IonIcon icon={refreshOutline} slot="start" />Relist</>}
                    </IonButton>
                  </div>
                );
              })}

              <IonButton
                expand="block"
                onClick={() => { setShowExpiryModal(false); history.push('/home'); }}
                style={{ marginTop: '16px', '--background': '#004aad' }}
              >
                Continue to Home
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonPage>
  );
};

export default LoginRegisterPage;