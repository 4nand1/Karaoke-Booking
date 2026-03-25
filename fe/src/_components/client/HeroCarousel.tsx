"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  { image: "/hero-1.jpg" },
  { image: "/hero-2.jpg" },
  { image: "/hero-3.jpg" },
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % slides.length),
    []
  );

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + slides.length) % slides.length),
    []
  );

  return (
    <section className="relative h-[72vh] min-h-[460px] overflow-hidden sm:h-[78vh] sm:min-h-[520px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={slides[current].image}
            alt="Hero background"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 gradient-hero opacity-30 mix-blend-multiply" />
        </motion.div>
      </AnimatePresence>

      {/* arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 glass rounded-full p-2.5 text-foreground transition-all hover:neon-glow sm:left-4 sm:p-3"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 glass rounded-full p-2.5 text-foreground transition-all hover:neon-glow sm:right-4 sm:p-3"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* dots */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-8">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-primary" : "w-2 bg-primary/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;