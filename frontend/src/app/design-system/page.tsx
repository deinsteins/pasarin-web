"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Leaf,
  ShoppingBag,
  Star,
  Plus,
  TrendingUp,
  User,
  Users,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  Info,
  DollarSign
} from "lucide-react";

export default function DesignSystemPage() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"colors" | "typography" | "components" | "cards" | "preview">("colors");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1500);
  };

  const colors = {
    primary: [
      { name: "Green 50", hex: "#f0fdf4", class: "bg-brand-primary-50 text-brand-primary-700" },
      { name: "Green 100", hex: "#dcfce7", class: "bg-brand-primary-100 text-brand-primary-800" },
      { name: "Green 300", hex: "#86efac", class: "bg-brand-primary-300 text-brand-primary-900" },
      { name: "Green 500", hex: "#22c55e", class: "bg-brand-primary-500 text-white" },
      { name: "Green 700", hex: "#15803d", class: "bg-brand-primary-700 text-white" },
      { name: "Green 900", hex: "#14532d", class: "bg-brand-primary-900 text-white" },
    ],
    secondary: [
      { name: "Orange 50", hex: "#fff7ed", class: "bg-brand-secondary-50 text-brand-secondary-700" },
      { name: "Orange 100", hex: "#ffedd5", class: "bg-brand-secondary-100 text-brand-secondary-800" },
      { name: "Orange 300", hex: "#fdba74", class: "bg-brand-secondary-300 text-brand-secondary-900" },
      { name: "Orange 500", hex: "#f97316", class: "bg-brand-secondary-500 text-white" },
      { name: "Orange 700", hex: "#c2410c", class: "bg-brand-secondary-700 text-white" },
      { name: "Orange 900", hex: "#7c2d12", class: "bg-brand-secondary-900 text-white" },
    ],
    categories: [
      { name: "Sayuran (Vegetables)", hex: "#22c55e", class: "bg-emerald-500 text-white", label: "Fresh Green" },
      { name: "Buah (Fruits)", hex: "#f59e0b", class: "bg-amber-500 text-white", label: "Harvest Amber" },
      { name: "Organik (Organic)", hex: "#10b981", class: "bg-teal-500 text-white", label: "Eco Teal" },
      { name: "Bumbu & Sembako", hex: "#ef4444", class: "bg-rose-500 text-white", label: "Warm Crimson" },
      { name: "Daging & Ikan", hex: "#3b82f6", class: "bg-blue-500 text-white", label: "Ocean Blue" },
    ],
    neutrals: [
      { name: "Gray 50", hex: "#f8fafc", class: "bg-slate-50 text-slate-600 border border-slate-200/50" },
      { name: "Gray 100", hex: "#f1f5f9", class: "bg-slate-100 text-slate-700" },
      { name: "Gray 300", hex: "#cbd5e1", class: "bg-slate-300 text-slate-800" },
      { name: "Gray 500", hex: "#64748b", class: "bg-slate-500 text-white" },
      { name: "Gray 700", hex: "#334155", class: "bg-slate-700 text-white" },
      { name: "Gray 900", hex: "#0f172a", class: "bg-slate-900 text-white" },
    ]
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-900 antialiased selection:bg-brand-primary-100 selection:text-brand-primary-900 dark:bg-[#070b09] dark:text-slate-100">
      
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 h-[800px] w-[800px] rounded-full bg-brand-primary-500/5 blur-[160px] pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/4 h-[800px] w-[800px] rounded-full bg-brand-secondary-500/5 blur-[160px] pointer-events-none"></div>

      {/* Navigation Header */}
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
                <Leaf className="h-4.5 w-4.5" />
              </div>
              <span className="font-heading text-lg font-bold tracking-tight">Pasarin UI System</span>
            </div>
            <span className="rounded-full bg-brand-primary-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-primary-700 dark:bg-brand-primary-950/40 dark:text-brand-primary-400">
              v1.0.0 Alpha
            </span>
          </div>

          <div className="flex gap-2">
            <Link
              href="/login"
              className="rounded-soft-md border border-slate-200 bg-white py-2 px-4 text-xs font-bold text-slate-700 shadow-soft-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
            >
              Portal Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-soft-md bg-brand-primary-500 py-2 px-4 text-xs font-bold text-white shadow-soft-md hover:bg-brand-primary-600 transition-colors"
            >
              Daftar Akun
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-soft-xl border border-brand-primary-100 bg-gradient-to-br from-brand-primary-50/60 via-white to-brand-secondary-50/30 p-8 shadow-soft-md dark:border-brand-primary-900/20 dark:from-brand-primary-950/20 dark:via-zinc-950 dark:to-brand-secondary-950/10 md:p-12 mb-10">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-secondary-100/60 px-3.5 py-1 text-xs font-semibold text-brand-secondary-800 dark:bg-brand-secondary-950/40 dark:text-brand-secondary-400 mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Identity & Design System Showcase</span>
            </div>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-5xl">
              Pasarin Brand System
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-body">
              Panduan identitas visual dan token UI untuk marketplace pangan tradisional Indonesia. 
              Pendekatan desain yang ramah, hangat, dan terpercaya bagi petani & pedagang, 
              namun tetap modern, berdaya saing, dan berestetika premium untuk konsumen digital.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 hidden w-1/3 opacity-10 dark:opacity-20 md:block">
            <Layers className="h-full w-full stroke-[1] text-brand-primary-600" />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-1 sm:gap-2">
          {[
            { id: "colors", label: "Warna (Color Palettes)" },
            { id: "typography", label: "Tipografi (Typography)" },
            { id: "components", label: "Komponen (Buttons & Forms)" },
            { id: "cards", label: "Elemen Soft UI & Cards" },
            { id: "preview", label: "Live UI Dashboard Preview" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3.5 pt-2 px-3 text-xs sm:text-sm font-bold tracking-tight transition-all relative cursor-pointer ${
                activeTab === tab.id
                  ? "text-brand-primary-600 dark:text-brand-primary-400 font-extrabold border-b-2 border-brand-primary-500"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: COLORS */}
        {activeTab === "colors" && (
          <div className="space-y-10 animate-fadeIn duration-200">
            {/* Intro */}
            <div>
              <h2 className="font-heading text-xl font-bold mb-2">Palet Warna Utama & Pendukung</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Klik warna untuk menyalin kode hex langsung ke clipboard.
              </p>
            </div>

            {/* Colors Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Primary Green */}
              <div className="rounded-soft-lg border border-slate-200/60 bg-white p-6 shadow-soft-md dark:border-slate-800/60 dark:bg-zinc-900">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-heading text-sm font-extrabold flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-brand-primary-500"></span>
                    Primary Brand Color (Vibrant Green)
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">#22c55e</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {colors.primary.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => copyToClipboard(c.hex)}
                      className={`group relative flex flex-col justify-between rounded-soft-md p-3 text-left h-24 shadow-soft-sm transition-all hover:scale-[1.02] cursor-pointer ${c.class}`}
                    >
                      <span className="text-[11px] font-extrabold tracking-tight">{c.name}</span>
                      <span className="text-[10px] font-mono opacity-80 flex items-center gap-1">
                        {copiedText === c.hex ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        {c.hex}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Orange */}
              <div className="rounded-soft-lg border border-slate-200/60 bg-white p-6 shadow-soft-md dark:border-slate-800/60 dark:bg-zinc-900">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-heading text-sm font-extrabold flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-brand-secondary-500"></span>
                    Secondary Accent Color (Warm Orange)
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">#f97316</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {colors.secondary.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => copyToClipboard(c.hex)}
                      className={`group relative flex flex-col justify-between rounded-soft-md p-3 text-left h-24 shadow-soft-sm transition-all hover:scale-[1.02] cursor-pointer ${c.class}`}
                    >
                      <span className="text-[11px] font-extrabold tracking-tight">{c.name}</span>
                      <span className="text-[10px] font-mono opacity-80 flex items-center gap-1">
                        {copiedText === c.hex ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        {c.hex}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Marketplace Category Colors */}
            <div className="rounded-soft-lg border border-slate-200/60 bg-white p-6 shadow-soft-md dark:border-slate-800/60 dark:bg-zinc-900">
              <h3 className="font-heading text-sm font-extrabold mb-4 flex items-center gap-2">
                <Layers className="h-4 w-4 text-brand-primary-500" />
                Marketplace Category Coding (Sistem Klasifikasi Produk)
              </h3>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
                {colors.categories.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => copyToClipboard(c.hex)}
                    className={`group relative flex flex-col justify-between rounded-soft-md p-3.5 text-left h-28 shadow-soft-sm transition-all hover:scale-[1.02] cursor-pointer ${c.class}`}
                  >
                    <div>
                      <span className="text-xs font-extrabold tracking-tight block">{c.name}</span>
                      <span className="text-[9px] opacity-75 font-semibold block mt-0.5">{c.label}</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-90 flex items-center gap-1 mt-4">
                      {copiedText === c.hex ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      {c.hex}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Neutrals */}
            <div className="rounded-soft-lg border border-slate-200/60 bg-white p-6 shadow-soft-md dark:border-slate-800/60 dark:bg-zinc-900">
              <h3 className="font-heading text-sm font-extrabold mb-4">Neutral Palette (Tona Abu-abu & Background)</h3>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-6">
                {colors.neutrals.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => copyToClipboard(c.hex)}
                    className={`group relative flex flex-col justify-between rounded-soft-md p-3 text-left h-24 shadow-soft-sm transition-all hover:scale-[1.02] cursor-pointer ${c.class}`}
                  >
                    <span className="text-[11px] font-extrabold tracking-tight">{c.name}</span>
                    <span className="text-[10px] font-mono opacity-80 flex items-center gap-1">
                      {copiedText === c.hex ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      {c.hex}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TYPOGRAPHY */}
        {activeTab === "typography" && (
          <div className="space-y-8 animate-fadeIn duration-200">
            <div>
              <h2 className="font-heading text-xl font-bold mb-2">Sistem Tipografi</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Kami menggabungkan <span className="font-extrabold text-brand-primary-600">Plus Jakarta Sans</span> (untuk heading/judul) dan <span className="font-extrabold text-brand-primary-600">Inter</span> (untuk body text/keterangan) guna menciptakan keterbacaan tinggi.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Typeface Showcase */}
              <div className="lg:col-span-1 rounded-soft-lg border border-slate-200/60 bg-white p-6 shadow-soft-md dark:border-slate-800/60 dark:bg-zinc-900 space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Heading Font</span>
                  <span className="font-heading text-2xl font-extrabold block text-brand-primary-600">Plus Jakarta Sans</span>
                  <p className="text-xs text-slate-400 mt-1">Digunakan untuk: Headings, Hero titles, Card titles, dan Badges.</p>
                  <p className="font-heading text-5xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 mt-4">Aa Bb Cc 123</p>
                </div>
                <hr className="border-slate-100 dark:border-slate-800" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Body Font</span>
                  <span className="font-body text-2xl font-extrabold block text-brand-secondary-600">Inter</span>
                  <p className="text-xs text-slate-400 mt-1">Digunakan untuk: Body text, Form inputs, List, dan Labels.</p>
                  <p className="font-body text-5xl font-medium text-slate-800 dark:text-slate-100 mt-4">Aa Bb Cc 123</p>
                </div>
              </div>

              {/* Typography Scale */}
              <div className="lg:col-span-2 rounded-soft-lg border border-slate-200/60 bg-white p-6 shadow-soft-md dark:border-slate-800/60 dark:bg-zinc-900">
                <h3 className="font-heading text-sm font-extrabold mb-6">Skala Ukuran Huruf (Font Size Scale)</h3>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="w-40 shrink-0">
                      <span className="text-xs font-bold text-slate-400">Display (H1)</span>
                      <span className="block text-[10px] font-mono text-slate-400 mt-0.5">Plus Jakarta Sans • 36px • Bold</span>
                    </div>
                    <h1 className="font-heading text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex-1">
                      Pasar Pangan Tradisional
                    </h1>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="w-40 shrink-0">
                      <span className="text-xs font-bold text-slate-400">Section Header (H2)</span>
                      <span className="block text-[10px] font-mono text-slate-400 mt-0.5">Plus Jakarta Sans • 24px • Bold</span>
                    </div>
                    <h2 className="font-heading text-xl font-bold text-slate-800 dark:text-white flex-1">
                      Sayuran Segar Hari Ini
                    </h2>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="w-40 shrink-0">
                      <span className="text-xs font-bold text-slate-400">Card Title (H3)</span>
                      <span className="block text-[10px] font-mono text-slate-400 mt-0.5">Plus Jakarta Sans • 18px • Bold</span>
                    </div>
                    <h3 className="font-heading text-sm font-bold text-slate-800 dark:text-white flex-1">
                      Bayam Organik Pack
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="w-40 shrink-0">
                      <span className="text-xs font-bold text-slate-400">Body Large (P)</span>
                      <span className="block text-[10px] font-mono text-slate-400 mt-0.5">Inter • 15px • Regular</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed flex-1">
                      Menghubungkan langsung pembeli dengan para petani lokal yang memanen sayurnya hari ini.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="w-40 shrink-0">
                      <span className="text-xs font-bold text-slate-400">Body Small</span>
                      <span className="block text-[10px] font-mono text-slate-400 mt-0.5">Inter • 13px • Medium</span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex-1">
                      Pengiriman instan 2 jam sampai ke lokasi Anda dari pasar terdekat.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="w-40 shrink-0">
                      <span className="text-xs font-bold text-slate-400">Overline / Micro</span>
                      <span className="block text-[10px] font-mono text-slate-400 mt-0.5">Inter • 11px • Bold • Upper</span>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-secondary-600 flex-1">
                      PRODUK PILIHAN MITRA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COMPONENTS */}
        {activeTab === "components" && (
          <div className="space-y-8 animate-fadeIn duration-200">
            <div>
              <h2 className="font-heading text-xl font-bold mb-2">Tombol & Input Form</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Komponen interaktif utama dengan visual states lengkap.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Button System */}
              <div className="rounded-soft-lg border border-slate-200/60 bg-white p-6 shadow-soft-md dark:border-slate-800/60 dark:bg-zinc-900 space-y-6">
                <h3 className="font-heading text-sm font-extrabold flex items-center gap-1">
                  Tombol (Buttons)
                </h3>
                
                <div className="space-y-4">
                  {/* Primary */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Primary Green Gradient</span>
                    <button className="flex w-full items-center justify-center rounded-soft-md bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 py-3 px-4 text-xs font-extrabold text-white shadow-soft-md transition-all hover:from-brand-primary-600 hover:to-brand-primary-700 hover:shadow-soft-lg active:scale-[0.98] cursor-pointer">
                      Tombol Utama (Green)
                    </button>
                  </div>

                  {/* Secondary */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Secondary Orange Accent</span>
                    <button className="flex w-full items-center justify-center rounded-soft-md bg-gradient-to-r from-brand-secondary-500 to-brand-secondary-600 py-3 px-4 text-xs font-extrabold text-white shadow-soft-md transition-all hover:from-brand-secondary-600 hover:to-brand-secondary-700 hover:shadow-soft-lg active:scale-[0.98] cursor-pointer">
                      Tombol Aksi Utama (Orange)
                    </button>
                  </div>

                  {/* Ghost/Outline */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Outline</span>
                      <button className="flex w-full items-center justify-center rounded-soft-md border border-slate-200 bg-white py-2.5 px-4 text-xs font-bold text-slate-700 shadow-soft-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-zinc-950 dark:text-zinc-350 dark:hover:bg-zinc-900 cursor-pointer">
                        Outline Button
                      </button>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Soft Colored Pill</span>
                      <button className="flex w-full items-center justify-center rounded-full bg-brand-primary-50 py-2.5 px-4 text-xs font-extrabold text-brand-primary-700 hover:bg-brand-primary-100 transition-colors cursor-pointer dark:bg-brand-primary-950/40 dark:text-brand-primary-400 dark:hover:bg-brand-primary-950/60">
                        Pill Button
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="rounded-soft-lg border border-slate-200/60 bg-white p-6 shadow-soft-md dark:border-slate-800/60 dark:bg-zinc-900 space-y-6">
                <h3 className="font-heading text-sm font-extrabold">Form Fields & Inputs</h3>

                <div className="space-y-4">
                  {/* Default State */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Label Input (Default State)
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                        <ShoppingBag className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="text"
                        placeholder="Cari sayur bayam, brokoli, cabai..."
                        className="w-full rounded-soft-md border border-slate-200 bg-white py-3 pl-11 pr-4 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-355 focus:ring-2 focus:ring-brand-primary-500 dark:border-slate-800 dark:bg-zinc-950 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Focus State with Orange Accent */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Label Input (Focus Orange State)
                    </label>
                    <input
                      type="text"
                      defaultValue="Fokus input dengan aksen orange secondary"
                      className="w-full rounded-soft-md border-transparent bg-white py-3 px-4 text-xs text-slate-800 outline-none ring-2 ring-brand-secondary-500 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>

                  {/* Error State */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Alamat Email Pembeli
                      </label>
                      <span className="text-[10px] font-semibold text-rose-500">Format email tidak valid</span>
                    </div>
                    <input
                      type="email"
                      defaultValue="budi.santoso@salah"
                      className="w-full rounded-soft-md border border-rose-400 bg-white py-3 px-4 text-xs text-slate-800 outline-none ring-2 ring-rose-100 dark:border-rose-900/60 dark:bg-zinc-950 dark:text-white dark:ring-rose-950/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CARDS */}
        {activeTab === "cards" && (
          <div className="space-y-8 animate-fadeIn duration-200">
            <div>
              <h2 className="font-heading text-xl font-bold mb-2">Sistem Card, Shadow, & Border Radius</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Penerapan Soft UI, Glassmorphism, dan Border Radius berukuran besar untuk nuansa modern dan ramah konsumen.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Product Card Showcase */}
              <div className="rounded-soft-lg border border-slate-200/60 bg-white p-4 shadow-soft-md dark:border-slate-850 dark:bg-zinc-900 flex flex-col justify-between">
                <div>
                  {/* Image Placeholder */}
                  <div className="relative aspect-square w-full rounded-soft-md bg-gradient-to-tr from-brand-primary-50 to-brand-primary-100/50 dark:from-brand-primary-950/10 dark:to-brand-primary-900/10 flex items-center justify-center overflow-hidden mb-3">
                    <Leaf className="h-14 w-14 text-brand-primary-500 stroke-[1.25]" />
                    <span className="absolute top-2 left-2 rounded-full bg-brand-primary-500 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
                      Panen Hari Ini
                    </span>
                    <span className="absolute top-2 right-2 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold text-slate-700 shadow-soft-sm backdrop-blur-md dark:bg-zinc-900/95 dark:text-zinc-300">
                      ★ 4.8 (24)
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex gap-1.5 items-center mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary-700 bg-brand-primary-50 px-2 py-0.5 rounded-full dark:bg-brand-primary-950/30 dark:text-brand-primary-400">
                      Sayuran
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">Pasar Rawamangun</span>
                  </div>

                  {/* Title */}
                  <h4 className="font-heading text-base font-bold text-slate-800 dark:text-white line-clamp-1">
                    Bayam Hijau Organik Premium
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-body mt-1">
                    Dipanen pagi oleh Petani Pak Karjo, segar tanpa pestisida.
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Harga / Ikat</span>
                    <span className="font-heading text-sm font-extrabold text-brand-secondary-600">Rp 4.500</span>
                  </div>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary-500 text-white shadow-soft-md hover:bg-brand-primary-600 transition-transform active:scale-90 cursor-pointer">
                    <Plus className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Glassmorphic Analytics Card */}
              <div className="rounded-soft-lg border border-brand-primary-200/40 bg-white/60 p-6 shadow-soft-lg backdrop-blur-lg dark:border-brand-primary-800/20 dark:bg-zinc-900/60 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="rounded-full bg-brand-secondary-50 p-2.5 text-brand-secondary-600 dark:bg-brand-secondary-950/40 dark:text-brand-secondary-400">
                      <TrendingUp className="h-5 w-5" />
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded dark:bg-zinc-800 dark:text-zinc-400">
                      LIVE DATA
                    </span>
                  </div>
                  
                  <span className="text-xs text-slate-400 font-bold uppercase block tracking-wider">
                    Total Transaksi Mitra (Hari ini)
                  </span>
                  <h3 className="font-heading text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
                    Rp 3.820.000
                  </h3>
                  
                  <p className="mt-2 text-xs text-brand-primary-600 dark:text-brand-primary-400 flex items-center gap-1 font-semibold">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-primary-500 animate-ping"></span>
                    +12.4% peningkatan dibanding kemarin
                  </p>
                </div>

                <div className="mt-6 space-y-2.5">
                  <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Sayuran Terjual</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">142 Ikat</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Mitra Aktif Kirim</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">8 Petani</span>
                  </div>
                </div>
              </div>

              {/* Shadow and Radius Guidelines */}
              <div className="rounded-soft-lg border border-slate-200/60 bg-white p-6 shadow-soft-md dark:border-slate-850 dark:bg-zinc-900 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-heading text-sm font-extrabold mb-3 flex items-center gap-2">
                    <Info className="h-4.5 w-4.5 text-brand-secondary-500" />
                    Sistem Sudut & Bayangan
                  </h3>
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-slate-100 rounded-soft-sm flex items-center justify-center text-[10px] font-bold text-slate-400 dark:bg-zinc-800">
                        8px
                      </div>
                      <div className="text-xs">
                        <span className="font-bold block text-slate-700 dark:text-zinc-300">Radius Soft SM</span>
                        <span className="text-slate-400 block mt-0.5">Digunakan pada: Tombol & input kecil</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-slate-100 rounded-soft-md flex items-center justify-center text-[10px] font-bold text-slate-400 dark:bg-zinc-800">
                        12px
                      </div>
                      <div className="text-xs">
                        <span className="font-bold block text-slate-700 dark:text-zinc-300">Radius Soft MD</span>
                        <span className="text-slate-400 block mt-0.5">Digunakan pada: Product cards & badge kategori</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-slate-100 rounded-soft-lg flex items-center justify-center text-[10px] font-bold text-slate-400 dark:bg-zinc-800">
                        16px
                      </div>
                      <div className="text-xs">
                        <span className="font-bold block text-slate-700 dark:text-zinc-300">Radius Soft LG</span>
                        <span className="text-slate-400 block mt-0.5">Digunakan pada: Modal pop-ups & dashboard layouts</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-3 rounded-soft-md dark:bg-zinc-800/40">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wide">
                    Aturan Bayangan (Shadows)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1 leading-relaxed">
                    Kami menghindari bayangan solid/hitam tebal. Bayangan memakai tona biru-slate redup dengan penyebaran blur lebar agar nampak melayang halus (Soft UI).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PREVIEW */}
        {activeTab === "preview" && (
          <div className="space-y-8 animate-fadeIn duration-200">
            <div>
              <h2 className="font-heading text-xl font-bold mb-2">Simulasi Antarmuka Dashboard Mitra (Pasarin)</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Mockup fungsional berskala mikro yang mendemonstrasikan kombinasi semua elemen visual.
              </p>
            </div>

            {/* Micro Dashboard UI */}
            <div className="overflow-hidden rounded-soft-xl border border-slate-200 bg-white shadow-soft-xl dark:border-slate-800 dark:bg-zinc-950">
              {/* Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 bg-[#fbfdfb] px-6 py-4 dark:border-slate-800 dark:bg-zinc-900/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary-100 text-brand-primary-700 dark:bg-brand-primary-950/60 dark:text-brand-primary-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-slate-800 dark:text-white">
                      Pak Suwito (Petani Mitra #042)
                    </h3>
                    <p className="text-xs text-brand-primary-600 dark:text-brand-primary-400 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-primary-500"></span>
                      Status: Pemasok Terverifikasi • Kelompok Tani Sukamaju
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand-primary-50 px-3 py-1 text-xs font-bold text-brand-primary-700 dark:bg-brand-primary-950/40 dark:text-brand-primary-400">
                    Mitra Sejak: Juni 2024
                  </span>
                  <span className="rounded-full bg-brand-secondary-50 px-3 py-1 text-xs font-bold text-brand-secondary-700 dark:bg-brand-secondary-950/40 dark:text-brand-secondary-400">
                    Peringkat: ★ 4.9
                  </span>
                </div>
              </div>

              {/* Main Content Pane */}
              <div className="grid gap-6 p-6 lg:grid-cols-3">
                {/* Side Analytics */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Revenue */}
                  <div className="rounded-soft-md bg-gradient-to-br from-brand-primary-500/10 to-brand-primary-600/5 p-4 border border-brand-primary-100 dark:border-brand-primary-900/20">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pendapatan Bersih Bulan Ini</span>
                    <h4 className="font-heading text-2xl font-extrabold text-slate-800 dark:text-white mt-1">Rp 12.850.000</h4>
                    <div className="mt-2 text-xs text-slate-400 font-medium">Batas pembayaran berikutnya: 15 Juni 2026</div>
                  </div>

                  {/* Orders Stats */}
                  <div className="rounded-soft-md border border-slate-100 p-4 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Statistik Pengiriman</span>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-450">Pesanan Selesai</span>
                        <span className="font-bold text-brand-primary-600 dark:text-brand-primary-400">324 Order</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-450 font-medium">Sedang Dikirim</span>
                        <span className="font-bold text-brand-secondary-600 dark:text-brand-secondary-400">12 Order</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-450 font-medium">Dibatalkan (Refund)</span>
                        <span className="font-bold text-rose-500">2 Order</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Stock Tracker */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading text-sm font-bold flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-brand-primary-500" />
                      Status Inventaris & Suplai Sayuran
                    </h4>
                    <button className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary-600 hover:underline cursor-pointer">
                      Tambah Komoditas <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Stock List */}
                  <div className="space-y-3">
                    {/* Item 1 */}
                    <div className="flex items-center justify-between p-3 rounded-soft-md border border-slate-100 hover:border-slate-200 dark:border-slate-850 dark:hover:border-slate-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-950/40 dark:text-emerald-400">
                          <Leaf className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-white block">Sawi Hijau</span>
                          <span className="text-[10px] text-slate-400 font-semibold block">Dipanen 12 Jam Lalu</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white block">Kapasitas: 85 Ikat</span>
                        <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-[9px] font-bold text-green-700 dark:bg-green-950/30 dark:text-green-400 mt-1">
                          STOK AMAN
                        </span>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-center justify-between p-3 rounded-soft-md border border-slate-100 hover:border-slate-200 dark:border-slate-850 dark:hover:border-slate-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded bg-amber-50 text-amber-600 flex items-center justify-center dark:bg-amber-950/40 dark:text-amber-400">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-white block">Tomat Merah</span>
                          <span className="text-[10px] text-slate-400 font-semibold block">Dipanen 2 Hari Lalu</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white block">Kapasitas: 12 Kg</span>
                        <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 mt-1">
                          STOK TIPIS
                        </span>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-center justify-between p-3 rounded-soft-md border border-slate-100 hover:border-slate-200 dark:border-slate-850 dark:hover:border-slate-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded bg-rose-50 text-rose-600 flex items-center justify-center dark:bg-rose-950/40 dark:text-rose-400">
                          <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-white block">Cabai Rawit Setan</span>
                          <span className="text-[10px] text-slate-400 font-semibold block">Belum ada pasokan baru</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white block">Kapasitas: 0 Kg</span>
                        <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 mt-1">
                          STOK HABIS
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-850 dark:bg-zinc-950 mt-12 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>© 2026 Pasarin Marketplace. Made with Vibrant Green & Warm Orange Brand Identity.</p>
        </div>
      </footer>
    </div>
  );
}
