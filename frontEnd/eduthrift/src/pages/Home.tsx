import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonIcon
} from '@ionic/react';
import {
  schoolOutline,
  basketballOutline,
  shieldCheckmarkOutline,
  locationOutline,
  phonePortraitOutline,
  cartOutline,
  cashOutline,
  paperPlane,
  checkmarkCircleOutline,
  searchOutline,
  eyeOutline,
  bagAddOutline,
  cardOutline,
  notificationsOutline,
  cameraOutline,
  libraryOutline,
  pencilOutline,
  shirtOutline,
  roseOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import logo from '../assets/logo.png';
import homeVideo from '../assets/Homevid.mp4';
import buyerIcon from '../assets/buyerIcon.jpg';
import sellerIcon from '../assets/sellerIcon.jpg';
import { itemsApi } from '../services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Item } from '../types/models';

const Home: React.FC = () => {
  const history = useHistory();
  const [recentItems, setRecentItems] = useState<Item[]>([]);

  const categories = [
    { name: 'School Uniforms', icon: schoolOutline, slug: 'school-sport-uniform' },
    { name: 'Sports Equipment', icon: basketballOutline, slug: 'sports-equipment' },
    { name: 'Textbooks', icon: libraryOutline, slug: 'textbooks' },
    { name: 'Club Clothing', icon: shirtOutline, slug: 'club-clothing' },
    { name: 'Stationery', icon: pencilOutline, slug: 'stationery' },
    { name: 'Matric Dance', icon: roseOutline, slug: 'matric-dance' }
  ];

  useEffect(() => {
    // Fetch recent items
    const fetchItems = async () => {
      try {
        const response = await itemsApi.getItems({});
        if (response.data && Array.isArray(response.data)) {
          setRecentItems(response.data.slice(0, 5)); // Get top 5 recent items
        }
      } catch (error) {
        console.error('Failed to fetch items:', error);
      }
    };

    fetchItems();
  }, []);

  const handleBuyClick = () => {
    history.push('/buyer');
  };

  const handleSellClick = () => {
    history.push('/seller');
  };

  return (
    <IonContent>
        <div style={{ padding: '20px', textAlign: 'center', marginTop: '60px', position: 'relative' }}>
          {/* Video Advertisement */}
          <IonCard >
            <IonCardContent style={{ padding: '0' }}>
              <video
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: '100%',
                  // height: '190px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              >
                <source src={homeVideo} type="video/mp4" />
              </video>
            </IonCardContent>
          </IonCard>
          
          {/* App Logo - Overlaying bottom banner */}
          <div style={{
            position: 'absolute',
            top: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200px',
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}>
            <img src={logo} alt="Eduthrift Logo" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
          </div>

        {/* What is Eduthrift */}
        <IonCard>
          <IonCardContent style={{ textAlign: 'center', padding: '20px' }}>
            <IonIcon icon={schoolOutline} style={{ fontSize: '48px', color: '#3498DB', marginBottom: '16px' }} />
            <h2 style={{ color: '#2C3E50', marginBottom: '16px' }}>What is Eduthrift?</h2>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              A secure marketplace for second-hand educational items in South Africa. 
              Buy and sell quality pre-owned materials through our anonymous platform, 
              reducing costs while promoting sustainability in education.
            </p>
          </IonCardContent>
        </IonCard>

        {/* Categories Slider */}
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h3 style={{ textAlign: 'left', marginLeft: '16px', color: '#2C3E50', marginBottom: '10px' }}>Browse Categories</h3>
          <Swiper
            slidesPerView={2.5}
            spaceBetween={10}
            freeMode={true}
          >
            {categories.map((cat, index) => (
              <SwiperSlide key={index} onClick={() => history.push(`/category/${cat.slug}`)}>
                <IonCard style={{ width: '100%', margin: '0', height: '120px' }}>
                  <IonCardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <IonIcon icon={cat.icon} style={{ fontSize: '32px', color: '#3498DB', marginBottom: '8px' }} />
                    <IonText style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}>{cat.name}</IonText>
                  </IonCardContent>
                </IonCard>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Recent Items Slider */}
        {recentItems.length > 0 && (
          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <h3 style={{ textAlign: 'left', marginLeft: '16px', color: '#2C3E50', marginBottom: '10px' }}>Just Listed</h3>
            <Swiper
              slidesPerView={2.5}
              spaceBetween={10}
              freeMode={true}
            >
              {recentItems.map((item, index) => (
                <SwiperSlide key={index} onClick={() => history.push(`/item/${item.id}`)}>
                  <IonCard style={{ width: '100%', margin: '0', height: '180px' }}>
                    <div style={{ height: '100px', width: '100%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.front_photo ? (
                        <img src={item.front_photo} alt={item.item_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <IonIcon icon={cameraOutline} style={{ fontSize: '32px', color: '#ccc' }} />
                      )}
                    </div>
                    <IonCardContent style={{ padding: '8px', textAlign: 'left' }}>
                      <IonText style={{ fontSize: '12px', fontWeight: '600', color: '#333', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.item_name || item.name}
                      </IonText>
                      <IonText style={{ fontSize: '10px', color: '#666', display: 'block' }}>
                        {item.school_name}
                      </IonText>
                      <IonText style={{ fontSize: '14px', fontWeight: 'bold', color: '#27AE60', marginTop: '4px', display: 'block' }}>
                        R{item.price}
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* How It Works - For Buyers */}
        <IonCard>
          <IonCardContent>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <IonIcon icon={cartOutline} style={{ fontSize: '40px', color: '#27AE60', marginBottom: '12px' }} />
              <h3 style={{ color: '#2C3E50', margin: '0' }}>For Buyers</h3>
            </div>
            <IonGrid>
              <IonRow>
                <IonCol size="6" sizeMd="3">
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <IonIcon icon={searchOutline} style={{ fontSize: '28px', color: '#3498DB', marginBottom: '8px' }} />
                    <h4 style={{ fontSize: '12px', margin: '4px 0', color: '#2C3E50' }}>Browse & Search</h4>
                    <p style={{ fontSize: '10px', color: '#666', margin: '0' }}>Find items by category or school</p>
                  </div>
                </IonCol>
                <IonCol size="6" sizeMd="3">
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <IonIcon icon={eyeOutline} style={{ fontSize: '28px', color: '#E74C3C', marginBottom: '8px' }} />
                    <h4 style={{ fontSize: '12px', margin: '4px 0', color: '#2C3E50' }}>View Details</h4>
                    <p style={{ fontSize: '10px', color: '#666', margin: '0' }}>Check photos & condition</p>
                  </div>
                </IonCol>
                <IonCol size="6" sizeMd="3">
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <IonIcon icon={bagAddOutline} style={{ fontSize: '28px', color: '#27AE60', marginBottom: '8px' }} />
                    <h4 style={{ fontSize: '12px', margin: '4px 0', color: '#2C3E50' }}>Add to Cart</h4>
                    <p style={{ fontSize: '10px', color: '#666', margin: '0' }}>Collect from multiple sellers</p>
                  </div>
                </IonCol>
                <IonCol size="6" sizeMd="3">
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <IonIcon icon={locationOutline} style={{ fontSize: '28px', color: '#8E44AD', marginBottom: '8px' }} />
                    <h4 style={{ fontSize: '12px', margin: '4px 0', color: '#2C3E50' }}>Collect</h4>
                    <p style={{ fontSize: '10px', color: '#666', margin: '0' }}>From nearest Pudo locker</p>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* How It Works - For Sellers */}
        <IonCard>
          <IonCardContent>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <IonIcon icon={cashOutline} style={{ fontSize: '40px', color: '#E74C3C', marginBottom: '12px' }} />
              <h3 style={{ color: '#2C3E50', margin: '0' }}>For Sellers</h3>
            </div>
            <IonGrid>
              <IonRow>
                <IonCol size="6" sizeMd="3">
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <IonIcon icon={cameraOutline} style={{ fontSize: '28px', color: '#3498DB', marginBottom: '8px' }} />
                    <h4 style={{ fontSize: '12px', margin: '4px 0', color: '#2C3E50' }}>List Items</h4>
                    <p style={{ fontSize: '10px', color: '#666', margin: '0' }}>Upload photos & set price</p>
                  </div>
                </IonCol>
                <IonCol size="6" sizeMd="3">
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <IonIcon icon={notificationsOutline} style={{ fontSize: '28px', color: '#E74C3C', marginBottom: '8px' }} />
                    <h4 style={{ fontSize: '12px', margin: '4px 0', color: '#2C3E50' }}>Get Orders</h4>
                    <p style={{ fontSize: '10px', color: '#666', margin: '0' }}>Receive purchase notifications</p>
                  </div>
                </IonCol>
                <IonCol size="6" sizeMd="3">
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <IonIcon icon={paperPlane} style={{ fontSize: '28px', color: '#27AE60', marginBottom: '8px' }} />
                    <h4 style={{ fontSize: '12px', margin: '4px 0', color: '#2C3E50' }}>Ship Items</h4>
                    <p style={{ fontSize: '10px', color: '#666', margin: '0' }}>Auto-generated labels</p>
                  </div>
                </IonCol>
                <IonCol size="6" sizeMd="3">
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '28px', color: '#8E44AD', marginBottom: '8px' }} />
                    <h4 style={{ fontSize: '12px', margin: '4px 0', color: '#2C3E50' }}>Get Paid</h4>
                    <p style={{ fontSize: '10px', color: '#666', margin: '0' }}>After buyer collection</p>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* Key Features */}
        <IonCard>
          <IonCardContent>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <IonIcon icon={shieldCheckmarkOutline} style={{ fontSize: '40px', color: '#27AE60', marginBottom: '12px' }} />
              <h3 style={{ color: '#2C3E50', margin: '0' }}>Key Features</h3>
            </div>
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeMd="6">
                  <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '20px', padding: '8px' }}>
                    <IonIcon icon={shieldCheckmarkOutline} style={{ fontSize: '24px', color: '#27AE60', marginRight: '12px' }} />
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ fontSize: '14px', margin: '0', color: '#2C3E50' }}>Escrow Protection</h4>
                      <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>Secure payments held until collection</p>
                    </div>
                  </div>
                </IonCol>
                <IonCol size="12" sizeMd="6">
                  <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '20px', padding: '8px' }}>
                    <IonIcon icon={locationOutline} style={{ fontSize: '24px', color: '#3498DB', marginRight: '12px' }} />
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ fontSize: '14px', margin: '0', color: '#2C3E50' }}>Pudo & Paxi Network</h4>
                      <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>2000+ lockers across South Africa</p>
                    </div>
                  </div>
                </IonCol>
                <IonCol size="12" sizeMd="6">
                  <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '20px', padding: '8px' }}>
                    <IonIcon icon={cardOutline} style={{ fontSize: '24px', color: '#E74C3C', marginRight: '12px' }} />
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ fontSize: '14px', margin: '0', color: '#2C3E50' }}>Multiple Payments</h4>
                      <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>PayFast, Ozow, manual EFT</p>
                    </div>
                  </div>
                </IonCol>
                <IonCol size="12" sizeMd="6">
                  <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '20px', padding: '8px' }}>
                    <IonIcon icon={phonePortraitOutline} style={{ fontSize: '24px', color: '#8E44AD', marginRight: '12px' }} />
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ fontSize: '14px', margin: '0', color: '#2C3E50' }}>Mobile Optimized</h4>
                      <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>Built for phones and tablets</p>
                    </div>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* Action Buttons */}
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="6">
               <IonCard 
  button 
  onClick={handleBuyClick} 
  style={{ 
    height: '120px', 
    position: 'relative', 
    overflow: 'hidden' 
  }}
>
  {/* Background Image */}
  <img 
    src={sellerIcon} 
    alt="Buyer" 
    style={{ 
      position: 'absolute', 
      top: 0,
      left: 0,
      width: '100%', 
      height: '125%', 
      objectFit: 'fill', 
      
      zIndex: 1
    }} 
  />

  {/* Text Content */}
  <IonCardContent 
    style={{ 
      // display: 'flex', 
      // alignItems: 'center', 
      // justifyContent: 'flex-end',  
      height: '100%',
      // position: 'relative',
      zIndex: 2,
      color: 'white',              // make text white
      textAlign: 'left'           // align text inside the block
    }}
  >
    <div>
      <h1 style={{paddingLeft: '45%', fontWeight: '800' }}>I want to Buy</h1>
      <p style={{ paddingLeft: '45%' }}>Find great deals on educational items</p>
    </div>
  </IonCardContent>
</IonCard>
<IonCard 
  button 
  onClick={handleSellClick} 
  style={{ 
    height: '120px', 
    position: 'relative', 
    overflow: 'hidden' 
  }}
>
  {/* Background Image */}
  <img 
    src={buyerIcon} 
    alt="Buyer" 
    style={{ 
      position: 'absolute', 
      top: 0,
      left: 0,
      width: '100%', 
      height: '125%', 
      objectFit: 'fill', 
      
      zIndex: 1
    }} 
  />

  {/* Text Content */}
  <IonCardContent 
    style={{ 
      // display: 'flex', 
      // alignItems: 'center', 
      // justifyContent: 'flex-end',  // push text to the right
      height: '100%',
      // position: 'relative',
      zIndex: 2,
      color: 'white',              // make text white
      textAlign: 'left'           // align text inside the block
    }}
  >
    <div>
      <h1 style={{ paddingLeft: '45%', fontWeight: '800' }}>I want to Sell</h1>
      <p style={{ paddingLeft: '45%' }}>List your educational items for sale</p>
    </div>
  </IonCardContent>
</IonCard>


              </IonCol>
              
            </IonRow>
          </IonGrid>

          {/* Privacy Policy Link */}
          <div style={{ textAlign: 'center', padding: '20px', marginTop: '20px' }}>
            <IonText 
              color="medium" 
              style={{ fontSize: '14px', textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => history.push('/privacy-policy')}
            >
              Privacy Policy
            </IonText>
          </div>
      </div>
    </IonContent>
  );
};
  

export default Home;