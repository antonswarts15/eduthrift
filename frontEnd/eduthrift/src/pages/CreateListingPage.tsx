import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonButton,
  IonIcon,
  IonToast,
  IonGrid,
  IonRow,
  IonCol,
  IonAlert
} from '@ionic/react';
import { addOutline, cameraOutline, checkmarkCircleOutline, warningOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import PhotoCapture from '../components/PhotoCapture';
import { useUserStore } from '../stores/userStore';
import { useListingsStore } from '../stores/listingsStore';
import api from '../services/api';
import { AxiosError } from 'axios';

const CreateListingPage: React.FC = () => {
  const history = useHistory();
  const { userProfile } = useUserStore();
  const { addListing } = useListingsStore();
  
  // Required fields
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [size, setSize] = useState('');
  const [gender, setGender] = useState('');
  const [condition, setCondition] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  
  // Required photos
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [backPhoto, setBackPhoto] = useState<File | null>(null);
  
  // Optional fields
  const [sport, setSport] = useState('');
  
  // UI state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (userProfile && !['seller', 'both'].includes(userProfile.userType || '')) {
      setAlertMessage('Only sellers can create listings.');
      setShowAlert(true);
    }
    if (userProfile && userProfile.sellerVerification?.status !== 'verified') {
      setAlertMessage('Your seller account needs verification before listing items.');
      setShowAlert(true);
    }
  }, [userProfile]);

  const validateForm = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!itemName.trim()) errors.push('Item name is required');
    if (!category) errors.push('Category is required');
    if (!schoolName.trim()) errors.push('School name is required');
    if (!size) errors.push('Size is required');
    if (!gender) errors.push('Gender is required');
    if (!condition) errors.push('Condition is required');
    if (!price.trim()) errors.push('Price is required');
    if (!description.trim()) errors.push('Description is required');
    if (!frontPhoto) errors.push('Front photo is required');
    if (!backPhoto) errors.push('Back photo is required');
    
    if (price && (isNaN(Number(price)) || Number(price) <= 0)) {
      errors.push('Price must be a valid positive number');
    }
    
    if (description.trim() && description.trim().length < 20) {
      errors.push('Description must be at least 20 characters');
    }
    
    return { valid: errors.length === 0, errors };
  };

  const handleSubmit = async () => {
    const validation = validateForm();
    
    if (!validation.valid) {
      setToastMessage(`Please fix:\n• ${validation.errors.join('\n• ')}`);
      setShowToast(true);
      return;
    }

    try {
      setLoading(true);

      // Upload photos to the server first
      const formData = new FormData();
      formData.append('images', frontPhoto!);
      formData.append('images', backPhoto!);

      const uploadResponse = await api.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const uploadedFiles = uploadResponse.data.files || [];
      if (uploadedFiles.length < 2) {
        throw new Error('Failed to upload both photos');
      }

      const frontPhotoUrl = uploadedFiles[0].url;
      const backPhotoUrl = uploadedFiles[1].url;

      const listingData = {
        id: Date.now().toString(),
        name: itemName,
        description,
        price: Number(price),
        condition: Number(condition),
        school: schoolName,
        size,
        gender,
        category,
        sport,
        frontPhoto: frontPhotoUrl,
        backPhoto: backPhotoUrl,
        quantity: 1,
        dateCreated: new Date().toISOString()
      };

      await addListing(listingData);

      setToastMessage('Listing created successfully!');
      setShowToast(true);

      setTimeout(() => history.push('/seller'), 2000);

    } catch (error) {
      console.error('Error creating listing:', error);
      if (error instanceof AxiosError) {
        setToastMessage(error.response?.data?.error || error.message || 'Failed to create listing');
      } else if (error instanceof Error) {
        setToastMessage(error.message);
      } else {
        setToastMessage('An unknown error occurred');
      }
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = () => {
    const fields = [itemName, category, schoolName, size, gender, condition, price, description];
    const filled = fields.filter(f => f && f.trim()).length + (frontPhoto ? 1 : 0) + (backPhoto ? 1 : 0);
    return { filled, total: 10 };
  };

  const progress = getProgress();
  const progressPercent = (progress.filled / progress.total) * 100;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Create Listing</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '16px' }}>
          {/* Progress */}
          <IonCard>
            <IonCardContent>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <IonIcon icon={checkmarkCircleOutline} color={progressPercent === 100 ? 'success' : 'medium'} />
                <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>
                  Progress: {progress.filled}/{progress.total} required fields
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
                <div style={{ 
                  width: `${progressPercent}%`, 
                  height: '100%', 
                  backgroundColor: progressPercent === 100 ? '#28a745' : '#007bff',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </IonCardContent>
          </IonCard>

          {/* Basic Info */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Basic Information</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel position="stacked">Item Name *</IonLabel>
                <IonInput
                  value={itemName}
                  onIonInput={e => setItemName(e.detail.value || '')}
                  placeholder="e.g., Rugby Jersey, School Shirt"
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Category *</IonLabel>
                <IonSelect value={category} onIonChange={e => setCategory(e.detail.value)}>
                  <IonSelectOption value="School & sport uniform">School & Sport Uniform</IonSelectOption>
                  <IonSelectOption value="Club clothing">Club Clothing</IonSelectOption>
                  <IonSelectOption value="Training wear">Training Wear</IonSelectOption>
                  <IonSelectOption value="Belts, bags & shoes">Belts, Bags & Shoes</IonSelectOption>
                  <IonSelectOption value="Sports equipment">Sports Equipment</IonSelectOption>
                  <IonSelectOption value="Textbooks">Textbooks</IonSelectOption>
                  <IonSelectOption value="Stationery">Stationery</IonSelectOption>
                  <IonSelectOption value="Matric dance clothing">Matric Dance Clothing</IonSelectOption>
                </IonSelect>
              </IonItem>

              {category && (
                <IonItem>
                  <IonLabel position="stacked">Sport (if applicable)</IonLabel>
                  <IonSelect value={sport} onIonChange={e => setSport(e.detail.value)}>
                    <IonSelectOption value="">None</IonSelectOption>
                    <IonSelectOption value="Rugby">Rugby</IonSelectOption>
                    <IonSelectOption value="Netball">Netball</IonSelectOption>
                    <IonSelectOption value="Hockey">Hockey</IonSelectOption>
                    <IonSelectOption value="Football">Football</IonSelectOption>
                    <IonSelectOption value="Athletics">Athletics</IonSelectOption>
                    <IonSelectOption value="Basketball">Basketball</IonSelectOption>
                    <IonSelectOption value="Cricket">Cricket</IonSelectOption>
                    <IonSelectOption value="Swimming">Swimming</IonSelectOption>
                    <IonSelectOption value="Tennis">Tennis</IonSelectOption>
                  </IonSelect>
                </IonItem>
              )}

              <IonItem>
                <IonLabel position="stacked">School Name *</IonLabel>
                <IonInput
                  value={schoolName}
                  onIonInput={e => setSchoolName(e.detail.value || '')}
                  placeholder="e.g., Hoërskool Waterkloof"
                />
              </IonItem>
            </IonCardContent>
          </IonCard>

          {/* Item Details */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Item Details</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel position="stacked">Size *</IonLabel>
                <IonSelect value={size} onIonChange={e => setSize(e.detail.value)}>
                  <IonSelectOption value="XS">XS</IonSelectOption>
                  <IonSelectOption value="S">S</IonSelectOption>
                  <IonSelectOption value="M">M</IonSelectOption>
                  <IonSelectOption value="L">L</IonSelectOption>
                  <IonSelectOption value="XL">XL</IonSelectOption>
                  <IonSelectOption value="XXL">XXL</IonSelectOption>
                  <IonSelectOption value="One Size">One Size</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Gender *</IonLabel>
                <IonSelect value={gender} onIonChange={e => setGender(e.detail.value)}>
                  <IonSelectOption value="boy">Boy</IonSelectOption>
                  <IonSelectOption value="girl">Girl</IonSelectOption>
                  <IonSelectOption value="unisex">Unisex</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Condition *</IonLabel>
                <IonSelect value={condition} onIonChange={e => setCondition(e.detail.value)}>
                  <IonSelectOption value="1">1 - Like New</IonSelectOption>
                  <IonSelectOption value="2">2 - Very Good</IonSelectOption>
                  <IonSelectOption value="3">3 - Good</IonSelectOption>
                  <IonSelectOption value="4">4 - Fair</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Price (R) *</IonLabel>
                <IonInput
                  type="number"
                  value={price}
                  onIonInput={e => setPrice(e.detail.value || '')}
                  placeholder="150"
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Description * (min 20 characters)</IonLabel>
                <IonTextarea
                  value={description}
                  onIonInput={e => setDescription(e.detail.value || '')}
                  placeholder="Describe the item condition, any wear, special features..."
                  rows={4}
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {description.length}/20 characters minimum
                </div>
              </IonItem>
            </IonCardContent>
          </IonCard>

          {/* Photos */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={cameraOutline} style={{ marginRight: '8px' }} />
                Photos * (Both Required)
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol size="6">
                    <div style={{ textAlign: 'center' }}>
                      <h4>Front Photo *</h4>
                      <PhotoCapture
                        onPhotoSelected={setFrontPhoto}
                        photoType="ITEM_PHOTO"
                        buttonText={frontPhoto ? 'Change Front' : 'Add Front Photo'}
                      />
                      {frontPhoto && (
                        <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
                          <IonIcon icon={checkmarkCircleOutline} color="success" />
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            {(frontPhoto.size / 1024 / 1024).toFixed(2)}MB
                          </div>
                        </div>
                      )}
                    </div>
                  </IonCol>
                  <IonCol size="6">
                    <div style={{ textAlign: 'center' }}>
                      <h4>Back Photo *</h4>
                      <PhotoCapture
                        onPhotoSelected={setBackPhoto}
                        photoType="ITEM_PHOTO"
                        buttonText={backPhoto ? 'Change Back' : 'Add Back Photo'}
                      />
                      {backPhoto && (
                        <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
                          <IonIcon icon={checkmarkCircleOutline} color="success" />
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            {(backPhoto.size / 1024 / 1024).toFixed(2)}MB
                          </div>
                        </div>
                      )}
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>

          {/* Submit */}
          <IonButton
            expand="block"
            onClick={handleSubmit}
            disabled={loading}
            color={progressPercent === 100 ? 'success' : 'primary'}
            style={{ margin: '16px 0' }}
          >
            <IonIcon icon={addOutline} slot="start" />
            {loading ? 'Creating...' : 'Create Listing'}
          </IonButton>

          {progressPercent !== 100 && (
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
              <IonIcon icon={warningOutline} color="warning" />
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#856404' }}>
                Complete all required fields and add both photos before submitting.
              </p>
            </div>
          )}
        </div>

        <IonToast
          isOpen={showToast}
          message={toastMessage}
          duration={4000}
          onDidDismiss={() => setShowToast(false)}
          color={toastMessage.includes('success') ? 'success' : 'danger'}
        />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Verification Required"
          message={alertMessage}
          buttons={[
            { text: 'Go to Profile', handler: () => history.push('/profile') },
            { text: 'Cancel', role: 'cancel' }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default CreateListingPage;