import React from 'react';
import { constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline } from 'ionicons/icons';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';

interface RugbyEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?: boolean;
}

const RugbyEquipmentComponent: React.FC<RugbyEquipmentProps> = (props) => {
  const rugbyCategories = {
    'Equipment': {
      items: ['Rugby Ball', 'Kicking Tee', 'Training Cones', 'Tackle Bags', 'Scrum Machine', 'Ruck Pads', 'Hit Shields', 'Agility Ladders', 'Speed Parachute', 'Resistance Bands'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Rugby Jersey', 'Rugby Shorts', 'Rugby Socks', 'Training Shirt', 'Warm-up Jacket', 'Training Shorts', 'Compression Shirt', 'Base Layer', 'Rain Jacket', 'Match Jersey Home', 'Match Jersey Away', 'Training Polo', 'Tracksuit Top', 'Tracksuit Pants', 'Hoodie', 'Windbreaker', 'Thermal Underwear', 'Team Blazer', 'Team Tie', 'Team Scarf'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Scrum Cap', 'Shoulder Pads', 'Mouthguards', 'Shin Guards', 'Body Armor', 'Knee Pads', 'Elbow Pads', 'Chest Guard', 'Thigh Guards'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Rugby Boots', 'Training Shoes', 'Screw-in Studs', 'Moulded Studs', 'Indoor Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Water Bottle', 'Tape', 'Kit Bag', 'Boot Bag', 'Ball Pump', 'Tee Holder', 'Strapping Tape', 'Grip Spray', 'Towel', 'Headband'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
    <GenericSportEquipmentComponent
      {...props}
      sportName="Rugby"
      sportCategories={rugbyCategories}
    />
  );
};

export default RugbyEquipmentComponent;