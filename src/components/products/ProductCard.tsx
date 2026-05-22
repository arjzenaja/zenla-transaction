"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description?: string;
  subtitle?: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
  image?: string; // Support for existing data
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const imageUrl = product.imageUrl || product.image;
  
  return (
    <Card className="group relative bg-white rounded-2xl border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border hover:border-indigo-100">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400" }}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-white/90 backdrop-blur-md text-[#111827] border-none font-bold text-[10px] px-2.5 py-1 rounded-lg shadow-sm">
            {product.category}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className={cn(
            "border-none font-bold text-[10px] px-2.5 py-1 rounded-lg shadow-sm",
            product.stock > 10 ? "bg-green-100 text-green-700" : 
            product.stock > 0 ? "bg-yellow-100 text-yellow-700" : 
            "bg-red-100 text-red-700"
          )}>
            {product.stock > 10 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock"}
          </Badge>
        </div>
        
        {/* Hover Actions - BUG 6 */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/5 rounded-2xl transition-colors group">
          <div className="absolute bottom-3 right-3 hidden group-hover:flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(product) }}
              className="p-2 bg-white rounded-xl shadow-md hover:bg-[#EEF2FF] transition-colors"
              title="Edit produk"
            >
              <Pencil size={14} className="text-[#4F46E5]" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(product.id) }}
              className="p-2 bg-white rounded-xl shadow-md hover:bg-[#FEF2F2] transition-colors"
              title="Hapus produk"
            >
              <Trash2 size={14} className="text-[#EF4444]" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-4 flex-1">
          <h4 className="font-bold text-[#111827] mb-1 group-hover:text-[#4F46E5] transition-colors">{product.name}</h4>
          <p className="text-xs text-gray-500 font-medium line-clamp-1">{product.description || product.subtitle}</p>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Price</p>
            <p className="text-lg font-mono font-bold text-[#4F46E5]">Rp {formatPrice(product.price)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Stock</p>
            <p className="text-sm font-bold text-[#111827]">{product.stock} pcs</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
