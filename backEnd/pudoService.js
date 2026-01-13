const axios = require('axios');

class PudoService {
  constructor() {
    this.apiKey = process.env.PUDO_API_KEY;
    this.baseUrl = process.env.PUDO_API_URL || 'https://api.pudo.co.za';

    if (!this.apiKey) {
      console.warn('PUDO_API_KEY not configured in environment variables');
    }

    console.log('Pudo Service initialized with baseUrl:', this.baseUrl);
    console.log('API Key present:', !!this.apiKey);

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Get nearby Pudo pickup points/lockers
   * @param {Object} params - Search parameters
   * @param {string} params.latitude - Latitude coordinate
   * @param {string} params.longitude - Longitude coordinate
   * @param {number} params.radius - Search radius in km (optional)
   * @param {number} params.limit - Max number of results (optional)
   * @returns {Promise<Array>} List of pickup points
   */
  async getPickupPoints({ latitude, longitude, radius = 10, limit = 20 }) {
    try {
      const response = await this.client.get('/lockers', {
        params: {
          api_key: this.apiKey,
          latitude,
          longitude,
          radius,
          limit
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Pudo API Error (getPickupPoints):', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }

  /**
   * Get shipping rates/quotes
   * @param {Object} params - Quote parameters
   * @param {string} params.origin_suburb - Origin suburb/city
   * @param {string} params.destination_suburb - Destination suburb/city
   * @param {number} params.parcel_weight - Weight in kg
   * @param {Object} params.parcel_dimensions - Dimensions {length, width, height} in cm
   * @returns {Promise<Object>} Shipping rate quote
   */
  async getShippingRates({ origin_suburb, destination_suburb, parcel_weight, parcel_dimensions }) {
    try {
      const response = await this.client.post('/quotes', {
        api_key: this.apiKey,
        origin_suburb,
        destination_suburb,
        parcel_weight,
        parcel_dimensions: parcel_dimensions || { length: 30, width: 20, height: 10 }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Pudo API Error (getShippingRates):', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }

  /**
   * Create a shipment/waybill
   * @param {Object} shipment - Shipment details
   * @param {Object} shipment.sender - Sender information {name, phone, email, address}
   * @param {Object} shipment.receiver - Receiver information {name, phone, email}
   * @param {string} shipment.pickup_point_id - Selected Pudo locker ID
   * @param {Array} shipment.parcels - Array of parcel details
   * @param {string} shipment.reference - Order reference number
   * @returns {Promise<Object>} Created shipment details with tracking number
   */
  async createShipment(shipment) {
    try {
      const response = await this.client.post('/shipments', {
        api_key: this.apiKey,
        sender: shipment.sender,
        receiver: shipment.receiver,
        pickup_point_id: shipment.pickup_point_id,
        parcels: shipment.parcels,
        reference: shipment.reference,
        service_type: shipment.service_type || 'standard'
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Pudo API Error (createShipment):', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }

  /**
   * Track a shipment
   * @param {string} trackingNumber - Pudo tracking/waybill number
   * @returns {Promise<Object>} Shipment tracking information
   */
  async trackShipment(trackingNumber) {
    try {
      const response = await this.client.get('/tracking/shipments/public', {
        params: {
          api_key: this.apiKey,
          waybill: trackingNumber
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Pudo API Error (trackShipment):', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }

  /**
   * Get locker availability
   * @param {string} lockerId - Pudo locker ID
   * @returns {Promise<Object>} Locker availability details
   */
  async getLockerAvailability(lockerId) {
    try {
      const response = await this.client.get(`/lockers/${lockerId}`, {
        params: {
          api_key: this.apiKey
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Pudo API Error (getLockerAvailability):', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }
}

module.exports = new PudoService();