import React, { useState, useEffect } from 'react';
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonToast
} from '@ionic/react';
import {
  cameraOutline, imageOutline, checkmarkCircleOutline, closeCircleOutline,
  peopleOutline, tennisballOutline, waterOutline, fitnessOutline,
  manOutline, bicycleOutline, extensionPuzzleOutline,
  footballOutline, basketballOutline, golfOutline
} from 'ionicons/icons';
import ClubSelector from '../ClubSelector';
import { useCartStore } from '../../stores/cartStore';
import { useListingsStore } from '../../stores/listingsStore';
import { validateImageFile } from '../../utils/imageEnhancer';
import clubClothing from '../../assets/clubClothing.png';
import rugby from '../../assets/rugby.svg';
import netball from '../../assets/netball.svg';
import hockey from '../../assets/hockey.svg';
import cricket from '../../assets/cricket.svg';
import baseball from '../../assets/baseball.svg';
import softball from '../../assets/softball.svg';
import ringtennis from '../../assets/ringtennis.svg';
import squash from '../../assets/squash.svg';
import tabletennis from '../../assets/tabletennis.svg';
import badminton from '../../assets/badminton.svg';
import padel from '../../assets/padel.svg';
import swimming from '../../assets/swimming.svg';
import diving from '../../assets/diving.svg';
import rowing from '../../assets/rowing.svg';
import polo from '../../assets/polo.svg';
import athletics from '../../assets/athletics.svg';
import crosscountry from '../../assets/crosscountry.svg';
import gymnastics from '../../assets/gymnastics.svg';
import archery from '../../assets/archery.svg';
import target from '../../assets/target.svg';
import boxing from '../../assets/boxing.svg';
import rollerSkating from '../../assets/rollerSkating.svg';
import iceSkating from '../../assets/iceSkating.svg';
import iceHockey from '../../assets/iceHockey.svg';
import mountainBike from '../../assets/mountainBike.svg';
import roadBike from '../../assets/roadBike.svg';
import dance from '../../assets/dance.svg';
import ballet from '../../assets/ballet.svg';
import climbing from '../../assets/climbing.svg';
import horseRiding from '../../assets/horseRiding.svg';
import chess from '../../assets/chess.svg';
import robot from '../../assets/robot.svg';
import jukskei from '../../assets/jukskei.svg';
import bowling from '../../assets/bowling.svg';

interface ClubClothingProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  clubName?: string;
}

const sportCategories = {
  'Team Sports': {
    sports: [
      { name: 'Rugby', icon: rugby },
      { name: 'Football', icon: footballOutline },
      { name: 'Netball', icon: netball },
      { name: 'Hockey', icon: hockey },
      { name: 'Basketball', icon: basketballOutline },
      { name: 'Cricket', icon: cricket },
      { name: 'Volleyball', icon: basketballOutline },
      { name: 'Korfbal', icon: basketballOutline },
      { name: 'Baseball', icon: baseball },
      { name: 'Softball', icon: softball },
      { name: 'Ringball', icon: ringtennis },
    ],
    icon: peopleOutline,
    color: '#E74C3C'
  },
  'Racket Sports': {
    sports: [
      { name: 'Tennis', icon: tennisballOutline },
      { name: 'Squash', icon: squash },
      { name: 'Tabletennis', icon: tabletennis },
      { name: 'Badminton', icon: badminton },
      { name: 'Padel', icon: padel },
      { name: 'Ring tennis', icon: ringtennis },
    ],
    icon: tennisballOutline,
    color: '#004aad'
  },
  'Water Sports': {
    sports: [
      { name: 'Swimming', icon: swimming },
      { name: 'Diving', icon: diving },
      { name: 'Rowing', icon: rowing },
      { name: 'Waterpolo', icon: polo },
    ],
    icon: waterOutline,
    color: '#1ABC9C'
  },
  'Individual Sports': {
    sports: [
      { name: 'Athletics', icon: athletics },
      { name: 'Crosscountry', icon: crosscountry },
      { name: 'Golf', icon: golfOutline },
      { name: 'Gymnastics', icon: gymnastics },
      { name: 'Triathlon', icon: swimming },
      { name: 'Archery', icon: archery },
      { name: 'Target shooting', icon: target },
    ],
    icon: fitnessOutline,
    color: '#27AE60'
  },
  'Contact Sports': {
    sports: [
      { name: 'Boxing', icon: boxing },
      { name: 'Kickboxing', icon: manOutline },
      { name: 'Wrestling', icon: manOutline },
      { name: 'Karate', icon: manOutline },
      { name: 'Judo', icon: manOutline },
      { name: 'Taekwondo', icon: manOutline },
      { name: 'Jiu-Jitsu', icon: manOutline },
      { name: 'MMA', icon: manOutline },
    ],
    icon: manOutline,
    color: '#C0392B'
  },
  'Cycling & Skating': {
    sports: [
      { name: 'Mountainbike', icon: mountainBike },
      { name: 'Roadbike', icon: roadBike },
      { name: 'Rollerskating', icon: rollerSkating },
      { name: 'Ice skating', icon: iceSkating },
      { name: 'Ice hockey', icon: iceHockey },
    ],
    icon: bicycleOutline,
    color: '#8E44AD'
  },
  'Other Sports': {
    sports: [
      { name: 'Dancing', icon: dance },
      { name: 'Ballet', icon: ballet },
      { name: 'Rock climbing', icon: climbing },
      { name: 'Horse riding', icon: horseRiding },
      { name: 'Chess', icon: chess },
      { name: 'Robotics', icon: robot },
      { name: 'Jukskei', icon: jukskei },
      { name: 'Bowling', icon: bowling },
    ],
    icon: extensionPuzzleOutline,
    color: '#F39C12'
  }
};

type GenderedItems = { Boys?: string[]; Girls?: string[]; Unisex?: string[] };
type ClothingItems = GenderedItems | string[];
const sportClothingItems: Record<string, ClothingItems> = {
  Rugby: { Unisex: ['Jersey', 'Shorts', 'Socks', 'Training top', 'Training shorts', 'Warm-up jacket', 'Training shoes'] },
  Football: { Unisex: ['Jersey', 'Shorts', 'Socks', 'Goalkeeper jersey', 'Training top', 'Training shorts', 'Training shoes'] },
  Netball: { Girls: ['Dress', 'Skirt', 'Shorts', 'Top', 'Socks', 'Training top', 'Training shorts', 'Training shoes'] },
  Hockey: {
    Boys: ['Jersey', 'Shorts', 'Socks', 'Training top', 'Training shorts', 'Warm-up jacket', 'Training shoes'],
    Girls: ['Jersey', 'Skirt', 'Shorts', 'Socks', 'Training top', 'Training shorts', 'Warm-up jacket', 'Training shoes'],
  },
  Basketball: { Unisex: ['Jersey', 'Shorts', 'Socks', 'Training top', 'Warm-up jacket', 'Training shoes'] },
  Cricket: {
    Boys: ['Whites jersey', 'Whites trousers', 'Shorts', 'Cap', 'Socks', 'Training top', 'Training shoes'],
    Girls: ['Whites jersey', 'Whites trousers', 'Skirt', 'Cap', 'Socks', 'Training top', 'Training shoes'],
  },
  Volleyball: { Unisex: ['Jersey', 'Shorts', 'Socks', 'Training top', 'Training shorts', 'Training shoes'] },
  Korfbal: {
    Boys: ['Jersey', 'Shorts', 'Socks', 'Training top', 'Training shoes'],
    Girls: ['Jersey', 'Skirt', 'Shorts', 'Socks', 'Training top', 'Training shoes'],
  },
  Baseball: { Unisex: ['Jersey', 'Pants', 'Socks', 'Cap', 'Training top', 'Training shoes'] },
  Softball: {
    Boys: ['Jersey', 'Pants', 'Socks', 'Cap', 'Training top', 'Training shoes'],
    Girls: ['Jersey', 'Pants', 'Shorts', 'Socks', 'Cap', 'Training top', 'Training shoes'],
  },
  Ringball: { Girls: ['Jersey', 'Shorts', 'Socks', 'Training top', 'Training shoes'] },
  Tennis: {
    Boys: ['Polo shirt', 'Shorts', 'Socks', 'Training top', 'Warm-up jacket', 'Training shoes'],
    Girls: ['Polo shirt', 'Skirt', 'Shorts', 'Socks', 'Training top', 'Warm-up jacket', 'Training shoes'],
  },
  Squash: {
    Boys: ['Top', 'Shorts', 'Socks', 'Training top', 'Training shoes'],
    Girls: ['Top', 'Skirt', 'Shorts', 'Socks', 'Training top', 'Training shoes'],
  },
  Tabletennis: {
    Boys: ['Shirt', 'Shorts', 'Socks', 'Training top', 'Training shoes'],
    Girls: ['Shirt', 'Skirt', 'Shorts', 'Socks', 'Training top', 'Training shoes'],
  },
  Badminton: {
    Boys: ['Top', 'Shorts', 'Socks', 'Training top', 'Training shoes'],
    Girls: ['Top', 'Skirt', 'Shorts', 'Socks', 'Training top', 'Training shoes'],
  },
  Padel: {
    Boys: ['Top', 'Shorts', 'Socks', 'Training top', 'Training shoes'],
    Girls: ['Top', 'Skirt', 'Shorts', 'Socks', 'Training top', 'Training shoes'],
  },
  'Ring tennis': {
    Boys: ['Top', 'Shorts', 'Socks', 'Training top', 'Training shoes'],
    Girls: ['Top', 'Skirt', 'Shorts', 'Socks', 'Training top', 'Training shoes'],
  },
  Swimming: {
    Boys: ['Jammers', 'Swim briefs', 'Swim cap', 'Rash guard', 'Training shoes'],
    Girls: ['Swimsuit', 'Swimming costume', 'Swim cap', 'Rash guard', 'Training shoes'],
  },
  Diving: {
    Boys: ['Diving shorts', 'Rash guard', 'Swim cap', 'Training shoes'],
    Girls: ['Diving suit', 'Rash guard', 'Swim cap', 'Training shoes'],
  },
  Rowing: { Unisex: ['Lycra', 'Shorts', 'Top', 'Training top', 'Training shorts', 'Training shoes'] },
  Waterpolo: {
    Boys: ['Swimming briefs', 'Cap', 'Rash guard', 'Training shoes'],
    Girls: ['Costume', 'Cap', 'Rash guard', 'Training shoes'],
  },
  Athletics: {
    Boys: ['Singlet', 'Shorts', 'Training top', 'Warm-up jacket', 'Training shoes'],
    Girls: ['Singlet', 'Shorts', 'Tights', 'Training top', 'Warm-up jacket', 'Training shoes'],
  },
  Crosscountry: {
    Boys: ['Singlet', 'Shorts', 'Training top', 'Training shoes'],
    Girls: ['Singlet', 'Shorts', 'Tights', 'Training top', 'Training shoes'],
  },
  Golf: {
    Boys: ['Polo shirt', 'Shorts', 'Pants', 'Cap', 'Socks', 'Training shoes'],
    Girls: ['Polo shirt', 'Skirt', 'Shorts', 'Pants', 'Cap', 'Socks', 'Training shoes'],
  },
  Gymnastics: {
    Boys: ['Vest', 'Shorts', 'Training top', 'Training shoes'],
    Girls: ['Leotard', 'Shorts', 'Training top', 'Training shoes'],
  },
  Triathlon: { Unisex: ['Tri suit', 'Tri shorts', 'Tri top', 'Cycling jersey', 'Training shoes'] },
  Archery: { Unisex: ['Shirt', 'Pants', 'Training top', 'Training shoes'] },
  'Target shooting': { Unisex: ['Shooting jacket', 'Shooting trousers', 'Training top', 'Training shoes'] },
  Boxing: { Unisex: ['Vest', 'Shorts', 'Training top', 'Training shorts', 'Training shoes'] },
  Kickboxing: { Unisex: ['Shorts', 'Training top', 'Training shorts', 'Training shoes'] },
  Wrestling: { Unisex: ['Singlet', 'Training top', 'Training shorts', 'Training shoes'] },
  Karate: { Unisex: ['Gi top', 'Gi pants', 'Training top', 'Training shorts', 'Training shoes'] },
  Judo: { Unisex: ['Gi top', 'Gi pants', 'Training top', 'Training shorts', 'Training shoes'] },
  Taekwondo: { Unisex: ['Dobok top', 'Dobok pants', 'Training top', 'Training shorts', 'Training shoes'] },
  'Jiu-Jitsu': { Unisex: ['Gi top', 'Gi pants', 'Rash guard', 'Shorts', 'Training shoes'] },
  MMA: { Unisex: ['Shorts', 'Rash guard', 'Training top', 'Training shorts', 'Training shoes'] },
  Mountainbike: { Unisex: ['Cycling jersey', 'Cycling shorts', 'MTB shorts', 'Wind jacket', 'Training shoes'] },
  Roadbike: { Unisex: ['Cycling jersey', 'Cycling shorts', 'Wind jacket', 'Arm warmers', 'Training shoes'] },
  Rollerskating: {
    Boys: ['Shorts', 'Top', 'Training top', 'Training shoes'],
    Girls: ['Leggings', 'Skirt', 'Top', 'Training top', 'Training shoes'],
  },
  'Ice skating': {
    Boys: ['Pants', 'Top', 'Training top', 'Training shoes'],
    Girls: ['Dress', 'Leggings', 'Top', 'Training top', 'Training shoes'],
  },
  'Ice hockey': { Unisex: ['Jersey', 'Pants', 'Socks', 'Training top', 'Training shoes'] },
  Dancing: {
    Boys: ['Shirt', 'Pants', 'Training top', 'Training shoes'],
    Girls: ['Top', 'Skirt', 'Leggings', 'Dress', 'Training shoes'],
  },
  Ballet: {
    Boys: ['Vest', 'Tights', 'Training top', 'Training shoes'],
    Girls: ['Leotard', 'Tights', 'Skirt', 'Training top', 'Training shoes'],
  },
  'Rock climbing': { Unisex: ['Pants', 'Top', 'Training top', 'Training shorts', 'Training shoes'] },
  'Horse riding': { Unisex: ['Breeches', 'Jacket', 'Shirt', 'Gloves', 'Helmet cover', 'Training shoes'] },
  Chess: { Unisex: ['Club shirt', 'Club jacket', 'Training shoes'] },
  Robotics: { Unisex: ['Club shirt', 'Club jacket', 'Training shoes'] },
  Jukskei: { Unisex: ['Jersey', 'Shorts', 'Training top', 'Training shoes'] },
  Bowling: { Unisex: ['Shirt', 'Pants', 'Training top', 'Training shoes'] },
};

const defaultClothingItems: ClothingItems = {
  Boys: ['Jersey', 'Shorts', 'Socks', 'Training top', 'Training shorts', 'Warm-up jacket'],
  Girls: ['Jersey', 'Shorts', 'Socks', 'Training top', 'Training shorts', 'Warm-up jacket'],
};

const getItemsForGender = (sport: string, gender: 'Boys' | 'Girls' | 'Unisex'): string[] => {
  const entry = sportClothingItems[sport] || defaultClothingItems;
  if (Array.isArray(entry)) return entry;
  if (gender === 'Unisex' && entry.Unisex) return entry.Unisex;
  if (gender === 'Boys') return entry.Boys || entry.Unisex || entry.Girls || [];
  if (gender === 'Girls') return entry.Girls || entry.Unisex || entry.Boys || [];
  return entry.Unisex || entry.Boys || entry.Girls || [];
};

const getAvailableGenders = (sport: string): Array<'Boys' | 'Girls' | 'Unisex'> => {
  const entry = sportClothingItems[sport] || defaultClothingItems;
  if (Array.isArray(entry)) return ['Boys', 'Girls', 'Unisex'];
  const genders: Array<'Boys' | 'Girls' | 'Unisex'> = [];
  if (entry.Boys) genders.push('Boys');
  if (entry.Girls) genders.push('Girls');
  if (entry.Unisex) genders.push('Unisex');
  return genders;
};

const ClubClothingComponent: React.FC<ClubClothingProps> = ({ userType, onItemSelect, categoryFilter = 'all', clubName: propClubName }) => {
  const [selectedItem, setSelectedItem] = useState('');
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [condition, setCondition] = useState<number | undefined>();
  const [price, setPrice] = useState('');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const [clubName, setClubName] = useState(propClubName || '');
  const [size, setSize] = useState('');
  const [showItemView, setShowItemView] = useState(false);
  const [selectedAvailableItem, setSelectedAvailableItem] = useState<any>(null);
  const [selectedSport, setSelectedSport] = useState('');
  const [showSportItems, setShowSportItems] = useState(false);
  const [selectedSportGender, setSelectedSportGender] = useState<'Boys' | 'Girls' | 'Unisex' | ''>('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState<number | undefined>();
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [addedToCartId, setAddedToCartId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToCart } = useCartStore();
  const { listings, fetchListings, addListing } = useListingsStore();

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const childrenSizes = ['4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const teenSizes = ['XS (28)', 'S (30)', 'M (32)', 'L (34)', 'XL (36)', 'XXL (38)'];

  const getFilteredItems = () => {
    if (userType !== 'buyer' || !clubName) return [];
    let items = listings.filter(listing =>
      listing.category === 'Club clothing' && listing.school === clubName
    ).map(listing => ({
      id: listing.id,
      item: listing.name,
      size: listing.size,
      condition: listing.condition,
      price: listing.price,
      frontPhoto: listing.frontPhoto,
      backPhoto: listing.backPhoto,
      quantity: listing.quantity,
      description: listing.description,
      gender: listing.gender,
      category: listing.category,
      subcategory: listing.subcategory,
      sport: listing.sport,
      school: listing.school
    }));
    if (sizeFilter) items = items.filter(item => item.size.toLowerCase().includes(sizeFilter.toLowerCase()));
    if (conditionFilter) items = items.filter(item => item.condition === conditionFilter);
    if (priceRange.min) items = items.filter(item => item.price >= parseInt(priceRange.min));
    if (priceRange.max) items = items.filter(item => item.price <= parseInt(priceRange.max));
    return items;
  };

  const getConditionText = (condition: number) => {
    const conditions = { 1: 'Brand new', 2: 'Like new', 3: 'Used but good', 4: 'Used and worn' };
    return conditions[condition as keyof typeof conditions] || 'Unknown';
  };

  const handleAddToCart = (item: any) => {
    if (item.quantity === 0) {
      setToastMessage(`${item.item} is sold out!`);
      setShowToast(true);
      return;
    }
    addToCart({
      id: item.id,
      name: item.item,
      description: item.description || `${item.item} - Size: ${item.size}`,
      price: item.price,
      condition: item.condition,
      school: clubName,
      size: item.size,
      gender: item.gender || '',
      frontPhoto: item.frontPhoto,
      backPhoto: item.backPhoto,
      category: 'Club clothing',
      subcategory: item.subcategory,
      sport: item.sport,
      quantity: 1
    });
    setAddedToCartId(item.id);
    setTimeout(() => setAddedToCartId(null), 2000);
  };

  const handlePhotoUpload = (type: 'front' | 'back') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setToastMessage(validation.error || 'Invalid image file');
        setShowToast(true);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'front') setFrontPhoto(event.target?.result as string);
        else setBackPhoto(event.target?.result as string);
      };
      reader.onerror = () => {
        setToastMessage('Failed to read image file. Please try a different image.');
        setShowToast(true);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSubmit = async () => {
    const missingFields = [];
    if (!size) missingFields.push('Size');
    if (!condition) missingFields.push('Condition');
    if (userType === 'seller') {
      if (!price) missingFields.push('Price');
      if (!frontPhoto) missingFields.push('Front Photo');
      if (!backPhoto) missingFields.push('Back Photo');
    }
    if (missingFields.length > 0) {
      setToastMessage(`Please fill in: ${missingFields.join(', ')}`);
      setShowToast(true);
      return;
    }

    if (userType === 'seller') {
      setIsSubmitting(true);
      try {
        await addListing({
          id: Date.now().toString(),
          name: selectedItem,
          description: `${selectedItem} - Size: ${size}`,
          school: clubName,
          gender: 'Unisex',
          size,
          condition: condition || 1,
          price: parseInt(price),
          frontPhoto: frontPhoto || '',
          backPhoto: backPhoto || '',
          category: 'Club clothing',
          sport: selectedSport,
          dateCreated: new Date().toLocaleDateString(),
          quantity: 1
        });
        setToastMessage(`${selectedItem} listed successfully!`);
        setShowToast(true);
        setShowItemDetails(false);
        setSelectedItem('');
        setSize('');
        setCondition(undefined);
        setPrice('');
        setFrontPhoto(null);
        setBackPhoto(null);
      } catch (error: any) {
        setToastMessage(error.message || 'Failed to list item');
        setShowToast(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderSportIcon = (icon: any) => {
    if (typeof icon === 'string' && (icon.includes('.svg') || icon.includes('.png'))) {
      return <IonIcon src={icon} style={{ fontSize: '40px', color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />;
    }
    return <IonIcon icon={icon} style={{ fontSize: '40px', color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />;
  };

  const rainbowColors = ['#FF2090', '#FFA020', '#A020C0', '#5CC840', '#00AACC'];

  const renderSportGrid = (sports: Array<{ name: string; icon: any }>) => (
    <IonGrid>
      <IonRow>
        {sports.map((sport, index) => (
          <IonCol size="4" key={index}>
            <div onClick={() => { if (clubName) { setSelectedSport(sport.name); setSelectedSportGender(''); setShowSportItems(true); } }}
              style={{ cursor: clubName ? 'pointer' : 'not-allowed', textAlign: 'center', opacity: clubName ? 1 : 0.5, padding: '4px 2px' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                backgroundColor: rainbowColors[index % rainbowColors.length],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 6px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}>
                {renderSportIcon(sport.icon)}
              </div>
              <div style={{ fontWeight: 'bold', color: '#333', fontSize: '11px', lineHeight: '1.2', textAlign: 'center', padding: '0 2px' }}>
                {sport.name}
              </div>
            </div>
          </IonCol>
        ))}
      </IonRow>
    </IonGrid>
  );

  const clubHeader = (clubName || propClubName) ? (
    <div style={{
      marginBottom: '16px', textAlign: 'center',
      backgroundColor: 'rgba(231, 76, 60, 0.1)', border: '2px solid #E74C3C',
      borderRadius: '12px', padding: '12px'
    }}>
      <h3 style={{ margin: '0', color: '#E74C3C', fontSize: '16px', fontWeight: 'bold' }}>
        {clubName || propClubName}
      </h3>
      <p style={{ margin: '2px 0 0 0', color: '#666', fontSize: '12px' }}>Selected Club</p>
    </div>
  ) : null;

  // Item zoomed photo overlay
  const photoOverlay = zoomedPhoto ? (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={() => setZoomedPhoto(null)}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', maxWidth: '90%', maxHeight: '90%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        onClick={(e) => e.stopPropagation()}>
        <button style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }} onClick={() => setZoomedPhoto(null)}>×</button>
        <img src={zoomedPhoto} alt="Zoomed view" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid #ddd', touchAction: 'pinch-zoom' }}
          onTouchStart={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()} />
      </div>
    </div>
  ) : null;

  const toast = (
    <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMessage} duration={2000} position="bottom"
      color={toastMessage.includes('successfully') || toastMessage.includes('Cart') ? 'success' : 'danger'} />
  );

  // --- Item detail view (zoom photo / add to cart) ---
  if (showItemView && selectedAvailableItem) {
    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => setShowItemView(false)}>← Back</IonButton>
        {clubHeader}
        <div style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#666' }}>{selectedAvailableItem.item}</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', margin: '16px 0', justifyContent: 'center' }}>
          {['frontPhoto', 'backPhoto'].map((side) => (
            <div key={side} style={{ textAlign: 'center' }}>
              <div style={{ width: '150px', height: '200px', borderRadius: '8px', backgroundImage: `url(${selectedAvailableItem[side]})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid #ddd', cursor: 'pointer' }}
                onClick={() => setZoomedPhoto(selectedAvailableItem[side])} />
              <p style={{ fontSize: '12px', margin: '4px 0', fontWeight: 'bold' }}>{side === 'frontPhoto' ? 'Front' : 'Back'}</p>
            </div>
          ))}
        </div>
        {photoOverlay}
        <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', margin: '16px 0' }}>
          <div style={{ marginBottom: '8px' }}><strong>Size:</strong> {selectedAvailableItem.size}</div>
          <div style={{ marginBottom: '8px' }}><strong>Condition:</strong> {getConditionText(selectedAvailableItem.condition)}</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#E74C3C' }}>R{selectedAvailableItem.price}</div>
        </div>
        <IonButton expand="full" onClick={() => handleAddToCart(selectedAvailableItem)} disabled={selectedAvailableItem.quantity === 0}
          style={{ marginTop: '16px', '--background': addedToCartId === selectedAvailableItem.id ? '#28a745' : '', '--color': addedToCartId === selectedAvailableItem.id ? 'white' : '' }}>
          {selectedAvailableItem.quantity === 0 ? 'Sold Out' : addedToCartId === selectedAvailableItem.id ? '✓ Added to Cart!' : 'Add to Cart'}
        </IonButton>
        {toast}
      </div>
    );
  }

  // --- Listing / buying form for selected item ---
  if (showItemDetails) {
    const availableItems = getFilteredItems().filter(item => item.item === selectedItem);
    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => { setShowItemDetails(false); setSelectedItem(''); }}>← Back</IonButton>
        {clubHeader}
        <div style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#666' }}>
            {selectedSport} — {selectedItem}
          </span>
        </div>

        {userType === 'buyer' ? (
          availableItems.length > 0 ? (
            <div style={{ margin: '16px 0' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>Available ({availableItems.length})</h4>
              {availableItems.map(item => (
                <IonCard key={item.id} button onClick={() => { setSelectedAvailableItem(item); setShowItemView(true); }} style={{ margin: '8px 0' }}>
                  <IonCardContent style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <div style={{ width: '40px', height: '50px', border: '1px solid #ddd', borderRadius: '4px', backgroundImage: item.frontPhoto ? `url(${item.frontPhoto})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: !item.frontPhoto ? '#f0f0f0' : 'transparent' }} />
                        <div style={{ width: '40px', height: '50px', border: '1px solid #ddd', borderRadius: '4px', backgroundImage: item.backPhoto ? `url(${item.backPhoto})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: !item.backPhoto ? '#f0f0f0' : 'transparent' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.item}</span>
                          {item.quantity === 0 ? (
                            <IonBadge color="danger" style={{ fontSize: '9px' }}>
                              <IonIcon icon={closeCircleOutline} style={{ marginRight: '2px', fontSize: '10px' }} /> Sold Out
                            </IonBadge>
                          ) : (
                            <IonBadge color="success" style={{ fontSize: '9px' }}>
                              <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '2px', fontSize: '10px' }} /> {item.quantity} left
                            </IonBadge>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                          Size: {item.size} · {getConditionText(item.condition)}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#004aad' }}>R{item.price}</div>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          ) : (
            <div style={{ padding: '16px', textAlign: 'center', color: '#666', backgroundColor: '#f8f9fa', borderRadius: '8px', margin: '16px 0' }}>
              <p style={{ margin: '0' }}>No {selectedItem} available from {clubName} yet</p>
            </div>
          )
        ) : (
          <>
            <IonItem>
              <IonLabel position="stacked">Size *</IonLabel>
              <IonSelect value={size} onIonChange={e => setSize(e.detail.value)} placeholder="Select Size">
                {[...childrenSizes, ...teenSizes].map(s => (
                  <IonSelectOption key={s} value={s}>{s}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Condition Grade *</IonLabel>
              <IonSelect value={condition} onIonChange={e => setCondition(parseInt(e.detail.value))}>
                <IonSelectOption value={1}>1 - Brand new</IonSelectOption>
                <IonSelectOption value={2}>2 - Like new</IonSelectOption>
                <IonSelectOption value={3}>3 - Used but good</IonSelectOption>
                <IonSelectOption value={4}>4 - Used and worn</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonInput label="Price (ZAR) *" type="number" value={price} onIonChange={e => setPrice(e.detail.value!)} placeholder="Enter selling price" />
            </IonItem>
            <div style={{ display: 'flex', gap: '16px', margin: '16px 0' }}>
              {(['front', 'back'] as const).map(side => (
                <div key={side} style={{ textAlign: 'center' }}>
                  <div onClick={() => handlePhotoUpload(side)} style={{
                    width: '120px', height: '150px', border: '2px dashed #ccc', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    backgroundImage: (side === 'front' ? frontPhoto : backPhoto) ? `url(${side === 'front' ? frontPhoto : backPhoto})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    backgroundColor: !(side === 'front' ? frontPhoto : backPhoto) ? '#f0f0f0' : 'transparent'
                  }}>
                    {!(side === 'front' ? frontPhoto : backPhoto) && <IonIcon icon={cameraOutline} size="large" />}
                  </div>
                  <p style={{ fontSize: '12px', margin: '4px 0' }}>{side === 'front' ? 'Front' : 'Back'} Photo *</p>
                </div>
              ))}
            </div>
            <IonButton expand="full" onClick={handleSubmit} disabled={isSubmitting} style={{ marginTop: '16px' }}>
              {isSubmitting ? 'Listing...' : 'List Item'}
            </IonButton>
          </>
        )}
        {toast}
      </div>
    );
  }

  // --- Sport clothing items grid ---
  if (showSportItems) {
    const availableGenders = getAvailableGenders(selectedSport);
    const isUnisexOnly = availableGenders.length === 1 && availableGenders[0] === 'Unisex';
    const availableCountForItem = (itemName: string) =>
      getFilteredItems().filter(i => i.item === itemName && i.sport === selectedSport).reduce((sum, i) => sum + i.quantity, 0);

    const renderItemsGrid = (items: string[], genderKey: 'Boys' | 'Girls' | 'Unisex') => (
      <IonGrid>
        <IonRow>
          {items.map((item, index) => {
            const count = availableCountForItem(item);
            return (
              <IonCol size="4" key={index}>
                <div
                  onClick={() => { setSelectedSportGender(genderKey); setSelectedItem(item); setShowItemDetails(true); }}
                  style={{ cursor: 'pointer', textAlign: 'center', padding: '4px 2px' }}
                >
                  <div style={{
                    width: '70px', height: '70px', borderRadius: '50%',
                    backgroundColor: rainbowColors[index % rainbowColors.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 6px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    <IonIcon icon={imageOutline} style={{ fontSize: '30px', color: 'white' }} />
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#333', fontSize: '11px', lineHeight: '1.2', textAlign: 'center', padding: '0 2px' }}>
                    {item}
                  </div>
                  {userType === 'buyer' && count > 0 && (
                    <div style={{ fontSize: '10px', color: '#E74C3C', marginTop: '2px' }}>{count} avail</div>
                  )}
                </div>
              </IonCol>
            );
          })}
        </IonRow>
      </IonGrid>
    );

    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => { setShowSportItems(false); setSelectedSport(''); setSelectedSportGender(''); }}>← Back</IonButton>
        {clubHeader}
        <div style={{ textAlign: 'center', margin: '0 0 16px 0' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#666' }}>{selectedSport} Clothing</span>
        </div>
        {isUnisexOnly ? (
          renderItemsGrid(getItemsForGender(selectedSport, 'Unisex'), 'Unisex')
        ) : (
          <IonAccordionGroup>
            {availableGenders.map((gender) => {
              const genderColor = gender === 'Boys' ? '#004aad' : gender === 'Girls' ? '#E74C3C' : '#27AE60';
              return (
                <IonAccordion key={gender} value={gender}>
                  <IonItem slot="header" style={{ '--background': 'transparent' }}>
                    <IonLabel>
                      <h3 style={{ margin: '0', fontWeight: 'bold', color: genderColor, fontSize: '16px' }}>
                        {gender === 'Boys' ? '👦 ' : gender === 'Girls' ? '👧 ' : '🤝 '}{gender}
                      </h3>
                    </IonLabel>
                  </IonItem>
                  <div slot="content" style={{ padding: '8px' }}>
                    {renderItemsGrid(getItemsForGender(selectedSport, gender), gender)}
                  </div>
                </IonAccordion>
              );
            })}
          </IonAccordionGroup>
        )}
        {toast}
      </div>
    );
  }

  // --- Main view: sport category accordions ---
  return (
    <div>
      <div style={{
        marginBottom: '16px', textAlign: 'center',
        backgroundColor: '#E74C3C',
        borderRadius: '12px', padding: '16px'
      }}>
        <div style={{
          width: '48px', height: '48px', margin: '0 auto 8px',
          backgroundColor: 'white',
          WebkitMaskImage: `url(${clubClothing})`,
          maskImage: `url(${clubClothing})`,
          WebkitMaskSize: 'contain', maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center', maskPosition: 'center'
        } as React.CSSProperties} />
        <h2 style={{ margin: '0', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>Club Clothing</h2>
        <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>Sports club & team clothing</p>
      </div>

      {propClubName ? (
        clubHeader
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <ClubSelector value={clubName} onClubChange={setClubName} placeholder="Select or enter club name" />
        </div>
      )}

      {!clubName && (
        <div style={{ padding: '12px', textAlign: 'center', color: '#666', fontSize: '14px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '16px' }}>
          Select a club above to browse or list clothing
        </div>
      )}

      <IonAccordionGroup>
        {Object.entries(sportCategories).map(([categoryName, categoryData]) => (
          <IonAccordion key={categoryName} value={categoryName}>
            <IonItem slot="header" style={{ '--background': 'transparent', opacity: clubName ? 1 : 0.5 }}>
              <IonIcon icon={categoryData.icon} style={{ fontSize: '24px', color: categoryData.color, marginRight: '12px' }} />
              <IonLabel>
                <h3 style={{ margin: '0', fontWeight: 'bold', color: categoryData.color, fontSize: '16px' }}>
                  {categoryName} ({categoryData.sports.length})
                </h3>
              </IonLabel>
            </IonItem>
            <div slot="content" style={{ padding: '8px' }}>
              {renderSportGrid(categoryData.sports)}
            </div>
          </IonAccordion>
        ))}
      </IonAccordionGroup>

      {toast}
    </div>
  );
};

export default ClubClothingComponent;
