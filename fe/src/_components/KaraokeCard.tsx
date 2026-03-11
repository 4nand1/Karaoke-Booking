"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface KaraokeCardProps {
  karaoke: {
    image: string;
    name: string;
    location: string;
    rating: number;
    price?: string;
  };
}

export const KaraokeCard = ({ karaoke }: KaraokeCardProps) => {
  return (
    <Card className="w-72 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden
                     bg-white dark:bg-gray-800">
      
      {/* Image */}
      <div className="relative w-full h-48">
        <Image
          src={karaoke.image}
          alt={karaoke.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <CardContent className="flex flex-col gap-2">
        <CardTitle className="text-[#c51383] font-bold text-lg dark:text-pink-400">
          {karaoke.name}
        </CardTitle>

        <p className="text-gray-700 dark:text-gray-300 text-sm">{karaoke.location}</p>

        {karaoke.price && (
          <p className="text-gray-900 dark:text-gray-100 font-semibold">{karaoke.price}</p>
        )}

        <div className="flex items-center gap-1 text-yellow-400">
          <Star size={16} /> {karaoke.rating}/10
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          variant="ghost"
          className="w-full bg-[#c51383] text-white dark:bg-pink-600 dark:text-white flex justify-center items-center gap-2"
        >
          Захиалах <ArrowRight />
        </Button>
      </CardFooter>

    </Card>
  );
};
