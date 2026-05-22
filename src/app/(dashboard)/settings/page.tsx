"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Building2, 
  CreditCard, 
  Users, 
  Receipt, 
  Camera, 
  Plus, 
  MoreVertical,
  MapPin,
  Trash2,
  ShieldAlert
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const shopName = session?.user?.name || "Zenla Receipt Shop";
  const contactEmail = session?.user?.email || "owner@zenla.com";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Settings</h1>
        <p className="text-sm text-gray-500 font-medium">Configure your shop and system preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="bg-transparent border-b border-gray-100 w-full justify-start rounded-none h-auto p-0 gap-8 overflow-x-auto whitespace-nowrap scrollbar-hide flex flex-row">
          <TabsTrigger value="profile" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#4F46E5] data-[state=active]:bg-transparent data-[state=active]:text-[#4F46E5] px-0 pb-4 font-bold text-sm text-gray-400">Shop Profile</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#4F46E5] data-[state=active]:bg-transparent data-[state=active]:text-[#4F46E5] px-0 pb-4 font-bold text-sm text-gray-400">Payment Methods</TabsTrigger>
          <TabsTrigger value="staff" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#4F46E5] data-[state=active]:bg-transparent data-[state=active]:text-[#4F46E5] px-0 pb-4 font-bold text-sm text-gray-400">Staff Access</TabsTrigger>
          <TabsTrigger value="receipt" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#4F46E5] data-[state=active]:bg-transparent data-[state=active]:text-[#4F46E5] px-0 pb-4 font-bold text-sm text-gray-400">Receipt Customization</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-8 mt-0 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-4 sm:p-8 rounded-2xl border-gray-100 shadow-sm bg-white space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-[#111827]">Shop Details</h3>
                  <Button className="bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl font-bold">Save Changes</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="shopName">Shop Name</Label>
                    <Input id="shopName" key={shopName} defaultValue={shopName} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input id="email" key={contactEmail} defaultValue={contactEmail} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea id="address" className="min-h-[100px] rounded-xl p-4 resize-none" defaultValue="Jl. Sudirman No. 123, Jakarta Selatan, 12190" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-8 rounded-2xl border-gray-100 shadow-sm bg-white space-y-6">
                <div className="flex items-center gap-3 mb-2">
                   <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <MapPin size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-[#111827]">Store Location</h3>
                </div>
                <div className="h-48 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center">
                  <p className="text-sm text-gray-400 font-bold tracking-wider">Map Preview Placeholder</p>
                </div>
                <Button variant="outline" className="w-full rounded-xl border-gray-200 font-bold">Update Location</Button>
              </Card>

              <Card className="p-4 sm:p-8 rounded-2xl border-red-50 bg-red-50/20 space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldAlert size={20} className="text-red-500" />
                  <h3 className="text-lg font-bold text-red-600">Danger Zone</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
                  Once you delete your store profile, there is no going back. Please be certain. All transaction data and product catalogs will be permanently erased.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                  <Button variant="outline" className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-bold w-full sm:w-auto">Delete Store Profile</Button>
                  <Button variant="outline" className="rounded-xl border-gray-200 text-gray-500 hover:bg-gray-100 font-bold w-full sm:w-auto">Deactivate Account</Button>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="p-4 sm:p-8 rounded-2xl border-gray-100 shadow-sm bg-white">
                <h3 className="text-sm font-bold text-[#111827] mb-6">Shop Logo</h3>
                <div className="flex flex-col items-center">
                  <div className="h-32 w-32 rounded-3xl bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center group cursor-pointer hover:bg-gray-100 transition-colors relative">
                    <Camera size={32} className="text-gray-300 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-widest">Update Logo</p>
                    <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-[#4F46E5] rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 border-4 border-white">
                      <Plus size={20} />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium text-center mt-6 leading-relaxed uppercase tracking-wider">
                    Recommended: 512x512px<br />PNG or SVG with transparency
                  </p>
                </div>
              </Card>

              <Card className="p-4 sm:p-8 rounded-2xl border-gray-100 shadow-sm bg-white space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-[#111827]">Staff Access</h3>
                  <Button variant="ghost" size="sm" className="text-indigo-600 font-bold text-xs p-0 h-auto hover:bg-transparent">Add Staff</Button>
                </div>
                <div className="space-y-4">
                   {[
                    { name: shopName, role: "Owner", avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(shopName)}` },
                  ].map((staff, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 rounded-lg border border-gray-100">
                          <AvatarImage src={staff.avatar} />
                          <AvatarFallback className="text-[10px] font-bold">{staff.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-bold text-[#111827]">{staff.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{staff.role}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <MoreVertical size={14} className="text-gray-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="payments" className="mt-0 outline-none">
          <Card className="p-4 sm:p-8 rounded-2xl border-gray-100 shadow-sm bg-white max-w-3xl">
             <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-bold text-[#111827]">Payment Methods</h3>
                <p className="text-sm text-gray-500 font-medium">Configure how your customers pay</p>
              </div>
              <Button className="bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl font-bold flex gap-2">
                <Plus size={18} />
                Add New
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-gray-100 flex items-center justify-between hover:border-indigo-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600">
                    <Receipt size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#111827]">QRIS Digital Payment</h4>
                    <p className="text-xs text-gray-500 font-medium">Automatic verification enabled</p>
                  </div>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-[#4F46E5]" />
              </div>

              <div className="p-5 rounded-2xl border border-gray-100 flex items-center justify-between hover:border-indigo-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#111827]">Bank Central Asia (BCA)</h4>
                    <p className="text-xs text-gray-500 font-medium">123-456-7890 • Zenla Receipt Inc.</p>
                  </div>
                </div>
                <Button variant="ghost" className="text-[#4F46E5] font-bold">Edit</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
