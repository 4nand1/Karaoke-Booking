"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

      {/* Search bar */}
      <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl sm:max-w-2xl"
        >
          <div className="glass flex items-center gap-2 rounded-2xl p-2 shadow-2xl">
            <div className="flex flex-1 items-center gap-3 px-3 sm:px-4">
              <Search className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="Search karaoke rooms, venues..."
                className="w-full bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none sm:py-3 sm:text-base"
              />
            </div>

            <Button variant="neon" className="rounded-xl px-5 py-4 sm:px-8 sm:py-6">
              Search
            </Button>
          </div>
        </motion.div>
      </div>

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
