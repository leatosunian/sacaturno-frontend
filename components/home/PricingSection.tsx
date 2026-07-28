"use client";
import { FaCheck, FaMedal, FaRocket, FaGem } from "react-icons/fa6";
import { MdMoneyOff } from "react-icons/md";
import { SiAdguard } from "react-icons/si";
import { motion } from "framer-motion";
import { Badge } from "./Badge";
import { ShimmerButton } from "@/components/ui/ShimmerButton";
import { PAID_PLAN_CARDS, PaidPlan } from "@/lib/planLimits";

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
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.05 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 44, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease } },
};

const featureList = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};

const featureItem = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

// El plan gratis tiene las mismas prestaciones que el Plan Básico durante la prueba.
const PLAN_PRUEBA = [
  "Prueba gratuita de 15 días",
  ...PAID_PLAN_CARDS.find((card) => card.plan === "SC_BASIC")!.features,
];

const getPlanIcon = (plan: PaidPlan, isPro: boolean) => {
  const color = isPro ? "white" : "#dd4924";
  if (plan === "SC_BASIC") return <FaRocket color={color} size={17} />;
  if (plan === "SC_PRO") return <FaGem color={color} size={17} />;
  return <FaMedal color={color} size={17} />;
};

const PricingSection = () => {
  return (
    <div
      id="pricing"
      className="flex relative overflow-hidden flex-col items-center justify-center w-full gap-14 text-black h-fit pt-24 pb-16 lg:py-20 2xl:py-28"
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
        className="w-full text-center h-fit px-6"
        variants={headerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        <motion.div variants={headerItem}>
          <Badge
            className="rounded-full text-orange-600 bg-orange-50 px-4 py-1.5 text-sm font-medium mb-5"
            variant="secondary"
          >
            Planes
          </Badge>
        </motion.div>
        <motion.h2
          variants={headerItem}
          className="text-3xl mb-4 font-bold tracking-tight md:text-4xl 2xl:text-5xl"
        >
          Simple. Accesible. A tu medida.
        </motion.h2>
        <motion.p
          variants={headerItem}
          className="text-base text-gray-500 max-w-xl mx-auto mb-3 leading-relaxed px-4 md:px-0"
        >
          Cada turno sin confirmar es plata que perdés. Con SacaTurno
          automatizás tu agenda, cobrás señas y eliminás las ausencias.
        </motion.p>
        <motion.p
          variants={headerItem}
          className="text-base text-gray-500 font-bold md:text-lg max-w-xl mx-auto mb-3 leading-relaxed px-4 md:px-0"
        >
          <span className="text-orange-600  ">Probalo gratis 15 días</span> y
          escalá de plan cuando lo necesites.
        </motion.p>
        {/* <motion.span
          variants={headerItem}
          className="flex items-center justify-center gap-2 text-sm text-gray-400"
        >
          <SiAdguard className="hidden md:block" size={13} />
          Pagá de manera segura mediante Mercado Pago
        </motion.span> */}
      </motion.div>

      {/* Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 items-stretch gap-10 sm:gap-5 lg:gap-4 w-[95%] max-w-7xl mx-auto py-4"
        variants={cardsContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* Plan Prueba */}
        <motion.div
          variants={cardVariant}
          whileHover={{
            y: -6,
            transition: { duration: 0.25, ease: "easeOut" },
          }}
          className="relative flex flex-col w-full rounded-2xl p-5 z-[20] bg-white/65 backdrop-blur-md border border-black/[0.09] shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        >
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 flex-shrink-0">
                <MdMoneyOff color="#dd4924" size={18} />
              </span>
              <h4 className="text-2xl font-bold text-black">Plan Prueba</h4>
            </div>
            <span className="text-3xl font-bold text-black">GRATIS</span>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            {PLAN_PRUEBA.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-orange-50 flex items-center justify-center">
                  <FaCheck color="#dd4924" size={7} />
                </span>
                <span className="text-xs text-gray-600">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-7">
            <ShimmerButton primary href="/register" className="w-full">
              Comenzar Gratis
            </ShimmerButton>
          </div>
        </motion.div>

        {/* Planes pagos: Básico, Pro, Full */}
        {PAID_PLAN_CARDS.map((card) => {
          const isPro = card.plan === "SC_PRO";
          return (
            <motion.div
              key={card.plan}
              variants={cardVariant}
              whileHover={{
                y: isPro ? -8 : -6,
                transition: { duration: 0.25, ease: "easeOut" },
              }}
              className={`relative flex flex-col w-full rounded-2xl p-5 z-[20] transition-shadow duration-300 cursor-pointer ${
                isPro
                  ? "bg-orange-600 text-white shadow-2xl shadow-orange-300/40"
                  : "bg-white/65 backdrop-blur-md border border-black/[0.09] shadow-md hover:shadow-lg text-black"
              }`}
            >
              {isPro && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white text-orange-600 text-[10px] font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap tracking-widest">
                  MÁS ELEGIDO
                </span>
              )}

              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                      isPro ? "bg-white/20" : "bg-orange-50"
                    }`}
                  >
                    {getPlanIcon(card.plan, isPro)}
                  </span>
                  <h4
                    className={`text-2xl font-bold ${isPro ? "text-white" : "text-black"}`}
                  >
                    {card.label}
                  </h4>
                </div>
                <div className="flex items-end gap-1.5">
                  <span
                    className={`text-3xl font-bold ${isPro ? "text-white" : "text-black"}`}
                  >
                    ${card.price.toLocaleString("es-AR")}
                  </span>
                  <span
                    className={`text-xs mb-1 ${isPro ? "text-orange-100" : "text-gray-500"}`}
                  >
                    ARS/mes
                  </span>
                </div>
              </div>

              <motion.div
                className="flex flex-col gap-2 flex-1"
                variants={featureList}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
              >
                {card.features.map((item) => (
                  <motion.div
                    key={item}
                    variants={featureItem}
                    className="flex items-center gap-2"
                  >
                    <span
                      className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                        isPro ? "bg-white/25" : "bg-orange-50"
                      }`}
                    >
                      <FaCheck color={isPro ? "white" : "#dd4924"} size={8} />
                    </span>
                    <span
                      className={`text-xs whitespace-nowrap ${isPro ? "text-orange-50" : "text-gray-600"}`}
                    >
                      {item}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              <div className="mt-7">
                {isPro ? (
                  <a
                    href="/register"
                    className="flex items-center justify-center w-full py-[15px] px-9 bg-white text-orange-600 font-bold text-[14px] rounded-xl hover:bg-orange-50 transition-all duration-[180ms] hover:opacity-90 hover:-translate-y-px"
                  >
                    Comenzar {card.label}
                  </a>
                ) : (
                  <ShimmerButton primary href="/register" className="w-full">
                    Comenzar {card.label}
                  </ShimmerButton>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default PricingSection;
