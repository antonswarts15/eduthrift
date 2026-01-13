import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface RollerSkatingEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const RollerSkatingEquipmentComponent: React.FC< RollerSkatingEquipmentProps > = (props) => {


  const rollerSkatingCategories = {
    'Equipment': {
      items: ['Training Cones', 'Rink Markers', 'Music System'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Athletic Wear', 'Skating Dress', 'Training Shirt', 'Leggings'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Helmet', 'Knee Pads', 'Elbow Pads', 'Wrist Guards', 'Gloves'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Roller Skates', 'Inline Skates'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Skate Bag', 'Tool Kit', 'Wheels', 'Bearings'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="Rollerskating"
          sportCategories={rollerSkatingCategories}
      />
  );
};
export default RollerSkatingEquipmentComponent;
