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
  Leaf,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Divider } from "@/components/ui/Divider";
import { SocialButton } from "@/components/ui/SocialButton";

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
            <Alert variant="error" className="mb-5">
              <span>{formError}</span>
            </Alert>
          )}

          {formSuccess && (
            <Alert variant="success" className="mb-5">
              <span>{formSuccess}</span>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <Input
              {...register("name")}
              type="text"
              placeholder="Full Name"
              icon={User}
              error={errors.name?.message}
              autoComplete="name"
            />

            {/* Phone Number */}
            <Input
              {...register("phone")}
              type="tel"
              placeholder="Phone Number"
              prefixText="+62"
              prefixFlag="🇮🇩"
              error={errors.phone?.message}
              autoComplete="tel"
            />

            {/* Email */}
            <Input
              {...register("email")}
              type="email"
              placeholder="Email Address"
              icon={Mail}
              error={errors.email?.message}
              autoComplete="email"
            />

            {/* Password */}
            <Input
              {...register("password")}
              type="password"
              placeholder="Password"
              icon={Lock}
              error={errors.password?.message}
              autoComplete="new-password"
            />

            {/* Confirm Password */}
            <Input
              {...register("confirmPassword")}
              type="password"
              placeholder="Confirm Password"
              icon={Lock}
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
            />

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="mt-2 w-full"
            >
              <span className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Daftar Sekarang
              </span>
            </Button>
          </form>

          {/* Divider */}
          <Divider className="mt-6 mb-5">Atau daftar dengan</Divider>

          {/* Google OAuth Button */}
          <SocialButton provider="google">
            Google
          </SocialButton>

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
