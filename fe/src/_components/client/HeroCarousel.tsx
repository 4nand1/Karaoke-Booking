"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
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
    <section className="relative h-[90vh] min-h-150 overflow-hidden">
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

          {/* neon overlay only */}
          <div className="absolute inset-0 gradient-hero opacity-30 mix-blend-multiply" />
        </motion.div>
      </AnimatePresence>

      {/* Search bar */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <div className="glass flex items-center gap-3 rounded-2xl p-2 shadow-2xl">
            <div className="flex flex-1 items-center gap-3 px-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search karaoke rooms, venues..."
                className="w-full bg-transparent py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            <div className="hidden items-center gap-2 border-l border-border px-4 md:flex">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Location"
                className="w-32 bg-transparent py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            <Button variant="neon" className="rounded-xl px-8 py-6">
              Search
            </Button>
          </div>
        </motion.div>
      </div>

      {/* arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 glass rounded-full p-3 text-foreground transition-all hover:neon-glow"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 glass rounded-full p-3 text-foreground transition-all hover:neon-glow"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* dots */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
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