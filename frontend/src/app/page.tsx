"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Key, Shield, ArrowRight } from "lucide-react";

export default function Home() {
  const { user, loading, logout } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 py-12 px-4 dark:bg-zinc-950 sm:px-6 lg:px-8">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[130px] dark:bg-indigo-500/5"></div>
      <div className="absolute bottom-0 left-1/4 h-[600px] w-[600px] rounded-full bg-violet-500/10 blur-[130px] dark:bg-violet-500/5"></div>

      <div className="relative z-10 w-full max-w-2xl text-center">
        {/* Logo/Branding */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
            <span className="text-xl font-bold">P</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Pasarin
          </span>
        </div>

        <h1 className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-950 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent dark:from-white dark:via-zinc-200 dark:to-zinc-400 sm:text-5xl">
          Premium Authentication Portal
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-zinc-500 dark:text-zinc-400">
          Secure JWT session authentication using HTTP-Only cookies, Next.js App Router, React Hook Form, and Zod.
        </p>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : user ? (
          /* Logged In Dashboard Card */
          <div className="mt-12 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 p-8 shadow-[0_20px_50px_rgba(8,_112,_184,_0.05)] backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-900/70 text-left sm:p-10">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-6 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  <User className="h-6 w-6 stroke-[1.5]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Active Session
                  </h2>
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1.5 font-medium">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    Securely authenticated
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white py-2 px-4 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:text-red-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-red-400 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-3 gap-4 rounded-xl bg-zinc-50/50 p-4 dark:bg-zinc-950/40">
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
                    Role
                  </span>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 capitalize flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5 text-indigo-500" />
                    {user.role}
                  </p>
                </div>
                <div className="col-span-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Name
                  </span>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 truncate">
                    {user.name}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-100 bg-white/40 p-4 dark:border-zinc-800/40 dark:bg-zinc-950/20">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Email Address
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
              className="group flex flex-col items-start rounded-2xl border border-zinc-200/80 bg-white/70 p-6 text-left shadow-[0_15px_30px_rgba(8,_112,_184,_0.03)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-indigo-500/5 dark:border-zinc-800/60 dark:bg-zinc-900/70"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <Key className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
                Sign In
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Access your account, orders, dashboard, and settings.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                Get started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/register"
              className="group flex flex-col items-start rounded-2xl border border-zinc-200/80 bg-white/70 p-6 text-left shadow-[0_15px_30px_rgba(8,_112,_184,_0.03)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-violet-500/5 dark:border-zinc-800/60 dark:bg-zinc-900/70"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                <User className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
                Create Account
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Register as a buyer or seller to explore the premium marketplace.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-violet-600 dark:text-violet-400">
                Join now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
