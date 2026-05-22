import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatCurrency";
import { Copy, Check, Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PaymentBankTransfer({ total, onConfirm }: { total: number, onConfirm: () => void }) {
  const [copied, setCopied] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleCopy = () => {
    navigator.clipboard.writeText("1234567890");
    setCopied(true);
    toast.success("Account number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (file: File) => {
    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau PDF.");
      return;
    }
    // Validasi ukuran (maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar. Maksimal 5MB.");
      return;
    }
    setProofFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setProofPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null); // PDF tidak bisa preview
    }
  };

  const handleConfirmTransfer = () => {
    if (!proofFile) {
      toast.error("Harap upload bukti transfer terlebih dahulu");
      return;
    }
    onConfirm();
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Select Bank</label>
          <Select defaultValue="bca">
            <SelectTrigger className="h-12 rounded-xl border-gray-200">
              <SelectValue placeholder="Select bank" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-100 shadow-xl">
              <SelectItem value="bca">Bank Central Asia (BCA)</SelectItem>
              <SelectItem value="mandiri">Bank Mandiri</SelectItem>
              <SelectItem value="bni">Bank Negara Indonesia (BNI)</SelectItem>
              <SelectItem value="bri">Bank Rakyat Indonesia (BRI)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Account Number</span>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-2xl font-mono font-bold text-[#111827]">1234 567 890</p>
          <div className="h-[1px] bg-gray-50" />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Account Name</span>
            <span className="text-sm font-bold text-[#111827]">Zenla Receipt Inc.</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label className="text-sm font-bold text-gray-700">
              Upload Bukti Transfer
              <span className="text-red-500 ml-1">*</span>
            </label>
            <span className="text-[10px] text-gray-400 font-medium">Maks. 5MB</span>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
            }}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFileChange(file);
            }}
            className={`
              relative min-h-[120px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
              ${dragOver ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-gray-50/50 hover:bg-gray-50"}
              ${proofFile ? "border-green-500 bg-green-50/30" : ""}
            `}
          >
            {proofPreview ? (
              <div className="relative w-full h-full p-2">
                <img
                  src={proofPreview}
                  alt="Bukti transfer"
                  className="w-full max-h-[140px] object-contain rounded-lg"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProofFile(null);
                    setProofPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ) : proofFile ? (
              <div className="flex flex-col items-center gap-2 p-4 text-green-600">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <p className="text-xs font-bold text-center truncate max-w-[200px]">{proofFile.name}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProofFile(null);
                  }}
                  className="text-[10px] font-bold text-red-500 underline"
                >
                  Ganti File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center p-6 text-center">
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <Upload size={20} className="text-gray-400" />
                </div>
                <p className="text-xs text-gray-900 font-bold">Klik atau drag bukti transfer</p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">Format: JPG, PNG, atau PDF</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Button 
        onClick={handleConfirmTransfer}
        disabled={!proofFile}
        className={`
          w-full h-14 rounded-2xl text-lg font-bold transition-all shadow-lg
          ${proofFile 
            ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-indigo-100" 
            : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
          }
        `}
      >
        Confirm Transfer
      </Button>
    </div>
  );
}

