"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ProductCard } from "@/components/ui/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Leaf,
  Search,
  Menu,
  X,
  ShoppingBag,
  Truck,
  Shield,
  Sprout,
  ChevronRight,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  User,
  LogOut,
  LayoutDashboard,
  Apple,
  Carrot,
  Beef,
  Egg,
  Fish,
  Cherry,
  Wheat,
  Bean,
} from "lucide-react";

/* ─────────────── Types ─────────────── */

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
  seller: { id: number; store_name: string };
  category: { id: number; name: string };
}

interface Category {
  id: number;
  name: string;
  slug?: string;
}

/* ─────────────── Helpers ─────────────── */

const categoryIconMap: Record<string, React.ReactNode> = {
  Sayuran: <Carrot className="h-7 w-7" />,
  Buah: <Apple className="h-7 w-7" />,
  Daging: <Beef className="h-7 w-7" />,
  Telur: <Egg className="h-7 w-7" />,
  Ikan: <Fish className="h-7 w-7" />,
  Bumbu: <Cherry className="h-7 w-7" />,
  Beras: <Wheat className="h-7 w-7" />,
  Kacang: <Bean className="h-7 w-7" />,
};

const categoryBadgeVariant: Record<string, "vegetable" | "fruit" | "organic" | "spices" | "meat"> = {
  Sayuran: "vegetable",
  Buah: "fruit",
  Daging: "meat",
  Ikan: "meat",
  Telur: "organic",
  Bumbu: "spices",
  Beras: "organic",
  Kacang: "fruit",
};

const categoryColorMap: Record<string, string> = {
  Sayuran: "from-emerald-400 to-emerald-600",
  Buah: "from-amber-400 to-amber-600",
  Daging: "from-rose-400 to-rose-600",
  Telur: "from-sky-400 to-sky-600",
  Ikan: "from-blue-400 to-blue-600",
  Bumbu: "from-red-400 to-red-600",
  Beras: "from-lime-400 to-lime-600",
  Kacang: "from-orange-400 to-orange-600",
};

/* ─────────────── Main Component ─────────────── */

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for navbar effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = () => setUserMenuOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [userMenuOpen]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Fetch featured products (top rated / first page)
  const fetchFeaturedProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch("/api/products?page=1&limit=8&sort=latest");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch featured products:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Fetch latest products
  const fetchLatestProducts = useCallback(async () => {
    try {
      setLoadingLatest(true);
      const res = await fetch("/api/products?page=1&limit=4&sort=latest");
      if (res.ok) {
        const data = await res.json();
        setLatestProducts(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch latest products:", err);
    } finally {
      setLoadingLatest(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
    fetchLatestProducts();
  }, [fetchCategories, fetchFeaturedProducts, fetchLatestProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Future: navigate to /products?search=...
    alert(`Pencarian: "${searchQuery}" — Fitur pencarian segera hadir!`);
  };

  const handleAddToCart = () => {
    alert("🛒 Fitur keranjang segera hadir!");
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* ═══════════════ NAVBAR ═══════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 shadow-soft-md backdrop-blur-xl dark:bg-zinc-900/90"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-soft-md bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 text-white shadow-soft-sm transition-transform group-hover:scale-105">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-heading">
              Pasarin
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-1 md:flex">
            <a
              href="#hero"
              className="rounded-soft-sm px-3 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-brand-primary-50 hover:text-brand-primary-700 dark:text-zinc-300 dark:hover:bg-brand-primary-950/30 dark:hover:text-brand-primary-400"
            >
              Beranda
            </a>
            <a
              href="#categories"
              className="rounded-soft-sm px-3 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-brand-primary-50 hover:text-brand-primary-700 dark:text-zinc-300 dark:hover:bg-brand-primary-950/30 dark:hover:text-brand-primary-400"
            >
              Kategori
            </a>
            <a
              href="#products"
              className="rounded-soft-sm px-3 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-brand-primary-50 hover:text-brand-primary-700 dark:text-zinc-300 dark:hover:bg-brand-primary-950/30 dark:hover:text-brand-primary-400"
            >
              Produk
            </a>
          </div>

          {/* Desktop Auth / User */}
          <div className="hidden items-center gap-3 md:flex">
            {authLoading ? (
              <Skeleton className="h-9 w-24" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1.5 pl-1.5 pr-3.5 text-sm font-semibold text-zinc-700 shadow-soft-sm transition-all hover:shadow-soft-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 cursor-pointer"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary-100 text-brand-primary-700 dark:bg-brand-primary-950 dark:text-brand-primary-400">
                    <User className="h-4 w-4" />
                  </span>
                  {user.name.split(" ")[0]}
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-soft-md border border-zinc-200 bg-white shadow-soft-lg dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in slide-in-from-top-1">
                    <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    {user.role === "seller" && (
                      <Link
                        href="/seller/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-brand-primary-50 hover:text-brand-primary-700 dark:text-zinc-300 dark:hover:bg-brand-primary-950/30 dark:hover:text-brand-primary-400"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Seller Hub
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      <User className="h-4 w-4" />
                      Profil Saya
                    </Link>
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-soft-md px-4 py-2 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="rounded-soft-md bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 px-4 py-2 text-sm font-bold text-white shadow-soft-sm transition-all hover:from-brand-primary-600 hover:to-brand-primary-700 hover:shadow-soft-md"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-soft-md text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 md:hidden cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-zinc-100 bg-white px-4 pb-5 pt-3 shadow-soft-lg dark:border-zinc-800 dark:bg-zinc-900 md:hidden">
            <div className="flex flex-col gap-1">
              <a
                href="#hero"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-soft-sm px-3 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-brand-primary-50 hover:text-brand-primary-700 dark:text-zinc-200 dark:hover:bg-brand-primary-950/30"
              >
                Beranda
              </a>
              <a
                href="#categories"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-soft-sm px-3 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-brand-primary-50 hover:text-brand-primary-700 dark:text-zinc-200 dark:hover:bg-brand-primary-950/30"
              >
                Kategori
              </a>
              <a
                href="#products"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-soft-sm px-3 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-brand-primary-50 hover:text-brand-primary-700 dark:text-zinc-200 dark:hover:bg-brand-primary-950/30"
              >
                Produk
              </a>
            </div>

            <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              {authLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : user ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary-100 text-brand-primary-700 dark:bg-brand-primary-950 dark:text-brand-primary-400">
                      <User className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-zinc-500">{user.role}</p>
                    </div>
                  </div>
                  {user.role === "seller" && (
                    <Link
                      href="/seller/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-soft-sm px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-brand-primary-50 dark:text-zinc-300 dark:hover:bg-brand-primary-950/30"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Seller Hub
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2.5 rounded-soft-sm px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-soft-md border border-zinc-200 py-2.5 text-center text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-soft-md bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 py-2.5 text-center text-sm font-bold text-white shadow-soft-sm"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section
        id="hero"
        className="relative overflow-hidden pt-16"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-600 via-brand-primary-700 to-emerald-800 dark:from-brand-primary-900 dark:via-emerald-950 dark:to-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12),_transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary-300/30 to-transparent" />

        {/* Decorative floating elements */}
        <div className="absolute top-20 left-[10%] h-48 w-48 rounded-full bg-brand-primary-400/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-[15%] h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-brand-secondary-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            {/* Pill badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-wide text-white/90 backdrop-blur-md">
              <Sprout className="h-3.5 w-3.5" />
              Marketplace Pangan Tradisional Indonesia
            </div>

            <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Belanja{" "}
              <span className="bg-gradient-to-r from-brand-secondary-300 to-brand-secondary-400 bg-clip-text text-transparent">
                Segar
              </span>{" "}
              dari Pasar Tradisional
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base text-white/70 font-body sm:text-lg">
              Menghubungkan petani, pedagang pasar tradisional, dan konsumen
              secara langsung untuk pangan lebih segar, murah, dan adil.
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="mx-auto mt-8 flex max-w-lg overflow-hidden rounded-full bg-white/95 shadow-soft-xl backdrop-blur-md dark:bg-zinc-900/95 sm:mt-10"
            >
              <div className="flex flex-1 items-center gap-2 pl-5">
                <Search className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari sayuran, buah, daging..."
                  className="w-full bg-transparent py-3.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-500"
                />
              </div>
              <button
                type="submit"
                className="m-1.5 rounded-full bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 px-6 text-sm font-bold text-white transition-all hover:from-brand-primary-600 hover:to-brand-primary-700 hover:shadow-soft-md active:scale-95 cursor-pointer"
              >
                Cari
              </button>
            </form>

            {/* Trust Badges */}
            <div className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:mt-12">
              {[
                { icon: <Sprout className="h-4 w-4" />, text: "Segar dari Pasar" },
                { icon: <ShoppingBag className="h-4 w-4" />, text: "Harga Terjangkau" },
                { icon: <Shield className="h-4 w-4" />, text: "Pedagang Terpercaya" },
              ].map((badge) => (
                <div
                  key={badge.text}
                  className="flex items-center gap-2 text-xs font-semibold text-white/60"
                >
                  <span className="text-brand-primary-300">{badge.icon}</span>
                  {badge.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-[40px] sm:h-[60px]"
            preserveAspectRatio="none"
          >
            <path
              d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 28C840 36 960 42 1080 40C1200 38 1320 28 1380 23L1440 18V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z"
              className="fill-zinc-50 dark:fill-zinc-950"
            />
          </svg>
        </div>
      </section>

      {/* ═══════════════ CATEGORIES SECTION ═══════════════ */}
      <section id="categories" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-10 text-center sm:mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary-50 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-primary-700 dark:bg-brand-primary-950/40 dark:text-brand-primary-400">
              <Leaf className="h-3 w-3" />
              Kategori
            </span>
            <h2 className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              Jelajahi Kategori Produk
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
              Temukan beragam produk pangan segar langsung dari pedagang pasar
              tradisional terpercaya.
            </p>
          </div>

          {/* Categories Grid */}
          {loadingCategories ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-3 rounded-soft-lg border border-zinc-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <Skeleton className="h-14 w-14" variant="circular" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((cat) => {
                const gradient =
                  categoryColorMap[cat.name] || "from-brand-primary-400 to-brand-primary-600";
                const icon = categoryIconMap[cat.name] || (
                  <Leaf className="h-7 w-7" />
                );

                return (
                  <button
                    key={cat.id}
                    className="group flex flex-col items-center gap-3 rounded-soft-lg border border-zinc-100 bg-white p-6 shadow-soft-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg dark:border-zinc-800 dark:bg-zinc-900 cursor-pointer"
                  >
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-soft-md bg-gradient-to-br ${gradient} text-white shadow-soft-md transition-transform duration-300 group-hover:scale-110`}
                    >
                      {icon}
                    </div>
                    <span className="text-sm font-bold text-zinc-800 dark:text-white font-heading">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-sm text-zinc-500">
              Belum ada kategori tersedia.
            </p>
          )}
        </div>
      </section>

      {/* ═══════════════ FEATURED PRODUCTS ═══════════════ */}
      <section
        id="products"
        className="bg-gradient-to-b from-zinc-50 via-white to-zinc-50 py-16 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-10 flex items-end justify-between sm:mb-12">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-secondary-50 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-secondary-700 dark:bg-brand-secondary-950/40 dark:text-brand-secondary-400">
                <Sprout className="h-3 w-3" />
                Pilihan Terbaik
              </span>
              <h2 className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                Produk Unggulan
              </h2>
            </div>
            <a
              href="#latest"
              className="hidden items-center gap-1 text-sm font-bold text-brand-primary-600 transition-colors hover:text-brand-primary-700 dark:text-brand-primary-400 sm:flex"
            >
              Lihat Semua <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          {/* Products Grid */}
          {loadingProducts ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-soft-lg border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <Skeleton className="aspect-square w-full mb-3" />
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-2/3 mb-4" />
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <div>
                      <Skeleton className="h-2.5 w-12 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-8 w-8" variant="circular" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  image={product.image_url || undefined}
                  category={product.category?.name || "Lainnya"}
                  categoryVariant={
                    categoryBadgeVariant[product.category?.name] || "vegetable"
                  }
                  location={product.seller?.store_name || "Pasarin Market"}
                  title={product.name}
                  description={product.description || "Produk segar dari pasar tradisional."}
                  price={product.price}
                  unit={`/ ${product.unit}`}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <p className="mt-4 text-sm font-semibold text-zinc-500">
                Belum ada produk tersedia.
              </p>
            </div>
          )}

          {/* Mobile "See All" */}
          <div className="mt-8 flex justify-center sm:hidden">
            <a
              href="#latest"
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary-200 bg-brand-primary-50/50 px-5 py-2.5 text-xs font-bold text-brand-primary-700 shadow-soft-sm transition-all hover:bg-brand-primary-100 dark:border-brand-primary-900/30 dark:bg-brand-primary-950/30 dark:text-brand-primary-400"
            >
              Lihat Semua Produk <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════ LATEST PRODUCTS ═══════════════ */}
      <section id="latest" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 sm:mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Leaf className="h-3 w-3" />
              Baru Ditambahkan
            </span>
            <h2 className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              Produk Terbaru
            </h2>
          </div>

          {loadingLatest ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-soft-lg border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <Skeleton className="aspect-square w-full mb-3" />
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-full mb-4" />
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-8" variant="circular" />
                  </div>
                </div>
              ))}
            </div>
          ) : latestProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {latestProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  image={product.image_url || undefined}
                  category={product.category?.name || "Lainnya"}
                  categoryVariant={
                    categoryBadgeVariant[product.category?.name] || "vegetable"
                  }
                  location={product.seller?.store_name || "Pasarin Market"}
                  title={product.name}
                  description={product.description || "Produk segar dari pasar tradisional."}
                  price={product.price}
                  unit={`/ ${product.unit}`}
                  badgeText="Baru"
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-zinc-500">
              Belum ada produk terbaru.
            </p>
          )}
        </div>
      </section>

      {/* ═══════════════ BENEFITS SECTION ═══════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-primary-600 via-brand-primary-700 to-emerald-800 py-16 dark:from-brand-primary-900 dark:via-emerald-950 dark:to-zinc-950 sm:py-20">
        {/* Decorative */}
        <div className="absolute top-10 right-[10%] h-40 w-40 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-10 left-[15%] h-56 w-56 rounded-full bg-brand-secondary-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="font-heading text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Kenapa Belanja di Pasarin?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/60">
              Kami menghubungkan Anda langsung dengan pedagang pasar tradisional
              terpercaya di seluruh Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Sprout className="h-6 w-6" />,
                title: "Segar dari Pasar",
                desc: "Produk dipilih langsung dari pedagang pasar tradisional terbaik, dijamin segar setiap hari.",
              },
              {
                icon: <ShoppingBag className="h-6 w-6" />,
                title: "Harga Terjangkau",
                desc: "Tanpa perantara berlebihan, harga lebih adil untuk pembeli dan penjual.",
              },
              {
                icon: <Truck className="h-6 w-6" />,
                title: "Pengiriman Cepat",
                desc: "Pengiriman di hari yang sama tersedia untuk area tertentu. Produk sampai dengan cepat.",
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "Pedagang Terpercaya",
                desc: "Semua pedagang telah diverifikasi. Belanja dengan aman dan nyaman.",
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="group rounded-soft-lg border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-soft-md bg-white/10 text-brand-secondary-300 transition-transform duration-300 group-hover:scale-110">
                  {benefit.icon}
                </div>
                <h3 className="font-heading text-base font-bold text-white">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-zinc-100 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-900 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-soft-md bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 text-white shadow-soft-sm">
                  <Leaf className="h-5 w-5" />
                </div>
                <span className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white font-heading">
                  Pasarin
                </span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Marketplace pangan modern yang menghubungkan petani, pedagang
                pasar tradisional, dan konsumen secara langsung.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Navigasi
              </h4>
              <ul className="space-y-2.5">
                {[
                  { href: "/", label: "Beranda" },
                  { href: "#categories", label: "Kategori" },
                  { href: "#products", label: "Produk" },
                  { href: "#", label: "Tentang Kami" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm font-medium text-zinc-600 transition-colors hover:text-brand-primary-600 dark:text-zinc-400 dark:hover:text-brand-primary-400"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Sellers */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Untuk Penjual
              </h4>
              <ul className="space-y-2.5">
                {[
                  { href: "/register", label: "Daftar Sebagai Penjual" },
                  { href: "/seller/dashboard", label: "Dashboard Penjual" },
                  { href: "/seller/products", label: "Kelola Produk" },
                  { href: "/seller/orders", label: "Kelola Pesanan" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-zinc-600 transition-colors hover:text-brand-primary-600 dark:text-zinc-400 dark:hover:text-brand-primary-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Kontak
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                  <MapPin className="h-4 w-4 shrink-0 text-brand-primary-500" />
                  Jakarta, Indonesia
                </li>
                <li className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                  <Phone className="h-4 w-4 shrink-0 text-brand-primary-500" />
                  +62 812-3456-7890
                </li>
                <li className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                  <Mail className="h-4 w-4 shrink-0 text-brand-primary-500" />
                  halo@pasarin.id
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-10 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
              © {new Date().getFullYear()} Pasarin. Hak Cipta Dilindungi. Marketplace
              Pangan Modern Indonesia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
