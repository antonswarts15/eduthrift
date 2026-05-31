package za.co.thrift.eduthrift.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import za.co.thrift.eduthrift.entity.Item;
import za.co.thrift.eduthrift.entity.Order;

import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final NumberFormat ZAR = NumberFormat.getCurrencyInstance(new Locale("en", "ZA"));

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:support@eduthrift.co.za}")
    private String fromEmail;

    @Value("${app.base.url:https://www.eduthrift.co.za}")
    private String appBaseUrl;

    @Value("${mail.admin.email:support@eduthrift.co.za}")
    private String adminEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ── Welcome email ─────────────────────────────────────────────────────────

    public void sendWelcomeEmail(za.co.thrift.eduthrift.entity.User user) {
        try {
            String html = wrap(
                    header(logoUrl(), "Welcome to Eduthrift, " + user.getFirstName() + "! 🎉", "South Africa's school marketplace"),
                    """
                    <p style="font-size:15px;color:#555;line-height:1.65;margin:0 0 20px">
                      You've joined South Africa's school uniform and equipment marketplace — where parents
                      save money and great items find new homes.
                    </p>

                    <div style="background:white;border:1px solid #e0e0e0;border-radius:10px;padding:20px 24px;margin:0 0 24px">
                      <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#888;letter-spacing:0.5px;text-transform:uppercase">
                        What you can do on Eduthrift
                      </p>
                      <table style="width:100%%;border-collapse:collapse">
                        <tr>
                          <td style="padding:8px 0;vertical-align:top;width:28px;font-size:18px">🛍️</td>
                          <td style="padding:8px 0;font-size:14px;color:#333">
                            <strong>Buy</strong> — Browse hundreds of school uniforms, sports gear &amp; stationery at a fraction of the original price.
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;vertical-align:top;font-size:18px">📦</td>
                          <td style="padding:8px 0;font-size:14px;color:#333">
                            <strong>Sell</strong> — List items your kids have outgrown and earn money while clearing space.
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;vertical-align:top;font-size:18px">🔒</td>
                          <td style="padding:8px 0;font-size:14px;color:#333">
                            <strong>Safe transactions</strong> — Buyer protection and escrow on every order. Pay only when you're happy.
                          </td>
                        </tr>
                      </table>
                    </div>

                    <div style="text-align:center;margin:28px 0 8px">
                      <a href="%s/buyer"
                         style="display:inline-block;background:#004aad;color:white;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin:0 8px 12px">
                        Browse Listings
                      </a>
                      <a href="%s/seller"
                         style="display:inline-block;background:white;color:#004aad;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;border:2px solid #004aad;margin:0 8px 12px">
                        Start Selling
                      </a>
                    </div>

                    <p style="margin:24px 0 0;font-size:13px;color:#888;text-align:center;line-height:1.6">
                      Questions? We're here to help —
                      <a href="mailto:support@eduthrift.co.za" style="color:#004aad;text-decoration:none">support@eduthrift.co.za</a>
                    </p>
                    """.formatted(appBaseUrl, appBaseUrl)
            );
            send(user.getEmail(), "Welcome to Eduthrift, " + user.getFirstName() + "!", html);
        } catch (Exception e) {
            log.warn("Failed to send welcome email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    // ── Password reset (admin-initiated) ─────────────────────────────────────

    public void sendPasswordResetEmail(za.co.thrift.eduthrift.entity.User user, String tempPassword) {
        try {
            String html = wrap(
                    header(logoUrl(), "Your password has been reset", ""),
                    """
                    <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 24px">
                      Hi <strong>%s</strong>, an Eduthrift administrator has reset your password.
                      Use the temporary password below to sign in, then change it immediately in your profile settings.
                    </p>

                    <div style="background:white;border:2px solid #004aad;border-radius:10px;padding:20px 24px;margin:0 0 24px;text-align:center">
                      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#888;letter-spacing:0.8px;text-transform:uppercase">
                        Temporary Password
                      </p>
                      <p style="margin:0;font-size:26px;font-weight:700;color:#004aad;letter-spacing:3px;font-family:monospace">
                        %s
                      </p>
                    </div>

                    <div style="background:#FFF8E7;border-radius:8px;padding:14px 16px;margin:0 0 28px;border-left:4px solid #F59E0B">
                      <p style="margin:0;font-size:13px;color:#92400E;line-height:1.6">
                        <strong>⚠️ Important:</strong> This is a temporary password. Please sign in and change it immediately under
                        <strong>Profile → Update Personal Details</strong>. Do not share this password with anyone.
                      </p>
                    </div>

                    <div style="text-align:center;margin:0 0 8px">
                      <a href="%s/login"
                         style="display:inline-block;background:#004aad;color:white;padding:13px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
                        Sign In Now
                      </a>
                    </div>

                    <p style="margin:24px 0 0;font-size:13px;color:#888;text-align:center">
                      Didn't request this? Contact us at
                      <a href="mailto:support@eduthrift.co.za" style="color:#004aad;text-decoration:none">support@eduthrift.co.za</a>
                    </p>
                    """.formatted(user.getFirstName(), tempPassword, appBaseUrl)
            );
            send(user.getEmail(), "Your Eduthrift password has been reset", html);
        } catch (Exception e) {
            log.warn("Failed to send password reset email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    // ── Order creation ────────────────────────────────────────────────────────

    public void sendBuyerOrderConfirmation(Order order) {
        try {
            // itemPrice stores the bundle total — do NOT multiply by quantity
            BigDecimal itemTotal = order.getItemPrice();
            BigDecimal shipping  = order.getShippingCost() != null ? order.getShippingCost() : BigDecimal.ZERO;
            BigDecimal total     = itemTotal.add(shipping);
            String itemLabel     = order.getQuantity() > 1
                    ? "Items (" + order.getQuantity() + " items)"
                    : "Item";

            String html = wrap(
                    header(logoUrl(), "Order Confirmed!", "Your payment is securely held in escrow"),
                    """
                    <p style="font-size:16px;color:#333;margin:0 0 12px">Hi <strong>%s</strong>,</p>
                    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6">
                      Your order has been placed and your payment is securely held in <strong>escrow</strong>.
                      Funds will only be released to the seller once you confirm delivery.
                    </p>

                    <div style="background:white;border:1px solid #ddd;border-radius:8px;padding:16px;margin:0 0 20px">
                      <h3 style="margin:0 0 12px;color:#004aad;font-size:16px">Order Summary — %s</h3>
                      <table style="width:100%%;border-collapse:collapse;font-size:14px">
                        <tr>
                          <td style="padding:7px 0;color:#555">%s</td>
                          <td style="padding:7px 0;text-align:right"><strong>%s</strong></td>
                        </tr>
                        <tr>
                          <td style="padding:7px 0;color:#555">Shipping</td>
                          <td style="padding:7px 0;text-align:right">%s</td>
                        </tr>
                        <tr style="border-top:2px solid #004aad">
                          <td style="padding:10px 0 0;font-size:16px"><strong>Total Paid</strong></td>
                          <td style="padding:10px 0 0;text-align:right;font-size:16px;color:#004aad"><strong>%s</strong></td>
                        </tr>
                      </table>
                    </div>

                    <div style="background:#e8f5e8;border-radius:8px;padding:14px;margin:0 0 20px">
                      <p style="margin:0;font-size:13px;color:#2d5a2d;line-height:1.7">
                        <strong>📦 Delivery to:</strong> %s<br>
                        <strong>🔒 Escrow protection:</strong> Your payment is held securely until you confirm receipt.
                      </p>
                    </div>

                    <p style="font-size:13px;color:#666;margin:0 0 20px">
                      Once the seller ships your item, you will receive a tracking number.
                      When you collect from the Pudo locker, confirm delivery in the app to release payment to the seller.
                    </p>

                    <div style="text-align:center;margin:0 0 8px">
                      <a href="%s/orders"
                         style="display:inline-block;background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
                        View My Orders
                      </a>
                    </div>
                    """.formatted(
                            order.getBuyer().getFirstName(),
                            order.getOrderNumber(),
                            itemLabel, ZAR.format(itemTotal),
                            ZAR.format(shipping),
                            ZAR.format(total),
                            order.getPickupPoint() != null ? order.getPickupPoint() : "See order details",
                            appBaseUrl
                    )
            );
            send(order.getBuyer().getEmail(), "Order Confirmed — " + order.getOrderNumber(), html);
        } catch (Exception e) {
            log.warn("Failed to send buyer confirmation email for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    public void sendSellerOrderNotification(Order order) {
        try {
            // itemPrice stores the bundle total — do NOT multiply by quantity
            BigDecimal itemTotal = order.getItemPrice();

            String html = wrap(
                    header(logoUrl(), "You Have a Sale! 🎉", "A buyer has placed an order on Eduthrift"),
                    """
                    <p style="font-size:16px;color:#333;margin:0 0 12px">Hi <strong>%s</strong>,</p>
                    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6">
                      Great news! Your item has been purchased. Once the buyer's payment is confirmed,
                      you will receive a follow-up email to ship the item.
                    </p>

                    <div style="background:white;border:1px solid #ddd;border-radius:8px;padding:16px;margin:0 0 20px">
                      <h3 style="margin:0 0 12px;color:#004aad;font-size:16px">Sale Summary — %s</h3>
                      <table style="width:100%%;border-collapse:collapse;font-size:14px">
                        <tr>
                          <td style="padding:7px 0;color:#555">Item Sold</td>
                          <td style="padding:7px 0;text-align:right"><strong>%s</strong></td>
                        </tr>
                        <tr>
                          <td style="padding:7px 0;color:#555">Your Listed Price</td>
                          <td style="padding:7px 0;text-align:right">%s</td>
                        </tr>
                        <tr>
                          <td style="padding:7px 0;color:#555">Platform Fee</td>
                          <td style="padding:7px 0;text-align:right;color:#27ae60"><strong>R0.00 (FREE)</strong></td>
                        </tr>
                        <tr style="border-top:2px solid #004aad">
                          <td style="padding:10px 0 0;font-size:16px"><strong>You Receive</strong></td>
                          <td style="padding:10px 0 0;text-align:right;font-size:16px;color:#004aad"><strong>%s</strong></td>
                        </tr>
                      </table>
                    </div>

                    <div style="background:#fff3cd;border-radius:8px;padding:14px;margin:0 0 20px;border-left:4px solid #F59E0B">
                      <p style="margin:0;font-size:13px;color:#856404">
                        <strong>⏳ Next step:</strong> Wait for payment confirmation.
                        You will receive another email once the buyer's payment clears. <strong>Do not ship until then.</strong>
                      </p>
                    </div>

                    <div style="text-align:center;margin:0 0 8px">
                      <a href="%s/orders"
                         style="display:inline-block;background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
                        View My Orders
                      </a>
                    </div>
                    """.formatted(
                            order.getSeller().getFirstName(),
                            order.getOrderNumber(),
                            order.getItem().getItemName(),
                            ZAR.format(itemTotal),
                            ZAR.format(itemTotal),
                            appBaseUrl
                    )
            );
            send(order.getSeller().getEmail(), "You Have a Sale! — " + order.getOrderNumber(), html);
        } catch (Exception e) {
            log.warn("Failed to send seller notification email for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    // ── Payment confirmed / escrow held ───────────────────────────────────────

    public void sendPaymentConfirmedEmails(Order order) {
        try {
            BigDecimal itemTotal = order.getItemPrice();
            String buyerHtml = wrap(
                    header(logoUrl(), "Payment Confirmed", "Your funds are safely in escrow"),
                    """
                    <p style="font-size:16px;color:#333;margin:0 0 12px">Hi <strong>%s</strong>,</p>
                    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6">
                      Your payment for order <strong>%s</strong> has been confirmed and is securely held in escrow.
                      The seller has been notified to ship your item.
                    </p>

                    <div style="background:#e8f5e8;border-radius:8px;padding:16px;margin:0 0 20px">
                      <p style="margin:0;font-size:13px;color:#2d5a2d;line-height:1.8">
                        <strong>📦 Item:</strong> %s<br>
                        <strong>🔒 Escrow amount:</strong> %s<br>
                        <strong>📍 Your collection locker:</strong> %s<br><br>
                        Your money is safe. Pudo will notify you by email when the item arrives at your locker.
                        Funds are released to the seller automatically once Pudo confirms you have collected.
                      </p>
                    </div>

                    <div style="text-align:center;margin:0 0 8px">
                      <a href="%s/orders"
                         style="display:inline-block;background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
                        Track My Order
                      </a>
                    </div>
                    """.formatted(
                            order.getBuyer().getFirstName(),
                            order.getOrderNumber(),
                            order.getItem().getItemName(),
                            ZAR.format(itemTotal),
                            order.getPickupPoint() != null ? order.getPickupPoint() : "See order details",
                            appBaseUrl
                    )
            );
            send(order.getBuyer().getEmail(), "Payment Confirmed — " + order.getOrderNumber(), buyerHtml);
        } catch (Exception e) {
            log.warn("Failed to send payment confirmed buyer email for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    public void sendSellerShipNowEmail(Order order) {
        try {
            BigDecimal itemTotal = order.getItemPrice();
            String tracking = order.getTrackingNumber() != null ? order.getTrackingNumber() : "See app — My Orders";
            String sellerHtml = wrap(
                    header(logoUrl(), "Drop Off Now — Waybill Ready!", "Payment confirmed — time to ship"),
                    """
                    <p style="font-size:16px;color:#333;margin:0 0 12px">Hi <strong>%s</strong>,</p>
                    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6">
                      The buyer's payment for order <strong>%s</strong> is confirmed and held in escrow.
                      A Pudo shipment has been created. <strong>Please drop the item off at your nearest Pudo locker.</strong>
                    </p>

                    <div style="background:#e8f5e8;border-radius:8px;padding:16px;margin:0 0 20px;border:2px solid #27ae60">
                      <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#2d5a2d">📦 Shipping Details</p>
                      <table style="width:100%%;border-collapse:collapse;font-size:14px">
                        <tr><td style="padding:5px 0;color:#555;width:140px">Item</td>
                            <td style="padding:5px 0"><strong>%s</strong></td></tr>
                        <tr><td style="padding:5px 0;color:#555">Buyer's locker</td>
                            <td style="padding:5px 0"><strong>%s</strong></td></tr>
                        <tr><td style="padding:5px 0;color:#555">Waybill number</td>
                            <td style="padding:5px 0;font-size:20px;font-weight:700;color:#004aad;letter-spacing:2px">%s</td></tr>
                        <tr><td style="padding:5px 0;color:#555">Your payout</td>
                            <td style="padding:5px 0;color:#27ae60"><strong>%s</strong> — released automatically once Pudo confirms collection</td></tr>
                      </table>
                    </div>

                    <div style="background:#fff3cd;border-radius:8px;padding:14px;margin:0 0 20px">
                      <p style="margin:0;font-size:13px;color:#856404;line-height:1.8">
                        <strong>📋 Drop-off steps:</strong><br>
                        1. Go to <strong>any Pudo locker</strong> near you.<br>
                        2. Select <em>Drop Off</em> and enter waybill <strong>%s</strong>.<br>
                        3. Place the item in the locker and close it.<br>
                        4. Pudo notifies the buyer to collect — <strong>no further action needed from you.</strong><br>
                        5. Once the buyer collects, Pudo confirms delivery and your payout is released automatically.
                      </p>
                    </div>

                    <div style="text-align:center;margin:0 0 8px">
                      <a href="%s/orders"
                         style="display:inline-block;background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
                        View Order in App
                      </a>
                    </div>
                    """.formatted(
                            order.getSeller().getFirstName(),
                            order.getOrderNumber(),
                            order.getItem().getItemName(),
                            order.getPickupPoint() != null ? order.getPickupPoint() : "See order details",
                            tracking,
                            ZAR.format(itemTotal),
                            tracking,
                            appBaseUrl
                    )
            );
            send(order.getSeller().getEmail(), "Drop Off Now — Waybill Ready: " + order.getOrderNumber(), sellerHtml);
        } catch (Exception e) {
            log.warn("Failed to send seller ship-now email for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    // ── Order shipped ─────────────────────────────────────────────────────────

    public void sendOrderShippedEmail(Order order) {
        try {
            String tracking = order.getTrackingNumber() != null ? order.getTrackingNumber() : "Check the app for updates";
            String html = wrap(
                    header(logoUrl(), "Your Order is On Its Way!", ""),
                    """
                    <p style="font-size:16px;color:#333;margin:0 0 12px">Hi <strong>%s</strong>,</p>
                    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6">
                      Great news! Your order <strong>%s</strong> for <strong>%s</strong> has been shipped
                      and is on its way to your Pudo locker.
                    </p>

                    <div style="background:#e8f4fd;border-radius:8px;padding:14px;margin:0 0 20px">
                      <p style="margin:0;font-size:13px;color:#1a5276;line-height:1.8">
                        <strong>🚚 Tracking number:</strong> %s<br>
                        <strong>📍 Delivery locker:</strong> %s
                      </p>
                    </div>

                    <div style="background:#fff3cd;border-radius:8px;padding:14px;margin:0 0 20px">
                      <p style="margin:0;font-size:13px;color:#856404;line-height:1.6">
                        <strong>What happens next:</strong> Collect your item from the Pudo locker using your tracking number.
                        Once you open the locker, Pudo automatically confirms delivery and releases payment to the seller.
                        No action needed from you in the app.
                      </p>
                    </div>

                    <div style="text-align:center;margin:0 0 8px">
                      <a href="%s/orders"
                         style="display:inline-block;background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
                        Track My Order
                      </a>
                    </div>
                    """.formatted(
                            order.getBuyer().getFirstName(),
                            order.getOrderNumber(),
                            order.getItem().getItemName(),
                            tracking,
                            order.getPickupPoint() != null ? order.getPickupPoint() : "See order details",
                            appBaseUrl
                    )
            );
            send(order.getBuyer().getEmail(), "Your Order Has Been Shipped — " + order.getOrderNumber(), html);
        } catch (Exception e) {
            log.warn("Failed to send order shipped email for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    // ── Order arrived at locker ───────────────────────────────────────────────

    public void sendOrderArrivedEmail(Order order) {
        try {
            String html = wrap(
                    header(logoUrl(), "Your Order Has Arrived!", "Ready for collection at your Pudo locker"),
                    """
                    <p style="font-size:16px;color:#333;margin:0 0 12px">Hi <strong>%s</strong>,</p>
                    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6">
                      Your order <strong>%s</strong> for <strong>%s</strong> has arrived at your Pudo locker
                      and is ready for collection.
                    </p>

                    <div style="background:#e8f5e8;border-radius:8px;padding:14px;margin:0 0 20px">
                      <p style="margin:0;font-size:13px;color:#2d5a2d;line-height:1.8">
                        <strong>📍 Collection locker:</strong> %s<br>
                        <strong>🔑 Tracking number:</strong> %s
                      </p>
                    </div>

                    <div style="background:#fff3cd;border-radius:8px;padding:14px;margin:0 0 20px">
                      <p style="margin:0;font-size:13px;color:#856404;line-height:1.6">
                        <strong>Important:</strong> Use your tracking number to open the Pudo locker and collect your item.
                        Pudo will automatically confirm delivery once the locker is opened —
                        <strong>no action needed from you in the app.</strong>
                        If you have not collected within <strong>72 hours</strong>, the system will
                        automatically release the funds to the seller.
                      </p>
                    </div>

                    <div style="text-align:center;margin:0 0 8px">
                      <a href="%s/orders"
                         style="display:inline-block;background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
                        View My Orders
                      </a>
                    </div>
                    """.formatted(
                            order.getBuyer().getFirstName(),
                            order.getOrderNumber(),
                            order.getItem().getItemName(),
                            order.getPickupPoint() != null ? order.getPickupPoint() : "See order details",
                            order.getTrackingNumber() != null ? order.getTrackingNumber() : "See order details",
                            appBaseUrl
                    )
            );
            send(order.getBuyer().getEmail(), "Your Order Has Arrived — Collect Now: " + order.getOrderNumber(), html);
        } catch (Exception e) {
            log.warn("Failed to send order arrived email for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    // ── Delivery confirmed / escrow release ───────────────────────────────────

    public void sendDeliveryConfirmedEmails(Order order) {
        try {
            String buyerHtml = wrap(
                    header(logoUrl(), "Delivery Confirmed!", "Transaction complete"),
                    """
                    <p style="font-size:16px;color:#333;margin:0 0 12px">Hi <strong>%s</strong>,</p>
                    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6">
                      You've confirmed receipt of your order <strong>%s</strong> for <strong>%s</strong>.
                      The escrow funds have been released to the seller. Your transaction is complete!
                    </p>

                    <div style="background:#e8f5e8;border-radius:8px;padding:14px;margin:0 0 20px">
                      <p style="margin:0;font-size:13px;color:#2d5a2d">
                        Thank you for buying on Eduthrift. If you have any issues with your item,
                        please contact us at <a href="mailto:support@eduthrift.co.za" style="color:#004aad">support@eduthrift.co.za</a>.
                      </p>
                    </div>

                    <div style="text-align:center;margin:0 0 8px">
                      <a href="%s/buyer"
                         style="display:inline-block;background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
                        Browse More Items
                      </a>
                    </div>
                    """.formatted(
                            order.getBuyer().getFirstName(),
                            order.getOrderNumber(),
                            order.getItem().getItemName(),
                            appBaseUrl
                    )
            );
            send(order.getBuyer().getEmail(), "Delivery Confirmed — " + order.getOrderNumber(), buyerHtml);

            BigDecimal payout = order.getSellerPayout() != null ? order.getSellerPayout() : order.getItemPrice();
            String sellerHtml = wrap(
                    header(logoUrl(), "Delivery Confirmed — Payout Processing", ""),
                    """
                    <p style="font-size:16px;color:#333;margin:0 0 12px">Hi <strong>%s</strong>,</p>
                    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6">
                      The buyer has confirmed delivery of order <strong>%s</strong>. Escrow funds are being released
                      and your payout of <strong>%s</strong> is being processed.
                    </p>

                    <div style="background:#e8f5e8;border-radius:8px;padding:14px;margin:0 0 20px">
                      <p style="margin:0;font-size:13px;color:#2d5a2d;line-height:1.8">
                        <strong>💰 Your payout:</strong> %s<br>
                        <strong>📦 Item sold:</strong> %s<br><br>
                        You will receive a separate confirmation once the transfer is complete.
                      </p>
                    </div>

                    <div style="text-align:center;margin:0 0 8px">
                      <a href="%s/orders"
                         style="display:inline-block;background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
                        View Order
                      </a>
                    </div>
                    """.formatted(
                            order.getSeller().getFirstName(),
                            order.getOrderNumber(),
                            ZAR.format(payout),
                            ZAR.format(payout),
                            order.getItem().getItemName(),
                            appBaseUrl
                    )
            );
            send(order.getSeller().getEmail(), "Delivery Confirmed — Payout Processing: " + order.getOrderNumber(), sellerHtml);
        } catch (Exception e) {
            log.warn("Failed to send delivery confirmed emails for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    // ── Auto-release after 72 hours ───────────────────────────────────────────

    public void sendAutoReleaseEmails(Order order) {
        try {
            String buyerHtml = wrap(
                    header(logoUrl(), "Order Auto-Completed", "72-hour escrow window expired"),
                    """
                    <p style="font-size:16px;color:#333;margin:0 0 12px">Hi <strong>%s</strong>,</p>
                    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6">
                      Your order <strong>%s</strong> for <strong>%s</strong> has been automatically completed
                      as 72 hours have passed since your item was delivered.
                    </p>

                    <div style="background:#f8f9fa;border-radius:8px;padding:14px;margin:0 0 20px;border-left:4px solid #7f8c8d">
                      <p style="margin:0;font-size:13px;color:#555">
                        The escrow funds have been released to the seller. If you have not received your item
                        or have a dispute, please contact us immediately at
                        <a href="mailto:support@eduthrift.co.za" style="color:#004aad">support@eduthrift.co.za</a>.
                      </p>
                    </div>

                    <div style="text-align:center;margin:0 0 8px">
                      <a href="%s/orders"
                         style="display:inline-block;background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
                        View Order
                      </a>
                    </div>
                    """.formatted(
                            order.getBuyer().getFirstName(),
                            order.getOrderNumber(),
                            order.getItem().getItemName(),
                            appBaseUrl
                    )
            );
            send(order.getBuyer().getEmail(), "Order Auto-Completed — " + order.getOrderNumber(), buyerHtml);

            BigDecimal payout = order.getSellerPayout() != null ? order.getSellerPayout() : order.getItemPrice();
            String sellerHtml = wrap(
                    header(logoUrl(), "Escrow Auto-Released", "Payout processing"),
                    """
                    <p style="font-size:16px;color:#333;margin:0 0 12px">Hi <strong>%s</strong>,</p>
                    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6">
                      The 72-hour escrow hold for order <strong>%s</strong> has expired and the buyer has not responded.
                      Escrow funds have been automatically released and your payout of
                      <strong>%s</strong> is being processed.
                    </p>

                    <div style="text-align:center;margin:0 0 8px">
                      <a href="%s/orders"
                         style="display:inline-block;background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
                        View Order
                      </a>
                    </div>
                    """.formatted(
                            order.getSeller().getFirstName(),
                            order.getOrderNumber(),
                            ZAR.format(payout),
                            appBaseUrl
                    )
            );
            send(order.getSeller().getEmail(), "Escrow Auto-Released — Payout Processing: " + order.getOrderNumber(), sellerHtml);
        } catch (Exception e) {
            log.warn("Failed to send auto-release emails for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    // ── Payout status ─────────────────────────────────────────────────────────

    public void sendPayoutStatusEmail(Order order) {
        try {
            Order.PayoutStatus status = order.getPayoutStatus();
            if (status == null) return;
            switch (status) {
                case COMPLETED      -> sendPayoutCompletedEmail(order);
                case MANUAL_REQUIRED -> sendPayoutManualRequiredEmail(order);
                case FAILED         -> sendPayoutFailedEmail(order);
                default             -> { /* no email for PENDING/PROCESSING */ }
            }
        } catch (Exception e) {
            log.warn("Failed to send payout status email for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    private void sendPayoutCompletedEmail(Order order) throws Exception {
        BigDecimal payout = order.getSellerPayout() != null ? order.getSellerPayout() : order.getItemPrice();
        String html = wrap(
                header(logoUrl(), "Payout Completed!", "Funds transferred to your bank account"),
                """
                <p style="font-size:16px;color:#333;margin:0 0 12px">Hi <strong>%s</strong>,</p>
                <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6">
                  Your payout for order <strong>%s</strong> has been completed.
                </p>

                <div style="background:#e8f5e8;border-radius:8px;padding:14px;margin:0 0 20px">
                  <p style="margin:0;font-size:13px;color:#2d5a2d;line-height:1.8">
                    <strong>💰 Payout amount:</strong> %s<br>
                    <strong>📦 Item sold:</strong> %s<br>
                    <strong>🏦 Transferred to:</strong> Your registered bank account<br><br>
                    Please allow 1–2 business days for the funds to reflect in your account.
                  </p>
                </div>

                <div style="text-align:center;margin:0 0 8px">
                  <a href="%s/orders"
                     style="display:inline-block;background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
                    View Order
                  </a>
                </div>
                """.formatted(
                        order.getSeller().getFirstName(),
                        order.getOrderNumber(),
                        ZAR.format(payout),
                        order.getItem().getItemName(),
                        appBaseUrl
                )
        );
        send(order.getSeller().getEmail(), "Payout Completed — " + ZAR.format(payout) + " — " + order.getOrderNumber(), html);
    }

    private void sendPayoutManualRequiredEmail(Order order) throws Exception {
        BigDecimal payout = order.getSellerPayout() != null ? order.getSellerPayout() : order.getItemPrice();
        String sellerHtml = wrap(
                header(logoUrl(), "Payout Being Processed", "Manual transfer required"),
                """
                <p style="font-size:16px;color:#333;margin:0 0 12px">Hi <strong>%s</strong>,</p>
                <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6">
                  Your payout for order <strong>%s</strong> requires a manual bank transfer.
                </p>

                <div style="background:#fef9e7;border-radius:8px;padding:14px;margin:0 0 20px;border-left:4px solid #e67e22">
                  <p style="margin:0;font-size:13px;color:#784212;line-height:1.8">
                    <strong>💰 Payout amount:</strong> %s<br>
                    <strong>📦 Item sold:</strong> %s<br><br>
                    Our team will process your EFT transfer within 1–2 business days.
                    If you do not receive it within 3 business days, please contact
                    <a href="mailto:support@eduthrift.co.za" style="color:#004aad">support@eduthrift.co.za</a>
                    quoting order <strong>%s</strong>.
                  </p>
                </div>

                <div style="text-align:center;margin:0 0 8px">
                  <a href="%s/orders"
                     style="display:inline-block;background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
                    View Order
                  </a>
                </div>
                """.formatted(
                        order.getSeller().getFirstName(),
                        order.getOrderNumber(),
                        ZAR.format(payout),
                        order.getItem().getItemName(),
                        order.getOrderNumber(),
                        appBaseUrl
                )
        );
        send(order.getSeller().getEmail(), "Payout Processing — Manual EFT: " + order.getOrderNumber(), sellerHtml);

        String adminHtml = adminAlertHtml(
                "Manual Payout Required", order.getOrderNumber(),
                "Order <strong>" + order.getOrderNumber() + "</strong> requires a manual EFT payout to the seller.",
                "Seller: " + order.getSeller().getFirstName() + " " + order.getSeller().getLastName()
                        + " (" + order.getSeller().getEmail() + ")<br>"
                        + "Bank: " + nvl(order.getSeller().getBankName()) + " — " + nvl(order.getSeller().getBankAccountNumber()) + "<br>"
                        + "Amount: " + ZAR.format(payout) + "<br>"
                        + "Reason: " + nvl(order.getPayoutFailureReason())
        );
        send(adminEmail, "[ACTION REQUIRED] Manual Payout — " + order.getOrderNumber(), adminHtml);
    }

    private void sendPayoutFailedEmail(Order order) throws Exception {
        BigDecimal payout = order.getSellerPayout() != null ? order.getSellerPayout() : order.getItemPrice();
        String sellerHtml = wrap(
                header(logoUrl(), "Payout Issue", "Our team will contact you"),
                """
                <p style="font-size:16px;color:#333;margin:0 0 12px">Hi <strong>%s</strong>,</p>
                <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6">
                  There was an issue processing your payout for order <strong>%s</strong>.
                  Your funds are safe and our team will resolve this within 1–2 business days.
                </p>

                <div style="background:#fde8e8;border-radius:8px;padding:14px;margin:0 0 20px;border-left:4px solid #e74c3c">
                  <p style="margin:0;font-size:13px;color:#922b21;line-height:1.8">
                    <strong>💰 Payout amount:</strong> %s<br>
                    <strong>📦 Item sold:</strong> %s<br><br>
                    You do not need to take any action. If you have not heard from us within 3 business days,
                    please contact <a href="mailto:support@eduthrift.co.za" style="color:#004aad">support@eduthrift.co.za</a>
                    with order number <strong>%s</strong>.
                  </p>
                </div>

                <div style="text-align:center;margin:0 0 8px">
                  <a href="%s/orders"
                     style="display:inline-block;background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
                    View Order
                  </a>
                </div>
                """.formatted(
                        order.getSeller().getFirstName(),
                        order.getOrderNumber(),
                        ZAR.format(payout),
                        order.getItem().getItemName(),
                        order.getOrderNumber(),
                        appBaseUrl
                )
        );
        send(order.getSeller().getEmail(), "Payout Issue — Action Needed: " + order.getOrderNumber(), sellerHtml);

        String adminHtml = adminAlertHtml(
                "Payout Failed", order.getOrderNumber(),
                "Payout failed for order <strong>" + order.getOrderNumber() + "</strong>. Attempts: "
                        + order.getPayoutAttempts() + "/3.",
                "Seller: " + order.getSeller().getFirstName() + " " + order.getSeller().getLastName()
                        + " (" + order.getSeller().getEmail() + ")<br>"
                        + "Amount: " + ZAR.format(payout) + "<br>"
                        + "Reason: " + nvl(order.getPayoutFailureReason())
        );
        send(adminEmail, "[ALERT] Payout Failed — " + order.getOrderNumber(), adminHtml);
    }

    // ── Payment failed / cancelled ────────────────────────────────────────────

    public void sendPaymentFailedEmail(Order order) {
        try {
            String buyerHtml = wrap(
                    header(logoUrl(), "Payment Failed", "Your order could not be processed"),
                    """
                    <p style="font-size:16px;color:#333;margin:0 0 12px">Hi <strong>%s</strong>,</p>
                    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6">
                      Unfortunately your payment for order <strong>%s</strong> could not be processed
                      and the order has been cancelled.
                    </p>

                    <div style="background:#fde8e8;border-radius:8px;padding:14px;margin:0 0 20px;border-left:4px solid #e74c3c">
                      <p style="margin:0;font-size:13px;color:#922b21">
                        <strong>📦 Item:</strong> %s<br><br>
                        The item has been returned to the listings. You are welcome to try again.
                      </p>
                    </div>

                    <div style="text-align:center;margin:0 0 8px">
                      <a href="%s/buyer"
                         style="display:inline-block;background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
                        Browse Listings
                      </a>
                    </div>
                    """.formatted(
                            order.getBuyer().getFirstName(),
                            order.getOrderNumber(),
                            order.getItem().getItemName(),
                            appBaseUrl
                    )
            );
            send(order.getBuyer().getEmail(), "Payment Failed — " + order.getOrderNumber(), buyerHtml);

            String sellerHtml = wrap(
                    header(logoUrl(), "Order Cancelled", "Buyer's payment was not successful"),
                    """
                    <p style="font-size:16px;color:#333;margin:0 0 12px">Hi <strong>%s</strong>,</p>
                    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6">
                      Order <strong>%s</strong> for <strong>%s</strong> has been cancelled because the buyer's
                      payment could not be processed. Your item has been returned to active listings.
                    </p>

                    <div style="text-align:center;margin:0 0 8px">
                      <a href="%s/orders"
                         style="display:inline-block;background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
                        View My Listings
                      </a>
                    </div>
                    """.formatted(
                            order.getSeller().getFirstName(),
                            order.getOrderNumber(),
                            order.getItem().getItemName(),
                            appBaseUrl
                    )
            );
            send(order.getSeller().getEmail(), "Order Cancelled — Payment Failed: " + order.getOrderNumber(), sellerHtml);
        } catch (Exception e) {
            log.warn("Failed to send payment failed emails for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    // ── Refund ────────────────────────────────────────────────────────────────

    public void sendRefundEmail(Order order) {
        try {
            BigDecimal refundAmount = order.getTotalAmount() != null ? order.getTotalAmount() : order.getItemPrice();
            String html = wrap(
                    header(logoUrl(), "Refund Processed", "Your funds are on their way back"),
                    """
                    <p style="font-size:16px;color:#333;margin:0 0 12px">Hi <strong>%s</strong>,</p>
                    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6">
                      A refund has been processed for your order <strong>%s</strong>.
                    </p>

                    <div style="background:#fef9e7;border-radius:8px;padding:14px;margin:0 0 20px;border-left:4px solid #f39c12">
                      <p style="margin:0;font-size:13px;color:#784212;line-height:1.8">
                        <strong>💰 Refund amount:</strong> %s<br>
                        <strong>📦 Item:</strong> %s<br><br>
                        Refunds typically reflect within 3–5 business days depending on your bank and payment method.
                      </p>
                    </div>

                    <p style="font-size:13px;color:#666;margin:0 0 20px">
                      If you have any questions about this refund, please contact
                      <a href="mailto:support@eduthrift.co.za" style="color:#004aad">support@eduthrift.co.za</a>.
                    </p>

                    <div style="text-align:center;margin:0 0 8px">
                      <a href="%s/buyer"
                         style="display:inline-block;background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
                        Browse Listings
                      </a>
                    </div>
                    """.formatted(
                            order.getBuyer().getFirstName(),
                            order.getOrderNumber(),
                            ZAR.format(refundAmount),
                            order.getItem().getItemName(),
                            appBaseUrl
                    )
            );
            send(order.getBuyer().getEmail(), "Refund Processed — " + order.getOrderNumber(), html);
        } catch (Exception e) {
            log.warn("Failed to send refund email for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    // ── Listing expiry reminder ───────────────────────────────────────────────

    public void sendListingExpiryReminderEmail(Item item, int daysLeft) {
        try {
            String html = wrap(
                    header(logoUrl(), "Your Listing Expires Soon", ""),
                    """
                    <p style="font-size:16px;color:#333;margin:0 0 12px">Hi <strong>%s</strong>,</p>
                    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6">
                      Your listing <strong>%s</strong> will expire in <strong>%d days</strong>.
                      Once expired, it will no longer appear in search results.
                    </p>

                    <div style="background:white;border:1px solid #ddd;border-radius:8px;padding:16px;margin:0 0 20px;text-align:center">
                      <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1a1a1a">%s</p>
                      <p style="margin:0;font-size:14px;color:#e74c3c;font-weight:700">
                        ⏰ Expires in %d day%s
                      </p>
                    </div>

                    <p style="font-size:14px;color:#555;margin:0 0 20px">
                      Simply log in and click <strong>Relist</strong> on your listing to extend it for another 60 days — for free.
                    </p>

                    <div style="text-align:center;margin:0 0 8px">
                      <a href="%s/profile/listings"
                         style="display:inline-block;background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
                        Relist My Item
                      </a>
                    </div>
                    <p style="font-size:12px;color:#aaa;text-align:center;margin:16px 0 0">
                      If you no longer have this item available, you can delete the listing from your seller dashboard.
                    </p>
                    """.formatted(
                            item.getUser().getFirstName(),
                            item.getItemName(),
                            daysLeft,
                            item.getItemName(),
                            daysLeft,
                            daysLeft == 1 ? "" : "s",
                            appBaseUrl
                    )
            );
            send(item.getUser().getEmail(),
                    "Your listing \"" + item.getItemName() + "\" expires in " + daysLeft + " days — Relist now",
                    html);
        } catch (Exception e) {
            log.warn("Failed to send expiry reminder for item {}: {}", item.getId(), e.getMessage());
        }
    }

    // ── Order cancellation ────────────────────────────────────────────────────

    public void sendOrderCancellationEmail(Order order, String reason) {
        try {
            String html = wrap(
                    header(logoUrl(), "Order Cancelled", ""),
                    """
                    <p style="font-size:16px;color:#333;margin:0 0 12px">Hi <strong>%s</strong>,</p>
                    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6">
                      Your order <strong>%s</strong> for <strong>%s</strong> has been cancelled.
                    </p>

                    <div style="background:#fff3cd;border-radius:8px;padding:14px;margin:0 0 20px">
                      <p style="margin:0;font-size:13px;color:#856404">
                        <strong>Reason:</strong> %s<br><br>
                        The item has been returned to the listings and is available for purchase again.
                      </p>
                    </div>

                    <div style="text-align:center;margin:0 0 8px">
                      <a href="%s/buyer"
                         style="display:inline-block;background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
                        Browse Listings
                      </a>
                    </div>
                    """.formatted(
                            order.getBuyer().getFirstName(),
                            order.getOrderNumber(),
                            order.getItem().getItemName(),
                            reason,
                            appBaseUrl
                    )
            );
            send(order.getBuyer().getEmail(), "Order Cancelled — " + order.getOrderNumber(), html);
        } catch (Exception e) {
            log.warn("Failed to send cancellation email for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    // ── Seller verification ───────────────────────────────────────────────────

    public void sendSellerDocumentsSubmittedEmail(za.co.thrift.eduthrift.entity.User user) {
        try {
            String details = "Name: %s %s<br>Email: %s<br>Phone: %s<br>Town: %s, %s"
                    .formatted(user.getFirstName(), user.getLastName(),
                            user.getEmail(), user.getPhone(),
                            user.getTown(), user.getProvince());
            send(adminEmail,
                    "Seller Verification Pending — Action Required — " + user.getEmail(),
                    adminAlertHtml("New Seller Verification Request", user.getEmail(),
                            "A seller has submitted all 3 verification documents (ID, proof of address, bank confirmation). Please review and approve or reject in the admin panel.",
                            details));
        } catch (Exception e) {
            log.warn("Failed to send seller verification admin alert for {}: {}", user.getEmail(), e.getMessage());
        }
    }

    // ── Dispute ───────────────────────────────────────────────────────────────

    public void sendDisputeRaisedEmails(Order order) {
        try {
            String buyerHtml = wrap(
                    header(logoUrl(), "Dispute Received", "We're on it — funds are frozen"),
                    """
                    <p style="font-size:16px;color:#333;margin:0 0 12px">Hi <strong>%s</strong>,</p>
                    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6">
                      We've received your dispute for order <strong>%s</strong>.
                    </p>

                    <div style="background:#fef9e7;border-radius:8px;padding:14px;margin:0 0 20px;border-left:4px solid #e67e22">
                      <p style="margin:0;font-size:13px;color:#784212;line-height:1.8">
                        <strong>Item:</strong> %s<br>
                        <strong>Your reason:</strong> %s<br><br>
                        The funds are now frozen — the seller cannot receive payment until our team resolves this.
                        We'll review your dispute within 24 hours.
                      </p>
                    </div>

                    <p style="font-size:13px;color:#666;margin:0">
                      Questions? Email <a href="mailto:support@eduthrift.co.za" style="color:#004aad">support@eduthrift.co.za</a>
                      and quote your order number.
                    </p>
                    """.formatted(
                            order.getBuyer().getFirstName(),
                            order.getOrderNumber(),
                            order.getItem().getItemName(),
                            order.getDisputeReason()
                    )
            );
            send(order.getBuyer().getEmail(), "Dispute Received — " + order.getOrderNumber(), buyerHtml);

            String adminDetails = "Buyer: %s (%s)<br>Seller: %s (%s)<br>Item: %s<br>Amount held: %s<br>Reason: %s"
                    .formatted(
                            order.getBuyer().getFirstName() + " " + order.getBuyer().getLastName(),
                            order.getBuyer().getEmail(),
                            order.getSeller().getFirstName() + " " + order.getSeller().getLastName(),
                            order.getSeller().getEmail(),
                            order.getItem().getItemName(),
                            ZAR.format(order.getEscrowAmount()),
                            order.getDisputeReason()
                    );
            send(adminEmail,
                    "Dispute Raised — Action Required — " + order.getOrderNumber(),
                    adminAlertHtml("Dispute Raised", order.getOrderNumber(),
                            "A buyer has raised a dispute. Funds are frozen. Review and resolve via the admin panel.",
                            adminDetails));
        } catch (Exception e) {
            log.warn("Failed to send dispute emails for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    private String logoUrl() {
        return appBaseUrl + "/eduLogo.png";
    }

    /** Consistent Eduthrift-branded email header: blue background, logo, title, optional subtitle. */
    private String header(String logoSrc, String title, String subtitle) {
        String sub = (subtitle != null && !subtitle.isBlank())
                ? "<p style=\"color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px\">" + subtitle + "</p>"
                : "";
        return """
                <div style="background:#004aad;padding:28px 24px;border-radius:12px 12px 0 0;text-align:center">
                  <img src="%s" alt="Eduthrift" style="height:52px;width:auto;display:inline-block;margin-bottom:14px" /><br>
                  <span style="color:white;font-size:22px;font-weight:700">%s</span>
                  %s
                </div>
                """.formatted(logoSrc, title, sub);
    }

    /** Wraps header + body + footer in the standard email shell. */
    private String wrap(String header, String body) {
        return """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
                  %s
                  <div style="background:#f9f9f9;padding:32px 28px;border:1px solid #eee;border-top:none">
                    %s
                  </div>
                  %s
                </div>
                """.formatted(header, body, footer());
    }

    private String adminAlertHtml(String title, String orderNumber, String body, String details) {
        return """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                  <div style="background:#2c3e50;padding:16px 20px;border-radius:8px 8px 0 0">
                    <h2 style="color:white;margin:0;font-size:18px">Eduthrift Admin Alert: %s</h2>
                    <p style="color:#bdc3c7;margin:4px 0 0;font-size:13px">Ref: %s</p>
                  </div>
                  <div style="background:#f9f9f9;padding:20px;border:1px solid #ddd">
                    <p style="font-size:14px;color:#2c3e50">%s</p>
                    <div style="background:white;border:1px solid #ddd;border-radius:4px;padding:12px;font-size:13px;color:#555;font-family:monospace">
                      %s
                    </div>
                  </div>
                </div>
                """.formatted(title, orderNumber, body, details);
    }

    private String footer() {
        return "<div style=\"text-align:center;padding:16px;font-size:12px;color:#999\">"
                + "Eduthrift &middot; <a href=\"mailto:support@eduthrift.co.za\" style=\"color:#999\">support@eduthrift.co.za</a>"
                + " &middot; <a href=\"https://www.eduthrift.co.za\" style=\"color:#999\">www.eduthrift.co.za</a>"
                + "</div>";
    }

    private String nvl(String value) {
        return value != null ? value : "N/A";
    }

    private void send(String to, String subject, String html) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(message);
    }
}
