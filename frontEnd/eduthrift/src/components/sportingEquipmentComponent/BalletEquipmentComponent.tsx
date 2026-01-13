import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface BalletEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?: boolean;

}

const BalletEquipmentComponent: React.FC< BalletEquipmentProps > = (props) => {
  const balletCategories = {
    'Equipment': {
      items: ['Barre', 'Mirror', 'Music Player', 'Rosin'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Leotard', 'Tights', 'Wrap Skirt', 'Warm-up Jacket', 'Leg Warmers'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Toe Pads', 'Blister Plasters', 'Ankle Support'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Ballet Shoes', 'Pointe Shoes', 'Character Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Hair Bun Net', 'Bobby Pins', 'Ballet Bag', 'Water Bottle'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="Ballet"
          sportCategories={balletCategories}
      />
  );
};
export default BalletEquipmentComponent;
