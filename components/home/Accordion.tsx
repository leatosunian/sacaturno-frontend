"use client";
import { motion } from "framer-motion";
import { useState } from "react";

const Accordion = ({ title, answer }: { title: string; answer: string }) => {
  const [accordionActive, setAccordionActive] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ amount: "all", once: true }}
      className="w-full mb-4 lg:mb-4 2xl:mb-6 text-white h-fit accordionCard"
    >
      <button
        onClick={() => setAccordionActive(!accordionActive)}
        className="flex items-center justify-between w-full h-full px-4 py-4 lg:px-5 lg:py-4 2xl:px-6 2xl:py-6"
      >
        <span className="font-medium text-left text-sm lg:text-sm 2xl:text-base xl:2xl:text-lg">{title}</span>
        <svg
          className="ml-8 fill-orange-600 shrink-0"
          width="16"
          height="16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center transition duration-200 ease-out ${
              accordionActive && "!rotate-180"
            }`}
          />
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center rotate-90 transition duration-200 ease-out ${
              accordionActive && "!rotate-180"
            }`}
          />
        </svg>
      </button>
      <div
        className={`grid overflow-hidden accordionAnswer transition-all duration-300 ease-in-out text-sm  ${
          accordionActive
            ? "grid-rows-[1fr] opacity-100 px-4 lg:px-5 2xl:px-6 py-2 2xl:py-3"
            : "grid-rows-[0fr] opacity-0 px-0 py-0"
        }`}
      >
        <p className={`overflow-hidden text-xs lg:text-xs 2xl:text-sm md:2xl:text-base  ${accordionActive ? " py-2 2xl:py-3" : "py-0"}`}>
          {answer}
        </p>
      </div>
    </motion.div>
  );
};

export default Accordion;
