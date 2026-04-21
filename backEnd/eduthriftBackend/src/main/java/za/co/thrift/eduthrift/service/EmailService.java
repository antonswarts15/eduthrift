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

    // ── Order creation ────────────────────────────────────────────────────────

    public void sendBuyerOrderConfirmation(Order order) {
        try {
            BigDecimal itemTotal = order.getItemPrice().multiply(BigDecimal.valueOf(order.getQuantity()));
            BigDecimal protectionFee = order.getBuyerProtectionFee() != null ? order.getBuyerProtectionFee() : BigDecimal.ZERO;
            BigDecimal shipping = order.getShippingCost() != null ? order.getShippingCost() : BigDecimal.ZERO;
            BigDecimal total = itemTotal.add(protectionFee).add(shipping);

            String html = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                      <div style="background:#004aad;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                        <h1 style="color:white;margin:0;font-size:24px">Order Confirmed!</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Eduthrift Secure Marketplace</p>
                      </div>
                      <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                        <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                        <p>Your order has been placed and your payment is securely held in <strong>escrow</strong>.
                           Funds will only be released to the seller once you confirm delivery.</p>

                        <div style="background:white;border:1px solid #ddd;border-radius:8px;padding:16px;margin:20px 0">
                          <h3 style="margin:0 0 12px;color:#004aad">Order Summary — %s</h3>
                          <table style="width:100%%;border-collapse:collapse;font-size:14px">
                            <tr><td style="padding:6px 0;color:#555">Item</td>
                                <td style="padding:6px 0;text-align:right"><strong>%s</strong></td></tr>
                            <tr><td style="padding:6px 0;color:#555">Item Price</td>
                                <td style="padding:6px 0;text-align:right">%s</td></tr>
                            <tr><td style="padding:6px 0;color:#555">Buyer Protection Fee</td>
                                <td style="padding:6px 0;text-align:right">%s</td></tr>
                            <tr><td style="padding:6px 0;color:#555">Shipping</td>
                                <td style="padding:6px 0;text-align:right">%s</td></tr>
                            <tr style="border-top:2px solid #004aad">
                              <td style="padding:10px 0 0;font-size:16px"><strong>Total Paid</strong></td>
                              <td style="padding:10px 0 0;text-align:right;font-size:16px;color:#004aad"><strong>%s</strong></td>
                            </tr>
                          </table>
                        </div>

                        <div style="background:#e8f5e8;border-radius:8px;padding:14px;margin:16px 0">
                          <p style="margin:0;font-size:13px;color:#2d5a2d">
                            <strong>📦 Delivery to:</strong> %s<br>
                            <strong>🔒 Escrow:</strong> Your payment is protected until you confirm receipt.<br>
                            <strong>ℹ️ Buyer Protection Fee:</strong> Covers escrow fees and platform costs.
                            The seller receives the full item price.
                          </p>
                        </div>

                        <p style="font-size:13px;color:#666">
                          Once the seller ships your item, you will receive a tracking number.
                          When you collect from the Pudo locker, confirm delivery in the app to release payment to the seller.
                        </p>

                        <div style="text-align:center;margin:24px 0">
                          <a href="%s/orders" style="background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                            View My Orders
                          </a>
                        </div>
                      </div>
                      %s
                    </div>
                    """.formatted(
                    order.getBuyer().getFirstName(),
                    order.getOrderNumber(),
                    order.getItem().getItemName(),
                    ZAR.format(itemTotal),
                    ZAR.format(protectionFee),
                    ZAR.format(shipping),
                    ZAR.format(total),
                    order.getPickupPoint() != null ? order.getPickupPoint() : "See order details",
                    appBaseUrl,
                    footer()
            );

            send(order.getBuyer().getEmail(), "Order Confirmed — " + order.getOrderNumber(), html);
        } catch (Exception e) {
            log.warn("Failed to send buyer confirmation email for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    public void sendSellerOrderNotification(Order order) {
        try {
            BigDecimal itemTotal = order.getItemPrice().multiply(BigDecimal.valueOf(order.getQuantity()));

            String html = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                      <div style="background:#27ae60;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                        <h1 style="color:white;margin:0;font-size:24px">You Have a Sale!</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Eduthrift Secure Marketplace</p>
                      </div>
                      <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                        <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                        <p>Great news! Your item has been purchased. Once the buyer's payment is confirmed,
                           you will receive a follow-up email to ship the item.</p>

                        <div style="background:white;border:1px solid #ddd;border-radius:8px;padding:16px;margin:20px 0">
                          <h3 style="margin:0 0 12px;color:#27ae60">Sale Summary — %s</h3>
                          <table style="width:100%%;border-collapse:collapse;font-size:14px">
                            <tr><td style="padding:6px 0;color:#555">Item Sold</td>
                                <td style="padding:6px 0;text-align:right"><strong>%s</strong></td></tr>
                            <tr><td style="padding:6px 0;color:#555">Your Listed Price</td>
                                <td style="padding:6px 0;text-align:right">%s</td></tr>
                            <tr><td style="padding:6px 0;color:#555">Platform Fee</td>
                                <td style="padding:6px 0;text-align:right;color:#27ae60"><strong>R0.00 (FREE)</strong></td></tr>
                            <tr style="border-top:2px solid #27ae60">
                              <td style="padding:10px 0 0;font-size:16px"><strong>You Receive</strong></td>
                              <td style="padding:10px 0 0;text-align:right;font-size:16px;color:#27ae60"><strong>%s</strong></td>
                            </tr>
                          </table>
                        </div>

                        <div style="background:#fff3cd;border-radius:8px;padding:14px;margin:16px 0">
                          <p style="margin:0;font-size:13px;color:#856404">
                            <strong>⏳ Next step:</strong> Wait for payment confirmation.
                            You will receive another email once the buyer's payment clears. Do not ship until then.
                          </p>
                        </div>

                        <div style="text-align:center;margin:24px 0">
                          <a href="%s/orders" style="background:#27ae60;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                            View My Orders
                          </a>
                        </div>
                      </div>
                      %s
                    </div>
                    """.formatted(
                    order.getSeller().getFirstName(),
                    order.getOrderNumber(),
                    order.getItem().getItemName(),
                    ZAR.format(itemTotal),
                    ZAR.format(itemTotal),
                    appBaseUrl,
                    footer()
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

            // Buyer: payment received and held
            String buyerHtml = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                      <div style="background:#004aad;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                        <h1 style="color:white;margin:0;font-size:24px">Payment Confirmed</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Your funds are safely in escrow</p>
                      </div>
                      <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                        <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                        <p>Your payment for order <strong>%s</strong> has been confirmed and is securely held in escrow.
                           The seller has been notified to ship your item.</p>

                        <div style="background:#e8f5e8;border-radius:8px;padding:14px;margin:16px 0">
                          <p style="margin:0;font-size:13px;color:#2d5a2d">
                            <strong>📦 Item:</strong> %s<br>
                            <strong>🔒 Escrow amount:</strong> %s<br>
                            <strong>📍 Delivery locker:</strong> %s<br><br>
                            Your money is safe and will only be released to the seller once you confirm you have received your item.
                          </p>
                        </div>

                        <p style="font-size:13px;color:#666">
                          You will receive a tracking number once the seller ships your item.
                        </p>

                        <div style="text-align:center;margin:24px 0">
                          <a href="%s/orders" style="background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                            Track My Order
                          </a>
                        </div>
                      </div>
                      %s
                    </div>
                    """.formatted(
                    order.getBuyer().getFirstName(),
                    order.getOrderNumber(),
                    order.getItem().getItemName(),
                    ZAR.format(itemTotal),
                    order.getPickupPoint() != null ? order.getPickupPoint() : "See order details",
                    appBaseUrl,
                    footer()
            );
            send(order.getBuyer().getEmail(), "Payment Confirmed — " + order.getOrderNumber(), buyerHtml);

            // Seller: payment confirmed, ship now
            String sellerHtml = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                      <div style="background:#27ae60;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                        <h1 style="color:white;margin:0;font-size:24px">Payment Received — Ship Now!</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Eduthrift Secure Marketplace</p>
                      </div>
                      <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                        <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                        <p>The buyer's payment for order <strong>%s</strong> has been confirmed and is held in escrow.
                           <strong>You can now ship the item.</strong></p>

                        <div style="background:#e8f5e8;border-radius:8px;padding:14px;margin:16px 0">
                          <p style="margin:0;font-size:13px;color:#2d5a2d">
                            <strong>📦 Item to ship:</strong> %s<br>
                            <strong>💰 Your payout:</strong> %s (released after buyer confirms delivery)<br>
                            <strong>📍 Deliver to locker:</strong> %s
                          </p>
                        </div>

                        <div style="background:#fff3cd;border-radius:8px;padding:14px;margin:16px 0">
                          <p style="margin:0;font-size:13px;color:#856404">
                            <strong>📋 Shipping steps:</strong><br><br>
                            1. Drop the item off at your nearest Pudo locker.<br>
                            2. Open the Eduthrift app → My Orders to find your waybill.<br>
                            3. The buyer will be notified to collect and confirm receipt.<br>
                            4. Once confirmed, funds are automatically released to you.
                          </p>
                        </div>

                        <div style="text-align:center;margin:24px 0">
                          <a href="%s/orders" style="background:#27ae60;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                            View Order &amp; Waybill
                          </a>
                        </div>
                      </div>
                      %s
                    </div>
                    """.formatted(
                    order.getSeller().getFirstName(),
                    order.getOrderNumber(),
                    order.getItem().getItemName(),
                    ZAR.format(itemTotal),
                    order.getPickupPoint() != null ? order.getPickupPoint() : "See order details",
                    appBaseUrl,
                    footer()
            );
            send(order.getSeller().getEmail(), "Payment Confirmed — Ship Now: " + order.getOrderNumber(), sellerHtml);

        } catch (Exception e) {
            log.warn("Failed to send payment confirmed emails for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    // ── Order shipped ─────────────────────────────────────────────────────────

    public void sendOrderShippedEmail(Order order) {
        try {
            String tracking = order.getTrackingNumber() != null ? order.getTrackingNumber() : "Check the app for updates";

            String html = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                      <div style="background:#3498db;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                        <h1 style="color:white;margin:0;font-size:24px">Your Order is On Its Way!</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Eduthrift Secure Marketplace</p>
                      </div>
                      <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                        <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                        <p>Great news! Your order <strong>%s</strong> for <strong>%s</strong> has been shipped and is on its way to your Pudo locker.</p>

                        <div style="background:#e8f4fd;border-radius:8px;padding:14px;margin:16px 0">
                          <p style="margin:0;font-size:13px;color:#1a5276">
                            <strong>🚚 Tracking number:</strong> %s<br>
                            <strong>📍 Delivery locker:</strong> %s
                          </p>
                        </div>

                        <div style="background:#fff3cd;border-radius:8px;padding:14px;margin:16px 0">
                          <p style="margin:0;font-size:13px;color:#856404">
                            <strong>What to do when it arrives:</strong><br>
                            Collect your item from the Pudo locker, then open the Eduthrift app and confirm delivery.
                            This releases payment to the seller and completes your order.
                          </p>
                        </div>

                        <div style="text-align:center;margin:24px 0">
                          <a href="%s/orders" style="background:#3498db;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                            Track My Order
                          </a>
                        </div>
                      </div>
                      %s
                    </div>
                    """.formatted(
                    order.getBuyer().getFirstName(),
                    order.getOrderNumber(),
                    order.getItem().getItemName(),
                    tracking,
                    order.getPickupPoint() != null ? order.getPickupPoint() : "See order details",
                    appBaseUrl,
                    footer()
            );

            send(order.getBuyer().getEmail(), "Your Order Has Been Shipped — " + order.getOrderNumber(), html);
        } catch (Exception e) {
            log.warn("Failed to send order shipped email for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    // ── Order arrived at locker ───────────────────────────────────────────────

    public void sendOrderArrivedEmail(Order order) {
        try {
            String html = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                      <div style="background:#9b59b6;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                        <h1 style="color:white;margin:0;font-size:24px">Your Order Has Arrived!</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Ready for collection at your Pudo locker</p>
                      </div>
                      <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                        <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                        <p>Your order <strong>%s</strong> for <strong>%s</strong> has arrived at your Pudo locker and is ready for collection.</p>

                        <div style="background:#f5eef8;border-radius:8px;padding:14px;margin:16px 0">
                          <p style="margin:0;font-size:13px;color:#6c3483">
                            <strong>📍 Collection locker:</strong> %s<br>
                            <strong>🔑 Tracking number:</strong> %s
                          </p>
                        </div>

                        <div style="background:#fff3cd;border-radius:8px;padding:14px;margin:16px 0">
                          <p style="margin:0;font-size:13px;color:#856404">
                            <strong>Important:</strong> After collecting your item, open the Eduthrift app and
                            confirm delivery to release payment to the seller and complete the transaction.
                            If you do not confirm within <strong>72 hours</strong>, the system will
                            automatically release the funds.
                          </p>
                        </div>

                        <div style="text-align:center;margin:24px 0">
                          <a href="%s/orders" style="background:#9b59b6;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                            Confirm Delivery in App
                          </a>
                        </div>
                      </div>
                      %s
                    </div>
                    """.formatted(
                    order.getBuyer().getFirstName(),
                    order.getOrderNumber(),
                    order.getItem().getItemName(),
                    order.getPickupPoint() != null ? order.getPickupPoint() : "See order details",
                    order.getTrackingNumber() != null ? order.getTrackingNumber() : "See order details",
                    appBaseUrl,
                    footer()
            );

            send(order.getBuyer().getEmail(), "Your Order Has Arrived — Collect & Confirm: " + order.getOrderNumber(), html);
        } catch (Exception e) {
            log.warn("Failed to send order arrived email for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    // ── Delivery confirmed / escrow release ───────────────────────────────────

    public void sendDeliveryConfirmedEmails(Order order) {
        try {
            // Buyer confirmation
            String buyerHtml = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                      <div style="background:#27ae60;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                        <h1 style="color:white;margin:0;font-size:24px">Delivery Confirmed!</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Transaction complete</p>
                      </div>
                      <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                        <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                        <p>You've confirmed receipt of your order <strong>%s</strong> for <strong>%s</strong>.
                           The escrow funds have been released to the seller. Your transaction is complete!</p>

                        <div style="background:#e8f5e8;border-radius:8px;padding:14px;margin:16px 0">
                          <p style="margin:0;font-size:13px;color:#2d5a2d">
                            Thank you for buying on Eduthrift. If you have any issues with your item,
                            please contact us at <a href="mailto:support@eduthrift.co.za" style="color:#27ae60">support@eduthrift.co.za</a>.
                          </p>
                        </div>

                        <div style="text-align:center;margin:24px 0">
                          <a href="%s/buyer" style="background:#27ae60;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                            Browse More Items
                          </a>
                        </div>
                      </div>
                      %s
                    </div>
                    """.formatted(
                    order.getBuyer().getFirstName(),
                    order.getOrderNumber(),
                    order.getItem().getItemName(),
                    appBaseUrl,
                    footer()
            );
            send(order.getBuyer().getEmail(), "Delivery Confirmed — " + order.getOrderNumber(), buyerHtml);

            // Seller: delivery confirmed, payout being processed
            String sellerHtml = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                      <div style="background:#27ae60;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                        <h1 style="color:white;margin:0;font-size:24px">Delivery Confirmed — Payout Processing</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Eduthrift Secure Marketplace</p>
                      </div>
                      <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                        <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                        <p>The buyer has confirmed delivery of order <strong>%s</strong>. Escrow funds are being released
                           and your payout of <strong>%s</strong> is being processed.</p>

                        <div style="background:#e8f5e8;border-radius:8px;padding:14px;margin:16px 0">
                          <p style="margin:0;font-size:13px;color:#2d5a2d">
                            <strong>💰 Your payout:</strong> %s<br>
                            <strong>📦 Item sold:</strong> %s<br><br>
                            You will receive a separate confirmation once the transfer is complete.
                          </p>
                        </div>

                        <div style="text-align:center;margin:24px 0">
                          <a href="%s/orders" style="background:#27ae60;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                            View Order
                          </a>
                        </div>
                      </div>
                      %s
                    </div>
                    """.formatted(
                    order.getSeller().getFirstName(),
                    order.getOrderNumber(),
                    ZAR.format(order.getSellerPayout() != null ? order.getSellerPayout() : order.getItemPrice()),
                    ZAR.format(order.getSellerPayout() != null ? order.getSellerPayout() : order.getItemPrice()),
                    order.getItem().getItemName(),
                    appBaseUrl,
                    footer()
            );
            send(order.getSeller().getEmail(), "Delivery Confirmed — Payout Processing: " + order.getOrderNumber(), sellerHtml);

        } catch (Exception e) {
            log.warn("Failed to send delivery confirmed emails for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    // ── Auto-release after 72 hours ───────────────────────────────────────────

    public void sendAutoReleaseEmails(Order order) {
        try {
            String buyerHtml = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                      <div style="background:#7f8c8d;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                        <h1 style="color:white;margin:0;font-size:24px">Order Auto-Completed</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">72-hour escrow window expired</p>
                      </div>
                      <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                        <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                        <p>Your order <strong>%s</strong> for <strong>%s</strong> has been automatically completed
                           as 72 hours have passed since your item was delivered.</p>

                        <div style="background:#f8f9fa;border-radius:8px;padding:14px;margin:16px 0;border-left:4px solid #7f8c8d">
                          <p style="margin:0;font-size:13px;color:#555">
                            The escrow funds have been released to the seller. If you have not received your item
                            or have a dispute, please contact us immediately at
                            <a href="mailto:support@eduthrift.co.za" style="color:#3498db">support@eduthrift.co.za</a>.
                          </p>
                        </div>

                        <div style="text-align:center;margin:24px 0">
                          <a href="%s/orders" style="background:#7f8c8d;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                            View Order
                          </a>
                        </div>
                      </div>
                      %s
                    </div>
                    """.formatted(
                    order.getBuyer().getFirstName(),
                    order.getOrderNumber(),
                    order.getItem().getItemName(),
                    appBaseUrl,
                    footer()
            );
            send(order.getBuyer().getEmail(), "Order Auto-Completed — " + order.getOrderNumber(), buyerHtml);

            String sellerHtml = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                      <div style="background:#27ae60;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                        <h1 style="color:white;margin:0;font-size:24px">Escrow Auto-Released</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">72-hour window expired — payout processing</p>
                      </div>
                      <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                        <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                        <p>The 72-hour escrow hold for order <strong>%s</strong> has expired and the buyer has not
                           responded. Escrow funds have been automatically released and your payout of
                           <strong>%s</strong> is being processed.</p>

                        <div style="text-align:center;margin:24px 0">
                          <a href="%s/orders" style="background:#27ae60;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                            View Order
                          </a>
                        </div>
                      </div>
                      %s
                    </div>
                    """.formatted(
                    order.getSeller().getFirstName(),
                    order.getOrderNumber(),
                    ZAR.format(order.getSellerPayout() != null ? order.getSellerPayout() : order.getItemPrice()),
                    appBaseUrl,
                    footer()
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
                case COMPLETED -> sendPayoutCompletedEmail(order);
                case MANUAL_REQUIRED -> sendPayoutManualRequiredEmail(order);
                case FAILED -> sendPayoutFailedEmail(order);
                default -> { /* no email for PENDING/PROCESSING */ }
            }
        } catch (Exception e) {
            log.warn("Failed to send payout status email for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    private void sendPayoutCompletedEmail(Order order) throws Exception {
        BigDecimal payout = order.getSellerPayout() != null ? order.getSellerPayout() : order.getItemPrice();
        String html = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                  <div style="background:#27ae60;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                    <h1 style="color:white;margin:0;font-size:24px">Payout Completed!</h1>
                    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Funds transferred to your bank account</p>
                  </div>
                  <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                    <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                    <p>Your payout for order <strong>%s</strong> has been completed.</p>

                    <div style="background:#e8f5e8;border-radius:8px;padding:14px;margin:16px 0">
                      <p style="margin:0;font-size:13px;color:#2d5a2d">
                        <strong>💰 Payout amount:</strong> %s<br>
                        <strong>📦 Item sold:</strong> %s<br>
                        <strong>🏦 Transferred to:</strong> Your registered bank account<br><br>
                        Please allow 1–2 business days for the funds to reflect in your account.
                      </p>
                    </div>

                    <div style="text-align:center;margin:24px 0">
                      <a href="%s/orders" style="background:#27ae60;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                        View Order
                      </a>
                    </div>
                  </div>
                  %s
                </div>
                """.formatted(
                order.getSeller().getFirstName(),
                order.getOrderNumber(),
                ZAR.format(payout),
                order.getItem().getItemName(),
                appBaseUrl,
                footer()
        );
        send(order.getSeller().getEmail(), "Payout Completed — " + ZAR.format(payout) + " — " + order.getOrderNumber(), html);
    }

    private void sendPayoutManualRequiredEmail(Order order) throws Exception {
        BigDecimal payout = order.getSellerPayout() != null ? order.getSellerPayout() : order.getItemPrice();

        // Seller notification
        String sellerHtml = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                  <div style="background:#e67e22;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                    <h1 style="color:white;margin:0;font-size:24px">Payout Being Processed</h1>
                    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Manual transfer required</p>
                  </div>
                  <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                    <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                    <p>Your payout for order <strong>%s</strong> requires a manual bank transfer.</p>

                    <div style="background:#fef9e7;border-radius:8px;padding:14px;margin:16px 0;border-left:4px solid #e67e22">
                      <p style="margin:0;font-size:13px;color:#784212">
                        <strong>💰 Payout amount:</strong> %s<br>
                        <strong>📦 Item sold:</strong> %s<br><br>
                        Our team will process your EFT transfer within 1–2 business days.
                        If you do not receive it within 3 business days, please contact
                        <a href="mailto:support@eduthrift.co.za" style="color:#e67e22">support@eduthrift.co.za</a>
                        quoting order <strong>%s</strong>.
                      </p>
                    </div>

                    <div style="text-align:center;margin:24px 0">
                      <a href="%s/orders" style="background:#e67e22;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                        View Order
                      </a>
                    </div>
                  </div>
                  %s
                </div>
                """.formatted(
                order.getSeller().getFirstName(),
                order.getOrderNumber(),
                ZAR.format(payout),
                order.getItem().getItemName(),
                order.getOrderNumber(),
                appBaseUrl,
                footer()
        );
        send(order.getSeller().getEmail(), "Payout Processing — Manual EFT: " + order.getOrderNumber(), sellerHtml);

        // Admin alert
        String adminHtml = adminAlertHtml(
                "Manual Payout Required",
                order.getOrderNumber(),
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

        String sellerHtml = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                  <div style="background:#e74c3c;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                    <h1 style="color:white;margin:0;font-size:24px">Payout Issue</h1>
                    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Our team will contact you</p>
                  </div>
                  <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                    <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                    <p>There was an issue processing your payout for order <strong>%s</strong>. Your funds are safe
                       and our team will resolve this within 1–2 business days.</p>

                    <div style="background:#fde8e8;border-radius:8px;padding:14px;margin:16px 0;border-left:4px solid #e74c3c">
                      <p style="margin:0;font-size:13px;color:#922b21">
                        <strong>💰 Payout amount:</strong> %s<br>
                        <strong>📦 Item sold:</strong> %s<br><br>
                        You do not need to take any action. If you have not heard from us within 3 business days,
                        please contact <a href="mailto:support@eduthrift.co.za" style="color:#e74c3c">support@eduthrift.co.za</a>
                        with your order number <strong>%s</strong>.
                      </p>
                    </div>

                    <div style="text-align:center;margin:24px 0">
                      <a href="%s/orders" style="background:#e74c3c;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                        View Order
                      </a>
                    </div>
                  </div>
                  %s
                </div>
                """.formatted(
                order.getSeller().getFirstName(),
                order.getOrderNumber(),
                ZAR.format(payout),
                order.getItem().getItemName(),
                order.getOrderNumber(),
                appBaseUrl,
                footer()
        );
        send(order.getSeller().getEmail(), "Payout Issue — Action Needed: " + order.getOrderNumber(), sellerHtml);

        String adminHtml = adminAlertHtml(
                "Payout Failed",
                order.getOrderNumber(),
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
            String html = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                      <div style="background:#e74c3c;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                        <h1 style="color:white;margin:0;font-size:24px">Payment Failed</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Your order could not be processed</p>
                      </div>
                      <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                        <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                        <p>Unfortunately your payment for order <strong>%s</strong> could not be processed and the order has been cancelled.</p>

                        <div style="background:#fde8e8;border-radius:8px;padding:14px;margin:16px 0;border-left:4px solid #e74c3c">
                          <p style="margin:0;font-size:13px;color:#922b21">
                            <strong>📦 Item:</strong> %s<br><br>
                            The item has been returned to the listings. You are welcome to try again.
                          </p>
                        </div>

                        <div style="text-align:center;margin:24px 0">
                          <a href="%s/buyer" style="background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                            Browse Listings
                          </a>
                        </div>
                      </div>
                      %s
                    </div>
                    """.formatted(
                    order.getBuyer().getFirstName(),
                    order.getOrderNumber(),
                    order.getItem().getItemName(),
                    appBaseUrl,
                    footer()
            );
            send(order.getBuyer().getEmail(), "Payment Failed — " + order.getOrderNumber(), html);

            // Notify seller that the order was cancelled
            String sellerHtml = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                      <div style="background:#e74c3c;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                        <h1 style="color:white;margin:0;font-size:24px">Order Cancelled</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Buyer's payment was not successful</p>
                      </div>
                      <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                        <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                        <p>Order <strong>%s</strong> for <strong>%s</strong> has been cancelled because the buyer's payment could not be processed.
                           Your item has been returned to active listings.</p>

                        <div style="text-align:center;margin:24px 0">
                          <a href="%s/orders" style="background:#7f8c8d;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                            View My Listings
                          </a>
                        </div>
                      </div>
                      %s
                    </div>
                    """.formatted(
                    order.getSeller().getFirstName(),
                    order.getOrderNumber(),
                    order.getItem().getItemName(),
                    appBaseUrl,
                    footer()
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
            String html = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                      <div style="background:#f39c12;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                        <h1 style="color:white;margin:0;font-size:24px">Refund Processed</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Your funds are on their way back</p>
                      </div>
                      <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                        <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                        <p>A refund has been processed for your order <strong>%s</strong>.</p>

                        <div style="background:#fef9e7;border-radius:8px;padding:14px;margin:16px 0;border-left:4px solid #f39c12">
                          <p style="margin:0;font-size:13px;color:#784212">
                            <strong>💰 Refund amount:</strong> %s<br>
                            <strong>📦 Item:</strong> %s<br><br>
                            Refunds typically reflect within 3–5 business days depending on your bank and payment method.
                          </p>
                        </div>

                        <p style="font-size:13px;color:#666">
                          If you have any questions about this refund, please contact
                          <a href="mailto:support@eduthrift.co.za" style="color:#f39c12">support@eduthrift.co.za</a>.
                        </p>

                        <div style="text-align:center;margin:24px 0">
                          <a href="%s/buyer" style="background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                            Browse Listings
                          </a>
                        </div>
                      </div>
                      %s
                    </div>
                    """.formatted(
                    order.getBuyer().getFirstName(),
                    order.getOrderNumber(),
                    ZAR.format(refundAmount),
                    order.getItem().getItemName(),
                    appBaseUrl,
                    footer()
            );
            send(order.getBuyer().getEmail(), "Refund Processed — " + order.getOrderNumber(), html);
        } catch (Exception e) {
            log.warn("Failed to send refund email for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    // ── Listing expiry reminder ───────────────────────────────────────────────

    public void sendListingExpiryReminderEmail(Item item, int daysLeft) {
        try {
            String html = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                      <div style="background:#f39c12;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                        <h1 style="color:white;margin:0;font-size:24px">Your Listing Expires Soon</h1>
                        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0">Eduthrift Marketplace</p>
                      </div>
                      <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                        <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                        <p>Your listing <strong>%s</strong> will expire in <strong>%d days</strong>.
                           Once expired, it will no longer appear in search results and buyers won't be able to find it.</p>

                        <div style="background:white;border:1px solid #ddd;border-radius:8px;padding:16px;margin:20px 0;text-align:center">
                          <p style="margin:0 0 8px;font-size:18px;font-weight:bold;color:#1a1a1a">%s</p>
                          <p style="margin:0;font-size:14px;color:#e74c3c;font-weight:bold">
                            ⏰ Expires in %d day%s
                          </p>
                        </div>

                        <p style="font-size:14px;color:#555">
                          Simply log in and click <strong>Relist</strong> on your listing to extend it for another 60 days — for free.
                        </p>

                        <div style="text-align:center;margin:24px 0">
                          <a href="%s/profile/listings" style="background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px">
                            Relist My Item
                          </a>
                        </div>
                        <p style="font-size:12px;color:#aaa;text-align:center">
                          If you no longer have this item available, you can delete the listing from your seller dashboard.
                        </p>
                      </div>
                      %s
                    </div>
                    """.formatted(
                    item.getUser().getFirstName(),
                    item.getItemName(),
                    daysLeft,
                    item.getItemName(),
                    daysLeft,
                    daysLeft == 1 ? "" : "s",
                    appBaseUrl,
                    footer()
            );
            send(item.getUser().getEmail(),
                    "Your listing \"" + item.getItemName() + "\" expires in " + daysLeft + " days — Relist now",
                    html);
        } catch (Exception e) {
            log.warn("Failed to send expiry reminder for item {}: {}", item.getId(), e.getMessage());
        }
    }

    // ── Order cancellation (existing, kept for compatibility) ─────────────────

    public void sendOrderCancellationEmail(Order order, String reason) {
        try {
            String html = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                      <div style="background:#e74c3c;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                        <h1 style="color:white;margin:0;font-size:24px">Order Cancelled</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Eduthrift Secure Marketplace</p>
                      </div>
                      <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                        <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                        <p>Your order <strong>%s</strong> for <strong>%s</strong> has been cancelled.</p>
                        <div style="background:#fff3cd;border-radius:8px;padding:14px;margin:16px 0">
                          <p style="margin:0;font-size:13px;color:#856404">
                            <strong>Reason:</strong> %s<br><br>
                            The item has been returned to the listings and is available for purchase again.
                          </p>
                        </div>
                        <div style="text-align:center;margin:24px 0">
                          <a href="%s/buyer" style="background:#004aad;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                            Browse Listings
                          </a>
                        </div>
                      </div>
                      %s
                    </div>
                    """.formatted(
                    order.getBuyer().getFirstName(),
                    order.getOrderNumber(),
                    order.getItem().getItemName(),
                    reason,
                    appBaseUrl,
                    footer()
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
            String buyerHtml = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                      <div style="background:#e67e22;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                        <h1 style="color:white;margin:0;font-size:24px">Dispute Received</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">We're on it — funds are frozen</p>
                      </div>
                      <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                        <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                        <p>We've received your dispute for order <strong>%s</strong>.</p>
                        <div style="background:#fef9e7;border-radius:8px;padding:14px;margin:16px 0;border-left:4px solid #e67e22">
                          <p style="margin:0;font-size:13px;color:#784212">
                            <strong>Item:</strong> %s<br>
                            <strong>Your reason:</strong> %s<br><br>
                            The funds are now frozen — the seller cannot receive payment until our team resolves this.
                            We'll review your dispute within 24 hours.
                          </p>
                        </div>
                        <p style="font-size:13px;color:#666">
                          Questions? Email <a href="mailto:support@eduthrift.co.za" style="color:#e67e22">support@eduthrift.co.za</a>
                          and quote your order number.
                        </p>
                      </div>
                      %s
                    </div>
                    """.formatted(
                    order.getBuyer().getFirstName(),
                    order.getOrderNumber(),
                    order.getItem().getItemName(),
                    order.getDisputeReason(),
                    footer()
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

    private String adminAlertHtml(String title, String orderNumber, String body, String details) {
        return """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                  <div style="background:#2c3e50;padding:16px 20px;border-radius:8px 8px 0 0">
                    <h2 style="color:white;margin:0;font-size:18px">Eduthrift Admin Alert: %s</h2>
                    <p style="color:#bdc3c7;margin:4px 0 0;font-size:13px">Order: %s</p>
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
