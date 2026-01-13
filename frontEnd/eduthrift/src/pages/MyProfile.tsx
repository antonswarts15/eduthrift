import React, { useEffect } from 'react';
import { isLoggedIn } from '../utils/auth';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonCard,
  IonCardContent
} from '@ionic/react';
import {
  personOutline,
  bagOutline,
  listOutline,
  chevronForwardOutline,
  logOutOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const MyProfile: React.FC = () => {
  const history = useHistory();
  
  useEffect(() => {
    if (!isLoggedIn()) {
      history.push('/login');
    }
  }, [history]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    history.push('/');
  };

  const profileOptions = [
    {
      title: 'Update Personal Details',
      icon: personOutline,
      route: '/profile/personal-details'
    },
    {
      title: 'My Orders',
      icon: bagOutline,
      route: '/profile/orders'
    },
    {
      title: 'My Listings',
      icon: listOutline,
      route: '/profile/listings'
    }
  ];

  return (
    <IonContent>
      <div style={{ padding: '16px' }}>
        <h2>My Profile</h2>
        
        <IonList>
          {profileOptions.map((option, index) => (
            <IonItem key={index} button onClick={() => history.push(option.route)}>
              <IonIcon icon={option.icon} slot="start" />
              <IonLabel>{option.title}</IonLabel>
              <IonIcon icon={chevronForwardOutline} slot="end" />
            </IonItem>
          ))}
          
          <IonItem button onClick={handleLogout} style={{ marginTop: '20px' }}>
            <IonIcon icon={logOutOutline} slot="start" />
            <IonLabel>Logout</IonLabel>
          </IonItem>
        </IonList>
      </div>
    </IonContent>
  );
};

export default MyProfile;