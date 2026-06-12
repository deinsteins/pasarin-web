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
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertTriangle,
  Store,
  ArrowLeft,
  X,
  Sparkles,
  Upload,
  Loader2,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";

// Category type
interface CategoryOption {
  id: number;
  name: string;
}

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

// Product Form Zod schema (matching Go validations)
const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  category_id: z.coerce.number().min(1, "Kategori wajib dipilih"),
  price: z.coerce.number().min(1, "Harga harus lebih dari 0"),
  stock: z.coerce.number().min(0, "Stok tidak boleh kurang dari 0"),
  unit: z.string().min(1, "Satuan unit wajib diisi (misal: Kg, Ikat)"),
  image_url: z.string().optional().default("").refine(
    (val) => {
      if (!val) return true;
      const u = val.toLowerCase();
      return (
        (u.startsWith("http://") || u.startsWith("https://")) &&
        (u.endsWith(".jpg") ||
          u.endsWith(".jpeg") ||
          u.endsWith(".png") ||
          u.endsWith(".webp") ||
          u.endsWith(".gif"))
      );
    },
    {
      message:
        "Format URL Gambar harus http/https dan berakhiran .jpg, .jpeg, .png, .webp, atau .gif",
    }
  ),
  description: z.string().optional().default(""),
  is_active: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function SellerProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "",
      category_id: 0,
      price: 0,
      stock: 0,
      unit: "",
      image_url: "",
      description: "",
      is_active: true,
    },
  });

  const imageUrlValue = watch("image_url");

  // Image upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file melebihi batas 5MB.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "products");

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();

      if (!res.ok) {
        setUploadError(resData.error || "Gagal mengunggah gambar.");
      } else {
        setValue("image_url", resData.url, { shouldValidate: true });
      }
    } catch (err) {
      setUploadError("Gagal menghubungi server upload.");
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch products lists
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
        setErrorMessage(errData.error || "Gagal memuat produk.");
        return;
      }

      const resData = await res.json();
      setProducts(resData.data || []);
      setTotal(resData.meta?.total || 0);
      setTotalPages(resData.meta?.last_page || 1);
    } catch (err) {
      setErrorMessage("Kesalahan jaringan. Gagal memuat produk.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for select input
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data || []);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchProducts();
        fetchCategories();
      }
    }
  }, [user, authLoading, router, page, limit, search]);

  // Format currency helper
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Open Edit Modal
  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setValue("name", product.name);
    setValue("category_id", product.category.id);
    setValue("price", product.price);
    setValue("stock", product.stock);
    setValue("unit", product.unit);
    setValue("image_url", product.image_url);
    setValue("description", product.description);
    setValue("is_active", product.is_active);
    setIsEditOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  // Handle Create Product
  const onCreateSubmit = async (values: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const res = await fetch("/api/seller/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Gagal membuat produk.");
      } else {
        setSuccessMessage(`Produk "${values.name}" berhasil dibuat!`);
        setIsCreateOpen(false);
        reset();
        fetchProducts();
      }
    } catch (err) {
      setErrorMessage("Gagal menghubungkan ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Product
  const onEditSubmit = async (values: ProductFormValues) => {
    if (!selectedProduct) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const res = await fetch(`/api/seller/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Gagal mengubah produk.");
      } else {
        setSuccessMessage(`Produk "${values.name}" berhasil diubah!`);
        setIsEditOpen(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (err) {
      setErrorMessage("Gagal menghubungkan ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Product
  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const res = await fetch(`/api/seller/products/${selectedProduct.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        setErrorMessage(errData.error || "Gagal menghapus produk.");
      } else {
        setSuccessMessage(`Produk "${selectedProduct.name}" berhasil dihapus!`);
        setIsDeleteOpen(false);
        setSelectedProduct(null);
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

  // Columns definition for TanStack Table
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
      accessorKey: "price",
      header: "Harga",
      cell: (info: any) => (
        <span className="font-extrabold text-brand-secondary-600 dark:text-brand-secondary-400">
          {formatRupiah(info.getValue())}
        </span>
      ),
    },
    {
      accessorKey: "stock",
      header: "Stok",
      cell: (info: any) => {
        const stock = info.getValue() as number;
        const isLow = stock <= 5;
        return (
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold ${
              isLow ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {isLow && <AlertTriangle className="h-3.5 w-3.5 text-rose-500 animate-pulse" />}
            {stock}
          </span>
        );
      },
    },
    {
      accessorKey: "unit",
      header: "Satuan",
      cell: (info: any) => (
        <span className="text-zinc-500 dark:text-zinc-450 text-xs font-semibold">
          {info.getValue()}
        </span>
      ),
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
      header: "Aksi",
      cell: (info: any) => {
        const product = info.row.original as Product;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenEdit(product)}
              className="p-1.5 text-zinc-400 hover:text-brand-primary-600 dark:hover:text-brand-primary-400 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleOpenDelete(product)}
              className="p-1.5 text-zinc-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
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
              Produk
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

        {/* Product List Card */}
        <Card
          title="Kelola Produk Toko"
          subtitle="Tambahkan komoditas pangan segar Anda dan atur stok harian di sini"
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

            {/* Add Product Trigger */}
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                reset();
                setIsCreateOpen(true);
              }}
              className="flex items-center gap-1.5 self-start md:self-auto h-10 px-4"
            >
              <Plus className="h-4 w-4" />
              Tambah Produk Baru
            </Button>
          </div>

          {/* TanStack Table Container */}
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
                  /* Loading skeletons rows */
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
                  /* Render products */
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
                  /* Empty state */
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

      {/* ─── CREATE PRODUCT MODAL ─── */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tambah Produk Baru"
        size="lg"
      >
        <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Product Name */}
            <Input
              {...register("name")}
              label="Nama Produk"
              type="text"
              placeholder="Sawi Hijau, Bayam Premium, dll"
              error={errors.name?.message}
            />

            {/* Category Select */}
            <Select
              {...register("category_id")}
              label="Kategori"
              options={[
                { value: "", label: "Pilih Kategori" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              error={errors.category_id?.message}
            />

            {/* Price */}
            <Input
              {...register("price")}
              label="Harga Produk (IDR)"
              type="number"
              placeholder="Harga per unit"
              error={errors.price?.message}
            />

            {/* Stock */}
            <Input
              {...register("stock")}
              label="Ketersediaan Stok"
              type="number"
              placeholder="Stok saat ini"
              error={errors.stock?.message}
            />

            {/* Unit */}
            <Input
              {...register("unit")}
              label="Satuan Unit"
              type="text"
              placeholder="Ikat, Kg, Pack, Biji, dll"
              error={errors.unit?.message}
            />

            {/* Image Upload Component */}
            <div className="flex flex-col gap-1.5 w-full sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Foto Produk (Opsional)
              </label>
              
              <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-soft-md bg-zinc-50/55 dark:bg-zinc-900/30 p-4 transition-all hover:border-brand-primary-500 min-h-[160px]">
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-zinc-400">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-primary-600" />
                    <span className="text-xs font-semibold">Mengunggah gambar...</span>
                  </div>
                ) : imageUrlValue ? (
                  <div className="relative group w-full max-w-[200px] h-[120px] rounded-soft-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
                    <img
                      src={imageUrlValue}
                      alt="Preview produk"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const fileInput = document.getElementById("create-file-input") as HTMLInputElement;
                          if (fileInput) fileInput.click();
                        }}
                        className="p-1.5 bg-white text-zinc-800 rounded-full hover:bg-zinc-150 transition-colors text-xs font-bold shadow cursor-pointer"
                      >
                        Ganti
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue("image_url", "", { shouldValidate: true })}
                        className="p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors text-xs font-bold shadow cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      const fileInput = document.getElementById("create-file-input") as HTMLInputElement;
                      if (fileInput) fileInput.click();
                    }}
                    className="flex flex-col items-center justify-center gap-1.5 cursor-pointer text-zinc-450 hover:text-brand-primary-600 w-full h-full py-4 text-center select-none"
                  >
                    <Upload className="h-6 w-6 text-zinc-450" />
                    <span className="text-xs font-bold">Pilih Foto Produk</span>
                    <span className="text-[10px] text-zinc-400">PNG, JPG, JPEG, atau WEBP (Maks. 5MB)</span>
                  </div>
                )}
                
                <input
                  id="create-file-input"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              {uploadError && (
                <p className="text-[10px] font-bold text-rose-500 mt-1">{uploadError}</p>
              )}
              {errors.image_url?.message && (
                <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.image_url.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Deskripsi Produk
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Sawi segar ditanam organik tanpa pestisida..."
              className="w-full rounded-soft-md border border-zinc-200 bg-white py-3 px-4 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 hover:border-zinc-300 focus:border-transparent focus:ring-2 focus:ring-brand-primary-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-850">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting} variant="primary">
              Simpan Produk
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── EDIT PRODUCT MODAL ─── */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedProduct(null);
        }}
        title={`Edit Produk: ${selectedProduct?.name || ""}`}
        size="lg"
      >
        <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Product Name */}
            <Input
              {...register("name")}
              label="Nama Produk"
              type="text"
              placeholder="Sawi Hijau, Bayam Premium, dll"
              error={errors.name?.message}
            />

            {/* Category Select */}
            <Select
              {...register("category_id")}
              label="Kategori"
              options={[
                { value: "", label: "Pilih Kategori" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              error={errors.category_id?.message}
            />

            {/* Price */}
            <Input
              {...register("price")}
              label="Harga Produk (IDR)"
              type="number"
              placeholder="Harga per unit"
              error={errors.price?.message}
            />

            {/* Stock */}
            <Input
              {...register("stock")}
              label="Ketersediaan Stok"
              type="number"
              placeholder="Stok saat ini"
              error={errors.stock?.message}
            />

            {/* Unit */}
            <Input
              {...register("unit")}
              label="Satuan Unit"
              type="text"
              placeholder="Ikat, Kg, Pack, Biji, dll"
              error={errors.unit?.message}
            />

            {/* Image Upload Component */}
            <div className="flex flex-col gap-1.5 w-full sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Foto Produk (Opsional)
              </label>
              
              <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-soft-md bg-zinc-50/55 dark:bg-zinc-900/30 p-4 transition-all hover:border-brand-primary-500 min-h-[160px]">
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-zinc-400">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-primary-600" />
                    <span className="text-xs font-semibold">Mengunggah gambar...</span>
                  </div>
                ) : imageUrlValue ? (
                  <div className="relative group w-full max-w-[200px] h-[120px] rounded-soft-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
                    <img
                      src={imageUrlValue}
                      alt="Preview produk"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const fileInput = document.getElementById("edit-file-input") as HTMLInputElement;
                          if (fileInput) fileInput.click();
                        }}
                        className="p-1.5 bg-white text-zinc-800 rounded-full hover:bg-zinc-150 transition-colors text-xs font-bold shadow cursor-pointer"
                      >
                        Ganti
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue("image_url", "", { shouldValidate: true })}
                        className="p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors text-xs font-bold shadow cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      const fileInput = document.getElementById("edit-file-input") as HTMLInputElement;
                      if (fileInput) fileInput.click();
                    }}
                    className="flex flex-col items-center justify-center gap-1.5 cursor-pointer text-zinc-450 hover:text-brand-primary-600 w-full h-full py-4 text-center select-none"
                  >
                    <Upload className="h-6 w-6 text-zinc-450" />
                    <span className="text-xs font-bold">Pilih Foto Produk</span>
                    <span className="text-[10px] text-zinc-400">PNG, JPG, JPEG, atau WEBP (Maks. 5MB)</span>
                  </div>
                )}
                
                <input
                  id="edit-file-input"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              {uploadError && (
                <p className="text-[10px] font-bold text-rose-500 mt-1">{uploadError}</p>
              )}
              {errors.image_url?.message && (
                <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.image_url.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Deskripsi Produk
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Sawi segar ditanam organik tanpa pestisida..."
              className="w-full rounded-soft-md border border-zinc-200 bg-white py-3 px-4 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 hover:border-zinc-300 focus:border-transparent focus:ring-2 focus:ring-brand-primary-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            />
          </div>

          {/* Status Switch (Active / Inactive) */}
          <div className="flex items-center gap-3 py-2 select-none">
            <input
              {...register("is_active")}
              id="is_active"
              type="checkbox"
              className="h-4.5 w-4.5 rounded border-zinc-300 text-brand-primary-600 focus:ring-brand-primary-500 dark:border-zinc-850 dark:bg-zinc-950 cursor-pointer"
            />
            <label htmlFor="is_active" className="text-sm font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
              Tampilkan Produk di Marketplace (Aktif)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-850">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditOpen(false);
                setSelectedProduct(null);
              }}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting} variant="primary">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── DELETE PRODUCT CONFIRMATION MODAL ─── */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedProduct(null);
        }}
        title="Hapus Produk"
        size="sm"
      >
        <div className="space-y-4 py-2 text-center sm:text-left">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-455 mx-auto sm:mx-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-zinc-800 dark:text-white">
              Apakah Anda yakin ingin menghapus produk ini?
            </h4>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 font-body leading-relaxed">
              Tindakan ini akan menghapus produk <strong>"{selectedProduct?.name}"</strong> secara permanen dari sistem Pasarin. Tindakan ini tidak dapat dibatalkan!
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2.5 mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-850">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false);
                setSelectedProduct(null);
              }}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              type="button"
              isLoading={isSubmitting}
              onClick={handleDeleteConfirm}
              className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 focus:ring-rose-500"
            >
              Hapus Produk
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
