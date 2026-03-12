"use client";
import { KaraokeCard } from "./KaraokeCard";

export const KaraokeSection = () => {
  const karaoke = [
    {
      _id: 123,
      id: 1,
      name: "Galaxy Karaoke",
      location: "Ulaanbaatar, Seoul Street",
      rating: 4.6,
      price: "30,000₮ / hour",
      image: "/room2.png",
    },
    {
      _id: 124,
      id: 2,
      name: "Star Night Karaoke",
      location: "Ulaanbaatar, Sukhbaatar District",
      rating: 4.4,
      price: "25,000₮ / hour",
      image: "/room2.png",
    },
    {
      _id: 125,
      id: 3,
      name: "Royal Voice Karaoke",
      location: "Ulaanbaatar, Peace Avenue",
      rating: 4.7,
      price: "35,000₮ / hour",
      image: "/room3.png",
    },
    {
      _id: 126,
      id: 4,
      name: "Moonlight Karaoke",
      location: "Ulaanbaatar, Khan-Uul District",
      rating: 4.3,
      price: "28,000₮ / hour",
      image: "/karaoke.jpg",
    },
    {
      _id: 127,
      id: 5,
      name: "VIP Sound Karaoke",
      location: "Ulaanbaatar, Bayanzurkh District",
      rating: 4.8,
      price: "40,000₮ / hour",
      image: "/room2.png",
    },
    {
      _id: 128,
      id: 6,
      name: "Neon Beats Karaoke",
      location: "Ulaanbaatar, Chingeltei District",
      rating: 4.5,
      price: "32,000₮ / hour",
      image: "/room2.png",
    },
  ];

  return (
    <section className="w-full flex justify-center py-16
                       bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl w-full px-6">

        <h2 className="text-3xl font-bold text-center mb-12
                       text-gray-900 dark:text-gray-100">
          Popular Karaoke Spots
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
          {karaoke.map(item => (
            <KaraokeCard key={item.id} karaoke={item} />
          ))}
        </div>

      </div>
    </section>
  );
};
