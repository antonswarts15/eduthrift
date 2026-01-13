import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface SquashEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const SquashEquipmentComponent: React.FC< SquashEquipmentProps > = (props) =>{

const squashCategories = {
  'Equipment': {
    items: ['Squash Racket', 'Squash Ball', 'Court Markers', 'Training Aids'],
    icon: constructOutline,
    color: '#E74C3C'
  },
  'Clothing': {
    items: ['T-shirt', 'Shorts', 'Skirt', 'Training Top'],
    icon: shirtOutline,
    color: '#3498DB'
  },
  'Protective Gear': {
    items: ['Eye Protection', 'Sweatbands', 'Wrist Guards'],
    icon: shieldOutline,
    color: '#27AE60'
  },
  'Footwear': {
    items: ['Indoor Court Shoes', 'Training Shoes'],
    icon: footstepsOutline,
    color: '#8E44AD'
  },
  'Accessories': {
    items: ['Racket Bag', 'Towel', 'Water Bottle', 'Grip Tape'],
    icon: bagOutline,
    color: '#F39C12'
  }
};
return (
    <GenericSportEquipmentComponent
        {...props}
        sportName="Squash"
        sportCategories={squashCategories}
    />
);
};
export default SquashEquipmentComponent;
