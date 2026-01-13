import React, { useState } from 'react';
import {
  IonButton,
  IonIcon,
  IonActionSheet,
  IonLoading,
  IonToast,
  IonProgressBar
} from '@ionic/react';
import { cameraOutline, imagesOutline, closeOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { compressImage, validateImageFile, PHOTO_COMPRESSION_SETTINGS } from '../utils/imageCompression';

interface PhotoCaptureProps {
  onPhotoSelected: (compressedFile: File) => void;
  photoType?: 'ITEM_PHOTO' | 'DOCUMENT' | 'PROFILE';
  buttonText?: string;
  disabled?: boolean;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onPhotoSelected,
  photoType = 'ITEM_PHOTO',
  buttonText = 'Add Photo',
  disabled = false
}) => {
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [compressionProgress, setCompressionProgress] = useState(0);

  const capturePhoto = async (source: CameraSource) => {
    try {
      setLoading(true);
      setLoadingText('Taking photo...');
      
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: source,
        quality: 90, // High quality capture, we'll compress after
        allowEditing: true,
        correctOrientation: true
      });

      if (photo.webPath) {
        setLoadingText('Processing image...');
        await processPhotoUri(photo.webPath);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setToastMessage('Failed to capture photo. Please try again.');
      setShowToast(true);
    } finally {
      setLoading(false);
      setShowActionSheet(false);
    }
  };

  const selectFromGallery = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await processFile(file);
      }
    };
    input.click();
    setShowActionSheet(false);
  };

  const processPhotoUri = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      await processFile(file);
    } catch (error) {
      console.error('Error processing photo URI:', error);
      setToastMessage('Failed to process photo');
      setShowToast(true);
    }
  };

  const processFile = async (file: File) => {
    try {
      setLoading(true);
      setLoadingText('Validating image...');
      
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setToastMessage(validation.error || 'Invalid image file');
        setShowToast(true);
        return;
      }

      // Show compression settings info
      const settings = PHOTO_COMPRESSION_SETTINGS[photoType];
      setLoadingText(`Optimizing image (max ${settings.maxSizeMB}MB)...`);
      
      // Simulate compression progress
      const progressInterval = setInterval(() => {
        setCompressionProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Compress image
      const compressedFile = await compressImage(file, photoType);
      
      clearInterval(progressInterval);
      setCompressionProgress(100);
      
      // Success feedback
      const originalSizeMB = (file.size / 1024 / 1024).toFixed(2);
      const compressedSizeMB = (compressedFile.size / 1024 / 1024).toFixed(2);
      const reduction = (((file.size - compressedFile.size) / file.size) * 100).toFixed(1);
      
      setToastMessage(`Image optimized: ${originalSizeMB}MB → ${compressedSizeMB}MB (${reduction}% smaller)`);
      setShowToast(true);
      
      onPhotoSelected(compressedFile);
      
    } catch (error) {
      console.error('Image processing error:', error);
      setToastMessage('Failed to process image. Please try a different photo.');
      setShowToast(true);
    } finally {
      setLoading(false);
      setCompressionProgress(0);
    }
  };

  const getMaxSizeText = () => {
    const settings = PHOTO_COMPRESSION_SETTINGS[photoType];
    return `Auto-optimized to ${settings.maxSizeMB}MB max`;
  };

  return (
    <>
      <IonButton
        fill="outline"
        onClick={() => setShowActionSheet(true)}
        disabled={disabled}
      >
        <IonIcon icon={cameraOutline} slot="start" />
        {buttonText}
      </IonButton>
      
      <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
        {getMaxSizeText()}
      </p>

      <IonActionSheet
        isOpen={showActionSheet}
        onDidDismiss={() => setShowActionSheet(false)}
        header="Add Photo"
        buttons={[
          {
            text: 'Take Photo',
            icon: cameraOutline,
            handler: () => capturePhoto(CameraSource.Camera)
          },
          {
            text: 'Choose from Gallery',
            icon: imagesOutline,
            handler: selectFromGallery
          },
          {
            text: 'Cancel',
            icon: closeOutline,
            role: 'cancel'
          }
        ]}
      />

      <IonLoading
        isOpen={loading}
        message={loadingText}
      />
      
      {loading && compressionProgress > 0 && (
        <div style={{ padding: '0 16px' }}>
          <IonProgressBar value={compressionProgress / 100} />
          <p style={{ fontSize: '12px', textAlign: 'center', margin: '4px 0' }}>
            {compressionProgress}% complete
          </p>
        </div>
      )}

      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        onDidDismiss={() => setShowToast(false)}
      />
    </>
  );
};

export default PhotoCapture;