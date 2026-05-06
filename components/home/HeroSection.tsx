"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ShimmerButton } from "@/components/ui/ShimmerButton";
import mockup from "@/public/macbook_mockup.png";
import {
  leftContainerVariants,
  badgeVariants,
  h1LineVariants,
  paragraphVariants,
  ctaContainerVariants,
  ctaItemVariants,
  statsContainerVariants,
  statsItemVariants,
  mockupVariants,
  noMotionVariant,
} from "./hero.animations";
import { FaArrowRight } from "react-icons/fa6";

// ─── Animated canvas background ───────────────────────────────────────────

function AnimatedBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const blobs = [
      { x: 0.72, y: 0.22, r: 0.52, ox: 0.06, oy: 0.04, spd: 0.00011, phase: 0.0, hue: 24, sat: 90, lit: 78, alpha: 0.6 },
      { x: 0.18, y: 0.68, r: 0.44, ox: 0.05, oy: 0.07, spd: 0.00014, phase: 2.1, hue: 20, sat: 70, lit: 88, alpha: 0.30 },
      { x: 0.50, y: 0.40, r: 0.36, ox: 0.04, oy: 0.05, spd: 0.00009, phase: 4.4, hue: 15, sat: 95, lit: 68, alpha: 0.3 },
      { x: 0.85, y: 0.80, r: 0.30, ox: 0.07, oy: 0.04, spd: 0.00016, phase: 1.2, hue: 30, sat: 60, lit: 90, alpha: 0.15 },
    ];

    let W = 0, H = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      ctx.scale(dpr, dpr);
    }
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf: number;
    const start = performance.now();

    function draw() {
      const elapsed = performance.now() - start;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#faf8f5";
      ctx.fillRect(0, 0, W, H);

      blobs.forEach((b) => {
        const angle = elapsed * b.spd + b.phase;
        const cx = (b.x + Math.sin(angle) * b.ox) * W;
        const cy = (b.y + Math.cos(angle * 0.7) * b.oy) * H;
        const radius = b.r * Math.max(W, H);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `hsla(${b.hue},${b.sat}%,${b.lit}%,${b.alpha})`);
        grad.addColorStop(0.5, `hsla(${b.hue},${b.sat}%,${b.lit}%,${b.alpha * 0.4})`);
        grad.addColorStop(1, `hsla(${b.hue},${b.sat}%,${b.lit}%,0)`);

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />;
}

// ─── Hero ──────────────────────────────────────────────────────────────────

const stats = [
  { val: "+251", label: "negocios activos" },
  { val: "15 dias", label: "de prueba gratis" },
  { val: "<5 min", label: "para configurar" },
];

const HeroSection = () => {
  // Respect OS-level "Reduce Motion" preference
  const prefersReducedMotion = useReducedMotion();
  const v = prefersReducedMotion ? noMotionVariant : undefined; // undefined = use declared variants

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <AnimatedBg />

      {/* Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "linear-gradient(135deg,rgba(255,255,255,0.72) 0%,rgba(255,255,255,0.48) 40%,rgba(255,255,255,0.18) 70%,rgba(255,255,255,0.05) 100%)",
        }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          backgroundImage: "radial-gradient(rgba(128,128,128,0.22) 1px,transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 90% 90% at 50% 50%,black 20%,transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 90% at 50% 50%,black 20%,transparent 80%)",
        }}
      />

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[180px] pointer-events-none z-[3]"
        style={{ background: "linear-gradient(transparent, #fdf0e8)" }}
      />

      {/* Content */}
      <div className="relative z-[4] justify-between max-w-[1300px] 2xl:max-w-[1400px] mx-auto px-6 2xl:px-0 pt-[80px] 2xl:pt-[110px] pb-12 2xl:pb-16 flex items-center w-full flex-wrap lg:flex-nowrap">

        {/* ── Left column ── */}
        <motion.div
          className="w-full lg:w-fit"
          variants={v ?? leftContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            variants={v ?? badgeVariants}
            className="inline-flex items-center gap-[7px] px-3 2xl:px-4 py-1 2xl:py-[6px] rounded-full bg-[#fff1e8] border border-[rgba(221,73,36,0.18)] text-[#dd4924] text-[10px] 2xl:text-[12px] font-bold tracking-[0.5px] uppercase mb-5 2xl:mb-7 backdrop-blur-sm"
          >
            {/* <span className="w-[5px] h-[5px] 2xl:w-[7px] 2xl:h-[7px] rounded-full bg-[#4bc720] shadow-[0_0_0_3px_rgba(75,199,32,0.2)] shrink-0" /> */}
            15 días gratis · sin tarjeta
          </motion.div>

          {/* H1 — each line animates independently via stagger from container */}
          <h1 className="text-[clamp(42px,4.5vw,58px)] 2xl:text-[72px] leading-[1.0] tracking-[-1.5px] 2xl:tracking-[-3px] text-[#1a1a1a] mb-5 2xl:mb-7">
            <motion.span variants={v ?? h1LineVariants} className="block font-medium">
              Automatizá tus
            </motion.span>
            <motion.span variants={v ?? h1LineVariants} className="block font-medium">
              reservas,
            </motion.span>
            <motion.span variants={v ?? h1LineVariants} className="block font-bold">
              tu tiempo <span className="text-[#dd4924]">vale.</span>
            </motion.span>
          </h1>

          {/* Paragraph */}
          <motion.p
            variants={v ?? paragraphVariants}
            className="text-[16px] 2xl:text-[18px] font-normal text-[#5a5a5a] leading-[1.65] max-w-[400px] 2xl:max-w-[520px] mb-7 2xl:mb-10"
          >
            La plataforma que usan +250 negocios argentinos para tener su propia página de reservas online y recibir turnos las 24hs. Tu agenda automática lista en 5 minutos.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={v ?? ctaContainerVariants}
            className="flex items-center gap-3 flex-wrap mb-8 2xl:mb-12"
          >
            <motion.div variants={v ?? ctaItemVariants}>
              <ShimmerButton primary href="/register" className="px-4 2xl:px-7 py-3 2xl:py-4 rounded-[9px] 2xl:rounded-[12px] font-semibold  text-[13px] 2xl:text-[16px]">
                Empezar gratis
                <FaArrowRight className="block md:hidden ml-1" size={13} />
                <FaArrowRight className="hidden md:block ml-2 2xl:hidden" size={14} />
                <FaArrowRight className="hidden 2xl:block ml-2" size={16} />
              </ShimmerButton>
            </motion.div>
            <motion.div variants={v ?? ctaItemVariants}>
              <Link
                href="/login"
                className="bg-white/60 text-[#1a1a1a] border-[1.5px] border-black/[0.08] px-5 2xl:px-7 py-[13px] 2xl:py-[18px] rounded-[9px] 2xl:rounded-[12px] text-[13px] 2xl:text-[16px] font-semibold hover:bg-white/90 transition-colors backdrop-blur-sm"
              >
                Iniciar sesión
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={v ?? statsContainerVariants}
            className="flex gap-6 2xl:gap-10 flex-wrap"
          >
            {stats.map((s, i) => (
              <motion.div key={i} variants={v ?? statsItemVariants}>
                <div className="text-[17px] 2xl:text-[24px] font-extrabold text-[#1a1a1a] tracking-[-0.5px] leading-none">
                  {s.val}
                </div>
                <div className="text-[10px] 2xl:text-[13px] max-w-36 text-[#9a9a9a] font-medium mt-[3px] 2xl:mt-[5px]">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Right column (mockup) ── */}
        <motion.div
          className="w-full lg:w-[55%] flex items-center justify-center"
          variants={v ?? mockupVariants}
          initial="hidden"
          animate="visible"
        >
          {/*
            priority ensures Next.js preloads this image — combined with
            opacity starting at 0.4 (not 0), the browser sees a painted
            LCP candidate immediately rather than waiting for the animation.
          */}
          <Image
            src={mockup}
            className="hidden lg:block w-full"
            width={620}
            alt="Vista previa de la app SacaTurno en distintos dispositivos"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
