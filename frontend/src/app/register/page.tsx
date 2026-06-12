"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, User, UserPlus, AlertCircle, CheckCircle } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
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

      const result = await signup(values.name, values.email, values.password);

      if (!result.success) {
        setFormError(result.error || "Registration failed. Please try again.");
      } else {
        setFormSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 py-12 px-4 dark:bg-zinc-950 sm:px-6 lg:px-8">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand-primary-500/10 blur-[120px] dark:bg-brand-primary-500/5"></div>
      <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-brand-secondary-500/10 blur-[120px] dark:bg-brand-secondary-500/5"></div>

      <AuthCard title="Daftar Akun" subtitle="Bergabung dengan ekosistem marketplace pangan Pasarin">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {formError && (
            <div className="flex items-center gap-2.5 rounded-soft-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="flex items-center gap-2.5 rounded-soft-md border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-400">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <AuthInput
            {...register("name")}
            label="Nama Lengkap"
            type="text"
            placeholder="Budi Santoso"
            icon={User}
            error={errors.name?.message}
            autoComplete="name"
          />

          <AuthInput
            {...register("email")}
            label="Alamat Email"
            type="email"
            placeholder="nama@email.com"
            icon={Mail}
            error={errors.email?.message}
            autoComplete="email"
          />

          <AuthInput
            {...register("password")}
            label="Kata Sandi"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            autoComplete="new-password"
          />

          <AuthInput
            {...register("confirmPassword")}
            label="Konfirmasi Kata Sandi"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
          />

          <AuthButton type="submit" isLoading={isSubmitting} className="mt-2">
            <span className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Daftar Sekarang
            </span>
          </AuthButton>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
            Sudah memiliki akun?{" "}
            <Link
              href="/login"
              className="font-bold text-brand-primary-600 hover:text-brand-primary-500 dark:text-brand-primary-400 dark:hover:text-brand-primary-300"
            >
              Masuk disini
            </Link>
          </p>
        </form>
      </AuthCard>
    </div>
  );
}
