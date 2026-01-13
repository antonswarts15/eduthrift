import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/react';
import SellerVerificationTab from '../components/admin/SellerVerificationTab';
import UserManagementTab from '../components/admin/UserManagementTab';
import PaymentAccountingTab from '../components/admin/PaymentAccountingTab';

const AdminConsolePage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('sellers');

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Admin Console</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '16px' }}>
          <IonSegment value={selectedTab} onIonChange={e => setSelectedTab(e.detail.value as string)}>
            <IonSegmentButton value="sellers">
              <IonLabel>Seller Verification</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="users">
              <IonLabel>User Management</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="payments">
              <IonLabel>Payment Accounting</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          <div style={{ marginTop: '20px' }}>
            {selectedTab === 'sellers' && <SellerVerificationTab />}
            {selectedTab === 'users' && <UserManagementTab />}
            {selectedTab === 'payments' && <PaymentAccountingTab />}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminConsolePage;