import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from '../services/api';

// ── Formatting helpers ────────────────────────────────────────────────────────

const fmt = (amount) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 2 }).format(amount || 0);

const fmtDate = (dt) =>
  dt ? new Date(dt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const fmtDateShort = (dt) =>
  dt ? new Date(dt).toLocaleDateString('en-ZA') : '—';

const badge = (value, colorMap, defaultColor = '#95a5a6') => {
  const color = colorMap[value?.toUpperCase()] || defaultColor;
  return (
    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: color + '22', color }}>
      {value || '—'}
    </span>
  );
};

const ORDER_STATUS_COLORS = {
  PENDING_PAYMENT: '#e67e22', PAYMENT_CONFIRMED: '#3498db', PROCESSING: '#3498db',
  SHIPPED: '#9b59b6', DELIVERED: '#27ae60', COMPLETED: '#27ae60',
  CANCELLED: '#e74c3c', REFUNDED: '#e74c3c',
};
const ACCOUNT_COLORS = {
  BUYER: '#3498db', ESCROW: '#e67e22', SELLER: '#9b59b6',
  PLATFORM: '#27ae60', SHIPPING: '#1abc9c', EXTERNAL: '#e74c3c',
};
const ENTRY_COLORS = { DEBIT: '#e74c3c', CREDIT: '#27ae60' };
const VERIFICATION_COLORS = { PENDING: '#e67e22', VERIFIED: '#27ae60', REJECTED: '#e74c3c' };
const USER_TYPE_COLORS = { BUYER: '#3498db', SELLER: '#9b59b6', BOTH: '#27ae60', ADMIN: '#e74c3c' };

// ── Shared UI ─────────────────────────────────────────────────────────────────

const summaryCard = (label, value, color = '#2c3e50') => (
  <div key={label} style={{ backgroundColor: 'white', padding: '16px 20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', borderLeft: `4px solid ${color}` }}>
    <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
    <p style={{ margin: '6px 0 0 0', fontSize: '22px', fontWeight: 'bold', color }}>{value}</p>
  </div>
);

const th = { padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '2px solid #eee', whiteSpace: 'nowrap', backgroundColor: '#f8f9fa' };
const td = { padding: '10px 14px', fontSize: '13px', color: '#2c3e50', borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' };
const tdr = { ...td, textAlign: 'right' };

const FilterBar = ({ children, onRun, loading }) => (
  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '20px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
    {children}
    <button onClick={onRun} disabled={loading}
      style={{ padding: '8px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
      {loading ? 'Loading…' : 'Run Report'}
    </button>
  </div>
);

const DateField = ({ label, value, onChange }) => (
  <div>
    <label style={{ display: 'block', fontSize: '12px', color: '#7f8c8d', marginBottom: '4px' }}>{label}</label>
    <input type="date" value={value} onChange={e => onChange(e.target.value)}
      style={{ padding: '8px 10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }} />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label style={{ display: 'block', fontSize: '12px', color: '#7f8c8d', marginBottom: '4px' }}>{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ padding: '8px 10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const ErrorBox = ({ error }) => error ? (
  <div style={{ backgroundColor: '#ffe6e6', border: '1px solid #ff4d4d', borderRadius: '8px', padding: '14px', marginBottom: '16px', color: '#cc0000' }}>
    {error}
  </div>
) : null;

const EmptyState = ({ text }) => (
  <div style={{ backgroundColor: 'white', padding: '40px', textAlign: 'center', borderRadius: '8px', color: '#7f8c8d' }}>
    {text}
  </div>
);

const SarsNote = () => (
  <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: '#f0f7ff', border: '1px solid #bde0ff', borderRadius: '8px', fontSize: '12px', color: '#1a5276' }}>
    <strong>SARS Compliance:</strong> All amounts in South African Rand (ZAR). VAT at 15% per <em>VAT Act 89 of 1991</em>.
    Records retained per <em>Companies Act 71 of 2008</em> (minimum 7 years). Platform fee (buyer protection fee) is VAT-inclusive output tax.
  </div>
);

// ── PDF / Excel export helpers ────────────────────────────────────────────────

const pdfHeader = (doc, title, dateRange) => {
  doc.setFontSize(18);
  doc.setTextColor(44, 62, 80);
  doc.text('Eduthrift (Pty) Ltd', 14, 20);
  doc.setFontSize(13);
  doc.text(title, 14, 30);
  doc.setFontSize(9);
  doc.setTextColor(127, 140, 141);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-ZA')}  |  Period: ${dateRange}`, 14, 38);
  doc.text('VAT Act 89 of 1991 · Companies Act 71 of 2008 · All figures in ZAR', 14, 44);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 47, doc.internal.pageSize.width - 14, 47);
};

const exportPdf = (title, dateRange, head, body, filename) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  pdfHeader(doc, title, dateRange);
  autoTable(doc, {
    head: [head],
    body,
    startY: 52,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [52, 152, 219], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    margin: { left: 14, right: 14 },
  });
  doc.save(filename);
};

const exportExcel = (sheetName, headers, rows, filename) => {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
};

const ExportBar = ({ onPdf, onExcel }) => (
  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
    <button onClick={onPdf}
      style={{ padding: '7px 16px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
      Export PDF
    </button>
    <button onClick={onExcel}
      style={{ padding: '7px 16px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
      Export Excel
    </button>
  </div>
);

// ── 1. Sales Journal ──────────────────────────────────────────────────────────

const SalesJournal = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (status !== 'all') params.status = status;
      const res = await api.get('/admin/reports/transactions', { params });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load report');
    } finally { setLoading(false); }
  };

  const dateRange = from || to ? `${from || '—'} to ${to || '—'}` : 'All dates';

  const handlePdf = () => {
    const head = ['Order #', 'Date', 'Buyer', 'Seller', 'Item', 'Total (ZAR)', 'Platform Fee (ZAR)', 'VAT (15/115)', 'Net Fee excl. VAT', 'Seller Payout', 'Status'];
    const body = data.transactions.map(t => {
      const fee = parseFloat(t.platform_fee || 0);
      const vat = (fee * 15 / 115).toFixed(2);
      const net = (fee * 100 / 115).toFixed(2);
      return [t.order_number, fmtDateShort(t.created_at), t.buyer_name, t.seller_name, t.item_name,
        parseFloat(t.total_amount || 0).toFixed(2), fee.toFixed(2), vat, net,
        parseFloat(t.seller_payout || 0).toFixed(2), t.order_status];
    });
    exportPdf('Sales Journal / Transaction Register', dateRange, head, body, `eduthrift_sales_journal_${from || 'all'}.pdf`);
  };

  const handleExcel = () => {
    const headers = ['Order #', 'Date', 'Buyer Name', 'Buyer Email', 'Seller Name', 'Seller Email', 'Item', 'Qty',
      'Item Price', 'Shipping', 'Total (ZAR)', 'Platform Fee (ZAR)', 'VAT @ 15/115', 'Net Fee excl. VAT',
      'Seller Payout', 'Payment Method', 'Order Status', 'Payment Status', 'Escrow Status', 'Payout Status'];
    const rows = data.transactions.map(t => {
      const fee = parseFloat(t.platform_fee || 0);
      return [t.order_number, fmtDateShort(t.created_at), t.buyer_name, t.buyer_email, t.seller_name, t.seller_email,
        t.item_name, t.quantity, t.item_price, t.shipping_cost, t.total_amount, fee.toFixed(2),
        (fee * 15 / 115).toFixed(2), (fee * 100 / 115).toFixed(2),
        t.seller_payout, t.payment_method, t.order_status, t.payment_status, t.escrow_status, t.payout_status];
    });
    exportExcel('Sales Journal', headers, rows, `eduthrift_sales_journal_${from || 'all'}.xlsx`);
  };

  return (
    <div>
      <SarsNote />
      <FilterBar onRun={load} loading={loading}>
        <DateField label="From" value={from} onChange={setFrom} />
        <DateField label="To" value={to} onChange={setTo} />
        <SelectField label="Order Status" value={status} onChange={setStatus} options={[
          { value: 'all', label: 'All Statuses' },
          { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
          { value: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed' },
          { value: 'PROCESSING', label: 'Processing' },
          { value: 'SHIPPED', label: 'Shipped' },
          { value: 'DELIVERED', label: 'Delivered' },
          { value: 'COMPLETED', label: 'Completed' },
          { value: 'CANCELLED', label: 'Cancelled' },
          { value: 'REFUNDED', label: 'Refunded' },
        ]} />
      </FilterBar>
      <ErrorBox error={error} />
      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            {summaryCard('Transactions', data.total_count, '#3498db')}
            {summaryCard('Total Volume', fmt(data.total_volume), '#27ae60')}
            {summaryCard('Platform Fees (incl. VAT)', fmt(data.total_fees), '#9b59b6')}
            {summaryCard('Output VAT (15/115)', fmt(data.total_fees * 15 / 115), '#e67e22')}
            {summaryCard('Net Revenue excl. VAT', fmt(data.total_fees * 100 / 115), '#1abc9c')}
          </div>
          <ExportBar onPdf={handlePdf} onExcel={handleExcel} />
          {data.transactions.length === 0
            ? <EmptyState text="No transactions found for the selected filters." />
            : (
              <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                  <thead>
                    <tr>
                      <th style={th}>Order #</th>
                      <th style={th}>Date</th>
                      <th style={th}>Buyer</th>
                      <th style={th}>Seller</th>
                      <th style={th}>Item</th>
                      <th style={{ ...th, textAlign: 'right' }}>Total</th>
                      <th style={{ ...th, textAlign: 'right' }}>Platform Fee</th>
                      <th style={{ ...th, textAlign: 'right' }}>VAT (15/115)</th>
                      <th style={{ ...th, textAlign: 'right' }}>Net excl. VAT</th>
                      <th style={{ ...th, textAlign: 'right' }}>Seller Payout</th>
                      <th style={th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((t, i) => {
                      const fee = parseFloat(t.platform_fee || 0);
                      const vat = fee * 15 / 115;
                      const net = fee * 100 / 115;
                      return (
                        <tr key={t.id} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                          <td style={{ ...td, fontWeight: 600, fontFamily: 'monospace' }}>{t.order_number}</td>
                          <td style={td}>{fmtDate(t.created_at)}</td>
                          <td style={td}>
                            <div style={{ fontWeight: 500 }}>{t.buyer_name}</div>
                            <div style={{ fontSize: '11px', color: '#7f8c8d' }}>{t.buyer_email}</div>
                          </td>
                          <td style={td}>
                            <div style={{ fontWeight: 500 }}>{t.seller_name}</div>
                            <div style={{ fontSize: '11px', color: '#7f8c8d' }}>{t.seller_email}</div>
                          </td>
                          <td style={td}>{t.item_name}</td>
                          <td style={{ ...tdr, fontWeight: 600 }}>{fmt(t.total_amount)}</td>
                          <td style={{ ...tdr, color: '#9b59b6' }}>{fmt(fee)}</td>
                          <td style={{ ...tdr, color: '#e67e22' }}>{fmt(vat)}</td>
                          <td style={{ ...tdr, color: '#1abc9c' }}>{fmt(net)}</td>
                          <td style={{ ...tdr, color: '#27ae60' }}>{fmt(t.seller_payout)}</td>
                          <td style={td}>{badge(t.order_status, ORDER_STATUS_COLORS)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </>
      )}
      {!data && !loading && <EmptyState text="Set filters above and click Run Report to view the Sales Journal." />}
    </div>
  );
};

// ── 2. General Ledger ─────────────────────────────────────────────────────────

const GeneralLedger = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [accountType, setAccountType] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (accountType !== 'all') params.accountType = accountType;
      const res = await api.get('/admin/reports/general-ledger', { params });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load general ledger');
    } finally { setLoading(false); }
  };

  const dateRange = from || to ? `${from || '—'} to ${to || '—'}` : 'All dates';

  const handlePdf = () => {
    const head = ['Date', 'Order #', 'Account', 'Dr/Cr', 'Amount (ZAR)', 'Reference', 'Description'];
    const body = data.entries.map(e => [
      fmtDateShort(e.date), e.order_number, e.account_type, e.entry_type,
      parseFloat(e.amount || 0).toFixed(2), e.reference_type, e.description || ''
    ]);
    exportPdf('General Ledger', dateRange, head, body, `eduthrift_general_ledger_${from || 'all'}.pdf`);
  };

  const handleExcel = () => {
    const headers = ['ID', 'Date', 'Order #', 'Account Type', 'Entry Type', 'Amount (ZAR)', 'Reference Type', 'Description'];
    const rows = data.entries.map(e => [e.id, fmtDateShort(e.date), e.order_number, e.account_type, e.entry_type, e.amount, e.reference_type, e.description || '']);
    exportExcel('General Ledger', headers, rows, `eduthrift_general_ledger_${from || 'all'}.xlsx`);
  };

  return (
    <div>
      <SarsNote />
      <FilterBar onRun={load} loading={loading}>
        <DateField label="From" value={from} onChange={setFrom} />
        <DateField label="To" value={to} onChange={setTo} />
        <SelectField label="Account" value={accountType} onChange={setAccountType} options={[
          { value: 'all', label: 'All Accounts' },
          { value: 'BUYER', label: 'Buyer' },
          { value: 'ESCROW', label: 'Escrow' },
          { value: 'SELLER', label: 'Seller' },
          { value: 'PLATFORM', label: 'Platform' },
          { value: 'SHIPPING', label: 'Shipping' },
          { value: 'EXTERNAL', label: 'External' },
        ]} />
      </FilterBar>
      <ErrorBox error={error} />
      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            {summaryCard('Total Entries', data.total_count, '#3498db')}
            {summaryCard('Total Debits', fmt(data.total_debits), '#e74c3c')}
            {summaryCard('Total Credits', fmt(data.total_credits), '#27ae60')}
            {summaryCard('Balanced', data.total_debits === data.total_credits ? 'Yes ✓' : 'No ✗', data.total_debits === data.total_credits ? '#27ae60' : '#e74c3c')}
          </div>
          <ExportBar onPdf={handlePdf} onExcel={handleExcel} />
          {data.entries.length === 0
            ? <EmptyState text="No ledger entries found." />
            : (
              <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                  <thead>
                    <tr>
                      <th style={th}>Date</th>
                      <th style={th}>Order #</th>
                      <th style={th}>Account</th>
                      <th style={th}>Dr / Cr</th>
                      <th style={{ ...th, textAlign: 'right' }}>Amount (ZAR)</th>
                      <th style={th}>Reference</th>
                      <th style={th}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.entries.map((e, i) => (
                      <tr key={e.id} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={td}>{fmtDate(e.date)}</td>
                        <td style={{ ...td, fontFamily: 'monospace', fontWeight: 600 }}>{e.order_number}</td>
                        <td style={td}>{badge(e.account_type, ACCOUNT_COLORS)}</td>
                        <td style={td}>{badge(e.entry_type, ENTRY_COLORS)}</td>
                        <td style={{ ...tdr, fontWeight: 600, color: e.entry_type === 'CREDIT' ? '#27ae60' : '#e74c3c' }}>{fmt(e.amount)}</td>
                        <td style={{ ...td, fontSize: '11px', color: '#7f8c8d' }}>{e.reference_type?.replace(/_/g, ' ')}</td>
                        <td style={{ ...td, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.description || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </>
      )}
      {!data && !loading && <EmptyState text="Set filters above and click Run Report to view the General Ledger." />}
    </div>
  );
};

// ── 3. VAT Report (VAT201) ────────────────────────────────────────────────────

const VatReport = () => {
  const now = new Date();
  const [from, setFrom] = useState(`${now.getFullYear()}-01-01`);
  const [to, setTo] = useState(`${now.getFullYear()}-12-31`);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get('/admin/reports/vat', { params: { from, to } });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load VAT report');
    } finally { setLoading(false); }
  };

  const dateRange = `${from} to ${to}`;

  const handlePdf = () => {
    const head = ['Tax Period', 'Transactions', 'Gross Revenue incl. VAT', 'Net Revenue excl. VAT', 'Output VAT (15%)'];
    const body = data.monthly_breakdown.map(r => [
      r.tax_period, r.transaction_count,
      parseFloat(r.gross_revenue_incl_vat || 0).toFixed(2),
      parseFloat(r.net_revenue_excl_vat || 0).toFixed(2),
      parseFloat(r.output_vat_15pct || 0).toFixed(2),
    ]);
    body.push(['TOTAL', '', parseFloat(data.total_gross_revenue_incl_vat || 0).toFixed(2), parseFloat(data.total_net_revenue_excl_vat || 0).toFixed(2), parseFloat(data.total_output_vat || 0).toFixed(2)]);
    exportPdf('VAT Report — Output Tax (VAT201)', dateRange, head, body, `eduthrift_vat_report_${from}_${to}.pdf`);
  };

  const handleExcel = () => {
    const headers = ['Tax Period', 'Transactions', 'Gross Revenue incl. VAT (ZAR)', 'Net Revenue excl. VAT (ZAR)', 'Output VAT 15% (ZAR)'];
    const rows = data.monthly_breakdown.map(r => [r.tax_period, r.transaction_count, r.gross_revenue_incl_vat, r.net_revenue_excl_vat, r.output_vat_15pct]);
    rows.push(['TOTAL', '', data.total_gross_revenue_incl_vat, data.total_net_revenue_excl_vat, data.total_output_vat]);
    exportExcel('VAT Report', headers, rows, `eduthrift_vat_report_${from}_${to}.xlsx`);
  };

  return (
    <div>
      <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: '#fffbf0', border: '1px solid #ffe082', borderRadius: '8px', fontSize: '12px', color: '#7d5c00' }}>
        <strong>VAT201 Reference:</strong> This report shows <em>Output Tax</em> only — platform service fees (buyer protection fees) collected inclusive of 15% VAT.
        Eduthrift acts as a marketplace; private-party goods transactions between buyer and seller are VAT-exempt.
        VAT formula: Output VAT = Gross Fee × 15÷115. Statutory reference: <em>VAT Act 89 of 1991, Section 7(1)(a)</em>.
      </div>
      <FilterBar onRun={load} loading={loading}>
        <DateField label="From" value={from} onChange={setFrom} />
        <DateField label="To" value={to} onChange={setTo} />
      </FilterBar>
      <ErrorBox error={error} />
      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            {summaryCard('Tax Periods', data.monthly_breakdown.length, '#3498db')}
            {summaryCard('Gross Revenue incl. VAT', fmt(data.total_gross_revenue_incl_vat), '#9b59b6')}
            {summaryCard('Net Revenue excl. VAT', fmt(data.total_net_revenue_excl_vat), '#27ae60')}
            {summaryCard('Output VAT Payable', fmt(data.total_output_vat), '#e74c3c')}
          </div>
          <ExportBar onPdf={handlePdf} onExcel={handleExcel} />
          {data.monthly_breakdown.length === 0
            ? <EmptyState text="No platform revenue recorded in this period." />
            : (
              <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                  <thead>
                    <tr>
                      <th style={th}>Tax Period</th>
                      <th style={{ ...th, textAlign: 'right' }}>Transactions</th>
                      <th style={{ ...th, textAlign: 'right' }}>Gross Revenue incl. VAT</th>
                      <th style={{ ...th, textAlign: 'right' }}>Net Revenue excl. VAT</th>
                      <th style={{ ...th, textAlign: 'right' }}>Output VAT (15%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.monthly_breakdown.map((r, i) => (
                      <tr key={r.tax_period} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ ...td, fontWeight: 600 }}>{r.tax_period}</td>
                        <td style={tdr}>{r.transaction_count}</td>
                        <td style={tdr}>{fmt(r.gross_revenue_incl_vat)}</td>
                        <td style={{ ...tdr, color: '#27ae60' }}>{fmt(r.net_revenue_excl_vat)}</td>
                        <td style={{ ...tdr, color: '#e74c3c', fontWeight: 600 }}>{fmt(r.output_vat_15pct)}</td>
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: '#f0f7ff', fontWeight: 700 }}>
                      <td style={{ ...td, fontWeight: 700 }}>TOTAL</td>
                      <td style={tdr}></td>
                      <td style={{ ...tdr, fontWeight: 700 }}>{fmt(data.total_gross_revenue_incl_vat)}</td>
                      <td style={{ ...tdr, fontWeight: 700, color: '#27ae60' }}>{fmt(data.total_net_revenue_excl_vat)}</td>
                      <td style={{ ...tdr, fontWeight: 700, color: '#e74c3c' }}>{fmt(data.total_output_vat)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
        </>
      )}
      {!data && !loading && <EmptyState text="Set the date range and click Run Report to view the VAT Report." />}
    </div>
  );
};

// ── 4. Trial Balance ──────────────────────────────────────────────────────────

const TrialBalance = () => {
  const [asAt, setAsAt] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get('/admin/reports/trial-balance', { params: { asAt } });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load trial balance');
    } finally { setLoading(false); }
  };

  const handlePdf = () => {
    const head = ['Account', 'Total Debits (ZAR)', 'Total Credits (ZAR)', 'Balance (ZAR)', 'Notes'];
    const notes = { BUYER: 'Inflow from buyers', ESCROW: 'Funds held in escrow', SELLER: 'Accrued seller payouts', PLATFORM: 'Platform revenue', SHIPPING: 'Shipping collected', EXTERNAL: 'Paid out externally' };
    const body = data.accounts.map(a => [a.account, parseFloat(a.debit_total).toFixed(2), parseFloat(a.credit_total).toFixed(2), parseFloat(a.balance).toFixed(2), notes[a.account] || '']);
    body.push(['TOTAL', parseFloat(data.grand_total_debits).toFixed(2), parseFloat(data.grand_total_credits).toFixed(2), '', data.balanced ? 'BALANCED ✓' : 'IMBALANCED ✗']);
    exportPdf(`Trial Balance — As at ${data.as_at}`, `As at ${data.as_at}`, head, body, `eduthrift_trial_balance_${asAt}.pdf`);
  };

  const handleExcel = () => {
    const headers = ['Account', 'Total Debits (ZAR)', 'Total Credits (ZAR)', 'Balance (ZAR)'];
    const rows = data.accounts.map(a => [a.account, a.debit_total, a.credit_total, a.balance]);
    rows.push(['GRAND TOTAL', data.grand_total_debits, data.grand_total_credits, '']);
    exportExcel('Trial Balance', headers, rows, `eduthrift_trial_balance_${asAt}.xlsx`);
  };

  const accountDescriptions = {
    BUYER: 'Money received from buyers into the system',
    ESCROW: 'Funds currently or previously held in escrow',
    SELLER: 'Amounts accrued to sellers (net of payouts)',
    PLATFORM: 'Eduthrift platform revenue (buyer protection fees)',
    SHIPPING: 'Shipping fees collected from buyers',
    EXTERNAL: 'Funds transferred out to external bank accounts',
  };

  return (
    <div>
      <SarsNote />
      <FilterBar onRun={load} loading={loading}>
        <DateField label="As at Date" value={asAt} onChange={setAsAt} />
      </FilterBar>
      <ErrorBox error={error} />
      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            {summaryCard('Total Debits', fmt(data.grand_total_debits), '#e74c3c')}
            {summaryCard('Total Credits', fmt(data.grand_total_credits), '#27ae60')}
            {summaryCard('Balanced', data.balanced ? 'Yes ✓' : 'No ✗', data.balanced ? '#27ae60' : '#e74c3c')}
          </div>
          {!data.balanced && (
            <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: '#ffe6e6', border: '1px solid #ff4d4d', borderRadius: '8px', color: '#cc0000', fontSize: '13px' }}>
              <strong>Ledger Imbalance Detected:</strong> Total debits do not equal total credits. This indicates a data integrity issue requiring immediate investigation.
            </div>
          )}
          <ExportBar onPdf={handlePdf} onExcel={handleExcel} />
          <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
              <thead>
                <tr>
                  <th style={th}>Account</th>
                  <th style={th}>Description</th>
                  <th style={{ ...th, textAlign: 'right' }}>Total Debits (ZAR)</th>
                  <th style={{ ...th, textAlign: 'right' }}>Total Credits (ZAR)</th>
                  <th style={{ ...th, textAlign: 'right' }}>Balance (ZAR)</th>
                </tr>
              </thead>
              <tbody>
                {data.accounts.map((a, i) => (
                  <tr key={a.account} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ ...td, fontWeight: 600 }}>{badge(a.account, ACCOUNT_COLORS)}</td>
                    <td style={{ ...td, color: '#7f8c8d', fontSize: '12px' }}>{accountDescriptions[a.account] || ''}</td>
                    <td style={{ ...tdr, color: '#e74c3c' }}>{fmt(a.debit_total)}</td>
                    <td style={{ ...tdr, color: '#27ae60' }}>{fmt(a.credit_total)}</td>
                    <td style={{ ...tdr, fontWeight: 700, color: parseFloat(a.balance) >= 0 ? '#2c3e50' : '#e74c3c' }}>{fmt(a.balance)}</td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#f0f7ff' }}>
                  <td style={{ ...td, fontWeight: 700 }} colSpan={2}>GRAND TOTAL</td>
                  <td style={{ ...tdr, fontWeight: 700, color: '#e74c3c' }}>{fmt(data.grand_total_debits)}</td>
                  <td style={{ ...tdr, fontWeight: 700, color: '#27ae60' }}>{fmt(data.grand_total_credits)}</td>
                  <td style={{ ...tdr, fontWeight: 700, color: data.balanced ? '#27ae60' : '#e74c3c' }}>
                    {data.balanced ? '✓ Balanced' : '✗ Imbalanced'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
      {!data && !loading && <EmptyState text="Select a date and click Run Report to view the Trial Balance." />}
    </div>
  );
};

// ── 5. Payment Audit Trail ────────────────────────────────────────────────────

const AuditTrail = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await api.get('/admin/reports/audit-trail', { params });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load audit trail');
    } finally { setLoading(false); }
  };

  const dateRange = from || to ? `${from || '—'} to ${to || '—'}` : 'All dates';

  const handlePdf = () => {
    const head = ['Date', 'Order #', 'Provider', 'Event Type', 'Amount (ZAR)', 'Status', 'Provider Ref'];
    const body = data.audit_trail.map(t => [
      fmtDateShort(t.date), t.order_number, t.provider, t.event_type,
      parseFloat(t.amount || 0).toFixed(2), t.status || '—', t.provider_transaction_id
    ]);
    exportPdf('Payment Audit Trail', dateRange, head, body, `eduthrift_audit_trail_${from || 'all'}.pdf`);
  };

  const handleExcel = () => {
    const headers = ['ID', 'Date', 'Order #', 'Provider', 'Provider Reference', 'Event Type', 'Amount (ZAR)', 'Status'];
    const rows = data.audit_trail.map(t => [t.id, fmtDateShort(t.date), t.order_number, t.provider, t.provider_transaction_id, t.event_type, t.amount, t.status]);
    exportExcel('Audit Trail', headers, rows, `eduthrift_audit_trail_${from || 'all'}.xlsx`);
  };

  return (
    <div>
      <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: '#f0f7ff', border: '1px solid #bde0ff', borderRadius: '8px', fontSize: '12px', color: '#1a5276' }}>
        <strong>Audit Trail:</strong> Immutable, append-only record of every payment gateway event. Each row represents a single payment lifecycle event as received from the provider. Used for dispute resolution and SARS audit purposes.
      </div>
      <FilterBar onRun={load} loading={loading}>
        <DateField label="From" value={from} onChange={setFrom} />
        <DateField label="To" value={to} onChange={setTo} />
      </FilterBar>
      <ErrorBox error={error} />
      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            {summaryCard('Total Events', data.total_count, '#3498db')}
          </div>
          <ExportBar onPdf={handlePdf} onExcel={handleExcel} />
          {data.audit_trail.length === 0
            ? <EmptyState text="No payment events found." />
            : (
              <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                  <thead>
                    <tr>
                      <th style={th}>Date</th>
                      <th style={th}>Order #</th>
                      <th style={th}>Provider</th>
                      <th style={th}>Event</th>
                      <th style={{ ...th, textAlign: 'right' }}>Amount</th>
                      <th style={th}>Status</th>
                      <th style={th}>Provider Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.audit_trail.map((t, i) => (
                      <tr key={t.id} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={td}>{fmtDate(t.date)}</td>
                        <td style={{ ...td, fontFamily: 'monospace', fontWeight: 600 }}>{t.order_number}</td>
                        <td style={td}>{t.provider}</td>
                        <td style={{ ...td, fontSize: '11px' }}>{t.event_type?.replace(/_/g, ' ')}</td>
                        <td style={{ ...tdr, fontWeight: 600 }}>{fmt(t.amount)}</td>
                        <td style={td}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: '#3498db22', color: '#3498db' }}>
                            {t.status || '—'}
                          </span>
                        </td>
                        <td style={{ ...td, fontFamily: 'monospace', fontSize: '11px', color: '#7f8c8d' }}>{t.provider_transaction_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </>
      )}
      {!data && !loading && <EmptyState text="Set filters above and click Run Report to view the Payment Audit Trail." />}
    </div>
  );
};

// ── 6. User Register ──────────────────────────────────────────────────────────

const UserRegister = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [userType, setUserType] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (userType !== 'all') params.userType = userType;
      const res = await api.get('/admin/reports/users', { params });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load user register');
    } finally { setLoading(false); }
  };

  const dateRange = from || to ? `${from || '—'} to ${to || '—'}` : 'All dates';

  const handlePdf = () => {
    const head = ['Name', 'Email', 'Phone', 'Type', 'Status', 'Verification', 'School', 'Province', 'Registered'];
    const body = data.users.map(u => [
      `${u.first_name} ${u.last_name}`, u.email, u.phone || '—', u.user_type,
      u.status || 'active', u.verification_status, u.school_name || '—', u.province || '—', fmtDateShort(u.created_at)
    ]);
    exportPdf('User Register', dateRange, head, body, `eduthrift_user_register_${from || 'all'}.pdf`);
  };

  const handleExcel = () => {
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'User Type', 'Account Status',
      'Seller Verified', 'Verification Status', 'School', 'Town', 'Suburb', 'Province', 'Registered'];
    const rows = data.users.map(u => [u.id, u.first_name, u.last_name, u.email, u.phone, u.user_type,
      u.status, u.seller_verified, u.verification_status, u.school_name, u.town, u.suburb, u.province, fmtDateShort(u.created_at)]);
    exportExcel('User Register', headers, rows, `eduthrift_user_register_${from || 'all'}.xlsx`);
  };

  return (
    <div>
      <FilterBar onRun={load} loading={loading}>
        <DateField label="Registered From" value={from} onChange={setFrom} />
        <DateField label="Registered To" value={to} onChange={setTo} />
        <SelectField label="User Type" value={userType} onChange={setUserType} options={[
          { value: 'all', label: 'All Types' },
          { value: 'BUYER', label: 'Buyers' },
          { value: 'SELLER', label: 'Sellers' },
          { value: 'BOTH', label: 'Both (Buyer + Seller)' },
        ]} />
      </FilterBar>
      <ErrorBox error={error} />
      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            {summaryCard('Total Users', data.total_count, '#3498db')}
            {summaryCard('Buyers', data.buyer_count, '#3498db')}
            {summaryCard('Sellers', data.seller_count, '#9b59b6')}
            {summaryCard('Pending Verification', data.pending_verifications, '#e67e22')}
            {summaryCard('Verified Sellers', data.verified_count, '#27ae60')}
          </div>
          <ExportBar onPdf={handlePdf} onExcel={handleExcel} />
          {data.users.length === 0
            ? <EmptyState text="No users found." />
            : (
              <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                  <thead>
                    <tr>
                      <th style={th}>Name</th>
                      <th style={th}>Email</th>
                      <th style={th}>Phone</th>
                      <th style={th}>Type</th>
                      <th style={th}>Account</th>
                      <th style={th}>Verification</th>
                      <th style={th}>School</th>
                      <th style={th}>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map((u, i) => (
                      <tr key={u.id} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ ...td, fontWeight: 500 }}>{u.first_name} {u.last_name}</td>
                        <td style={td}>{u.email}</td>
                        <td style={td}>{u.phone || '—'}</td>
                        <td style={td}>{badge(u.user_type?.toUpperCase(), USER_TYPE_COLORS)}</td>
                        <td style={td}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: u.status === 'active' ? '#27ae6022' : '#e74c3c22', color: u.status === 'active' ? '#27ae60' : '#e74c3c' }}>
                            {u.status || 'active'}
                          </span>
                        </td>
                        <td style={td}>{badge(u.verification_status?.toUpperCase(), VERIFICATION_COLORS)}</td>
                        <td style={td}>{u.school_name || '—'}</td>
                        <td style={td}>{fmtDate(u.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </>
      )}
      {!data && !loading && <EmptyState text="Set filters above and click Run Report to view the User Register." />}
    </div>
  );
};

// ── Page shell ────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'sales-journal', label: 'Sales Journal', component: SalesJournal },
  { key: 'general-ledger', label: 'General Ledger', component: GeneralLedger },
  { key: 'vat', label: 'VAT Report (VAT201)', component: VatReport },
  { key: 'trial-balance', label: 'Trial Balance', component: TrialBalance },
  { key: 'audit-trail', label: 'Payment Audit Trail', component: AuditTrail },
  { key: 'users', label: 'User Register', component: UserRegister },
];

const ReportsPage = () => {
  const [tab, setTab] = useState('sales-journal');

  const tabStyle = (active) => ({
    padding: '8px 16px',
    border: 'none',
    borderBottom: active ? '3px solid #3498db' : '3px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
    color: active ? '#3498db' : '#555',
    whiteSpace: 'nowrap',
  });

  const ActiveComponent = TABS.find(t => t.key === tab)?.component || SalesJournal;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Financial Reports</h1>
        <p style={{ margin: '4px 0 0 0', color: '#7f8c8d', fontSize: '14px' }}>
          SARS-compliant financial records · VAT Act 89 of 1991 · Companies Act 71 of 2008
        </p>
      </div>

      <div style={{ overflowX: 'auto', display: 'flex', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
        {TABS.map(t => (
          <button key={t.key} style={tabStyle(tab === t.key)} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <ActiveComponent />
    </div>
  );
};

export default ReportsPage;
