import React from 'react';
import { IonModal, IonButton, IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { logInOutline, personAddOutline } from 'ionicons/icons';
import { useAuthPromptStore } from '../stores/authPromptStore';

const AuthPromptModal: React.FC = () => {
  const { isOpen, actionDescription, hidePrompt } = useAuthPromptStore();
  const history = useHistory();

  const handleLogin = () => {
    hidePrompt();
    history.push('/login');
  };

  const handleRegister = () => {
    hidePrompt();
    history.push('/login?segment=register');
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={hidePrompt} style={{ '--width': '90%', '--max-width': '400px', '--height': 'auto', '--border-radius': '16px' }} className="auth-prompt-modal">
      <div style={{ padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          <IonIcon icon={logInOutline} style={{ fontSize: '48px', color: '#3880ff' }} />
        </div>
        <h2 style={{ margin: '0 0 8px', color: '#333', fontSize: '20px' }}>Sign in required</h2>
        <p style={{ margin: '0 0 24px', color: '#666', fontSize: '15px', lineHeight: '1.5' }}>
          Sign in to {actionDescription}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <IonButton expand="block" onClick={handleLogin}>
            <IonIcon icon={logInOutline} slot="start" />
            Login
          </IonButton>
          <IonButton expand="block" fill="outline" onClick={handleRegister}>
            <IonIcon icon={personAddOutline} slot="start" />
            Create Account
          </IonButton>
          <IonButton expand="block" fill="clear" color="medium" onClick={hidePrompt}>
            Continue Browsing
          </IonButton>
        </div>
      </div>
    </IonModal>
  );
};

export default AuthPromptModal;
