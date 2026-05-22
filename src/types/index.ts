export interface User {
  id: string;
  email: string;
  shopName: string;
  phone?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;
  userId: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  receiptNo: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: string;
  cashierName?: string | null;
  userId: string;
  createdAt: Date;
  items: TransactionItem[];
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerEmail?: string | null;
  amount: number;
  status: string;
  dueDate?: Date | null;
  userId: string;
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  totalSpend: number;
  visitCount: number;
  isLoyalty: boolean;
  userId: string;
  createdAt: Date;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  userId: string;
  createdAt: Date | string;
}
