"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Logged in successfully");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-[#4F46E5] flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <span className="text-white font-bold text-2xl">Z</span>
            </div>
            <span className="font-bold text-2xl">Zenla Receipt</span>
          </div>

          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Master your <br /> financial ecosystem.
          </h2>
          <p className="text-white/70 text-lg max-w-md leading-relaxed">
            Join over 10,000 enterprises using Zenla to automate expense tracking, streamline POS data, and generate premium financial reports with invisible infrastructure.
          </p>
        </div>

        <div className="z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <Avatar key={i} className="border-2 border-[#4F46E5] h-10 w-10">
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div className="text-sm">
              <p className="font-bold text-white">5.0 Rating</p>
              <p className="text-white/60">Trusted by world-class teams</p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#111827] mb-2">Log in</h1>
            <p className="text-gray-500">Enter your credentials to access your receipts</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                required
                className="h-12 rounded-xl border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm font-semibold text-[#4F46E5] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className="h-12 rounded-xl border-gray-200 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" className="rounded-md border-gray-300" />
              <Label htmlFor="remember" className="text-sm text-gray-500 font-normal">
                Keep me logged in for 30 days
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold rounded-xl"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="relative flex items-center gap-4 text-sm text-gray-400 my-8">
              <div className="h-[1px] flex-1 bg-gray-100" />
              <span>Or continue with</span>
              <div className="h-[1px] flex-1 bg-gray-100" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-12 rounded-xl border-gray-200 font-semibold flex gap-2">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                Google
              </Button>
              <Button variant="outline" className="h-12 rounded-xl border-gray-200 font-semibold flex gap-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" className="w-4 h-4" />
                Apple ID
              </Button>
            </div>
          </form>

          <p className="text-center mt-10 text-gray-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#4F46E5] font-bold hover:underline">
              Create an account
            </Link>
          </p>

          <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between text-[11px] text-gray-400">
            <p>© 2024 Zenla Receipt Inc.</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-gray-600">Privacy Policy</Link>
              <Link href="#" className="hover:text-gray-600">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
