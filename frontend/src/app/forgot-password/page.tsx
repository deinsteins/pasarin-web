"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, KeyRound, Leaf, ArrowLeft, ShieldAlert } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

// Step 1: Request Zod schema
const requestSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
});

// Step 2: Reset Zod schema
const resetSchema = z
  .object({
    token: z.string().min(6, "Kode OTP minimal 6 digit").max(6, "Kode OTP maksimal 6 digit"),
    password: z.string().min(6, "Kata sandi baru minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

type RequestFormValues = z.infer<typeof requestSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testOTP, setTestOTP] = useState<string | null>(null);

  // Form hooks
  const requestForm = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { token: "", password: "", confirmPassword: "" },
  });

  // Handle Step 1: Request OTP
  const onRequestSubmit = async (values: RequestFormValues) => {
    try {
      setIsSubmitting(true);
      setFormError(null);
      setFormSuccess(null);

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Gagal mengirim kode reset. Akun tidak ditemukan.");
      } else {
        setEmail(values.email);
        setTestOTP(data.otp); // Save OTP for development test banner
        setFormSuccess("Kode OTP berhasil dikirim! Silakan periksa kotak masuk Anda.");
        setStep(2);
      }
    } catch (err) {
      setFormError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Step 2: Reset Password
  const onResetSubmit = async (values: ResetFormValues) => {
    try {
      setIsSubmitting(true);
      setFormError(null);
      setFormSuccess(null);

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token: values.token,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Kode OTP salah atau telah kedaluwarsa.");
      } else {
        setFormSuccess("Kata sandi berhasil diatur ulang! Mengalihkan ke halaman masuk...");
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

      {/* ─── Right Panel: Forgot Password Form ─── */}
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

          <Card
            title="Lupa Kata Sandi"
            subtitle={step === 1 ? "Masukkan email Anda untuk menerima kode OTP" : "Masukkan kode OTP dan kata sandi baru Anda"}
            glass={true}
          >
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

            {/* Development OTP Assist Banner */}
            {step === 2 && testOTP && (
              <div className="mb-4 flex items-center gap-2.5 rounded-soft-md border border-amber-250 bg-amber-50 p-3.5 text-xs font-medium text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-amber-600" />
                <div>
                  <span className="font-bold block">Mode Pengujian Sandbox:</span>
                  <span>Gunakan kode OTP berikut untuk reset: <strong className="text-base text-brand-secondary-600 font-mono tracking-wider ml-1">{testOTP}</strong></span>
                </div>
              </div>
            )}

            {step === 1 ? (
              /* Step 1 Form: Request OTP */
              <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
                <Input
                  {...requestForm.register("email")}
                  type="email"
                  placeholder="Alamat Email Anda"
                  icon={Mail}
                  error={requestForm.formState.errors.email?.message}
                  autoComplete="email"
                />

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full mt-2"
                >
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Kirim Kode Reset
                  </span>
                </Button>
              </form>
            ) : (
              /* Step 2 Form: Reset Password */
              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                {/* Email Display (Read-only) */}
                <Input
                  value={email}
                  disabled={true}
                  type="email"
                  icon={Mail}
                  className="bg-zinc-50 border-zinc-200 text-zinc-400 dark:bg-zinc-900/50 dark:border-zinc-805 dark:text-zinc-600 select-none cursor-not-allowed"
                />

                {/* OTP Token */}
                <Input
                  {...resetForm.register("token")}
                  type="text"
                  maxLength={6}
                  placeholder="6-Digit Kode OTP"
                  icon={KeyRound}
                  error={resetForm.formState.errors.token?.message}
                  autoComplete="one-time-code"
                />

                {/* New Password */}
                <Input
                  {...resetForm.register("password")}
                  type="password"
                  placeholder="Kata Sandi Baru"
                  icon={Lock}
                  error={resetForm.formState.errors.password?.message}
                  autoComplete="new-password"
                />

                {/* Confirm Password */}
                <Input
                  {...resetForm.register("confirmPassword")}
                  type="password"
                  placeholder="Konfirmasi Kata Sandi Baru"
                  icon={Lock}
                  error={resetForm.formState.errors.confirmPassword?.message}
                  autoComplete="new-password"
                />

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full mt-2"
                >
                  <span className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    Reset Kata Sandi
                  </span>
                </Button>
              </form>
            )}

            {/* Back link */}
            <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              <Link
                href="/login"
                className="font-bold text-brand-primary-600 hover:text-brand-primary-500 dark:text-brand-primary-400 dark:hover:text-brand-primary-300 inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Kembali ke Halaman Masuk
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
