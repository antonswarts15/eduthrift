import imageCompression from 'browser-image-compression';

export interface ImageEnhancementOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  quality: number;
}

const DEFAULT_OPTIONS: ImageEnhancementOptions = {
  maxSizeMB: 0.3, // 300KB max
  maxWidthOrHeight: 1200,
  useWebWorker: true,
  quality: 0.85
};

export const enhanceAndCompressImage = async (
  file: File,
  options: Partial<ImageEnhancementOptions> = {}
): Promise<{ file: File; dataUrl: string }> => {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    // Enhance image quality first
    const enhancedFile = await enhanceImageQuality(file);
    
    // Then compress to reduce size
    const compressedFile = await imageCompression(enhancedFile, finalOptions);
    
    // Convert to data URL for preview
    const dataUrl = await fileToDataUrl(compressedFile);
    
    return { file: compressedFile, dataUrl };
  } catch (error) {
    console.error('Image enhancement failed:', error);
    // Fallback to original file
    const dataUrl = await fileToDataUrl(file);
    return { file, dataUrl };
  }
};

const enhanceImageQuality = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (!ctx) {
        resolve(file);
        return;
      }
      
      // Apply image enhancements
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Get image data for enhancement
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply brightness and contrast enhancement
      for (let i = 0; i < data.length; i += 4) {
        // Slight brightness increase
        data[i] = Math.min(255, data[i] * 1.05);     // Red
        data[i + 1] = Math.min(255, data[i + 1] * 1.05); // Green
        data[i + 2] = Math.min(255, data[i + 2] * 1.05); // Blue
        
        // Slight contrast increase
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.1 + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.1 + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.1 + 128));
      }
      
      // Put enhanced image data back
      ctx.putImageData(imageData, 0, 0);
      
      // Convert to blob and then to file
      canvas.toBlob((blob) => {
        if (blob) {
          const enhancedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(enhancedFile);
        } else {
          resolve(file);
        }
      }, 'image/jpeg', 0.95);
    };
    
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
};

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload only JPEG or PNG images' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 10MB' };
  }
  
  return { valid: true };
};