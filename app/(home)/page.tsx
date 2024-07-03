"use client";
import PricingSection from "@/components/home/PricingSection";
import { Metadata } from "next";
import HeaderPublicBlack from "@/components/HeaderPublicBlack";
import FAQSection from "@/components/home/FAQSection";
import HeroSection from "@/components/home/HeroSection";
import Footer from "@/components/home/Footer";
import { AnimatePresence, motion } from "framer-motion";

export const metadata: Metadata = {
  title: "SacaTurno | Tu app de turnos online",
  description: "Aplicación de turnos online",
};

export default function Home() {
  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeInOut" }}
        >
          <HeaderPublicBlack />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          exit={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeInOut" }}
        >
          <HeroSection />
        </motion.div>

        <PricingSection />
        {/* DIVIDER */}
        <div
          style={{
            width: "40%",
            height: "1px",
            background: "rgba(255, 255, 255, 0.2)",
            margin: "0px auto 5rem auto",
          }}
          className="hidden lg:block"
        ></div>
        <div
          style={{
            width: "40%",
            height: "1px",
            background: "rgba(255, 255, 255, 0.2)",
            margin: "2rem auto",
          }}
          className="block lg:hidden"
        ></div>
        {/* DIVIDER */}
        <FAQSection />
        <div
          style={{
            width: "40%",
            height: "1px",
            background: "rgba(255, 255, 255, 0.2)",
            margin: "5.4rem auto",
          }}
          className="hidden lg:block"
        ></div>
        <div
          style={{
            width: "40%",
            height: "1px",
            background: "rgba(255, 255, 255, 0.2)",
            margin: "3.5rem auto",
          }}
          className="block lg:hidden"
        ></div>
        <Footer />
      </AnimatePresence>
    </>
  );
}
