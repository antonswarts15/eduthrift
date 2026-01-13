import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, chevronDownOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';
interface BoxingEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const BoxingEquipmentComponent: React.FC< BoxingEquipmentProps > = (props) => {
  const boxingCategories = {
    'Equipment': {
      items: ['Boxing Gloves', 'Punching Bag', 'Speed Bag', 'Focus Mitts'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Boxing Shorts', 'Boxing Tank Top', 'Boxing Robe', 'Training Shirt'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Headgear', 'Mouthguard', 'Groin Guard', 'Chest Protector'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Boxing Shoes', 'Training Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Hand Wraps', 'Boxing Bag', 'Water Bottle', 'Towel'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };
  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="Boxing"
          sportCategories={boxingCategories}
      />
  );
};
export default BoxingEquipmentComponent;
