import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface IceHockeyEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const IceHockeyEquipmentComponent: React.FC< IceHockeyEquipmentProps > = (props) => {

  const iceHockeyCategories = {
    'Equipment': {
      items: ['Hockey Stick', 'Puck', 'Goal Net', 'Training Cones'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Jersey', 'Padded Shorts', 'Practice Jersey', 'Team Socks'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Helmet', 'Pads', 'Gloves', 'Neck Guard', 'Shin Guards'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Ice Hockey Skates', 'Training Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Equipment Bag', 'Stick Tape', 'Water Bottle', 'Blade Guards'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="IceHockey"
          sportCategories={iceHockeyCategories}
      />
  );
};
export default IceHockeyEquipmentComponent;
