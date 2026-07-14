import React from 'react';
import { IonRange } from '@ionic/react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
  accentColor?: string;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min, max, value, onChange, accentColor = '#004aad'
}) => {
  if (max <= min) return null;

  return (
    <div style={{ width: '100%', padding: '0 8px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
        <span style={{ color: accentColor, fontWeight: 600, fontSize: '12px' }}>Price range</span>
        <span style={{ fontSize: '12px', color: '#666' }}>R{value.min} – R{value.max}</span>
      </div>
      <IonRange
        dualKnobs
        min={min}
        max={max}
        step={Math.max(1, Math.floor((max - min) / 100))}
        value={{ lower: value.min, upper: value.max }}
        onIonChange={e => {
          const v = e.detail.value as { lower: number; upper: number };
          onChange({ min: v.lower, max: v.upper });
        }}
        style={{
          width: '100%',
          '--bar-background': '#e0e0e0',
          '--bar-background-active': accentColor,
          '--knob-background': accentColor,
          '--height': '32px'
        } as React.CSSProperties}
      />
    </div>
  );
};

export default PriceRangeSlider;
