"use client";
import PricingSection from "@/components/home/PricingSection";
import HeaderPublicBlack from "@/components/home/HeaderPublicBlack";
import FAQSection from "@/components/home/FAQSection";
import HeroSection from "@/components/home/HeroSection";
import Footer from "@/components/home/Footer";
import { motion } from "framer-motion";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import CallToAction from "@/components/home/CallToAction";

export default function Home() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        exit={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeInOut" }}
      >
        <HeaderPublicBlack />
        <HeroSection />
      </motion.div>

      <Features />
      <PricingSection />
      <Testimonials />
      <FAQSection />
      <CallToAction />

      <Footer />
    </>
  );
}
