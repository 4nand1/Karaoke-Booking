"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { ArrowRight, MapPin, Star } from "lucide-react";
import Link from "next/link";

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

        <CardContent className="flex flex-col gap-3">
          <CardTitle className="text-[#c51383] font-bold text-[20px]">
            {karaoke.name}
          </CardTitle>
          <p className="flex gap-2 items-center text-black text-sm">
            {" "}
            <MapPin /> {karaoke.location}
          </p>
        </CardContent>
        <CardFooter className="pt-0 flex items-center justify-between ">
          <p className="flex gap-2 items-center text-black">
            <Star /> {karaoke.rating}/10
          </p>
          <Link href={"/karaoke/" + karaoke._id}>
          <Button variant={"ghost"} className="text-white bg-[#c51383] ">
            Захиалах <ArrowRight />
          </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
