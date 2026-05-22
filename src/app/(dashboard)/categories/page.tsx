"use client";

import React, { useState, useEffect } from "react";
import { 
  Tag, 
  Search, 
  Plus, 
  ChevronDown, 
  Layers, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
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
import { CategoryCard } from "@/components/categories/CategoryCard";
import { CategoryDrawer } from "@/components/categories/CategoryDrawer";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  description: string | null;
  productCount: number;
  totalValue: number;
  colorIndex: number;
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"az" | "za" | "most" | "least">("az");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "empty">("all");
  const [showDrawer, setShowDrawer] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
        if (data.error) toast.error(data.error);
      }
    } catch (error) {
      console.error(error);
      setCategories([]);
      toast.error("Gagal mengambil data kategori");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category: Category) => {
    setEditCategory(category);
    setShowDrawer(true);
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      const response = await fetch(`/api/categories/${deleteTargetId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal menghapus kategori");
      }

      toast.success("Kategori berhasil dihapus");
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeleteTargetId(null);
    }
  };

  const filteredCategories = Array.isArray(categories) 
    ? categories
        .filter(c => {
          const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
          const matchFilter =
            filterStatus === "all" ? true :
            filterStatus === "active" ? c.productCount > 0 :
            filterStatus === "empty" ? c.productCount === 0 : true;
          return matchSearch && matchFilter;
        })
        .sort((a, b) => {
          if (sortOrder === "az") return a.name.localeCompare(b.name);
          if (sortOrder === "za") return b.name.localeCompare(a.name);
          if (sortOrder === "most") return b.productCount - a.productCount;
          if (sortOrder === "least") return a.productCount - b.productCount;
          return 0;
        })
    : [];

  const totalProducts = Array.isArray(categories) 
    ? categories.reduce((sum, c) => sum + c.productCount, 0)
    : 0;

  const stats = [
    {
      icon: <Layers size={15} />,
      label: "Total Kategori",
      value: categories.length,
      color: "bg-[#EEF2FF] text-[#4F46E5]",
    },
    {
      icon: <CheckCircle size={15} />,
      label: "Ada Produk",
      value: Array.isArray(categories) ? categories.filter(c => c.productCount > 0).length : 0,
      color: "bg-[#DCFCE7] text-[#16A34A]",
    },
    {
      icon: <AlertCircle size={15} />,
      label: "Kosong",
      value: Array.isArray(categories) ? categories.filter(c => c.productCount === 0).length : 0,
      color: "bg-[#FEF3C7] text-[#D97706]",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Kategori</h1>
          <p className="text-sm text-[#6B7280]">Kelola kategori produk toko Anda</p>
        </div>
        <button
          onClick={() => {
            setEditCategory(null);
            setShowDrawer(true);
          }}
          className="bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#4338CA] transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Plus size={18} /> Tambah Kategori
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors w-full md:w-auto justify-between">
                <span>Urutkan: {
                  sortOrder === "az" ? "A → Z" :
                  sortOrder === "za" ? "Z → A" :
                  sortOrder === "most" ? "Terbanyak" : "Tersedikit"
                }</span>
                <ChevronDown size={16} className="text-[#6B7280]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              <DropdownMenuItem onClick={() => setSortOrder("az")} className="text-sm cursor-pointer">A → Z</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("za")} className="text-sm cursor-pointer">Z → A</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("most")} className="text-sm cursor-pointer">Terbanyak</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("least")} className="text-sm cursor-pointer">Tersedikit</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors w-full md:w-auto justify-between">
                <span>Filter: {
                  filterStatus === "all" ? "Semua" :
                  filterStatus === "active" ? "Ada Produk" : "Kosong"
                }</span>
                <ChevronDown size={16} className="text-[#6B7280]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              <DropdownMenuItem onClick={() => setFilterStatus("all")} className="text-sm cursor-pointer">Semua</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("active")} className="text-sm cursor-pointer">Ada Produk</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("empty")} className="text-sm cursor-pointer">Kosong</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {stats.map(({ icon, label, value, color }) => (
          <div key={label}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${color}`}>
            {icon}
            {label}: <span className="font-bold">{value}</span>
          </div>
        ))}
      </div>

      {/* Category Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-[#4F46E5] mb-4" size={40} />
          <p className="text-[#6B7280] font-medium">Memuat kategori...</p>
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              totalProducts={totalProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-[#E5E7EB] border-dashed">
          <div className="w-20 h-20 bg-[#EEF2FF] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Tag size={36} className="text-[#4F46E5]" />
          </div>
          <p className="text-lg font-bold text-[#111827]">
            {searchQuery ? "Kategori tidak ditemukan" : "Belum ada kategori"}
          </p>
          <p className="text-sm text-[#6B7280] mt-1.5 max-w-xs mx-auto">
            {searchQuery
              ? "Coba gunakan kata kunci lain untuk mencari kategori yang Anda inginkan"
              : "Mulai dengan menambahkan kategori pertama Anda untuk mengelompokkan produk"
            }
          </p>
          {!searchQuery && (
            <button
              onClick={() => {
                setEditCategory(null);
                setShowDrawer(true);
              }}
              className="mt-6 bg-[#4F46E5] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-100"
            >
              + Tambah Kategori
            </button>
          )}
        </div>
      )}

      {/* Drawer */}
      <CategoryDrawer
        showDrawer={showDrawer}
        setShowDrawer={setShowDrawer}
        editCategory={editCategory}
        onSuccess={fetchCategories}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={() => setDeleteTargetId(null)}>
        <AlertDialogContent className="rounded-3xl p-8">
          <AlertDialogHeader>
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <AlertCircle size={28} className="text-red-500" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-[#111827]">Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#6B7280] leading-relaxed">
              Kategori yang dihapus tidak dapat dikembalikan. 
              Produk dalam kategori ini tidak akan terhapus, namun hubungan kategorinya akan dilepas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl border-[#E5E7EB] text-[#374151] font-medium hover:bg-gray-50">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-[#EF4444] hover:bg-[#DC2626] rounded-xl text-white font-medium px-6"
            >
              Ya, Hapus Kategori
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
