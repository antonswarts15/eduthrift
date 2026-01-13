import React from 'react';
import { constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline } from 'ionicons/icons';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';

interface HockeyEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?: boolean;
}

const HockeyEquipmentComponent: React.FC<HockeyEquipmentProps> = (props) => {
  const hockeyCategories = {
    'Equipment': {
      items: ['Hockey Stick', 'Hockey Ball', 'Goal Posts', 'Training Cones', 'Agility Ladders', 'Training Bibs'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Boys Clothing': {
      items: ['Hockey Jersey', 'Hockey Shorts', 'Training Shirt', 'Warm-up Jacket', 'Goalkeeper Jersey', 'Match Jersey Home', 'Match Jersey Away', 'Training Polo', 'Tracksuit Top', 'Tracksuit Pants', 'Team Hoodie', 'Windbreaker', 'Compression Shirt', 'Team Blazer', 'Team Tie', 'Warm-up Pants', 'Training Vest'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Girls Clothing': {
      items: ['Hockey Jersey', 'Hockey Skirt', 'Hockey Shorts', 'Training Shirt', 'Warm-up Jacket', 'Goalkeeper Jersey', 'Match Jersey Home', 'Match Jersey Away', 'Training Polo', 'Tracksuit Top', 'Tracksuit Pants', 'Team Hoodie', 'Windbreaker', 'Compression Shirt', 'Team Blazer', 'Warm-up Pants', 'Training Vest'],
      icon: shirtOutline,
      color: '#E74C3C'
    },
    'Protective Gear': {
      items: ['Shin Guards', 'Mouthguards', 'Goalkeeper Pads', 'Goalkeeper Helmet', 'Gloves', 'Ankle Guards'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Hockey Boots', 'Training Shoes', 'Astro Turf Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Water Bottle', 'Kit Bag', 'Stick Bag', 'Captain Armband', 'Towel'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
    <GenericSportEquipmentComponent
      {...props}
      sportName="Hockey"
      sportCategories={hockeyCategories}
    />
  );
};

export default HockeyEquipmentComponent;