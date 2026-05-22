"use client";

import React from "react";
import { 
  Tag, 
  Coffee, 
  UtensilsCrossed, 
  GlassWater, 
  ShoppingBag, 
  Croissant, 
  ArrowRight,
  MoreHorizontal,
  Pencil,
  Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Category {
  id: string;
  name: string;
  description: string | null;
  productCount: number;
  totalValue: number;
  colorIndex: number;
}

interface CategoryCardProps {
  category: Category;
  totalProducts: number;
  onEdit: (category: any) => void;
  onDelete: (id: string) => void;
}

export const CATEGORY_COLORS = [
  { bg: "#EEF2FF", icon: "#4F46E5" },  // indigo
  { bg: "#DCFCE7", icon: "#16A34A" },  // green
  { bg: "#FEF3C7", icon: "#D97706" },  // amber
  { bg: "#FCE7F3", icon: "#DB2777" },  // pink
  { bg: "#E0F2FE", icon: "#0284C7" },  // sky
  { bg: "#F3E8FF", icon: "#9333EA" },  // purple
  { bg: "#FFE4E6", icon: "#E11D48" },  // rose
  { bg: "#CCFBF1", icon: "#0D9488" },  // teal
];

export const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("coffee") || n.includes("kopi")) return <Coffee size={22} />;
  if (n.includes("food") || n.includes("makanan")) return <UtensilsCrossed size={22} />;
  if (n.includes("drink") || n.includes("minum")) return <GlassWater size={22} />;
  if (n.includes("merch") || n.includes("souvenir")) return <ShoppingBag size={22} />;
  if (n.includes("bakery") || n.includes("roti")) return <Croissant size={22} />;
  return <Tag size={22} />; // default
};

export function CategoryCard({ category, totalProducts, onEdit, onDelete }: CategoryCardProps) {
  const router = useRouter();
  const colors = CATEGORY_COLORS[category.colorIndex % CATEGORY_COLORS.length];
  const portion = totalProducts > 0 ? Math.round((category.productCount / totalProducts) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Color swatch + icon */}
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: colors.bg }}
          >
            <span style={{ color: colors.icon }}>
              {getCategoryIcon(category.name)}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-[#111827] text-base leading-tight">
              {category.name}
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-1">
              {category.description ?? "Tidak ada deskripsi"}
            </p>
          </div>
        </div>

        {/* Kebab menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal size={20} className="text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuItem 
              onClick={() => onEdit(category)}
              className="flex items-center gap-2 cursor-pointer py-2"
            >
              <Pencil size={16} />
              <span>Edit Kategori</span>
            </DropdownMenuItem>
            
            <TooltipProvider>
              <Tooltip delayDuration={0} open={category.productCount > 0 ? undefined : false}>
                <TooltipTrigger asChild>
                  <div className="w-full">
                    <DropdownMenuItem 
                      onClick={() => category.productCount === 0 && onDelete(category.id)}
                      disabled={category.productCount > 0}
                      className={`flex items-center gap-2 cursor-pointer py-2 ${
                        category.productCount > 0 ? "opacity-50 cursor-not-allowed" : "text-red-600 focus:text-red-600 focus:bg-red-50"
                      }`}
                    >
                      <Trash2 size={16} />
                      <span>Hapus</span>
                    </DropdownMenuItem>
                  </div>
                </TooltipTrigger>
                {category.productCount > 0 && (
                  <TooltipContent side="left" className="bg-gray-800 text-white border-none rounded-lg">
                    <p className="text-xs">Tidak bisa dihapus — masih ada produk dalam kategori ini</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats — 2 mini cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#F9FAFB] rounded-xl p-3">
          <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-0.5">Produk</p>
          <p className="text-lg font-bold text-[#111827]">{category.productCount}</p>
        </div>
        <div className="bg-[#F9FAFB] rounded-xl p-3">
          <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-0.5">Nilai Stok</p>
          <p className="text-sm font-bold text-[#111827]">
            {formatRupiah(category.totalValue)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-[#6B7280] mb-1.5">
          <span>Porsi dari total produk</span>
          <span className="font-semibold">{portion}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${portion}%`,
              backgroundColor: colors.icon,
            }}
          />
        </div>
      </div>

      {/* CTA button */}
      <button
        onClick={() => router.push(`/products?category=${encodeURIComponent(category.name)}`)}
        className="w-full text-sm font-medium text-[#4F46E5] hover:text-[#4338CA] hover:bg-[#EEF2FF] rounded-xl py-2 transition-colors flex items-center justify-center gap-1.5"
      >
        Lihat Produk <ArrowRight size={14} />
      </button>
    </div>
  );
}
