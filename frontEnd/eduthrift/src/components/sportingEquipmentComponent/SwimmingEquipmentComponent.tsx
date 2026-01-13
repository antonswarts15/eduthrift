import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';
import SchoolSelector from '../SchoolSelector';

interface SwimmingEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const SwimmingEquipmentComponent: React.FC< SwimmingEquipmentProps > = (props) => {

  const swimmingCategories = {
    'Equipment': {
      items: ['Kickboard', 'Pull Buoy', 'Fins', 'Paddles', 'Training Equipment'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Swimsuit', 'Swimming Trunks', 'Rash Guard', 'Team Suit'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Goggles', 'Swim Cap', 'Nose Clip', 'Ear Plugs'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Slides', 'Pool Slippers', 'Deck Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Swim Bag', 'Towel', 'Water Bottle', 'Mesh Bag'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="Swimming"
          sportCategories={swimmingCategories}
      />
  );
};
export default SwimmingEquipmentComponent;
