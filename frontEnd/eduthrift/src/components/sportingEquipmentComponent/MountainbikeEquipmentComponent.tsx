import React from 'react';
import { constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline } from 'ionicons/icons';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';

interface MountainbikeEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?: boolean;
}

const MountainbikeEquipmentComponent: React.FC<MountainbikeEquipmentProps> = (props) => {
  const mountainbikeCategories = {
    'Equipment': {
      items: ['Mountain Bike', 'Bike Pump', 'Repair Kit', 'Bike Lock', 'Bike Lights', 'Bike Computer', 'Chain Tool', 'Tire Pressure Gauge', 'Bike Stand', 'Cleaning Kit'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Cycling Jersey', 'Cycling Shorts', 'Cycling Tights', 'Base Layer', 'Rain Jacket', 'Windbreaker', 'Arm Warmers', 'Leg Warmers', 'Cycling Vest', 'Long Sleeve Jersey', 'Bib Shorts', 'Thermal Jersey', 'Softshell Jacket', 'Cycling Socks', 'Under Shorts', 'Team Jersey', 'Training Top', 'Casual Cycling Shirt', 'Winter Jacket', 'Gilet'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Helmet', 'Knee Pads', 'Elbow Pads', 'Cycling Gloves', 'Back Protector', 'Shin Guards', 'Full Face Helmet', 'Body Armor', 'Wrist Guards'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Cycling Shoes', 'Mountain Bike Shoes', 'Clipless Shoes', 'Flat Pedal Shoes', 'Winter Cycling Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Water Bottle', 'Bike Bag', 'Frame Bag', 'Saddle Bag', 'Tool Kit', 'Chain Lube', 'Tire Levers', 'Spare Tubes', 'Multi Tool', 'Bottle Cage'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
    <GenericSportEquipmentComponent
      {...props}
      sportName="Mountainbike"
      sportCategories={mountainbikeCategories}
    />
  );
};

export default MountainbikeEquipmentComponent;