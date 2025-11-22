import Link from "next/link";
import Navbar from "@/app/components/landing/Navbar";
import Footer from "@/app/components/landing/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {/* Icon + 404 */}
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
            {/* Outer glowing ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500/40 via-amber-400/30 to-transparent blur-xl" />

            {/* Inner brake-disc style icon */}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 border border-slate-700 shadow-lg shadow-black/40">
              <div className="h-14 w-14 rounded-full border border-slate-600 bg-slate-950 relative">
                <div className="absolute inset-2 rounded-full border border-slate-700" />
                <div className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-slate-500" />
              </div>
              <span className="absolute bottom-1 text-[10px] font-semibold tracking-[0.18em] text-orange-300 uppercase">
                404
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-semibold sm:text-3xl md:text-4xl">
            Route not found.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-300">
            Looks like this path isn&apos;t part of the{" "}
            <span className="font-semibold text-orange-300">
              Brake Manufacturing Dashboard
            </span>{" "}
            layout. Maybe you followed an outdated link or mis-typed the URL.
          </p>

          {/* Fun line tied to project */}
          <p className="mt-2 text-[11px] text-slate-500">
            Don&apos;t worry — it&apos;s just a broken route, not a broken brake
            line. 🛠️
          </p>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
            <Link
              href="/"
              className="rounded-md bg-orange-500 px-4 py-2 font-semibold text-slate-950 shadow-md shadow-orange-500/30 transition hover:bg-orange-400"
            >
              ⤶ Back to Landing
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md border border-slate-700 bg-slate-900/70 px-4 py-2 font-medium text-slate-200 transition hover:border-orange-500 hover:text-orange-300"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/docs"
              className="rounded-md border border-slate-800 px-4 py-2 font-medium text-slate-300 transition hover:border-orange-500 hover:text-orange-200"
            >
              View Project Docs
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
