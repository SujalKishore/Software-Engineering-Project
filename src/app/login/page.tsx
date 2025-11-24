"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/app/components/landing/Navbar";
import Footer from "@/app/components/landing/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { Sparkles, ArrowRight, Lock, Mail, User, ShieldCheck } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<"idle" | "sending" | "sent">("idle");

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "register") {
      setIsLogin(false);
    }

    const savedUser = localStorage.getItem("rememberedUsername");
    if (savedUser) {
      setFormData((prev) => ({ ...prev, username: savedUser }));
      setRememberMe(true);
    }
  }, [searchParams]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccessMsg("");
    setFormData({ username: "", email: "", password: "" });
    setRecaptchaToken(null);
    if (!isLogin) {
      const savedUser = localStorage.getItem("rememberedUsername");
      if (savedUser) {
        setFormData((prev) => ({ ...prev, username: savedUser }));
      }
    }
  };

  const handleSocialLogin = (provider: string) => {
    if (provider === "Google") {
      signIn("google", { callbackUrl: "/dashboard" });
    } else {
      alert(`${provider} login coming soon!`);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus("sending");

    setTimeout(() => {
      setForgotStatus("idle");
      setShowForgotModal(false);
      setForgotEmail("");
      setError("SMTP server disabled. Please contact admins.");
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    if (!isLogin) {
      if (!recaptchaToken) {
        setError("Please complete the captcha verification.");
        setLoading(false);
        return;
      }
    }

    if (isLogin) {
      const res = await signIn("credentials", {
        redirect: false,
        username: formData.username,
        password: formData.password,
      });

      if (res?.error) {
        setError("Invalid credentials");
        setLoading(false);
      } else {
        if (formData.username === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    } else {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (res.ok) {
          const loginRes = await signIn("credentials", {
            redirect: false,
            username: formData.username,
            password: formData.password,
          });

          if (loginRes?.ok) {
            router.push("/dashboard");
          } else {
            setIsLogin(true);
            setSuccessMsg("Account created! Please sign in.");
            setLoading(false);
          }
        } else {
          setError(data.message || "Registration failed");
          setRecaptchaToken(null);
          setLoading(false);
        }
      } catch (err) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.15),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />

      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 pt-32 pb-20 relative z-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 lg:flex-row lg:items-center">

          {/* Left side – Branding */}
          <div className="flex-1 space-y-8 lg:pr-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400 backdrop-blur-sm">
              <Sparkles size={12} />
              <span>Secure Access Portal</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                {isLogin ? "Welcome back." : "Join the future."}
              </h1>
              <p className="max-w-lg text-lg text-slate-400 leading-relaxed">
                Access the centralized analytics hub for brake manufacturing. Monitor production, track inventory, and optimize logistics in real-time.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {[
                { title: "Role-Based Access", desc: "Secure views for Admins, Supervisors, and Operators.", icon: ShieldCheck },
                { title: "Real-Time Data", desc: "Instant visibility into production lines and scrap rates.", icon: Sparkles },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:bg-white/10">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200">{item.title}</h3>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side – Auth Card */}
          <div className="flex-1 w-full max-w-md mx-auto lg:mx-0">
            <div className="relative rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
              {/* Glow Effect */}
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold text-white">
                    {isLogin ? "Sign In" : "Create Account"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {isLogin ? "Enter your details to access your dashboard." : "Get started with your free account today."}
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key="error-msg"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center text-xs text-red-400"
                    >
                      {error}
                    </motion.div>
                  )}
                  {successMsg && (
                    <motion.div
                      key="success-msg"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center text-xs text-emerald-400"
                    >
                      {successMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300 ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950/50 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none"
                          placeholder="name@company.com"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 ml-1">
                      {isLogin ? "Username or Email" : "Username"}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/50 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none"
                        placeholder={isLogin ? "admin" : "johndoe"}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-medium text-slate-300">Password</label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => setShowForgotModal(true)}
                          className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/50 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="flex justify-center my-4">
                      <ReCAPTCHA
                        sitekey="6Lfv4RYsAAAAAOKuaFjZeab1jLYDmj4SGEln7PhG"
                        onChange={(val) => setRecaptchaToken(val)}
                        theme="dark"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 p-[1px] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70"
                  >
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#312E81_50%,#E2E8F0_100%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-3 text-sm font-bold text-white transition-all group-hover:bg-opacity-90">
                      {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
                      {!loading && <ArrowRight size={16} />}
                    </span>
                  </button>
                </form>

                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSocialLogin("Google")}
                    className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </button>
                </div>

                <p className="mt-8 text-center text-xs text-slate-400">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={toggleMode}
                    className="font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    {isLogin ? "Sign up" : "Log in"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Forgot Password Modal */}
        <AnimatePresence>
          {showForgotModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
              >
                <h3 className="text-lg font-bold text-white">Reset Password</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleForgotSubmit} className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300 ml-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none"
                      placeholder="name@example.com"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotStatus !== "idle"}
                      className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-400 disabled:opacity-70 transition-colors"
                    >
                      {forgotStatus === "sending" ? "Sending..." : forgotStatus === "sent" ? "Sent!" : "Send Link"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
