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
  minPrice: string;
  maxPrice: string;
  minRating: 0 | 1 | 2 | 3 | 4 | 5;
  openNow: boolean;
  roomSize: "all" | "small" | "large" | "vip";
};

const defaultFilters: FilterValues = {
  minPrice: "",
  maxPrice: "",
  minRating: 0,
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
    filters.minPrice.trim() !== "" ||
    filters.maxPrice.trim() !== "" ||
    filters.minRating > 0 ||
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
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={filters.minPrice}
                onChange={(e) => updateFilter("minPrice", e.target.value)}
                placeholder="Min"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
              />
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={filters.maxPrice}
                onChange={(e) => updateFilter("maxPrice", e.target.value)}
                placeholder="Max"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-background/60 p-4">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Star className="h-4 w-4 text-primary" />
              Rating
            </label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, index) => {
                const starValue = index + 1 as FilterValues["minRating"];
                const active = starValue <= filters.minRating;

                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() =>
                      updateFilter(
                        "minRating",
                        filters.minRating === starValue ? 0 : starValue,
                      )
                    }
                    className="rounded-full p-1 transition hover:scale-105"
                    aria-label={`Minimum ${starValue} star rating`}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        active
                          ? "fill-primary text-primary"
                          : "text-muted-foreground/50"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {filters.minRating > 0
                ? `${filters.minRating} stars and up`
                : "All ratings"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-background/60 p-4">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Users className="h-4 w-4 text-primary" />
              Room size
            </label>
            <div className="flex flex-wrap gap-2">
              {(["all", "small", "large", "vip"] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateFilter("roomSize", size)}
                  className={`rounded-full border px-3 py-2 text-sm font-medium capitalize transition ${
                    filters.roomSize === size
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground"
                  }`}
                >
                  {size === "all" ? "All sizes" : size}
                </button>
              ))}
            </div>
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
          {(filters.minPrice.trim() !== "" || filters.maxPrice.trim() !== "") && (
            <div className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              Price: {filters.minPrice.trim() || "0"} - {filters.maxPrice.trim() || "Any"}
            </div>
          )}

          {filters.minRating > 0 && (
            <div className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              Rating: {filters.minRating} stars+
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
