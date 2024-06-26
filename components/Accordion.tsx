"use client";

import { useState } from "react";

const Accordion = ({ title, answer }: { title: string; answer: string }) => {
  const [accordionActive, setAccordionActive] = useState(false);

  return (
    <div className="w-full mb-3 text-white h-fit accordionCard">
      <button
        onClick={() => setAccordionActive(!accordionActive)}
        className="flex items-center justify-between w-full h-full px-6 py-6"
      >
        <span className="font-medium text-md xl:text-lg">{title}</span>
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
            ? "grid-rows-[1fr] opacity-100 px-6 py-3"
            : "grid-rows-[0fr] opacity-0 px-0 py-0"
        }`}
      >
        <p className={`overflow-hidden  ${
          accordionActive
            ? " py-3"
            : "py-0"
        }`}>
          {answer}
        </p>
      </div>
    </div>
  );
};

export default Accordion;
