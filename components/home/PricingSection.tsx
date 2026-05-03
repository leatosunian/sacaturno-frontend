"use client";
import { FaCheck, FaMedal } from "react-icons/fa6";
import { MdMoneyOff } from "react-icons/md";
import { SiAdguard } from "react-icons/si";
import { motion } from "framer-motion";
import { Badge } from "./Badge";
import { ShimmerButton } from "@/components/ui/ShimmerButton";

const PricingSection = () => {
  return (
    <div id="pricing" className="flex flex-col items-center justify-center w-full gap-12 text-black h-fit pt-24 pb-16 lg:py-18 2xl:py-24">

      {/* Header */}
      <div className="w-full text-center h-fit">
        <Badge className="rounded-full text-orange-600 bg-orange-50 px-4 py-1.5 text-sm font-medium mb-4" variant="secondary">
          Planes
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Simple. Accesible. A tu medida.
        </h2>
        <span className="flex items-center justify-center gap-2 mt-4 text-lg font-normal text-gray-600 px-7 md:px-0">
          <SiAdguard className="hidden md:block" />
          Pagá de manera segura mediante Mercado Pago
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col items-center gap-6 w-[90%] md:flex-row md:w-fit md:gap-9 md:px-20 md:py-9">

        {/* Plan Prueba */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ amount: "some", once: true }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="flex flex-col w-full md:w-[360px] h-full rounded-xl p-6 md:p-[30px] text-black bg-white/10 border  border-black/[0.15]  shadow-lg hover:border-orange-800/15   transition-all duration-200 md:hover:shadow-orange-800/20 cursor-pointer "
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

          <div className="flex flex-col gap-2 mt-5">
            <h5 className="mb-2 text-sm font-semibold text-center">EL PLAN INCLUYE</h5>
            {[
              "Prueba gratuita de 15 días",
              "1 servicio por empresa",
              "Un turno por horario",
              "Notificaciones por email",
              "Soporte 24/7",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 w-fit">
                <FaCheck color="#dd4924" size={12} />
                <span className="text-xs text-black">{item}</span>
              </div>
            ))}
          </div>

          <div className="w-full h-px bg-black/20 my-8" />

          <div className="flex justify-center w-full mt-auto">
            <ShimmerButton primary href="/register" className="w-full">
              Comenzar Prueba Gratuita
            </ShimmerButton>
          </div>
        </motion.div>

        {/* Plan Full */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ amount: "some", once: true }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="flex flex-col w-full md:w-[360px] h-full rounded-[15px] p-6 md:p-[30px] text-black bg-white/10 border border-black/[0.15] shadow-[7px_10px_25px_1px_rgba(0,0,0,0.2)]"
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

          <div className="flex flex-col gap-2 mt-5">
            <h5 className="mb-2 text-sm font-semibold text-center">EL PLAN INCLUYE</h5>
            {[
              "Reservas con seña",
              "Turnos ilimitados",
              "Servicios ilimitados",
              "Notificaciones por email",
              "Turnos simultáneos en un mismo horario",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 w-fit">
                <FaCheck color="#dd4924" size={12} />
                <span className="text-xs text-black">{item}</span>
              </div>
            ))}
          </div>

          <div className="w-full h-px bg-black/20 my-8" />

          <div className="flex justify-center w-full mt-auto">
            <ShimmerButton primary href="/register" className="w-full">
              Comenzar Plan Full
            </ShimmerButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingSection;
