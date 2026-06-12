"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Store,
  ArrowLeft,
  Loader2,
  Calendar,
  ClipboardList,
  User,
  MapPin,
  Phone,
  Eye,
  CheckCircle,
  Truck,
  Box,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";

// Order item type from API
interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

// Order type from API
interface Order {
  id: number;
  order_number: string;
  status: "paid" | "confirmed" | "packed" | "delivered";
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  notes: string;
  created_at: string;
  updated_at: string;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  items?: OrderItem[];
  address?: {
    id: number;
    label: string;
    recipient_name: string;
    recipient_phone: string;
    province: string;
    city: string;
    district: string;
    postal_code: string;
    address: string;
  };
}

export default function SellerOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<string>(""); // "" (Semua) | "paid" | "confirmed" | "packed" | "delivered"
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Detail Modal states
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);

      const url = `/api/seller/orders?page=${page}&limit=${limit}&status=${statusFilter}`;
      const res = await fetch(url);

      if (!res.ok) {
        setErrorStatus(res.status);
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const errData = await res.json();
        setErrorMessage(errData.error || "Gagal memuat pesanan.");
        return;
      }

      const resData = await res.json();
      setOrders(resData.data || []);
      setTotal(resData.meta?.total || 0);
      setTotalPages(resData.meta?.last_page || 1);
    } catch (err) {
      setErrorMessage("Kesalahan jaringan. Gagal memuat pesanan.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch single order details
  const fetchOrderDetail = async (orderID: number) => {
    try {
      setDetailLoading(true);
      const res = await fetch(`/api/seller/orders/${orderID}`);
      if (!res.ok) {
        setErrorMessage("Gagal memuat detail pesanan.");
        return;
      }
      const data = await res.json();
      setSelectedOrder(data);
    } catch (err) {
      console.error("Error fetching order details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchOrders();
      }
    }
  }, [user, authLoading, router, page, limit, statusFilter]);

  // Format IDR helper
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Open Details Modal
  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
    fetchOrderDetail(order.id);
  };

  // Handle Order Action (Confirm, Pack, Deliver)
  const handleOrderAction = async (orderID: number, action: "confirm" | "pack" | "deliver") => {
    try {
      setIsActionSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const res = await fetch(`/api/seller/orders/${orderID}/${action}`, {
        method: "PUT",
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || `Gagal memproses aksi ${action}.`);
      } else {
        const actionLabel =
          action === "confirm" ? "dikonfirmasi" : action === "pack" ? "dikemas" : "dikirim";
        setSuccessMessage(`Pesanan #${data.order_number || orderID} berhasil ${actionLabel}!`);
        setIsDetailOpen(false);
        fetchOrders();
      }
    } catch (err) {
      setErrorMessage("Gagal memproses aksi ke server.");
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Get status details in Indonesian
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return {
          label: "Belum Dikonfirmasi",
          className: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-450",
        };
      case "confirmed":
        return {
          label: "Dikonfirmasi",
          className: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-450",
        };
      case "packed":
        return {
          label: "Dikemas",
          className: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-450",
        };
      case "delivered":
        return {
          label: "Dikirim",
          className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450",
        };
      default:
        return {
          label: status,
          className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
        };
    }
  };

  // Table Columns Definition
  const columns = [
    {
      accessorKey: "order_number",
      header: "No. Pesanan",
      cell: (info: any) => (
        <span className="font-bold text-zinc-800 dark:text-white">
          {info.getValue()}
        </span>
      ),
    },
    {
      accessorKey: "customer.name",
      header: "Pelanggan",
      cell: (info: any) => (
        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
          {info.getValue() || "Umum"}
        </span>
      ),
    },
    {
      accessorKey: "total_amount",
      header: "Total Belanja",
      cell: (info: any) => (
        <span className="font-extrabold text-brand-secondary-600 dark:text-brand-secondary-400">
          {formatRupiah(info.getValue())}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Tanggal",
      cell: (info: any) => (
        <span className="text-zinc-500 dark:text-zinc-400 text-xs">
          {new Date(info.getValue()).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info: any) => {
        const status = info.getValue() as string;
        const details = getStatusBadge(status);
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${details.className}`}
          >
            {details.label}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Aksi Pesanan",
      cell: (info: any) => {
        const order = info.row.original as Order;
        return (
          <div className="flex items-center gap-1.5">
            {order.status === "paid" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOrderAction(order.id, "confirm")}
                className="h-8 px-2.5 text-xs bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold"
              >
                Konfirmasi
              </Button>
            )}
            {order.status === "confirmed" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOrderAction(order.id, "pack")}
                className="h-8 px-2.5 text-xs bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold"
              >
                Kemas
              </Button>
            )}
            {order.status === "packed" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOrderAction(order.id, "deliver")}
                className="h-8 px-2.5 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold"
              >
                Kirim
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenDetail(order)}
              className="h-8 w-8 p-0 flex items-center justify-center border-zinc-200 dark:border-zinc-800 text-zinc-500"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // TanStack Table Instance
  const table = useReactTable({
    data: orders,
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

  const statusTabs = [
    { value: "", label: "Semua" },
    { value: "paid", label: "Belum Dikonfirmasi" },
    { value: "confirmed", label: "Perlu Dikemas" },
    { value: "packed", label: "Siap Dikirim" },
    { value: "delivered", label: "Dikirim" },
  ];

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
              Pesanan
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

        {/* Orders Card */}
        <Card
          title="Kelola Pesanan Masuk"
          subtitle="Pantau pesanan produk pangan dari pelanggan Anda dan proses pengirimannya di sini"
          glass={false}
        >
          {/* Status Tabs */}
          <div className="flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 mb-6 gap-2 sm:gap-6 pb-px scrollbar-none">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setPage(1);
                  setStatusFilter(tab.value);
                }}
                className={`py-3 px-1 text-xs sm:text-sm font-bold uppercase tracking-wide border-b-2 whitespace-nowrap cursor-pointer transition-all ${
                  statusFilter === tab.value
                    ? "border-brand-primary-500 text-brand-primary-600 dark:text-brand-primary-400"
                    : "border-transparent text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
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
                ) : orders.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-zinc-100 hover:bg-zinc-50/30 dark:border-zinc-900 dark:hover:bg-zinc-900/10 transition-colors cursor-pointer"
                      onClick={() => handleOpenDetail(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-3 px-4 align-middle">
                          {cell.column.id === "actions" ? (
                            <div onClick={(e) => e.stopPropagation()}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          ) : (
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="py-8 text-center text-zinc-400 font-medium bg-zinc-50/20 dark:bg-zinc-900/10">
                      Belum ada pesanan masuk untuk status ini
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!loading && orders.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 border-t border-zinc-100 dark:border-zinc-900 pt-6">
              <div className="text-xs text-zinc-400 font-medium">
                Menampilkan {orders.length} dari {total} pesanan (Halaman {page} dari {totalPages})
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

      {/* ─── ORDER DETAILS MODAL ─── */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedOrder(null);
        }}
        title={`Detail Pesanan: ${selectedOrder?.order_number || ""}`}
        size="lg"
      >
        {detailLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton variant="text" className="w-1/3 h-5" />
            <Skeleton variant="text" className="w-full h-24" />
            <Skeleton variant="text" className="w-full h-32" />
          </div>
        ) : selectedOrder ? (
          <div className="space-y-5 text-sm">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-850">
              <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Dipesan pada: {new Date(selectedOrder.created_at).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                  getStatusBadge(selectedOrder.status).className
                }`}
              >
                {getStatusBadge(selectedOrder.status).label}
              </span>
            </div>

            {/* Customer & Address Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Customer */}
              <div className="p-3.5 rounded-soft-md border border-zinc-150 bg-zinc-50/20 dark:border-zinc-850 dark:bg-zinc-900/10">
                <h4 className="font-bold text-zinc-800 dark:text-white flex items-center gap-1.5 mb-2.5 text-xs uppercase tracking-wider">
                  <User className="h-4 w-4 text-brand-primary-500" />
                  Info Pelanggan
                </h4>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-zinc-750 dark:text-zinc-250">{selectedOrder.customer?.name}</p>
                  <p className="text-zinc-500">{selectedOrder.customer?.email}</p>
                </div>
              </div>

              {/* Address */}
              <div className="p-3.5 rounded-soft-md border border-zinc-150 bg-zinc-50/20 dark:border-zinc-850 dark:bg-zinc-900/10">
                <h4 className="font-bold text-zinc-800 dark:text-white flex items-center gap-1.5 mb-2.5 text-xs uppercase tracking-wider">
                  <MapPin className="h-4 w-4 text-brand-primary-500" />
                  Alamat Pengiriman
                </h4>
                {selectedOrder.address ? (
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-zinc-750 dark:text-zinc-250">
                      {selectedOrder.address.recipient_name}
                    </p>
                    <p className="text-zinc-500 flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> {selectedOrder.address.recipient_phone}
                    </p>
                    <p className="text-zinc-550 dark:text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {selectedOrder.address.address}, {selectedOrder.address.district}, {selectedOrder.address.city}, {selectedOrder.address.province} ({selectedOrder.address.postal_code})
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">Alamat tidak tersedia</p>
                )}
              </div>
            </div>

            {/* Items List */}
            <div>
              <h4 className="font-bold text-zinc-800 dark:text-white flex items-center gap-1.5 mb-3 text-xs uppercase tracking-wider">
                <Package className="h-4 w-4 text-brand-primary-500" />
                Komoditas Dipesan
              </h4>
              <div className="border border-zinc-150 dark:border-zinc-850 rounded-soft-md overflow-hidden bg-white dark:bg-zinc-950">
                <div className="divide-y divide-zinc-150 dark:divide-zinc-850">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 text-xs hover:bg-zinc-50/30">
                      <div>
                        <span className="font-bold text-zinc-800 dark:text-white block">{item.product_name}</span>
                        <span className="text-zinc-400 font-semibold">{item.quantity} x {formatRupiah(item.product_price)}</span>
                      </div>
                      <span className="font-extrabold text-zinc-800 dark:text-white">{formatRupiah(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="p-3.5 rounded-soft-md border border-zinc-150 bg-zinc-50/30 dark:border-zinc-850 dark:bg-zinc-900/10 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal Komoditas:</span>
                <span className="font-semibold">{formatRupiah(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Ongkos Kirim (Delivery):</span>
                <span className="font-semibold">{formatRupiah(selectedOrder.delivery_fee)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-extrabold text-zinc-800 dark:text-white border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-2">
                <span>Total Akhir:</span>
                <span className="text-brand-secondary-600 dark:text-brand-secondary-400 font-black text-base">
                  {formatRupiah(selectedOrder.total_amount)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="p-3.5 rounded-soft-md border border-amber-100 bg-amber-50/30 dark:border-amber-950/20 dark:bg-amber-950/10 text-xs">
                <h5 className="font-bold text-amber-800 dark:text-amber-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                  <ClipboardList className="h-4 w-4" /> Catatan Pelanggan:
                </h5>
                <p className="text-zinc-650 dark:text-zinc-350 italic">"{selectedOrder.notes}"</p>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex flex-wrap justify-between items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-850">
              <div className="flex gap-2">
                {selectedOrder.status === "paid" && (
                  <Button
                    type="button"
                    isLoading={isActionSubmitting}
                    onClick={() => handleOrderAction(selectedOrder.id, "confirm")}
                    className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold"
                  >
                    <CheckCircle className="h-4 w-4" /> Konfirmasi Pesanan
                  </Button>
                )}
                {selectedOrder.status === "confirmed" && (
                  <Button
                    type="button"
                    isLoading={isActionSubmitting}
                    onClick={() => handleOrderAction(selectedOrder.id, "pack")}
                    className="flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold"
                  >
                    <Box className="h-4 w-4" /> Kemas Pesanan
                  </Button>
                )}
                {selectedOrder.status === "packed" && (
                  <Button
                    type="button"
                    isLoading={isActionSubmitting}
                    onClick={() => handleOrderAction(selectedOrder.id, "deliver")}
                    className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold"
                  >
                    <Truck className="h-4 w-4" /> Kirim Pesanan
                  </Button>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedOrder(null);
                }}
              >
                Tutup
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
