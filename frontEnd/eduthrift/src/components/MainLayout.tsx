import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonSearchbar,
  IonButton,
  IonBadge,
  IonMenu,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonTabBar,
  IonTabButton,
  IonPopover,
  IonCard,
  IonCardContent,
  IonModal
} from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useUserStore } from '../stores/userStore';
import logo from '../assets/logo.png';
import {
  bagOutline,
  cashOutline,
  cartOutline,
  personOutline,
  homeOutline,
  notificationsOutline,
  chevronDownOutline,
  chevronForwardOutline,
  listOutline,
  receiptOutline,
  helpCircleOutline,
  closeOutline,
  searchOutline,
  heartOutline
} from 'ionicons/icons';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [showListingSubmenu, setShowListingSubmenu] = useState(false);
  const [showOrdersSubmenu, setShowOrdersSubmenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { getCartItemCount } = useCartStore();
  const { notifications, removeNotification } = useNotificationStore();
  const { userProfile, fetchUserProfile } = useUserStore();
  const history = useHistory();
  const location = useLocation();
  
  // Ensure user profile is loaded when layout mounts
  useEffect(() => {
    if (!userProfile) {
      fetchUserProfile();
    }
  }, [userProfile, fetchUserProfile]);

  const deleteNotification = (id: number) => {
    removeNotification(id);
  };
  
  // Mock search data - replace with real API calls
  const mockItems = [
    { id: 1, name: 'Kempton Park High School Uniform', category: 'School Uniform', price: 250, school: 'Kempton Park High' },
    { id: 2, name: 'Grade 12 Mathematics Textbook', category: 'Textbooks', price: 180, school: 'Edenglen High' },
    { id: 3, name: 'Rugby Jersey - Blue', category: 'Sports Uniform', price: 120, school: 'Norkem Park Primary' },
    { id: 4, name: 'School Blazer - Navy', category: 'School Uniform', price: 300, school: 'Kempton Park High' },
    { id: 5, name: 'Cricket Bat - Willow', category: 'Sports Equipment', price: 450, school: 'Terenure College' },
    { id: 6, name: 'Scientific Calculator', category: 'Stationery', price: 85, school: 'Birchleigh North Primary' }
  ];
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim().length > 2) {
      const filtered = mockItems.filter(item => 
        item.name.toLowerCase().includes(term.toLowerCase()) ||
        item.category.toLowerCase().includes(term.toLowerCase()) ||
        item.school.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };
  
  const selectSearchResult = (item: any) => {
    setShowSearchModal(false);
    setSearchTerm('');
    setSearchResults([]);
    // Navigate to item details or category
    history.push(`/item/${item.category}/${item.name}`);
  };
  
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === '/home') return 'home';
    if (path === '/buyer') return 'buyer';
    if (path === '/seller') return 'seller';
    if (path === '/cart') return 'cart';
    if (path.startsWith('/profile')) return 'profile';
    return 'home';
  };

  return (
    <>
      <IonMenu side="start" contentId="main-content">
        <IonContent>
          <IonList>
            <IonItem button onClick={() => history.push('/home')}>
              <IonIcon icon={homeOutline} slot="start" />
              <IonLabel>Home</IonLabel>
            </IonItem>
            
            <IonItem button onClick={() => history.push('/profile')}>
              <IonIcon icon={personOutline} slot="start" />
              <IonLabel>My Profile</IonLabel>
            </IonItem>
            
            <IonItem button onClick={() => history.push('/wishlist')}>
              <IonIcon icon={heartOutline} slot="start" />
              <IonLabel>My Wishlist</IonLabel>
            </IonItem>
            
            <IonItem button onClick={() => setShowListingSubmenu(!showListingSubmenu)}>
              <IonIcon icon={listOutline} slot="start" />
              <IonLabel>My Listing</IonLabel>
              <IonIcon icon={showListingSubmenu ? chevronDownOutline : chevronForwardOutline} slot="end" />
            </IonItem>
            {showListingSubmenu && (
              <IonList inset>
                <IonItem button onClick={() => history.push('/profile/listings')}>
                  <IonLabel>Currently Listed</IonLabel>
                </IonItem>
                <IonItem button onClick={() => history.push('/profile/listings')}>
                  <IonLabel>Listing History</IonLabel>
                </IonItem>
              </IonList>
            )}
            
            <IonItem button onClick={() => setShowOrdersSubmenu(!showOrdersSubmenu)}>
              <IonIcon icon={receiptOutline} slot="start" />
              <IonLabel>My Orders</IonLabel>
              <IonIcon icon={showOrdersSubmenu ? chevronDownOutline : chevronForwardOutline} slot="end" />
            </IonItem>
            {showOrdersSubmenu && (
              <IonList inset>
                <IonItem button onClick={() => history.push('/profile/orders')}>
                  <IonLabel>Current Orders</IonLabel>
                </IonItem>
                <IonItem button onClick={() => history.push('/profile/orders')}>
                  <IonLabel>Order History</IonLabel>
                </IonItem>
              </IonList>
            )}
            
            <IonItem button onClick={() => history.push('/how-it-works')}>
              <IonIcon icon={helpCircleOutline} slot="start" />
              <IonLabel>How does eduthrift work?</IonLabel>
            </IonItem>
          </IonList>
        </IonContent>
      </IonMenu>

      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <div slot="start" style={{ marginLeft: '8px', width: '50px', height: '50px',  borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={logo} alt="Eduthrift Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
            </div>
            <IonButton fill="clear" onClick={() => setShowSearchModal(true)}>
              <IonIcon icon={searchOutline} />
            </IonButton>
            <IonButtons slot="end">
              <span style={{ marginRight: '12px', fontSize: '14px', fontWeight: '500', color: '#777' }}>
                {userProfile?.name || 'User'}
              </span>
              <IonButton id="notifications-trigger" onClick={() => setShowNotifications(true)}>
                <IonIcon icon={notificationsOutline} />
                {notifications.length > 0 && <IonBadge>{notifications.length}</IonBadge>}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          {children}
        </IonContent>
        
        <IonTabBar slot="bottom" selectedTab={getCurrentTab()}>
          <IonTabButton 
            tab="home" 
            onClick={() => history.push('/home')}
            style={{ color: getCurrentTab() === 'home' ? '#3880ff' : '#92949c' }}
          >
            <IonIcon aria-hidden="true" icon={homeOutline} style={{ color: getCurrentTab() === 'home' ? '#3880ff' : '#92949c' }} />
            <IonLabel style={{ color: getCurrentTab() === 'home' ? '#3880ff' : '#92949c' }}>Home</IonLabel>
          </IonTabButton>
          <IonTabButton 
            tab="buyer" 
            onClick={() => history.push('/buyer')}
            style={{ color: getCurrentTab() === 'buyer' ? '#3880ff' : '#92949c' }}
          >
            <IonIcon aria-hidden="true" icon={bagOutline} style={{ color: getCurrentTab() === 'buyer' ? '#3880ff' : '#92949c' }} />
            <IonLabel style={{ color: getCurrentTab() === 'buyer' ? '#3880ff' : '#92949c' }}>Buy</IonLabel>
          </IonTabButton>
          <IonTabButton 
            tab="seller" 
            onClick={() => history.push('/seller')}
            style={{ color: getCurrentTab() === 'seller' ? '#3880ff' : '#92949c' }}
          >
            <IonIcon aria-hidden="true" icon={cashOutline} style={{ color: getCurrentTab() === 'seller' ? '#3880ff' : '#92949c' }} />
            <IonLabel style={{ color: getCurrentTab() === 'seller' ? '#3880ff' : '#92949c' }}>Sell</IonLabel>
          </IonTabButton>
          <IonTabButton 
            tab="cart" 
            onClick={() => history.push('/cart')}
            style={{ color: getCurrentTab() === 'cart' ? '#3880ff' : '#92949c', position: 'relative' }}
          >
            <IonIcon aria-hidden="true" icon={cartOutline} style={{ color: getCurrentTab() === 'cart' ? '#3880ff' : '#92949c' }} />
            <IonLabel style={{ color: getCurrentTab() === 'cart' ? '#3880ff' : '#92949c' }}>Cart</IonLabel>
            {getCartItemCount() > 0 && (
              <IonBadge 
                style={{ 
                  position: 'absolute', 
                  top: '8px', 
                  right: '12px', 
                  minWidth: '18px', 
                  height: '18px', 
                  fontSize: '10px',
                  backgroundColor: '#ff4444'
                }}
              >
                {getCartItemCount()}
              </IonBadge>
            )}
          </IonTabButton>
          <IonTabButton 
            tab="profile" 
            onClick={() => history.push('/profile')}
            style={{ color: getCurrentTab() === 'profile' ? '#3880ff' : '#92949c' }}
          >
            <IonIcon aria-hidden="true" icon={personOutline} style={{ color: getCurrentTab() === 'profile' ? '#3880ff' : '#92949c' }} />
            <IonLabel style={{ color: getCurrentTab() === 'profile' ? '#3880ff' : '#92949c' }}>Profile</IonLabel>
          </IonTabButton>
        </IonTabBar>
        
        <IonPopover
          isOpen={showNotifications}
          onDidDismiss={() => setShowNotifications(false)}
          trigger="notifications-trigger"
          showBackdrop={true}
          alignment="end"
        >
          <IonContent scrollY={false}>
            <div style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 16px 0' }}>Notifications</h3>
              {notifications.map(notification => (
                <IonCard key={notification.id} style={{ margin: '8px 0', position: 'relative' }}>
                  <IonCardContent style={{ padding: '16px', paddingRight: '60px' }}>
                    <IonButton
                      fill="clear"
                      size="small"
                      style={{ position: 'absolute', top: '8px', right: '8px', minHeight: '24px', minWidth: '24px', zIndex: 10 }}
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <IonIcon icon={closeOutline} style={{ fontSize: '18px', color: '#666' }} />
                    </IonButton>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '14px' }}>{notification.title}</h4>
                    <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#666', lineHeight: '1.4' }}>{notification.message}</p>
                    <small style={{ color: '#999', fontSize: '10px' }}>{notification.time}</small>
                  </IonCardContent>
                </IonCard>
              ))}
              {notifications.length === 0 && (
                <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>No notifications</p>
              )}
            </div>
          </IonContent>
        </IonPopover>
        
        {/* Global Search Modal */}
        <IonModal isOpen={showSearchModal} onDidDismiss={() => {
          setShowSearchModal(false);
          setSearchTerm('');
          setSearchResults([]);
        }}>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton fill="clear" onClick={() => {
                  setShowSearchModal(false);
                  setSearchTerm('');
                  setSearchResults([]);
                }}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
              <IonSearchbar 
                placeholder="Search items, schools, categories..." 
                value={searchTerm}
                onIonInput={e => handleSearch(e.detail.value!)}
                onIonClear={() => {
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                showClearButton="focus"
                autoFocus
              />
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {searchTerm.length > 2 && (
              <div>
                {searchResults.length > 0 ? (
                  <div>
                    <div style={{ padding: '16px', borderBottom: '1px solid #eee' }}>
                      <h3 style={{ margin: '0', fontSize: '16px', color: '#333' }}>Search Results</h3>
                    </div>
                    {searchResults.map(item => (
                      <IonItem 
                        key={item.id}
                        button
                        onClick={() => selectSearchResult(item)}
                      >
                        <div style={{ width: '100%' }}>
                          <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                            {item.category} • {item.school}
                          </div>
                          <div style={{ fontWeight: 'bold', color: '#3880ff' }}>
                            R{item.price}
                          </div>
                        </div>
                      </IonItem>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                    No items found for "{searchTerm}"
                  </div>
                )}
              </div>
            )}
            {searchTerm.length <= 2 && searchTerm.length > 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                Type at least 3 characters to search
              </div>
            )}
            {searchTerm.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                Start typing to search for items, schools, or categories
              </div>
            )}
          </IonContent>
        </IonModal>
      </IonPage>
    </>
  );
};

export default MainLayout;