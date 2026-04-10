const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8080' : '/api');

export interface PickupPoint {
  pickup_point_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'locker' | 'counter';
  provider: string;
}

export interface ShippingRate {
  service_level_code: string;
  service_level_name: string;
  total_cost: number;
  delivery_date: string;
  max_weight_kg?: number;
  dimensions?: string;
  description?: string;
}

// Fixed Pudo locker-to-locker box sizes and pricing
export const PUDO_BOX_SIZES: ShippingRate[] = [
  {
    service_level_code: 'PUDO_XS',
    service_level_name: 'XS Locker Box',
    total_cost: 60,
    delivery_date: '',
    max_weight_kg: 2,
    dimensions: '19 x 38 x 64 cm',
    description: 'Fits: small items, books, accessories'
  },
  {
    service_level_code: 'PUDO_S',
    service_level_name: 'S Locker Box',
    total_cost: 70,
    delivery_date: '',
    max_weight_kg: 5,
    dimensions: '38 x 38 x 64 cm',
    description: 'Fits: 1-2 clothing items, small uniform pieces'
  },
  {
    service_level_code: 'PUDO_M',
    service_level_name: 'M Locker Box',
    total_cost: 100,
    delivery_date: '',
    max_weight_kg: 10,
    dimensions: '38 x 38 x 64 cm',
    description: 'Fits: 3-5 clothing items, full uniform set'
  },
  {
    service_level_code: 'PUDO_L',
    service_level_name: 'L Locker Box',
    total_cost: 150,
    delivery_date: '',
    max_weight_kg: 15,
    dimensions: '57 x 38 x 64 cm',
    description: 'Fits: large bundle, sports kit + uniform'
  },
  {
    service_level_code: 'PUDO_XL',
    service_level_name: 'XL Locker Box',
    total_cost: 200,
    delivery_date: '',
    max_weight_kg: 20,
    dimensions: '76 x 38 x 64 cm',
    description: 'Fits: full school bundle, multiple items'
  }
];

export interface Parcel {
  parcel_description: string;
  submitted_length_cm: number;
  submitted_width_cm: number;
  submitted_height_cm: number;
  submitted_weight_kg: number;
  packaging: string;
}

/**
 * Maps raw ShipLogic rate objects to ShippingRate, sorts cheapest first,
 * and guarantees unique stable codes (STANDARD / EXPRESS) when the API
 * doesn't return service_level_code.
 */
function normaliseRates(data: any[]): ShippingRate[] {
  const mapped = data.map((r: any) => ({
    service_level_code: (r.service_level_code ?? r.code ?? '') as string,
    service_level_name: (r.service_level_name ?? r.name ?? '') as string,
    total_cost: (r.total_cost ?? r.rate ?? 0) as number,
    delivery_date: (r.delivery_date ?? r.estimated_delivery ?? '') as string,
  }));

  mapped.sort((a, b) => a.total_cost - b.total_cost);

  return mapped.map((r, i) => ({
    ...r,
    service_level_code: r.service_level_code || (i === 0 ? 'STANDARD' : 'EXPRESS'),
    service_level_name: r.service_level_name || (i === 0 ? 'Standard' : 'Express'),
  }));
}

class ShippingService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Shipping API Error: ${response.status}`);
    }

    return response.json();
  }

  // Get pickup points from TCG API via backend
  async getPickupPoints(filters: {
    type?: 'locker' | 'counter';
    lat?: number;
    lng?: number;
    search?: string;
    order_closest?: boolean;
  } = {}): Promise<PickupPoint[]> {
    const lat = filters.lat ?? -26.2041;
    const lng = filters.lng ?? 28.0473;
    const response = await fetch(`${API_BASE_URL}/shipping/pickup-points?lat=${lat}&lng=${lng}`);
    if (!response.ok) throw new Error(`Pickup points unavailable (${response.status})`);
    const data: any[] = await response.json();
    // Map TCG response fields to our PickupPoint interface
    return data.map((p: any) => ({
      pickup_point_id: p.id ?? p.pickup_point_id,
      name: p.name,
      address: [p.address?.street_address, p.address?.local_area, p.address?.city]
        .filter(Boolean).join(', '),
      lat: p.lat ?? p.address?.lat ?? 0,
      lng: p.lng ?? p.address?.lng ?? 0,
      type: 'locker' as const,
      provider: 'tcg'
    }));
  }

  // Get shipping rates from TCG API via backend
  async getRates(rateRequest: {
    delivery_pickup_point_id?: string;
    item_id?: string | number;
    [key: string]: any;
  }): Promise<ShippingRate[]> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/shipping/rates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({
        delivery_pickup_point_id: rateRequest.delivery_pickup_point_id,
        item_id: rateRequest.item_id
      })
    });
    if (!response.ok) throw new Error(`Shipping rates unavailable (${response.status})`);
    const data: any[] = await response.json();
    return normaliseRates(data);
  }

  // Get courier (door-to-door) rates for large items — uses buyer's profile address server-side
  async getCourierRates(itemId: string | number): Promise<ShippingRate[]> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/shipping/courier-rates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({ item_id: itemId })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Courier rates unavailable (${response.status})`);
    }
    const data: any[] = await response.json();
    return normaliseRates(data);
  }

  // Create shipment
  async createShipment(shipmentData: any) {
    return this.request('/shipping/create-shipment', {
      method: 'POST',
      body: JSON.stringify(shipmentData),
    });
  }

  // ==================== PUDO API METHODS ====================

  /**
   * Get Pudo pickup points/lockers
   */
  async getPudoPickupPoints(params: {
    latitude: number;
    longitude: number;
    radius?: number;
    limit?: number;
  }): Promise<any> {
    const queryParams = new URLSearchParams({
      latitude: params.latitude.toString(),
      longitude: params.longitude.toString(),
      ...(params.radius && { radius: params.radius.toString() }),
      ...(params.limit && { limit: params.limit.toString() })
    });

    const response = await fetch(`${API_BASE_URL}/pudo/pickup-points?${queryParams}`);
    if (!response.ok) {
      throw new Error(`Pudo pickup points unavailable (${response.status})`);
    }
    return response.json();
  }

  /**
   * Get Pudo shipping rates/quotes
   */
  async getPudoRates(params: {
    origin_suburb: string;
    destination_suburb: string;
    parcel_weight: number;
    parcel_dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/pudo/rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!response.ok) {
      throw new Error(`Pudo rates unavailable (${response.status})`);
    }
    return response.json();
  }

  /**
   * Create a Pudo shipment
   */
  async createPudoShipment(shipmentData: {
    sender: {
      name: string;
      phone: string;
      email: string;
      address: any;
    };
    receiver: {
      name: string;
      phone: string;
      email: string;
    };
    pickup_point_id: string;
    parcels: Array<{
      weight: number;
      dimensions?: {
        length: number;
        width: number;
        height: number;
      };
      description?: string;
    }>;
    reference: string;
    service_type?: string;
  }): Promise<any> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/pudo/create-shipment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(shipmentData)
    });
    if (!response.ok) {
      throw new Error(`Failed to create Pudo shipment (${response.status})`);
    }
    return response.json();
  }

  /**
   * Track a Pudo shipment
   */
  async trackPudoShipment(trackingNumber: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/pudo/track/${trackingNumber}`);
    if (!response.ok) {
      throw new Error(`Tracking unavailable for ${trackingNumber} (${response.status})`);
    }
    return response.json();
  }

  /**
   * Check Pudo locker availability
   */
  async getPudoLockerAvailability(lockerId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/pudo/locker/${lockerId}/availability`);
    if (!response.ok) {
      throw new Error(`Locker availability unavailable (${response.status})`);
    }
    return response.json();
  }
}

export default new ShippingService();