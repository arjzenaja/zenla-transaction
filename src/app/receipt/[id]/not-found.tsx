"use client";

import { FileX, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ReceiptNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center select-none relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-50/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Content Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-100 max-w-md w-full animate-fade-in">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-100 shadow-inner">
          <FileX size={32} />
        </div>
        
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Struk Tidak Ditemukan</h1>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Link receipt yang Anda buka tidak valid, sudah dihapus, atau Anda memasukkan ID transaksi yang salah.
        </p>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-2xl py-3.5 px-6 text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-100"
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard
          </Link>
          
          <span className="text-[10px] text-slate-400 mt-2">
            Hubungi merchant / toko Anda untuk meminta link struk yang baru.
          </span>
        </div>
      </div>

      {/* Footer Branding */}
      <p className="text-xs text-slate-400 mt-8">
        Powered by <span className="text-indigo-600 font-semibold">Zenla Receipt</span>
      </p>
    </div>
  );
}
