import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';
import SchoolSelector from '../SchoolSelector';

interface RowingEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const RowingEquipmentComponent: React.FC< RowingEquipmentProps > = (props) => {

  const rowingCategories = {
    'Equipment': {
      items: ['Oars', 'Rowing Shell', 'Ergometer', 'Boat Trailer'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Unisuit', 'Athletic Gear', 'Training Shirt', 'Rowing Shorts'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Life Jacket', 'Sunblock', 'Sun Hat', 'Gloves'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Rowing Shoes', 'Boat Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Water Bottle', 'Equipment Bag', 'Towel', 'Seat Pad'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="Rowing"
          sportCategories={rowingCategories}
      />
  );
};

export default RowingEquipmentComponent;
