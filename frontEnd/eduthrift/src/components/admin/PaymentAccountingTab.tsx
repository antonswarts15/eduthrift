import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonBadge,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';

interface PaymentTransaction {
  id: string;
  orderId: string;
  buyerName: string;
  sellerName: string;
  totalAmount: number;
  platformFee: number;
  sellerAmount: number;
  status: 'pending' | 'held' | 'released' | 'completed';
  paymentMethod: string;
  createdAt: string;
  releasedAt?: string;
}

const PaymentAccountingTab: React.FC = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    const mockTransactions: PaymentTransaction[] = [
      {
        id: '1',
        orderId: 'ORD-001',
        buyerName: 'John Smith',
        sellerName: 'Sarah Johnson',
        totalAmount: 250,
        platformFee: 25, // 10%
        sellerAmount: 225,
        status: 'held',
        paymentMethod: 'paystack',
        createdAt: '2024-01-20T10:30:00Z'
      },
      {
        id: '2',
        orderId: 'ORD-002',
        buyerName: 'Mike Wilson',
        sellerName: 'Lisa Brown',
        totalAmount: 180,
        platformFee: 18,
        sellerAmount: 162,
        status: 'completed',
        paymentMethod: 'paystack',
        createdAt: '2024-01-19T14:20:00Z',
        releasedAt: '2024-01-20T09:15:00Z'
      },
      {
        id: '3',
        orderId: 'ORD-003',
        buyerName: 'Emma Davis',
        sellerName: 'Tom Anderson',
        totalAmount: 320,
        platformFee: 32,
        sellerAmount: 288,
        status: 'pending',
        paymentMethod: 'eft',
        createdAt: '2024-01-21T11:45:00Z'
      }
    ];
    setTransactions(mockTransactions);
  };

  const getFilteredTransactions = () => {
    if (selectedStatus === 'all') return transactions;
    return transactions.filter(t => t.status === selectedStatus);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'held': return 'primary';
      case 'released': return 'success';
      case 'completed': return 'success';
      default: return 'medium';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotals = () => {
    const filtered = getFilteredTransactions();
    return {
      totalRevenue: filtered.reduce((sum, t) => sum + t.platformFee, 0),
      totalTransactions: filtered.length,
      totalVolume: filtered.reduce((sum, t) => sum + t.totalAmount, 0),
      pendingAmount: filtered.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.totalAmount, 0),
      heldAmount: filtered.filter(t => t.status === 'held').reduce((sum, t) => sum + t.totalAmount, 0)
    };
  };

  const totals = calculateTotals();
  const filteredTransactions = getFilteredTransactions();

  return (
    <>
      <h3>Payment Accounting</h3>
      
      {/* Summary Cards */}
      <IonGrid>
        <IonRow>
          <IonCol size="6">
            <IonCard>
              <IonCardContent style={{ textAlign: 'center' }}>
                <h2 style={{ margin: '0', color: '#27AE60' }}>R{totals.totalRevenue}</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>Platform Revenue (10%)</p>
              </IonCardContent>
            </IonCard>
          </IonCol>
          <IonCol size="6">
            <IonCard>
              <IonCardContent style={{ textAlign: 'center' }}>
                <h2 style={{ margin: '0', color: '#3498DB' }}>R{totals.totalVolume}</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>Total Volume</p>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size="6">
            <IonCard>
              <IonCardContent style={{ textAlign: 'center' }}>
                <h2 style={{ margin: '0', color: '#F39C12' }}>R{totals.pendingAmount}</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>Pending Payments</p>
              </IonCardContent>
            </IonCard>
          </IonCol>
          <IonCol size="6">
            <IonCard>
              <IonCardContent style={{ textAlign: 'center' }}>
                <h2 style={{ margin: '0', color: '#E74C3C' }}>R{totals.heldAmount}</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>Held in Escrow</p>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>

      {/* Filter Segment */}
      <IonSegment value={selectedStatus} onIonChange={e => setSelectedStatus(e.detail.value as string)}>
        <IonSegmentButton value="all">
          <IonLabel>All ({transactions.length})</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="pending">
          <IonLabel>Pending</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="held">
          <IonLabel>Held</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="completed">
          <IonLabel>Completed</IonLabel>
        </IonSegmentButton>
      </IonSegment>

      {/* Transactions List */}
      <div style={{ marginTop: '20px' }}>
        {filteredTransactions.map(transaction => (
          <IonCard key={transaction.id}>
            <IonCardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <IonCardTitle>Order {transaction.orderId}</IonCardTitle>
                <IonBadge color={getStatusColor(transaction.status)}>
                  {transaction.status.toUpperCase()}
                </IonBadge>
              </div>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol size="6">
                    <IonItem lines="none">
                      <IonLabel>
                        <p><strong>Buyer:</strong> {transaction.buyerName}</p>
                        <p><strong>Seller:</strong> {transaction.sellerName}</p>
                        <p><strong>Payment:</strong> {transaction.paymentMethod}</p>
                        <p><strong>Created:</strong> {formatDate(transaction.createdAt)}</p>
                        {transaction.releasedAt && (
                          <p><strong>Released:</strong> {formatDate(transaction.releasedAt)}</p>
                        )}
                      </IonLabel>
                    </IonItem>
                  </IonCol>
                  <IonCol size="6">
                    <IonItem lines="none">
                      <IonLabel>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                            Total: R{transaction.totalAmount}
                          </p>
                          <p style={{ margin: '4px 0', color: '#27AE60', fontWeight: 'bold' }}>
                            Platform Fee (10%): R{transaction.platformFee}
                          </p>
                          <p style={{ margin: '4px 0', color: '#666' }}>
                            Seller Amount: R{transaction.sellerAmount}
                          </p>
                        </div>
                      </IonLabel>
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        ))}

        {filteredTransactions.length === 0 && (
          <IonCard>
            <IonCardContent style={{ textAlign: 'center', padding: '40px' }}>
              <p>No transactions found for selected filter</p>
            </IonCardContent>
          </IonCard>
        )}
      </div>
    </>
  );
};

export default PaymentAccountingTab;