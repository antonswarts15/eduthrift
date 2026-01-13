import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, chevronDownOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';
interface FencingEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const FencingEquipmentComponent: React.FC< FencingEquipmentProps > = (props) => {
  const fencingCategories = {
    'Equipment': {
      items: ['Fencing Sword', 'Foil', 'Épée', 'Sabre'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Fencing Jacket', 'Fencing Pants', 'Under Plastron'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Fencing Mask', 'Fencing Glove', 'Chest Protector', 'Body Cord'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Fencing Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Fencing Bag', 'Weapon Bag', 'Towel', 'Water Bottle'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="Fencing"
          sportCategories={fencingCategories}
      />
  );
};
export default FencingEquipmentComponent;
