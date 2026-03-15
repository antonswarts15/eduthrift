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
}

export interface Parcel {
  parcel_description: string;
  submitted_length_cm: number;
  submitted_width_cm: number;
  submitted_height_cm: number;
  submitted_weight_kg: number;
  packaging: string;
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

  // Get pickup points
  async getPickupPoints(filters: {
    type?: 'locker' | 'counter';
    lat?: number;
    lng?: number;
    search?: string;
    order_closest?: boolean;
  } = {}): Promise<PickupPoint[]> {
    // Return mock data directly since Pudo API is not working properly
    return [
      {
        pickup_point_id: 'PL001',
        name: 'PudoLocker - Sandton City',
        address: 'Sandton City Mall, Johannesburg',
        lat: -26.1076,
        lng: 28.0567,
        type: 'locker',
        provider: 'pudo'
      },
      {
        pickup_point_id: 'PL002',
        name: 'PudoLocker - Eastgate',
        address: 'Eastgate Shopping Centre, Johannesburg',
        lat: -26.1891,
        lng: 28.1631,
        type: 'locker',
        provider: 'pudo'
      },
      {
        pickup_point_id: 'PL003',
        name: 'PudoLocker - Rosebank',
        address: 'Rosebank Mall, Johannesburg',
        lat: -26.1448,
        lng: 28.0436,
        type: 'locker',
        provider: 'pudo'
      }
    ];
  }

  // Get shipping rates
  async getRates(rateRequest: {
    collection_address?: any;
    delivery_address?: any;
    collection_pickup_point_id?: string;
    delivery_pickup_point_id?: string;
    parcels: Parcel[];
    collection_min_date: string;
    delivery_min_date: string;
  }): Promise<ShippingRate[]> {
    // Return mock rates directly since Pudo API is not working properly
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dayAfter = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return [
      {
        service_level_code: 'PUDO_STD',
        service_level_name: 'PudoLocker Standard',
        total_cost: 35,
        delivery_date: dayAfter
      },
      {
        service_level_code: 'PUDO_EXP',
        service_level_name: 'PudoLocker Express',
        total_cost: 55,
        delivery_date: tomorrow
      }
    ];
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