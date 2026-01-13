import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, chevronDownOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface DivingEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const DivingEquipmentComponent: React.FC< DivingEquipmentProps > = (props) => {
  const divingCategories = {
    'Equipment': {
      items: ['Diving Board', 'Starting Blocks', 'Pool Lane Ropes', 'Diving Platform'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Diving Swimsuit', 'Training Swimsuit', 'Swim Cap', 'Rash Guard'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Diving Goggles', 'Nose Clip', 'Ear Plugs'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Pool Shoes', 'Diving Fins'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Towel', 'Swim Bag', 'Water Bottle', 'Kickboard'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="Diving"
          sportCategories={divingCategories}
      />
  );
};
export default DivingEquipmentComponent;
