"use client";

import React, { useState, useEffect } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { Tag, Loader2, X } from "lucide-react";
import { CATEGORY_COLORS } from "./CategoryCard";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  description: string | null;
  colorIndex: number;
}

interface CategoryDrawerProps {
  showDrawer: boolean;
  setShowDrawer: (show: boolean) => void;
  editCategory: Category | null;
  onSuccess: () => void;
}

export function CategoryDrawer({ 
  showDrawer, 
  setShowDrawer, 
  editCategory, 
  onSuccess 
}: CategoryDrawerProps) {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editCategory) {
      setCategoryName(editCategory.name);
      setCategoryDesc(editCategory.description || "");
      setSelectedColorIndex(editCategory.colorIndex || 0);
    } else {
      setCategoryName("");
      setCategoryDesc("");
      setSelectedColorIndex(0);
    }
  }, [editCategory, showDrawer]);

  const handleClose = () => {
    setShowDrawer(false);
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;

    setIsSubmitting(true);
    try {
      const url = editCategory 
        ? `/api/categories/${editCategory.id}` 
        : "/api/categories";
      const method = editCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: categoryName,
          description: categoryDesc,
          colorIndex: selectedColorIndex,
        }),
      });

      if (!response.ok) throw new Error("Failed to save category");

      toast.success(editCategory ? "Kategori diperbarui" : "Kategori ditambahkan");
      onSuccess();
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan kategori");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={showDrawer} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-[420px] p-0 border-l-0 shadow-2xl bg-white">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E7EB]">
          <h2 className="text-lg font-bold text-[#111827]">
            {editCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
          </h2>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {editCategory
              ? "Ubah detail kategori ini"
              : "Buat kategori baru untuk mengelompokkan produk"}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Color picker — pilih warna accent */}
          <div>
            <label className="text-sm font-medium text-[#111827] block mb-3">
              Warna Kategori
            </label>
            <div className="flex gap-2.5 flex-wrap">
              {CATEGORY_COLORS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColorIndex(i)}
                  className={`w-9 h-9 rounded-xl transition-all relative
                    ${selectedColorIndex === i
                      ? "ring-2 ring-offset-2 ring-[#4F46E5] scale-110 shadow-lg shadow-indigo-100"
                      : "hover:scale-105 border border-transparent"
                    }`}
                  style={{ backgroundColor: c.icon }}
                >
                  {selectedColorIndex === i && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Nama */}
          <div>
            <label className="text-sm font-medium text-[#111827] block mb-1.5">
              Nama Kategori <span className="text-[#EF4444]">*</span>
            </label>
            <input
              value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
              placeholder="e.g. Coffee, Food, Merchandise"
              className="w-full border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm
                         focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none
                         transition-all"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="text-sm font-medium text-[#111827] block mb-1.5">
              Deskripsi
              <span className="text-[#9CA3AF] font-normal ml-1">(opsional)</span>
            </label>
            <textarea
              value={categoryDesc}
              onChange={e => setCategoryDesc(e.target.value)}
              rows={3}
              placeholder="Deskripsi singkat tentang kategori ini..."
              className="w-full border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm
                         focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none
                         resize-none transition-all"
            />
          </div>

          {/* Preview card mini */}
          <div>
            <label className="text-sm font-medium text-[#111827] block mb-2">Preview</label>
            <div className="bg-[#F9FAFB] rounded-2xl p-4 border border-[#E5E7EB] border-dashed flex items-center gap-3">
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: CATEGORY_COLORS[selectedColorIndex].bg }}
              >
                <Tag size={20} style={{ color: CATEGORY_COLORS[selectedColorIndex].icon }} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#111827]">
                  {categoryName || "Nama Kategori"}
                </p>
                <p className="text-xs text-[#6B7280]">
                  {categoryDesc || "Tidak ada deskripsi"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[#E5E7EB] bg-white flex gap-3">
          <button 
            onClick={handleClose}
            className="flex-1 border border-[#E5E7EB] rounded-xl py-2.5 text-sm
                       font-medium hover:bg-[#F9FAFB] transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!categoryName.trim() || isSubmitting}
            className="flex-1 bg-[#4F46E5] text-white rounded-xl py-2.5 text-sm font-medium
                       hover:bg-[#4338CA] disabled:opacity-60 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-100"
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            {editCategory ? "Simpan Perubahan" : "Tambah Kategori"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
