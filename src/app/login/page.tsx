"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/landing/Navbar";
import Footer from "@/app/components/landing/Footer";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({ username: "", email: "", password: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin
      ? { username: formData.username, password: formData.password }
      : formData;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("isAuthenticated", "true");
          sessionStorage.setItem("userName", data.user.username);
          sessionStorage.setItem("userRole", data.user.role);
        }
        router.push("/dashboard");
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 md:flex-row md:items-stretch">
          {/* Left side – project blurb */}
          <div className="flex-1 space-y-4 md:space-y-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-300">
              Project 3 · Brake Dashboard
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl md:text-4xl">
              {isLogin ? "Welcome back" : "Join the workspace"}
            </h1>
            <p className="max-w-md text-sm text-slate-300">
              Access dashboards for{" "}
              <span className="font-semibold text-orange-200">
                daily production, scrap percentage, customer orders, inventory,
                and dispatch
              </span>{" "}
              in a single unified view.
            </p>

            <div className="mt-4 grid gap-3 text-[11px] text-slate-300 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <p className="font-semibold text-slate-100">
                  Role-based insights
                </p>
                <p className="mt-1 text-slate-400">
                  Operators, supervisors, and managers see the views that matter
                  most to their responsibilities.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <p className="font-semibold text-slate-100">
                  Real-time visibility
                </p>
                <p className="mt-1 text-slate-400">
                  Monitor bottlenecks, scrap spikes, and delayed orders before
                  they impact customers.
                </p>
              </div>
            </div>
          </div>

          {/* Right side – auth card */}
          <div className="flex-1">
            <div className="relative mx-auto max-w-sm rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/40 overflow-hidden">
              {/* subtle glow */}
              <div className="pointer-events-none absolute -inset-0.5 -z-10 rounded-3xl bg-gradient-to-br from-orange-500/10 via-slate-900 to-slate-950 blur-xl" />

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-50">
                    {isLogin ? "Sign In" : "Create Account"}
                  </h2>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {isLogin
                      ? "Enter your credentials to continue."
                      : "Fill in your details to get started."}
                  </p>
                </div>

                {/* mini brake icon */}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400">
                  <div className="relative h-4 w-4 rounded-full bg-slate-950/90">
                    <div className="absolute inset-1 rounded-full border border-slate-600" />
                    <div className="absolute left-1 top-1 h-1 w-1 rounded-full bg-slate-600" />
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-200"
                >
                  {error}
                </motion.div>
              )}

              {/* Google Auth Button */}
              <button
                type="button"
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-slate-950 px-2 text-slate-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.form
                  key={isLogin ? "login" : "register"}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                  onSubmit={handleSubmit}
                >
                  {!isLogin && (
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-200">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none transition focus:border-orange-400"
                        placeholder="name@example.com"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-200">
                      {isLogin ? "Username / Email" : "Username"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none transition focus:border-orange-400"
                      placeholder={isLogin ? "admin" : "johndoe"}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-200">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none transition focus:border-orange-400"
                      placeholder="••••••••"
                    />
                  </div>

                  {isLogin && (
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <input
                          id="remember"
                          type="checkbox"
                          className="h-3 w-3 rounded border-slate-600 bg-slate-900"
                        />
                        <label htmlFor="remember">Remember me</label>
                      </div>
                      <button
                        type="button"
                        className="text-orange-300 hover:text-orange-200"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-md bg-orange-500 px-3 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-orange-500/30 transition hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "Processing..."
                      : isLogin
                        ? "Sign in"
                        : "Create account"}
                  </button>
                </motion.form>
              </AnimatePresence>

              <div className="mt-4 text-center text-[11px] text-slate-400">
                <p>
                  {isLogin
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <button
                    onClick={toggleMode}
                    className="font-medium text-orange-300 hover:text-orange-200 underline decoration-transparent hover:decoration-orange-300 transition-all"
                  >
                    {isLogin ? "Create one" : "Sign in"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
