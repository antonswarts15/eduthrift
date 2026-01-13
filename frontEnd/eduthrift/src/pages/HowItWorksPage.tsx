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
  IonIcon,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { 
  schoolOutline, 
  shirtOutline, 
  cardOutline, 
  shieldCheckmarkOutline,
  locationOutline,
  checkmarkCircleOutline,
  cashOutline,
  peopleOutline
} from 'ionicons/icons';

const HowItWorksPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>How Eduthrift Works</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '16px' }}>
          
          {/* Hero Section */}
          <IonCard>
            <IonCardContent style={{ textAlign: 'center', padding: '24px' }}>
              <IonIcon 
                icon={schoolOutline} 
                style={{ fontSize: '48px', color: '#3498db', marginBottom: '16px' }} 
              />
              <h1 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>Welcome to Eduthrift</h1>
              <p style={{ margin: '0', color: '#666', fontSize: '16px' }}>
                South Africa's trusted marketplace for school uniforms, sports gear, and educational items
              </p>
            </IonCardContent>
          </IonCard>

          {/* What is Eduthrift */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>What is Eduthrift?</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>
                Eduthrift is a secure online marketplace designed specifically for South African families to buy and sell 
                school-related items. From school uniforms and sports gear to textbooks and stationery, we make it easy 
                and affordable to find quality educational items.
              </p>
              <p>
                Our platform connects parents, students, and schools in a safe environment with built-in buyer protection 
                and secure payment processing.
              </p>
            </IonCardContent>
          </IonCard>

          {/* How It Works - For Buyers */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={peopleOutline} style={{ marginRight: '8px' }} />
                For Buyers
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol size="2">
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', 
                      backgroundColor: '#3498db', color: 'white', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: 'bold'
                    }}>1</div>
                  </IonCol>
                  <IonCol size="10">
                    <h3 style={{ margin: '0 0 4px 0' }}>Browse & Search</h3>
                    <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                      Find items by school, category, size, or condition. Use filters to narrow down your search.
                    </p>
                  </IonCol>
                </IonRow>
                
                <IonRow>
                  <IonCol size="2">
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', 
                      backgroundColor: '#27ae60', color: 'white', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: 'bold'
                    }}>2</div>
                  </IonCol>
                  <IonCol size="10">
                    <h3 style={{ margin: '0 0 4px 0' }}>Secure Checkout</h3>
                    <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                      Pay safely with PayFast. Your money is held in escrow until you receive your items.
                    </p>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol size="2">
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', 
                      backgroundColor: '#e74c3c', color: 'white', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: 'bold'
                    }}>3</div>
                  </IonCol>
                  <IonCol size="10">
                    <h3 style={{ margin: '0 0 4px 0' }}>Convenient Delivery</h3>
                    <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                      Items are delivered to your nearest Pudo locker for easy, secure collection.
                    </p>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>

          {/* How It Works - For Sellers */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={shirtOutline} style={{ marginRight: '8px' }} />
                For Sellers
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol size="2">
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', 
                      backgroundColor: '#9b59b6', color: 'white', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: 'bold'
                    }}>1</div>
                  </IonCol>
                  <IonCol size="10">
                    <h3 style={{ margin: '0 0 4px 0' }}>Get Verified</h3>
                    <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                      Upload your ID and proof of address for verification. Add your banking details for payments.
                    </p>
                  </IonCol>
                </IonRow>
                
                <IonRow>
                  <IonCol size="2">
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', 
                      backgroundColor: '#f39c12', color: 'white', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: 'bold'
                    }}>2</div>
                  </IonCol>
                  <IonCol size="10">
                    <h3 style={{ margin: '0 0 4px 0' }}>List Your Items</h3>
                    <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                      Take photos and describe your items. Set your price knowing we deduct a 10% service fee.
                    </p>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol size="2">
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', 
                      backgroundColor: '#1abc9c', color: 'white', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: 'bold'
                    }}>3</div>
                  </IonCol>
                  <IonCol size="10">
                    <h3 style={{ margin: '0 0 4px 0' }}>Ship & Get Paid</h3>
                    <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                      Ship to the buyer's Pudo locker. Get paid automatically when they collect the item.
                    </p>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>

          {/* Key Features */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Why Choose Eduthrift?</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem lines="none">
                <IonIcon icon={shieldCheckmarkOutline} slot="start" color="success" />
                <IonLabel>
                  <h3>Buyer Protection</h3>
                  <p>Escrow payments and automatic refunds if items aren't delivered</p>
                </IonLabel>
              </IonItem>

              <IonItem lines="none">
                <IonIcon icon={locationOutline} slot="start" color="primary" />
                <IonLabel>
                  <h3>Convenient Delivery</h3>
                  <p>Pudo locker network across South Africa for secure collection</p>
                </IonLabel>
              </IonItem>

              <IonItem lines="none">
                <IonIcon icon={checkmarkCircleOutline} slot="start" color="secondary" />
                <IonLabel>
                  <h3>Verified Sellers</h3>
                  <p>All sellers are verified with ID and proof of address</p>
                </IonLabel>
              </IonItem>

              <IonItem lines="none">
                <IonIcon icon={cashOutline} slot="start" color="warning" />
                <IonLabel>
                  <h3>Fair Pricing</h3>
                  <p>10% service fee from sellers - no hidden costs for buyers</p>
                </IonLabel>
              </IonItem>
            </IonCardContent>
          </IonCard>

          {/* Pricing Structure */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={cardOutline} style={{ marginRight: '8px' }} />
                Pricing & Fees
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>For Buyers:</h4>
                <p style={{ margin: '0', fontSize: '14px' }}>
                  • Pay the listed price + shipping<br/>
                  • No hidden fees or service charges<br/>
                  • Secure escrow protection included
                </p>
              </div>
              
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>For Sellers:</h4>
                <p style={{ margin: '0', fontSize: '14px' }}>
                  • 10% service fee deducted from sale price<br/>
                  • Covers payment processing, escrow, and platform costs<br/>
                  • Automatic payouts when items are delivered
                </p>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Safety & Security */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Safety & Security</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p><strong>Escrow Protection:</strong> Your payment is held securely until you receive your items.</p>
              <p><strong>Automatic Refunds:</strong> If items aren't delivered within 14 days, you get an automatic refund.</p>
              <p><strong>Dispute Resolution:</strong> Our team investigates any issues and ensures fair outcomes.</p>
              <p><strong>Verified Users:</strong> All sellers must verify their identity before listing items.</p>
            </IonCardContent>
          </IonCard>

          {/* Getting Started */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Ready to Get Started?</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p style={{ marginBottom: '16px' }}>
                Join thousands of South African families saving money on school items while helping the environment 
                through reuse and recycling.
              </p>
              <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                Questions? Contact our support team through the app or visit our help section.
              </p>
            </IonCardContent>
          </IonCard>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default HowItWorksPage;