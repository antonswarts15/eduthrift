package za.co.thrift.eduthrift.service;

import org.springframework.stereotype.Service;
import za.co.thrift.eduthrift.entity.Notification;
import za.co.thrift.eduthrift.entity.User;
import za.co.thrift.eduthrift.repository.NotificationRepository;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification save(User user, String title, String body, String relatedOrderNumber) {
        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setBody(body);
        n.setRelatedOrderNumber(relatedOrderNumber);
        return notificationRepository.save(n);
    }

    public List<Notification> getForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public boolean markAsRead(Long id, User user) {
        return notificationRepository.findById(id)
                .filter(n -> n.getUser().getId().equals(user.getId()))
                .map(n -> {
                    n.setRead(true);
                    notificationRepository.save(n);
                    return true;
                })
                .orElse(false);
    }

    public void markAllAsRead(User user) {
        notificationRepository.markAllReadForUser(user);
    }

    public boolean delete(Long id, User user) {
        return notificationRepository.findById(id)
                .filter(n -> n.getUser().getId().equals(user.getId()))
                .map(n -> {
                    notificationRepository.delete(n);
                    return true;
                })
                .orElse(false);
    }
}
