"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const shopName = formData.get("shopName") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await axios.post("/api/register", {
        email,
        password,
        shopName,
        phone,
      });

      toast.success("Account created successfully! Please log in.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-white relative">
        <div>
          <div className="flex items-center gap-2 mb-20">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
            <span className="font-bold text-xl text-[#111827]">Zenla Receipt</span>
          </div>

          <div className="max-w-md">
            <h2 className="text-5xl font-bold text-[#111827] mb-6 leading-tight">
              Join the future <br /> of receipt <br /> management.
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-12">
              Set up your business profile in minutes and start generating professional invoices that delight your customers.
            </p>
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1000" 
                alt="Product Preview" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        <div className="text-gray-400 text-xs">
          © 2024 Zenla Receipt Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F9FAFB]">
        <div className="w-full max-w-xl">
          <div className="flex justify-end mb-8">
            <Link href="/login" className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>

          <Card className="p-8 rounded-3xl border-gray-100 shadow-sm bg-white">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#111827] mb-1">Create Account</h1>
              <p className="text-sm text-gray-500">Enter your details to get started with your shop</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shopName">Shop Name</Label>
                  <Input id="shopName" name="shopName" placeholder="e.g. Zenla Coffee" required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" placeholder="+62..." className="h-11 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="name@company.com" required className="h-11 rounded-xl" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="h-11 rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox id="terms" className="mt-1 rounded-md" required />
                <Label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed font-normal">
                  I agree to the <Link href="#" className="text-indigo-600 font-semibold hover:underline">Terms of Service</Link> and <Link href="#" className="text-indigo-600 font-semibold hover:underline">Privacy Policy</Link>.
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold rounded-xl mt-4"
              >
                {loading ? "Creating Account..." : "Create My Account"}
              </Button>
            </form>
          </Card>

            <p className="text-center mt-8 text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 font-bold hover:underline">
                Login here
              </Link>
            </p>

            <div className="mt-12 flex justify-center gap-6 text-[11px] text-gray-400 font-medium">
              <Link href="#" className="hover:text-gray-600 transition-colors uppercase tracking-wider">Support</Link>
              <Link href="#" className="hover:text-gray-600 transition-colors uppercase tracking-wider">Documentation</Link>
              <Link href="#" className="hover:text-gray-600 transition-colors uppercase tracking-wider">API</Link>
            </div>
          </div>
      </div>
    </div>
  );
}
