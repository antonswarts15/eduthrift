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

const TermsAndConditionsPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Terms & Conditions</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Terms & Conditions</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p><strong>Effective Date:</strong> 1 March 2025</p>
            <p><strong>Last Updated:</strong> 1 March 2025</p>

            <p>
              Welcome to Eduthrift. These Terms and Conditions ("Terms") govern your access to and use of the
              Eduthrift platform, including our website and mobile application (collectively, the "Platform").
              By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree,
              please do not use the Platform.
            </p>

            <h3>1. About Eduthrift</h3>
            <p>
              Eduthrift is an online marketplace that connects buyers and sellers of pre-owned school uniforms,
              sports gear, textbooks, and other educational items in South Africa. Eduthrift acts as an
              intermediary platform and is not a party to the transactions between buyers and sellers.
            </p>

            <h3>2. Eligibility</h3>
            <p>
              To use the Platform, you must be at least 18 years of age or have the consent of a parent or
              legal guardian. By registering an account, you confirm that the information you provide is accurate,
              complete, and current.
            </p>

            <h3>3. Account Registration & Identity Verification</h3>
            <ul>
              <li>You must create an account to buy or sell items on the Platform.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You are liable for all activities conducted under your account.</li>
              <li>
                <strong>Seller verification is mandatory.</strong> All sellers must complete identity verification
                by submitting a valid South African ID document and proof of address before they can list items.
                This verification process is a key measure to reduce fraud and scams on the Platform, ensuring
                that every seller is a real, traceable individual. This approach is consistent with industry best
                practices used by leading global marketplaces.
              </li>
            </ul>

            <h3>4. Buying Items</h3>
            <ul>
              <li>All items listed on Eduthrift are pre-owned unless otherwise stated.</li>
              <li>Prices are listed in South African Rand (ZAR) and include the item price. Shipping fees are calculated separately at checkout.</li>
              <li>Payment is processed securely through our payment gateway partners, including Ozow.</li>
              <li>Funds are held in escrow until the buyer confirms receipt of the item or the delivery period has elapsed.</li>
            </ul>

            <h3>5. Selling Items</h3>
            <ul>
              <li>Sellers must provide accurate descriptions and photographs of items.</li>
              <li>Sellers must ensure items are in the condition described in the listing.</li>
              <li>A 10% service fee is deducted from the sale price upon successful completion of the transaction.</li>
              <li>Sellers must ship items within the timeframe specified after a sale is confirmed.</li>
              <li>Sellers are responsible for packaging items appropriately for shipping.</li>
            </ul>

            <h3>6. Prohibited Items</h3>
            <p>The following items may not be listed on Eduthrift:</p>
            <ul>
              <li>Counterfeit or stolen goods</li>
              <li>Items that infringe on intellectual property rights</li>
              <li>Hazardous materials or weapons</li>
              <li>Any items prohibited by South African law</li>
              <li>Items unrelated to education, school, or sports</li>
            </ul>

            <h3>7. Payments & Escrow Protection</h3>
            <ul>
              <li>All payments are processed through secure, PCI-compliant payment gateways.</li>
              <li>Eduthrift does not store your full payment card details.</li>
              <li>
                <strong>Escrow system:</strong> All payments are held in escrow and released to the seller only
                upon confirmed delivery. This is the same trusted payment protection model used by major global
                marketplace platforms such as Alibaba, TradeSafe, and Trustap. Escrow ensures that buyers' funds
                are protected until they receive their items, and sellers are guaranteed payment once delivery is
                confirmed.
              </li>
              <li>Supported payment methods include bank transfers via Ozow and other approved payment providers.</li>
            </ul>

            <h3>8. Shipping & Delivery</h3>
            <ul>
              <li>Items are shipped via Pudo lockers or The Courier Guy, depending on the delivery option selected.</li>
              <li>Buyers are responsible for collecting items from the designated Pudo locker within the specified collection period.</li>
              <li>Please refer to our <a href="/shipping-policy">Shipping Policy</a> for full details.</li>
            </ul>

            <h3>9. Refunds & Returns</h3>
            <ul>
              <li>As Eduthrift is a second-hand marketplace (thrift platform), <strong>all sales are final and no returns are accepted</strong>.</li>
              <li>Refunds are only issued if the delivery service (Pudo or The Courier Guy) fails to deliver the item within the specified delivery period.</li>
              <li>Please refer to our <a href="/refund-policy">Refund Policy</a> for full details.</li>
            </ul>

            <h3>10. User Conduct</h3>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Platform for any unlawful purpose</li>
              <li>Post false, misleading, or fraudulent listings</li>
              <li>Harass, threaten, or abuse other users</li>
              <li>Attempt to circumvent the Platform's payment system</li>
              <li>Use automated tools to scrape or access the Platform without authorisation</li>
              <li>Interfere with the operation of the Platform</li>
            </ul>

            <h3>11. Intellectual Property</h3>
            <p>
              All content on the Platform, including logos, text, graphics, and software, is the property of
              Eduthrift or its licensors and is protected by South African intellectual property laws. You may
              not reproduce, distribute, or create derivative works without prior written consent.
            </p>

            <h3>12. Limitation of Liability</h3>
            <p>
              Eduthrift acts as an intermediary platform. To the fullest extent permitted by law:
            </p>
            <ul>
              <li>Eduthrift is not liable for the quality, safety, or legality of items listed by sellers.</li>
              <li>Eduthrift is not liable for any disputes between buyers and sellers, although we will assist in resolution where possible.</li>
              <li>Eduthrift's total liability shall not exceed the fees paid to the Platform in the preceding 12 months.</li>
            </ul>

            <h3>13. Dispute Resolution</h3>
            <p>
              In the event of a dispute between buyers and sellers, Eduthrift will endeavour to mediate a fair
              resolution. If a dispute cannot be resolved amicably, it shall be subject to the jurisdiction of
              the courts of the Republic of South Africa.
            </p>

            <h3>14. Account Suspension & Termination</h3>
            <p>
              Eduthrift reserves the right to suspend or terminate your account at any time if you breach these
              Terms, engage in fraudulent activity, or for any other reason at our discretion. Upon termination,
              any pending transactions will be handled on a case-by-case basis.
            </p>

            <h3>15. Changes to These Terms</h3>
            <p>
              We may update these Terms from time to time. Any changes will be posted on this page with an
              updated "Last Updated" date. Continued use of the Platform after changes are posted constitutes
              acceptance of the updated Terms.
            </p>

            <h3>16. Governing Law</h3>
            <p>
              These Terms are governed by and construed in accordance with the laws of the Republic of South
              Africa, including the Consumer Protection Act 68 of 2008 and the Electronic Communications and
              Transactions Act 25 of 2002.
            </p>

            <h3>17. Contact Us</h3>
            <p>
              If you have any questions about these Terms, please contact us at:
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

export default TermsAndConditionsPage;
