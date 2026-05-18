"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Star, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const FALLBACK_SLIDES = [
  { image: "/hero-1.jpg" },
  { image: "/hero-2.jpg" },
  { image: "/hero-3.jpg" },
];

interface RecommendedKaraoke {
  id: string;
  image: string;
  name: string;
  location: string;
  rating: number | null;
  price: string;
  hours: string;
}

interface HeroCarouselProps {
  recommended?: RecommendedKaraoke[];
}

const HeroCarousel = ({ recommended = [] }: HeroCarouselProps) => {
  const slides = recommended.length > 0 ? recommended : FALLBACK_SLIDES;
  const [current, setCurrent] = useState(0);
  const router = useRouter();

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % slides.length),
    [slides.length]
  );

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + slides.length) % slides.length),
    [slides.length]
  );

  const currentSlide = slides[current];
  const isKaraoke = recommended.length > 0;
  const karaoke = isKaraoke ? (currentSlide as RecommendedKaraoke) : null;

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
            src={currentSlide.image}
            alt={karaoke?.name ?? "Hero background"}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        </motion.div>
      </AnimatePresence>

      {/* karaoke info overlay */}
      {karaoke && (
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="absolute bottom-16 left-6 right-6 sm:bottom-20 sm:left-12 sm:right-12"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
              Recommended
            </p>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              {karaoke.name}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-primary" />
                {karaoke.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-primary" />
                {karaoke.hours}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                {karaoke.rating === null ? "New" : karaoke.rating}
              </span>
              <span className="font-bold text-primary">{karaoke.price}</span>
            </div>
            <Button
              variant="neon"
              className="mt-5 rounded-xl px-6"
              onClick={() => router.push(`/book/${karaoke.id}`)}
            >
              Book Now
            </Button>
          </motion.div>
        </AnimatePresence>
      )}

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