"use client";

import Navbar from "@/_components/client/navbar";
import HeroCarousel from "@/_components/client/HeroCarousel";
import FilterBar, { type FilterValues } from "@/_components/client/FilterBar";
import KaraokeCard from "@/_components/client/KaraokeCard";
import MapPreview from "@/_components/client/MapPreview";
import CustomerReviews from "@/_components/client/CustomerReviews";
import ReviewForm from "@/_components/client/ReviewForm";
import Footer from "@/_components/client/Footer";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

const karaokeSpots = [
  {
    image: "/karaoke-card-1.jpg",
    name: "Neon Lounge",
    location: "Shibuya, Tokyo",
    rating: 4.9,
    price: 25,
    hours: "6 PM – 2 AM",
    roomSize: "medium",
    isOpenNow: true,
  },
  {
    image: "/karaoke-card-2.jpg",
    name: "Star Karaoke",
    location: "Koreatown, LA",
    rating: 4.7,
    price: 18,
    hours: "4 PM – 12 AM",
    roomSize: "small",
    isOpenNow: true,
  },
  {
    image: "/karaoke-card-3.jpg",
    name: "VIP Suite KTV",
    location: "Midtown, NYC",
    rating: 4.8,
    price: 45,
    hours: "5 PM – 3 AM",
    roomSize: "vip",
    isOpenNow: true,
  },
  {
    image: "/karaoke-card-4.jpg",
    name: "Mic Drop Bar",
    location: "Downtown, SF",
    rating: 4.6,
    price: 22,
    hours: "7 PM – 1 AM",
    roomSize: "small",
    isOpenNow: false,
  },
  {
    image: "/karaoke-card-5.jpg",
    name: "Echo Room",
    location: "Soho, London",
    rating: 4.5,
    price: 30,
    hours: "6 PM – 12 AM",
    roomSize: "large",
    isOpenNow: true,
  },
  {
    image: "/karaoke-card-6.jpg",
    name: "Stage Light KTV",
    location: "Hollywood, LA",
    rating: 4.8,
    price: 35,
    hours: "5 PM – 2 AM",
    roomSize: "large",
    isOpenNow: true,
  },
];

const featuredRooms = [
  {
    image: "/karaoke-card-3.jpg",
    name: "Diamond VIP Suite",
    location: "Central, HK",
    rating: 5.0,
    price: "$80/hr",
    hours: "24 Hours",
  },
  {
    image: "/karaoke-card-1.jpg",
    name: "Neon Paradise",
    location: "Gangnam, Seoul",
    rating: 4.9,
    price: "$55/hr",
    hours: "6 PM – 4 AM",
  },
  {
    image: "/karaoke-card-4.jpg",
    name: "The Grand Stage",
    location: "Vegas Strip, LV",
    rating: 4.9,
    price: "$65/hr",
    hours: "24 Hours",
  },
];

const Index = () => {
  const [filters, setFilters] = useState<FilterValues>({
    priceSort: "default",
    minRating: "all",
    openNow: false,
    roomSize: "all",
  });

  const filteredSpots = useMemo(() => {
    const filtered = karaokeSpots.filter((spot) => {
      if (
        filters.minRating !== "all" &&
        spot.rating < Number(filters.minRating)
      ) {
        return false;
      }

      if (filters.openNow && !spot.isOpenNow) {
        return false;
      }

      if (filters.roomSize !== "all" && spot.roomSize !== filters.roomSize) {
        return false;
      }

      return true;
    });

    if (filters.priceSort === "lowToHigh") {
      return [...filtered].sort((a, b) => a.price - b.price);
    }

    if (filters.priceSort === "highToLow") {
      return [...filtered].sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [filters]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroCarousel />

      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Popular Karaoke <span className="text-primary">Spots</span>
          </h2>
          <p className="mt-2 text-muted-foreground">
            Top-rated venues loved by our community
          </p>
        </motion.div>

        <FilterBar onChange={setFilters} />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSpots.map((spot, i) => (
            <KaraokeCard
              key={spot.name}
              {...spot}
              price={`$${spot.price}/hr`}
              index={i}
            />
          ))}
        </div>
      </section>

      <MapPreview />

      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Featured <span className="text-primary">Rooms</span>
          </h2>
          <p className="mt-2 text-muted-foreground">
            Premium experiences hand-picked for you
          </p>
        </motion.div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredRooms.map((room, i) => (
            <KaraokeCard key={room.name} {...room} index={i} />
          ))}
        </div>
      </section>
{/* 
      <CustomerReviews /> */}
      <ReviewForm />
      <Footer />
    </div>
  );
};

export default Index;
