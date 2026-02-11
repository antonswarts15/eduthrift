import React, { useState, useEffect, useRef } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { isLoggedIn } from './utils/auth';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import loginVideo from './assets/Loginvid.mp4';
import Welcome from './pages/Welcome';
import LoginRegisterPage from './pages/LoginRegisterPage';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import Buyer from './pages/Buyer';
import Seller from './pages/Seller';
import Cart from './pages/Cart';
import MyProfile from './pages/MyProfile';
import PersonalDetailsPage from './pages/PersonalDetailsPage';
import OrdersPage from './pages/OrdersPage';
import ListingsPage from './pages/ListingsPage';
import CategoryPage from './pages/CategoryPage';
import ItemPage from './pages/ItemPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import HowItWorksPage from './pages/HowItWorksPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
/* import '@ionic/react/css/palettes/dark.system.css'; */

/* Theme variables */
import './theme/variables.css';
import './theme/style.css';

setupIonicReact();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isLoggedIn() ? <>{children}</> : <Redirect to="/login" />;
};

const App: React.FC = () => {
  const [showVideo, setShowVideo] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

  if (showVideo) {
    return (
      <IonApp>
        <video
          ref={videoRef}
          onEnded={() => setShowVideo(false)}
          onClick={() => setShowVideo(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100vw',
            height: '100vh',
            objectFit: 'fill',
            cursor: 'pointer'
          }}
          muted
          playsInline
          webkit-playsinline="true"
        >
          <source src={loginVideo} type="video/mp4" />
        </video>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/">
            <Welcome />
          </Route>
          <Route exact path="/login">
            <LoginRegisterPage />
          </Route>
          <Route exact path="/home">
            <ProtectedRoute>
              <MainLayout>
                <Home />
              </MainLayout>
            </ProtectedRoute>
          </Route>
          <Route exact path="/buyer">
            <ProtectedRoute>
              <MainLayout>
                <Buyer />
              </MainLayout>
            </ProtectedRoute>
          </Route>
          <Route exact path="/seller">
            <ProtectedRoute>
              <MainLayout>
                <Seller />
              </MainLayout>
            </ProtectedRoute>
          </Route>
          <Route exact path="/cart">
            <ProtectedRoute>
              <MainLayout>
                <Cart />
              </MainLayout>
            </ProtectedRoute>
          </Route>
          <Route exact path="/checkout-page">
            <ProtectedRoute>
              <MainLayout>
                <CheckoutPage />
              </MainLayout>
            </ProtectedRoute>
          </Route>
          <Route exact path="/orders">
            <ProtectedRoute>
              <MainLayout>
                <OrdersPage />
              </MainLayout>
            </ProtectedRoute>
          </Route>
          <Route exact path="/profile">
            <ProtectedRoute>
              <MainLayout>
                <MyProfile />
              </MainLayout>
            </ProtectedRoute>
          </Route>
          <Route exact path="/profile/personal-details">
            <ProtectedRoute>
              <MainLayout>
                <PersonalDetailsPage />
              </MainLayout>
            </ProtectedRoute>
          </Route>
          <Route exact path="/profile/orders">
            <ProtectedRoute>
              <MainLayout>
                <OrdersPage />
              </MainLayout>
            </ProtectedRoute>
          </Route>
          <Route exact path="/profile/listings">
            <ProtectedRoute>
              <MainLayout>
                <ListingsPage />
              </MainLayout>
            </ProtectedRoute>
          </Route>
          <Route exact path="/wishlist">
            <ProtectedRoute>
              <MainLayout>
                <WishlistPage />
              </MainLayout>
            </ProtectedRoute>
          </Route>
          <Route exact path="/category/:category">
            <MainLayout>
              <CategoryPage />
            </MainLayout>
          </Route>
          <Route exact path="/category/:category/:subcategory">
            <MainLayout>
              <CategoryPage />
            </MainLayout>
          </Route>
          <Route exact path="/category/:category/:subcategory/:sport">
            <MainLayout>
              <CategoryPage />
            </MainLayout>
          </Route>
          <Route exact path="/how-it-works">
            <MainLayout>
              <HowItWorksPage />
            </MainLayout>
          </Route>
          <Route exact path="/privacy-policy">
            <ProtectedRoute>
              <MainLayout>
                <PrivacyPolicyPage />
              </MainLayout>
            </ProtectedRoute>
          </Route>
          <Route exact path="/item/:id">
            <MainLayout>
              <ItemPage />
            </MainLayout>
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;