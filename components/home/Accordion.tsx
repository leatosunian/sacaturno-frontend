"use client";
import React from "react";

interface AccordionProps {
  title: string;
  answer: React.ReactNode;
  tag?: string;
  isOpen: boolean;
  onToggle: () => void;
}

const Accordion = ({ title, answer, tag, isOpen, onToggle }: AccordionProps) => {
  return (
    <div className="w-full border-b border-black/[0.08]">
      <button
        onClick={onToggle}
        className="group flex items-center justify-between w-full gap-5 py-3.5 2xl:py-4 text-left cursor-pointer"
      >
        <span className="flex items-center min-w-0 gap-3">
          {tag && (
            <span
              className={`hidden sm:inline-block shrink-0 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${
                isOpen
                  ? "bg-orange-100 text-orange-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {tag}
            </span>
          )}
          <span
            className={`font-semibold text-[15px] 2xl:text-base transition-colors duration-200 ${
              isOpen
                ? "text-orange-600"
                : "text-gray-800 [@media(hover:hover)]:group-hover:text-orange-600"
            }`}
          >
            {title}
          </span>
        </span>
        <span
          className={`flex items-center justify-center w-8 h-8 shrink-0 rounded-full border transition-all duration-300 ${
            isOpen
              ? "bg-orange-600 border-orange-600 rotate-180"
              : "border-black/10 [@media(hover:hover)]:group-hover:border-orange-300"
          }`}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.5 6.75L9 11.25L13.5 6.75"
              stroke={isOpen ? "#ffffff" : "#6b7280"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: "stroke 0.2s ease" }}
            />
          </svg>
        </span>
      </button>
      <div
        className={`grid overflow-hidden faqAnswer transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="text-sm 2xl:text-base text-gray-500 max-w-[640px] pb-6 2xl:pb-7">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accordion;
