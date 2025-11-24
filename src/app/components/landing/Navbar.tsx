"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ChevronRight, Sparkles } from "lucide-react";

type NavbarProps = {
  onScrollToModules?: () => void;
};

const Navbar: React.FC<NavbarProps> = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAuthed = status === "authenticated";
  const userName = session?.user?.name || session?.user?.email || "User";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("isAuthenticated");
      sessionStorage.removeItem("userName");
    }
    setIsMenuOpen(false);
  };

  const handleGoToDashboard = () => {
    setIsMenuOpen(false);
    router.push("/dashboard");
  };

  const displayName = userName || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? "bg-slate-950/70 backdrop-blur-xl border-b border-white/5 py-3"
        : "bg-transparent py-5"
        }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <Sparkles className="relative z-10 text-white h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-wide text-white uppercase">Brake</span>
            <span className="text-[10px] font-medium tracking-[0.2em] text-slate-400 group-hover:text-orange-400 transition-colors">Analytics</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-1 md:flex rounded-full border border-white/5 bg-white/5 p-1 backdrop-blur-md">
          {["About", "Docs"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="relative px-5 py-2 text-xs font-medium text-slate-300 transition-colors hover:text-white"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Desktop right side */}
        <div className="hidden items-center gap-4 md:flex">
          {isAuthed ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleGoToDashboard}
                className="group flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 pl-2 pr-4 py-1.5 transition-all hover:border-orange-500/30 hover:bg-slate-900"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-[10px] font-bold text-white shadow-sm">
                  {initial}
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">{displayName}</span>
                  {(session?.user as any)?.googleId && (
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">
                      ID: {(session?.user as any).googleId}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="text-xs font-medium text-slate-500 hover:text-red-400 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/login?mode=register"
                className="group relative overflow-hidden rounded-full bg-white px-6 py-2.5 transition-transform hover:scale-105 active:scale-95"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-950 group-hover:text-white transition-colors">
                  Register
                  <ChevronRight size={12} />
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={toggleMenu}
          className="rounded-full bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white md:hidden transition-colors"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5 bg-slate-950/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {["About", "Docs"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}

              <div className="my-2 border-t border-white/5" />

              {isAuthed ? (
                <>
                  <button
                    onClick={handleGoToDashboard}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                      {initial}
                    </div>
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg px-4 py-3 text-left text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 mt-2">
                  <Link
                    href="/login"
                    className="rounded-lg border border-white/10 px-4 py-3 text-center text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/login?mode=register"
                    className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-orange-500/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
