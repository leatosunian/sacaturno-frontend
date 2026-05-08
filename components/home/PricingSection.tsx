"use client";
import { FaCheck, FaMedal } from "react-icons/fa6";
import { MdMoneyOff } from "react-icons/md";
import { SiAdguard } from "react-icons/si";
import { motion } from "framer-motion";
import { Badge } from "./Badge";
import { ShimmerButton } from "@/components/ui/ShimmerButton";

const ease = [0.22, 1, 0.36, 1] as const;

const headerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13 } },
};

const headerItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

const cardsContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2, delayChildren: 0.05 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 50, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease } },
};

const featureList = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
};

const featureItem = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const PLAN_PRUEBA = [
  "Prueba gratuita de 15 días",
  "1 servicio por empresa",
  "Un turno por horario",
  "Notificaciones por email",
  "Soporte 24/7",
];

const PLAN_FULL = [
  "Reservas con seña",
  "Turnos ilimitados",
  "Servicios ilimitados",
  "Notificaciones por email",
  "Turnos simultáneos en un mismo horario",
];

const PricingSection = () => {
  return (
    <div
      id="pricing"
      className="flex relative overflow-hidden flex-col items-center justify-center w-full gap-12 text-black h-fit pt-24 pb-16 lg:py-18 2xl:py-24"
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
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute"
          style={{
            top: "-10%",
            right: "-8%",
            width: "55%",
            height: "70%",
            background:
              "radial-gradient(ellipse at center, hsla(24,90%,78%,0.36) 0%, hsla(20,70%,88%,0.2) 50%, transparent 75%)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-15%",
            left: "-6%",
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
            left: "50%",
            transform: "translateX(-50%)",
            width: "40%",
            height: "50%",
            background:
              "radial-gradient(ellipse at center, hsla(15,95%,68%,0.18) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        className="w-full text-center h-fit"
        variants={headerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        <motion.div variants={headerItem}>
          <Badge className="rounded-full text-orange-600 bg-orange-50 px-4 py-1.5 text-sm font-medium mb-4" variant="secondary">
            Planes
          </Badge>
        </motion.div>
        <motion.h2
          variants={headerItem}
          className="text-3xl mb-6 font-bold tracking-tight md:text-4xl 2xl:text-5xl"
        >
          Simple. Accesible. A tu medida.
        </motion.h2>
        <motion.span
          variants={headerItem}
          className="flex items-center justify-center gap-2 mt-4 text-lg font-normal text-gray-600 px-7 md:px-0"
        >
          <SiAdguard className="hidden md:block" />
          Pagá de manera segura mediante Mercado Pago
        </motion.span>
      </motion.div>

      {/* Cards */}
      <motion.div
        className="flex flex-col items-center gap-6 w-[90%] md:flex-row md:w-fit md:gap-9 md:px-20 md:py-9"
        variants={cardsContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Plan Prueba */}
        <motion.div
          variants={cardVariant}
          whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
          className="flex flex-col w-full md:w-[390px] h-full rounded-xl p-6 md:p-[30px] text-black z-[20] lg:bg-transparent backdrop-blur-md bg-white/60 hover:bg-white/70 border border-black/[0.15] shadow-lg hover:shadow-orange-200/60 hover:border-orange-300/40 transition-colors duration-300 cursor-pointer"
        >
          <div className="mb-5">
            <h4 className="flex items-center gap-2 mb-3 text-2xl font-semibold xl:text-3xl">
              <MdMoneyOff color="#dd4924" className="hidden xl:block" size={35} />
              <MdMoneyOff color="#dd4924" className="block xl:hidden" size={30} />
              Plan Prueba
            </h4>
            <span className="text-2xl font-semibold">GRATIS</span>
          </div>

          <div className="w-full h-px bg-black/20" />

          <motion.div
            className="flex flex-col gap-2 mt-5"
            variants={featureList}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
          >
            <h5 className="mb-2 text-base font-semibold text-center">EL PLAN INCLUYE</h5>
            {PLAN_PRUEBA.map((item) => (
              <motion.div key={item} variants={featureItem} className="flex items-center gap-3 w-fit">
                <FaCheck color="#dd4924" size={12} />
                <span className="text-sm text-black">{item}</span>
              </motion.div>
            ))}
          </motion.div>

          <div className="w-full h-px bg-black/20 my-8" />

          <div className="flex justify-center w-full mt-auto">
            <ShimmerButton primary href="/register" className="w-full">
              Comenzar Prueba Gratuita
            </ShimmerButton>
          </div>
        </motion.div>

        {/* Plan Full */}
        <motion.div
          variants={cardVariant}
          whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
          className="flex flex-col w-full md:w-[390px] h-full rounded-xl p-6 md:p-[30px] text-black z-20 lg:bg-transparent backdrop-blur-md bg-white/60 hover:bg-white/70 border border-black/[0.15] shadow-lg hover:shadow-orange-200/60 hover:border-orange-300/40 transition-colors duration-300 cursor-pointer"
        >
          <div className="mb-5">
            <h4 className="flex items-center gap-3 mb-3 text-2xl font-semibold xl:text-3xl">
              <FaMedal color="#dd4924" className="hidden xl:block" size={30} />
              <FaMedal color="#dd4924" className="block xl:hidden" size={25} />
              Plan Full
            </h4>
            <div>
              <span className="mr-1 text-2xl font-semibold">$12.890</span>
              <span className="text-sm text-gray-800">ARS/mes</span>
            </div>
          </div>

          <div className="w-full h-px bg-black/20" />

          <motion.div
            className="flex flex-col gap-2 mt-5"
            variants={featureList}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
          >
            <h5 className="mb-2 text-base font-semibold text-center">EL PLAN INCLUYE</h5>
            {PLAN_FULL.map((item) => (
              <motion.div key={item} variants={featureItem} className="flex items-center gap-3 w-fit">
                <FaCheck color="#dd4924" size={12} />
                <span className="text-sm text-black">{item}</span>
              </motion.div>
            ))}
          </motion.div>

          <div className="w-full h-px bg-black/20 my-8" />

          <div className="flex justify-center w-full mt-auto">
            <ShimmerButton primary href="/register" className="w-full">
              Comenzar Plan Full
            </ShimmerButton>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PricingSection;
