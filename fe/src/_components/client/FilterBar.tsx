"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  Star,
  Clock,
  Users,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export type FilterValues = {
  priceSort: "default" | "lowToHigh" | "highToLow";
  minRating: "all" | "4.0" | "4.5" | "4.8";
  openNow: boolean;
  roomSize: "all" | "small" | "medium" | "large" | "vip";
};

const defaultFilters: FilterValues = {
  priceSort: "default",
  minRating: "all",
  openNow: false,
  roomSize: "all",
};

const FilterBar = ({
  onChange,
}: {
  onChange?: (filters: FilterValues) => void;
}) => {
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);

  useEffect(() => {
    onChange?.(filters);
  }, [filters, onChange]);

  const updateFilter = <K extends keyof FilterValues>(
    key: K,
    value: FilterValues[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearAll = () => {
    setFilters(defaultFilters);
  };

  const hasActiveFilters =
    filters.priceSort !== "default" ||
    filters.minRating !== "all" ||
    filters.openNow ||
    filters.roomSize !== "all";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-8 space-y-4"
    >
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Filter karaoke spots
              </h3>
              <p className="text-sm text-muted-foreground">
                Sort and narrow down the best rooms for you
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={clearAll}
            disabled={!hasActiveFilters}
            className="rounded-full"
          >
            <X className="mr-2 h-4 w-4" />
            Clear all
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-background/60 p-4">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <DollarSign className="h-4 w-4 text-primary" />
              Price
            </label>
            <select
              value={filters.priceSort}
              onChange={(e) =>
                updateFilter(
                  "priceSort",
                  e.target.value as FilterValues["priceSort"],
                )
              }
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
            >
              <option value="default">Default</option>
              <option value="lowToHigh">Low to high</option>
              <option value="highToLow">High to low</option>
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-background/60 p-4">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Star className="h-4 w-4 text-primary" />
              Rating
            </label>
            <select
              value={filters.minRating}
              onChange={(e) =>
                updateFilter(
                  "minRating",
                  e.target.value as FilterValues["minRating"],
                )
              }
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
            >
              <option value="all">All ratings</option>
              <option value="4.0">4.0+</option>
              <option value="4.5">4.5+</option>
              <option value="4.8">4.8+</option>
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-background/60 p-4">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Users className="h-4 w-4 text-primary" />
              Room size
            </label>
            <select
              value={filters.roomSize}
              onChange={(e) =>
                updateFilter(
                  "roomSize",
                  e.target.value as FilterValues["roomSize"],
                )
              }
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
            >
              <option value="all">All sizes</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="vip">VIP</option>
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-background/60 p-4">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Availability
            </label>

            <button
              type="button"
              onClick={() => updateFilter("openNow", !filters.openNow)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                filters.openNow
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-foreground"
              }`}
            >
              <span>{filters.openNow ? "Open now only" : "Any time"}</span>
              <span
                className={`h-3 w-3 rounded-full ${
                  filters.openNow ? "bg-primary" : "bg-muted-foreground"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.priceSort !== "default" && (
            <div className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              Price:{" "}
              {filters.priceSort === "lowToHigh"
                ? "Low to high"
                : "High to low"}
            </div>
          )}

          {filters.minRating !== "all" && (
            <div className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              Rating: {filters.minRating}+
            </div>
          )}

          {filters.roomSize !== "all" && (
            <div className="rounded-full bg-primary/10 px-3 py-1 text-sm capitalize text-primary">
              Room: {filters.roomSize}
            </div>
          )}

          {filters.openNow && (
            <div className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              Open now
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default FilterBar;
