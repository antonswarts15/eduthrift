import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface TargetShootingEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const TargetShootingEquipmentComponent: React.FC< TargetShootingEquipmentProps > = (props) => {
  const targetShootingCategories = {
    'Equipment': {
      items: ['Air Rifle', 'Air Pistol', 'Targets', 'Shooting Mat', 'Rifle Stand'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Shooting Jacket', 'Shooting Trousers', 'Competition Shirt'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Eye Protection', 'Ear Protection', 'Shooting Gloves'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Shooting Boots', 'Competition Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Ammunition Box', 'Cleaning Kit', 'Equipment Bag'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };
  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="TargetShooting"
          sportCategories={targetShootingCategories}
      />
  );
};
export default TargetShootingEquipmentComponent;
