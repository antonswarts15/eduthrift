import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButtons,
  IonToast
} from '@ionic/react';

interface AddressModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSave: (address: AddressData) => void;
  initialData?: AddressData;
}

export interface AddressData {
  streetAddress?: string;
  suburb?: string;
  town?: string;
  province?: string;
  postalCode?: string;
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onDismiss, onSave, initialData }) => {
  const [streetAddress, setStreetAddress] = useState(initialData?.streetAddress || '');
  const [suburb, setSuburb] = useState(initialData?.suburb || '');
  const [town, setTown] = useState(initialData?.town || '');
  const [province, setProvince] = useState(initialData?.province || '');
  const [postalCode, setPostalCode] = useState(initialData?.postalCode || '');
  const [showError, setShowError] = useState(false);

  const handleSave = () => {
    if (!streetAddress || !suburb || !town || !province) {
      setShowError(true);
      return;
    }
    onSave({ streetAddress, suburb, town, province, postalCode });
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Delivery Address</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss} fill="clear">Cancel</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList lines="full" style={{ paddingTop: '8px' }}>
          <IonItem>
            <IonLabel position="stacked">
              Street Address <span style={{ color: 'var(--ion-color-danger)' }}>*</span>
            </IonLabel>
            <IonInput
              value={streetAddress}
              onIonInput={e => setStreetAddress((e.target as HTMLIonInputElement).value as string || '')}
              placeholder="12 Oak Avenue"
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">
              Suburb <span style={{ color: 'var(--ion-color-danger)' }}>*</span>
            </IonLabel>
            <IonInput
              value={suburb}
              onIonInput={e => setSuburb((e.target as HTMLIonInputElement).value as string || '')}
              placeholder="Sandton"
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">
              Town / City <span style={{ color: 'var(--ion-color-danger)' }}>*</span>
            </IonLabel>
            <IonInput
              value={town}
              onIonInput={e => setTown((e.target as HTMLIonInputElement).value as string || '')}
              placeholder="Johannesburg"
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">
              Province <span style={{ color: 'var(--ion-color-danger)' }}>*</span>
            </IonLabel>
            <IonInput
              value={province}
              onIonInput={e => setProvince((e.target as HTMLIonInputElement).value as string || '')}
              placeholder="Gauteng"
            />
          </IonItem>
          <IonItem lines="none">
            <IonLabel position="stacked">Postal Code</IonLabel>
            <IonInput
              value={postalCode}
              onIonInput={e => setPostalCode((e.target as HTMLIonInputElement).value as string || '')}
              placeholder="0181"
              inputmode="numeric"
            />
          </IonItem>
        </IonList>
      </IonContent>

      <IonFooter>
        <IonToolbar style={{ '--padding-start': '16px', '--padding-end': '16px', '--padding-top': '8px', '--padding-bottom': '8px' }}>
          <IonButton
            expand="block"
            onClick={handleSave}
            style={{ '--border-radius': '10px', fontWeight: '600' } as any}
          >
            Save Address
          </IonButton>
        </IonToolbar>
      </IonFooter>

      <IonToast
        isOpen={showError}
        message="Please fill in all required fields."
        duration={3000}
        color="danger"
        onDidDismiss={() => setShowError(false)}
      />
    </IonModal>
  );
};

export default AddressModal;
