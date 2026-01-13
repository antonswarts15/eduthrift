// Utility functions for handling category routing

export interface CategoryRoute {
  category: string;
  subcategory?: string;
  sport?: string;
  item?: string;
}

export const buildCategoryPath = (route: CategoryRoute): string => {
  const { category, subcategory, sport, item } = route;
  
  if (item) {
    if (sport) {
      return `/item/${encodeURIComponent(category)}/${encodeURIComponent(subcategory || '')}/${encodeURIComponent(sport)}/${encodeURIComponent(item)}`;
    }
    return `/item/${encodeURIComponent(category)}/${encodeURIComponent(subcategory || '')}/${encodeURIComponent(item)}`;
  }
  
  if (sport) {
    return `/category/${encodeURIComponent(category)}/${encodeURIComponent(subcategory || '')}/${encodeURIComponent(sport)}`;
  }
  
  if (subcategory) {
    return `/category/${encodeURIComponent(category)}/${encodeURIComponent(subcategory)}`;
  }
  
  return `/category/${encodeURIComponent(category)}`;
};

export const parseCategoryPath = (pathname: string): CategoryRoute | null => {
  const parts = pathname.split('/').filter(Boolean);
  
  if (parts.length < 2) return null;
  
  const type = parts[0]; // 'category' or 'item'
  const category = decodeURIComponent(parts[1]);
  
  if (type === 'category') {
    return {
      category,
      subcategory: parts[2] ? decodeURIComponent(parts[2]) : undefined,
      sport: parts[3] ? decodeURIComponent(parts[3]) : undefined
    };
  }
  
  if (type === 'item') {
    if (parts.length === 5) {
      // Has sport: /item/category/subcategory/sport/item
      return {
        category,
        subcategory: parts[2] ? decodeURIComponent(parts[2]) : undefined,
        sport: decodeURIComponent(parts[3]),
        item: decodeURIComponent(parts[4])
      };
    } else if (parts.length === 4) {
      // No sport: /item/category/subcategory/item
      return {
        category,
        subcategory: parts[2] ? decodeURIComponent(parts[2]) : undefined,
        item: decodeURIComponent(parts[3])
      };
    }
  }
  
  return null;
};

// Category mapping for easier navigation
export const CATEGORY_MAPPINGS = {
  'school-sport-uniform': 'School & sport uniform',
  'club-clothing': 'Club clothing',
  'training-wear': 'Training wear',
  'belts-bags-shoes': 'Belts, bags & shoes',
  'sports-equipment': 'Sports equipment',
  'textbooks': 'Textbooks',
  'stationery': 'Stationary',
  'matric-dance': 'Matric dance clothing'
} as const;

export const REVERSE_CATEGORY_MAPPINGS = Object.fromEntries(
  Object.entries(CATEGORY_MAPPINGS).map(([key, value]) => [value, key])
) as Record<string, string>;