"use client";

import React, { useState } from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { motion } from "framer-motion";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const AccordionItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className={`border rounded-2xl overflow-hidden bg-card transition-all duration-300 ${
      isOpen 
        ? "border-primary/50 shadow-[0_12px_32px_rgba(201,109,46,0.06)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.2)]" 
        : "border-border/40 dark:border-border/10 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:border-primary/20"
    }`}>
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center p-6 text-left font-bold text-base md:text-lg text-foreground hover:text-primary transition-colors cursor-pointer select-none focus:outline-none"
      >
        <span>{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`shrink-0 ml-4 transition-colors ${isOpen ? "text-primary" : "text-muted/60"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </motion.span>
      </button>
      
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="p-6 pt-0 text-sm md:text-base text-muted leading-relaxed border-t border-border/30 dark:border-border/10 select-none">
          {answer}
        </div>
      </motion.div>
    </div>
  );
};

export const FAQSection: React.FC = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems = [
    {
      qKey: "faqQ1",
      aKey: "faqA1",
    },
    {
      qKey: "faqQ2",
      aKey: "faqA2",
    },
    {
      qKey: "faqQ3",
      aKey: "faqA3",
    },
    {
      qKey: "faqQ4",
      aKey: "faqA4",
    },
    {
      qKey: "faqQ5",
      aKey: "faqA5",
    },
    {
      qKey: "faqQ6",
      aKey: "faqA6",
    },
    {
      qKey: "faqQ7",
      aKey: "faqA7",
    },
    {
      qKey: "faqQ8",
      aKey: "faqA8",
    },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="relative py-20 lg:py-28 select-none bg-linear-to-b from-transparent via-secondary/15 to-transparent border-t border-border/30 dark:border-border/10 transition-colors duration-300">
      {/* Background blur decorative element */}
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-success/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="container mx-auto px-6 z-10 relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          
          {/* Left Column: Header Content */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="section-sub shadow-xs mb-4"
            >
              {t("landing.faqBadge")}
            </motion.span>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="section-title text-3xl sm:text-4xl md:text-5xl mt-4 mb-6"
            >
              {t("landing.faqTitle")}
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="section-desc text-base sm:text-lg max-w-xl mb-8"
            >
              {t("landing.faqSubtitle")}
            </motion.p>
          </div>

          {/* Right Column: Accordion Container */}
          <div className="lg:col-span-7 flex flex-col gap-4 w-full">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <AccordionItem
                  question={t(`landing.${item.qKey}`)}
                  answer={t(`landing.${item.aKey}`)}
                  isOpen={openIndex === index}
                  onClick={() => handleToggle(index)}
                />
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default FAQSection;
