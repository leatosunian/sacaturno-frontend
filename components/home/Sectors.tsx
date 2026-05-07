"use client";

import { motion } from "framer-motion";
import { Badge } from "./Badge";
import {
  GiScissors,
  GiRazor,
  GiLipstick,
  GiNails,
  GiDogHouse,
  GiHealthNormal,
  GiWaterDrop,
  GiTooth,
  GiBrain,
  GiLeg,
  GiWeightScale,
  GiSunflower,
  GiCat,
  GiPencil,
  GiMusicalNotes,
} from "react-icons/gi";
import {
  MdSportsMartialArts,
  MdFitnessCenter,
  MdOutlineSelfImprovement,
  MdOutlineAccountBalance,
  MdHotel,
} from "react-icons/md";
import { FaEye, FaSpa, FaSyringe, FaCar, FaCamera } from "react-icons/fa";

const TAGS: { label: string; Icon: React.ElementType }[] = [
  { label: "Peluquerías", Icon: GiScissors },
  { label: "Barberías", Icon: GiRazor },
  { label: "Estética", Icon: GiLipstick },
  { label: "Manicura", Icon: GiNails },
  { label: "Masajes", Icon: FaSpa },
  { label: "Veterinarias", Icon: GiDogHouse },
  { label: "Consultorios", Icon: GiHealthNormal },
  { label: "Hoteles", Icon: MdHotel },
  { label: "Spa", Icon: GiWaterDrop },
  { label: "Dentistas", Icon: GiTooth },
  { label: "Tatuadores", Icon: FaSyringe },
  { label: "Psicólogos", Icon: GiBrain },
  { label: "Kinesiólogos", Icon: GiLeg },
  { label: "Nutricionistas", Icon: GiWeightScale },
  { label: "Depilación", Icon: GiSunflower },
  { label: "Peluquería canina", Icon: GiCat },
  { label: "Personal Trainers", Icon: MdFitnessCenter },
  { label: "Pilates", Icon: MdOutlineSelfImprovement },
  { label: "Yoga", Icon: MdSportsMartialArts },
  { label: "Talleres mecánicos", Icon: FaCar },
  { label: "Fotógrafos", Icon: FaCamera },
  { label: "Clases particulares", Icon: GiPencil },
  { label: "Clases de música", Icon: GiMusicalNotes },
  { label: "Oftalmólogos", Icon: FaEye },
  { label: "Contadores", Icon: MdOutlineAccountBalance },
];

const HALF = Math.ceil(TAGS.length / 2);
const ROW_1 = TAGS.slice(0, HALF);
const ROW_2 = [...TAGS.slice(HALF)].reverse();

function IndustryPill({
  label,
  Icon,
}: {
  label: string;
  Icon: React.ElementType;
}) {
  return (
    <span
      className="
        group inline-flex items-center gap-2.5
        whitespace-nowrap rounded-full
        border border-border bg-card
        px-[22px] py-[13px]
        text-[14px] font-semibold text-muted-foreground
        shadow-[0_1px_0_rgba(0,0,0,0.02)]
        transition-all duration-[250ms] ease-out
        select-none pointer-events-none
        [@media(hover:hover)]:pointer-events-auto
        [@media(hover:hover)]:hover:-translate-y-0.5
        [@media(hover:hover)]:hover:border-accent/20
        [@media(hover:hover)]:hover:bg-accent/10
        [@media(hover:hover)]:hover:text-accent
      "
    >
      <Icon
        className="
          shrink-0 text-accent text-[15px]
          opacity-55 transition-opacity duration-[250ms]
          [@media(hover:hover)]:group-hover:opacity-100
        "
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

function MarqueeRow({
  tags,
  direction,
  duration,
}: {
  tags: { label: string; Icon: React.ElementType }[];
  direction: "left" | "right";
  duration: number;
}) {
  return (
    <div
      className="flex w-max gap-3.5 hover:[animation-play-state:paused] cursor-pointer motion-reduce:!animate-none"
      style={{
        animation: `marquee-${direction} ${duration}s linear infinite`,
        willChange: "transform",
      }}
    >
      {tags.map((t, i) => (
        <IndustryPill
          key={`${direction}-a-${i}`}
          label={t.label}
          Icon={t.Icon}
        />
      ))}
      {tags.map((t, i) => (
        <span key={`${direction}-b-${i}`} aria-hidden="true">
          <IndustryPill label={t.label} Icon={t.Icon} />
        </span>
      ))}
    </div>
  );
}

export default function Sectors() {
  return (
    <section
      id="sectors"
      className="relative overflow-hidden bg-background py-24"
    >
      {/* Top/bottom white fades */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[10] h-28 bg-gradient-to-b from-white to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[10] h-28 bg-gradient-to-t from-white to-transparent"
      />

      {/* Orange glow blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div
          className="absolute"
          style={{
            top: "-10%",
            left: "2%",
            width: "45%",
            height: "60%",
            background:
              "radial-gradient(ellipse at center, hsla(24,90%,78%,0.35) 0%, hsla(20,70%,88%,0.2) 50%, transparent 75%)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-15%",
            right: "20%",
            width: "45%",
            height: "60%",
            background:
              "radial-gradient(ellipse at center, hsla(20,70%,88%,0.35) 0%, hsla(24,90%,78%,0.12) 50%, transparent 75%)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "40%",
            left: "80%",
            transform: "translateX(-50%)",
            width: "40%",
            height: "50%",
            background:
              "radial-gradient(ellipse at center, hsla(15,95%,68%,0.18) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Header */}
      <div className="relative mb-7 md:mb-14 z-[1] mx-auto max-w-[1200px] px-8 max-lg:px-6 max-md:px-5">
        <motion.div
          className="mx-auto max-w-[720px] text-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.13 } },
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            <Badge
              className="rounded-full text-orange-600 bg-orange-50 px-4 py-1.5 text-sm font-medium mb-5"
              variant="secondary"
            >
              Hecho para tu negocio
            </Badge>
          </motion.div>

          <motion.h2
            className="text-3xl mb-5 font-bold tracking-tight md:text-4xl 2xl:text-5xl"
            variants={{
              hidden: { opacity: 0, y: 26 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            Tu agenda en automático,
            <br className="hidden sm:block" />
            <span className="text-accent font-black ">
              {" "}
              sin importar tu rubro
            </span>
            .
          </motion.h2>

          <motion.p
            className="mx-auto max-w-[800px] md:text-lg leading-[1.65] text-muted-foreground"
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            Si trabajás con turnos, SacaTurno te ayuda a recibir a tus clientes
            como se merecen. Reservas claras, recordatorios a tiempo y una
            experiencia simple y profesional que tus clientes recuerdan.
          </motion.p>
        </motion.div>
      </div>

      {/* Edge-to-edge double marquee */}
      <div
        className="relative z-[1] py-1"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)",
        }}
      >
        <div
          aria-label="Rubros que confían en SacaTurno"
          className="flex flex-col gap-3.5 py-1"
        >
          <MarqueeRow tags={ROW_1} direction="left" duration={38} />
          <MarqueeRow tags={ROW_2} direction="right" duration={44} />
        </div>
      </div>

      {/* Closing strip */}
      <div className="relative z-[1] mx-auto max-w-[1200px] px-8 max-lg:px-6 max-md:px-5">
        <motion.div
          className="mt-7 md:mt-14 flex justify-center"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="
              flex flex-col sm:flex-row items-center gap-4 sm:gap-6
              w-full max-w-2xl
              rounded-2xl border border-orange-100 bg-orange-200/10
              px-5 py-4 shadow-sm backdrop-blur-sm
            "
          >
            <div className="flex items-center gap-3 flex-1 justify-center sm:justify-start text-left">
              <p className="text-base text-gray-600">
                ¿No ves tu rubro?{" "}
                <span className="font-semibold text-gray-800">
                  Probá si se adapta a tu negocio.
                </span>
              </p>
            </div>
            <a
              href="/register"
              className="
                shrink-0 w-full sm:w-auto text-center
                rounded-lg bg-orange-600 px-5 py-2.5
                text-xs font-bold text-white
                transition-all duration-300 ease-in-out
                hover:bg-orange-700
              "
            >
              Probalo gratis →
            </a>
          </div>
        </motion.div>
      </div>

      {/* Keyframes */}
      <style jsx global>{`
        @keyframes marquee-left {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @keyframes marquee-right {
          from {
            transform: translateX(-50%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}
