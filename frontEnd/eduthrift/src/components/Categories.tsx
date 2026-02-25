import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBackButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonInput,
  IonRadioGroup,
  IonRadio,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonModal,
  IonToggle,
  IonToast,
    IonAccordion,
    IonAccordionGroup
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';
import { useCartStore } from '../stores/cartStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useListingsStore } from '../stores/listingsStore';
import { useToast } from '../hooks/useToast';
import { enhanceAndCompressImage, validateImageFile } from '../utils/imageEnhancer';
import { useWishlistStore } from '../stores/wishlistStore';
import { useUserStore } from '../stores/userStore';
import { useAuthPromptStore } from '../stores/authPromptStore';
import SellerVerification from './SellerVerification';
import * as SportEquipmentComponents from './sportingEquipmentComponent';
import SchoolUniformComponent from './schoolUniformComponent/SchoolUniformComponent';
import ClubClothingComponent from './clubClothingComponent/ClubClothingComponent';
import Stationery from './stationeryComponent/Stationery';
import SchoolGradesComponent from './schoolGradesComponent/SchoolGradesComponent';
import BeltsBagsShoesComponent from './beltsBagsShoesComponent/BeltsBagsShoesComponent';
import TrainingWearComponent from './trainingWearComponent/TrainingWearComponent';
import MatricDanceComponent from './matricDanceComponent/MatricDanceComponent';
import ItemsList from './ItemsList';
import {
  shirtOutline,
  footballOutline,
  fitnessOutline,
  basketballOutline,
  libraryOutline,
  pencilOutline,
  roseOutline,
  schoolOutline,
  ribbonOutline,
  businessOutline,
  diamondOutline,
  glassesOutline,
  bagOutline,
  briefcaseOutline,
  giftOutline,
  walletOutline,
  watchOutline,
  extensionPuzzleOutline,
  footstepsOutline,
  tennisballOutline,
  bicycleOutline,
  boatOutline,
  waterOutline,
  snowOutline,
  musicalNotesOutline,
  gameControllerOutline,
  atOutline,
  constructOutline,
  manOutline,
  homeOutline,
  bowlingBallOutline,
  golfOutline,
  searchOutline,
  closeOutline,
  cameraOutline,
  cropOutline,
  peopleOutline,
  shieldCheckmarkOutline,
  documentOutline,
  checkmarkCircle,
  trashOutline,
  eyeOutline,
  checkmarkOutline,
  listOutline
} from 'ionicons/icons';
import SchoolSelector from './SchoolSelector';
import ClubSelector from './ClubSelector';

const CropModal: React.FC<{ 
  isOpen: boolean, 
  onClose: () => void, 
  imageSrc: string | null,
  onSave: (croppedImage: string) => void 
}> = ({ isOpen, onClose, imageSrc, onSave }) => {
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, width: 300, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  React.useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        // Reset crop area to center when new image loads
        const centerX = Math.max(0, (img.width - 300) / 2);
        const centerY = Math.max(0, (img.height - 400) / 2);
        setCropArea({ x: centerX, y: centerY, width: 300, height: 400 });
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);
  
  const handleCrop = () => {
    if (!imageSrc) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate scale factor between displayed image and actual image
      const displayedImg = document.querySelector('img[alt="Crop preview"]') as HTMLImageElement;
      const scaleX = img.naturalWidth / displayedImg.offsetWidth;
      const scaleY = img.naturalHeight / displayedImg.offsetHeight;
      
      // Apply scale to crop area
      const scaledCropArea = {
        x: cropArea.x * scaleX,
        y: cropArea.y * scaleY,
        width: cropArea.width * scaleX,
        height: cropArea.height * scaleY
      };
      
      canvas.width = scaledCropArea.width;
      canvas.height = scaledCropArea.height;
      
      if (!ctx) return;
      
      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(
        img,
        scaledCropArea.x, scaledCropArea.y, scaledCropArea.width, scaledCropArea.height,
        0, 0, scaledCropArea.width, scaledCropArea.height
      );
      
      // Use higher quality for cropped image
      const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
      onSave(croppedImage);
      onClose();
    };
    
    img.src = imageSrc;
  };
  
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Crop Image</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
              Drag the blue area to crop your image
            </p>
          </div>
          
          {imageSrc && (
            <div style={{ 
              position: 'relative', 
              display: 'inline-block', 
              margin: '0 auto',
              maxWidth: '100%',
              overflow: 'hidden'
            }}>
              <img 
                src={imageSrc} 
                alt="Crop preview" 
                style={{ 
                  width: '100%',
                  maxWidth: '400px',
                  height: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }} 
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  const rect = img.getBoundingClientRect();
                  setImageSize({ width: rect.width, height: rect.height });
                }}
              />
              <div 
                style={{
                  position: 'absolute',
                  left: Math.min(cropArea.x, imageSize.width - cropArea.width),
                  top: Math.min(cropArea.y, imageSize.height - cropArea.height),
                  width: Math.min(cropArea.width, imageSize.width),
                  height: Math.min(cropArea.height, imageSize.height),
                  border: '3px solid #3880ff',
                  backgroundColor: 'rgba(56, 128, 255, 0.2)',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  borderRadius: '4px'
                }}
                onMouseDown={(e) => {
                  setIsDragging(true);
                  const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                  setDragStart({ 
                    x: e.clientX - rect.left - cropArea.x, 
                    y: e.clientY - rect.top - cropArea.y 
                  });
                }}
                onMouseMove={(e) => {
                  if (isDragging) {
                    const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                    const newX = Math.max(0, Math.min(imageSize.width - cropArea.width, e.clientX - rect.left - dragStart.x));
                    const newY = Math.max(0, Math.min(imageSize.height - cropArea.height, e.clientY - rect.top - dragStart.y));
                    setCropArea({ ...cropArea, x: newX, y: newY });
                  }
                }}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
              >
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#3880ff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                  pointerEvents: 'none'
                }}>
                  Crop Area
                </div>
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
            <IonButton fill="outline" onClick={onClose}>
              Cancel
            </IonButton>
            <IonButton onClick={handleCrop}>
              <IonIcon icon={cropOutline} slot="start" />
              Crop & Save
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

interface CategoriesProps {
  onCategorySelect?: (category: string, subcategory?: string, sport?: string, item?: string) => void;
  userType?: 'seller' | 'buyer';
}

const Categories: React.FC<CategoriesProps> = ({ onCategorySelect, userType = 'seller' }) => {
  const history = useHistory();
  const { addToCart } = useCartStore();
  const { addNotification } = useNotificationStore();
  const { addListing, listings } = useListingsStore();
  const { checkForMatches } = useWishlistStore();
  const { isSellerVerified, userProfile, updateProfile, fetchUserProfile } = useUserStore();
  const { showPrompt: showAuthPrompt } = useAuthPromptStore();
  const { isOpen: showToast, message: toastMessage, color: toastColor, showToast: displayToast, hideToast } = useToast();
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Calculate item counts per category
  const getCategoryCount = (categoryName: string): number => {
    return listings.filter(listing =>
      listing.category === categoryName && !listing.soldOut && listing.quantity > 0
    ).length;
  };
  const [currentLevel, setCurrentLevel] = useState('main');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [showSportEquipment, setShowSportEquipment] = useState(false);
  const [showSchoolSelection, setShowSchoolSelection] = useState(false);
  const [showClubClothing, setShowClubClothing] = useState(false);
  const [showStationery, setShowStationery] = useState(false);
  const [showSchoolGrades, setShowSchoolGrades] = useState(false);
  const [showBeltsBagsShoes, setShowBeltsBagsShoes] = useState(false);
  const [showTrainingWear, setShowTrainingWear] = useState(false);
  const [showMatricDance, setShowMatricDance] = useState(false);
  
  // Item details state
  const [gender, setGender] = useState('');
  const [size, setSize] = useState('');
  const [condition, setCondition] = useState<number | undefined>();
  const [sellingPrice, setSellingPrice] = useState('');
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [backPhoto, setBackPhoto] = useState<File | null>(null);
  const [frontPhotoPreview, setFrontPhotoPreview] = useState<string | null>(null);
  const [backPhotoPreview, setBackPhotoPreview] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [currentPhotoType, setCurrentPhotoType] = useState<'front' | 'back'>('front');
  // Anti-theft verification documents
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [idDocumentPreview, setIdDocumentPreview] = useState<string | null>(null);
  const [proofOfAddress, setProofOfAddress] = useState<File | null>(null);
  const [proofOfAddressPreview, setProofOfAddressPreview] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState('');
  const [clubName, setClubName] = useState('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [useNearbyLocation, setUseNearbyLocation] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customItemType, setCustomItemType] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [showCustomInputs, setShowCustomInputs] = useState(false);

  // Preview & submission state
  const [showPreview, setShowPreview] = useState(false);
  const [previewListing, setPreviewListing] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessConfirmation, setShowSuccessConfirmation] = useState(false);
  const [submittedListing, setSubmittedListing] = useState<any>(null);

  const resetForm = () => {
    setShowItemDetails(false);
    setSelectedItem('');
    setGender('');
    setSize('');
    setCondition(undefined);
    setSellingPrice('');
    setFrontPhoto(null);
    setBackPhoto(null);
    setFrontPhotoPreview(null);
    setBackPhotoPreview(null);
    setIdDocument(null);
    setIdDocumentPreview(null);
    setProofOfAddress(null);
    setProofOfAddressPreview(null);
    setCurrentLevel('main');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedSport('');
    setSchoolName('');
    setClubName('');
    setSelectedProvince('');
    setSelectedTown('');
    setCustomCategory('');
    setCustomItemType('');
    setCustomBrand('');
    setShowCustomInputs(false);
    setUseNearbyLocation(false);
    setShowPreview(false);
    setPreviewListing(null);
    setIsSubmitting(false);
    setShowSuccessConfirmation(false);
    setSubmittedListing(null);
  };

  // Clear all state when component unmounts
  useEffect(() => {
    return () => {
      resetForm();
      setShowSportEquipment(false);
      setShowSchoolSelection(false);
      setShowClubClothing(false);
      setShowStationery(false);
      setShowSchoolGrades(false);
      setShowBeltsBagsShoes(false);
      setShowTrainingWear(false);
      setShowMatricDance(false);
      setShowLocationSearch(false);
    };
  }, []);

  const handleFileChange = async (file: File | null, setPhoto: (file: File | null) => void, setPreview: (preview: string | null) => void, photoType: 'front' | 'back') => {
    if (!file) {
      setPhoto(null);
      setPreview(null);
      return;
    }
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    
    try {
      // Show crop modal for user to crop before processing
      const reader = new FileReader();
      reader.onload = (event) => {
        setCropImageSrc(event.target?.result as string);
        setCurrentPhotoType(photoType);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image processing failed:', error);
      alert('Failed to process image. Please try again.');
    }
  };

  const removePhoto = (setPhoto: (file: File | null) => void, setPreview: (preview: string | null) => void) => {
    setPhoto(null);
    setPreview(null);
  };

  const openCamera = (photoType: 'front' | 'back') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileChange(file,
          photoType === 'front' ? setFrontPhoto : setBackPhoto,
          photoType === 'front' ? setFrontPhotoPreview : setBackPhotoPreview,
          photoType
        );
      }
    };
    input.click();
  };

  // Document upload handlers
  const handleDocumentUpload = (docType: 'id' | 'address') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
          alert('Please upload a JPEG, PNG, or PDF file');
          return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB');
          return;
        }

        try {
          const reader = new FileReader();
          reader.onload = (event) => {
            const preview = event.target?.result as string;
            if (docType === 'id') {
              setIdDocument(file);
              setIdDocumentPreview(preview);
            } else {
              setProofOfAddress(file);
              setProofOfAddressPreview(preview);
            }
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Document upload failed:', error);
          alert('Failed to upload document. Please try again.');
        }
      }
    };
    input.click();
  };

  const removeDocument = (docType: 'id' | 'address') => {
    if (docType === 'id') {
      setIdDocument(null);
      setIdDocumentPreview(null);
    } else {
      setProofOfAddress(null);
      setProofOfAddressPreview(null);
    }
  };

  const mainCategories = [
    { name: 'School & sport uniform', icon: schoolOutline },
    { name: 'Club clothing', icon: shirtOutline },
    { name: 'Training wear', icon: fitnessOutline },
    { name: 'Belts, bags & shoes', icon: bagOutline },
    { name: 'Sports equipment', icon: basketballOutline },
    { name: 'Textbooks', icon: libraryOutline },
    { name: 'Stationery', icon: pencilOutline },
    { name: 'Matric dance clothing', icon: roseOutline }
  ];

  const uniformTypes = ['School Uniform', 'Sports Uniform'];

  const schoolUniformItems = [
    { name: "Shirt short sleeve", icon: shirtOutline },
    { name: "Shirt long sleeve", icon: shirtOutline },
    { name: "Short pants", icon: fitnessOutline },
    { name: "Long pants", icon: fitnessOutline },
    { name: "Tie", icon: ribbonOutline },
    { name: "Skirt", icon: diamondOutline },
    { name: "Dress", icon: roseOutline },
    { name: "Jersey", icon: shirtOutline },
    { name: "Pullover", icon: shirtOutline },
    { name: "Blazer", icon: businessOutline },
    { name: "Skarf", icon: ribbonOutline },
    { name: "Hat", icon: glassesOutline },
    { name: "Socks", icon: footstepsOutline },
    { name: "Windbreaker", icon: shirtOutline },
    { name: "Drimac", icon: shirtOutline },
    { name: "Tracksuit", icon: fitnessOutline },
    { name: "Belt", icon: ribbonOutline },
    { name: "Suitcase", icon: briefcaseOutline },
    { name: "School shoes", icon: footstepsOutline },
    { name: "Backpack", icon: bagOutline },
    { name: "Sportsbag", icon: bagOutline },
    { name: "Lunchbag", icon: giftOutline },
    { name: "Duffelbag", icon: bagOutline },
    { name: "Totebag", icon: bagOutline },
    { name: "Bowtie", icon: ribbonOutline },
    { name: "Accessories", icon: extensionPuzzleOutline }
  ];

  const sportCategories = {
    'Team Sports': {
      sports: [
        { name: "Rugby", icon: footballOutline },
        { name: "Football", icon: footballOutline },
        { name: "Netball", icon: basketballOutline },
        { name: "Hockey", icon: constructOutline },
        { name: "Basketball", icon: basketballOutline },
        { name: "Cricket", icon: constructOutline },
        { name: "Volleyball", icon: basketballOutline },
        { name: "Waterpolo", icon: waterOutline },
        { name: "Korfbal", icon: basketballOutline },
        { name: "Baseball", icon: footballOutline },
        { name: "Softball", icon: footballOutline },
        { name: "Ringball", icon: basketballOutline }
      ],
      icon: peopleOutline,
      color: '#E74C3C'
    },
    'Racket Sports': {
      sports: [
        { name: "Tennis", icon: tennisballOutline },
        { name: "Squash", icon: tennisballOutline },
        { name: "Tabletennis", icon: tennisballOutline },
        { name: "Badminton", icon: tennisballOutline },
        { name: "Padel", icon: tennisballOutline },
        { name: "Ring tennis", icon: tennisballOutline }
      ],
      icon: tennisballOutline,
      color: '#3498DB'
    },
    'Water Sports': {
      sports: [
        { name: "Swimming", icon: waterOutline },
        { name: "Diving", icon: waterOutline },
        { name: "Rowing", icon: boatOutline },
        { name: "Waterpolo", icon: waterOutline }
      ],
      icon: waterOutline,
      color: '#1ABC9C'
    },
    'Individual Sports': {
      sports: [
        { name: "Athletics", icon: fitnessOutline },
        { name: "Crosscountry", icon: fitnessOutline },
        { name: "Golf", icon: golfOutline },
        { name: "Gymnastics", icon: fitnessOutline },
        { name: "Boxing", icon: fitnessOutline },
        { name: "Triathlon", icon: fitnessOutline },
        { name: "Archery", icon: atOutline },
        { name: "Target shooting", icon: atOutline }
      ],
      icon: fitnessOutline,
      color: '#27AE60'
    },
    'Cycling & Skating': {
      sports: [
        { name: "Mountainbike", icon: bicycleOutline },
        { name: "Roadbike", icon: bicycleOutline },
        { name: "Rollerskating", icon: footstepsOutline },
        { name: "Ice skating", icon: snowOutline },
        { name: "Ice hockey", icon: snowOutline }
      ],
      icon: bicycleOutline,
      color: '#8E44AD'
    },
    'Other Sports': {
      sports: [
        { name: "Dancing", icon: musicalNotesOutline },
        { name: "Ballet", icon: musicalNotesOutline },
        { name: "Rock climbing", icon: manOutline },
        { name: "Horse riding", icon: homeOutline },
        { name: "Chess", icon: extensionPuzzleOutline },
        { name: "Robotics", icon: constructOutline },
        { name: "Jukskei", icon: gameControllerOutline },
        { name: "Bowling", icon: gameControllerOutline }
      ],
      icon: extensionPuzzleOutline,
      color: '#F39C12'
    }
  };



  const handleMainCategoryClick = (category: string) => {
    setSelectedCategory(category);
    if (category === 'School & sport uniform') {
      setShowSchoolSelection(true);
    } else if (category === 'Club clothing') {
      setShowClubClothing(true);
    } else if (category === 'Belts, bags & shoes') {
      if (userType === 'buyer') {
        setShowBeltsBagsShoes(true);
      } else {
        setShowItemDetails(true);
      }
    } else if (category === 'Training wear') {
      if (userType === 'buyer') {
        setShowTrainingWear(true);
      } else {
        setShowItemDetails(true);
      }
    } else if (category === 'Textbooks') {
      setShowSchoolGrades(true);
    } else if (category === 'Stationery') {
      setShowStationery(true);
    } else if (category === 'Sports equipment') {
      setCurrentLevel('sportEquipment');
    } else if (category === 'Matric dance clothing') {
      if (userType === 'buyer') {
        setShowMatricDance(true);
      } else {
        setShowItemDetails(true);
      }
    } else if (['Training wear & shoes'].includes(category)) {
      setSelectedSubcategory(category);
      setShowItemDetails(true);
    } else {
      onCategorySelect?.(category);
    }
  };

  const handleUniformTypeClick = (type: string) => {
    setSelectedSubcategory(type);
    if (type === 'Sports Uniform') {
      setCurrentLevel('sport');
    } else if (type === 'School Uniform') {
      setCurrentLevel('schoolItems');
    } else {
      onCategorySelect?.(selectedCategory, type);
    }
  };

  const handleSportTypeClick = (sport: string) => {
    setSelectedSport(sport);
    setShowSportEquipment(true);
  };



  const handleSchoolItemClick = (item: string) => {
    if (!schoolName && selectedCategory === 'School & sport uniform') {
      alert('Please select a school first');
      return;
    }
    setSelectedItem(item);
    if (userType === 'buyer') {
      // For buyers, show available items first, then details if they want to see more
      setShowItemDetails(true);
    } else {
      // For sellers, go straight to item details form
      setShowItemDetails(true);
    }
  };

  const goBack = () => {
    // Handle preview/success states first
    if (showSuccessConfirmation) {
      resetForm();
      return;
    }
    if (showPreview) {
      setShowPreview(false);
      return;
    }
    // Clear relevant state when going back
    if (showSportEquipment) {
      setShowSportEquipment(false);
      setSelectedSport('');
    } else if (showItemDetails) {
      setShowItemDetails(false);
      setSelectedItem('');
      // Clear form state
      setGender('');
      setSize('');
      setCondition(undefined);
      setSellingPrice('');
      setFrontPhoto(null);
      setBackPhoto(null);
      setFrontPhotoPreview(null);
      setBackPhotoPreview(null);
    } else if (showLocationSearch) {
      setShowLocationSearch(false);
      setCurrentLevel('main');
      setSelectedCategory('');
      setSelectedProvince('');
      setSelectedTown('');
      setUseNearbyLocation(false);
    } else if (showClubClothing) {
      setShowClubClothing(false);
      setCurrentLevel('main');
      setSelectedCategory('');
      setClubName('');
    } else if (showBeltsBagsShoes) {
      setShowBeltsBagsShoes(false);
      setCurrentLevel('main');
      setSelectedCategory('');
    } else if (showTrainingWear) {
      setShowTrainingWear(false);
      setCurrentLevel('main');
      setSelectedCategory('');
    } else if (showMatricDance) {
      setShowMatricDance(false);
      setCurrentLevel('main');
      setSelectedCategory('');
    } else if (showStationery) {
      setShowStationery(false);
      setCurrentLevel('main');
      setSelectedCategory('');
    } else if (showSchoolGrades) {
      setShowSchoolGrades(false);
      setCurrentLevel('main');
      setSelectedCategory('');
    } else if (showSchoolSelection) {
      setShowSchoolSelection(false);
      setCurrentLevel('main');
      setSelectedCategory('');
      setSchoolName('');
    } else if (currentLevel === 'schoolItems') {
      setCurrentLevel('uniform');
      setSelectedSubcategory('');
    } else if (currentLevel === 'sport') {
      setCurrentLevel('uniform');
      setSelectedSubcategory('');
    } else if (currentLevel === 'sportEquipment') {
      setCurrentLevel('main');
      setSelectedCategory('');
    } else if (currentLevel === 'uniform') {
      setShowSchoolSelection(true);
      setSelectedSubcategory('');
    }
  };

  const handleVerificationComplete = () => {
    updateProfile({
      sellerVerification: {
        ...userProfile?.sellerVerification,
        status: 'pending',
        submittedAt: new Date().toISOString()
      }
    });
    setShowVerificationModal(false);
    displayToast('Verification documents submitted. Please wait for admin approval before listing.', 'warning');
  };

  const handleShowPreview = () => {
    if (!isLoggedIn()) {
      showAuthPrompt(userType === 'seller' ? 'list your item for sale' : 'add items to your cart');
      return;
    }

    // For sellers: check verification status
    if (userType === 'seller' && !isSellerVerified()) {
      const verificationStatus = userProfile?.sellerVerification?.status;
      if (verificationStatus === 'pending') {
        displayToast('Your verification is still under review. Please wait for admin approval.', 'warning');
        return;
      }
      setShowVerificationModal(true);
      return;
    }

    // Validation: Check if school/club is selected when required
    if (selectedCategory === 'School & sport uniform' && !schoolName) {
      alert('Please select a school first');
      return;
    }

    if (selectedCategory === 'Club clothing' && !clubName) {
      alert('Please enter a club name first');
      return;
    }

    // Validation: Check item name for generic categories
    if (!selectedItem && !customItemType) {
      alert('Please enter an item name');
      return;
    }

    // Validation: Check required fields
    const missingFields = [];
    if (!gender) missingFields.push('Gender');
    if (!size) missingFields.push('Size');
    if (!condition) missingFields.push('Condition');
    if (userType === 'seller' && !sellingPrice) missingFields.push('Selling Price');

    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validation: Check photos for sellers
    if (userType === 'seller') {
      if (!frontPhoto && !frontPhotoPreview) {
        alert('Please upload a front photo of the item (JPEG or PNG format)');
        return;
      }
      if (!backPhoto && !backPhotoPreview) {
        alert('Please upload a back photo of the item (JPEG or PNG format)');
        return;
      }
      if (!idDocument && !idDocumentPreview) {
        alert('Please upload a copy of your ID document to verify this item is not stolen');
        return;
      }
      if (!proofOfAddress && !proofOfAddressPreview) {
        alert('Please upload proof of address to verify this item is not stolen');
        return;
      }
    }

    if (userType === 'seller') {
      // Build preview listing
      const itemName = selectedItem || customItemType;
      const brandInfo = customBrand ? ` - ${customBrand}` : '';
      const listing = {
        id: Date.now().toString(),
        name: itemName,
        description: `${itemName}${brandInfo} from ${schoolName || clubName || selectedCategory || 'Unknown'}`,
        price: parseInt(sellingPrice),
        condition: condition!,
        school: schoolName || clubName || 'Unknown',
        size: size,
        gender: gender,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        sport: selectedSport,
        frontPhoto: frontPhotoPreview || '',
        backPhoto: backPhotoPreview || '',
        dateCreated: new Date().toLocaleDateString(),
        quantity: 1,
        sellerIdDocument: idDocumentPreview || undefined,
        sellerProofOfAddress: proofOfAddressPreview || undefined,
        verificationStatus: 'pending' as const,
        item_name: itemName,
        school_name: schoolName,
        club_name: clubName
      };
      setPreviewListing(listing);
      setShowPreview(true);
    } else {
      // Buyer flow — add to cart directly
      const buyerItemName = selectedItem || customItemType;
      const cartItem = {
        id: Date.now().toString(),
        name: buyerItemName,
        description: `${buyerItemName} from ${schoolName || clubName || 'Unknown'}`,
        price: Math.floor(Math.random() * 200) + 50,
        condition: condition!,
        school: schoolName || clubName || 'Unknown',
        size: size,
        gender: gender,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        sport: selectedSport,
        frontPhoto: 'Front Photo',
        backPhoto: 'Back Photo'
      };

      addToCart(cartItem, displayToast);
      addNotification('Item Added to Cart', `${buyerItemName} has been added to your cart`);
    }
  };

  const handleConfirmListing = async () => {
    if (!previewListing) return;
    setIsSubmitting(true);

    try {
      await addListing(previewListing, (newListing) => checkForMatches(newListing, addNotification));
      addNotification('Item Listed', `${previewListing.name} has been listed for sale`);
      setSubmittedListing(previewListing);
      setShowPreview(false);
      setShowSuccessConfirmation(true);
    } catch (error: any) {
      displayToast(error.message || 'Failed to list item. Please try again.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderGrid = (items: any[], onItemClick: (item: string) => void, hasIcons = false) => {
    const isDarkTheme = false; // Force light theme
    
    // Darker rainbow colors array for better text contrast
    const rainbowColors = [
      '#E74C3C', // Darker Red
      '#16A085', // Darker Teal
      '#2980B9', // Darker Blue
      '#27AE60', // Darker Green
      '#F39C12', // Darker Yellow/Orange
      '#8E44AD', // Darker Purple
      '#1ABC9C', // Darker Mint
      '#E67E22', // Darker Orange
      '#9B59B6', // Darker Purple
      '#3498DB', // Darker Blue
      '#D35400', // Darker Orange
      '#229954'  // Darker Green
    ];
    
    return (
      <IonGrid>
        <IonRow>
          {items.map((item, index) => (
            <IonCol size="6" key={index}>
              <IonCard 
                button 
                onClick={() => onItemClick(hasIcons ? item.name : item)}
                style={{
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  const color = rainbowColors[index % rainbowColors.length];
                  e.currentTarget.style.border = `2px solid ${color}40`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <IonCardContent style={{ 
                  textAlign: 'center', 
                  padding: '16px', 
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {hasIcons && (
                    <IonIcon 
                      icon={item.icon} 
                      style={{ 
                        fontSize: '70px', 
                        color: rainbowColors[index % rainbowColors.length], 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)', 
                        zIndex: 1,
                        strokeWidth: '0.3px',
                        opacity: 0.25,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                      }} 
                    />
                  )}
                  <div style={{ 
                    position: 'relative', 
                    zIndex: 2, 
                    fontWeight: 'bold', 
                    color: isDarkTheme ? '#e0e0e0' : '#333',
                    fontSize: '14px',
                    lineHeight: '1.2',
                    textAlign: 'center',
                    wordWrap: 'break-word',
                    hyphens: 'auto'
                  }}>
                    {hasIcons ? item.name : item}
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          ))}
        </IonRow>
      </IonGrid>
    );
  };

  return (
    <div>
      {(currentLevel !== 'main' || showItemDetails || showSportEquipment || showSchoolSelection || showClubClothing || showBeltsBagsShoes || showTrainingWear || showMatricDance || showStationery || showSchoolGrades || showLocationSearch || showPreview || showSuccessConfirmation) && (
        <div style={{ marginBottom: '16px' }}>
          {!showSuccessConfirmation && (
            <IonButton fill="clear" onClick={goBack}>
              ← Back
            </IonButton>
          )}
          <h2 style={{ margin: '8px 0' }}>
            {showSuccessConfirmation && 'Listing Confirmed!'}
            {showPreview && !showSuccessConfirmation && 'Preview Your Listing'}
            {showItemDetails && !showPreview && !showSuccessConfirmation && 'Item Details'}
            {showSchoolSelection && 'Select School'}
            {showClubClothing && 'Club Clothing'}
            {showBeltsBagsShoes && 'Belts, Bags & Shoes'}
            {showTrainingWear && 'Training Wear'}
            {showMatricDance && 'Matric Dance Clothing'}
            {showStationery && 'Stationery'}
            {showSchoolGrades && 'School Textbooks'}
            {showLocationSearch && `${selectedCategory} - Location & Details`}
            {currentLevel === 'uniform' && !showPreview && !showSuccessConfirmation && 'Select Uniform Type'}
            {currentLevel === 'sport' && !showPreview && !showSuccessConfirmation && 'Select Sport Type'}
            {currentLevel === 'schoolItems' && !showPreview && !showSuccessConfirmation && 'Select School Item'}
          </h2>
        </div>
      )}

      {/* Success Confirmation Screen */}
      {showSuccessConfirmation && submittedListing ? (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <IonIcon icon={checkmarkCircle} style={{ fontSize: '64px', color: '#28a745' }} />
            <h3 style={{ color: '#155724', margin: '12px 0 8px' }}>Item Listed Successfully!</h3>
            <p style={{ color: '#155724', margin: 0 }}>
              Your <strong>{submittedListing.name}</strong> has been listed for <strong>R{submittedListing.price}</strong>.
            </p>
          </div>

          {/* Quick summary */}
          <IonCard>
            <IonCardContent>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '12px' }}>
                {submittedListing.frontPhoto && (
                  <img src={submittedListing.frontPhoto} alt="Front" style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
                )}
                {submittedListing.backPhoto && (
                  <img src={submittedListing.backPhoto} alt="Back" style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
                )}
              </div>
              <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>{submittedListing.name}</strong></p>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>{submittedListing.school}</p>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>R{submittedListing.price} | Size: {submittedListing.size} | {submittedListing.gender}</p>
            </IonCardContent>
          </IonCard>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
            <IonButton fill="outline" onClick={() => resetForm()}>
              List Another Item
            </IonButton>
            <IonButton onClick={() => history.push('/profile/listings')}>
              <IonIcon icon={listOutline} slot="start" />
              View My Listings
            </IonButton>
          </div>
        </div>

      ) : showPreview && previewListing ? (
        /* Preview Screen */
        <div style={{ padding: '16px' }}>
          <IonCard>
            <IonCardContent>
              {/* Photo display */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
                {previewListing.frontPhoto && (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#666' }}>Front</p>
                    <img src={previewListing.frontPhoto} alt="Front" style={{ width: '120px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
                  </div>
                )}
                {previewListing.backPhoto && (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#666' }}>Back</p>
                    <img src={previewListing.backPhoto} alt="Back" style={{ width: '120px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
                  </div>
                )}
              </div>

              {/* Details */}
              <h3 style={{ margin: '0 0 8px', textAlign: 'center' }}>{previewListing.name}</h3>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#666' }}>Category</span>
                  <span style={{ fontWeight: 'bold' }}>
                    {previewListing.category}
                    {previewListing.subcategory ? ` > ${previewListing.subcategory}` : ''}
                    {previewListing.sport ? ` > ${previewListing.sport}` : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#666' }}>School / Club</span>
                  <span style={{ fontWeight: 'bold' }}>{previewListing.school}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#666' }}>Gender</span>
                  <span>{previewListing.gender}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#666' }}>Size</span>
                  <span>{previewListing.size}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#666' }}>Condition</span>
                  <span>Grade {previewListing.condition} — {
                    previewListing.condition === 1 ? 'Brand new' :
                    previewListing.condition === 2 ? 'Like new' :
                    previewListing.condition === 3 ? 'Frequently used' :
                    'Used and worn'
                  }</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#666' }}>Price</span>
                  <span style={{ fontWeight: 'bold', color: '#27AE60', fontSize: '18px' }}>R{previewListing.price}</span>
                </div>
              </div>

              {/* Anti-theft docs indicator */}
              {(previewListing.sellerIdDocument || previewListing.sellerProofOfAddress) && (
                <div style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  backgroundColor: '#d4edda',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#155724' }} />
                  <span style={{ fontSize: '13px', color: '#155724' }}>Anti-theft verification documents attached</span>
                </div>
              )}
            </IonCardContent>
          </IonCard>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <IonButton fill="outline" expand="block" style={{ flex: 1 }} onClick={() => setShowPreview(false)}>
              Edit
            </IonButton>
            <IonButton expand="block" style={{ flex: 1 }} onClick={handleConfirmListing} disabled={isSubmitting}>
              <IonIcon icon={checkmarkOutline} slot="start" />
              {isSubmitting ? 'Submitting...' : 'Confirm Listing'}
            </IonButton>
          </div>
        </div>

      ) : showItemDetails ? (
        <div style={{ padding: '16px' }}>
          {userType === 'buyer' && (
            <ItemsList 
              category={selectedCategory}
              subcategory={selectedSubcategory}
              sport={selectedSport}
              itemName={selectedItem}
            />
          )}
          {schoolName && (
            <div style={{ 
              marginBottom: '20px', 
              textAlign: 'center', 
              backgroundColor: 'rgba(52, 152, 219, 0.1)', 
              border: '2px solid #3498DB', 
              borderRadius: '12px', 
              padding: '16px' 
            }}>
              <IonIcon 
                icon={schoolOutline} 
                style={{ 
                  fontSize: '32px', 
                  color: '#3498DB', 
                  marginBottom: '8px' 
                }} 
              />
              <h2 style={{ 
                margin: '0', 
                color: '#3498DB', 
                fontSize: '18px', 
                fontWeight: 'bold' 
              }}>
                {schoolName}
              </h2>
              <p style={{ 
                margin: '4px 0 0 0', 
                color: '#666', 
                fontSize: '14px' 
              }}>
                Selected School
              </p>
            </div>
          )}
          {selectedItem ? (
            <IonItem>
              <IonLabel><strong>Selected Item:</strong> {selectedItem}</IonLabel>
            </IonItem>
          ) : (
            <IonItem style={{ marginBottom: '16px' }}>
              <IonInput
                label="Item Name *"
                labelPlacement="stacked"
                value={customItemType}
                onIonChange={e => setCustomItemType(e.detail.value!)}
                placeholder="e.g. Nike Running Shoes, Adidas Training Shorts"
              />
            </IonItem>
          )}
          {!selectedItem && userType === 'seller' && (
            <IonItem style={{ marginBottom: '16px' }}>
              <IonInput
                label="Brand (optional)"
                labelPlacement="stacked"
                value={customBrand}
                onIonChange={e => setCustomBrand(e.detail.value!)}
                placeholder="e.g. Nike, Adidas, Puma"
              />
            </IonItem>
          )}
          

          
          {isPhotoModalOpen && (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => {
                setIsPhotoModalOpen(false);
                setZoomedImage(null);
              }}
            >
              <div 
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: '20px',
                  maxWidth: '90%',
                  maxHeight: '90%',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#666',
                    zIndex: 10
                  }}
                  onClick={() => {
                    setIsPhotoModalOpen(false);
                    setZoomedImage(null);
                  }}
                >
                  ×
                </button>
                <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>
                  {zoomedImage ? 'Photo Preview' : (currentPhotoType === 'front' ? 'Front Photo' : 'Back Photo')}
                </h3>
                {zoomedImage ? (
                  <img 
                    src={zoomedImage}
                    alt="Zoomed photo"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '70vh',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '300px',
                    height: '400px',
                    backgroundColor: '#f5f5f5',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: '#666'
                  }}>
                    {userType === 'seller' ? 'No photo uploaded yet' : 'Photo not available'}
                  </div>
                )}
              </div>
            </div>
          )}
          

          
          {selectedCategory === 'Club clothing' && (
            <IonItem style={{ marginBottom: '16px' }}>
              <IonInput label="Club Name" labelPlacement="stacked" value={clubName} onIonChange={e => setClubName(e.detail.value!)} />
            </IonItem>
          )}
          
          <IonItem style={{ marginBottom: '16px' }}>
            <IonLabel position="stacked">Gender *</IonLabel>
            <IonRadioGroup value={gender} onIonChange={e => setGender(e.detail.value)}>
              <IonItem><IonLabel>Boy</IonLabel><IonRadio value="Boy" /></IonItem>
              <IonItem><IonLabel>Girl</IonLabel><IonRadio value="Girl" /></IonItem>
              <IonItem><IonLabel>Unisex</IonLabel><IonRadio value="Unisex" /></IonItem>
            </IonRadioGroup>
          </IonItem>

          <IonItem style={{ marginBottom: '16px' }}>
            <IonInput label="Size *" labelPlacement="stacked" value={size} onIonChange={e => setSize(e.detail.value!)} />
          </IonItem>

          <IonItem style={{ marginBottom: '16px' }}>
            <IonLabel position="stacked">Condition Grade *</IonLabel>
            <IonSelect value={condition} onIonChange={e => setCondition(parseInt(e.detail.value))}>
              <IonSelectOption value={1}>1 - Brand new (never been used)</IonSelectOption>
              <IonSelectOption value={2}>2 - Like new but used</IonSelectOption>
              <IonSelectOption value={3}>3 - Frequently used but not damaged</IonSelectOption>
              <IonSelectOption value={4}>4 - Used and worn</IonSelectOption>
            </IonSelect>
          </IonItem>
          
          <div style={{ padding: '8px 16px', fontSize: '12px', color: '#666' }}>
            <strong>Condition Legend:</strong><br/>
            1 - Brand new (never been used)<br/>
            2 - Like new but used<br/>
            3 - Frequently used but not damaged<br/>
            4 - Used and worn
          </div>

          {userType === 'seller' && (
            <>
              <IonItem style={{ marginBottom: '16px' }}>
                <IonInput label="Selling Price (ZAR) *" labelPlacement="stacked" type="number" value={sellingPrice} onIonChange={e => setSellingPrice(e.detail.value!)} />
              </IonItem>

              <IonItem style={{ marginBottom: '16px' }}>
                <IonLabel position="stacked">Front Photo * (JPEG/PNG only)</IonLabel>
                {!frontPhotoPreview ? (
                  <div style={{ marginTop: '8px' }}>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/jpg" 
                      onChange={e => {
                        const file = e.target.files?.[0];
                        handleFileChange(file || null, setFrontPhoto, setFrontPhotoPreview, 'front');
                      }} 
                    />
                    <IonButton 
                      size="small" 
                      fill="outline"
                      onClick={() => openCamera('front')}
                      style={{ marginTop: '8px' }}
                    >
                      <IonIcon icon={cameraOutline} slot="start" />
                      Take Photo
                    </IonButton>
                  </div>
                ) : frontPhotoPreview === 'loading' ? (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '80px', 
                    height: '100px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    marginTop: '8px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>Processing...</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <img 
                      src={frontPhotoPreview} 
                      alt="Front preview" 
                      style={{ 
                        width: '80px', 
                        height: '100px', 
                        objectFit: 'cover', 
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setZoomedImage(frontPhotoPreview);
                        setIsPhotoModalOpen(true);
                      }} 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <IonButton 
                        size="small" 
                        fill="outline" 
                        onClick={() => removePhoto(setFrontPhoto, setFrontPhotoPreview)}
                      >
                        Remove
                      </IonButton>
                      <IonButton 
                        size="small" 
                        fill="solid"
                        onClick={() => openCamera('front')}
                      >
                        <IonIcon icon={cameraOutline} slot="start" />
                        Retake
                      </IonButton>
                    </div>
                  </div>
                )}
              </IonItem>
              
              <IonItem style={{ marginBottom: '16px' }}>
                <IonLabel position="stacked">Back Photo * (JPEG/PNG only)</IonLabel>
                {!backPhotoPreview ? (
                  <div style={{ marginTop: '8px' }}>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/jpg" 
                      onChange={e => {
                        const file = e.target.files?.[0];
                        handleFileChange(file || null, setBackPhoto, setBackPhotoPreview, 'back');
                      }} 
                    />
                    <IonButton 
                      size="small" 
                      fill="outline"
                      onClick={() => openCamera('back')}
                      style={{ marginTop: '8px' }}
                    >
                      <IonIcon icon={cameraOutline} slot="start" />
                      Take Photo
                    </IonButton>
                  </div>
                ) : backPhotoPreview === 'loading' ? (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '80px', 
                    height: '100px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    marginTop: '8px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>Processing...</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <img 
                      src={backPhotoPreview} 
                      alt="Back preview" 
                      style={{ 
                        width: '80px', 
                        height: '100px', 
                        objectFit: 'cover', 
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setZoomedImage(backPhotoPreview);
                        setIsPhotoModalOpen(true);
                      }} 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <IonButton 
                        size="small" 
                        fill="outline" 
                        onClick={() => removePhoto(setBackPhoto, setBackPhotoPreview)}
                      >
                        Remove
                      </IonButton>
                      <IonButton 
                        size="small" 
                        fill="solid"
                        onClick={() => openCamera('back')}
                      >
                        <IonIcon icon={cameraOutline} slot="start" />
                        Retake
                      </IonButton>
                    </div>
                  </div>
                )}
              </IonItem>
            </>
          )}

          {/* Anti-Theft Verification Documents (Sellers Only) */}
          {userType === 'seller' && (
            <>
              <div style={{
                marginTop: '24px',
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>
                  <IonIcon icon={shieldCheckmarkOutline} style={{ marginRight: '8px' }} />
                  Anti-Theft Verification Required
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
                  To ensure items are not stolen, please upload your ID document and proof of address.
                </p>
              </div>

              <IonItem style={{ marginBottom: '16px' }}>
                <IonLabel position="stacked">ID Document * (JPEG/PNG/PDF, max 5MB)</IonLabel>
                {!idDocumentPreview ? (
                  <div style={{ marginTop: '8px' }}>
                    <IonButton
                      size="small"
                      fill="outline"
                      onClick={() => handleDocumentUpload('id')}
                    >
                      <IonIcon icon={documentOutline} slot="start" />
                      Upload ID Document
                    </IonButton>
                  </div>
                ) : (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IonIcon icon={checkmarkCircle} color="success" style={{ fontSize: '24px' }} />
                    <span style={{ color: '#27AE60', fontSize: '14px' }}>ID document uploaded</span>
                    <IonButton
                      size="small"
                      fill="clear"
                      color="danger"
                      onClick={() => removeDocument('id')}
                    >
                      <IonIcon icon={trashOutline} slot="icon-only" />
                    </IonButton>
                  </div>
                )}
              </IonItem>

              <IonItem style={{ marginBottom: '16px' }}>
                <IonLabel position="stacked">Proof of Address * (JPEG/PNG/PDF, max 5MB)</IonLabel>
                {!proofOfAddressPreview ? (
                  <div style={{ marginTop: '8px' }}>
                    <IonButton
                      size="small"
                      fill="outline"
                      onClick={() => handleDocumentUpload('address')}
                    >
                      <IonIcon icon={documentOutline} slot="start" />
                      Upload Proof of Address
                    </IonButton>
                  </div>
                ) : (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IonIcon icon={checkmarkCircle} color="success" style={{ fontSize: '24px' }} />
                    <span style={{ color: '#27AE60', fontSize: '14px' }}>Proof of address uploaded</span>
                    <IonButton
                      size="small"
                      fill="clear"
                      color="danger"
                      onClick={() => removeDocument('address')}
                    >
                      <IonIcon icon={trashOutline} slot="icon-only" />
                    </IonButton>
                  </div>
                )}
              </IonItem>
            </>
          )}

          <IonButton
            expand="full"
            onClick={handleShowPreview}
            disabled={!gender || !size || !condition || (userType === 'seller' && !sellingPrice) || (selectedCategory === 'School & sport uniform' && !schoolName) || (selectedCategory === 'Club clothing' && !clubName) || (!selectedItem && !customItemType)}
            style={{ marginTop: '16px' }}
          >
            {userType === 'seller' ? (
              <>
                <IonIcon icon={eyeOutline} slot="start" />
                Preview Listing
              </>
            ) : 'Add to Cart'}
          </IonButton>
          
          <CropModal 
            isOpen={showCropModal}
            onClose={() => {
              setShowCropModal(false);
              setCropImageSrc(null);
            }}
            imageSrc={cropImageSrc}
            onSave={async (croppedImage) => {
              try {
                // Show loading state
                if (currentPhotoType === 'front') {
                  setFrontPhotoPreview('loading');
                } else {
                  setBackPhotoPreview('loading');
                }
                
                // Convert base64 to File object
                const response = await fetch(croppedImage);
                const blob = await response.blob();
                const fileName = currentPhotoType === 'front' ? 'front-photo.jpg' : 'back-photo.jpg';
                const file = new File([blob], fileName, { type: 'image/jpeg' });
                
                // Apply final compression to cropped image
                const { file: finalFile, dataUrl } = await enhanceAndCompressImage(file);
                
                if (currentPhotoType === 'front') {
                  setFrontPhoto(finalFile);
                  setFrontPhotoPreview(dataUrl);
                } else {
                  setBackPhoto(finalFile);
                  setBackPhotoPreview(dataUrl);
                }
                
                const sizeMB = (finalFile.size / (1024 * 1024)).toFixed(2);
                displayToast(`Image cropped & optimized! Size: ${sizeMB}MB`, 'success');
              } catch (error) {
                console.error('Failed to process cropped image:', error);
                alert('Failed to process cropped image. Please try again.');
                // Reset loading state
                if (currentPhotoType === 'front') {
                  setFrontPhotoPreview(null);
                } else {
                  setBackPhotoPreview(null);
                }
              }
            }}
          />
        </div>
      ) : showSportEquipment ? (
        <div style={{ padding: '16px' }}>
          {(() => {
            let sportName = selectedSport.replace(/\s+/g, '');
            // Handle specific naming cases
            sportName = sportName.replace('climbing', 'Climbing')
                                 .replace('Icehockey', 'IceHockey')
                                 .replace('Iceskating', 'IceSkating')
                                 .replace('Horseriding', 'HorseRiding')
                                 .replace('Ringtennis', 'RingTennis')
                                 .replace('Targetshooting', 'TargetShooting');
            const componentName = `${sportName}EquipmentComponent`;
            const Component = (SportEquipmentComponents as any)[componentName];
            
            // Determine category filter based on selected category and subcategory
            let categoryFilter = 'all';
            if (selectedCategory === 'School & sport uniform' && selectedSubcategory === 'Sports Uniform') {
              categoryFilter = 'clothing';
            } else if (selectedCategory === 'Club clothing') {
              categoryFilter = 'clothing';
            } else if (selectedCategory === 'Training wear & shoes') {
              categoryFilter = 'footwear';
            } else if (selectedCategory === 'Sports equipment') {
              categoryFilter = 'equipment-protective-accessories';
            }
            
            return Component ? <Component userType={userType} onItemSelect={(item: any) => console.log('Selected:', typeof item === 'string' ? item.replace(/[\r\n\t]/g, '').substring(0, 100) : 'item')} categoryFilter={categoryFilter} schoolName={schoolName} hideSchoolClubSelection={selectedCategory === 'Sports equipment'} /> : <div style={{ padding: '20px', color: 'red' }}>Component not found</div>;
          })()}
        </div>
      ) : showClubClothing ? (
        <div style={{ padding: '16px' }}>
          {clubName ? (
            <ClubClothingComponent 
              userType={userType} 
              onItemSelect={(item: any) => console.log('Selected:', typeof item === 'string' ? item.replace(/[\r\n\t]/g, '').substring(0, 100) : 'item')} 
              categoryFilter='clothing' 
              clubName={clubName}
            />
          ) : (
            <ClubSelector 
              value={clubName} 
              onClubChange={(club) => {
                setClubName(club);
              }}
              placeholder="Select or enter club name"
            />
          )}
        </div>
      ) : showBeltsBagsShoes ? (
        <div style={{ padding: '16px' }}>
          <BeltsBagsShoesComponent
            userType={userType}
            onItemSelect={(item: any) => console.log('Selected:', typeof item === 'string' ? item.replace(/[\r\n\t]/g, '').substring(0, 100) : 'item')}
            categoryFilter='all'
          />
        </div>
      ) : showTrainingWear ? (
        <div style={{ padding: '16px' }}>
          <TrainingWearComponent
            userType={userType}
            onItemSelect={(item: any) => console.log('Selected:', typeof item === 'string' ? item.replace(/[\r\n\t]/g, '').substring(0, 100) : 'item')}
            categoryFilter='all'
          />
        </div>
      ) : showMatricDance ? (
        <div style={{ padding: '16px' }}>
          <MatricDanceComponent
            userType={userType}
            onItemSelect={(item: any) => console.log('Selected:', typeof item === 'string' ? item.replace(/[\r\n\t]/g, '').substring(0, 100) : 'item')}
            categoryFilter='all'
          />
        </div>
      ) : showSchoolGrades ? (
        <div style={{ padding: '16px' }}>
          <SchoolGradesComponent
            userType={userType}
            onCategorySelect={(phase: string, subject: string) => console.log('Selected:', phase?.replace(/[\r\n\t]/g, '').substring(0, 50), subject?.replace(/[\r\n\t]/g, '').substring(0, 50))}
          />
        </div>
      ) : showLocationSearch ? (
        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3>Location Selection</h3>
            <IonItem style={{ marginBottom: '16px' }}>
              <IonLabel>Use nearby location</IonLabel>
              <IonToggle 
                checked={useNearbyLocation} 
                onIonChange={(e: any) => setUseNearbyLocation(e.detail.checked)}
              />
            </IonItem>
            
            {!useNearbyLocation && (
              <div>
                <IonItem style={{ marginBottom: '16px' }}>
                  <IonLabel position="stacked">Province</IonLabel>
                  <IonSelect value={selectedProvince} onIonChange={e => setSelectedProvince(e.detail.value)} placeholder="Select Province">
                    <IonSelectOption value="Gauteng">Gauteng</IonSelectOption>
                    <IonSelectOption value="Western Cape">Western Cape</IonSelectOption>
                    <IonSelectOption value="KwaZulu-Natal">KwaZulu-Natal</IonSelectOption>
                    <IonSelectOption value="Eastern Cape">Eastern Cape</IonSelectOption>
                    <IonSelectOption value="Free State">Free State</IonSelectOption>
                    <IonSelectOption value="Limpopo">Limpopo</IonSelectOption>
                    <IonSelectOption value="Mpumalanga">Mpumalanga</IonSelectOption>
                    <IonSelectOption value="North West">North West</IonSelectOption>
                    <IonSelectOption value="Northern Cape">Northern Cape</IonSelectOption>
                  </IonSelect>
                </IonItem>
                
                <IonItem style={{ marginBottom: '16px' }}>
                  <IonInput 
                    label="Town/City" 
                    labelPlacement="stacked" 
                    placeholder="Enter town or city"
                    value={selectedTown}
                    onIonChange={e => setSelectedTown(e.detail.value!)}
                  />
                </IonItem>
              </div>
            )}
          </div>
          
          {userType === 'seller' && (
            <div style={{ marginBottom: '20px' }}>
              <h3>Custom Options</h3>
              <IonItem style={{ marginBottom: '16px' }}>
                <IonLabel>Add custom category/item/brand</IonLabel>
                <IonToggle 
                  checked={showCustomInputs} 
                  onIonChange={(e: any) => setShowCustomInputs(e.detail.checked)}
                />
              </IonItem>
              
              {showCustomInputs && (
                <div>
                  <IonItem style={{ marginBottom: '16px' }}>
                    <IonInput 
                      label="Custom Category" 
                      labelPlacement="stacked" 
                      placeholder="Enter custom category"
                      value={customCategory}
                      onIonChange={e => setCustomCategory(e.detail.value!)}
                    />
                  </IonItem>
                  
                  <IonItem style={{ marginBottom: '16px' }}>
                    <IonInput 
                      label="Custom Item Type" 
                      labelPlacement="stacked" 
                      placeholder="Enter custom item type"
                      value={customItemType}
                      onIonChange={e => setCustomItemType(e.detail.value!)}
                    />
                  </IonItem>
                  
                  <IonItem style={{ marginBottom: '16px' }}>
                    <IonInput 
                      label="Custom Brand" 
                      labelPlacement="stacked" 
                      placeholder="Enter custom brand"
                      value={customBrand}
                      onIonChange={e => setCustomBrand(e.detail.value!)}
                    />
                  </IonItem>
                </div>
              )}
            </div>
          )}
          
          <IonButton 
            expand="full" 
            onClick={() => {
              setShowItemDetails(true);
              setShowLocationSearch(false);
            }}
            disabled={!useNearbyLocation && (!selectedProvince || !selectedTown)}
          >
            Continue to {selectedCategory}
          </IonButton>
        </div>
      ) : showStationery ? (
        <div style={{ padding: '16px' }}>
          <Stationery 
            userType={userType} 
            onItemSelect={(item: any) => console.log('Selected:', typeof item === 'string' ? item.replace(/[\r\n\t]/g, '').substring(0, 100) : 'item')} 
            categoryFilter='all'
          />
        </div>
      ) : showSchoolSelection ? (
        <div style={{ padding: '16px' }}>
          <SchoolSelector 
            value={schoolName} 
            onSchoolChange={(school) => {
              setSchoolName(school);
              if (school) {
                setCurrentLevel('uniform');
                setShowSchoolSelection(false);
              }
            }}
            placeholder="Select or enter school name"
          />
        </div>
      ) : (
        <>
          {currentLevel === 'main' && renderGrid(mainCategories, handleMainCategoryClick, true)}
          {currentLevel === 'uniform' && (
            <div style={{ padding: '16px' }}>
              {schoolName ? (
                <div>
                  <div style={{ 
                    marginBottom: '20px', 
                    textAlign: 'center', 
                    backgroundColor: 'rgba(52, 152, 219, 0.1)', 
                    border: '2px solid #3498DB', 
                    borderRadius: '12px', 
                    padding: '16px' 
                  }}>
                    <IonIcon 
                      icon={schoolOutline} 
                      style={{ 
                        fontSize: '32px', 
                        color: '#3498DB', 
                        marginBottom: '8px' 
                      }} 
                    />
                    <h2 style={{ 
                      margin: '0', 
                      color: '#3498DB', 
                      fontSize: '18px', 
                      fontWeight: 'bold' 
                    }}>
                      {schoolName}
                    </h2>
                    <p style={{ 
                      margin: '4px 0 0 0', 
                      color: '#666', 
                      fontSize: '14px' 
                    }}>
                      Selected School
                    </p>
                  </div>
                  <IonGrid>
                    <IonRow>
                      <IonCol size="6">
                        <IonCard 
                          button 
                          onClick={() => handleUniformTypeClick('School Uniform')}
                          style={{
                            border: selectedSubcategory === 'School Uniform' ? '2px solid #3498DB' : '1px solid #444',
                            backgroundColor: 'transparent',
                            transition: 'all 0.2s ease',
                            height: '120px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <IonCardContent style={{ 
                            textAlign: 'center', 
                            padding: '16px',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                            <IonIcon 
                              icon={schoolOutline} 
                              size="large" 
                              style={{ 
                                color: selectedSubcategory === 'School Uniform' ? '#3498DB' : '#666',
                                marginBottom: '8px' 
                              }} 
                            />
                            <div style={{ 
                              fontWeight: 'bold', 
                              color: selectedSubcategory === 'School Uniform' ? '#3498DB' : '#333',
                              fontSize: '14px'
                            }}>
                              School Uniform
                            </div>
                          </IonCardContent>
                        </IonCard>
                      </IonCol>
                      <IonCol size="6">
                        <IonCard 
                          button 
                          onClick={() => handleUniformTypeClick('Sports Uniform')}
                          style={{
                            border: selectedSubcategory === 'Sports Uniform' ? '2px solid #E74C3C' : '1px solid #444',
                            backgroundColor: 'transparent',
                            transition: 'all 0.2s ease',
                            height: '120px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <IonCardContent style={{ 
                            textAlign: 'center', 
                            padding: '16px',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                            <IonIcon 
                              icon={shirtOutline} 
                              size="large" 
                              style={{ 
                                color: selectedSubcategory === 'Sports Uniform' ? '#E74C3C' : '#666',
                                marginBottom: '8px' 
                              }} 
                            />
                            <div style={{ 
                              fontWeight: 'bold', 
                              color: selectedSubcategory === 'Sports Uniform' ? '#E74C3C' : '#333',
                              fontSize: '14px'
                            }}>
                              Sports Uniform
                            </div>
                          </IonCardContent>
                        </IonCard>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </div>
              ) : (
                <SchoolSelector 
                  value={schoolName} 
                  onSchoolChange={(school) => {
                    setSchoolName(school);
                  }}
                  placeholder="Select or enter school name"
                />
              )}
            </div>
          )}
          {currentLevel === 'sport' && (
            <div>
              <div style={{ 
                marginBottom: '16px', 
                textAlign: 'center', 
                backgroundColor: 'rgba(52, 152, 219, 0.1)', 
                border: '1px solid #3498DB', 
                borderRadius: '8px', 
                padding: '12px' 
              }}>
                <IonIcon 
                  icon={schoolOutline} 
                  style={{ 
                    fontSize: '20px', 
                    color: '#3498DB', 
                    marginRight: '8px' 
                  }} 
                />
                <span style={{ 
                  color: '#3498DB', 
                  fontSize: '16px', 
                  fontWeight: 'bold' 
                }}>
                  {schoolName}
                </span>
              </div>
              <IonAccordionGroup>
                {Object.entries(sportCategories).map(([categoryName, categoryData]) => (
                  <IonAccordion key={categoryName} value={categoryName}>
                    <IonItem slot="header" style={{ '--background': 'transparent' }}>
                      <IonIcon 
                        icon={categoryData.icon} 
                        style={{ 
                          fontSize: '24px', 
                          color: categoryData.color, 
                          marginRight: '12px'
                        }} 
                      />
                      <IonLabel>
                        <h3 style={{ 
                          margin: '0', 
                          fontWeight: 'bold', 
                          color: categoryData.color,
                          fontSize: '16px'
                        }}>
                          {categoryName} ({categoryData.sports.length})
                        </h3>
                      </IonLabel>
                    </IonItem>
                    <div slot="content" style={{ padding: '8px' }}>
                      {renderGrid(categoryData.sports, handleSportTypeClick, true)}
                    </div>
                  </IonAccordion>
                ))}
              </IonAccordionGroup>
            </div>
          )}
          {currentLevel === 'sportEquipment' && (
            <IonAccordionGroup>
              {Object.entries(sportCategories).map(([categoryName, categoryData]) => (
                <IonAccordion key={categoryName} value={categoryName}>
                  <IonItem slot="header" style={{ '--background': 'transparent' }}>
                    <IonIcon 
                      icon={categoryData.icon} 
                      style={{ 
                        fontSize: '24px', 
                        color: categoryData.color, 
                        marginRight: '12px'
                      }} 
                    />
                    <IonLabel>
                      <h3 style={{ 
                        margin: '0', 
                        fontWeight: 'bold', 
                        color: categoryData.color,
                        fontSize: '16px'
                      }}>
                        {categoryName} ({categoryData.sports.length})
                      </h3>
                    </IonLabel>
                  </IonItem>
                  <div slot="content" style={{ padding: '8px' }}>
                    {renderGrid(categoryData.sports, handleSportTypeClick, true)}
                  </div>
                </IonAccordion>
              ))}
            </IonAccordionGroup>
          )}
          {currentLevel === 'schoolItems' && (
            <SchoolUniformComponent 
              userType={userType} 
              onItemSelect={(item: any) => console.log('Selected:', item)} 
              categoryFilter='clothing' 
              schoolName={schoolName} 
            />
          )}
        </>
      )}
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={hideToast}
        message={toastMessage}
        duration={2000}
        position="bottom"
        color={toastColor}
      />

      {/* Seller Verification Modal */}
      <IonModal isOpen={showVerificationModal} onDidDismiss={() => setShowVerificationModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Seller Verification</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowVerificationModal(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ paddingTop: '16px' }}>
            <SellerVerification onVerificationComplete={handleVerificationComplete} />
          </div>
        </IonContent>
      </IonModal>
    </div>
  );
};

export default Categories;
