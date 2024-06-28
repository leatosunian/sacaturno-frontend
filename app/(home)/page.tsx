import Image from "next/image";
import homeStyles from "@/app/css-modules/HomeWhite.module.css";
import styles from "@/app/css-modules/login.module.css";
import sacaturno_logo from "@/public/deviceframes2.png";
import { IoIosSearch } from "react-icons/io";
import Link from "next/link";
import { CiLogin } from "react-icons/ci";
import { MdOutlineAddBusiness } from "react-icons/md";
import { FaArrowDown, FaCheck } from "react-icons/fa6";
import PricingSection from "@/components/home/PricingSection";
import HeaderPublic from "@/components/HeaderPublic";
import { Metadata } from "next";
import Accordion from "@/components/Accordion";
import HeaderPublicBlack from "@/components/HeaderPublicBlack";
import FAQSection from "@/components/home/FAQSection";
import HeroSection from "@/components/home/HeroSection";

export const metadata: Metadata = {
  title: "SacaTurno | Tu app de turnos online",
  description: "Aplicación de turnos online",
};

export default function Home() {
  return (
    <>
      <HeaderPublicBlack />
      <HeroSection/>
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
          margin: "5rem auto",
        }}
        className="block lg:hidden"
      ></div>
      {/* DIVIDER */}
      <FAQSection />
    </>
  );
}
