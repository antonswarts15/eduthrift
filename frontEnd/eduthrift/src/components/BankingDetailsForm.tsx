import React, { useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonToast
} from '@ionic/react';

const BankingDetailsForm: React.FC = () => {
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [accountType, setAccountType] = useState<'savings' | 'current'>('savings');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const saveBankingDetails = async () => {
    try {
      const response = await fetch('/api/auth/banking-details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          bankName,
          accountNumber,
          branchCode,
          accountType
        })
      });

      if (response.ok) {
        setToastMessage('Banking details saved successfully');
        setShowToast(true);
      }
    } catch (error) {
      setToastMessage('Failed to save banking details');
      setShowToast(true);
    }
  };

  return (
    <>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Banking Details</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            <strong>For Sellers Only:</strong> Required for receiving payments when your items are sold and delivered.
            Buyers pay via PayFast - no banking details needed.
          </p>
          
          <IonItem>
            <IonLabel position="stacked">Bank Name</IonLabel>
            <IonSelect value={bankName} onIonChange={e => setBankName(e.detail.value)}>
              <IonSelectOption value="absa">ABSA</IonSelectOption>
              <IonSelectOption value="fnb">FNB</IonSelectOption>
              <IonSelectOption value="standard">Standard Bank</IonSelectOption>
              <IonSelectOption value="nedbank">Nedbank</IonSelectOption>
              <IonSelectOption value="capitec">Capitec</IonSelectOption>
              <IonSelectOption value="investec">Investec</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Account Number</IonLabel>
            <IonInput
              value={accountNumber}
              onIonInput={e => setAccountNumber(e.detail.value!)}
              placeholder="Enter account number"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Branch Code</IonLabel>
            <IonInput
              value={branchCode}
              onIonInput={e => setBranchCode(e.detail.value!)}
              placeholder="Enter branch code"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Account Type</IonLabel>
            <IonSelect value={accountType} onIonChange={e => setAccountType(e.detail.value)}>
              <IonSelectOption value="savings">Savings</IonSelectOption>
              <IonSelectOption value="current">Current</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonButton 
            expand="block" 
            onClick={saveBankingDetails}
            style={{ marginTop: '16px' }}
          >
            Save Banking Details
          </IonButton>
        </IonCardContent>
      </IonCard>

      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        onDidDismiss={() => setShowToast(false)}
      />
    </>
  );
};

export default BankingDetailsForm;