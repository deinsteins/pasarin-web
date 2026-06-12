"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Key, Shield, ArrowRight, LayoutGrid, Leaf } from "lucide-react";

export default function Home() {
  const { user, loading, logout } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 py-12 px-4 dark:bg-zinc-950 sm:px-6 lg:px-8">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 h-[600px] w-[600px] rounded-full bg-brand-primary-500/10 blur-[130px] dark:bg-brand-primary-500/5"></div>
      <div className="absolute bottom-0 left-1/4 h-[600px] w-[600px] rounded-full bg-brand-secondary-500/10 blur-[130px] dark:bg-brand-secondary-500/5"></div>

      <div className="relative z-10 w-full max-w-2xl text-center">
        {/* Logo/Branding */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-soft-md bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 text-white shadow-soft-md">
            <Leaf className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-heading">
            Pasarin
          </span>
        </div>

        <h1 className="bg-gradient-to-r from-zinc-900 via-brand-primary-800 to-zinc-950 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent dark:from-white dark:via-brand-primary-400 dark:to-zinc-400 sm:text-5xl font-heading">
          Pasaran Pangan Modern
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-zinc-500 dark:text-zinc-400 font-body">
          Menghubungkan petani, pedagang pasar tradisional, dan konsumen secara langsung untuk pangan lebih segar, murah, dan adil.
        </p>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary-600 border-t-transparent"></div>
          </div>
        ) : user ? (
          /* Logged In Dashboard Card */
          <div className="mt-12 overflow-hidden rounded-soft-lg border border-zinc-200/80 bg-white/70 p-8 shadow-soft-xl backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-900/70 text-left sm:p-10">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-6 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary-50 text-brand-primary-600 dark:bg-brand-primary-950/50 dark:text-brand-primary-400">
                  <User className="h-6 w-6 stroke-[1.5]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-heading">
                    Sesi Aktif
                  </h2>
                  <p className="text-sm text-brand-primary-600 dark:text-brand-primary-400 flex items-center gap-1.5 font-medium">
                    <span className="h-2 w-2 rounded-full bg-brand-primary-500 animate-pulse"></span>
                    Terhubung Aman
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-soft-sm border border-zinc-200 bg-white py-2 px-4 text-sm font-semibold text-zinc-700 shadow-soft-sm transition-all hover:bg-zinc-50 hover:text-red-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-red-400 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-3 gap-4 rounded-soft-md bg-zinc-50/50 p-4 dark:bg-zinc-950/40">
                <div className="col-span-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    ID
                  </span>
                  <p className="text-sm font-mono font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">
                    {user.id}
                  </p>
                </div>
                <div className="col-span-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Peran
                  </span>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 capitalize flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5 text-brand-primary-500" />
                    {user.role}
                  </p>
                </div>
                <div className="col-span-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Nama
                  </span>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 truncate">
                    {user.name}
                  </p>
                </div>
              </div>

              <div className="rounded-soft-md border border-zinc-100 bg-white/40 p-4 dark:border-zinc-800/40 dark:bg-zinc-950/20">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Alamat Email
                </span>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Unauthenticated Landing */
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <Link
              href="/login"
              className="group flex flex-col items-start rounded-soft-lg border border-zinc-200/80 bg-white/70 p-6 text-left shadow-soft-md backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-brand-primary-500/30 hover:shadow-soft-lg dark:border-zinc-800/60 dark:bg-zinc-900/70"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-soft-md bg-brand-primary-50 text-brand-primary-600 dark:bg-brand-primary-950/50 dark:text-brand-primary-400">
                <Key className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white font-heading">
                Masuk Akun
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-body">
                Masuk ke portal penjual, pembeli, petani, atau kurir Anda.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary-600 dark:text-brand-primary-400">
                Mulai Masuk <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/register"
              className="group flex flex-col items-start rounded-soft-lg border border-zinc-200/80 bg-white/70 p-6 text-left shadow-soft-md backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-brand-secondary-500/30 hover:shadow-soft-lg dark:border-zinc-800/60 dark:bg-zinc-900/70"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-soft-md bg-brand-secondary-50 text-brand-secondary-600 dark:bg-brand-secondary-950/50 dark:text-brand-secondary-400">
                <User className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white font-heading">
                Daftar Akun
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-body">
                Daftar sebagai mitra penjual, petani pemasok, atau pembeli.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-secondary-600 dark:text-brand-secondary-400">
                Gabung Sekarang <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        )}

        {/* Brand Showcase Button */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/design-system"
            className="inline-flex items-center gap-2 rounded-full border border-brand-primary-200 bg-brand-primary-50/50 px-5 py-2.5 text-xs font-semibold text-brand-primary-700 shadow-soft-sm backdrop-blur-md transition-all hover:bg-brand-primary-100/60 hover:-translate-y-0.5 dark:border-brand-primary-900/30 dark:bg-brand-primary-950/30 dark:text-brand-primary-400"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Lihat Pasarin Design System Showcase</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
