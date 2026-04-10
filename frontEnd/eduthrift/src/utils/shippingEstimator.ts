import { PUDO_BOX_SIZES, ShippingRate } from '../services/shipping';

export interface ItemEstimate {
  weightKg: number;
  isBulky: boolean;   // true = too big for any Pudo locker regardless of weight
}

export interface BundleShippingAdvice {
  totalWeightKg: number;
  isCourierRequired: boolean;
  courierReason?: string;
  recommendedBox?: ShippingRate;
  warningMessage?: string;
}

// Weight and bulkiness estimates per category/subcategory/sport
// These are conservative estimates to avoid under-sizing
const ITEM_ESTIMATES: Record<string, ItemEstimate> = {
  // ── Oversized / always courier ──────────────────────────────
  'mountain bike':        { weightKg: 14, isBulky: true },
  'bicycle':              { weightKg: 14, isBulky: true },
  'bike':                 { weightKg: 14, isBulky: true },
  'surfboard':            { weightKg: 5,  isBulky: true },
  'kayak':                { weightKg: 20, isBulky: true },
  'canoe':                { weightKg: 20, isBulky: true },
  'golf bag':             { weightKg: 5,  isBulky: true },
  'cricket bag':          { weightKg: 4,  isBulky: true },
  'hockey bag':           { weightKg: 3,  isBulky: true },
  'large sports bag':     { weightKg: 3,  isBulky: true },

  // ── Sports equipment ────────────────────────────────────────
  'hockey stick':         { weightKg: 0.6, isBulky: true },
  'cricket bat':          { weightKg: 1.2, isBulky: true },
  'cricket pads':         { weightKg: 1.5, isBulky: false },
  'cricket helmet':       { weightKg: 0.8, isBulky: false },
  'cricket gloves':       { weightKg: 0.4, isBulky: false },
  'rugby ball':           { weightKg: 0.5, isBulky: false },
  'soccer ball':          { weightKg: 0.5, isBulky: false },
  'netball':              { weightKg: 0.5, isBulky: false },
  'tennis racket':        { weightKg: 0.4, isBulky: false },
  'squash racket':        { weightKg: 0.2, isBulky: false },
  'badminton racket':     { weightKg: 0.1, isBulky: false },
  'swimming goggles':     { weightKg: 0.1, isBulky: false },
  'swimming cap':         { weightKg: 0.05, isBulky: false },
  'shin guards':          { weightKg: 0.3, isBulky: false },
  'mouth guard':          { weightKg: 0.05, isBulky: false },
  'boxing gloves':        { weightKg: 0.8, isBulky: false },
  'helmet':               { weightKg: 0.8, isBulky: false },

  // ── Clothing by size ─────────────────────────────────────────
  // Handled separately in estimateItem() using size field
  'school uniform':       { weightKg: 0.4, isBulky: false },
  'school shirt':         { weightKg: 0.2, isBulky: false },
  'school pants':         { weightKg: 0.4, isBulky: false },
  'school shorts':        { weightKg: 0.25, isBulky: false },
  'school skirt':         { weightKg: 0.25, isBulky: false },
  'school dress':         { weightKg: 0.35, isBulky: false },
  'school jersey':        { weightKg: 0.5, isBulky: false },
  'school blazer':        { weightKg: 0.8, isBulky: false },
  'school jacket':        { weightKg: 0.7, isBulky: false },
  'school tracksuit':     { weightKg: 0.7, isBulky: false },
  'school shoes':         { weightKg: 0.8, isBulky: false },
  'school bag':           { weightKg: 1.0, isBulky: false },
  'backpack':             { weightKg: 1.0, isBulky: false },
  'sports kit':           { weightKg: 0.6, isBulky: false },
  'training wear':        { weightKg: 0.5, isBulky: false },
  'club clothing':        { weightKg: 0.5, isBulky: false },
  'swimming costume':     { weightKg: 0.2, isBulky: false },
  'wetsuit':              { weightKg: 1.5, isBulky: false },

  // ── Books / stationery ───────────────────────────────────────
  'textbook':             { weightKg: 0.8, isBulky: false },
  'workbook':             { weightKg: 0.4, isBulky: false },
  'stationery':           { weightKg: 0.3, isBulky: false },
  'calculator':           { weightKg: 0.2, isBulky: false },
  'laptop':               { weightKg: 2.0, isBulky: false },
  'tablet':               { weightKg: 0.5, isBulky: false },
};

// Size multiplier — larger clothing sizes weigh more
const SIZE_MULTIPLIER: Record<string, number> = {
  '3': 0.6, '4': 0.65, '5': 0.7, '6': 0.75, '7': 0.8, '8': 0.85,
  '10': 0.9, '12': 0.95, '14': 1.0, '16': 1.05,
  'xs': 0.8, 'small': 0.85, 's': 0.85,
  'medium': 1.0, 'm': 1.0,
  'large': 1.15, 'l': 1.15,
  'xl': 1.25, 'xxl': 1.35, '2xl': 1.35, '3xl': 1.45,
};

function lookupEstimate(item: any): ItemEstimate {
  const keys = [
    item.name?.toLowerCase(),
    item.subcategory?.toLowerCase(),
    item.sport?.toLowerCase(),
    item.category?.toLowerCase(),
  ].filter(Boolean);

  for (const key of keys) {
    // Exact match first
    if (ITEM_ESTIMATES[key]) return ITEM_ESTIMATES[key];
    // Partial match
    const found = Object.keys(ITEM_ESTIMATES).find(k => key.includes(k) || k.includes(key));
    if (found) return ITEM_ESTIMATES[found];
  }

  // Default fallback by category
  const cat = item.category?.toLowerCase() || '';
  if (cat.includes('textbook') || cat.includes('book')) return { weightKg: 0.8, isBulky: false };
  if (cat.includes('sport') || cat.includes('equipment')) return { weightKg: 1.0, isBulky: false };
  if (cat.includes('uniform') || cat.includes('clothing') || cat.includes('wear')) return { weightKg: 0.4, isBulky: false };

  return { weightKg: 0.5, isBulky: false }; // generic fallback
}

export function estimateItem(item: any): ItemEstimate {
  const base = lookupEstimate(item);
  if (base.isBulky) return base;

  // Apply size multiplier for clothing
  const sizeKey = item.size?.toLowerCase().trim();
  const multiplier = sizeKey ? (SIZE_MULTIPLIER[sizeKey] ?? 1.0) : 1.0;

  return {
    weightKg: parseFloat((base.weightKg * multiplier).toFixed(2)),
    isBulky: false,
  };
}

export function getBundleShippingAdvice(items: any[]): BundleShippingAdvice {
  const estimates = items.map(item => ({ item, estimate: estimateItem(item) }));

  // Check for any bulky items first
  const bulkyItems = estimates.filter(e => e.estimate.isBulky);
  if (bulkyItems.length > 0) {
    const names = bulkyItems.map(e => e.item.name || e.item.item_name).join(', ');
    return {
      totalWeightKg: 0,
      isCourierRequired: true,
      courierReason: `${names} ${bulkyItems.length === 1 ? 'is' : 'are'} too large for a Pudo locker and must be shipped via The Courier Guy.`,
    };
  }

  const totalWeightKg = parseFloat(
    estimates.reduce((sum, e) => sum + e.estimate.weightKg, 0).toFixed(2)
  );

  // Max Pudo XL is 20kg
  if (totalWeightKg > 20) {
    return {
      totalWeightKg,
      isCourierRequired: true,
      courierReason: `Your bundle weighs an estimated ${totalWeightKg}kg which exceeds the maximum Pudo XL box limit of 20kg. Please use The Courier Guy for delivery.`,
    };
  }

  // Find the smallest box that fits
  const recommendedBox = PUDO_BOX_SIZES.find(
    box => (box.max_weight_kg ?? 0) >= totalWeightKg
  );

  if (!recommendedBox) {
    return {
      totalWeightKg,
      isCourierRequired: true,
      courierReason: `Bundle weight of ${totalWeightKg}kg exceeds all Pudo box sizes. Please use The Courier Guy.`,
    };
  }

  // Warn if close to the box limit (within 20%)
  const utilizationPct = totalWeightKg / (recommendedBox.max_weight_kg ?? 1);
  const warningMessage = utilizationPct > 0.8
    ? `Your estimated bundle weight (${totalWeightKg}kg) is close to the ${recommendedBox.service_level_name} limit of ${recommendedBox.max_weight_kg}kg. Consider sizing up if items are heavier than expected.`
    : undefined;

  return {
    totalWeightKg,
    isCourierRequired: false,
    recommendedBox,
    warningMessage,
  };
}
