import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  quality: number;
}

export const PHOTO_COMPRESSION_SETTINGS = {
  // Item photos (front/back)
  ITEM_PHOTO: {
    maxSizeMB: 0.5,        // 500KB max
    maxWidthOrHeight: 1200, // 1200px max dimension
    useWebWorker: true,
    quality: 0.8           // 80% quality
  },
  
  // Document uploads (ID, proof of address)
  DOCUMENT: {
    maxSizeMB: 0.8,        // 800KB max
    maxWidthOrHeight: 1500, // 1500px max dimension
    useWebWorker: true,
    quality: 0.85          // 85% quality (documents need clarity)
  },
  
  // Profile photos
  PROFILE: {
    maxSizeMB: 0.3,        // 300KB max
    maxWidthOrHeight: 800,  // 800px max dimension
    useWebWorker: true,
    quality: 0.8           // 80% quality
  }
};

export const compressImage = async (
  file: File, 
  type: 'ITEM_PHOTO' | 'DOCUMENT' | 'PROFILE' = 'ITEM_PHOTO'
): Promise<File> => {
  try {
    const options = PHOTO_COMPRESSION_SETTINGS[type];
    
    console.log(`Compressing ${type}:`, {
      originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      settings: options
    });
    
    const compressedFile = await imageCompression(file, options);
    
    console.log(`Compression complete:`, {
      originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      compressedSize: `${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
      reduction: `${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`
    });
    
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image. Please try a different photo.');
  }
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select an image file' };
  }
  
  // Check file size (before compression)
  const maxSizeMB = 10; // 10MB max before compression
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `Image too large. Maximum ${maxSizeMB}MB allowed` };
  }
  
  // Check file format
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }
  
  return { valid: true };
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};