import React from 'react';
import { constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline } from 'ionicons/icons';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';

interface NetballEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?: boolean;
}

const NetballEquipmentComponent: React.FC<NetballEquipmentProps> = (props) => {
  const netballCategories = {
    'Equipment': {
      items: ['Netball', 'Goal Posts', 'Training Cones', 'Agility Ladders', 'Ball Pump', 'Training Bibs', 'Whistle'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Netball Dress', 'Netball Skirt', 'Training Shirt', 'Warm-up Jacket', 'Training Shorts', 'Base Layer', 'Match Dress Home', 'Match Dress Away', 'Training Polo', 'Tracksuit Top', 'Tracksuit Pants', 'Team Hoodie', 'Windbreaker Jacket', 'Compression Tights', 'Team Blazer', 'Team Scarf', 'Warm-up Pants'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Knee Pads', 'Ankle Guards', 'Mouthguards'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Netball Shoes', 'Training Shoes', 'Court Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Water Bottle', 'Kit Bag', 'Captain Armband', 'Towel', 'Headband'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
    <GenericSportEquipmentComponent
      {...props}
      sportName="Netball"
      sportCategories={netballCategories}
    />
  );
};

export default NetballEquipmentComponent;