"use client";

import Link from "next/link";
import Navbar from "@/app/components/landing/Navbar";
import Footer from "@/app/components/landing/Footer";
import { motion } from "framer-motion";
import { AlertTriangle, WifiOff, RefreshCw, Loader2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col overflow-hidden relative">
      <Navbar />

      {/* Glitch Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
            className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"
            style={{ top: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      <main className="flex-1 flex items-center justify-center px-4 pt-64 pb-20 relative z-10">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">

          {/* Glitch 404 Text with Buffering Circle */}
          <div className="relative mb-12 flex items-center justify-center">
            {/* Buffering Circle */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute h-64 w-64 rounded-full border-2 border-dashed border-slate-800 opacity-50"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="absolute h-48 w-48 rounded-full border border-slate-800 opacity-30"
            />

            <div className="relative z-10">
              <h1 className="text-9xl font-black tracking-tighter text-slate-500 select-none">
                404
              </h1>
              <motion.div
                animate={{
                  x: [-2, 2, -1, 0],
                  y: [1, -1, 0],
                }}
                transition={{
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                className="absolute inset-0 text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 mix-blend-overlay"
              >
                404
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-6 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1.5 text-xs font-medium text-red-400"
          >
            <WifiOff size={14} />
            <span>SIGNAL_LOST</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold sm:text-4xl mb-4 text-white"
          >
            System Failure
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-md text-sm text-slate-400 mb-10 leading-relaxed"
          >
            The requested module could not be located. It may have been decommissioned or moved to a secure sector.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/"
              className="group flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-orange-400 hover:scale-105"
            >
              <RefreshCw size={16} className="transition-transform group-hover:rotate-180" />
              Re-establish Connection
            </Link>

            <Link
              href="/dashboard"
              className="group flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-6 py-3 text-sm font-medium text-slate-300 transition-all hover:border-orange-500/50 hover:text-white"
            >
              <AlertTriangle size={16} />
              Emergency Protocol
            </Link>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
