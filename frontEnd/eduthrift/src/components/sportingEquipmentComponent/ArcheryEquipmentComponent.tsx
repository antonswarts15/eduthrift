import React, { useState } from 'react';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';
import SchoolSelector from '../SchoolSelector';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
interface ArcheryEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?: boolean;
}

const ArcheryEquipmentComponent: React.FC<ArcheryEquipmentProps> = (props) => {
  const archeryCategories = {
    'Equipment': {
      items: ['Recurve Bow', 'Compound Bow', 'Arrows (12-pack)', 'Target', 'Bow Stand', 'Quiver'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Archery Shirt', 'Archery Trousers', 'Training Vest'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Arm Guard', 'Finger Tab', 'Chest Guard', 'Shooting Glove'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Archery Shoes', 'Training Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Bow Case', 'Arrow Rest', 'Sight', 'Stabilizer', 'String Wax'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="Archery"
          sportCategories={archeryCategories}
      />
  );
};
export default ArcheryEquipmentComponent;
