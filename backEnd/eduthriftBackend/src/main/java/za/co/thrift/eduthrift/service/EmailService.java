package za.co.thrift.eduthrift.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
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

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

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
                        <p>Your order has been placed and your payment is securely held in <strong>TradeSafe escrow</strong>.
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
                            <tr><td style="padding:6px 0;color:#555">Shipping (Pudo)</td>
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
                            <strong>ℹ️ Buyer Protection Fee:</strong> Covers TradeSafe escrow fees and platform costs.
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
                      <div style="text-align:center;padding:16px;font-size:12px;color:#999">
                        Eduthrift · support@eduthrift.co.za · www.eduthrift.co.za
                      </div>
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
                    appBaseUrl
            );

            send(order.getBuyer().getEmail(),
                    "Order Confirmed — " + order.getOrderNumber(),
                    html);

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
                        <h1 style="color:white;margin:0;font-size:24px">You Have a Sale! 🎉</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Eduthrift Secure Marketplace</p>
                      </div>
                      <div style="background:#f9f9f9;padding:24px;border:1px solid #eee">
                        <p style="font-size:16px">Hi <strong>%s</strong>,</p>
                        <p>Great news! Your item has been purchased. Payment is held securely in TradeSafe escrow
                           and will be released to you once the buyer confirms delivery.</p>

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
                            <strong>📦 Next Steps — Action Required:</strong><br><br>
                            1. Drop your item off at your nearest <strong>Pudo locker</strong>.<br>
                            2. Open the Eduthrift app → My Orders → view your waybill/tracking number.<br>
                            3. Once the buyer collects and confirms delivery, funds are released to you.<br><br>
                            <strong>Buyer's delivery locker:</strong> %s
                          </p>
                        </div>

                        <div style="background:#e8f5e8;border-radius:8px;padding:14px;margin:16px 0">
                          <p style="margin:0;font-size:13px;color:#2d5a2d">
                            <strong>✅ Zero seller fees:</strong> You keep 100%% of your listed price.
                            The buyer pays the platform protection fee and shipping separately.
                          </p>
                        </div>

                        <div style="text-align:center;margin:24px 0">
                          <a href="%s/orders" style="background:#27ae60;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                            View My Orders
                          </a>
                        </div>
                      </div>
                      <div style="text-align:center;padding:16px;font-size:12px;color:#999">
                        Eduthrift · support@eduthrift.co.za · www.eduthrift.co.za
                      </div>
                    </div>
                    """.formatted(
                    order.getSeller().getFirstName(),
                    order.getOrderNumber(),
                    order.getItem().getItemName(),
                    ZAR.format(itemTotal),
                    ZAR.format(itemTotal),  // seller gets full amount
                    order.getPickupPoint() != null ? order.getPickupPoint() : "See order details",
                    appBaseUrl
            );

            send(order.getSeller().getEmail(),
                    "You Have a Sale! — " + order.getOrderNumber(),
                    html);

        } catch (Exception e) {
            log.warn("Failed to send seller notification email for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
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
