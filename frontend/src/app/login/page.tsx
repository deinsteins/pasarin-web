"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Mail,
  Lock,
  LogIn,
  Leaf,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Divider } from "@/components/ui/Divider";
import { SocialButton } from "@/components/ui/SocialButton";

const loginSchema = z.object({
  email: z.string().min(1, "Email atau nomor telepon wajib diisi").refine(
    (val) => {
      // If it looks like an email, validate email format
      if (val.includes("@")) {
        return z.string().email().safeParse(val).success;
      }
      // Otherwise, validate phone format (min 9, max 15 digits, optional leading +)
      const phoneRegex = /^\+?[0-9]{9,15}$/;
      return phoneRegex.test(val);
    },
    {
      message: "Format email atau nomor telepon tidak valid",
    }
  ),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      const result = await login(values.email, values.password);
      
      if (!result.success) {
        setFormError(result.error || "Gagal masuk. Periksa kembali akun Anda.");
      } else {
        router.push("/");
      }
    } catch (err) {
      setFormError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-zinc-950">
      {/* ─── Left Panel: Illustration ─── */}
      <div className="relative hidden w-[52%] lg:flex items-stretch">
        <div className="relative flex w-full flex-col overflow-hidden bg-gradient-to-br from-brand-primary-600 via-brand-primary-500 to-brand-primary-400">
          {/* Pasarin Logo (top-left) */}
          <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-soft-sm bg-white/20 text-white backdrop-blur-md">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-heading drop-shadow-sm">
              Pasarin
            </span>
          </div>

          {/* Illustration placeholder ─── */}
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-white/70">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                <Leaf className="h-14 w-14 text-white/80" />
              </div>
              <p className="text-sm font-semibold text-white/60">Ilustrasi akan ditampilkan di sini</p>
            </div>
          </div>

          {/* Bottom decorative curve */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 800 80" className="w-full text-white/10" preserveAspectRatio="none">
              <path
                d="M0,40 C200,80 400,0 600,50 C700,70 780,30 800,40 L800,80 L0,80 Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ─── Right Panel: Login Form ─── */}
      <div className="flex w-full flex-col items-center justify-center bg-[#f8f9fa] px-6 py-10 lg:w-[48%] lg:px-16 xl:px-24 dark:bg-zinc-950">
        <div className="w-full max-w-[420px] flex flex-col items-center">
          {/* Mobile logo (only visible on small screens) */}
          <div className="mb-6 flex items-center gap-2 lg:hidden w-full justify-start">
            <div className="flex h-9 w-9 items-center justify-center rounded-soft-sm bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 text-white shadow-soft-sm">
              <Leaf className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white font-heading">
              Pasarin
            </span>
          </div>

          {/* Form Card wrapper */}
          <Card
            title="Selamat Datang di Pasarin"
            subtitle="Belanja Sayur Segar Langsung dari Pasar Tradisional"
            glass={true}
            className="w-full"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {formError && (
                <Alert variant="error" className="mb-4">
                  <span>{formError}</span>
                </Alert>
              )}

              {/* Email or Phone Input */}
              <Input
                {...register("email")}
                type="text"
                placeholder="Phone or email"
                icon={Mail}
                error={errors.email?.message}
                autoComplete="email"
              />

              {/* Password Input */}
              <div className="space-y-2">
                <Input
                  {...register("password")}
                  type="password"
                  placeholder="Password"
                  icon={Lock}
                  error={errors.password?.message}
                  autoComplete="current-password"
                />
                
                {/* Lupa Password positioned right below Password Input */}
                <div className="flex justify-end pr-1">
                  <Link
                    href="#"
                    className="text-xs font-bold text-brand-primary-600 hover:text-brand-primary-550 transition-colors"
                  >
                    Lupa Password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Masuk
                </span>
              </Button>
            </form>

            {/* Divider */}
            <Divider className="mt-6 mb-5">Lain login</Divider>

            {/* Google OAuth Button */}
            <SocialButton provider="google">
              Lanjut dengan Google
            </SocialButton>

            {/* Footer registration link */}
            <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-bold text-brand-primary-600 hover:text-brand-primary-500 dark:text-brand-primary-400 dark:hover:text-brand-primary-300"
              >
                Daftar Sekarang
              </Link>
            </p>
          </Card>

          {/* ─── Bottom Trust Badges ─── */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-550 dark:text-zinc-400 w-full pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
            {/* Badge 1: Transaksi Aman */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-450 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="leading-tight text-left">
                <p className="font-extrabold text-zinc-800 dark:text-zinc-250">Transaksi Aman</p>
                <p className="text-[10px] text-zinc-450 font-semibold">&amp; Terpercaya</p>
              </div>
            </div>

            {/* Badge 2: Sayur Segar */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-450 shrink-0">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="leading-tight text-left">
                <p className="font-extrabold text-zinc-800 dark:text-zinc-250">Sayur &amp; Buah Segar</p>
                <p className="text-[10px] text-zinc-450 font-semibold">Bergaransi</p>
              </div>
            </div>

            {/* Badge 3: Pengiriman Cepat */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-450 shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div className="leading-tight text-left">
                <p className="font-extrabold text-zinc-800 dark:text-zinc-250">Pengiriman Cepat</p>
                <p className="text-[10px] text-zinc-450 font-semibold">1 Jam Sampai</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
