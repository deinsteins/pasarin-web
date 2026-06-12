"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ClipboardList,
  Calendar,
  Wallet,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  Store,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

interface DashboardData {
  total_products: number;
  total_orders: number;
  today_orders: number;
  today_revenue: number;
  monthly_revenue: number;
  low_stock_count: number;
}

export default function SellerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      setErrorMessage(null);

      const res = await fetch("/api/seller/dashboard");
      
      if (!res.ok) {
        setErrorStatus(res.status);
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const errData = await res.json();
        setErrorMessage(errData.error || "Gagal mengambil data dashboard.");
        return;
      }

      const dashboardData = await res.json();
      setData(dashboardData);
    } catch (err) {
      setErrorMessage("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchData();
      }
    }
  }, [user, authLoading, router]);

  // Format currency
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (authLoading || (!user && !errorStatus)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  // Handle 403 Forbidden - User is not a registered seller
  if (errorStatus === 403) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 py-12 px-4 dark:bg-zinc-950 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand-primary-500/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-brand-secondary-500/5 blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md z-10 text-center">
          <Card glass={true} title="Akses Ditolak" subtitle="Profil Penjual Diperlukan">
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-455">
                <Store className="h-8 w-8" />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-body leading-relaxed">
                Anda login menggunakan akun <strong>{user?.name}</strong>, namun akun Anda belum terdaftar sebagai Mitra Penjual Pasarin.
              </p>
              <div className="mt-4 flex flex-col gap-2 w-full">
                <Button variant="primary" className="w-full" onClick={() => router.push("/")}>
                  Hubungi Admin / Daftar Mitra
                </Button>
                <Link
                  href="/"
                  className="text-xs font-bold text-zinc-550 hover:text-zinc-850 dark:text-zinc-400 dark:hover:text-white mt-2 inline-block"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-900 dark:bg-[#070b09] dark:text-slate-100 font-sans">
      {/* Gradients */}
      <div className="absolute top-0 right-1/4 h-[600px] w-[600px] rounded-full bg-brand-primary-500/5 blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 h-[600px] w-[600px] rounded-full bg-brand-secondary-500/5 blur-[140px] pointer-events-none"></div>

      {/* Navbar Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-800/50 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-soft-sm transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-soft-sm bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 text-white shadow-soft-sm">
                <Store className="h-4.5 w-4.5" />
              </div>
              <span className="font-heading text-base sm:text-lg font-bold tracking-tight">Pasarin Seller Hub</span>
            </div>
            <span className="rounded-full bg-brand-primary-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-primary-700 dark:bg-brand-primary-950/40 dark:text-brand-primary-400">
              Mitra
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="h-9 px-3 flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <div className="h-9 px-3 border border-slate-200 bg-white rounded-soft-md flex items-center justify-center text-xs font-bold text-slate-700 shadow-soft-sm dark:border-slate-800 dark:bg-zinc-900 dark:text-zinc-350 select-none">
              Toko: {user?.name}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Title Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white sm:text-3xl">
              Dashboard Mitra Penjual
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 font-body">
              Pantau performa penjualan komoditas pertanian dan inventaris pasar Anda
            </p>
          </div>
        </div>

        {/* Global Error Alert */}
        {errorMessage && (
          <Alert variant="error" className="mb-6">
            <span>{errorMessage}</span>
          </Alert>
        )}

        {/* Low Stock Alert Block */}
        {!loading && data && data.low_stock_count > 0 && (
          <Alert variant="warning" className="mb-8">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0" />
              <div>
                <span className="font-bold">Peringatan Inventaris: </span>
                <span>Ada <strong>{data.low_stock_count} produk</strong> yang kehabisan atau memiliki stok menipis. Harap periksa produk di inventaris Anda dan isi ulang persediaan segera!</span>
              </div>
            </div>
          </Alert>
        )}

        {/* KPI Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          {loading ? (
            /* Skeletons Loader */
            Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} glass={false} className="p-5">
                <div className="flex items-center justify-between mb-3.5">
                  <Skeleton variant="text" className="w-24 h-4" />
                  <Skeleton variant="circular" className="w-9 h-9" />
                </div>
                <Skeleton variant="text" className="w-32 h-7 mb-1.5" />
                <Skeleton variant="text" className="w-16 h-3" />
              </Card>
            ))
          ) : data ? (
            /* KPI Cards */
            <>
              {/* Card 1: Total Products */}
              <Card glass={false} className="p-5 hover:scale-[1.01] transition-transform duration-200">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Total Produk
                  </span>
                  <span className="rounded-full bg-brand-primary-50 p-2 text-brand-primary-700 dark:bg-brand-primary-950/40 dark:text-brand-primary-400">
                    <Package className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="font-heading text-2xl font-extrabold text-slate-800 dark:text-white">
                  {data.total_products}
                </h3>
                <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                  Komoditas terdaftar
                </span>
              </Card>

              {/* Card 2: Total Orders */}
              <Card glass={false} className="p-5 hover:scale-[1.01] transition-transform duration-200">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Total Pesanan
                  </span>
                  <span className="rounded-full bg-blue-50 p-2 text-blue-700 dark:bg-blue-955/40 dark:text-blue-400">
                    <ClipboardList className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="font-heading text-2xl font-extrabold text-slate-800 dark:text-white">
                  {data.total_orders}
                </h3>
                <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                  Pesanan masuk keseluruhan
                </span>
              </Card>

              {/* Card 3: Today Orders */}
              <Card glass={false} className="p-5 hover:scale-[1.01] transition-transform duration-200">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Pesanan Hari Ini
                  </span>
                  <span className="rounded-full bg-brand-secondary-50 p-2 text-brand-secondary-700 dark:bg-brand-secondary-950/40 dark:text-brand-secondary-400">
                    <Calendar className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="font-heading text-2xl font-extrabold text-slate-800 dark:text-white">
                  {data.today_orders}
                </h3>
                <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                  Pesanan hari ini
                </span>
              </Card>

              {/* Card 4: Today Revenue */}
              <Card glass={false} className="p-5 hover:scale-[1.01] transition-transform duration-200">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Omset Hari Ini
                  </span>
                  <span className="rounded-full bg-brand-primary-50 p-2 text-brand-primary-700 dark:bg-brand-primary-950/40 dark:text-brand-primary-400">
                    <TrendingUp className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="font-heading text-xl font-extrabold text-brand-primary-600 dark:text-brand-primary-400">
                  {formatRupiah(data.today_revenue)}
                </h3>
                <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                  Pendapatan kotor hari ini
                </span>
              </Card>

              {/* Card 5: Monthly Revenue */}
              <Card glass={false} className="p-5 hover:scale-[1.01] transition-transform duration-200">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Omset Bulan Ini
                  </span>
                  <span className="rounded-full bg-brand-secondary-50 p-2 text-brand-secondary-700 dark:bg-brand-secondary-950/40 dark:text-brand-secondary-400">
                    <Wallet className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="font-heading text-xl font-extrabold text-brand-secondary-650 dark:text-brand-secondary-400">
                  {formatRupiah(data.monthly_revenue)}
                </h3>
                <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                  Pendapatan kotor bulan ini
                </span>
              </Card>
            </>
          ) : (
            <div className="col-span-5 text-center py-6 text-zinc-400 font-medium">Data kosong</div>
          )}
        </div>

        {/* Dashboard Grid Sections - placeholders for reports/charts/inventories */}
        {!loading && data && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Menu Cepat Mitra" subtitle="Akses navigasi instan toko Anda" glass={false}>
              <div className="grid grid-cols-2 gap-4 py-2">
                <div className="p-4 border border-slate-100 rounded-soft-md bg-white hover:bg-slate-50 transition-colors flex flex-col gap-1 dark:border-slate-800 dark:bg-zinc-900/50">
                  <Package className="h-6 w-6 text-brand-primary-500" />
                  <span className="text-sm font-bold text-slate-800 dark:text-white mt-1">Kelola Produk</span>
                  <span className="text-[10px] text-slate-400">Tambah & edit komoditas</span>
                </div>
                <div className="p-4 border border-slate-100 rounded-soft-md bg-white hover:bg-slate-50 transition-colors flex flex-col gap-1 dark:border-slate-800 dark:bg-zinc-900/50">
                  <ClipboardList className="h-6 w-6 text-brand-secondary-500" />
                  <span className="text-sm font-bold text-slate-800 dark:text-white mt-1">Kelola Pesanan</span>
                  <span className="text-[10px] text-slate-400">Proses & kirim pesanan</span>
                </div>
              </div>
            </Card>

            <Card title="Status Inventaris" subtitle="Daftar produk dengan stock minim" glass={false}>
              <div className="flex flex-col gap-3 py-2">
                {data.low_stock_count > 0 ? (
                  <div className="flex items-center gap-3 p-3 rounded-soft-md border border-rose-100 bg-rose-50/50 text-rose-700 dark:border-rose-950/20 dark:bg-rose-950/10">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold">Ada Produk Perlu Restock</p>
                      <p className="text-[10px] text-rose-500/80 mt-0.5">Segera sesuaikan kapasitas produk agar pelanggan tetap dapat memesan.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-soft-md border border-green-100 bg-green-50/50 text-green-700 dark:border-green-950/20 dark:bg-green-950/10">
                    <Package className="h-5 w-5 shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold">Stok Aman & Terkendali</p>
                      <p className="text-[10px] text-green-550/80 mt-0.5">Semua persediaan komoditas Anda tercukupi dengan baik.</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
