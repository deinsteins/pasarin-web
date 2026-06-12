"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Phone, Lock, Mail, ArrowLeft, Save } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const profileSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(100),
    phone: z.string().min(10, "Nomor telepon minimal 10 digit").max(15, "Nomor telepon maksimal 15 digit"),
    password: z.string().optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password.length >= 6;
      }
      return true;
    },
    {
      message: "Kata sandi minimal 6 karakter",
      path: ["password"],
    }
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, loading: authLoading, checkSession } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isGoogleUser = user?.phone?.startsWith("google_") ?? false;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Populate form values when user details are loaded
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        setValue("name", user.name);
        // Clear google placeholder prefix so user can enter a clean phone number
        setValue("phone", isGoogleUser ? "" : (user.phone ?? ""));
      }
    }
  }, [user, authLoading, router, setValue, isGoogleUser]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setIsSubmitting(true);
      setFormError(null);
      setFormSuccess(null);

      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          password: values.password || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Gagal memperbarui profil. Silakan coba lagi.");
      } else {
        setFormSuccess("Profil berhasil diperbarui!");
        // Clear password fields
        setValue("password", "");
        setValue("confirmPassword", "");
        // Update user state
        await checkSession();
      }
    } catch (err) {
      setFormError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 py-12 px-4 dark:bg-zinc-950 sm:px-6 lg:px-8">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand-primary-500/10 blur-[120px] dark:bg-brand-primary-500/5 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-brand-secondary-500/10 blur-[120px] dark:bg-brand-secondary-500/5 pointer-events-none"></div>

      <div className="w-full max-w-[480px] z-10">
        {/* Back Link */}
        <div className="mb-5 flex justify-start">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-800 transition-colors dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Profile Card */}
        <Card
          title="Pengaturan Profil"
          subtitle="Kelola detail akun dan sandi login biasa Anda"
          glass={true}
        >
          {isGoogleUser && (
            <Alert variant="warning" className="mb-5">
              <span className="font-bold block">Selesaikan Profil Anda!</span>
              <span>Anda masuk menggunakan Google. Harap masukkan nomor telepon dan kata sandi yang valid untuk mengaktifkan login biasa.</span>
            </Alert>
          )}

          {formError && (
            <Alert variant="error" className="mb-4">
              <span>{formError}</span>
            </Alert>
          )}

          {formSuccess && (
            <Alert variant="success" className="mb-4">
              <span>{formSuccess}</span>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email (Read-only) */}
            <Input
              label="Alamat Email (Tidak dapat diubah)"
              value={user.email}
              disabled={true}
              type="email"
              icon={Mail}
              className="bg-zinc-50 border-zinc-200 text-zinc-400 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-600 select-none cursor-not-allowed"
            />

            {/* Name */}
            <Input
              {...register("name")}
              label="Nama Lengkap"
              type="text"
              placeholder="Nama Lengkap"
              icon={User}
              error={errors.name?.message}
              autoComplete="name"
            />

            {/* Phone */}
            <Input
              {...register("phone")}
              label="Nomor Telepon"
              type="tel"
              placeholder="Nomor Telepon (contoh: 08123456789)"
              icon={Phone}
              error={errors.phone?.message}
              autoComplete="tel"
            />

            {/* Password */}
            <Input
              {...register("password")}
              label="Kata Sandi Baru (Opsional)"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.password?.message}
              autoComplete="new-password"
            />

            {/* Confirm Password */}
            <Input
              {...register("confirmPassword")}
              label="Konfirmasi Kata Sandi Baru"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
            />

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full mt-4"
            >
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Simpan Perubahan
              </span>
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
