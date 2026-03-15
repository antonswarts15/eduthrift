package za.co.thrift.eduthrift.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import za.co.thrift.eduthrift.entity.Order;
import za.co.thrift.eduthrift.entity.User;
import za.co.thrift.eduthrift.repository.UserRepository;

import java.time.Instant;
import java.util.*;

@Service
public class TradeSafeService {

    private static final Logger log = LoggerFactory.getLogger(TradeSafeService.class);

    @Value("${tradesafe.client.id}")
    private String clientId;

    @Value("${tradesafe.client.secret}")
    private String clientSecret;

    @Value("${tradesafe.api.url:https://api.tradesafe.co.za}")
    private String apiUrl;

    @Value("${app.base.url:http://localhost:3000}")
    private String appBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final UserRepository userRepository;

    private volatile String cachedToken;
    private volatile Instant tokenExpiry;

    public TradeSafeService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private synchronized String getAccessToken() {
        if (cachedToken != null && tokenExpiry != null && Instant.now().isBefore(tokenExpiry)) {
            return cachedToken;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(
                apiUrl + "/auth/oauth/token", request, Map.class);

        if (response == null || !response.containsKey("access_token")) {
            throw new RuntimeException("Failed to obtain TradeSafe access token");
        }

        cachedToken = (String) response.get("access_token");
        int expiresIn = ((Number) response.get("expires_in")).intValue();
        tokenExpiry = Instant.now().plusSeconds(expiresIn - 60);

        return cachedToken;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> executeGraphQL(String query, Map<String, Object> variables) {
        String token = getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("query", query);
        if (variables != null) {
            requestBody.put("variables", variables);
        }

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        Map<String, Object> response = restTemplate.exchange(
                apiUrl + "/graphql",
                HttpMethod.POST,
                request,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        ).getBody();

        if (response == null) {
            throw new RuntimeException("Empty response from TradeSafe GraphQL API");
        }

        if (response.containsKey("errors")) {
            throw new RuntimeException("TradeSafe API error: " + response.get("errors"));
        }

        return response;
    }

    /**
     * Creates a TradeSafe identity token for a user, or returns the cached one.
     */
    @SuppressWarnings("unchecked")
    public String createOrGetUserToken(User user) {
        if (user.getTradeSafeToken() != null && !user.getTradeSafeToken().isEmpty()) {
            return user.getTradeSafeToken();
        }

        String mutation = """
                mutation TokenCreate($input: TokenInput!) {
                    tokenCreate(input: $input) {
                        id
                    }
                }
                """;

        Map<String, Object> input = new HashMap<>();
        input.put("firstName", user.getFirstName());
        input.put("lastName", user.getLastName());
        input.put("email", user.getEmail());
        if (user.getPhone() != null && !user.getPhone().isEmpty()) {
            input.put("mobileNumber", user.getPhone());
        }
        if (user.getIdNumber() != null && !user.getIdNumber().isEmpty()) {
            input.put("idNumber", user.getIdNumber());
        }

        Map<String, Object> result = executeGraphQL(mutation, Map.of("input", input));
        Map<String, Object> data = (Map<String, Object>) result.get("data");
        Map<String, Object> tokenCreate = (Map<String, Object>) data.get("tokenCreate");
        String tradeSafeToken = (String) tokenCreate.get("id");

        user.setTradeSafeToken(tradeSafeToken);
        userRepository.save(user);

        return tradeSafeToken;
    }

    /**
     * Creates a TradeSafe escrow transaction for an order.
     * Returns the transaction ID and the URL where the buyer deposits funds.
     */
    @SuppressWarnings("unchecked")
    public TradeSafeTransaction createTransaction(Order order, String buyerToken, String sellerToken) {
        String mutation = """
                mutation TransactionCreate($input: TransactionInput!) {
                    transactionCreate(input: $input) {
                        id
                        state
                        depositFunds {
                            url
                        }
                    }
                }
                """;

        Map<String, Object> input = new HashMap<>();
        input.put("title", "Eduthrift Order " + order.getOrderNumber());
        input.put("description", "Second-hand school item: " + order.getItem().getItemName());
        input.put("industry", "GENERAL_GOODS_SERVICES");
        input.put("currency", "ZAR");
        input.put("feeAllocation", "SELLER");
        input.put("completionDays", 7);
        input.put("inspectionDays", 3);
        input.put("deliveryRequired", true);
        input.put("reference", order.getOrderNumber());
        input.put("returnUrl", appBaseUrl + "/payment/success?reference=" + order.getOrderNumber());
        input.put("errorUrl", appBaseUrl + "/payment/error?reference=" + order.getOrderNumber());

        List<Map<String, Object>> parties = new ArrayList<>();
        parties.add(Map.of("token", buyerToken, "role", "BUYER"));
        parties.add(Map.of("token", sellerToken, "role", "SELLER"));
        input.put("parties", parties);

        List<Map<String, Object>> allocations = new ArrayList<>();
        allocations.add(Map.of(
                "title", order.getItem().getItemName(),
                "units", order.getQuantity(),
                "unitCost", order.getItemPrice().doubleValue()
        ));
        input.put("allocations", allocations);

        Map<String, Object> result = executeGraphQL(mutation, Map.of("input", input));
        Map<String, Object> data = (Map<String, Object>) result.get("data");
        Map<String, Object> transactionCreate = (Map<String, Object>) data.get("transactionCreate");

        String transactionId = (String) transactionCreate.get("id");
        Map<String, Object> depositFunds = (Map<String, Object>) transactionCreate.get("depositFunds");
        String depositUrl = depositFunds != null ? (String) depositFunds.get("url") : null;

        return new TradeSafeTransaction(transactionId, depositUrl);
    }

    public record TradeSafeTransaction(String transactionId, String depositUrl) {}
}
