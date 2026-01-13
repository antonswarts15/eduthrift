const cron = require('node-cron');

class AutoRefundService {
  constructor(pool) {
    this.pool = pool;
    this.initializeCronJobs();
  }

  initializeCronJobs() {
    // Run every hour to check for overdue deliveries
    cron.schedule('0 * * * *', () => {
      this.processOverdueDeliveries();
    });

    // Run daily to process auto-refunds
    cron.schedule('0 9 * * *', () => {
      this.processAutoRefunds();
    });
  }

  async processOverdueDeliveries() {
    try {
      console.log('Checking for overdue deliveries...');
      
      // Find orders that are overdue (7 days past expected delivery)
      const [overdueOrders] = await this.pool.execute(`
        SELECT et.*, o.tracking_reference, u.email, u.first_name
        FROM escrow_transactions et
        JOIN orders o ON et.order_id = o.id
        JOIN users u ON et.buyer_id = u.id
        WHERE et.status = 'funded'
        AND et.expected_delivery_date < DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND et.auto_refund_date IS NULL
      `);

      for (const order of overdueOrders) {
        await this.initiateRefundProcess(order);
      }
    } catch (error) {
      console.error('Error processing overdue deliveries:', error);
    }
  }

  async initiateRefundProcess(order) {
    try {
      // Set auto-refund date (14 days total - 7 days grace period)
      const autoRefundDate = new Date();
      autoRefundDate.setDate(autoRefundDate.getDate() + 7);

      await this.pool.execute(
        'UPDATE escrow_transactions SET auto_refund_date = ? WHERE id = ?',
        [autoRefundDate.toISOString().split('T')[0], order.id]
      );

      // Notify buyer about overdue delivery
      await this.pool.execute(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [
          order.buyer_id,
          'Delivery Overdue - Refund Protection Active',
          `Your order is overdue. If not delivered by ${autoRefundDate.toLocaleDateString()}, you'll receive an automatic refund. Contact support if needed.`,
          'order_update'
        ]
      );

      // Notify seller about potential refund
      await this.pool.execute(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [
          order.seller_id,
          'Urgent: Delivery Overdue',
          `Order ${order.order_id} is overdue for delivery. Automatic refund will occur on ${autoRefundDate.toLocaleDateString()} if not resolved.`,
          'order_update'
        ]
      );

      console.log(`Refund process initiated for order ${order.order_id}`);
    } catch (error) {
      console.error(`Error initiating refund for order ${order.order_id}:`, error);
    }
  }

  async processAutoRefunds() {
    try {
      console.log('Processing automatic refunds...');
      
      // Find orders due for auto-refund
      const [refundDueOrders] = await this.pool.execute(`
        SELECT et.*, o.tracking_reference, u.email, u.first_name
        FROM escrow_transactions et
        JOIN orders o ON et.order_id = o.id
        JOIN users u ON et.buyer_id = u.id
        WHERE et.status = 'funded'
        AND et.auto_refund_date <= CURDATE()
      `);

      for (const order of refundDueOrders) {
        await this.executeAutoRefund(order);
      }
    } catch (error) {
      console.error('Error processing auto-refunds:', error);
    }
  }

  async executeAutoRefund(order) {
    try {
      // Process refund (integrate with PayFast refund API)
      const refundResult = await this.processRefund({
        orderId: order.order_id,
        amount: order.total_amount,
        reason: 'Non-delivery - Automatic refund'
      });

      if (refundResult.success) {
        // Update escrow status
        await this.pool.execute(
          'UPDATE escrow_transactions SET status = "refunded", refunded_at = NOW() WHERE id = ?',
          [order.id]
        );

        // Update order status
        await this.pool.execute(
          'UPDATE orders SET status = "cancelled", payment_status = "refunded" WHERE id = ?',
          [order.order_id]
        );

        // Notify buyer
        await this.pool.execute(
          'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
          [
            order.buyer_id,
            'Automatic Refund Processed',
            `Your refund of R${order.total_amount} has been processed due to non-delivery. Funds will reflect in 3-5 business days.`,
            'order_update'
          ]
        );

        // Notify seller
        await this.pool.execute(
          'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
          [
            order.seller_id,
            'Order Refunded - Non-Delivery',
            `Order ${order.order_id} has been automatically refunded due to non-delivery. Please contact support if you believe this is an error.`,
            'order_update'
          ]
        );

        console.log(`Auto-refund processed for order ${order.order_id}`);
      }
    } catch (error) {
      console.error(`Error processing auto-refund for order ${order.order_id}:`, error);
    }
  }

  async processRefund(refundData) {
    try {
      // In production, integrate with PayFast refund API
      console.log('Processing refund:', refundData);
      
      // Simulate refund processing
      return {
        success: true,
        refundId: `REF_${Date.now()}`,
        message: 'Refund processed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Manual dispute creation
  async createDispute(disputeData) {
    try {
      const { orderId, buyerId, sellerId, disputeType, description } = disputeData;
      
      const [result] = await this.pool.execute(
        'INSERT INTO disputes (order_id, buyer_id, seller_id, dispute_type, description) VALUES (?, ?, ?, ?, ?)',
        [orderId, buyerId, sellerId, disputeType, description]
      );

      // Pause auto-refund while dispute is being investigated
      await this.pool.execute(
        'UPDATE escrow_transactions SET auto_refund_date = DATE_ADD(auto_refund_date, INTERVAL 7 DAY) WHERE order_id = ?',
        [orderId]
      );

      return { success: true, disputeId: result.insertId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = AutoRefundService;