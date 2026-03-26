package za.co.thrift.eduthrift.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.entity.User;

import java.time.LocalDate;
import java.util.*;

@Service
public class TCGShippingService {

    private static final String BASE_URL = "https://api.shiplogic.com";

    @Value("${pudo.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private HttpHeaders headers() {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        h.setBearerAuth(apiKey);
        return h;
    }

    /**
     * Returns lockers nearest to the given coordinates.
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getPickupPoints(double lat, double lng) {
        String url = BASE_URL + "/pickup-points?lat=" + lat + "&lng=" + lng
                + "&order_closest=true&type=locker";
        ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.GET, new HttpEntity<>(headers()), Map.class);
        if (response.getBody() == null) return List.of();
        Object results = response.getBody().get("results");
        if (results instanceof List<?> list) return (List<Map<String, Object>>) list;
        return List.of();
    }

    /**
     * Gets shipping rates from seller's address to the buyer's chosen delivery locker.
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getRates(User seller, String deliveryPickupPointId) {
        Map<String, Object> body = new HashMap<>();
        body.put("collection_address", buildAddress(seller));
        body.put("delivery_pickup_point_id", deliveryPickupPointId);
        body.put("delivery_pickup_point_provider", "tcg-locker");
        body.put("parcels", List.of(defaultParcel()));
        body.put("collection_min_date", LocalDate.now().plusDays(1).toString());
        body.put("delivery_min_date", LocalDate.now().plusDays(2).toString());

        ResponseEntity<Map> response = restTemplate.exchange(
                BASE_URL + "/v2/rates",
                HttpMethod.POST,
                new HttpEntity<>(body, headers()),
                Map.class);
        if (response.getBody() == null) return List.of();
        Object rates = response.getBody().get("rates");
        if (rates instanceof List<?> list) return (List<Map<String, Object>>) list;
        return List.of();
    }

    /**
     * Creates a TCG shipment for a confirmed (paid) order.
     * Returns the full TCG response including the tracking reference.
     * Should only be called after payment is confirmed.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> createShipment(Order order, User seller, User buyer) {
        Map<String, Object> body = new HashMap<>();
        body.put("collection_address", buildAddress(seller));
        body.put("collection_contact", Map.of(
                "name", seller.getFirstName() + " " + seller.getLastName(),
                "mobile_number", seller.getPhone() != null ? seller.getPhone() : "",
                "email", seller.getEmail()
        ));
        body.put("delivery_pickup_point_id", order.getDeliveryLockerId());
        body.put("delivery_pickup_point_provider", "tcg-locker");
        body.put("delivery_contact", Map.of(
                "name", buyer.getFirstName() + " " + buyer.getLastName(),
                "mobile_number", buyer.getPhone() != null ? buyer.getPhone() : "",
                "email", buyer.getEmail()
        ));
        body.put("parcels", List.of(defaultParcel()));
        body.put("customer_reference", order.getOrderNumber());
        body.put("customer_reference_name", "Eduthrift Order");
        body.put("service_level_code", order.getServiceLevelCode());
        body.put("collection_min_date", LocalDate.now().plusDays(1) + "T00:00:00.000Z");
        body.put("delivery_min_date", LocalDate.now().plusDays(2) + "T00:00:00.000Z");
        body.put("collection_after", "09:00");
        body.put("collection_before", "17:00");
        body.put("delivery_after", "09:00");
        body.put("delivery_before", "17:00");
        body.put("mute_notifications", false);

        ResponseEntity<Map> response = restTemplate.exchange(
                BASE_URL + "/shipments",
                HttpMethod.POST,
                new HttpEntity<>(body, headers()),
                Map.class);
        return response.getBody() != null ? response.getBody() : Map.of();
    }

    private Map<String, Object> buildAddress(User user) {
        Map<String, Object> address = new HashMap<>();
        address.put("type", "residential");
        address.put("street_address", user.getStreetAddress() != null ? user.getStreetAddress() : "");
        address.put("local_area", user.getSuburb() != null ? user.getSuburb() : "");
        address.put("city", user.getTown() != null ? user.getTown() : "");
        address.put("zone", user.getProvince() != null ? user.getProvince() : "");
        address.put("country", "ZA");
        address.put("code", user.getPostalCode() != null ? user.getPostalCode() : "");
        return address;
    }

    /**
     * Gets shipping rates for courier (door-to-door) delivery of large items.
     * Used when the item is too large for a locker.
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getCourierRates(User seller, User buyer) {
        Map<String, Object> body = new HashMap<>();
        body.put("collection_address", buildAddress(seller));
        body.put("delivery_address", buildAddress(buyer));
        body.put("parcels", List.of(largeParcel()));
        body.put("collection_min_date", LocalDate.now().plusDays(1).toString());
        body.put("delivery_min_date", LocalDate.now().plusDays(2).toString());

        ResponseEntity<Map> response = restTemplate.exchange(
                BASE_URL + "/v2/rates",
                HttpMethod.POST,
                new HttpEntity<>(body, headers()),
                Map.class);
        if (response.getBody() == null) return List.of();
        Object rates = response.getBody().get("rates");
        if (rates instanceof List<?> list) return (List<Map<String, Object>>) list;
        return List.of();
    }

    private Map<String, Object> defaultParcel() {
        Map<String, Object> parcel = new HashMap<>();
        parcel.put("packaging", "Standard flyer");
        parcel.put("parcel_description", "Standard flyer");
        parcel.put("submitted_length_cm", 40);
        parcel.put("submitted_width_cm", 30);
        parcel.put("submitted_height_cm", 10);
        parcel.put("submitted_weight_kg", 1);
        return parcel;
    }

    private Map<String, Object> largeParcel() {
        Map<String, Object> parcel = new HashMap<>();
        parcel.put("packaging", "Large parcel");
        parcel.put("parcel_description", "Large parcel");
        parcel.put("submitted_length_cm", 100);
        parcel.put("submitted_width_cm", 60);
        parcel.put("submitted_height_cm", 60);
        parcel.put("submitted_weight_kg", 10);
        return parcel;
    }
}
