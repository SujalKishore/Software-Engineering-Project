"use client";
import React, { useEffect, useRef } from "react";
import AnimatedSection from "../ui/AnimatedSection";

const DocsHero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const columns = Math.floor(canvas.width / 20);
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      ctx.fillStyle = "rgba(2, 6, 23, 0.1)"; // slate-950 with fade
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#f97316"; // orange-500
      ctx.font = "15px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(Math.floor(Math.random() * 128));
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white h-[60vh] flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-20"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950" />

      <AnimatedSection className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <div className="inline-block rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-400 mb-6 backdrop-blur-md">
          Technical Documentation
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
          System Architecture & Specs
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          Deep dive into the data models, API endpoints, and design decisions powering the Brake Manufacturing Analytics Platform.
        </p>
      </AnimatedSection>
    </section>
  );
};

export default DocsHero;
