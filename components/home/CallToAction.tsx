"use client";

import React, { useEffect, useRef } from "react";
import { Badge } from "./Badge";
import { ShimmerButton } from "../ui/ShimmerButton";

const TICKER_ITEMS = [
    "15 días gratis",
    "sin tarjeta de crédito",
    "listo en 5 minutos",
    "agenda automatica",
    "tus clientes reservan solos",
];

const STATS = [
    { val: "24hs", label: "tu agenda disponible" },
    { val: "99% asistencia", label: "cobrando seña" },
    { val: "+8.000", label: "clientes reservaron" },
    { val: "$ 0", label: "para empezar" },
];

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

    return (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    );
}


export default function CallToAction() {
    return (
        <section className="bg-[#faf8f5]">

            {/* Ticker tape */}
            <div className="border-b border-black/[0.06] py-3 overflow-hidden bg-[#faf8f5]">
                <div className="cta-ticker-track flex w-max">
                    {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                        <span
                            key={i}
                            className="inline-flex items-center gap-6 whitespace-nowrap px-6 text-[11px] font-semibold text-[#9a9a9a] tracking-[0.5px] uppercase"
                        >
                            <span className="text-[#dd4924] text-[8px]">◆</span>
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            {/* Main body */}
            <div className="relative overflow-hidden px-8 pt-[88px] pb-[72px]">
                <AnimatedBg />

                {/* White gradient overlay — same as HeroSection */}
                <div
                    className="absolute inset-0 pointer-events-none z-[1]"
                    style={{
                        background:
                            "linear-gradient(135deg,rgba(255,255,255,0.72) 0%,rgba(255,255,255,0.48) 40%,rgba(255,255,255,0.18) 70%,rgba(255,255,255,0.05) 100%)",
                    }}
                />

                {/* Dot grid — same as HeroSection */}
                <div
                    className="absolute inset-0 pointer-events-none z-[2]"
                    style={{
                        backgroundImage: "radial-gradient(rgba(128,128,128,0.22) 1px,transparent 1px)",
                        backgroundSize: "22px 22px",
                        maskImage: "radial-gradient(ellipse 90% 90% at 50% 50%,black 20%,transparent 80%)",
                        WebkitMaskImage: "radial-gradient(ellipse 90% 90% at 50% 50%,black 20%,transparent 80%)",
                    }}
                />

                {/* Content */}
                <div className="cta-fade-up relative z-[3] max-w-[760px] mx-auto text-center">

                    {/* Eyebrow */}
                    {/* <div className="flex items-center justify-center gap-[10px] text-[11px] font-bold tracking-[2px] uppercase text-[#9a9a9a] mb-10">
                        
                    </div> */}
                    <Badge className="rounded-full mb-5 text-orange-600 bg-orange-50 px-4 py-1.5 text-sm font-medium" variant="secondary">
                        Empezá hoy
                    </Badge>

                    {/* Headline */}
                    <h2
                        className="font-medium text-[#1a1a1a] leading-[0.95] mb-6"
                        style={{
                            fontSize: "clamp(38px, 4vw, 58px)",
                            letterSpacing: "-3px",
                            textWrap: "pretty",
                        } as React.CSSProperties}
                    >
                        ¿Qué esperás para
                        <br />
                        <span className="font-bold text-[#1a1a1a]">

                            <span className="text-[#dd4924]"> transformar </span>
                            tu
                        </span>
                        <br />
                        <span className="text-[#dd4924] font-bold">
                            negocio
                            <span className="text-[#1a1a1a]">?</span>
                        </span>
                    </h2>

                    {/* Subtext */}
                    <p className="text-[17px] text-[#5a5a5a] leading-[1.75] max-w-[440px] mx-auto mb-8 font-normal">
                        Más de 200 negocios ya lo están usando.
                        <br />
                        Empezá gratis, sin tarjeta.
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3 justify-center flex-wrap mb-10">
                        <ShimmerButton primary href="/register">
                            Comenzar Prueba Gratuita
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                                <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </ShimmerButton>
                    </div>

                    {/* Stats strip */}
                    <div className="cta-glow-card hidden md:inline-flex gap-0 rounded-2xl py-5 px-2 overflow-hidden">
                        {STATS.map((s, i) => (
                            <React.Fragment key={i}>
                                <div className="px-7 text-center">
                                    <div
                                        className="font-bold text-[#1a1a1a] leading-none"
                                        style={{ fontSize: "clamp(16px, 3.5vw, 26px)", letterSpacing: "-1px" }}
                                    >
                                        {s.val}
                                    </div>
                                    <div className="text-[11px] text-[#9a9a9a] font-medium mt-1 tracking-[0.2px]">
                                        {s.label}
                                    </div>
                                </div>
                                {i < STATS.length - 1 && (
                                    <div className="w-px h-9 bg-black/[0.08] self-center" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fine print */}
            <div className="border-t border-black/[0.06] text-center py-4 px-8 text-[11px] text-[#9a9a9a] tracking-[0.2px]">
                15 días de prueba full · Sin costos ocultos · Cancelá cuando quieras
            </div>
        </section>
    );
}
