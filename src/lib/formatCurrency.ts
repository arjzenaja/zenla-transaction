export const formatCurrency = (amount: number): string => {
  const safeAmount = isNaN(amount) || amount == null ? 0 : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safeAmount);
};

export const formatPrice = (amount: number): string => {
  const safeAmount = isNaN(amount) || amount == null ? 0 : amount;
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safeAmount);
};

export const formatRupiah = (amount: number): string => {
  const safeAmount = isNaN(amount) || amount == null ? 0 : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safeAmount);
};

export const formatPaymentMethod = (method: string): string => {
  if (!method) return "—";
  return method.replace(/_/g, " ").toUpperCase();
};

export const formatDueDate = (dateStr?: string | null | Date): string => {
  if (!dateStr) return "—";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return "—";
  
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  };
  return new Intl.DateTimeFormat("id-ID", options).format(date).replace(/\./g, ":");
};

