"use client";

import { motion } from "framer-motion";
import { DollarSign, Star, Navigation, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const filters = [
  { icon: DollarSign, label: "Price Range" },
  { icon: Star, label: "Rating" },
  { icon: Navigation, label: "Distance" },
  { icon: Clock, label: "Open Now" },
  { icon: Users, label: "Room Size" },
];

const FilterBar = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="flex flex-wrap items-center justify-center gap-3 py-6"
  >
    {filters.map(({ icon: Icon, label }) => (
      <Button
        key={label}
        variant="outline"
        className="rounded-full border-border px-5 py-2 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary hover:text-primary hover:neon-glow-subtle"
      >
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Button>
    ))}
  </motion.div>
);

export default FilterBar;