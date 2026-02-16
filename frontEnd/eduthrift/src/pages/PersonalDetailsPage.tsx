import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonLoading,
  IonToast,
  IonBackButton,
  IonButtons
} from '@ionic/react';
import { userApi } from '../services/api';

const PersonalDetailsPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [suburb, setSuburb] = useState('');
  const [town, setTown] = useState('');
  const [province, setProvince] = useState('');
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userApi.getProfile();
        const profile = response.data;
        setFirstName(profile.firstName || '');
        setLastName(profile.lastName || '');
        setEmail(profile.email);
        setPhone(profile.phone || '');
        setSchoolName(profile.schoolName || '');
        setSuburb(profile.suburb || '');
        setTown(profile.town || '');
        setProvince(profile.province || '');
      } catch (error) {
        console.error('Failed to fetch profile', error);
        setToastMessage('Could not load profile data.');
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updateData = { firstName, lastName, phone, schoolName, suburb, town, province };
      await userApi.updateProfile(updateData);
      setToastMessage('Profile updated successfully!');
      setShowToast(true);
    } catch (error) {
      console.error('Failed to update profile', error);
      setToastMessage('Failed to update profile.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setToastMessage('Please fill in all password fields.');
      setShowToast(true);
      return;
    }
    if (newPassword.length < 6) {
      setToastMessage('New password must be at least 6 characters.');
      setShowToast(true);
      return;
    }
    if (newPassword !== confirmPassword) {
      setToastMessage('New passwords do not match.');
      setShowToast(true);
      return;
    }
    setChangingPassword(true);
    try {
      await userApi.changePassword(currentPassword, newPassword);
      setToastMessage('Password changed successfully!');
      setShowToast(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Failed to change password.';
      setToastMessage(msg);
      setShowToast(true);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Personal Details</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={loading} message={'Please wait...'} />
        <IonList>
          <IonItem>
            <IonLabel position="stacked">First Name</IonLabel>
            <IonInput value={firstName} onIonChange={e => setFirstName(e.detail.value!)} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Last Name</IonLabel>
            <IonInput value={lastName} onIonChange={e => setLastName(e.detail.value!)} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Email</IonLabel>
            <IonInput type="email" value={email} disabled={true} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Phone</IonLabel>
            <IonInput type="tel" value={phone} onIonChange={e => setPhone(e.detail.value!)} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">School Name</IonLabel>
            <IonInput value={schoolName} onIonChange={e => setSchoolName(e.detail.value!)} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Suburb</IonLabel>
            <IonInput value={suburb} onIonChange={e => setSuburb(e.detail.value!)} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Town/City</IonLabel>
            <IonInput value={town} onIonChange={e => setTown(e.detail.value!)} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Province</IonLabel>
            <IonInput value={province} onIonChange={e => setProvince(e.detail.value!)} />
          </IonItem>
        </IonList>
        <IonButton expand="full" onClick={handleUpdate} style={{ margin: '20px' }}>
          Update Profile
        </IonButton>

        <div style={{ margin: '20px', borderTop: '1px solid #e0e0e0', paddingTop: '20px' }}>
          <h3 style={{ marginLeft: '16px', marginBottom: '8px' }}>Change Password</h3>
          <IonList>
            <IonItem>
              <IonLabel position="stacked">Current Password</IonLabel>
              <IonInput
                type="password"
                value={currentPassword}
                onIonChange={e => setCurrentPassword(e.detail.value!)}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">New Password</IonLabel>
              <IonInput
                type="password"
                value={newPassword}
                onIonChange={e => setNewPassword(e.detail.value!)}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Confirm New Password</IonLabel>
              <IonInput
                type="password"
                value={confirmPassword}
                onIonChange={e => setConfirmPassword(e.detail.value!)}
              />
            </IonItem>
          </IonList>
          <IonButton
            expand="full"
            color="warning"
            onClick={handleChangePassword}
            disabled={changingPassword}
            style={{ margin: '16px 0' }}
          >
            {changingPassword ? 'Changing...' : 'Change Password'}
          </IonButton>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default PersonalDetailsPage;