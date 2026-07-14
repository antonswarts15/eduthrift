import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  IonToast,
  IonBadge
} from '@ionic/react';
import {
  cameraOutline, shirtOutline, bagOutline, schoolOutline, checkmarkCircleOutline, closeCircleOutline,
  peopleOutline, tennisballOutline, waterOutline, fitnessOutline, manOutline, bicycleOutline, extensionPuzzleOutline,
  footballOutline, basketballOutline, golfOutline, womanOutline, maleFemaleOutline
} from 'ionicons/icons';
import PriceRangeSlider from '../PriceRangeSlider';
import SchoolSelector from '../SchoolSelector';
import { useCartStore } from '../../stores/cartStore';
import { useListingsStore, Listing } from '../../stores/listingsStore';
import { validateImageFile } from '../../utils/imageEnhancer';
import schoolClothing from '../../assets/schoolClothing.png';
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


const sportCategories = {
  'Team Sports': {
    sports: [
      { name: 'Rugby', icon: rugby }, { name: 'Football', icon: footballOutline },
      { name: 'Netball', icon: netball }, { name: 'Hockey', icon: hockey },
      { name: 'Basketball', icon: basketballOutline }, { name: 'Cricket', icon: cricket },
      { name: 'Volleyball', icon: basketballOutline }, { name: 'Korfbal', icon: basketballOutline },
      { name: 'Baseball', icon: baseball }, { name: 'Softball', icon: softball },
      { name: 'Ringball', icon: ringtennis },
    ],
    icon: peopleOutline, color: '#E74C3C'
  },
  'Racket Sports': {
    sports: [
      { name: 'Tennis', icon: tennisballOutline }, { name: 'Squash', icon: squash },
      { name: 'Tabletennis', icon: tabletennis }, { name: 'Badminton', icon: badminton },
      { name: 'Padel', icon: padel }, { name: 'Ring tennis', icon: ringtennis },
    ],
    icon: tennisballOutline, color: '#004aad'
  },
  'Water Sports': {
    sports: [
      { name: 'Swimming', icon: swimming }, { name: 'Diving', icon: diving },
      { name: 'Rowing', icon: rowing }, { name: 'Waterpolo', icon: polo },
    ],
    icon: waterOutline, color: '#1ABC9C'
  },
  'Individual Sports': {
    sports: [
      { name: 'Athletics', icon: athletics }, { name: 'Crosscountry', icon: crosscountry },
      { name: 'Golf', icon: golfOutline }, { name: 'Gymnastics', icon: gymnastics },
      { name: 'Triathlon', icon: swimming }, { name: 'Archery', icon: archery },
      { name: 'Target shooting', icon: target },
    ],
    icon: fitnessOutline, color: '#27AE60'
  },
  'Contact Sports': {
    sports: [
      { name: 'Boxing', icon: boxing }, { name: 'Kickboxing', icon: manOutline },
      { name: 'Wrestling', icon: manOutline }, { name: 'Karate', icon: manOutline },
      { name: 'Judo', icon: manOutline }, { name: 'Taekwondo', icon: manOutline },
      { name: 'Jiu-Jitsu', icon: manOutline }, { name: 'MMA', icon: manOutline },
    ],
    icon: manOutline, color: '#C0392B'
  },
  'Cycling & Skating': {
    sports: [
      { name: 'Mountainbike', icon: mountainBike }, { name: 'Roadbike', icon: roadBike },
      { name: 'Rollerskating', icon: rollerSkating }, { name: 'Ice skating', icon: iceSkating },
      { name: 'Ice hockey', icon: iceHockey },
    ],
    icon: bicycleOutline, color: '#8E44AD'
  },
  'Other Sports': {
    sports: [
      { name: 'Dancing', icon: dance }, { name: 'Ballet', icon: ballet },
      { name: 'Rock climbing', icon: climbing }, { name: 'Horse riding', icon: horseRiding },
      { name: 'Chess', icon: chess }, { name: 'Robotics', icon: robot },
      { name: 'Jukskei', icon: jukskei }, { name: 'Bowling', icon: bowling },
    ],
    icon: extensionPuzzleOutline, color: '#F39C12'
  }
};

type GenderedItems = { Boys?: string[]; Girls?: string[]; Unisex?: string[] };
type ClothingItems = GenderedItems | string[];
const sportClothingItems: Record<string, ClothingItems> = {
  Rugby: {
    Boys: ['Jersey & Shirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
    Girls: ['Jersey & Shirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
  },
  Football: {
    Boys: ['Jersey & Shirt', 'Shorts', 'Socks', 'Goalkeeper jersey', 'Tracksuit', 'Other'],
    Girls: ['Jersey & Shirt', 'Shorts', 'Socks', 'Goalkeeper jersey', 'Tracksuit', 'Other'],
  },
  Netball: {
    Boys: ['Jersey &Shirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
    Girls: ['Jersey & Shirt','Dress', 'Skirt', 'Shorts', 'Top', 'Socks', 'Tracksuit', 'Other'],
  },
  Hockey: {
    Boys: ['Jersey & Shirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
    Girls: ['Jersey & Shirt', 'Skirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
  },
  Basketball: {
    Boys: ['Jersey & Shirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
    Girls: ['Jersey & Shirt', 'Shorts', 'Skirt','Socks', 'Tracksuit', 'Other'],
  },
  Cricket: {
    Boys: ['Whites jersey & Shirt', 'Whites trousers', 'Shorts', 'Cap', 'Socks', 'Tracksuit', 'Other'],
    Girls: ['Whites jersey & Shirt', 'Whites trousers', 'Skirt', 'Cap', 'Socks', 'Tracksuit', 'Other'],
  },
  Volleyball: {
    Boys: ['Jersey & Shirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
    Girls: ['Jersey & Shirt', 'Shorts', 'Skirt','Socks', 'Tracksuit', 'Other'],
  },
  Korfbal: {
    Boys: ['Jersey & Shirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
    Girls: ['Jersey & Shirt', 'Skirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
  },
  Baseball: {
    Boys: ['Jersey & Shirt', 'Pants', 'Socks', 'Cap', 'Tracksuit', 'Other'],
    Girls: ['Jersey & Shirt', 'Pants', 'Skirt', 'Socks', 'Cap', 'Tracksuit', 'Other'],
  },
  Softball: {
    Boys: ['Jersey & Shirt', 'Pants', 'Socks', 'Cap', 'Tracksuit', 'Other'],
    Girls: ['Jersey & Shirt', 'Pants', 'Shorts', 'Skirt','Socks', 'Cap', 'Tracksuit', 'Other'],
  },
  Ringball: {
    Boys: ['Jersey & Shirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
    Girls: ['Jersey & Shirt', 'Shorts', 'Skirt','Socks', 'Tracksuit', 'Other'],
  },
  Tennis: {
    Boys: ['Jersey & Shirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
    Girls: ['Jersey & Shirt', 'Skirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
  },
  Squash: {
    Boys: ['Jersey & Shirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
    Girls: ['Jersey & Shirt', 'Skirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
  },
  Tabletennis: {
    Boys: ['Jersey & Shirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
    Girls: ['Jersey & Shirt', 'Skirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
  },
  Badminton: {
    Boys: ['Jersey & Shirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
    Girls: ['Jersey & Shirt', 'Skirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
  },
  Padel: {
    Boys: ['Jersey & Shirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
    Girls: ['Jersey & Shirt', 'Skirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
  },
  Ringtennis: {
    Boys: ['Jersey & Shirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
    Girls: ['Jersey & Shirt', 'Skirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
  },
  Swimming: {
    Boys: ['Jammers', 'Swim briefs', 'Swim cap', 'Rash guard', 'Tracksuit', 'Other'],
    Girls: ['Swimsuit', 'Swimming costume', 'Swim cap', 'Rash guard', 'Tracksuit', 'Other'],
  },
  Diving: {
    Boys: ['Diving shorts', 'Rash guard', 'Swim cap', 'Tracksuit', 'Other'],
    Girls: ['Diving suit', 'Rash guard', 'Swim cap', 'Tracksuit', 'Other'],
  },
  Rowing: {
    Boys: ['Lycra','Shirt',  'Shorts', 'Tracksuit', 'Other'],
    Girls: ['Lycra','Shirt', 'Shorts', 'Tracksuit', 'Other'],
  },
  Waterpolo: {
    Boys: ['Swimming briefs','Shirt',  'Cap', 'Rash guard', 'Tracksuit', 'Other'],
    Girls: ['Costume', 'Cap','Shirt',  'Rash guard', 'Tracksuit', 'Other'],
  },
  Athletics: {
    Boys: ['Singlet','Shirt','Shorts', 'Tracksuit', 'Other'],
    Girls: ['Singlet', 'Shirt','Shorts', 'Tights', 'Tracksuit', 'Other'],
  },
  Crosscountry: {
    Boys: ['Singlet','Shirt', 'Shorts', 'Tracksuit', 'Other'],
    Girls: ['Singlet', 'Shirt', 'Shorts', 'Tights', 'Tracksuit', 'Other'],
  },
  Golf: {
    Boys: ['Shirt', 'Shorts', 'Pants', 'Cap', 'Socks', 'Tracksuit', 'Other'],
    Girls: ['Shirt', 'Skirt', 'Shorts', 'Pants', 'Cap', 'Socks', 'Tracksuit', 'Other'],
  },
  Gymnastics: {
    Boys: ['Vest', 'Shorts', 'Tracksuit', 'Other'],
    Girls: ['Leotard', 'Shorts', 'Tracksuit', 'Other'],
  },
  Triathlon: {
    Boys: ['Tri suit', 'Tri shorts', 'Tri Shirt', 'Cycling jersey', 'Tracksuit', 'Other'],
    Girls: ['Tri suit', 'Tri shorts', 'Tri Shirt', 'Cycling jersey', 'Tracksuit', 'Other'],
  },
  Archery: {
    Boys: ['Shirt', 'Pants', 'Shorts', 'Tracksuit', 'Other'],
    Girls: ['Shirt', 'Pants', 'Shorts','Skirt', 'Tracksuit', 'Other'],
  },
  'Target shooting': {
    Boys: ['Shooting jacket', 'Shooting trousers', 'Shirt', 'Shorts', 'Tracksuit', 'Other'],
    Girls: ['Shooting jacket', 'Shooting trousers', 'Shirt', 'Shorts', 'Skirt', 'Tracksuit', 'Other'],
  },
  Boxing: {
    Boys: ['Vest', 'Shorts', 'Shirt', 'Tracksuit', 'Other'],
    Girls: ['Vest', 'Shorts', 'Shirt', 'Tracksuit', 'Other'],
  },
  Kickboxing: {
    Boys: ['Shorts', 'Shirt', 'Tracksuit', 'Other'],
    Girls: ['Shorts', 'Shirt', 'Tracksuit', 'Other'],
  },
  Wrestling: {
    Boys: ['Singlet', 'Shirt', 'Shorts', 'Tracksuit', 'Other'],
    Girls: ['Singlet', 'Shirt', 'Shorts', 'Tracksuit', 'Other'],
  },
  Karate: {
    Boys: ['Gi top', 'Gi pants', 'Shirt','Shorts', 'Tracksuit', 'Other'],
    Girls: ['Gi top', 'Gi pants', 'Shirt', 'Shorts', 'Tracksuit', 'Other'],
  },
  Judo: {
    Boys: ['Gi top', 'Gi pants', 'Shirt', 'Shorts', 'Tracksuit', 'Other'],
    Girls: ['Gi top', 'Gi pants', 'Shirt', 'Shorts', 'Tracksuit', 'Other'],
  },
  Taekwondo: {
    Boys: ['Dobok top', 'Dobok pants', 'Shirt', 'Shorts', 'Tracksuit', 'Other'],
    Girls: ['Dobok top', 'Dobok pants', 'Shirt', 'Shorts', 'Tracksuit', 'Other'],
  },
  'Jiu-Jitsu': {
    Boys: ['Gi top', 'Gi pants', 'Rash guard', 'Shorts', 'Shirt', 'Tracksuit', 'Other'],
    Girls: ['Gi top', 'Gi pants', 'Rash guard', 'Shorts','Shirt', 'Tracksuit', 'Other'],
  },
  MMA: {
    Boys: ['Shorts', 'Rash guard', 'Shirt', 'Tracksuit', 'Other'],
    Girls: ['Shorts', 'Rash guard', 'Shirt', 'Tracksuit', 'Other'],
  },
  Mountainbike: {
    Boys: ['Cycling jersey & Shirt', 'Cycling shorts', 'MTB shorts', 'Wind jacket', 'Tracksuit','Other'],
    Girls: ['Cycling jersey & Shirt', 'Cycling shorts', 'MTB shorts', 'Wind jacket', 'Tracksuit', 'Other'],
  },
  Roadbike: {
    Boys: ['Cycling jersey & Shirt', 'Cycling shorts', 'Wind jacket', 'Arm warmers', 'Tracksuit', 'Other'],
    Girls: ['Cycling jersey & Shirt', 'Cycling shorts', 'Wind jacket', 'Arm warmers', 'Tracksuit', 'Other'],
  },
  Rollerskating: {
    Boys: ['Shorts', 'Shirt', 'Tracksuit', 'Other'],
    Girls: ['Leggings', 'Skirt', 'Shorts', 'Shirt', 'Tracksuit', 'Other'],
  },
  'Ice skating': {
    Boys: ['Pants', 'Shirt', 'Tracksuit', 'Other'],
    Girls: ['Dress', 'Skirt', 'Leggings', 'Shirt', 'Tracksuit', 'Other'],
  },
  'Ice hockey': {
    Boys: ['Jersey & Shirt', 'Pants', 'Socks', 'Tracksuit', 'Other'],
    Girls: ['Jersey & Shirt', 'Skirt','Pants', 'Socks', 'Tracksuit', 'Other'],
  },
  Dancing: {
    Boys: ['Shirt', 'Pants', 'Tracksuit', 'Other'],
    Girls: ['Top', 'Skirt','Shirt','Leggings', 'Dress', 'Tracksuit', 'Other'],
  },
  Ballet: {
    Boys: ['Vest', 'Tights', 'Shirt', 'Pants', 'Tracksuit', 'Other'],
    Girls: ['Leotard', 'Tights', 'Skirt', 'Tracksuit', 'Other'],
  },
  'Rock climbing': {
    Boys: ['Pants', 'Shirt', 'Shorts', 'Tracksuit', 'Other'],
    Girls: ['Pants', 'Shirt', 'Shorts', 'Tracksuit', 'Other'],
  },
  'Horse riding': {
    Boys: ['Breeches', 'Jacket', 'Shirt', 'Gloves', 'Helmet cover', 'Pants', 'Tracksuit', 'Other'],
    Girls: ['Breeches', 'Jacket', 'Shirt', 'Gloves', 'Helmet cover', 'Pants', 'Tracksuit', 'Other'],
  },
  Chess: {
    Boys: ['Club shirt', 'Club jacket', 'Tracksuit', 'Other'],
    Girls: ['Club shirt', 'Club jacket', 'Tracksuit', 'Other'],
  },
  Robotics: {
    Boys: ['Club shirt', 'Club jacket', 'Tracksuit', 'Other'],
    Girls: ['Club shirt', 'Club jacket', 'Tracksuit', 'Other'],
  },
  Jukskei: {
    Boys: ['Jersey & Shirt', 'Shorts', 'Tracksuit', 'Other'],
    Girls: ['Jersey & Shirt', 'Shorts', 'Training top', 'Tracksuit', 'Other'],
  },
  Bowling: {
    Boys: ['Jersey & Shirt', 'Pants', 'Training top', 'Tracksuit', 'Other'],
    Girls: ['Jersey & Shirt', 'Pants', 'Training top', 'Tracksuit', 'Other'],
  },
};

const defaultClothingItems: ClothingItems = {
  Boys: ['Jersey & Shirt', 'Shorts', 'Socks', 'Tracksuit', 'Other'],
  Girls: ['Jersey & Shirt', 'Shorts', 'Socks', 'Skirt', 'Tracksuit', 'Other'],
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

interface SchoolUniformProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'sports' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
}

const SchoolUniformComponent: React.FC<SchoolUniformProps> = ({ userType, onItemSelect, categoryFilter = 'all', schoolName: propSchoolName }) => {
  const [selectedItem, setSelectedItem] = useState('');
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [condition, setCondition] = useState<number | undefined>();
  const [price, setPrice] = useState('');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState(propSchoolName || '');
  const [size, setSize] = useState('');
  const [showItemView, setShowItemView] = useState(false);
  const [selectedAvailableItem, setSelectedAvailableItem] = useState<any>(null);
  const [selectedSport, setSelectedSport] = useState('');
  const [showSportItems, setShowSportItems] = useState(false);
  const [selectedSportGender, setSelectedSportGender] = useState<'Boys' | 'Girls' | 'Unisex' | ''>('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState<number | undefined>();
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [photoViewer, setPhotoViewer] = useState<string | null>(null);
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
  const bagSizes = ['One Size'];

  const getFilteredItems = () => {
    if (userType !== 'buyer' || !schoolName) {
      console.log('SchoolUniform: Not showing items - userType:', userType, 'schoolName:', schoolName);
      return [];
    }

    console.log('SchoolUniform: Filtering items for school:', schoolName);
    console.log('SchoolUniform: Total listings:', listings.length);
    
    let items = listings.filter(listing => {
      if (listing.category !== 'School & sport uniform') return false;
      if (listing.school !== schoolName) return false;
      return true;
    }).map(listing => ({
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
    
    console.log('SchoolUniform: Filtered items for', schoolName, ':', items.length);
    
    if (sizeFilter) {
      items = items.filter(item => item.size.toLowerCase().includes(sizeFilter.toLowerCase()));
    }
    
    if (conditionFilter) {
      items = items.filter(item => item.condition === conditionFilter);
    }
    
    if (priceRange.max > 0 && priceRange.max < Math.max(0, ...listings.filter(l => l.category === 'School & sport uniform' && l.school === schoolName).map(l => l.price))) {
      items = items.filter(item => item.price <= priceRange.max);
    }
    if (priceRange.min > 0) {
      items = items.filter(item => item.price >= priceRange.min);
    }
    
    return items;
  };

  const getConditionText = (condition: number) => {
    const conditions = { 1: 'Brand new', 2: 'Like new', 3: 'Used but good', 4: 'Used and worn' };
    return conditions[condition as keyof typeof conditions] || 'Unknown';
  };

  const uniformCategories = {
    'Boys Uniform': {
      items: ['Short sleeve shirts', 'Long sleeve shirts', 'Trousers', 'Shorts', 'Jersey or pullover', 'Blazer', 'Tie'],
      icon: shirtOutline,
      color: '#004aad'
    },
    'Girls Uniform': {
      items: ['Blouse','Short sleeve shirts', 'Long sleeve shirts', 'Trousers', 'Skirt or tunic', 'Dress', 'Jersey or pullover', 'Blazer', 'Tie', 'Tights'],
      icon: shirtOutline,
      color: '#E74C3C'
    },
    'Unisex Items': {
      items: ['School tracksuit', 'PE shirt', 'Socks','PE shorts', 'Rain jacket', 'Windbreaker', 'Hat or cap', 'Scarf & gloves', 'School bag', 'Drimac', 'Duffelbag', 'Sportsbag'],
      icon: bagOutline,
      color: '#27AE60'
    }
  };

  const getFilteredCategories = () => {
    switch (categoryFilter) {
      case 'clothing':
        return { 
          'Boys Uniform': uniformCategories['Boys Uniform'],
          'Girls Uniform': uniformCategories['Girls Uniform'],
          'Unisex Items': {
            ...uniformCategories['Unisex Items'],
            items: uniformCategories['Unisex Items'].items.filter(item => 
              !['School bag', 'Drimac', 'Duffelbag', 'Sportsbag', 'Lunchbag', 'Totebag', 'Backpack', 'Suitcase'].includes(item)
            )
          }
        };
      default:
        return uniformCategories;
    }
  };

  const getSizeOptions = (item: string) => {
    const bagItems = ['School bag', 'Drimac', 'Duffelbag', 'Sportsbag', 'Lunchbag', 'Totebag', 'Backpack', 'Suitcase'];
    if (bagItems.includes(item)) {
      return bagSizes;
    }
    return [...childrenSizes, ...teenSizes];
  };

  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    setShowItemDetails(true);
  };

  const handleAddToCart = (item: any) => {
    if (item.quantity === 0) {
      setToastMessage(`${item.item} is sold out!`);
      setShowToast(true);
      return;
    }

    const cartItem = {
      id: item.id,
      name: item.item,
      description: item.description || `${item.item} - Size: ${item.size}`,
      price: item.price,
      condition: item.condition,
      school: schoolName,
      size: item.size,
      gender: item.gender || '',
      frontPhoto: item.frontPhoto,
      backPhoto: item.backPhoto,
      category: item.category || 'School Uniform',
      subcategory: item.subcategory,
      sport: item.sport,
      quantity: 1
    };

    addToCart(cartItem);
    setAddedToCartId(item.id);
    setTimeout(() => setAddedToCartId(null), 2000);
  };

  const handleAvailableItemClick = (item: any) => {
    setSelectedAvailableItem(item);
    setShowItemView(true);
  };

  const handlePhotoUpload = (type: 'front' | 'back') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          setToastMessage(validation.error || 'Invalid image file');
          setShowToast(true);
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          if (type === 'front') {
            setFrontPhoto(event.target?.result as string);
          } else {
            setBackPhoto(event.target?.result as string);
          }
        };
        reader.onerror = () => {
          setToastMessage('Failed to read image file. Please try a different image.');
          setShowToast(true);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const renderPhotoViewer = () => {
    if (!photoViewer) return null;
    
    return createPortal(
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={() => setPhotoViewer(null)}
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
            onClick={() => setPhotoViewer(null)}
          >
            ×
          </button>
          <img 
            src={photoViewer}
            alt="Zoomed view"
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: '8px',
              border: '1px solid #ddd',
              touchAction: 'pinch-zoom'
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          />
        </div>
      </div>,
      document.body
    );
  };

  const rainbowColors = ['#FF2090', '#FFA020', '#A020C0', '#5CC840', '#00AACC'];

  const renderSportIcon = (icon: any) => {
    if (typeof icon === 'string' && (icon.includes('.svg') || icon.includes('.png'))) {
      return <IonIcon src={icon} style={{ fontSize: '40px', color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />;
    }
    return <IonIcon icon={icon} style={{ fontSize: '40px', color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />;
  };

  const renderSportGrid = (sports: Array<{ name: string; icon: any }>) => (
    <IonGrid>
      <IonRow>
        {sports.map((sport, index) => (
          <IonCol size="4" key={index}>
            <div onClick={() => { if (schoolName) { setSelectedSport(sport.name); setSelectedSportGender(''); setShowSportItems(true); } }}
              style={{ cursor: schoolName ? 'pointer' : 'not-allowed', textAlign: 'center', opacity: schoolName ? 1 : 0.5, padding: '4px 2px' }}>
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

  const handleSubmit = async () => {
    console.log('SchoolUniform: handleSubmit called, userType:', userType);
    if (userType === 'seller') {
      const missingFields = [];
      if (!size) missingFields.push('Size');
      if (!condition) missingFields.push('Condition');
      if (!price) missingFields.push('Price');
      if (!frontPhoto) missingFields.push('Front Photo');
      if (!backPhoto) missingFields.push('Back Photo');
      
      if (missingFields.length > 0) {
        console.log('SchoolUniform: Missing fields:', missingFields);
        setToastMessage(`Please fill in: ${missingFields.join(', ')}`);
        setShowToast(true);
        return;
      }

      const itemData = {
        id: Date.now().toString(),
        name: selectedItem,
        description: `${selectedItem} - Size: ${size}`,
        school: schoolName,
        gender: 'Unisex',
        size,
        condition: condition || 1,
        price: parseInt(price),
        frontPhoto: frontPhoto || '',
        backPhoto: backPhoto || '',
        category: 'School & sport uniform',
        sport: selectedSport || undefined,
        dateCreated: new Date().toLocaleDateString(),
        quantity: 1
      };

      console.log('SchoolUniform: Submitting item:', itemData.name);
      setIsSubmitting(true);
      
      try {
        await addListing(itemData);
        console.log('SchoolUniform: Item listed successfully');
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
        console.error('SchoolUniform: Error listing item:', error);
        setToastMessage(error.message || 'Failed to list item');
        setShowToast(true);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const itemData = {
        item: selectedItem,
        size,
        condition,
        price,
        frontPhoto,
        backPhoto,
        schoolName
      };
      onItemSelect?.(itemData);
      setShowItemDetails(false);
      setSelectedItem('');
      setSize('');
    }
  };

  // --- Sport clothing items grid (sports uniform path) ---
  if (categoryFilter === 'sports' && showSportItems && !showItemDetails) {
    const availableGenders = getAvailableGenders(selectedSport);
    const isUnisexOnly = availableGenders.length === 1 && availableGenders[0] === 'Unisex';
    const availableCountForItem = (itemName: string) =>
      getFilteredItems().filter(i => i.item === itemName && i.sport === selectedSport).reduce((sum, i) => sum + i.quantity, 0);
    const schoolHeader = schoolName && (
      <div style={{ marginBottom: '16px', textAlign: 'center', backgroundColor: 'rgba(0, 74, 173, 0.1)', border: '2px solid #004aad', borderRadius: '12px', padding: '12px' }}>
        <h3 style={{ margin: '0', color: '#004aad', fontSize: '16px', fontWeight: 'bold' }}>{schoolName}</h3>
        <p style={{ margin: '2px 0 0 0', color: '#666', fontSize: '12px' }}>Selected School</p>
      </div>
    );

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
                  <div style={{ position: 'relative', width: '70px', margin: '0 auto 6px' }}>
                    <div style={{
                      width: '70px', height: '70px', borderRadius: '50%',
                      backgroundColor: rainbowColors[index % rainbowColors.length],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      padding: '4px'
                    }}>
                      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '10px', lineHeight: '1.1', textAlign: 'center' }}>
                        {item}
                      </span>
                    </div>
                    {userType === 'buyer' && count > 0 && (
                      <span style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        backgroundColor: '#E74C3C', color: 'white',
                        fontSize: '10px', fontWeight: '700',
                        minWidth: '18px', height: '18px', borderRadius: '9px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        zIndex: 10, pointerEvents: 'none'
                      }}>
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </div>
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
        {schoolHeader}
        <div style={{ textAlign: 'center', margin: '0 0 16px 0' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#666' }}>{selectedSport} Kit</span>
        </div>
        {isUnisexOnly ? (
          renderItemsGrid(getItemsForGender(selectedSport, 'Unisex'), 'Unisex')
        ) : (
          <IonAccordionGroup>
            {availableGenders.map((gender) => {
              const genderColor = gender === 'Boys' ? '#004aad' : gender === 'Girls' ? '#E74C3C' : '#27AE60';
              const genderIcon = gender === 'Boys' ? manOutline : gender === 'Girls' ? womanOutline : maleFemaleOutline;
              return (
                <IonAccordion key={gender} value={gender}>
                  <IonItem slot="header" style={{ '--background': 'transparent' }}>
                    <IonIcon
                      icon={genderIcon}
                      style={{ fontSize: '24px', color: genderColor, marginRight: '12px' }}
                    />
                    <IonLabel>
                      <h3 style={{ margin: '0', fontWeight: 'bold', color: genderColor, fontSize: '16px' }}>
                        {gender}
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
        <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMessage} duration={2000} position="bottom"
          color={toastMessage.includes('successfully') ? 'success' : 'danger'} />
      </div>
    );
  }

  // --- Sports uniform main view (sport categories accordion) ---
  if (categoryFilter === 'sports' && !showItemDetails) {
    return (
      <div>
        <div style={{
          marginBottom: '16px', textAlign: 'center',
          backgroundColor: '#004aad',
          borderRadius: '12px', padding: '16px'
        }}>
          <div style={{
            width: '48px', height: '48px', margin: '0 auto 8px',
            backgroundColor: 'white',
            WebkitMaskImage: `url(${schoolClothing})`,
            maskImage: `url(${schoolClothing})`,
            WebkitMaskSize: 'contain', maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center', maskPosition: 'center'
          } as React.CSSProperties} />
          <h2 style={{ margin: '0', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>Sports Uniform</h2>
          <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>School sports kits & uniforms</p>
        </div>

        {propSchoolName && (
          <div style={{ marginBottom: '16px', textAlign: 'center', backgroundColor: 'rgba(0, 74, 173, 0.1)', border: '2px solid #004aad', borderRadius: '12px', padding: '12px' }}>
            <IonIcon icon={schoolOutline} style={{ fontSize: '24px', color: '#004aad', marginBottom: '4px' }} />
            <h3 style={{ margin: '0', color: '#004aad', fontSize: '16px', fontWeight: 'bold' }}>{propSchoolName}</h3>
            <p style={{ margin: '2px 0 0 0', color: '#666', fontSize: '12px' }}>Selected School</p>
          </div>
        )}

        {!propSchoolName && (
          <div style={{ marginBottom: '20px' }}>
            <SchoolSelector value={schoolName} onSchoolChange={setSchoolName} placeholder="Select or enter school name" />
          </div>
        )}

        {!schoolName && (
          <div style={{ padding: '12px', textAlign: 'center', color: '#666', fontSize: '14px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '16px' }}>
            Select a school above to browse or list sports clothing
          </div>
        )}

        <IonAccordionGroup>
          {Object.entries(sportCategories).map(([categoryName, categoryData]) => (
            <IonAccordion key={categoryName} value={categoryName}>
              <IonItem slot="header" style={{ '--background': 'transparent', opacity: schoolName ? 1 : 0.5 }}>
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

        <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMessage} duration={2000} position="bottom"
          color={toastMessage.includes('successfully') ? 'success' : 'danger'} />
      </div>
    );
  }

  if (showItemView && selectedAvailableItem) {
    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => setShowItemView(false)}>← Back</IonButton>
        
        {/* Prominent School Header */}
        {schoolName && (
          <div style={{ 
            marginBottom: '20px', 
            textAlign: 'center', 
            backgroundColor: 'rgba(52, 152, 219, 0.1)', 
            border: '2px solid #004aad', 
            borderRadius: '12px', 
            padding: '16px' 
          }}>
            <IonIcon 
              icon={schoolOutline} 
              style={{ 
                fontSize: '32px', 
                color: '#004aad', 
                marginBottom: '8px' 
              }} 
            />
            <h2 style={{ 
              margin: '0', 
              color: '#004aad', 
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
        
        <div style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
          <span style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#666' 
          }}>
            {selectedAvailableItem.item}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', margin: '16px 0', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <img
              src={selectedAvailableItem.frontPhoto}
              alt="Front view"
              onClick={() => setPhotoViewer(selectedAvailableItem.frontPhoto)}
              style={{
                width: '150px', height: '200px', borderRadius: '8px',
                objectFit: 'cover', border: '1px solid #ddd', cursor: 'pointer'
              }}
            />
            <p style={{ fontSize: '12px', margin: '4px 0', fontWeight: 'bold' }}>Front</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img
              src={selectedAvailableItem.backPhoto}
              alt="Back view"
              onClick={() => setPhotoViewer(selectedAvailableItem.backPhoto)}
              style={{
                width: '150px', height: '200px', borderRadius: '8px',
                objectFit: 'cover', border: '1px solid #ddd', cursor: 'pointer'
              }}
            />
            <p style={{ fontSize: '12px', margin: '4px 0', fontWeight: 'bold' }}>Back</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', margin: '16px 0' }}>
          <div style={{ marginBottom: '8px' }}><strong>Size:</strong> {selectedAvailableItem.size}</div>
          <div style={{ marginBottom: '8px' }}><strong>Condition:</strong> {getConditionText(selectedAvailableItem.condition)}</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#E74C3C' }}>R{selectedAvailableItem.price}</div>
        </div>

        <IonButton 
          expand="full" 
          onClick={() => handleAddToCart(selectedAvailableItem)}
          disabled={selectedAvailableItem.quantity === 0}
          style={{ 
            marginTop: '16px',
            '--background': addedToCartId === selectedAvailableItem.id ? '#28a745' : '',
            '--color': addedToCartId === selectedAvailableItem.id ? 'white' : ''
          }}
        >
          {selectedAvailableItem.quantity === 0 ? 'Sold Out' :
           addedToCartId === selectedAvailableItem.id ? '✓ Added to Cart!' : 'Add to Cart'}
        </IonButton>
        {renderPhotoViewer()}
      </div>
    );
  }

  if (showItemDetails) {
    const availableItems = getFilteredItems().filter(listing => listing.item === selectedItem);

    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => setShowItemDetails(false)}>← Back</IonButton>

        {/* Prominent School Header */}
        {schoolName && (
          <div style={{
            marginBottom: '20px',
            textAlign: 'center',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            border: '2px solid #004aad',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <IonIcon
              icon={schoolOutline}
              style={{
                fontSize: '32px',
                color: '#004aad',
                marginBottom: '8px'
              }}
            />
            <h2 style={{
              margin: '0',
              color: '#004aad',
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

        <div style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
          <span style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#666'
          }}>
            {selectedItem}
          </span>
        </div>

        {userType === 'buyer' ? (
          <>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {([{ label: 'All', value: undefined }, { label: 'Brand new', value: 1 }, { label: 'Like new', value: 2 }, { label: 'Used - good', value: 3 }, { label: 'Used - worn', value: 4 }] as { label: string; value: number | undefined }[]).map(c => (
                  <button key={c.label} onClick={() => setConditionFilter(c.value)} style={{
                    padding: '5px 12px', borderRadius: '20px', border: 'none',
                    backgroundColor: conditionFilter === c.value ? '#004aad' : '#f0f0f0',
                    color: conditionFilter === c.value ? 'white' : '#555',
                    fontSize: '12px', fontWeight: conditionFilter === c.value ? '600' : '400',
                    cursor: 'pointer', whiteSpace: 'nowrap'
                  }}>{c.label}</button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PriceRangeSlider
                  min={0}
                  max={Math.max(1, ...listings.filter(l => l.category === 'School & sport uniform' && l.school === schoolName).map(l => l.price))}
                  value={priceRange.max === 0 ? { min: 0, max: Math.max(1, ...listings.filter(l => l.category === 'School & sport uniform' && l.school === schoolName).map(l => l.price)) } : priceRange}
                  onChange={setPriceRange}
                  accentColor="#004aad"
                />
              </div>
            </div>
            {availableItems.length > 0 ? (
              <div style={{ margin: '16px 0' }}>
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{ margin: '0', color: '#666', fontSize: '14px' }}>Available ({availableItems.length})</h4>
                </div>
                {availableItems.map(item => (
                  <IonCard key={item.id} style={{ margin: '8px 0' }}>
                    <IonCardContent style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                          <div
                            style={{
                              width: '40px', height: '50px', backgroundColor: item.frontPhoto ? 'transparent' : '#f0f0f0',
                              border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontSize: '8px', color: '#999', textAlign: 'center',
                              lineHeight: '1.2', cursor: 'pointer',
                              backgroundImage: item.frontPhoto ? `url(${item.frontPhoto})` : 'none',
                              backgroundSize: 'cover', backgroundPosition: 'center'
                            }}
                            onClick={() => setPhotoViewer(item.frontPhoto)}
                          >
                            {!item.frontPhoto && 'Front'}
                          </div>
                          <div
                            style={{
                              width: '40px', height: '50px', backgroundColor: item.backPhoto ? 'transparent' : '#f0f0f0',
                              border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontSize: '8px', color: '#999', textAlign: 'center',
                              lineHeight: '1.2', cursor: 'pointer',
                              backgroundImage: item.backPhoto ? `url(${item.backPhoto})` : 'none',
                              backgroundSize: 'cover', backgroundPosition: 'center'
                            }}
                            onClick={() => setPhotoViewer(item.backPhoto)}
                          >
                            {!item.backPhoto && 'Back'}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.school}</span>
                            {item.quantity === 0 ? (
                              <IonBadge color="danger" style={{ fontSize: '9px' }}>
                                <IonIcon icon={closeCircleOutline} style={{ marginRight: '2px', fontSize: '10px' }} />
                                Sold Out
                              </IonBadge>
                            ) : (
                              <IonBadge color="success" style={{ fontSize: '9px' }}>
                                <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '2px', fontSize: '10px' }} />
                                {item.quantity} left
                              </IonBadge>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '6px', fontSize: '12px', color: '#666' }}>
                            <span>Size: {item.size}</span>
                            <span>{getConditionText(item.condition)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#004aad' }}>R{item.price}</span>
                            <IonButton
                              size="small"
                              onClick={() => {
                                handleAddToCart(item);
                              }}
                              disabled={item.quantity === 0}
                              style={{
                                '--background': addedToCartId === item.id ? '#28a745' : '',
                                '--color': addedToCartId === item.id ? 'white' : ''
                              }}
                            >
                              {item.quantity === 0 ? 'Sold Out' :
                               addedToCartId === item.id ? '✓ Added!' : 'Add to Cart'}
                            </IonButton>
                          </div>
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                ))}
              </div>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: '#666', backgroundColor: '#f8f9fa', borderRadius: '8px', margin: '16px 0' }}>
                <p style={{ margin: '0' }}>No {selectedItem} available yet</p>
              </div>
            )}
          </>
        ) : (
          <>
            <IonItem>
              <IonLabel position="stacked">Size</IonLabel>
              <IonSelect value={size} onIonChange={e => setSize(e.detail.value)} placeholder="Select Size">
                {getSizeOptions(selectedItem).map(sizeOption => (
                  <IonSelectOption key={sizeOption} value={sizeOption}>{sizeOption}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Condition Grade</IonLabel>
              <IonSelect value={condition} onIonChange={e => setCondition(parseInt(e.detail.value))}>
                <IonSelectOption value={1}>1 - Brand new</IonSelectOption>
                <IonSelectOption value={2}>2 - Like new</IonSelectOption>
                <IonSelectOption value={3}>3 - Used but good</IonSelectOption>
                <IonSelectOption value={4}>4 - Used and worn</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonInput label="Price (ZAR)" type="number" value={price} onIonChange={e => setPrice(e.detail.value!)} />
            </IonItem>

            <div style={{ display: 'flex', gap: '16px', margin: '16px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  onClick={() => handlePhotoUpload('front')}
                  style={{
                    width: '120px', height: '150px', border: '2px dashed #ccc', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    backgroundImage: frontPhoto ? `url(${frontPhoto})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center'
                  }}
                >
                  {!frontPhoto && <IonIcon icon={cameraOutline} size="large" />}
                </div>
                <p style={{ fontSize: '12px', margin: '4px 0' }}>Front Photo</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  onClick={() => handlePhotoUpload('back')}
                  style={{
                    width: '120px', height: '150px', border: '2px dashed #ccc', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    backgroundImage: backPhoto ? `url(${backPhoto})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center'
                  }}
                >
                  {!backPhoto && <IonIcon icon={cameraOutline} size="large" />}
                </div>
                <p style={{ fontSize: '12px', margin: '4px 0' }}>Back Photo</p>
              </div>
            </div>

            <IonButton expand="full" onClick={() => { console.log('Button clicked!'); handleSubmit(); }} disabled={isSubmitting} style={{ marginTop: '16px' }}>
              {isSubmitting ? 'Listing...' : 'List Item'}
            </IonButton>
          </>
        )}
        {renderPhotoViewer()}
      </div>
    );
  }

  return (
    <div>
      <div style={{
        marginBottom: '16px', textAlign: 'center',
        backgroundColor: '#FF2090',
        borderRadius: '12px', padding: '16px'
      }}>
        <div style={{
          width: '48px', height: '48px', margin: '0 auto 8px',
          backgroundColor: 'white',
          WebkitMaskImage: `url(${schoolClothing})`,
          maskImage: `url(${schoolClothing})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center'
        } as React.CSSProperties} />
        <h2 style={{ margin: '0', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
          School & Sport Uniform
        </h2>
        <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>
          School uniforms, sports kits & accessories
        </p>
      </div>

      {/* Prominent School Header */}
      {propSchoolName && (
        <div style={{ 
          marginBottom: '20px', 
          textAlign: 'center', 
          backgroundColor: 'rgba(52, 152, 219, 0.1)', 
          border: '2px solid #004aad', 
          borderRadius: '12px', 
          padding: '16px' 
        }}>
          <IonIcon 
            icon={schoolOutline} 
            style={{ 
              fontSize: '32px', 
              color: '#004aad', 
              marginBottom: '8px' 
            }} 
          />
          <h2 style={{ 
            margin: '0', 
            color: '#004aad', 
            fontSize: '18px', 
            fontWeight: 'bold' 
          }}>
            {propSchoolName}
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
      
      {/* School Selection - only show if no school name provided */}
      {!propSchoolName && (
        <div style={{ marginBottom: '20px' }}>
          <SchoolSelector 
            value={schoolName} 
            onSchoolChange={setSchoolName}
            placeholder="Select or enter school name"
          />
        </div>
      )}

      {/* Available Items Grid for Buyers or Category Selection for Sellers */}
      {userType === 'buyer' && schoolName ? (
        <IonAccordionGroup>
          {Object.entries(getFilteredCategories()).map(([category, categoryData]) => (
            <IonAccordion key={category} value={category}>
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
                    {category}
                  </h3>
                </IonLabel>
              </IonItem>
              <div slot="content" style={{ padding: '8px' }}>
                <IonGrid>
                  <IonRow>
                    {categoryData.items.map((item: string, index: number) => {
                      const itemCount = getFilteredItems().filter(listing => listing.item === item).reduce((total: number, listing: any) => total + listing.quantity, 0);
                      return (
                        <IonCol size="4" key={index}>
                          <div
                            onClick={() => handleItemClick(item)}
                            style={{ cursor: 'pointer', textAlign: 'center', padding: '4px 2px' }}
                          >
                            <div style={{ position: 'relative', width: '70px', margin: '0 auto 6px' }}>
                              <div style={{
                                width: '70px', height: '70px', borderRadius: '50%',
                                backgroundColor: rainbowColors[index % rainbowColors.length],
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                padding: '4px'
                              }}>
                                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '10px', lineHeight: '1.1', textAlign: 'center' }}>
                                  {item}
                                </span>
                              </div>
                              {itemCount > 0 && (
                                <span style={{
                                  position: 'absolute', top: '-4px', right: '-4px',
                                  backgroundColor: '#E74C3C', color: 'white',
                                  fontSize: '10px', fontWeight: '700',
                                  minWidth: '18px', height: '18px', borderRadius: '9px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  padding: '0 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                                  zIndex: 10, pointerEvents: 'none'
                                }}>
                                  {itemCount > 99 ? '99+' : itemCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </IonCol>
                      );
                    })}
                  </IonRow>
                </IonGrid>
              </div>
            </IonAccordion>
          ))}
        </IonAccordionGroup>
      ) : categoryFilter === 'clothing' ? (
        <IonAccordionGroup disabled={!schoolName}>
          {Object.entries(getFilteredCategories()).map(([category, categoryData]) => (
            <IonAccordion key={category} value={category} disabled={!schoolName}>
              <IonItem slot="header" style={{ '--background': 'transparent', opacity: !schoolName ? 0.5 : 1 }}>
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
                    {category}
                  </h3>
                </IonLabel>
              </IonItem>
              <div slot="content" style={{ padding: '8px' }}>
                <IonGrid>
                  <IonRow>
                    {categoryData.items.map((item: string, index: number) => (
                      <IonCol size="4" key={index}>
                        <div
                          onClick={() => schoolName && handleItemClick(item)}
                          style={{ cursor: schoolName ? 'pointer' : 'not-allowed', textAlign: 'center', padding: '4px 2px', opacity: !schoolName ? 0.5 : 1 }}
                        >
                          <div style={{
                            width: '70px', height: '70px', borderRadius: '50%',
                            backgroundColor: rainbowColors[index % rainbowColors.length],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 6px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            padding: '4px'
                          }}>
                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '10px', lineHeight: '1.1', textAlign: 'center' }}>
                              {item}
                            </span>
                          </div>
                        </div>
                      </IonCol>
                    ))}
                  </IonRow>
                </IonGrid>
              </div>
            </IonAccordion>
          ))}
        </IonAccordionGroup>
      ) : (
        <IonAccordionGroup disabled={!schoolName}>
          {Object.entries(getFilteredCategories()).map(([category, categoryData]) => (
            <IonAccordion key={category} value={category} disabled={!schoolName}>
              <IonItem slot="header" style={{ '--background': 'transparent', opacity: !schoolName ? 0.5 : 1 }}>
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
                    {category}
                  </h3>
                </IonLabel>
              </IonItem>
              <div slot="content" style={{ padding: '8px' }}>
                <IonGrid>
                  <IonRow>
                    {categoryData.items.map((item: string, index: number) => (
                      <IonCol size="4" key={index}>
                        <div
                          onClick={() => schoolName && handleItemClick(item)}
                          style={{ cursor: schoolName ? 'pointer' : 'not-allowed', textAlign: 'center', padding: '4px 2px', opacity: !schoolName ? 0.5 : 1 }}
                        >
                          <div style={{
                            width: '70px', height: '70px', borderRadius: '50%',
                            backgroundColor: rainbowColors[index % rainbowColors.length],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 6px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            padding: '4px'
                          }}>
                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '10px', lineHeight: '1.1', textAlign: 'center' }}>
                              {item}
                            </span>
                          </div>
                        </div>
                      </IonCol>
                    ))}
                  </IonRow>
                </IonGrid>
              </div>
            </IonAccordion>
          ))}
        </IonAccordionGroup>
      )}
      
      {renderPhotoViewer()}
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="bottom"
        color={toastMessage.includes('successfully') ? 'success' : 'danger'}
      />
    </div>
  );
};

export default SchoolUniformComponent;