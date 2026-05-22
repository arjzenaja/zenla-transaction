import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { formatPrice } from '@/lib/formatCurrency';

// Register fonts if needed, but standard ones are okay for now

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 2,
    borderBottomColor: '#4F46E5',
    paddingBottom: 20,
  },
  shopInfo: {
    flexDirection: 'column',
  },
  shopName: {
    fontSize: 24,
    fontWeight: 'black',
    color: '#4F46E5',
  },
  invoiceTitle: {
    fontSize: 30,
    fontWeight: 'black',
    textAlign: 'right',
    textTransform: 'uppercase',
    color: '#111827',
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  column: {
    flexDirection: 'column',
    width: '45%',
  },
  label: {
    fontSize: 8,
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 11,
    color: '#111827',
    fontWeight: 'bold',
  },
  table: {
    width: 'auto',
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    padding: 8,
  },
  colDesc: { width: '50%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  
  headerText: { fontWeight: 'bold', color: '#374151' },
  
  summary: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  summaryBox: {
    width: '40%',
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#4F46E5',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'black',
    color: '#4F46E5',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
    color: '#9CA3AF',
    fontSize: 8,
  }
});

interface InvoicePDFProps {
  invoice: {
    invoiceNo: string;
    customerName: string;
    customerEmail?: string;
    date: string;
    dueDate?: string;
    amount: number;
    status: string;
    paymentMethod?: string;
    items?: { name: string; qty: number; total: number }[];
  };
  shopName?: string;
}

export const InvoicePDF = ({ invoice, shopName = "Zenla Receipt" }: InvoicePDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{shopName}</Text>
          <Text style={{ color: '#6B7280', fontSize: 9 }}>Professional Transaction Management</Text>
        </View>
        <View>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <Text style={{ textAlign: 'right', color: '#6B7280' }}>#{invoice.invoiceNo}</Text>
        </View>
      </View>

      {/* Bill To & Info */}
      <View style={styles.section}>
        <View style={styles.column}>
          <Text style={styles.label}>Billed To:</Text>
          <Text style={styles.value}>{invoice.customerName}</Text>
          <Text style={{ color: '#6B7280', marginTop: 2 }}>{invoice.customerEmail || '-'}</Text>
        </View>
        <View style={[styles.column, { textAlign: 'right' }]}>
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.label}>Date Issued:</Text>
            <Text style={styles.value}>{invoice.date}</Text>
          </View>
          <View>
            <Text style={styles.label}>Due Date:</Text>
            <Text style={styles.value}>{invoice.dueDate || '-'}</Text>
          </View>
        </View>
      </View>

      {/* Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colDesc, styles.headerText]}>Item Description</Text>
          <Text style={[styles.colQty, styles.headerText]}>Qty</Text>
          <Text style={[styles.colPrice, styles.headerText]}>Price</Text>
          <Text style={[styles.colTotal, styles.headerText]}>Total</Text>
        </View>
        
        {invoice.items && invoice.items.length > 0 ? (
          invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.name}</Text>
              <Text style={styles.colQty}>{item.qty}</Text>
              <Text style={styles.colPrice}>Rp {formatPrice(item.total / item.qty)}</Text>
              <Text style={styles.colTotal}>Rp {formatPrice(item.total)}</Text>
            </View>
          ))
        ) : (
          <View style={styles.tableRow}>
            <Text style={styles.colDesc}>Layanan Profesional / Produk</Text>
            <Text style={styles.colQty}>1</Text>
            <Text style={styles.colPrice}>Rp {formatPrice(invoice.amount)}</Text>
            <Text style={styles.colTotal}>Rp {formatPrice(invoice.amount)}</Text>
          </View>
        )}
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={{ color: '#6B7280' }}>Subtotal</Text>
            <Text style={{ fontWeight: 'bold' }}>Rp {formatPrice(invoice.amount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ color: '#6B7280' }}>Pajak (0%)</Text>
            <Text style={{ fontWeight: 'bold' }}>Rp 0</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>Rp {formatPrice(invoice.amount)}</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Thank you for your business!</Text>
        <Text style={{ marginTop: 5 }}>Zenla Receipt - Empowering Your Shop</Text>
      </View>
    </Page>
  </Document>
);
