"use client";

import { useState, useEffect } from "react";
import { Search, Plus, PackageOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";

export function ProductGrid() {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);

        if (productsRes.ok) {
          const productsData = await productsRes.ok ? await productsRes.json() : [];
          setProducts(productsData);
        }
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(["All", ...categoriesData.map((c: any) => c.name)]);
        }
      } catch (error) {
        console.error("Failed to load catalog data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCatalog();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="space-y-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input 
            placeholder="Search or scan product..." 
            className="w-full pl-9 pr-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent bg-white h-auto"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              className={cn(
                "rounded-full px-6 h-10 font-bold transition-all whitespace-nowrap",
                activeCategory === cat 
                  ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-md shadow-indigo-100" 
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              )}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 overflow-y-auto pr-1">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
              <div className="h-32 bg-gray-100 rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <PackageOpen size={24} />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">Belum ada produk</p>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Katalog produk kosong. Silakan tambah produk baru terlebih dahulu.
              </p>
            </div>
            <Button 
              onClick={() => router.push("/products")}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold px-4 h-9 shadow-sm"
            >
              Tambah Produk
            </Button>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const productImg = product.imageUrl || product.image || "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400";
            return (
              <button
                key={product.id}
                disabled={isOutOfStock}
                onClick={() => addItem({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  imageUrl: productImg,
                  category: product.category,
                  stock: product.stock,
                  isActive: product.isActive,
                  userId: product.userId,
                  createdAt: new Date(product.createdAt),
                })}
                className={cn(
                  "group relative flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-left transition-all hover:shadow-xl hover:border-indigo-100 active:scale-95",
                  isOutOfStock && "opacity-60 grayscale cursor-not-allowed"
                )}
              >
                <div className="relative h-44 overflow-hidden bg-gray-50">
                  <img 
                    src={productImg} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <Badge className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[#111827] border-none font-bold text-[10px] px-2 py-1 rounded-lg shadow-sm">
                    {product.category}
                  </Badge>
                  {isOutOfStock && (
                    <Badge className="absolute top-3 right-3 bg-red-500 text-white border-none font-bold text-[10px] px-2 py-1 rounded-lg">
                      Out of Stock
                    </Badge>
                  )}
                  {!isOutOfStock && (
                    <div className="absolute bottom-3 right-3 h-8 w-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={18} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-bold text-[#111827] mb-1 line-clamp-1">{product.name}</h4>
                  <p className="text-sm font-mono font-bold text-[#4F46E5]">Rp {formatPrice(product.price)}</p>
                  <p className="text-[10px] text-gray-400 mt-2 font-medium">Stock: {product.stock} units</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
