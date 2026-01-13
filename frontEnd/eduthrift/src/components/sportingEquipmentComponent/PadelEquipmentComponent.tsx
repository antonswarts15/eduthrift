import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface PadelEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const PadelEquipmentComponent: React.FC< PadelEquipmentProps > = (props) => {
  const padelCategories = {
    'Equipment': {
      items: ['Padel Racket', 'Padel Balls', 'Court Net', 'Training Cones'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Sport Shirt', 'Padel Shorts', 'Padel Skirt', 'Training Top'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Sweatbands', 'Wrist Guards', 'Sunglasses', 'Sun Hat'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Padel Shoes', 'Court Shoes'],
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
          sportName="Padel"
          sportCategories={padelCategories}
      />
  );
};
export default PadelEquipmentComponent;
