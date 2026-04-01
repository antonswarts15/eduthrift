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

    // Auth server is on a separate subdomain from the GraphQL API
    @Value("${tradesafe.auth.url:https://auth.tradesafe.co.za}")
    private String authUrl;

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
        body.add("scope", "");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(
                authUrl + "/oauth/token", request, Map.class);

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
            Object errors = response.get("errors");
            // Extract first error message for clarity
            String msg = errors.toString();
            try {
                @SuppressWarnings("unchecked")
                java.util.List<Map<String, Object>> errList = (java.util.List<Map<String, Object>>) errors;
                if (!errList.isEmpty()) {
                    msg = String.valueOf(errList.get(0).get("message"));
                }
            } catch (Exception ignored) {}
            throw new RuntimeException("TradeSafe GraphQL error: " + msg);
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
                mutation tokenCreate(
                    $givenName: String,
                    $familyName: String,
                    $email: Email,
                    $mobile: String,
                    $idNumber: String
                ) {
                    tokenCreate(input: {
                        user: {
                            givenName: $givenName
                            familyName: $familyName
                            email: $email
                            mobile: $mobile
                            idNumber: $idNumber
                        }
                    }) {
                        id
                    }
                }
                """;

        Map<String, Object> variables = new HashMap<>();
        variables.put("givenName", user.getFirstName());
        variables.put("familyName", user.getLastName());
        variables.put("email", user.getEmail());
        if (user.getPhone() != null && !user.getPhone().isEmpty()) {
            variables.put("mobile", user.getPhone());
        }
        if (user.getIdNumber() != null && !user.getIdNumber().isEmpty()) {
            variables.put("idNumber", user.getIdNumber());
        }

        Map<String, Object> result = executeGraphQL(mutation, variables);
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
        // Step 1: Create the transaction
        String transactionMutation = """
                mutation transactionCreate(
                    $title: String!,
                    $description: String!,
                    $industry: Industry!,
                    $workflow: TransactionWorkflow!,
                    $value: Float,
                    $buyerToken: String,
                    $sellerToken: String
                ) {
                    transactionCreate(input: {
                        title: $title
                        description: $description
                        industry: $industry
                        currency: ZAR
                        feeAllocation: SELLER
                        workflow: $workflow
                        allocations: {
                            create: [
                                {
                                    title: $title
                                    description: $description
                                    value: $value
                                    daysToDeliver: 7
                                    daysToInspect: 3
                                }
                            ]
                        }
                        parties: {
                            create: [
                                {
                                    token: $buyerToken
                                    role: BUYER
                                }
                                {
                                    token: $sellerToken
                                    role: SELLER
                                }
                            ]
                        }
                    }) {
                        id
                        createdAt
                        allocations {
                            id
                        }
                    }
                }
                """;

        double value = order.getItemPrice()
                .multiply(new java.math.BigDecimal(order.getQuantity()))
                .doubleValue();

        Map<String, Object> variables = new HashMap<>();
        variables.put("title", "Eduthrift Order " + order.getOrderNumber());
        variables.put("description", "Second-hand school item: " + order.getItem().getItemName());
        variables.put("industry", "GENERAL_GOODS_SERVICES");
        variables.put("workflow", "GOODS_INSPECTION");
        variables.put("value", value);
        variables.put("buyerToken", buyerToken);
        variables.put("sellerToken", sellerToken);

        Map<String, Object> result = executeGraphQL(transactionMutation, variables);
        Map<String, Object> data = (Map<String, Object>) result.get("data");
        Map<String, Object> transactionCreate = (Map<String, Object>) data.get("transactionCreate");
        String transactionId = (String) transactionCreate.get("id");

        // Extract the first allocation ID — needed to start/accept delivery later
        List<Map<String, Object>> allocations = (List<Map<String, Object>>) transactionCreate.get("allocations");
        String allocationId = (allocations != null && !allocations.isEmpty())
                ? (String) allocations.get(0).get("id")
                : null;

        // Step 2: Get the deposit/checkout URL — this is a query, not a mutation
        String checkoutQuery = """
                query transactionCheckoutLink($id: ID!) {
                    transactionCheckoutLink(id: $id)
                }
                """;

        Map<String, Object> checkoutResult = executeGraphQL(checkoutQuery, Map.of("id", transactionId));
        Map<String, Object> checkoutData = (Map<String, Object>) checkoutResult.get("data");
        String depositUrl = (String) checkoutData.get("transactionCheckoutLink");

        return new TradeSafeTransaction(transactionId, allocationId, depositUrl);
    }

    /**
     * Called when the seller ships the item — transitions TradeSafe allocation to INITIATED.
     */
    @SuppressWarnings("unchecked")
    public void startDelivery(String allocationId) {
        String mutation = """
                mutation allocationStartDelivery($id: ID!) {
                    allocationStartDelivery(id: $id) {
                        id
                        state
                    }
                }
                """;
        executeGraphQL(mutation, Map.of("id", allocationId));
    }

    /**
     * Called when the buyer collects from the Pudo locker (or confirms delivery).
     * Transitions TradeSafe allocation to DELIVERED — triggers fund release to seller.
     */
    @SuppressWarnings("unchecked")
    public void acceptDelivery(String allocationId) {
        String mutation = """
                mutation allocationAcceptDelivery($id: ID!) {
                    allocationAcceptDelivery(id: $id) {
                        id
                        state
                    }
                }
                """;
        executeGraphQL(mutation, Map.of("id", allocationId));
    }

    public record TradeSafeTransaction(String transactionId, String allocationId, String depositUrl) {}
}
