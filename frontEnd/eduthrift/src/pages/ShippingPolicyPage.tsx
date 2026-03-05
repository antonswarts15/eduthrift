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

const ShippingPolicyPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Shipping Policy</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Shipping Policy</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p><strong>Effective Date:</strong> 1 March 2025</p>
            <p><strong>Last Updated:</strong> 1 March 2025</p>

            <h3>1. Overview</h3>
            <p>
              Eduthrift facilitates the shipping of items between buyers and sellers across South Africa.
              We partner with trusted delivery service providers to ensure your items arrive safely. This
              policy outlines how shipping works on our platform.
            </p>

            <h3>2. Delivery Partners</h3>
            <p>Eduthrift uses the following delivery service providers:</p>
            <ul>
              <li>
                <strong>Pudo (Pick Up Drop Off):</strong> A network of secure locker locations across
                South Africa. Sellers drop off parcels at a Pudo locker, and buyers collect from their
                nearest Pudo locker.
              </li>
              <li>
                <strong>The Courier Guy:</strong> A national courier service offering door-to-door delivery
                across South Africa.
              </li>
            </ul>

            <h3>3. Shipping Fees</h3>
            <ul>
              <li>Shipping fees are calculated at checkout based on the delivery method selected and the parcel size/weight.</li>
              <li>Shipping fees are paid by the buyer and are displayed clearly before payment is confirmed.</li>
              <li>Shipping fees are non-refundable except in cases of non-delivery (see our <a href="/refund-policy">Refund Policy</a>).</li>
            </ul>

            <h3>4. Shipping Process</h3>
            <p><strong>For Sellers:</strong></p>
            <ol>
              <li>Once a sale is confirmed, you will be notified to ship the item.</li>
              <li>Package the item securely to prevent damage during transit.</li>
              <li>Drop off the parcel at the designated Pudo locker or arrange a Courier Guy pickup within 3 business days of the order confirmation.</li>
              <li>Enter the tracking details on the Platform so the buyer can monitor delivery.</li>
            </ol>

            <p><strong>For Buyers:</strong></p>
            <ol>
              <li>You will receive a notification once the seller has shipped your item.</li>
              <li>Track your parcel through the Platform or the delivery partner's tracking system.</li>
              <li>Collect your item from the designated Pudo locker, or receive it at your delivery address if using The Courier Guy.</li>
            </ol>

            <h3>5. Estimated Delivery Times</h3>
            <ul>
              <li><strong>Pudo Locker to Locker:</strong> 3-5 business days (depending on location).</li>
              <li><strong>The Courier Guy:</strong> 2-4 business days for major centres; 4-7 business days for remote areas.</li>
            </ul>
            <p>
              Please note that these are estimated delivery times and may vary due to factors beyond our
              control, such as public holidays, weather conditions, or logistical delays.
            </p>

            <h3>6. Pudo Locker Collection</h3>
            <ul>
              <li>When your parcel arrives at the Pudo locker, you will receive an SMS or email notification with a collection code.</li>
              <li>You must collect your parcel within the specified collection period (typically 3 days from notification).</li>
              <li>If the parcel is not collected within the specified period, it will be returned to the sender.</li>
              <li>Uncollected parcels may result in forfeiture of shipping fees (see our <a href="/refund-policy">Refund Policy</a>).</li>
            </ul>

            <h3>7. Packaging Requirements</h3>
            <p>Sellers are responsible for ensuring items are properly packaged:</p>
            <ul>
              <li>Use clean, sturdy packaging appropriate for the item</li>
              <li>Ensure the item is protected against damage during transit</li>
              <li>Include the order reference number inside the package</li>
              <li>Seal the package securely</li>
            </ul>
            <p>
              Eduthrift is not responsible for damage caused by inadequate packaging by the seller.
            </p>

            <h3>8. Shipping Restrictions</h3>
            <ul>
              <li>Eduthrift currently only supports shipping within South Africa.</li>
              <li>International shipping is not available at this time.</li>
              <li>Certain remote areas may have limited delivery options or longer delivery times.</li>
            </ul>

            <h3>9. Lost or Damaged Parcels</h3>
            <ul>
              <li>
                If your parcel is lost during transit and not delivered within 14 days of shipment,
                a full refund will be issued automatically through our escrow system.
              </li>
              <li>
                If your parcel arrives damaged, please contact us at <strong>support@eduthrift.co.za</strong> within
                48 hours of collection with photographs of the damage. We will investigate and work with the
                delivery partner to resolve the issue.
              </li>
            </ul>

            <h3>10. Tracking Your Order</h3>
            <p>
              Once your item has been shipped, tracking information will be available on the Platform under
              your order details. You can also track your parcel directly through the delivery partner's
              website or app.
            </p>

            <h3>11. Contact Us</h3>
            <p>
              For any shipping-related queries, please contact us:
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

export default ShippingPolicyPage;
