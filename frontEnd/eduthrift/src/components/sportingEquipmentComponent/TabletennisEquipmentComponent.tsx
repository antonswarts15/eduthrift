import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';
import SchoolSelector from '../SchoolSelector';

interface TableTennisEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const TableTennisEquipmentComponent: React.FC< TableTennisEquipmentProps > = (props) => {

  const tableTennisCategories = {
    'Equipment': {
      items: ['Table Tennis Bat', 'Table Tennis Balls', 'Table Tennis Table', 'Net Set'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Table Tennis Shirt', 'Table Tennis Shorts', 'Table Tennis Skirt', 'Training Top'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Sweatband', 'Wrist Guards', 'Knee Support'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Indoor Court Shoes', 'Training Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Racket Case', 'Towel', 'Water Bottle', 'Ball Container'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="TableTennis"
          sportCategories={tableTennisCategories}
      />
  );
};
export default TableTennisEquipmentComponent;
