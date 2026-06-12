"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertTriangle,
  Store,
  ArrowLeft,
  Loader2,
  History,
  Sliders,
  Calendar,
  ClipboardList,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";

// Product type returned from API
interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  image_url: string;
  is_active: boolean;
  is_available: boolean;
  category: {
    id: number;
    name: string;
  };
}

// Stock History Item type
interface StockHistoryItem {
  id: number;
  product_id: number;
  type: "stock_in" | "stock_out" | "adjustment";
  quantity_before: number;
  quantity_change: number;
  quantity_after: number;
  notes: string;
  created_by: number;
  created_at: string;
}

// Zod schema for stock adjustment form
const adjustmentSchema = z.object({
  type: z.enum(["stock_in", "stock_out", "adjustment"]),
  quantity: z.coerce
    .number()
    .int("Jumlah harus berupa bilangan bulat")
    .min(1, "Jumlah penyesuaian harus lebih dari 0"),
  notes: z.string().optional().default(""),
});

type AdjustmentFormValues = z.infer<typeof adjustmentSchema>;

export default function SellerInventoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  // Pagination & Search states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stock History states
  const [historyItems, setHistoryItems] = useState<StockHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const historyLimit = 5;

  // React Hook Form for adjustment
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentSchema) as any,
    defaultValues: {
      type: "stock_in",
      quantity: 0,
      notes: "",
    },
  });

  // Fetch products lists (only seller's products)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);

      const url = `/api/seller/products?page=${page}&limit=${limit}&search=${encodeURIComponent(
        search
      )}`;
      const res = await fetch(url);

      if (!res.ok) {
        setErrorStatus(res.status);
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const errData = await res.json();
        setErrorMessage(errData.error || "Gagal memuat inventaris.");
        return;
      }

      const resData = await res.json();
      setProducts(resData.data || []);
      setTotal(resData.meta?.total || 0);
      setTotalPages(resData.meta?.last_page || 1);
    } catch (err) {
      setErrorMessage("Kesalahan jaringan. Gagal memuat inventaris.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stock history for selected product
  const fetchStockHistory = async (productID: number, targetPage = 1) => {
    try {
      setHistoryLoading(true);
      const url = `/api/seller/products/${productID}/stock-history?page=${targetPage}&limit=${historyLimit}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error("Failed to load stock history");
        return;
      }
      const resData = await res.json();
      setHistoryItems(resData.data || []);
      setHistoryTotal(resData.meta?.total || 0);
      setHistoryTotalPages(resData.meta?.last_page || 1);
      setHistoryPage(targetPage);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchProducts();
      }
    }
  }, [user, authLoading, router, page, limit, search]);

  // Handle Adjustment Modal Open
  const handleOpenAdjustment = (product: Product) => {
    setSelectedProduct(product);
    reset({
      type: "stock_in",
      quantity: 0,
      notes: "",
    });
    setIsAdjustmentOpen(true);
  };

  // Handle History Modal Open
  const handleOpenHistory = (product: Product) => {
    setSelectedProduct(product);
    setHistoryItems([]);
    setIsHistoryOpen(true);
    fetchStockHistory(product.id, 1);
  };

  // Handle Adjustment Submit
  const onAdjustmentSubmit = async (values: AdjustmentFormValues) => {
    if (!selectedProduct) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const res = await fetch(`/api/seller/products/${selectedProduct.id}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Gagal menyesuaikan stok.");
      } else {
        const typeLabel =
          values.type === "stock_in"
            ? "Stok Masuk"
            : values.type === "stock_out"
            ? "Stok Keluar"
            : "Koreksi Stok";
        setSuccessMessage(
          `Penyesuaian "${typeLabel}" untuk produk "${selectedProduct.name}" berhasil disimpan!`
        );
        setIsAdjustmentOpen(false);
        fetchProducts();
      }
    } catch (err) {
      setErrorMessage("Gagal menghubungkan ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchQuery);
  };

  // Table Columns Definition
  const columns = [
    {
      accessorKey: "image_url",
      header: "Foto",
      cell: (info: any) => (
        <div className="h-10 w-10 overflow-hidden rounded-soft-md border border-zinc-200/50 bg-zinc-50 dark:border-zinc-805 dark:bg-zinc-900 flex items-center justify-center">
          {info.getValue() ? (
            <img
              src={info.getValue()}
              alt="Foto produk"
              className="h-full w-full object-cover"
            />
          ) : (
            <Package className="h-5 w-5 text-zinc-400" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Nama Produk",
      cell: (info: any) => (
        <span className="font-bold text-zinc-800 dark:text-white line-clamp-1">
          {info.getValue()}
        </span>
      ),
    },
    {
      accessorKey: "category.name",
      header: "Kategori",
      cell: (info: any) => (
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {info.getValue() || "-"}
        </span>
      ),
    },
    {
      accessorKey: "stock",
      header: "Stok Saat Ini",
      cell: (info: any) => {
        const stock = info.getValue() as number;
        const unit = info.row.original.unit || "Unit";
        const isLow = stock <= 5;
        return (
          <div className="flex flex-col gap-0.5">
            <span
              className={`text-sm font-extrabold ${
                isLow ? "text-rose-600 dark:text-rose-455" : "text-emerald-600 dark:text-emerald-455"
              }`}
            >
              {stock} {unit}
            </span>
            {isLow && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider w-max animate-pulse">
                <AlertTriangle className="h-2.5 w-2.5" /> Stok Rendah
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: (info: any) => {
        const active = info.getValue();
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              active
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-850 dark:text-zinc-450"
            }`}
          >
            {active ? "Aktif" : "Non-aktif"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Aksi Inventaris",
      cell: (info: any) => {
        const product = info.row.original as Product;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenAdjustment(product)}
              className="flex items-center gap-1 h-8 px-2.5 text-xs text-brand-primary-700 border-brand-primary-200 hover:bg-brand-primary-50 dark:text-brand-primary-400 dark:border-brand-primary-950/40 dark:hover:bg-brand-primary-950/20"
            >
              <Sliders className="h-3.5 w-3.5" />
              Atur Stok
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenHistory(product)}
              className="flex items-center gap-1 h-8 px-2.5 text-xs text-zinc-650 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            >
              <History className="h-3.5 w-3.5" />
              Riwayat
            </Button>
          </div>
        );
      },
    },
  ];

  // TanStack Table Instance
  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (authLoading) {
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

  // Format movement change with sign (+/-)
  const formatQtyChange = (type: string, change: number) => {
    if (type === "stock_in") return `+${change}`;
    if (type === "stock_out") return `-${change}`;
    return change >= 0 ? `+${change}` : `${change}`;
  };

  const getMovementBadgeClass = (type: string) => {
    if (type === "stock_in") {
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450";
    }
    if (type === "stock_out") {
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-450";
    }
    return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-450";
  };

  const getMovementLabel = (type: string) => {
    if (type === "stock_in") return "Stok Masuk";
    if (type === "stock_out") return "Stok Keluar";
    return "Penyesuaian";
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-900 dark:bg-[#070b09] dark:text-slate-100 font-sans pb-16">
      {/* Gradients */}
      <div className="absolute top-0 right-1/4 h-[600px] w-[600px] rounded-full bg-brand-primary-500/5 blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 h-[600px] w-[600px] rounded-full bg-brand-secondary-500/5 blur-[140px] pointer-events-none"></div>

      {/* Navbar Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-800/50 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/seller/dashboard"
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
              Inventaris
            </span>
          </div>

          <div className="flex gap-2">
            <Link
              href="/seller/dashboard"
              className="rounded-soft-md border border-slate-200 bg-white py-2 px-4 text-xs font-bold text-slate-700 shadow-soft-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850 flex items-center justify-center"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Alerts */}
        {errorMessage && (
          <Alert variant="error" className="mb-5">
            <span>{errorMessage}</span>
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" className="mb-5">
            <span>{successMessage}</span>
          </Alert>
        )}

        {/* Product Inventory Card */}
        <Card
          title="Kelola Inventaris Toko"
          subtitle="Pantau persediaan pangan segar dan sesuaikan stok dengan mudah untuk menghindari kehabisan komoditas"
          glass={false}
        >
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {/* Search form */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:max-w-md">
              <div className="relative flex-grow flex items-center">
                <div className="absolute left-3 text-zinc-400 pointer-events-none">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Cari nama produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-soft-md border border-zinc-200 bg-white py-2 pl-9 pr-4 text-xs text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-transparent focus:ring-2 focus:ring-brand-primary-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>
              <Button type="submit" size="sm" className="h-9 px-4">
                Cari
              </Button>
            </form>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-zinc-150 dark:border-zinc-850 rounded-soft-md bg-white dark:bg-zinc-950 shadow-soft-sm">
            <table className="w-full min-w-[700px] border-collapse text-sm text-left">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-500 dark:text-zinc-400"
                  >
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: limit }).map((_, rIndex) => (
                    <tr key={rIndex} className="border-b border-zinc-100 dark:border-zinc-900">
                      {columns.map((_, cIndex) => (
                        <td key={cIndex} className="py-4 px-4">
                          <Skeleton variant="text" className="w-full h-4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : products.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-zinc-100 hover:bg-zinc-50/30 dark:border-zinc-900 dark:hover:bg-zinc-900/10 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-3 px-4 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="py-8 text-center text-zinc-400 font-medium bg-zinc-50/20 dark:bg-zinc-900/10">
                      Belum ada komoditas terdaftar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!loading && products.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 border-t border-zinc-100 dark:border-zinc-900 pt-6">
              <div className="text-xs text-zinc-400 font-medium">
                Menampilkan {products.length} dari {total} produk (Halaman {page} dari {totalPages})
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="h-8 w-8 p-0 flex items-center justify-center"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <Button
                      key={pNum}
                      variant={page === pNum ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setPage(pNum)}
                      className="h-8 w-8 p-0 text-xs flex items-center justify-center font-bold"
                    >
                      {pNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="h-8 w-8 p-0 flex items-center justify-center"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>

      {/* ─── ADJUST STOCK MODAL ─── */}
      <Modal
        isOpen={isAdjustmentOpen}
        onClose={() => setIsAdjustmentOpen(false)}
        title={`Atur Stok: ${selectedProduct?.name || ""}`}
        size="md"
      >
        <form onSubmit={handleSubmit(onAdjustmentSubmit)} className="space-y-4">
          <div className="space-y-3">
            {/* Info current stock */}
            <div className="flex items-center justify-between rounded-soft-md bg-zinc-50 dark:bg-zinc-900 p-3 text-xs border border-zinc-200/50 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500">
                <Package className="h-4 w-4 text-zinc-450" />
                <span>Stok saat ini:</span>
              </div>
              <strong className="text-zinc-850 dark:text-white font-extrabold text-sm">
                {selectedProduct?.stock} {selectedProduct?.unit}
              </strong>
            </div>

            {/* Adjustment Type */}
            <Select
              {...register("type")}
              label="Tipe Penyesuaian"
              options={[
                { value: "stock_in", label: "Stok Masuk (Menambahkan Stok)" },
                { value: "stock_out", label: "Stok Keluar (Mengurangi Stok)" },
                { value: "adjustment", label: "Setel Ulang Stok (Menyalin Stok Baru)" },
              ]}
              error={errors.type?.message}
            />

            {/* Quantity */}
            <Input
              {...register("quantity")}
              label="Jumlah Kuantitas"
              type="number"
              placeholder="Masukkan jumlah unit"
              error={errors.quantity?.message}
            />

            {/* Notes */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Catatan Penyesuaian
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                placeholder="Contoh: Restok pemasok mingguan, Buah busuk dibuang..."
                className="w-full rounded-soft-md border border-zinc-200 bg-white py-3 px-4 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 hover:border-zinc-300 focus:border-transparent focus:ring-2 focus:ring-brand-primary-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-850">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAdjustmentOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting} variant="primary">
              Simpan Penyesuaian
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── STOCK MOVEMENT HISTORY MODAL ─── */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title={`Riwayat Mutasi Stok: ${selectedProduct?.name || ""}`}
        size="lg"
      >
        <div className="space-y-4 py-2">
          {/* History content list */}
          {historyLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} variant="text" className="w-full h-12" />
              ))}
            </div>
          ) : historyItems.length > 0 ? (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-soft-md border border-zinc-150 bg-zinc-50/20 dark:border-zinc-850 dark:bg-zinc-900/10 hover:border-zinc-250 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    {/* Calendar / Clock Icon */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 mt-0.5">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      {/* DateTime and notes */}
                      <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 block mb-0.5">
                        {new Date(item.created_at).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      <p className="text-xs font-bold text-zinc-750 dark:text-zinc-200">
                        {item.notes || <em className="text-zinc-400">Tidak ada catatan</em>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {/* Badges and changes */}
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${getMovementBadgeClass(
                          item.type
                        )}`}
                      >
                        {getMovementLabel(item.type)}
                      </span>
                      <div className="text-xs font-extrabold text-zinc-800 dark:text-white mt-1">
                        Mutasi:{" "}
                        <span
                          className={
                            item.type === "stock_in"
                              ? "text-emerald-600 dark:text-emerald-450"
                              : item.type === "stock_out"
                              ? "text-rose-600 dark:text-rose-455"
                              : "text-zinc-850 dark:text-white"
                          }
                        >
                          {formatQtyChange(item.type, item.quantity_change)}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-medium mt-0.5">
                        Stok Akhir: {item.quantity_after} {selectedProduct?.unit}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-zinc-400 flex flex-col items-center justify-center gap-2">
              <ClipboardList className="h-10 w-10 text-zinc-350" />
              <p className="text-xs font-semibold">Belum ada riwayat mutasi stok untuk produk ini</p>
            </div>
          )}

          {/* History Pagination */}
          {!historyLoading && historyItems.length > 0 && (
            <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-850 pt-4 mt-2">
              <span className="text-[10px] text-zinc-400 font-bold">
                Total {historyTotal} riwayat
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchStockHistory(selectedProduct!.id, historyPage - 1)}
                  disabled={historyPage === 1}
                  className="h-7 w-7 p-0 flex items-center justify-center"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs font-extrabold px-2 text-zinc-700 dark:text-zinc-300">
                  {historyPage} / {historyTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchStockHistory(selectedProduct!.id, historyPage + 1)}
                  disabled={historyPage === historyTotalPages}
                  className="h-7 w-7 p-0 flex items-center justify-center"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setIsHistoryOpen(false)}>
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
