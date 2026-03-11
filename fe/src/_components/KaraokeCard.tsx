"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

interface KaraokeCardProps {
  karaoke: {
    _id: number;
    image: string;
    name: string;
    location: string;
    rating: number;
    price?: string;
  };
}

export const KaraokeCard = ({ karaoke }: KaraokeCardProps) => {
  return (
    <Card
      className="w-72 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800"
    >
      <div className="relative w-full h-48">
        <Image
          src={karaoke.image}
          alt={karaoke.name}
          fill
          className="object-cover"
        />
      </div>

      <CardContent className="flex flex-col gap-3">
        <CardTitle className="text-[#c51383] font-bold text-[20px] dark:text-pink-400">
          {karaoke.name}
        </CardTitle>

        <p className="flex gap-2 items-center text-black dark:text-gray-300 text-sm">
          <MapPin size={16} /> {karaoke.location}
        </p>

        {karaoke.price && (
          <p className="text-gray-900 dark:text-gray-100 font-semibold">
            {karaoke.price}
          </p>
        )}

        <p className="flex gap-2 items-center text-black dark:text-gray-100">
          <Star size={16} className="text-yellow-400" />
          {karaoke.rating}/10
        </p>
      </CardContent>

      <CardFooter className="pt-0">
        <Link href={`/karaoke/${karaoke._id}`} className="w-full">
          <Button
            variant="ghost"
            className="w-full text-white bg-[#c51383] dark:bg-pink-600 flex items-center justify-center gap-2"
          >
            Захиалах <ArrowRight size={16} />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};