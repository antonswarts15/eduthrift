import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButtons
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
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onDismiss, onSave, initialData }) => {
  const [streetAddress, setStreetAddress] = useState(initialData?.streetAddress || '');
  const [suburb, setSuburb] = useState(initialData?.suburb || '');
  const [town, setTown] = useState(initialData?.town || '');
  const [province, setProvince] = useState(initialData?.province || '');

  const handleSave = () => {
    if (!suburb || !town || !province) {
      alert('Please fill in all required fields');
      return;
    }
    onSave({ streetAddress, suburb, town, province });
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Enter Delivery Address</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>Cancel</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Street Address (Optional)</IonLabel>
            <IonInput
              value={streetAddress}
              onIonInput={e => setStreetAddress((e.target as HTMLIonInputElement).value as string || '')}
              placeholder="123 Main Street"
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Suburb *</IonLabel>
            <IonInput
              value={suburb}
              onIonInput={e => setSuburb((e.target as HTMLIonInputElement).value as string || '')}
              placeholder="Sandton"
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Town/City *</IonLabel>
            <IonInput
              value={town}
              onIonInput={e => setTown((e.target as HTMLIonInputElement).value as string || '')}
              placeholder="Johannesburg"
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Province *</IonLabel>
            <IonInput
              value={province}
              onIonInput={e => setProvince((e.target as HTMLIonInputElement).value as string || '')}
              placeholder="Gauteng"
              required
            />
          </IonItem>
        </IonList>
        <IonButton expand="block" onClick={handleSave} style={{ margin: '16px' }}>
          Save Address
        </IonButton>
      </IonContent>
    </IonModal>
  );
};

export default AddressModal;
