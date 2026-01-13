import React, { useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonNote
} from '@ionic/react';
import { cameraOutline, imageOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { enhanceAndCompressImage, validateImageFile, getImageDimensions } from '../utils/imageEnhancer';

const ImageEnhancementDemo: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [enhancedFile, setEnhancedFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [enhancedPreview, setEnhancedPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState<{
    originalSize: string;
    enhancedSize: string;
    compressionRatio: string;
    dimensions: string;
  } | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setProcessing(true);
    setOriginalFile(file);
    
    // Create original preview
    const originalDataUrl = await fileToDataUrl(file);
    setOriginalPreview(originalDataUrl);

    try {
      // Get dimensions
      const dimensions = await getImageDimensions(file);
      
      // Enhance and compress
      const { file: enhanced, dataUrl } = await enhanceAndCompressImage(file);
      
      setEnhancedFile(enhanced);
      setEnhancedPreview(dataUrl);
      
      // Calculate stats
      const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const enhancedSizeMB = (enhanced.size / (1024 * 1024)).toFixed(2);
      const compressionRatio = ((1 - enhanced.size / file.size) * 100).toFixed(1);
      
      setStats({
        originalSize: `${originalSizeMB}MB`,
        enhancedSize: `${enhancedSizeMB}MB`,
        compressionRatio: `${compressionRatio}%`,
        dimensions: `${dimensions.width}x${dimensions.height}`
      });
      
    } catch (error) {
      console.error('Enhancement failed:', error);
      alert('Failed to enhance image. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const reset = () => {
    setOriginalFile(null);
    setEnhancedFile(null);
    setOriginalPreview(null);
    setEnhancedPreview(null);
    setStats(null);
    setProcessing(false);
  };

  return (
    <div style={{ padding: '16px' }}>
      <IonCard>
        <IonCardContent>
          <h3 style={{ margin: '0 0 16px 0', textAlign: 'center' }}>
            <IonIcon icon={imageOutline} style={{ marginRight: '8px' }} />
            Image Enhancement Demo
          </h3>
          
          {!originalFile ? (
            <div style={{ textAlign: 'center' }}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <IonButton>
                  <IonIcon icon={cameraOutline} slot="start" />
                  Select Image
                </IonButton>
              </label>
              <p style={{ margin: '16px 0 0 0', fontSize: '14px', color: '#666' }}>
                Upload an image to see enhancement and compression in action
              </p>
            </div>
          ) : (
            <div>
              {processing && (
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                  <p>Processing image...</p>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                {originalPreview && (
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Original</h4>
                    <img
                      src={originalPreview}
                      alt="Original"
                      style={{
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }}
                    />
                  </div>
                )}
                
                {enhancedPreview && (
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                      Enhanced & Compressed
                      <IonIcon 
                        icon={checkmarkCircleOutline} 
                        style={{ marginLeft: '8px', color: '#28a745' }} 
                      />
                    </h4>
                    <img
                      src={enhancedPreview}
                      alt="Enhanced"
                      style={{
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }}
                    />
                  </div>
                )}
              </div>
              
              {stats && (
                <div style={{ marginBottom: '16px' }}>
                  <IonItem>
                    <IonLabel>
                      <h3>Image Dimensions</h3>
                      <p>{stats.dimensions}</p>
                    </IonLabel>
                  </IonItem>
                  
                  <IonItem>
                    <IonLabel>
                      <h3>Original Size</h3>
                      <p>{stats.originalSize}</p>
                    </IonLabel>
                  </IonItem>
                  
                  <IonItem>
                    <IonLabel>
                      <h3>Optimized Size</h3>
                      <p>{stats.enhancedSize}</p>
                    </IonLabel>
                    <IonNote slot="end" color="success">
                      -{stats.compressionRatio} smaller
                    </IonNote>
                  </IonItem>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <IonButton fill="outline" onClick={reset}>
                  Try Another
                </IonButton>
                {enhancedFile && (
                  <IonButton 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = enhancedPreview!;
                      link.download = 'enhanced-image.jpg';
                      link.click();
                    }}
                  >
                    Download Enhanced
                  </IonButton>
                )}
              </div>
            </div>
          )}
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default ImageEnhancementDemo;