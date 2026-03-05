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

const RefundPolicyPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Refund & Returns Policy</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Refund & Returns Policy</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p><strong>Effective Date:</strong> 1 March 2025</p>
            <p><strong>Last Updated:</strong> 1 March 2025</p>

            <h3>1. Overview</h3>
            <p>
              Eduthrift is a second-hand (thrift) marketplace for pre-owned school uniforms, sports gear,
              textbooks, and educational items. Due to the nature of our platform, our refund and returns
              policies differ from traditional retail stores. Please read this policy carefully before
              making a purchase.
            </p>

            <h3>2. No Returns Policy</h3>
            <p>
              <strong>All sales on Eduthrift are final. We do not accept returns.</strong>
            </p>
            <p>
              As a thrift marketplace, all items sold on Eduthrift are pre-owned and sold in "as-described"
              condition. Buyers are encouraged to carefully review item descriptions, photographs, and
              condition details before making a purchase. By completing a purchase, you acknowledge and
              accept the condition of the item as described in the listing.
            </p>

            <h3>3. When Refunds Are Issued</h3>
            <p>
              Refunds are <strong>only</strong> issued in the following circumstances:
            </p>
            <ul>
              <li>
                <strong>Non-Delivery:</strong> If the delivery service provider (Pudo or The Courier Guy)
                fails to deliver your item within 14 days from the date of shipment, you are entitled to a
                full refund of the purchase price including shipping fees.
              </li>
              <li>
                <strong>Uncollected Parcels:</strong> If a parcel is delivered to a Pudo locker but is not
                collected within the specified collection period, the parcel will be returned to the sender.
                In this case, a refund of the item price (excluding shipping fees) will be issued to the
                buyer, less any return shipping costs incurred.
              </li>
              <li>
                <strong>Item Significantly Not as Described:</strong> If the item received is fundamentally
                different from the listing description (e.g., completely wrong item shipped), you may lodge a
                dispute within 48 hours of collection. Eduthrift will investigate and, at its discretion, may
                issue a refund.
              </li>
            </ul>

            <h3>4. Escrow Payment Protection</h3>
            <p>
              Eduthrift uses an escrow payment system — the same trusted model used by major global marketplace
              platforms such as Alibaba, TradeSafe, and Trustap. Escrow is an industry-standard safeguard that
              protects both buyers and sellers in online transactions. Here's how it works:
            </p>
            <ul>
              <li>When you pay for an item, the funds are held securely in escrow by our payment system — neither the seller nor Eduthrift can access these funds prematurely.</li>
              <li>The seller only receives payment once the item has been confirmed as delivered.</li>
              <li>If the item is not delivered within the specified period, the escrowed funds are automatically
                released back to you as a refund.</li>
            </ul>
            <p>
              This system ensures that your money is always protected. Combined with our mandatory
              seller ID verification (which requires all sellers to submit a valid South African ID
              and proof of address), our escrow system significantly reduces the risk of fraud and
              gives you peace of mind when transacting on Eduthrift.
            </p>

            <h3>5. How to Request a Refund</h3>
            <p>If you believe you qualify for a refund based on the criteria above:</p>
            <ol>
              <li>Contact our support team at <strong>support@eduthrift.co.za</strong> within 48 hours of the issue occurring.</li>
              <li>Provide your order number, a description of the issue, and any supporting evidence (e.g., photographs).</li>
              <li>Our team will review your request and respond within 3-5 business days.</li>
            </ol>

            <h3>6. Refund Processing</h3>
            <ul>
              <li>Approved refunds will be processed within 5-7 business days.</li>
              <li>Refunds will be issued to the original payment method used at checkout.</li>
              <li>You will receive an email confirmation once the refund has been processed.</li>
              <li>Please allow additional time for the refund to reflect in your bank account, depending on your financial institution.</li>
            </ul>

            <h3>7. Seller Cancellations</h3>
            <p>
              If a seller cancels an order before shipping, you will receive a full refund of the purchase
              price including any shipping fees paid. This refund will be processed automatically.
            </p>

            <h3>8. Disputes</h3>
            <p>
              In the event of a dispute regarding a refund, Eduthrift will act as a mediator between the
              buyer and seller. Our decision in dispute resolution is final, though both parties retain
              their rights under South African consumer protection law.
            </p>

            <h3>9. Exclusions</h3>
            <p>Refunds will <strong>not</strong> be issued in the following cases:</p>
            <ul>
              <li>Buyer's remorse or change of mind after purchase</li>
              <li>Minor variations in colour due to screen display differences</li>
              <li>Normal wear and tear consistent with the item's described condition</li>
              <li>Items that have been altered, damaged, or washed by the buyer after collection</li>
              <li>Failure to collect a parcel from a Pudo locker within the specified collection period (item price refunded, shipping fees are not)</li>
            </ul>

            <h3>10. Contact Us</h3>
            <p>
              For any questions regarding our Refund & Returns Policy, please contact us:
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

export default RefundPolicyPage;
