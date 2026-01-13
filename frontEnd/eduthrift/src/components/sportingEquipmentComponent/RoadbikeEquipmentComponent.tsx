import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';
import SchoolSelector from '../SchoolSelector';

interface RoadBikeEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const RoadBikeEquipmentComponent: React.FC< RoadBikeEquipmentProps > = (props) => {

  const roadBikeCategories = {
    'Equipment': {
      items: ['Road Bike', 'Repair Kit', 'Bike Computer', 'Bike Pump'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Cycling Jersey', 'Bib Shorts', 'Cycling Jacket', 'Base Layer'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Helmet', 'Cycling Gloves', 'Sunglasses', 'Knee Warmers'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Cycling Shoes', 'Cleats'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Water Bottle', 'Saddle Bag', 'Bike Lights', 'Chain Lube'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="RoadBike"
          sportCategories={roadBikeCategories}
      />
  );
};
export default RoadBikeEquipmentComponent;
