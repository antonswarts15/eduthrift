import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';
import SchoolSelector from '../SchoolSelector';

interface TriathlonEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const TriathlonEquipmentComponent: React.FC< TriathlonEquipmentProps > = (props) => {

  const triathlonCategories = {
    'Equipment': {
      items: ['Bike', 'Wetsuit', 'Transition Bag', 'Bike Trainer'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Tri-suit', 'Cycling Jersey', 'Running Shorts', 'Swim Cap'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Helmet', 'Goggles', 'Sunglasses', 'Gloves'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Running Shoes', 'Cycling Shoes', 'Transition Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Water Bottle', 'Energy Gels', 'Race Belt', 'Towel'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="Triathlon"
          sportCategories={triathlonCategories}
      />
  );
};
export default TriathlonEquipmentComponent;
