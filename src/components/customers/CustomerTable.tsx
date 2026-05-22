"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Mail, Phone, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";

const customers = [
  {
    id: "1",
    name: "Aditya Pratama",
    email: "aditya@example.com",
    phone: "+62 812-3456-7890",
    avatar: "https://i.pravatar.cc/150?u=aditya",
    transactions: 12,
    totalSpend: 2450000,
    status: "active",
  },
  {
    id: "2",
    name: "Siti Aminah",
    email: "siti@example.com",
    phone: "+62 813-9876-5432",
    avatar: "https://i.pravatar.cc/150?u=siti",
    transactions: 8,
    totalSpend: 840000,
    status: "active",
  },
  {
    id: "3",
    name: "Budi Santoso",
    email: "budi@example.com",
    phone: "+62 856-4321-0987",
    avatar: "https://i.pravatar.cc/150?u=budi",
    transactions: 24,
    totalSpend: 5600000,
    status: "active",
  },
  {
    id: "4",
    name: "Dewi Lestari",
    email: "dewi@example.com",
    phone: "+62 878-1122-3344",
    avatar: "https://i.pravatar.cc/150?u=dewi",
    transactions: 2,
    totalSpend: 185000,
    status: "inactive",
  },
  {
    id: "5",
    name: "Rizky Ramadhan",
    email: "rizky@example.com",
    phone: "+62 811-5566-7788",
    avatar: "https://i.pravatar.cc/150?u=rizky",
    transactions: 1,
    totalSpend: 45000,
    status: "churned",
  },
];

export function CustomerTable() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-[#F9FAFB]">
          <TableRow className="hover:bg-transparent border-gray-100">
            <TableHead className="font-bold text-[#111827] h-14 pl-6">Customer</TableHead>
            <TableHead className="font-bold text-[#111827] h-14">Contact Info</TableHead>
            <TableHead className="font-bold text-[#111827] h-14 text-center">Transactions</TableHead>
            <TableHead className="font-bold text-[#111827] h-14">Total Spend</TableHead>
            <TableHead className="font-bold text-[#111827] h-14 text-center">Status</TableHead>
            <TableHead className="w-16 h-14 pr-6"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id} className="hover:bg-[#F9FAFB] transition-colors border-gray-100 group">
              <TableCell className="pl-6 py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-gray-100 shadow-sm">
                    <AvatarImage src={customer.avatar} />
                    <AvatarFallback className="bg-gray-50 text-xs font-bold">{customer.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-[#111827] leading-none mb-1">{customer.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Member since 2023</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                    <Mail size={12} className="text-gray-400" />
                    {customer.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                    <Phone size={12} className="text-gray-400" />
                    {customer.phone}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4 text-center">
                <span className="text-sm font-bold text-[#111827]">{customer.transactions}</span>
              </TableCell>
              <TableCell className="py-4">
                <p className="text-sm font-bold text-[#111827]">Rp {formatPrice(customer.totalSpend)}</p>
              </TableCell>
              <TableCell className="py-4 text-center">
                <Badge 
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[10px] font-bold border-none capitalize shadow-sm",
                    customer.status === "active" ? "bg-green-100 text-green-700" : 
                    customer.status === "inactive" ? "bg-yellow-100 text-yellow-700" : 
                    "bg-red-100 text-red-700"
                  )}
                >
                  {customer.status}
                </Badge>
              </TableCell>
              <TableCell className="pr-6 py-4 text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-[#4F46E5] hover:bg-indigo-50">
                  <ExternalLink size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
