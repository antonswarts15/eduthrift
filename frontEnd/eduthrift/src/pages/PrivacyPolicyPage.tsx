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

const PrivacyPolicyPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Privacy Policy</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Privacy Policy for Eduthrift</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p><strong>Effective Date:</strong> 1 March 2025</p>
            <p><strong>Last Updated:</strong> 1 March 2025</p>

            <h3>1. Introduction</h3>
            <p>
              Welcome to Eduthrift. We respect your privacy and are committed to protecting your personal
              information in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA)
              and other applicable South African legislation. This Privacy Policy explains how we collect,
              use, store, and protect your personal data when you use the Eduthrift platform, including our
              website and mobile application.
            </p>

            <h3>2. Information We Collect</h3>
            <p>
              We collect the following types of personal information:
            </p>
            <ul>
              <li><strong>Identity Data:</strong> First name, last name, username, date of birth, and identity document details (for seller verification).</li>
              <li><strong>Contact Data:</strong> Email address, phone number, and physical address.</li>
              <li><strong>Financial Data:</strong> Banking details (for seller payouts). We do not store full payment card details; payments are processed by our PCI-compliant payment partners (including Ozow).</li>
              <li><strong>Transaction Data:</strong> Purchase history, sale history, payment amounts, and transaction references.</li>
              <li><strong>Technical Data:</strong> IP address, browser type and version, device type, operating system, time zone, and usage data.</li>
              <li><strong>Profile Data:</strong> School affiliations, listing preferences, wishlist items, and account settings.</li>
              <li><strong>Verification Data:</strong> Copies of identification documents and proof of address submitted for seller verification. This mandatory ID verification is a key fraud-prevention measure that ensures every seller on the platform is a real, traceable individual, significantly reducing scams.</li>
            </ul>

            <h3>3. How We Collect Your Information</h3>
            <p>We collect information through:</p>
            <ul>
              <li><strong>Direct interactions:</strong> When you create an account, list items, make purchases, or contact us.</li>
              <li><strong>Automated technologies:</strong> When you use our Platform, we may automatically collect technical data about your device and browsing activity.</li>
              <li><strong>Third parties:</strong> Payment processors and delivery partners may share transaction and delivery data with us.</li>
            </ul>

            <h3>4. How We Use Your Personal Data</h3>
            <p>We use your personal information for the following purposes:</p>
            <ul>
              <li>To create and manage your account</li>
              <li>To facilitate transactions between buyers and sellers</li>
              <li>To process payments and manage escrow services</li>
              <li>To verify seller identity and prevent fraud</li>
              <li>To arrange shipping and delivery of items via Pudo or The Courier Guy</li>
              <li>To communicate with you about your orders, listings, and account</li>
              <li>To send you notifications about platform updates (with your consent)</li>
              <li>To improve our Platform and user experience</li>
              <li>To comply with legal and regulatory obligations</li>
              <li>To resolve disputes and enforce our Terms and Conditions</li>
            </ul>

            <h3>5. Legal Basis for Processing</h3>
            <p>We process your personal information on the following lawful grounds under POPIA:</p>
            <ul>
              <li><strong>Consent:</strong> Where you have given us explicit consent to process your data.</li>
              <li><strong>Contractual necessity:</strong> Where processing is necessary to perform our contract with you (e.g., facilitating a sale).</li>
              <li><strong>Legal obligation:</strong> Where we are required to process data to comply with applicable law.</li>
              <li><strong>Legitimate interest:</strong> Where processing is necessary for our legitimate business interests, provided your rights are not overridden.</li>
            </ul>

            <h3>6. Sharing Your Information</h3>
            <p>We may share your personal information with:</p>
            <ul>
              <li><strong>Buyers and Sellers:</strong> Limited information necessary to complete transactions (e.g., delivery address for shipping).</li>
              <li><strong>Payment Processors:</strong> Including Ozow, for processing payments securely.</li>
              <li><strong>Delivery Partners:</strong> Pudo and The Courier Guy, to facilitate shipping and delivery.</li>
              <li><strong>Service Providers:</strong> Hosting, analytics, and support tools that help us operate the Platform.</li>
              <li><strong>Law Enforcement:</strong> When required by law, court order, or to protect our legal rights.</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>

            <h3>7. Data Security</h3>
            <p>
              We implement appropriate technical and organisational measures to protect your personal data,
              including:
            </p>
            <ul>
              <li>Encryption of data in transit (SSL/TLS) and at rest</li>
              <li>Secure authentication with JWT tokens</li>
              <li>Regular security assessments</li>
              <li>Access controls limiting data access to authorised personnel only</li>
              <li>Secure storage of verification documents</li>
            </ul>
            <p>
              While we take all reasonable steps to protect your information, no method of transmission over
              the internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h3>8. Data Retention</h3>
            <p>
              We retain your personal information only for as long as necessary to fulfil the purposes for which
              it was collected, including to satisfy legal, accounting, or reporting requirements. When data is no
              longer required, it will be securely deleted or anonymised.
            </p>

            <h3>9. Your Rights Under POPIA</h3>
            <p>You have the following rights regarding your personal information:</p>
            <ul>
              <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Right to Correction:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Right to Deletion:</strong> Request deletion of your personal data, subject to legal retention requirements.</li>
              <li><strong>Right to Object:</strong> Object to the processing of your personal data for direct marketing purposes.</li>
              <li><strong>Right to Data Portability:</strong> Request your data in a structured, commonly used format.</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw your consent at any time where consent is the basis for processing.</li>
              <li><strong>Right to Lodge a Complaint:</strong> Lodge a complaint with the Information Regulator of South Africa.</li>
            </ul>

            <h3>10. Cookies and Tracking</h3>
            <p>
              Our Platform may use cookies and similar technologies to improve your experience and gather
              usage analytics. You can manage cookie preferences through your browser settings. Essential
              cookies required for Platform functionality cannot be disabled.
            </p>

            <h3>11. Children's Privacy</h3>
            <p>
              Our Platform is not intended for use by children under the age of 18 without parental or
              guardian consent. We do not knowingly collect personal information from children under 18
              without such consent. If we become aware that we have collected data from a child without
              appropriate consent, we will take steps to delete it promptly.
            </p>

            <h3>12. Changes to This Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page
              with an updated "Last Updated" date. We encourage you to review this policy periodically.
              Continued use of the Platform after changes constitutes acceptance of the updated policy.
            </p>

            <h3>13. Information Regulator</h3>
            <p>
              If you are not satisfied with how we handle your personal information, you have the right to
              lodge a complaint with the Information Regulator of South Africa:
            </p>
            <ul>
              <li><strong>Website:</strong> www.justice.gov.za/inforeg</li>
              <li><strong>Email:</strong> enquiries@inforegulator.org.za</li>
            </ul>

            <h3>14. Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, wish to exercise your rights, or have
              concerns about how your data is processed, please contact us at:
            </p>
            <ul>
              <li><strong>Email:</strong> support@eduthrift.co.za</li>
              <li><strong>Website:</strong> www.eduthrift.co.za</li>
            </ul>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default PrivacyPolicyPage;
