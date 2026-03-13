"use client";

import Navbar from "@/_components/navbar";
import HeroCarousel from "@/_components/HeroCarousel";
import FilterBar from "@/_components/FilterBar";
import KaraokeCard from "@/_components/KaraokeCard";
import MapPreview from "@/_components/MapPreview";
import CustomerReviews from "@/_components/CustomerReviews";
import Footer from "@/_components/Footer";
import { motion } from "framer-motion";

const karaokeSpots = [
  {
    image: "/karaoke-card-1.jpg",
    name: "Neon Lounge",
    location: "Shibuya, Tokyo",
    rating: 4.9,
    price: "$25/hr",
    hours: "6 PM – 2 AM",
  },
  {
    image: "/karaoke-card-2.jpg",
    name: "Star Karaoke",
    location: "Koreatown, LA",
    rating: 4.7,
    price: "$18/hr",
    hours: "4 PM – 12 AM",
  },
  {
    image: "/karaoke-card-3.jpg",
    name: "VIP Suite KTV",
    location: "Midtown, NYC",
    rating: 4.8,
    price: "$45/hr",
    hours: "5 PM – 3 AM",
  },
  {
    image: "/karaoke-card-4.jpg",
    name: "Mic Drop Bar",
    location: "Downtown, SF",
    rating: 4.6,
    price: "$22/hr",
    hours: "7 PM – 1 AM",
  },
  {
    image: "/karaoke-card-5.jpg",
    name: "Echo Room",
    location: "Soho, London",
    rating: 4.5,
    price: "$30/hr",
    hours: "6 PM – 12 AM",
  },
  {
    image: "/karaoke-card-6.jpg",
    name: "Stage Light KTV",
    location: "Hollywood, LA",
    rating: 4.8,
    price: "$35/hr",
    hours: "5 PM – 2 AM",
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

        <FilterBar />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {karaokeSpots.map((spot, i) => (
            <KaraokeCard key={spot.name} {...spot} index={i} />
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

      <CustomerReviews />
      <Footer />
    </div>
  );
};

export default Index;