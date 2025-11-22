"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type NavbarProps = {
  onScrollToModules?: () => void; // kept for future use, not required now
};

const Navbar: React.FC<NavbarProps> = () => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);

    const checkAuth = () => {
      if (typeof window === "undefined") return;
      const authed = sessionStorage.getItem("isAuthenticated") === "true";
      setIsAuthed(authed);
      const storedName = sessionStorage.getItem("userName");
      setUserName(storedName);
    };

    window.addEventListener("scroll", handleScroll);
    checkAuth();

    // (optional) listen for changes from other tabs
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("isAuthenticated");
      sessionStorage.removeItem("userName");
    }
    setIsAuthed(false);
    setUserName(null);
    setIsMenuOpen(false);
    router.push("/login");
  };

  const handleGoToDashboard = () => {
    setIsMenuOpen(false);
    router.push("/dashboard");
  };

  const displayName = userName || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md transition-all ${
        isScrolled
          ? "bg-slate-950/90 border-b border-slate-800"
          : "bg-slate-900/40"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2">
          {/* Icon instead of BM text */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-400">
            {/* Simple brake-disc style icon */}
            <div className="relative h-4 w-4 rounded-full bg-slate-950/90">
              <div className="absolute inset-1 rounded-full border border-slate-600" />
              <div className="absolute left-1 top-1 h-1 w-1 rounded-full bg-slate-600" />
            </div>
          </div>
          <div className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 sm:block">
            Brake Dashboard
          </div>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/about"
            className="text-[11px] font-medium text-slate-300 transition hover:text-orange-300"
          >
            About
          </Link>
          <Link
            href="/docs"
            className="text-[11px] font-medium text-slate-300 transition hover:text-orange-300"
          >
            Docs
          </Link>
        </nav>

        {/* Desktop right side */}
        <div className="hidden items-center gap-3 text-[11px] md:flex">
          {isAuthed ? (
            <>
              {/* User chip – click to go back to dashboard */}
              <button
                onClick={handleGoToDashboard}
                className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 font-medium text-slate-200 transition hover:border-orange-500 hover:text-orange-300"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-[11px] font-semibold text-slate-950">
                  {initial}
                </div>
                <span>{displayName}</span>
                <span className="text-slate-500">· Dashboard</span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="rounded-md border border-slate-700 bg-slate-900/70 px-3 py-1.5 font-medium text-slate-200 transition hover:border-red-500 hover:text-red-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md border border-slate-700 bg-slate-900/70 px-3 py-1.5 font-medium text-slate-200 transition hover:border-orange-500 hover:text-orange-300"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-orange-500 px-3 py-1.5 font-semibold text-slate-950 shadow-md shadow-orange-500/30 transition hover:bg-orange-400"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={toggleMenu}
          className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900/70 p-1.5 md:hidden"
          aria-label="Toggle navigation menu"
        >
          <span className="sr-only">Open menu</span>
          <div className="space-y-0.5">
            <span className="block h-0.5 w-4 rounded bg-slate-200" />
            <span className="block h-0.5 w-4 rounded bg-slate-200" />
            <span className="block h-0.5 w-4 rounded bg-slate-200" />
          </div>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {isMenuOpen && (
        <div className="border-t border-slate-800 bg-slate-950 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 text-[12px]">
            <Link
              href="/about"
              className="rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-900 hover:text-orange-300"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/docs"
              className="rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-900 hover:text-orange-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Docs
            </Link>

            {isAuthed ? (
              <>
                <button
                  onClick={handleGoToDashboard}
                  className="mt-2 flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-left font-medium text-slate-200 hover:border-orange-500 hover:text-orange-300"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-[11px] font-semibold text-slate-950">
                    {initial}
                  </div>
                  <span>{displayName}</span>
                  <span className="text-slate-500">· Dashboard</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="mt-2 rounded-md border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-center font-medium text-slate-200 hover:border-red-500 hover:text-red-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="mt-2 flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 rounded-md border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-center font-medium text-slate-200 hover:border-orange-500 hover:text-orange-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex-1 rounded-md bg-orange-500 px-3 py-1.5 text-center font-semibold text-slate-950 hover:bg-orange-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
