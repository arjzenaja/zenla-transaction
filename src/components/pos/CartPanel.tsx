"use client";

import { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/formatCurrency";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, X, ReceiptText, User, Loader2, UserCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function CartPanel({ 
  onProcessPayment,
  isMobile,
  onClose
}: { 
  onProcessPayment: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const { 
    items, 
    updateQty, 
    removeItem, 
    clearCart, 
    taxEnabled, 
    toggleTax, 
    discount, 
    setDiscount,
    customerName,
    setCustomerName,
    getSubtotal,
    getTax,
    getTotal
  } = useCartStore();

  const [orderNumber, setOrderNumber] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ id: string; name: string; email?: string | null }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrderNumber(Math.floor(Math.random() * 90000 + 10000).toString());
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/customers?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Error fetching customers suggestions:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchQuery.trim()) {
        setCustomerName(searchQuery.trim());
        setSearchQuery("");
        setShowDropdown(false);
      }
    }
  };

  const handleSelectCustomer = (name: string) => {
    setCustomerName(name);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl text-gray-500 hover:bg-gray-100" 
              onClick={onClose}
            >
              <X size={20} />
            </Button>
          )}
          <div>
            <h3 className="text-lg font-bold text-[#111827]">Current Order</h3>
            <p className="text-xs text-gray-500 font-medium">Order #ZN-{orderNumber || "..."}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold gap-2 rounded-xl"
          onClick={clearCart}
          disabled={items.length === 0}
        >
          <Trash2 size={16} />
          Clear All
        </Button>
      </div>

      {/* Customer Selection */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white relative">
        {customerName ? (
          <div className="flex items-center justify-between bg-indigo-50/70 border border-indigo-100 rounded-2xl px-4 py-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-100">
                <UserCheck size={16} />
              </div>
              <div>
                <span className="text-xs font-semibold text-indigo-400 block uppercase tracking-wider">Customer</span>
                <span className="text-sm font-bold text-indigo-900">{customerName}</span>
              </div>
            </div>
            <button 
              onClick={() => setCustomerName("")}
              className="h-7 w-7 rounded-xl bg-white hover:bg-red-50 text-indigo-400 hover:text-red-500 flex items-center justify-center border border-indigo-100/50 hover:border-red-100 transition-all shadow-sm"
              title="Remove customer"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-gray-400 pointer-events-none">
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin text-indigo-500" />
                ) : (
                  <User size={18} />
                )}
              </div>
              <Input
                type="text"
                placeholder="Add customer name (search or type)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleKeyDown}
                className="pl-11 pr-4 h-12 bg-gray-50 border-gray-100 hover:bg-gray-50/30 hover:border-gray-200 focus-visible:bg-white focus-visible:border-indigo-500 focus-visible:ring-1 focus-visible:ring-indigo-500 text-sm font-medium rounded-2xl transition-all"
              />
            </div>

            {/* Autocomplete Dropdown */}
            {showDropdown && (searchQuery.trim() !== "") && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-gray-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="max-h-60 overflow-y-auto">
                  {suggestions.length > 0 ? (
                    suggestions.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => handleSelectCustomer(customer.name)}
                        className="w-full px-4 py-3 text-left hover:bg-indigo-50/50 flex flex-col transition-colors group"
                      >
                        <span className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                          {customer.name}
                        </span>
                        {customer.email && (
                          <span className="text-xs text-gray-400 font-medium">
                            {customer.email}
                          </span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs font-semibold text-gray-400 bg-gray-50/50">
                      No matching registered customers
                    </div>
                  )}
                </div>
                
                {/* Custom Name Option */}
                <button
                  type="button"
                  onClick={() => handleSelectCustomer(searchQuery.trim())}
                  className="w-full px-4 py-3 text-left bg-indigo-50/10 hover:bg-indigo-50 text-xs font-bold text-indigo-600 flex items-center justify-between transition-colors border-t border-gray-100"
                >
                  <span>Set as custom customer: "{searchQuery.trim()}"</span>
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">Press Enter</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingCartIcon className="text-gray-300" size={40} />
            </div>
            <h4 className="text-gray-900 font-bold mb-1">Your cart is empty</h4>
            <p className="text-gray-400 text-sm">Select products from the left to start an order</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 group">
              <div className="h-14 w-14 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50 flex items-center justify-center relative">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="h-full w-full object-cover" 
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div className={cn(
                  "w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500 font-bold text-lg",
                  item.imageUrl ? "hidden" : ""
                )}>
                  {item.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[#111827] truncate mb-1">{item.name}</h4>
                <p className="text-xs font-mono font-bold text-[#4F46E5]">Rp {formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  <button 
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="h-7 w-7 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-gray-500"
                  >
                    <Minus size={14} strokeWidth={3} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-[#111827]">{item.quantity}</span>
                  <button 
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="h-7 w-7 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-gray-500"
                  >
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer / Summary */}
      <div className="p-6 bg-gray-50/50 border-t border-gray-100 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Subtotal</span>
            <span className="text-[#111827] font-bold">Rp {formatPrice(subtotal)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Tax (PPN 11%)</span>
              <Switch checked={taxEnabled} onCheckedChange={toggleTax} className="data-[state=checked]:bg-[#4F46E5]" />
            </div>
            <span className="text-[#111827] font-bold">Rp {formatPrice(tax)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Discount</span>
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">Rp</span>
              <Input 
                type="number" 
                value={discount || ""} 
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="h-8 pl-8 pr-2 rounded-lg text-right text-sm font-bold border-gray-200"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-gray-200" />

        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-[#111827]">Total</span>
          <span className="text-2xl font-bold text-[#4F46E5] tracking-tight">Rp {formatPrice(total)}</span>
        </div>

        <Button 
          onClick={onProcessPayment}
          disabled={items.length === 0}
          className="w-full h-14 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl text-lg font-bold shadow-lg shadow-green-100 flex gap-3 mt-4"
        >
          <ReceiptText size={22} />
          PROCESS PAYMENT
        </Button>
      </div>
    </div>
  );
}

function ShoppingCartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
