"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, LogIn } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Checkbox } from "@/components/ui/Checkbox";

const loginSchema = z.object({
  email: z.string().min(1, "Email or phone number is required").refine(
    (val) => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      const isPhone = /^\+?[0-9]{10,15}$/.test(val);
      return isEmail || isPhone;
    },
    {
      message: "Must be a valid email or phone number (10-15 digits)",
    }
  ),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
        setFormError(result.error || "Invalid email or password");
      } else {
        router.push("/");
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

      <Card title="Selamat Datang" subtitle="Masuk ke portal akun Pasarin Anda">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {formError && (
            <Alert variant="error">
              <span>{formError}</span>
            </Alert>
          )}

          <Input
            {...register("email")}
            label="Email atau No. Telepon"
            type="text"
            placeholder="nama@email.com atau 08123456789"
            icon={Mail}
            error={errors.email?.message}
            autoComplete="username"
          />

          <Input
            {...register("password")}
            label="Kata Sandi"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between text-sm">
            <Checkbox
              label="Ingat saya"
              className="text-zinc-660 dark:text-zinc-400"
            />
            <a href="#" className="font-semibold text-brand-primary-600 hover:text-brand-primary-500 dark:text-brand-primary-400 dark:hover:text-brand-primary-300">
              Lupa sandi?
            </a>
          </div>

          <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
            <span className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Masuk Sekarang
            </span>
          </Button>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-bold text-brand-primary-600 hover:text-brand-primary-500 dark:text-brand-primary-400 dark:hover:text-brand-primary-300"
            >
              Daftar disini
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
