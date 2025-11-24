'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText, useGSAP);

// ===================== HERO =====================
interface HeroProps {
  title?: string;
  description?: string;
  badgeText?: string;
  badgeLabel?: string;
  ctaButtons?: Array<{ text: string; href: string; primary?: boolean }>;
  microDetails?: Array<string>;
}

export default function Hero({
  title = "Brake Manufacturing Analytics",
  description = "Real-time insights for production, quality, and logistics. Optimize your manufacturing process with data-driven decision making.",
  badgeText = "Project 3",
  badgeLabel = "Dashboard",
  ctaButtons = [
    { text: "View Documentation", href: "/docs", primary: true },
    { text: "Admin Login", href: "/admin" }
  ],
  microDetails = ["Real-time Data", "Secure Access", "Interactive Charts"]
}: HeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLHeadingElement | null>(null);
  const paraRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const microRef = useRef<HTMLUListElement | null>(null);

  useGSAP(
    () => {
      if (!headerRef.current) return;

      document.fonts.ready.then(() => {
        const split = new SplitText(headerRef.current!, {
          type: 'lines',
          wordsClass: 'lines',
        });

        gsap.set(split.lines, {
          opacity: 0,
          y: 20,
          filter: 'blur(10px)',
        });

        if (badgeRef.current) {
          gsap.set(badgeRef.current, { opacity: 0, y: -10 });
        }
        if (paraRef.current) {
          gsap.set(paraRef.current, { opacity: 0, y: 10 });
        }
        if (ctaRef.current) {
          gsap.set(ctaRef.current, { opacity: 0, y: 10 });
        }
        if (microRef.current) {
          gsap.set(microRef.current, { opacity: 0 });
        }

        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
        });

        if (badgeRef.current) {
          tl.to(badgeRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.2);
        }

        tl.to(
          split.lines,
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1,
            stagger: 0.1,
          },
          0.4
        );

        if (paraRef.current) {
          tl.to(paraRef.current, { opacity: 1, y: 0, duration: 0.8 }, '-=0.6');
        }
        if (ctaRef.current) {
          tl.to(ctaRef.current, { opacity: 1, y: 0, duration: 0.8 }, '-=0.6');
        }
        if (microRef.current) {
          tl.to(microRef.current, { opacity: 1, duration: 1 }, '-=0.4');
        }
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative min-h-screen w-full overflow-hidden bg-slate-950 flex items-center justify-center">
      {/* Abstract Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 z-[-2] h-screen w-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center gap-8 px-6 py-24 sm:py-32">

        {/* Badge */}
        {/* <div ref={badgeRef} className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-4 py-1.5 backdrop-blur-sm">
          <span className="text-[11px] font-medium uppercase tracking-wider text-orange-400">{badgeLabel}</span>
          <span className="h-1 w-1 rounded-full bg-slate-600" />
          <span className="text-xs font-medium text-slate-300">{badgeText}</span>
        </div> */}

        {/* Title */}
        <h1 ref={headerRef} className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-7xl">
          {title}
        </h1>

        {/* Description */}
        <p ref={paraRef} className="max-w-2xl text-lg leading-8 text-slate-400">
          {description}
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-wrap items-center justify-center gap-4">
          {ctaButtons.map((button, index) => (
            <a
              key={index}
              href={button.href}
              className={`rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-300 ${button.primary
                ? "bg-orange-500 text-white hover:bg-orange-400 shadow-[0_0_20px_-5px_rgba(249,115,22,0.5)]"
                : "text-slate-300 border border-slate-700 hover:bg-slate-800 hover:text-white"
                }`}
            >
              {button.text}
            </a>
          ))}
        </div>

        {/* Micro Details */}
        <ul ref={microRef} className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-slate-500">
          {microDetails.map((detail, index) => (
            <li key={index} className="flex items-center gap-2">
              <svg className="h-2 w-2 fill-orange-500" viewBox="0 0 6 6" aria-hidden="true">
                <circle cx={3} cy={3} r={3} />
              </svg>
              {detail}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
