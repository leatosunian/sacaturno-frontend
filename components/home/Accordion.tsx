"use client";
import { motion } from "framer-motion";
import React from "react";

interface AccordionProps {
  title: string;
  answer: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const Accordion = ({ title, answer, isOpen, onToggle }: AccordionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.3, once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`w-full mb-3 2xl:mb-4 h-fit accordionCard ${isOpen ? "accordionCardActive" : ""}`}
    >
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-5 py-4 2xl:px-6 2xl:py-5 group cursor-pointer"
      >
        <span
          className={`font-semibold text-left text-sm 2xl:text-base transition-colors duration-200 ${
            isOpen ? "text-orange-600" : "text-gray-800 [@media(hover:hover)]:group-hover:text-orange-600"
          }`}
        >
          {title}
        </span>
        <svg
          className={`ml-6 shrink-0 transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : ""}`}
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.5 6.75L9 11.25L13.5 6.75"
            stroke={isOpen ? "#dd4924" : "#9ca3af"}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: "stroke 0.2s ease" }}
          />
        </svg>
      </button>
      <div
        className={`grid overflow-hidden accordionAnswer transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="text-sm 2xl:text-base text-gray-500 px-5 2xl:px-6 pt-3 pb-5 2xl:pb-6">
            {answer}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Accordion;
