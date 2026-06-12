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
  User,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Phone,
  Eye,
  EyeOff,
  Leaf,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(100),
    phone: z.string().min(10, "Nomor telepon minimal 10 digit").max(15, "Nomor telepon maksimal 15 digit"),
    email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
    password: z.string().min(6, "Kata sandi minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: signup, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      setFormError(null);
      setFormSuccess(null);

      const result = await signup(values.name, values.email, values.phone, values.password);

      if (!result.success) {
        setFormError(result.error || "Pendaftaran gagal. Silakan coba lagi.");
      } else {
        setFormSuccess("Akun berhasil dibuat! Mengalihkan ke halaman masuk...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
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
        {/* Green gradient overlay placeholder — the image will fill this area */}
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

          {/* Illustration placeholder — replace src with actual illustration later */}
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

      {/* ─── Right Panel: Registration Form ─── */}
      <div className="flex w-full flex-col items-center justify-center bg-[#f8f9fa] px-6 py-10 lg:w-[48%] lg:px-16 xl:px-24 dark:bg-zinc-950">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo (only visible on small screens) */}
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-soft-sm bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 text-white shadow-soft-sm">
              <Leaf className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white font-heading">
              Pasarin
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              Pendaftaran Pasarin
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 font-body">
              Bergabungkah dengan Ribuan Penjual &amp; Pembeli!
            </p>
          </div>

          {/* Alerts */}
          {formError && (
            <div className="mb-5 flex items-center gap-2.5 rounded-soft-md border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="mb-5 flex items-center gap-2.5 rounded-soft-md border border-green-200 bg-green-50 p-3.5 text-sm font-medium text-green-700 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-400">
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
                  <User className="h-[18px] w-[18px] stroke-[1.75]" />
                </div>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="Full Name"
                  autoComplete="name"
                  className={`w-full rounded-soft-md border bg-white py-3 pl-11 pr-4 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 hover:border-zinc-300 focus:border-transparent focus:ring-2 focus:ring-brand-primary-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:hover:border-zinc-700 dark:focus:ring-brand-primary-600 ${
                    errors.name ? "border-red-400 focus:ring-red-400" : "border-zinc-200"
                  }`}
                />
              </div>
              {errors.name && (
                <span className="mt-1 block pl-1 text-xs font-semibold text-red-500">{errors.name.message}</span>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1.5 text-zinc-500 pointer-events-none text-sm font-medium">
                  <span className="text-base leading-none">🇮🇩</span>
                  <span className="text-xs font-semibold text-zinc-400">+62</span>
                </div>
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="Phone Number"
                  autoComplete="tel"
                  className={`w-full rounded-soft-md border bg-white py-3 pl-[4.5rem] pr-4 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 hover:border-zinc-300 focus:border-transparent focus:ring-2 focus:ring-brand-primary-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:hover:border-zinc-700 dark:focus:ring-brand-primary-600 ${
                    errors.phone ? "border-red-400 focus:ring-red-400" : "border-zinc-200"
                  }`}
                />
              </div>
              {errors.phone && (
                <span className="mt-1 block pl-1 text-xs font-semibold text-red-500">{errors.phone.message}</span>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
                  <Mail className="h-[18px] w-[18px] stroke-[1.75]" />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Email Address"
                  autoComplete="email"
                  className={`w-full rounded-soft-md border bg-white py-3 pl-11 pr-4 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 hover:border-zinc-300 focus:border-transparent focus:ring-2 focus:ring-brand-primary-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:hover:border-zinc-700 dark:focus:ring-brand-primary-600 ${
                    errors.email ? "border-red-400 focus:ring-red-400" : "border-zinc-200"
                  }`}
                />
              </div>
              {errors.email && (
                <span className="mt-1 block pl-1 text-xs font-semibold text-red-500">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
                  <Lock className="h-[18px] w-[18px] stroke-[1.75]" />
                </div>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="new-password"
                  className={`w-full rounded-soft-md border bg-white py-3 pl-11 pr-12 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 hover:border-zinc-300 focus:border-transparent focus:ring-2 focus:ring-brand-primary-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:hover:border-zinc-700 dark:focus:ring-brand-primary-600 ${
                    errors.password ? "border-red-400 focus:ring-red-400" : "border-zinc-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px] stroke-[1.75]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px] stroke-[1.75]" />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="mt-1 block pl-1 text-xs font-semibold text-red-500">{errors.password.message}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
                  <Lock className="h-[18px] w-[18px] stroke-[1.75]" />
                </div>
                <input
                  {...register("confirmPassword")}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  className={`w-full rounded-soft-md border bg-white py-3 pl-11 pr-12 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 hover:border-zinc-300 focus:border-transparent focus:ring-2 focus:ring-brand-primary-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:hover:border-zinc-700 dark:focus:ring-brand-primary-600 ${
                    errors.confirmPassword ? "border-red-400 focus:ring-red-400" : "border-zinc-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {showConfirm ? (
                    <EyeOff className="h-[18px] w-[18px] stroke-[1.75]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px] stroke-[1.75]" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="mt-1 block pl-1 text-xs font-semibold text-red-500">{errors.confirmPassword.message}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative mt-2 flex w-full items-center justify-center rounded-soft-md bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 py-3.5 px-4 text-sm font-bold text-white shadow-soft-md transition-all duration-200 hover:from-brand-primary-600 hover:to-brand-primary-700 hover:shadow-soft-lg active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:ring-offset-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Memproses...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Daftar Sekarang
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mt-6 mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-zinc-400 dark:bg-zinc-950 dark:text-zinc-500 font-medium">
                Atau daftar dengan
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2.5 rounded-soft-md border border-zinc-200 bg-white py-3 px-4 text-sm font-semibold text-zinc-700 shadow-soft-sm transition-all duration-200 hover:bg-zinc-50 hover:shadow-soft-md active:scale-[0.98] cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Google</span>
          </button>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-bold text-brand-primary-600 hover:text-brand-primary-500 dark:text-brand-primary-400 dark:hover:text-brand-primary-300"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
