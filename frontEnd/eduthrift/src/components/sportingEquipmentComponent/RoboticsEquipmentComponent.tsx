import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface RoboticsEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const RoboticsEquipmentComponent: React.FC< RoboticsEquipmentProps > = (props) => {

  const roboticsCategories = {
    'Equipment': {
      items: ['Robotics Kit', 'Laptop', 'Sensors', 'Motors', 'Programming Cables', 'Competition Mat'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Team T-shirt', 'Team Hoodie', 'Competition Shirt'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Safety Glasses', 'Work Gloves', 'Lab Coat'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Safety Shoes', 'Lab Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Toolkit', 'Storage Box', 'Notebook', 'USB Drive'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="Robotics"
          sportCategories={roboticsCategories}
      />
  );
};

export default RoboticsEquipmentComponent;
