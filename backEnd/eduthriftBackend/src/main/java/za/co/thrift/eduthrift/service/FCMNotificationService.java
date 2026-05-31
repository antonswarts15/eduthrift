package za.co.thrift.eduthrift.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import za.co.thrift.eduthrift.entity.User;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Service
public class FCMNotificationService {

    @Value("${firebase.service-account-json:}")
    private String serviceAccountJson;

    private FirebaseMessaging messaging;

    private final NotificationService notificationService;

    public FCMNotificationService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostConstruct
    public void init() {
        if (serviceAccountJson == null || serviceAccountJson.isBlank()) {
            return;
        }
        try {
            InputStream stream = new ByteArrayInputStream(serviceAccountJson.getBytes(StandardCharsets.UTF_8));
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(stream))
                    .build();
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }
            messaging = FirebaseMessaging.getInstance();
        } catch (Exception e) {
            // Bad service account JSON — FCM disabled, don't break startup
        }
    }

    /**
     * Persist a notification to the DB and send a push to the user's device.
     * Use this for all order/payment events so they appear in the notification inbox.
     */
    public void sendAndPersist(User user, String title, String body, String relatedOrderNumber) {
        notificationService.save(user, title, body, relatedOrderNumber);
        send(user.getFcmToken(), title, body);
    }

    /**
     * Fire-and-forget push only (no DB persistence). Used for callers that do not
     * have a User entity available or manage persistence themselves.
     */
    public void send(String fcmToken, String title, String body) {
        if (messaging == null || fcmToken == null || fcmToken.isBlank()) return;
        try {
            Message message = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();
            messaging.send(message);
        } catch (Exception e) {
            // Non-fatal — never break order flow for a push notification failure
        }
    }
}
