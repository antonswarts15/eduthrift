import React from 'react';
import { constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline } from 'ionicons/icons';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';

interface FootballEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?: boolean;
}

const FootballEquipmentComponent: React.FC<FootballEquipmentProps> = (props) => {
  const footballCategories = {
    'Equipment': {
      items: ['Football', 'Goal Posts', 'Training Cones', 'Agility Ladders', 'Speed Parachute', 'Resistance Bands', 'Ball Pump', 'Training Bibs'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Football Jersey', 'Football Shorts', 'Football Socks', 'Training Shirt', 'Warm-up Jacket', 'Training Shorts', 'Goalkeeper Jersey', 'Base Layer'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Shin Guards', 'Goalkeeper Gloves', 'Mouthguards', 'Ankle Guards', 'Knee Pads'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Football Boots', 'Training Shoes', 'Indoor Shoes', 'Goalkeeper Boots'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Water Bottle', 'Kit Bag', 'Boot Bag', 'Captain Armband', 'Towel', 'Headband'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
    <GenericSportEquipmentComponent
      {...props}
      sportName="Football"
      sportCategories={footballCategories}
    />
  );
};

export default FootballEquipmentComponent;