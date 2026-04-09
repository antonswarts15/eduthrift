import React, { useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButtons, IonBackButton, IonButton, IonInput, IonItem,
  IonLabel, IonIcon, IonToast, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonText
} from '@ionic/react';
import { trashOutline, warningOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { userApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';

const DeleteAccountPage: React.FC = () => {
  const [step, setStep] = useState<'confirm' | 'password' | 'done'>('confirm');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'danger' | 'success'>('danger');
  const history = useHistory();
  const { logout } = useAuthStore();

  const handleDelete = async () => {
    if (!password) {
      setToastMessage('Please enter your password to confirm deletion');
      setToastColor('danger');
      setToastMessage('Please enter your password');
      return;
    }
    setIsLoading(true);
    try {
      await userApi.deleteAccount(password);
      setStep('done');
      logout();
    } catch (error: any) {
      setToastMessage(error.response?.data?.error || 'Failed to delete account. Please check your password.');
      setToastColor('danger');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Account Deleted</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonCard>
            <IonCardContent style={{ textAlign: 'center', padding: '40px 20px' }}>
              <IonIcon icon={trashOutline} style={{ fontSize: '64px', color: '#666' }} />
              <h2>Account Deleted</h2>
              <p>Your account and all associated data have been permanently deleted.</p>
              <IonButton expand="block" onClick={() => history.push('/login')} style={{ marginTop: '20px' }}>
                Back to Home
              </IonButton>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" />
          </IonButtons>
          <IonTitle>Delete Account</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">

        {step === 'confirm' && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c62828' }}>
                <IonIcon icon={warningOutline} /> Permanently Delete Account
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText color="danger">
                <p><strong>This action is permanent and cannot be undone.</strong></p>
              </IonText>
              <p>Deleting your account will permanently remove:</p>
              <ul>
                <li>Your profile and personal details</li>
                <li>All your listings</li>
                <li>Your wishlist and saved items</li>
                <li>Your uploaded verification documents</li>
              </ul>
              <p style={{ fontSize: '13px', color: '#666' }}>
                Transaction records may be retained for up to 5 years for legal and financial compliance purposes.
              </p>
              <IonButton
                expand="block"
                color="danger"
                style={{ marginTop: '20px' }}
                onClick={() => setStep('password')}
              >
                I understand, continue
              </IonButton>
              <IonButton expand="block" fill="outline" onClick={() => history.goBack()} style={{ marginTop: '8px' }}>
                Cancel
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {step === 'password' && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Confirm Your Password</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>Enter your password to permanently delete your account.</p>
              <IonItem>
                <IonLabel position="floating">Password</IonLabel>
                <IonInput
                  type="password"
                  value={password}
                  onIonInput={e => setPassword((e.target as HTMLIonInputElement).value as string || '')}
                />
              </IonItem>
              <IonButton
                expand="block"
                color="danger"
                style={{ marginTop: '20px' }}
                onClick={handleDelete}
                disabled={isLoading}
              >
                <IonIcon icon={trashOutline} slot="start" />
                {isLoading ? 'Deleting...' : 'Delete My Account'}
              </IonButton>
              <IonButton expand="block" fill="outline" onClick={() => setStep('confirm')} style={{ marginTop: '8px' }}>
                Back
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage}
          duration={3000}
          color={toastColor}
          onDidDismiss={() => setToastMessage('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default DeleteAccountPage;
