
import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonText } from '@ionic/react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>App Disclaimer</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonText>
          <p><strong>Prohibited Items:</strong></p>
          <ul>
            <li>No selling or uploading of underwear.</li>
            <li>No selling or uploading of electronics.</li>
          </ul>
          <p><strong>Grading of Goods:</strong></p>
          <ul>
            <li>1. Brand New (never been used)</li>
            <li>2. Like New (rarely used)</li>
            <li>3. Used but not damaged</li>
            <li>4. Used and worn</li>
          </ul>
          <p>All goods must be graded honestly according to the above scale.</p>
          <p><strong>No Refunds or Returns:</strong> All sales are final.</p>
        </IonText>
        <IonButton expand="block" onClick={onClose}>Close</IonButton>
      </IonContent>
    </IonModal>
  );
};

export default DisclaimerModal;
