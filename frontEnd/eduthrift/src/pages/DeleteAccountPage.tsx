import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButtons,
  IonBackButton
} from '@ionic/react';

const DeleteAccountPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Delete Account</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Eduthrift Account Deletion Request</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p><strong>Effective Date:</strong> 15 March 2025</p>
            <p><strong>Last Updated:</strong> 15 March 2025</p>

            <h3>Delete Your Eduthrift Account and Personal Data</h3>
            <p>
              If you would like to delete your Eduthrift account and associated personal data, you can request deletion by contacting our support team.
            </p>

            <h3>How to Request Account Deletion</h3>
            <p>
              1. Send an email to support@eduthrift.co.za

              2. Use the subject line "Account Deletion Request"

              Include the following information:
              <ul>
              <li>Your full name</li>
              <li>The email address linked to your Eduthrift account</li>
              <li>Your username (if known)</li>
            </ul>

              Our team will verify your request and process the deletion of your account. Please note that account deletion is irreversible and will result in the loss of all your data, including purchase history, listings, and messages.
            </p>
            

            <h3>What Data Will Be Deleted</h3>
            <p>When your account is deleted, we will permanently delete or anonymise the following information:</p>
            <ul>
              <li>Your account profile information</li>
              <li>Your contact details</li>
              <li>Your listings</li>
              <li>Your saved preferences and wishlist</li>
              <li>Uploaded verification documents (such as ID copies)</li>
              <li>Associated usage data linked to your account</li>
            </ul>

            <h3>Data That May Be Retained</h3>
            <p>Certain information may be retained for a limited period where required by law or for legitimate business purposes, including:</p>
            <ul>
              <li>Transaction records</li>
              <li>Payment references</li>
              <li>Fraud prevention records</li>
            </ul>
            <p>This information may be retained for up to 5 years to comply with financial regulations and fraud prevention requirements.</p>

            <h3>Processing Time</h3>
            <p>Account deletion requests are typically processed within 7 business days.</p>
            

            <h3>Contact</h3>
            <p>If you have any questions or concerns about your account deletion request, please contact our support team:</p>
            <ul>
              <li>Email: support@eduthrift.co.za</li>
              <li>Website: https://www.eduthrift.co.za</li>
            </ul>
            
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default DeleteAccountPage;
