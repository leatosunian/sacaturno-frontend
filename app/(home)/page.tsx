"use client";
import PricingSection from "@/components/home/PricingSection";
import HeaderPublicBlack from "@/components/home/HeaderPublicBlack";
import FAQSection from "@/components/home/FAQSection";
import HeroSection from "@/components/home/HeroSection";
import Footer from "@/components/home/Footer";
import { AnimatePresence, motion } from "framer-motion";

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
          <HeroSection />
        </motion.div>

        <PricingSection />
        <div id="faq"></div>
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
