"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Pencil, 
  Trash2,
  ChevronDown,
  Check,
  PackageSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { AddProductDrawer } from "@/components/products/AddProductDrawer";
import { ProductCard } from "@/components/products/ProductCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const StockBadge = ({ stock }: { stock: number }) => {
  const status = stock === 0 ? "out_of_stock" : stock <= 10 ? "low_stock" : "in_stock";
  const colors = {
    in_stock: "bg-green-100 text-green-700",
    low_stock: "bg-yellow-100 text-yellow-700",
    out_of_stock: "bg-red-100 text-red-700"
  };
  const labels = {
    in_stock: "In Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock"
  };
  return (
    <span className={cn("text-[10px] font-bold px-2 py-1 rounded-lg", colors[status])}>
      {labels[status]}
    </span>
  );
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Search Bug 3
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Category Bug 4
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Gagal memuat kategori:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter Bug 5
  const [selectedStock, setSelectedStock] = useState("all");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return "out_of_stock";
    if (stock <= 10) return "low_stock";
    return "in_stock";
  };

  const filteredProducts = products.filter((p) => {
    const q = debouncedQuery.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchStock    = selectedStock    === "all" || getStockStatus(p.stock) === selectedStock;
    const matchMinPrice = !priceMin || p.price >= Number(priceMin);
    const matchMaxPrice = !priceMax || p.price <= Number(priceMax);
    return matchSearch && matchCategory && matchStock && matchMinPrice && matchMaxPrice;
  });

  // Action Handlers Bug 6
  const handleEdit = (product: any) => {
    setEditProduct(product);
    setIsAddOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await fetch(`/api/products/${deleteTargetId}`, { method: "DELETE" });
      toast.success("Produk berhasil dihapus");
      setDeleteTargetId(null);
      fetchProducts();
      router.refresh();
    } catch {
      toast.error("Gagal menghapus produk");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Product Catalog</h1>
          <p className="text-sm text-gray-500 font-medium">Manage your products and inventory</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle View Mode Bug 2 */}
          <div className="flex items-center gap-1 border border-[#E5E7EB] rounded-xl p-1 bg-white">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-[#4F46E5] text-white"
                  : "text-[#6B7280] hover:bg-[#F9FAFB]"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-[#4F46E5] text-white"
                  : "text-[#6B7280] hover:bg-[#F9FAFB]"
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>

          <Button 
            onClick={() => { setEditProduct(null); setIsAddOpen(true); }}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-indigo-100 flex gap-2"
          >
            <Plus size={20} />
            Add New Product
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name..."
            className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm
                       focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent bg-gray-50/50 focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Category Dropdown Bug 4 */}
          <div ref={categoryRef} className="relative">
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="flex items-center gap-2 border border-[#E5E7EB] rounded-xl px-4 py-2.5
                         text-sm bg-white hover:bg-[#F9FAFB] min-w-[160px] justify-between h-11"
            >
              <span className="font-medium text-gray-600">{selectedCategory === "all" ? "All Categories" : selectedCategory}</span>
              <ChevronDown size={16} className={`text-[#6B7280] transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {categoryDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-lg
                              border border-[#E5E7EB] w-[200px] z-50 overflow-hidden max-h-[240px] overflow-y-auto">

                {/* Option: Semua */}
                <button
                  onClick={() => { setSelectedCategory("all"); setCategoryDropdownOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F9FAFB]
                              flex items-center justify-between
                              ${selectedCategory === "all" ? "font-semibold text-[#4F46E5]" : "text-[#374151]"}`}
                >
                  All Categories
                  {selectedCategory === "all" && <Check size={14} className="text-[#4F46E5]" />}
                </button>

                {/* Divider */}
                <div className="border-t border-[#E5E7EB]" />

                {/* Opsi dari database */}
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.name); setCategoryDropdownOpen(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F9FAFB]
                                flex items-center justify-between
                                ${selectedCategory === cat.name ? "font-semibold text-[#4F46E5]" : "text-[#374151]"}`}
                  >
                    {cat.name}
                    {selectedCategory === cat.name && <Check size={14} className="text-[#4F46E5]" />}
                  </button>
                ))}

                {/* Empty state jika tidak ada kategori */}
                {categories.length === 0 && (
                  <div className="px-4 py-3 text-xs text-[#9CA3AF] text-center">
                    Belum ada kategori
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filter Panel Bug 5 */}
          <div ref={filterRef} className="relative">
            <Button 
              variant="outline" 
              onClick={() => setFilterPanelOpen(!filterPanelOpen)}
              className={cn(
                "h-11 w-11 p-0 rounded-xl border-gray-100 text-gray-500",
                (selectedStock !== "all" || priceMin || priceMax) && "bg-indigo-50 border-indigo-200 text-indigo-600"
              )}
            >
              <Filter size={18} />
            </Button>

            {filterPanelOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-lg
                              border border-[#E5E7EB] w-[300px] z-50 p-5">
                <p className="text-sm font-semibold text-[#111827] mb-4">Filter Produk</p>

                {/* Stock Status */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-2 block">
                    Status Stok
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "all",          label: "Semua" },
                      { value: "in_stock",     label: "In Stock",     color: "bg-green-100 text-green-700" },
                      { value: "low_stock",    label: "Low Stock",    color: "bg-yellow-100 text-yellow-700" },
                      { value: "out_of_stock", label: "Out of Stock", color: "bg-red-100 text-red-700" },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedStock(opt.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                          ${selectedStock === opt.value
                            ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                            : `border-[#E5E7EB] ${opt.color || "text-[#374151]"} hover:border-[#4F46E5]`
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-5">
                  <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-2 block">
                    Rentang Harga (Rp)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceMin}
                      onChange={e => setPriceMin(e.target.value)}
                      className="flex-1 border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm
                                 focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                    />
                    <span className="text-[#9CA3AF] text-sm">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceMax}
                      onChange={e => setPriceMax(e.target.value)}
                      className="flex-1 border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm
                                 focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedStock("all"); setPriceMin(""); setPriceMax("") }}
                    className="flex-1 border border-[#E5E7EB] rounded-xl py-2 text-sm font-medium hover:bg-[#F9FAFB]"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setFilterPanelOpen(false)}
                    className="flex-1 bg-[#4F46E5] text-white rounded-xl py-2 text-sm font-medium hover:bg-[#4338CA]"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Empty State Bug 3 */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <PackageSearch size={44} className="mx-auto text-[#D1D5DB] mb-3" />
          <p className="text-sm font-semibold text-[#374151]">Produk tidak ditemukan</p>
          <p className="text-xs text-[#6B7280] mt-1">Coba kata kunci atau filter lain</p>
          <button onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setSelectedStock("all"); setPriceMin(""); setPriceMax(""); }}
            className="mt-4 text-sm text-[#4F46E5] hover:underline font-medium">
            Reset semua filter
          </button>
        </div>
      )}

      {/* Grid View Bug 2 */}
      {viewMode === "grid" && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}

      {/* List View Bug 2 */}
      {viewMode === "list" && filteredProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Produk</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Kategori</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Harga</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Stok</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-[#F9FAFB] transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.imageUrl || (product as any).image} alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-[#F3F4F6]"
                          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400" }} />
                        <div>
                          <p className="text-sm font-semibold text-[#111827]">{product.name}</p>
                          <p className="text-xs text-[#6B7280] line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs bg-[#F3F4F6] text-[#374151] px-2 py-1 rounded-lg font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#4F46E5] font-mono">
                      Rp {formatPrice(product.price)}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#374151] font-medium">
                      {product.stock} pcs
                    </td>
                    <td className="px-5 py-4">
                      <StockBadge stock={product.stock} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(product)}
                          className="p-1.5 hover:bg-[#EEF2FF] rounded-lg transition-colors"
                          title="Edit">
                          <Pencil size={15} className="text-[#4F46E5]" />
                        </button>
                        <button onClick={() => handleDelete(product.id)}
                          className="p-1.5 hover:bg-[#FEF2F2] rounded-lg transition-colors"
                          title="Hapus">
                          <Trash2 size={15} className="text-[#EF4444]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddProductDrawer 
        open={isAddOpen} 
        onOpenChange={setIsAddOpen} 
        editProduct={editProduct}
        onSuccess={() => {
          fetchProducts();
          fetchCategories();
          router.refresh();
        }}
      />

      {/* Delete Confirmation Bug 6 */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={() => setDeleteTargetId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Produk yang dihapus tidak dapat dikembalikan. Pastikan Anda yakin sebelum melanjutkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-[#EF4444] hover:bg-[#DC2626] rounded-xl text-white border-none"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
