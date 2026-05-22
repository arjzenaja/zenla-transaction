import { create } from "zustand";
import { Product, CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  taxEnabled: boolean;
  discount: number;
  customerName: string;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleTax: () => void;
  setDiscount: (amount: number) => void;
  setCustomerName: (name: string) => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  taxEnabled: false,
  discount: 0,
  customerName: "",

  addItem: (product) => {
    const { items } = get();
    const existingItem = items.find((item) => item.id === product.id);

    if (existingItem) {
      set({
        items: items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({ 
        items: [
          ...items, 
          { 
            ...product, 
            imageUrl: product.imageUrl || (product as any).image || null,
            quantity: 1 
          }
        ] 
      });
    }
  },

  removeItem: (id) => {
    const { items } = get();
    set({ items: items.filter((item) => item.id !== id) });
  },

  updateQty: (id, qty) => {
    const { items } = get();
    if (qty <= 0) {
      set({ items: items.filter((item) => item.id !== id) });
    } else {
      set({
        items: items.map((item) =>
          item.id === id ? { ...item, quantity: qty } : item
        ),
      });
    }
  },

  clearCart: () => set({ items: [], discount: 0, taxEnabled: false, customerName: "" }),

  toggleTax: () => set((state) => ({ taxEnabled: !state.taxEnabled })),

  setDiscount: (amount) => set({ discount: amount }),

  setCustomerName: (name) => set({ customerName: name }),

  getSubtotal: () => {
    const { items } = get();
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  },

  getTax: () => {
    const { taxEnabled, getSubtotal } = get();
    if (!taxEnabled) return 0;
    return getSubtotal() * 0.11; // PPN 11%
  },

  getTotal: () => {
    const { getSubtotal, getTax, discount } = get();
    return getSubtotal() + getTax() - discount;
  },
}));
