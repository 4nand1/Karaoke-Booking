"use client";

import { KaraokeCard } from "./KaraokeCard";

export const KaraokeSection = () => {
  const karaoke = [
    {
      id: 1,
      name: "Galaxy Karaoke",
      location: "Ulaanbaatar, Seoul Street",
      rating: 4.6,
      price: "30,000₮ / hour",
      image: "/karaoke1.jpg",
    },
    {
      id: 2,
      name: "Star Night Karaoke",
      location: "Ulaanbaatar, Sukhbaatar District",
      rating: 4.4,
      price: "25,000₮ / hour",
      image: "/karaoke2.jpg",
    },
    {
      id: 3,
      name: "Royal Voice Karaoke",
      location: "Ulaanbaatar, Peace Avenue",
      rating: 4.7,
      price: "35,000₮ / hour",
      image: "/karaoke3.jpg",
    },
    {
      id: 4,
      name: "Moonlight Karaoke",
      location: "Ulaanbaatar, Khan-Uul District",
      rating: 4.3,
      price: "28,000₮ / hour",
      image: "/karaoke4.jpg",
    },
    {
      id: 5,
      name: "VIP Sound Karaoke",
      location: "Ulaanbaatar, Bayanzurkh District",
      rating: 4.8,
      price: "40,000₮ / hour",
      image: "/karaoke5.jpg",
    },
    {
      id: 6,
      name: "Neon Beats Karaoke",
      location: "Ulaanbaatar, Chingeltei District",
      rating: 4.5,
      price: "32,000₮ / hour",
      image: "/karaoke6.jpg",
    },
  ];

  return (
    <div className="grid grid-cols-2 grid-rows-3">
      {karaoke.map((karaoke) => (
        <KaraokeCard key={karaoke.id} karaoke={karaoke} />
      ))}
    </div>
  );
};
