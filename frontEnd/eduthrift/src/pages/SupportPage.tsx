import React, { useState } from 'react';
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
  IonItem,
  IonLabel,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonAccordion,
  IonAccordionGroup
} from '@ionic/react';
import {
  mailOutline,
  globeOutline,
  chatbubbleOutline,
  helpCircleOutline,
  shieldCheckmarkOutline,
  cardOutline,
  cubeOutline,
  personOutline,
  alertCircleOutline,
  documentTextOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const SupportPage: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Support</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">

        {/* Contact Us */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Contact Us</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p style={{ marginBottom: '16px', color: '#555' }}>
              Our support team is here to help. Reach out to us and we'll get back to you as soon as possible.
            </p>
            <IonItem lines="none" style={{ '--padding-start': '0' }}>
              <IonIcon icon={mailOutline} slot="start" color="primary" />
              <IonLabel>
                <h3>Email Support</h3>
                <p>support@eduthrift.co.za</p>
              </IonLabel>
            </IonItem>
            <IonItem lines="none" style={{ '--padding-start': '0' }}>
              <IonIcon icon={globeOutline} slot="start" color="primary" />
              <IonLabel>
                <h3>Website</h3>
                <p>www.eduthrift.co.za</p>
              </IonLabel>
            </IonItem>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '12px' }}>
              Support is available Monday – Friday, 08:00 – 17:00 (SAST). We aim to respond within one business day.
            </p>
          </IonCardContent>
        </IonCard>

        {/* Quick Links */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Helpful Resources</IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ padding: '0' }}>
            <IonItem button onClick={() => history.push('/how-it-works')}>
              <IonIcon icon={helpCircleOutline} slot="start" color="primary" />
              <IonLabel>How Eduthrift Works</IonLabel>
            </IonItem>
            <IonItem button onClick={() => history.push('/shipping-policy')}>
              <IonIcon icon={cubeOutline} slot="start" color="primary" />
              <IonLabel>Shipping Policy</IonLabel>
            </IonItem>
            <IonItem button onClick={() => history.push('/refund-policy')}>
              <IonIcon icon={cardOutline} slot="start" color="primary" />
              <IonLabel>Refund &amp; Returns Policy</IonLabel>
            </IonItem>
            <IonItem button onClick={() => history.push('/terms-of-service')}>
              <IonIcon icon={documentTextOutline} slot="start" color="primary" />
              <IonLabel>Terms of Service</IonLabel>
            </IonItem>
            <IonItem button onClick={() => history.push('/privacy-policy')} lines="none">
              <IonIcon icon={shieldCheckmarkOutline} slot="start" color="primary" />
              <IonLabel>Privacy Policy</IonLabel>
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* FAQ */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Frequently Asked Questions</IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ padding: '0 0 8px 0' }}>
            <IonAccordionGroup>

              <IonAccordion value="account">
                <IonItem slot="header">
                  <IonIcon icon={personOutline} slot="start" color="medium" />
                  <IonLabel><strong>Account &amp; Registration</strong></IonLabel>
                </IonItem>
                <div slot="content" style={{ padding: '12px 16px', backgroundColor: '#f9f9f9' }}>
                  <p><strong>How do I create an account?</strong><br />
                  Tap "Register" on the login screen, fill in your name, email, phone number, and location, then set a password. You'll be logged in immediately after registering.</p>

                  <p><strong>I forgot my password. What do I do?</strong><br />
                  Please email support@eduthrift.co.za with your registered email address and we'll assist you with a password reset.</p>

                  <p><strong>How do I update my personal details?</strong><br />
                  Go to Profile → Personal Details to update your name, phone number, and location.</p>

                  <p><strong>How do I delete my account?</strong><br />
                  Go to the side menu → Policies → Account Deletion, or navigate to Settings → Delete Account. Note that deletion is permanent and cannot be undone.</p>
                </div>
              </IonAccordion>

              <IonAccordion value="buying">
                <IonItem slot="header">
                  <IonIcon icon={cubeOutline} slot="start" color="medium" />
                  <IonLabel><strong>Buying Items</strong></IonLabel>
                </IonItem>
                <div slot="content" style={{ padding: '12px 16px', backgroundColor: '#f9f9f9' }}>
                  <p><strong>Is it safe to buy on Eduthrift?</strong><br />
                  Yes. All payments are held in escrow and only released to the seller once you confirm delivery. Every seller is identity-verified with a South African ID and proof of address before they can list.</p>

                  <p><strong>How do I pay?</strong><br />
                  Payments are processed securely through Ozow, a PCI-compliant South African payment gateway. We accept EFT and other methods supported by Ozow. Eduthrift does not store your payment card details.</p>

                  <p><strong>What happens after I pay?</strong><br />
                  Your order status will update to "Payment Confirmed". The seller is notified and must ship the item. You can track your order under Profile → My Orders.</p>

                  <p><strong>What if I don't receive my item?</strong><br />
                  If your item is not delivered within the specified delivery window, your payment will be refunded from escrow. Contact support@eduthrift.co.za if you have concerns about a specific order.</p>

                  <p><strong>Can I return an item?</strong><br />
                  As a second-hand marketplace, all sales are final. Refunds are only issued for non-delivery. Please read our <a href="/refund-policy">Refund &amp; Returns Policy</a> for full details.</p>
                </div>
              </IonAccordion>

              <IonAccordion value="selling">
                <IonItem slot="header">
                  <IonIcon icon={cardOutline} slot="start" color="medium" />
                  <IonLabel><strong>Selling Items</strong></IonLabel>
                </IonItem>
                <div slot="content" style={{ padding: '12px 16px', backgroundColor: '#f9f9f9' }}>
                  <p><strong>How do I become a seller?</strong><br />
                  You need to complete seller verification first. Go to Profile and submit your South African ID document and a proof of address dated within the last 3 months. Our team reviews submissions and you'll be notified once approved.</p>

                  <p><strong>How long does verification take?</strong><br />
                  Verification is typically completed within 1–2 business days. If you haven't heard back after 2 business days, please email support@eduthrift.co.za.</p>

                  <p><strong>What is the seller fee?</strong><br />
                  Eduthrift charges a 10% platform service fee deducted from the sale price when a transaction is successfully completed. There are no upfront listing fees.</p>

                  <p><strong>When do I get paid?</strong><br />
                  Your payout is released once the buyer confirms delivery. Funds are transferred to the banking account you provided during seller setup. Make sure your banking details are correct in your profile.</p>

                  <p><strong>What items can I sell?</strong><br />
                  You can sell school uniforms, sports equipment and clothing, textbooks, stationery, club clothing, and matric dance attire. Items must be honest, accurate, and related to school or education. Counterfeit, stolen, or prohibited goods are not allowed.</p>

                  <p><strong>How do I ship a sold item?</strong><br />
                  Once your item sells, you'll receive the buyer's chosen delivery details. Pack the item securely and drop it off at a PUDO locker point or arrange collection with The Courier Guy, depending on the delivery method the buyer selected.</p>
                </div>
              </IonAccordion>

              <IonAccordion value="shipping">
                <IonItem slot="header">
                  <IonIcon icon={cubeOutline} slot="start" color="medium" />
                  <IonLabel><strong>Shipping &amp; Delivery</strong></IonLabel>
                </IonItem>
                <div slot="content" style={{ padding: '12px 16px', backgroundColor: '#f9f9f9' }}>
                  <p><strong>What delivery options are available?</strong><br />
                  Eduthrift supports two delivery methods: PUDO locker-to-locker delivery and The Courier Guy door-to-door delivery. You choose your preferred option at checkout.</p>

                  <p><strong>How long does delivery take?</strong><br />
                  Delivery times vary by courier and location. PUDO locker delivery is typically 2–5 business days. Courier Guy door-to-door is typically 1–3 business days. See our <a href="/shipping-policy">Shipping Policy</a> for full details.</p>

                  <p><strong>How do I track my order?</strong><br />
                  Go to Profile → My Orders to view your order status. Tracking numbers are provided once the seller ships your item.</p>

                  <p><strong>What if my item is lost in transit?</strong><br />
                  If your item is not delivered within the delivery window, your escrow payment will be refunded. Contact support@eduthrift.co.za and we will liaise with the courier on your behalf.</p>
                </div>
              </IonAccordion>

              <IonAccordion value="payments">
                <IonItem slot="header">
                  <IonIcon icon={shieldCheckmarkOutline} slot="start" color="medium" />
                  <IonLabel><strong>Payments &amp; Escrow</strong></IonLabel>
                </IonItem>
                <div slot="content" style={{ padding: '12px 16px', backgroundColor: '#f9f9f9' }}>
                  <p><strong>What is escrow?</strong><br />
                  Escrow is a payment protection system where your funds are held by a neutral party (Eduthrift) and only released to the seller once you confirm you've received your item. This protects you as a buyer.</p>

                  <p><strong>Is my payment information secure?</strong><br />
                  Yes. All payments are processed by Ozow, a PCI-compliant payment gateway. Eduthrift never stores your full payment card or banking details. All data is encrypted in transit using SSL/TLS.</p>

                  <p><strong>I was charged but my order wasn't created. What do I do?</strong><br />
                  Please email support@eduthrift.co.za immediately with your payment reference number and registered email address. We will investigate and resolve the issue promptly.</p>

                  <p><strong>How do refunds work?</strong><br />
                  Refunds are processed back to your original payment method. Depending on your bank, this can take 3–7 business days to reflect. See our <a href="/refund-policy">Refund &amp; Returns Policy</a> for details.</p>
                </div>
              </IonAccordion>

              <IonAccordion value="safety">
                <IonItem slot="header">
                  <IonIcon icon={alertCircleOutline} slot="start" color="medium" />
                  <IonLabel><strong>Safety &amp; Reporting</strong></IonLabel>
                </IonItem>
                <div slot="content" style={{ padding: '12px 16px', backgroundColor: '#f9f9f9' }}>
                  <p><strong>How do I report a suspicious listing or user?</strong><br />
                  Email support@eduthrift.co.za with the listing ID or username and a description of your concern. We take all reports seriously and investigate promptly.</p>

                  <p><strong>What if I receive a fake or significantly different item?</strong><br />
                  Contact support@eduthrift.co.za immediately with photos and your order number. Do not release escrow until the matter is resolved. We will review the case and take appropriate action.</p>

                  <p><strong>Someone is asking me to pay outside of Eduthrift. What should I do?</strong><br />
                  Never pay outside of the Eduthrift platform. Any request to transact outside the app is a scam attempt. Report it immediately to support@eduthrift.co.za.</p>
                </div>
              </IonAccordion>

            </IonAccordionGroup>
          </IonCardContent>
        </IonCard>

        {/* App Version / Legal */}
        <IonCard>
          <IonCardContent>
            <p style={{ fontSize: '13px', color: '#888', textAlign: 'center', margin: '0' }}>
              Eduthrift · support@eduthrift.co.za · www.eduthrift.co.za
            </p>
            <p style={{ fontSize: '12px', color: '#aaa', textAlign: 'center', margin: '8px 0 0 0' }}>
              © {new Date().getFullYear()} Eduthrift. All rights reserved.
            </p>
          </IonCardContent>
        </IonCard>

      </IonContent>
    </IonPage>
  );
};

export default SupportPage;
