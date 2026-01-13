import React, { useState } from 'react';
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
  IonSelectOption
} from '@ionic/react';
import { logInOutline, personAddOutline, eyeOutline, eyeOffOutline, locationOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const history = useHistory();
  const { login: authLogin } = useAuthStore();
  const { fetchUserProfile } = useUserStore();

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      setToastMessage('Please enter both email and password');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    try {
      const response = await userApi.login(loginEmail, loginPassword);
      if (response.data.token) {
        authLogin(response.data.token);
        // Fetch user profile immediately after login
        await fetchUserProfile();
        setToastMessage('Login successful!');
        setToastColor('success');
        setShowToast(true);
        history.push('/home');
      } else {
        throw new Error('No token received');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
      setToastMessage(errorMessage);
      setToastColor('danger');
      setShowToast(true);
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

    if (registerPassword !== registerConfirmPassword) {
      setToastMessage('Passwords do not match');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

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
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      setToastMessage(errorMessage);
      setToastColor('danger');
      setShowToast(true);
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
            <IonRow className="ion-justify-content-center ion-align-items-center" style={{ minHeight: '100vh' }}>
              <IonCol size="12" size-md="8" size-lg="6">
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
                                onIonChange={e => setLoginEmail(e.detail.value ?? '')}
                            />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="floating">Password</IonLabel>
                            <IonInput
                                type={showLoginPassword ? 'text' : 'password'}
                                value={loginPassword}
                                onIonChange={e => setLoginPassword(e.detail.value ?? '')}
                            />
                            <IonButton fill="clear" slot="end" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                              <IonIcon icon={showLoginPassword ? eyeOffOutline : eyeOutline} />
                            </IonButton>
                          </IonItem>
                          <IonButton expand="block" className="ion-margin-top" onClick={handleLogin}>
                            Login
                          </IonButton>
                        </>
                    ) : (
                        <>
                          <IonItem>
                            <IonLabel position="floating">Full Name *</IonLabel>
                            <IonInput
                                value={registerName}
                                onIonChange={e => setRegisterName(e.detail.value ?? '')}
                                placeholder="John Smith"
                            />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="floating">Email *</IonLabel>
                            <IonInput
                                type="email"
                                value={registerEmail}
                                onIonChange={e => setRegisterEmail(e.detail.value ?? '')}
                                placeholder="john@example.com"
                            />
                          </IonItem>
                          <IonItem>
                            <IonLabel position="floating">Phone Number *</IonLabel>
                            <IonInput
                                type="tel"
                                value={registerPhone}
                                onIonChange={e => setRegisterPhone(e.detail.value ?? '')}
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
                                  onIonChange={e => setRegisterTown(e.detail.value ?? '')}
                                  placeholder="Johannesburg"
                              />
                            </IonItem>
                            
                            <IonItem>
                              <IonLabel position="floating">Suburb *</IonLabel>
                              <IonInput
                                  value={registerSuburb}
                                  onIonChange={e => setRegisterSuburb(e.detail.value ?? '')}
                                  placeholder="Sandton"
                              />
                            </IonItem>
                          </div>
                          
                          <IonItem>
                            <IonLabel position="floating">Password *</IonLabel>
                            <IonInput
                                type={showRegisterPassword ? 'text' : 'password'}
                                value={registerPassword}
                                onIonChange={e => setRegisterPassword(e.detail.value ?? '')}
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
                                onIonChange={e => setRegisterConfirmPassword(e.detail.value ?? '')}
                            />
                            <IonButton fill="clear" slot="end" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                              <IonIcon icon={showConfirmPassword ? eyeOffOutline : eyeOutline} />
                            </IonButton>
                          </IonItem>
                          <IonButton expand="block" className="ion-margin-top" onClick={handleRegister}>
                            Create Account
                          </IonButton>
                        </>
                    )}
                  </IonCardContent>
                </IonCard>
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
      </IonPage>
  );
};

export default LoginRegisterPage;