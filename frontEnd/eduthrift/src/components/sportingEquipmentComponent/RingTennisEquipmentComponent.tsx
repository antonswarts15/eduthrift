import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface RingTennisEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const RingTennisEquipmentComponent: React.FC< RingTennisEquipmentProps > = (props) => {

  const ringTennisCategories = {
    'Equipment': {
      items: ['Ring', 'Net', 'Court Markers', 'Score Board'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['T-shirt', 'Shorts', 'Training Shirt', 'Team Jersey'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Knee Pads', 'Wrist Guards'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Court Shoes', 'Training Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Water Bottle', 'Equipment Bag', 'Towel'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="RingTennis"
          sportCategories={ringTennisCategories}
      />
  );
};
export default RingTennisEquipmentComponent;
