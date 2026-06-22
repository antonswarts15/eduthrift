import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonIcon,
  IonSpinner,
  useIonViewWillEnter
} from '@ionic/react';
import {
  schoolOutline,
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
  bagOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import logo from '../assets/logo.png';
import homeVideo from '../assets/1.mp4';
import buyerIcon from '../assets/buyerIcon.jpg';
import sellerIcon from '../assets/sellerIcon.jpg';
import sportingIcon from '../assets/sportEquipment.png';
import bagshoe from '../assets/bagshoe.png';
import clubClothingIcon from '../assets/clubClothing.png';
import schoolUniformIcon from '../assets/schoolClothing.png';
import stationeryIcon from '../assets/stationery.png';
import matricIcon from '../assets/dress.png';
import trainingIcon from '../assets/trainingWear.png';
import musicIcon from '../assets/music.png';
import { itemsApi } from '../services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { Item } from '../types/models';

const Home: React.FC = () => {
  const history = useHistory();
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { name: 'School & sport uniform', icon: schoolUniformIcon,  color: '#FF2090' },
    { name: 'Club clothing',          icon: clubClothingIcon,   color: '#FFA020' },
    { name: 'Training wear',          icon: trainingIcon,       color: '#A020C0' },
    { name: 'Belts, bags & shoes',    icon: bagshoe,         color: '#5CC840' },
    { name: 'Sports equipment',       icon: sportingIcon,       color: '#00AACC' },
    { name: 'Textbooks',              icon: libraryOutline,     color: '#FF2090' },
    { name: 'Stationery',             icon: stationeryIcon,     color: '#FFA020' },
    { name: 'Matric dance clothing',  icon: matricIcon,         color: '#A020C0' },
    { name: 'Musical equipment',      icon: musicIcon,          color: '#5CC840' },
  ];

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await itemsApi.getItems({ status: 'available' });
      if (response.data && Array.isArray(response.data)) {
        const all: Item[] = response.data;
        setRecentItems(all.slice(0, 10));
        const counts: Record<string, number> = {};
        for (const item of all) {
          const cat = (item as any).category;
          if (cat) counts[cat] = (counts[cat] || 0) + 1;
        }
        setCategoryCounts(counts);
      }
    } catch {
      // silently fail — just show nothing
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useIonViewWillEnter(() => { fetchItems(); });

  return (
    <IonContent>
      <div style={{ padding: '20px', textAlign: 'center', marginTop: '60px', position: 'relative' }}>

        {/* Video */}
        <IonCard>
  <IonCardContent style={{ padding: '0' }}>
    <video
      autoPlay
      muted
      loop
      playsInline
      className="home-video"
      style={{ width: '100%', objectFit: 'cover', objectPosition: 'bottom', borderRadius: '8px' }}
    >
      <source src={homeVideo} type="video/mp4" />
    </video>
  </IonCardContent>
</IonCard>

        {/* Logo overlay */}
        <div style={{
          position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)',
          width: '200px', height: '200px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 10
        }}>
          <img src={logo} alt="Eduthrift Logo" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
        </div>
 {/* Buy / Sell action cards */}
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeSm="6">
              <IonCard button onClick={() => history.push('/buyer')} style={{ height: '120px', position: 'relative', overflow: 'hidden' }}>
                <img src={sellerIcon} alt="Buy" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '125%', objectFit: 'fill', zIndex: 1 }} />
                <IonCardContent style={{ height: '100%', zIndex: 2, color: 'white', textAlign: 'left' }}>
                  <div>
                    <h1 style={{ paddingLeft: '45%', fontWeight: '800' }}>I want to Buy</h1>
                    <p style={{ paddingLeft: '45%' }}>Find great deals on educational items</p>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="12" sizeSm="6">
              <IonCard button onClick={() => history.push('/seller')} style={{ height: '120px', position: 'relative', overflow: 'hidden' }}>
                <img src={buyerIcon} alt="Sell" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '125%', objectFit: 'fill', zIndex: 1 }} />
                <IonCardContent style={{ height: '100%', zIndex: 2, color: 'white', textAlign: 'left' }}>
                  <div>
                    <h1 style={{ paddingLeft: '45%', fontWeight: '800' }}>I want to Sell</h1>
                    <p style={{ paddingLeft: '45%' }}>List your educational items for sale</p>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Just Listed */}
        <IonCard>
          <IonCardContent style={{ padding: '16px' }}>
            <h3 style={{ color: '#2C3E50', marginTop: 0, marginBottom: '16px', textAlign: 'left' }}>Just Listed</h3>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}><IonSpinner /></div>
            ) : recentItems.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center' }}>No listings yet — be the first to sell!</p>
            ) : (
              <Swiper
                slidesPerView={2.5}
                spaceBetween={10}
                freeMode={true}
                modules={[Autoplay]}
                autoplay={{ delay: 10000, disableOnInteraction: false }}
                loop={true}
                breakpoints={{ 768: { slidesPerView: 3.5 }, 1024: { slidesPerView: 5 } }}
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
            )}
          </IonCardContent>
        </IonCard>

        {/* Browse Categories */}
        <IonCard>
          <IonCardContent style={{ padding: '16px' }}>
            <h3 style={{ color: '#2C3E50', marginTop: 0, marginBottom: '16px', textAlign: 'left' }}>Browse Categories</h3>
            <IonGrid style={{ padding: 0 }}>
              <IonRow>
                {categories.map(cat => (
                  <IonCol key={cat.name} size="3" style={{ padding: '4px' }}>
                    <div
                      onClick={() => history.push('/buyer', { initialCategory: cat.name })}
                      style={{ textAlign: 'center', cursor: 'pointer', padding: '8px 4px' }}
                    >
                      <div style={{
                        position: 'relative',
                        width: '52px', height: '52px', borderRadius: '50%',
                        backgroundColor: cat.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 6px'
                      }}>
                        {typeof cat.icon === 'string' && cat.icon.includes('.svg') ? (
                          <IonIcon src={cat.icon} style={{ fontSize: '26px', color: 'white' }} />
                        ) : typeof cat.icon === 'string' && cat.icon.includes('.png') ? (
                          <img src={cat.icon} alt="" style={{ width: '30px', height: '30px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                        ) : (
                          <IonIcon icon={cat.icon as any} style={{ fontSize: '26px', color: 'white' }} />
                        )}
                        {categoryCounts[cat.name] > 0 && (
                          <span style={{
                            position: 'absolute', top: '-5px', right: '-5px',
                            backgroundColor: '#E74C3C',
                            color: 'white',
                            fontSize: '9px', fontWeight: '700',
                            minWidth: '16px', height: '16px',
                            borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '0 3px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                            zIndex: 10,
                            pointerEvents: 'none'
                          }}>
                            {categoryCounts[cat.name] > 99 ? '99+' : categoryCounts[cat.name]}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '0', fontSize: '10px', color: '#2C3E50', lineHeight: '1.3' }}>{cat.name}</p>
                    </div>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* For Buyers */}
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
                    <IonIcon icon={searchOutline} style={{ fontSize: '28px', color: '#004aad', marginBottom: '8px' }} />
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

        {/* For Sellers */}
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
                    <IonIcon icon={cameraOutline} style={{ fontSize: '28px', color: '#004aad', marginBottom: '8px' }} />
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
                  <div style={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
                    <IonIcon icon={shieldCheckmarkOutline} style={{ fontSize: '24px', color: '#27AE60', marginRight: '12px' }} />
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ fontSize: '14px', margin: '0', color: '#2C3E50' }}>Escrow Protection</h4>
                      <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>Secure payments held until collection</p>
                    </div>
                  </div>
                </IonCol>
                <IonCol size="12" sizeMd="6">
                  <div style={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
                    <IonIcon icon={locationOutline} style={{ fontSize: '24px', color: '#004aad', marginRight: '12px' }} />
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ fontSize: '14px', margin: '0', color: '#2C3E50' }}>Pudo + The Courier Guy Network</h4>
                      <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>1400+ lockers across South Africa</p>
                    </div>
                  </div>
                </IonCol>
               
                <IonCol size="12" sizeMd="6">
                  <div style={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
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
 {/* What is Eduthrift */}
        <IonCard>
          <IonCardContent style={{ textAlign: 'center', padding: '20px' }}>
            {/* <IonIcon icon={schoolOutline} style={{ fontSize: '48px', color: '#004aad', marginBottom: '16px' }} /> */}
            <h2 style={{ color: '#2C3E50', marginBottom: '16px' }}>What is Eduthrift?</h2>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Eduthrift is a secure anonymous marketplace for second-hand educational items in South Africa. 
              It allows you to buy and sell quality pre-owned school materials easily, helping you save money while promoting sustainability.
            </p>
          </IonCardContent>
        </IonCard>
       

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '20px', marginTop: '20px' }}>
          <IonText color="medium" style={{ fontSize: '14px', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => history.push('/privacy-policy')}>
            Privacy Policy
          </IonText>
          <IonText color="medium" style={{ fontSize: '14px', margin: '0 8px' }}>•</IonText>
          <IonText color="medium" style={{ fontSize: '14px' }}>
            <a href="mailto:support@eduthrift.co.za" style={{ color: 'inherit', textDecoration: 'none' }}>support@eduthrift.co.za</a>
          </IonText>
        </div>

      </div>
    </IonContent>
  );
};

export default Home;
