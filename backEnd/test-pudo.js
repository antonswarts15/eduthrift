const pudoService = require('./pudoService');
require('dotenv').config();

async function testPudoAPI() {
  console.log('========================================');
  console.log('Testing Pudo API Integration');
  console.log('========================================\n');

  // Test 1: Get Pickup Points
  console.log('1. Testing Get Pickup Points...');
  try {
    const pickupPointsResult = await pudoService.getPickupPoints({
      latitude: '-26.1076',
      longitude: '28.0567',
      radius: 10,
      limit: 5
    });

    if (pickupPointsResult.success) {
      console.log('✅ Success! Found pickup points:');
      console.log(JSON.stringify(pickupPointsResult.data, null, 2));
    } else {
      console.log('❌ Failed:', pickupPointsResult.error);
      console.log('Status Code:', pickupPointsResult.statusCode);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  console.log('\n----------------------------------------\n');

  // Test 2: Get Shipping Rates
  console.log('2. Testing Get Shipping Rates...');
  try {
    const ratesResult = await pudoService.getShippingRates({
      origin_suburb: 'Sandton',
      destination_suburb: 'Rosebank',
      parcel_weight: 2,
      parcel_dimensions: {
        length: 30,
        width: 20,
        height: 10
      }
    });

    if (ratesResult.success) {
      console.log('✅ Success! Shipping rates:');
      console.log(JSON.stringify(ratesResult.data, null, 2));
    } else {
      console.log('❌ Failed:', ratesResult.error);
      console.log('Status Code:', ratesResult.statusCode);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  console.log('\n----------------------------------------\n');

  // Test 3: Create Shipment (will likely fail without valid data, but tests the connection)
  console.log('3. Testing Create Shipment (dry run)...');
  try {
    const shipmentResult = await pudoService.createShipment({
      sender: {
        name: 'Test Sender',
        phone: '0821234567',
        email: 'sender@test.com',
        address: {
          street: '123 Test Street',
          suburb: 'Sandton',
          city: 'Johannesburg',
          province: 'Gauteng',
          postal_code: '2196'
        }
      },
      receiver: {
        name: 'Test Receiver',
        phone: '0829876543',
        email: 'receiver@test.com'
      },
      pickup_point_id: 'PUDO001',
      parcels: [
        {
          weight: 2,
          dimensions: {
            length: 30,
            width: 20,
            height: 10
          },
          description: 'Test package'
        }
      ],
      reference: 'TEST-' + Date.now(),
      service_type: 'standard'
    });

    if (shipmentResult.success) {
      console.log('✅ Success! Shipment created:');
      console.log(JSON.stringify(shipmentResult.data, null, 2));
    } else {
      console.log('❌ Failed (expected if test data is invalid):', shipmentResult.error);
      console.log('Status Code:', shipmentResult.statusCode);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  console.log('\n========================================');
  console.log('Test completed!');
  console.log('========================================');
}

// Run tests
testPudoAPI();
