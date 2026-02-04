"use client";
import PricingSection from "@/components/home/PricingSection";
import HeaderPublicBlack from "@/components/home/HeaderPublicBlack";
import FAQSection from "@/components/home/FAQSection";
import HeroSection from "@/components/home/HeroSection";
import Footer from "@/components/home/Footer";
import { AnimatePresence, motion } from "framer-motion";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import CallToAction from "@/components/home/CallToAction";

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

        <div
          style={{
            width: "40%",
            height: "1px",
            background: "rgba(255, 255, 255, 0.2)",
            margin: "0px auto 10rem auto",
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
          className="block overflow-hidden lg:hidden"
        ></div>

        <Features />
        <div
          style={{
            width: "40%",
            height: "1px",
            background: "rgba(255, 255, 255, 0.2)",
            margin: "0px auto 8rem auto",
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
          className="block overflow-hidden lg:hidden"
        ></div>
        <PricingSection />

        {/* DIVIDER */}
        <div
          style={{
            width: "40%",
            height: "1px",
            background: "rgba(255, 255, 255, 0.2)",
            margin: "0px auto 6.5rem auto",
          }}
          className="hidden overflow-hidden lg:block "
        ></div>
        <div
          style={{
            width: "40%",
            height: "1px",
            background: "rgba(255, 255, 255, 0.2)",
            margin: "2rem auto",
          }}
          className="block overflow-hidden lg:hidden "
        ></div>

        {/* DIVIDER */}


        <Testimonials />

        {/* DIVIDER */}
        <div
          style={{
            width: "40%",
            height: "1px",
            background: "rgba(255, 255, 255, 0.2)",
            margin: "0px auto 6.5rem auto",
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


        <CallToAction />

        <Footer />
      </AnimatePresence>
    </>
  );
}
