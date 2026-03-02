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
  IonSelect,
  IonSelectOption,
  IonButtons
} from '@ionic/react';

interface BankingDetailsModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSave: (bankingData: BankingData) => void;
  initialData?: BankingData;
}

export interface BankingData {
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountType?: string;
  bankBranchCode?: string;
}

const BankingDetailsModal: React.FC<BankingDetailsModalProps> = ({ isOpen, onDismiss, onSave, initialData }) => {
  const [bankName, setBankName] = useState(initialData?.bankName || '');
  const [bankAccountNumber, setBankAccountNumber] = useState(initialData?.bankAccountNumber || '');
  const [bankAccountType, setBankAccountType] = useState(initialData?.bankAccountType || 'cheque');
  const [bankBranchCode, setBankBranchCode] = useState(initialData?.bankBranchCode || '');

  const handleSave = () => {
    if (!bankName || !bankAccountNumber || !bankAccountType || !bankBranchCode) {
      alert('Please fill in all required fields');
      return;
    }
    onSave({ bankName, bankAccountNumber, bankAccountType, bankBranchCode });
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Banking Details</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>Cancel</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '16px', backgroundColor: '#fff3cd', margin: '16px', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            🔒 Your banking details are securely stored and will only be used for payment processing.
          </p>
        </div>
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Bank Name *</IonLabel>
            <IonSelect
              value={bankName}
              onIonChange={e => setBankName(e.detail.value)}
              placeholder="Select Bank"
            >
              <IonSelectOption value="ABSA">ABSA</IonSelectOption>
              <IonSelectOption value="Standard Bank">Standard Bank</IonSelectOption>
              <IonSelectOption value="FNB">FNB</IonSelectOption>
              <IonSelectOption value="Nedbank">Nedbank</IonSelectOption>
              <IonSelectOption value="Capitec">Capitec</IonSelectOption>
              <IonSelectOption value="Discovery Bank">Discovery Bank</IonSelectOption>
              <IonSelectOption value="TymeBank">TymeBank</IonSelectOption>
              <IonSelectOption value="African Bank">African Bank</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Account Number *</IonLabel>
            <IonInput
              type="number"
              value={bankAccountNumber}
              onIonInput={e => setBankAccountNumber((e.target as HTMLIonInputElement).value as string || '')}
              placeholder="1234567890"
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Account Type *</IonLabel>
            <IonSelect
              value={bankAccountType}
              onIonChange={e => setBankAccountType(e.detail.value)}
            >
              <IonSelectOption value="cheque">Cheque/Current</IonSelectOption>
              <IonSelectOption value="savings">Savings</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Branch Code *</IonLabel>
            <IonInput
              type="number"
              value={bankBranchCode}
              onIonInput={e => setBankBranchCode((e.target as HTMLIonInputElement).value as string || '')}
              placeholder="250655"
              required
            />
          </IonItem>
        </IonList>
        <IonButton expand="block" onClick={handleSave} style={{ margin: '16px' }}>
          Save Banking Details
        </IonButton>
      </IonContent>
    </IonModal>
  );
};

export default BankingDetailsModal;
