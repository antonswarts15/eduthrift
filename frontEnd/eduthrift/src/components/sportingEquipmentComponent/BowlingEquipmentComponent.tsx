import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, chevronDownOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface BowlingEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}

const BowlingEquipmentComponent: React.FC< BowlingEquipmentProps > = (props) => {
  const bowlingCategories = {
    'Equipment': {
      items: ['Bowling Ball', 'Bowling Pins', 'Ball Cleaner', 'Towel'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Bowling Shirt', 'Bowling Slacks', 'Bowling Socks'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Wrist Support', 'Bowling Glove', 'Thumb Guard'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Bowling Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Bowling Bag', 'Shoe Covers', 'Rosin Bag'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="Bowling"
          sportCategories={bowlingCategories}
      />
  );
};
export default BowlingEquipmentComponent;
