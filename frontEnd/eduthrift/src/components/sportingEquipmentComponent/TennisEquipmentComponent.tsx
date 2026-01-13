import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';
import SchoolSelector from '../SchoolSelector';

interface TennisEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const TennisEquipmentComponent: React.FC< TennisEquipmentProps > = (props) => {
  const tennisCategories = {
    'Equipment': {
      items: ['Tennis Racket', 'Tennis Balls', 'Ball Machine', 'Net'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Boys Clothing': {
      items: ['Tennis Shirt', 'Tennis Shorts', 'Tennis Polo', 'Training Shirt', 'Warm-up Jacket', 'Tracksuit Top', 'Tracksuit Pants', 'Team Hoodie', 'Windbreaker'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Girls Clothing': {
      items: ['Tennis Shirt', 'Tennis Shorts', 'Tennis Skirt', 'Tennis Dress', 'Tennis Polo', 'Training Shirt', 'Warm-up Jacket', 'Tracksuit Top', 'Tracksuit Pants', 'Team Hoodie', 'Windbreaker'],
      icon: shirtOutline,
      color: '#E74C3C'
    },
    'Protective Gear': {
      items: ['Wrist Support', 'Tennis Cap', 'Sunglasses', 'Sweatbands'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Tennis Shoes', 'Court Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Racket Bag', 'Water Bottle', 'Towel', 'Grip Tape'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="Tennis"
          sportCategories={tennisCategories}
      />
  );
};
export default TennisEquipmentComponent;
