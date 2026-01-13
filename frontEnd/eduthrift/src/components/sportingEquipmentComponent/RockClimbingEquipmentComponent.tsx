import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface RockClimbingEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const RockClimbingEquipmentComponent: React.FC< RockClimbingEquipmentProps > = (props) => {

  const rockClimbingCategories = {
    'Equipment': {
      items: ['Climbing Rope', 'Carabiners', 'Belay Device', 'Quickdraws', 'Anchors'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Athletic Shirt', 'Stretch Pants', 'Climbing Shorts', 'Base Layer'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Harness', 'Helmet', 'Chalk Bag', 'Gloves', 'Knee Pads'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Climbing Shoes', 'Approach Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Climbing Bag', 'Rope Bag', 'Chalk', 'Guidebook'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="RockClimbing"
          sportCategories={rockClimbingCategories}
      />
  );
};

export default RockClimbingEquipmentComponent;
