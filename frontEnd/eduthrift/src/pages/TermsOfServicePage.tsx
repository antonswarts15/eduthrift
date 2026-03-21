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

const TermsOfServicePage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Terms of Service</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Terms of Service for Eduthrift</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p><strong>Effective Date:</strong> 1 March 2025</p>
            <p><strong>Last Updated:</strong> 1 March 2025</p>

            <h3>1. Introduction</h3>
            <p>
              Welcome to Eduthrift. These Terms of Service ("Terms") govern your access to and use of the
              Eduthrift platform, including our website at www.eduthrift.co.za and our mobile application
              (collectively, the "Service"). By accessing or using the Service, you confirm that you have
              read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not
              agree to these Terms, please do not access or use the Service.
            </p>
            <p>
              Eduthrift is a South African second-hand marketplace that enables buyers and sellers to trade
              pre-owned school uniforms, sports equipment, textbooks, club clothing, stationery, and other
              educational items. Eduthrift provides the platform and associated services; it does not itself
              buy or sell goods.
            </p>

            <h3>2. Eligibility</h3>
            <p>
              You may use the Service only if you:
            </p>
            <ul>
              <li>Are at least 18 years of age, or have the express consent of a parent or legal guardian;</li>
              <li>Are a resident of the Republic of South Africa or are transacting in South African Rand (ZAR);</li>
              <li>Are not prohibited from using the Service under applicable South African law; and</li>
              <li>Provide accurate, complete, and current registration information.</li>
            </ul>

            <h3>3. Account Registration</h3>
            <p>
              To access the full features of the Service — including buying, selling, and wishlist management
              — you must register for an account. When registering you agree to:
            </p>
            <ul>
              <li>Provide truthful and accurate personal information (name, email address, phone number, and location);</li>
              <li>Keep your login credentials confidential and not share them with any third party;</li>
              <li>Notify us immediately at support@eduthrift.co.za if you suspect unauthorised access to your account;</li>
              <li>Accept responsibility for all activity that occurs under your account.</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that we reasonably believe contain false
              information or that violate these Terms.
            </p>

            <h3>4. The Eduthrift Service</h3>
            <p>The Eduthrift Service includes the following core features:</p>
            <ul>
              <li>
                <strong>Marketplace listings:</strong> Registered users may browse, search, and filter listings
                of pre-owned school items by category (school uniforms, sports equipment, textbooks, club clothing,
                stationery, and matric dance attire), school, size, gender, and condition.
              </li>
              <li>
                <strong>Selling:</strong> Verified sellers may create item listings with photos, descriptions,
                pricing, and quantity. Items are subject to a 10% platform service fee deducted on successful sale.
              </li>
              <li>
                <strong>Buying:</strong> Buyers may add items to a cart and proceed to checkout. Payment is
                processed securely through our payment partner Ozow. All pricing is in South African Rand (ZAR).
              </li>
              <li>
                <strong>Escrow payment protection:</strong> Funds paid by a buyer are held in escrow and only
                released to the seller once delivery is confirmed. This protects both parties.
              </li>
              <li>
                <strong>Shipping and delivery:</strong> Items are shipped via PUDO locker pickup points or
                The Courier Guy door-to-door delivery. Shipping fees are calculated at checkout and are the
                responsibility of the buyer unless otherwise agreed.
              </li>
              <li>
                <strong>Wishlist and price alerts:</strong> Buyers may save items to a wishlist and receive
                notifications when saved items become available or when prices change.
              </li>
              <li>
                <strong>Seller verification:</strong> All sellers must complete a mandatory identity verification
                process by submitting a valid South African ID document and proof of address before listing items.
                This is a key fraud-prevention measure that ensures every seller on the platform is a real,
                traceable individual.
              </li>
              <li>
                <strong>Order management:</strong> Both buyers and sellers have access to an order dashboard
                to track order status from purchase through to delivery confirmation.
              </li>
            </ul>

            <h3>5. Seller Verification</h3>
            <p>
              To sell on Eduthrift you must complete identity verification. Verification requires you to submit:
            </p>
            <ul>
              <li>A valid South African identity document (ID book or smart ID card); and</li>
              <li>A proof of address document dated within the last three months.</li>
            </ul>
            <p>
              Verification documents are reviewed by our admin team and are stored securely in accordance with
              our Privacy Policy. Unverified sellers may not create listings or receive payouts. Eduthrift
              reserves the right to reject or revoke seller verification at any time if fraudulent or
              inaccurate documentation is detected.
            </p>

            <h3>6. Listing Rules and Acceptable Use</h3>
            <p>
              When using the Service, you agree that you will not:
            </p>
            <ul>
              <li>List or attempt to sell counterfeit, stolen, or prohibited goods;</li>
              <li>Provide false, misleading, or inaccurate item descriptions or photographs;</li>
              <li>List items that are not related to school, sport, or education;</li>
              <li>Post offensive, harassing, or discriminatory content;</li>
              <li>Contact other users outside the Platform to circumvent the escrow payment system;</li>
              <li>Use automated tools, bots, or scrapers to access or extract data from the Service without authorisation;</li>
              <li>Attempt to gain unauthorised access to any part of the Service or its underlying systems;</li>
              <li>Use the Service for any unlawful purpose or in violation of South African law;</li>
              <li>Reproduce, distribute, or commercially exploit any content from the Service without our written consent.</li>
            </ul>

            <h3>7. Payments, Fees, and Payouts</h3>
            <ul>
              <li>
                <strong>Payment processing:</strong> All payments are processed by Ozow, a PCI-compliant payment
                gateway. Eduthrift does not store payment card details.
              </li>
              <li>
                <strong>Service fee:</strong> A platform service fee of 10% of the sale price is deducted from
                the seller's payout upon successful completion of a transaction.
              </li>
              <li>
                <strong>Escrow:</strong> Buyer funds are held in escrow from the time of payment until delivery
                is confirmed, or until the applicable delivery window has elapsed.
              </li>
              <li>
                <strong>Payouts:</strong> Seller payouts are processed to the banking account provided during
                seller registration after successful delivery confirmation. Eduthrift is not responsible for
                delays caused by incorrect banking details.
              </li>
              <li>
                <strong>Currency:</strong> All transactions are denominated in South African Rand (ZAR).
              </li>
            </ul>

            <h3>8. Refunds and Returns</h3>
            <p>
              As Eduthrift is a second-hand (thrift) marketplace, all sales are final and returns are not
              accepted by default. Refunds are only issued where:
            </p>
            <ul>
              <li>The delivery service (PUDO or The Courier Guy) fails to deliver the item within the agreed delivery window; or</li>
              <li>An item is demonstrably materially different from its listing description.</li>
            </ul>
            <p>
              Please refer to our <a href="/refund-policy">Refund &amp; Returns Policy</a> for full details.
            </p>

            <h3>9. Platform Availability</h3>
            <p>
              We aim to keep the Service available at all times; however, we do not guarantee uninterrupted
              access. The Service may be temporarily unavailable due to:
            </p>
            <ul>
              <li>Scheduled maintenance;</li>
              <li>Unplanned outages or technical faults;</li>
              <li>Events beyond our reasonable control (force majeure).</li>
            </ul>
            <p>
              Eduthrift is not liable for any loss or inconvenience resulting from Service unavailability.
            </p>

            <h3>10. User-Generated Content</h3>
            <p>
              The Eduthrift marketplace relies on content created and uploaded by users, including item
              photographs, descriptions, pricing, and other listing details ("User Content"). By submitting
              any User Content to the Service, you:
            </p>
            <ul>
              <li>
                <strong>Grant a licence to Eduthrift:</strong> You grant Eduthrift a non-exclusive,
                worldwide, royalty-free, sublicensable licence to use, store, display, reproduce, and
                distribute your User Content solely for the purposes of operating, promoting, and improving
                the Service (including displaying your listings to other users). This licence continues for
                as long as your content remains on the platform and terminates when you remove it or close
                your account, subject to any retention obligations under applicable law.
              </li>
              <li>
                <strong>Warrant that you own the rights:</strong> You confirm that you own or have all
                necessary rights, licences, and permissions to submit and grant the above licence for your
                User Content, and that your User Content does not infringe the intellectual property,
                privacy, or other rights of any third party.
              </li>
              <li>
                <strong>Accept responsibility for your content:</strong> You are solely responsible for
                the accuracy, legality, and appropriateness of your User Content. Eduthrift does not
                endorse any User Content and is not liable for any User Content submitted by users.
              </li>
              <li>
                <strong>Acknowledge our moderation rights:</strong> Eduthrift reserves the right to
                review, edit, refuse, or remove any User Content at any time and for any reason, including
                content that violates these Terms or applicable law, without notice or liability to you.
              </li>
            </ul>
            <p>
              Eduthrift does not claim ownership of your User Content. The licence granted above is limited
              to what is necessary to provide the Service and does not transfer ownership of your content
              to Eduthrift.
            </p>

            <h3>11. Eduthrift Intellectual Property</h3>
            <p>
              All content on the Service that is created by Eduthrift — including logos, branding, text,
              graphics, software, and page layout — is owned by or licensed to Eduthrift and is protected
              by South African intellectual property laws. You may not copy, reproduce, modify, distribute,
              or create derivative works from this content without our express written consent.
            </p>

            <h3>12. Privacy</h3>
            <p>
              Your privacy is important to us. Our collection and use of your personal information is governed
              by our <a href="/privacy-policy">Privacy Policy</a>, which is incorporated into these Terms by
              reference. By using the Service, you consent to our processing of your personal data as described
              in the Privacy Policy.
            </p>

            <h3>13. Limitation of Liability</h3>
            <p>
              To the fullest extent permitted by South African law:
            </p>
            <ul>
              <li>
                Eduthrift provides the Service "as is" and makes no warranties — express or implied — regarding
                the accuracy, reliability, or suitability of the Service for any purpose.
              </li>
              <li>
                Eduthrift is not liable for the quality, safety, legality, or authenticity of items listed
                by sellers on the platform.
              </li>
              <li>
                Eduthrift is not liable for any indirect, incidental, special, or consequential damages
                arising from your use of or inability to use the Service.
              </li>
              <li>
                Eduthrift's total aggregate liability to you in connection with the Service shall not exceed
                the platform fees paid by you in the 12 months preceding the claim.
              </li>
            </ul>

            <h3>14. Indemnity</h3>
            <p>
              You agree to indemnify and hold Eduthrift, its directors, employees, and agents harmless from
              any claims, losses, damages, or expenses (including legal costs) arising from your breach of
              these Terms, your use of the Service, or your violation of any applicable law or the rights
              of another user.
            </p>

            <h3>15. Dispute Resolution</h3>
            <p>
              If a dispute arises between a buyer and a seller, Eduthrift will endeavour to assist in
              mediating a fair resolution. If a dispute cannot be resolved through our internal process,
              it shall be referred to arbitration or the courts of the Republic of South Africa, depending
              on the nature and value of the claim.
            </p>
            <p>
              For disputes with Eduthrift itself, please contact us at support@eduthrift.co.za in the first
              instance.
            </p>

            <h3>16. Account Suspension and Termination</h3>
            <p>
              Eduthrift reserves the right to suspend or permanently terminate your access to the Service
              at any time if you breach these Terms, engage in fraudulent or abusive conduct, or for any
              other reason at our reasonable discretion. Upon termination, any pending transactions will
              be handled on a case-by-case basis to protect all parties.
            </p>
            <p>
              You may close your account at any time by visiting the <a href="/delete-account">Account Deletion</a> page.
            </p>

            <h3>17. Changes to These Terms</h3>
            <p>
              We may update these Terms from time to time to reflect changes in our Service, applicable law,
              or business practices. Any changes will be posted on this page with an updated "Last Updated"
              date. Continued use of the Service after changes are posted constitutes your acceptance of the
              updated Terms. If changes are material, we will notify you via email or an in-app notification.
            </p>

            <h3>18. Governing Law</h3>
            <p>
              These Terms are governed by and construed in accordance with the laws of the Republic of South
              Africa, including but not limited to:
            </p>
            <ul>
              <li>The Consumer Protection Act 68 of 2008;</li>
              <li>The Electronic Communications and Transactions Act 25 of 2002 (ECTA);</li>
              <li>The Protection of Personal Information Act 4 of 2013 (POPIA).</li>
            </ul>

            <h3>19. Contact Us</h3>
            <p>
              If you have questions about these Terms of Service or need assistance with the Service, please
              contact us at:
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

export default TermsOfServicePage;
