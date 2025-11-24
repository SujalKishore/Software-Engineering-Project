import React from "react";
import Link from "next/link";
import { Github, Twitter, Linkedin, Mail, ArrowUpRight } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-slate-950 pt-20 pb-10">
      {/* Watermark */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 select-none text-[20vw] font-bold leading-none text-white/[0.02]">
        BRAKE
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-4 lg:gap-24">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <div className="h-3 w-3 bg-white rounded-full" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">Brake Analytics</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              Empowering manufacturers with real-time intelligence.
              Transform raw production data into actionable insights for a safer, more efficient future.
            </p>

            <div className="mt-8 flex gap-4">
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/5 text-slate-400 transition-all hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-400"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-wider text-slate-500">Platform</h4>
            <ul className="space-y-4">
              {["Dashboard", "Analytics", "Reports", "API Status"].map((item) => (
                <li key={item}>
                  <Link href="#" className="group flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
                    {item}
                    <ArrowUpRight size={12} className="opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-wider text-slate-500">Company</h4>
            <ul className="space-y-4">
              {["About", "Documentation", "Changelog", "Contact"].map((item) => (
                <li key={item}>
                  <Link href="#" className="group flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
                    {item}
                    <ArrowUpRight size={12} className="opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 md:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Brake Manufacturing Analytics. All rights reserved.
          </p>
          <div className="flex gap-8">
            {["Privacy", "Terms", "Security"].map((item) => (
              <Link key={item} href="#" className="text-xs text-slate-500 transition-colors hover:text-slate-300">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
