"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatCurrency";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { PackageOpen } from "lucide-react";

export function BestSellersList() {
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await fetch("/api/analytics/best-sellers");
        if (response.ok) {
          const data = await response.json();
          setBestSellers(data);
        }
      } catch (error) {
        console.error("Failed to fetch best sellers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  return (
    <Card className="p-6 rounded-2xl shadow-sm bg-card h-full border-none">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-[#111827]">Best Sellers</h3>
        <Link href="/products" className="text-sm font-semibold text-[#4F46E5] hover:underline">
          View All
        </Link>
      </div>

      <div className="space-y-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-12 w-12 bg-gray-100 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
              <div className="h-6 bg-gray-100 rounded w-16" />
            </div>
          ))
        ) : bestSellers.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <PackageOpen size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Belum ada data penjualan</p>
              <p className="text-xs text-gray-500 font-medium">Transaksi yang berhasil akan ditampilkan di sini.</p>
            </div>
          </div>
        ) : (
          bestSellers.map((product, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center font-bold text-[#4F46E5]">
                {product.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[#111827] truncate">{product.name}</h4>
                <p className="text-xs text-gray-500 font-medium">{product.category} • {product.quantity} sold</p>
              </div>
              <Badge variant="secondary" className="bg-[#EEF2FF] text-[#4F46E5] font-mono border-none px-2 py-1 rounded-lg">
                Rp {formatPrice(product.revenue)}
              </Badge>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
