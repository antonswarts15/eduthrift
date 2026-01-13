import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface JukskeiEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?: boolean;
}
const JukskeiEquipmentComponent: React.FC< JukskeiEquipmentProps > = (props) => {
  const jukskeiCategories = {
    'Equipment': {
      items: ['Jukskei Pegs', 'Skeis', 'Throwing Block', 'Measuring Tape'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Jukskei T-shirt', 'Jukskei Shorts', 'Team Polo', 'Training Shirt'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Sun Hat', 'Sunglasses', 'Knee Pads'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Sport Shoes', 'Training Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Equipment Bag', 'Water Bottle', 'Towel', 'Score Sheet'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="Jukskei"
          sportCategories={jukskeiCategories}
      />
  );
};
export default JukskeiEquipmentComponent;
