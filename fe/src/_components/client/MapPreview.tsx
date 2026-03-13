"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const pins = [
  { x: "20%", y: "30%", name: "Neon Lounge", delay: 0 },
  { x: "55%", y: "45%", name: "Sing Star", delay: 0.2 },
  { x: "75%", y: "25%", name: "Mic Drop", delay: 0.4 },
  { x: "35%", y: "65%", name: "VoiceBox", delay: 0.6 },
  { x: "65%", y: "70%", name: "Echo Room", delay: 0.8 },
];

const MapPreview = () => (
  <section className="container mx-auto px-6 py-16">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
        Nearby Karaoke <span className="text-primary">Venues</span>
      </h2>
      <p className="mt-2 text-muted-foreground">
        Discover karaoke spots around you
      </p>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative mt-8 h-80 overflow-hidden rounded-3xl bg-secondary md:h-96"
    >
      <div className="absolute inset-0 opacity-20">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      {pins.map((pin) => (
        <motion.div
          key={pin.name}
          className="absolute z-10 flex flex-col items-center"
          style={{ left: pin.x, top: pin.y }}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: pin.delay, duration: 0.5 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: pin.delay }}
            className="cursor-pointer"
          >
            <div className="relative">
              <MapPin className="h-8 w-8 fill-primary text-primary drop-shadow-lg" />
              <div className="absolute -bottom-1 left-1/2 h-2 w-4 -translate-x-1/2 rounded-full bg-primary/30 blur-sm" />
            </div>
          </motion.div>

          <span className="mt-1 rounded-lg bg-card px-2 py-0.5 text-xs font-medium text-card-foreground shadow-sm">
            {pin.name}
          </span>
        </motion.div>
      ))}
    </motion.div>
  </section>
);

export default MapPreview;