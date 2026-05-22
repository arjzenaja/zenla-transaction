"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { 
  X, 
  Loader2, 
  ImagePlus,
  AlertTriangle
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
  isActive?: boolean;
}

interface AddProductDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editProduct?: Product | null;
  onSuccess?: () => void;
}

export function AddProductDrawer({ 
  open, 
  onOpenChange, 
  editProduct,
  onSuccess 
}: AddProductDrawerProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for all fields - Bug 7B
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("0");
  const [isActive, setIsActive] = useState(true);

  // Image Upload - Bug 7A
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tambahkan state untuk kategori
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch saat drawer dibuka
  useEffect(() => {
    if (!open) return;
    setLoadingCategories(true);
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => toast.error("Gagal memuat kategori"))
      .finally(() => setLoadingCategories(false));
  }, [open]);

  useEffect(() => {
    if (editProduct) {
      setProductName(editProduct.name);
      setProductDescription(editProduct.description || "");
      setProductCategory(editProduct.category);
      setProductPrice(editProduct.price.toString());
      setProductStock(editProduct.stock.toString());
      setIsActive(editProduct.isActive !== false);
      setImagePreview(editProduct.imageUrl || null);
    } else {
      resetForm();
    }
  }, [editProduct, open]);

  const resetForm = () => {
    setProductName("");
    setProductDescription("");
    setProductCategory("");
    setProductPrice("");
    setProductStock("0");
    setIsActive(true);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (!editProduct) resetForm();
    onOpenChange(false);
  };

  const handleImageChange = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format tidak didukung. Gunakan JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maks. 5MB.");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitProduct = async () => {
    if (!productName || !productPrice || !productCategory) {
      toast.error("Nama, harga, dan kategori produk wajib diisi");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", productName);
    formData.append("description", productDescription);
    formData.append("category", productCategory);
    formData.append("price", productPrice);
    formData.append("stock", productStock);
    formData.append("isActive", isActive.toString());
    if (imageFile) formData.append("image", imageFile);

    try {
      const url = editProduct ? `/api/products/${editProduct.id}` : "/api/products";
      const method = editProduct ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });
      
      if (!res.ok) throw new Error("Gagal menyimpan produk");

      toast.success(editProduct ? "Produk berhasil diupdate!" : "Produk berhasil ditambahkan!");
      handleClose();
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (error) {
      toast.error("Gagal menyimpan produk");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[480px] p-0 border-none shadow-2xl">
        <div className="flex flex-col h-full bg-white">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#E5E7EB]">
            <h2 className="text-lg font-bold text-[#111827]">
              {editProduct ? "Edit Produk" : "Tambah Produk Baru"}
            </h2>
            <p className="text-sm text-[#6B7280] mt-0.5">
              {editProduct ? "Ubah detail produk yang sudah ada" : "Isi detail produk baru untuk katalog Anda"}
            </p>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Upload Foto Bug 7A */}
            <div>
              <label className="text-sm font-semibold text-[#111827] block mb-2">Foto Produk</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleImageChange(file);
                }}
                className={`
                  relative border-2 border-dashed rounded-2xl cursor-pointer
                  transition-all duration-200 overflow-hidden min-h-[180px]
                  ${dragOver ? "border-[#4F46E5] bg-[#EEF2FF]" : "border-[#E5E7EB] hover:border-[#4F46E5] hover:bg-[#F9FAFB]"}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageChange(file);
                  }}
                />

                {imagePreview ? (
                  <div className="relative w-full h-[180px]">
                    <img src={imagePreview} alt="Preview"
                      className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageFile(null);
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 bg-[#EF4444] text-white rounded-full
                                 w-7 h-7 flex items-center justify-center shadow-md hover:bg-[#DC2626] transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="w-12 h-12 bg-[#EEF2FF] rounded-2xl flex items-center justify-center mb-3">
                      <ImagePlus size={22} className="text-[#4F46E5]" />
                    </div>
                    <p className="text-sm font-bold text-[#374151]">
                      Klik atau drag & drop foto produk
                    </p>
                    <p className="text-xs text-[#9CA3AF] mt-1">JPG, PNG, WebP • Maks. 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Nama Produk */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#111827] block">
                Nama Produk <span className="text-[#EF4444]">*</span>
              </label>
              <input
                value={productName}
                onChange={e => setProductName(e.target.value)}
                placeholder="e.g. Zen Coffee Bean"
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm
                           focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all outline-none"
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#111827] block">Deskripsi</label>
              <textarea
                value={productDescription}
                onChange={e => setProductDescription(e.target.value)}
                placeholder="Deskripsi singkat produk..."
                rows={3}
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm
                           focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent resize-none transition-all outline-none"
              />
            </div>

            {/* Kategori */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#111827] block mb-1.5">
                Kategori <span className="text-[#EF4444]">*</span>
              </label>

              {loadingCategories ? (
                // Skeleton loading saat fetch
                <div className="w-full h-[42px] bg-[#F3F4F6] rounded-xl animate-pulse" />
              ) : (
                <select
                  value={productCategory}
                  onChange={e => setProductCategory(e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm
                             focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent bg-white"
                >
                  <option value="">Pilih kategori...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Jika tidak ada kategori sama sekali */}
              {!loadingCategories && categories.length === 0 && (
                <p className="text-xs text-[#F59E0B] mt-1.5 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Belum ada kategori.{" "}
                  <a href="/categories" className="text-[#4F46E5] underline hover:no-underline">
                    Tambahkan kategori dulu
                  </a>
                </p>
              )}
            </div>

            {/* Harga & Stok */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#111827] block">
                  Harga (Rp) <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="number"
                  value={productPrice}
                  onChange={e => setProductPrice(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm
                             focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#111827] block">Stok Awal</label>
                <input
                  type="number"
                  value={productStock}
                  onChange={e => setProductStock(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm
                             focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            {/* Status toggle */}
            <div className="flex items-center justify-between py-4 px-5 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
              <div>
                <p className="text-sm font-bold text-[#111827]">Status Produk</p>
                <p className="text-xs text-[#6B7280] mt-0.5 font-medium">
                  {isActive ? "Produk aktif dan tampil di kasir" : "Produk disembunyikan dari kasir"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 outline-none ${
                  isActive ? "bg-[#4F46E5]" : "bg-[#D1D5DB]"
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm
                                  transition-transform duration-200 ${isActive ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-[#E5E7EB] flex gap-3 bg-white">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 border border-[#E5E7EB] rounded-xl py-3 text-sm
                         font-bold text-[#374151] hover:bg-[#F9FAFB] transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmitProduct}
              disabled={isSubmitting}
              className="flex-1 bg-[#4F46E5] text-white rounded-xl py-3 text-sm
                         font-bold hover:bg-[#4338CA] transition-colors
                         disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {editProduct ? "Simpan Perubahan" : "Tambah Produk"}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
