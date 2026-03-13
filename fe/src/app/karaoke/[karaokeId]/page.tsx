"use client";

import Navbar from "@/_components/navbar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MapPin } from "lucide-react";

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

import { useRouter } from "next/navigation";

export default function KaraokePage({ karaoke }: KaraokeCardProps) {
  const router = useRouter();

  return (
    <div className="w-full h-full flex flex-col justify-center pr-30 pl-30 gap-10">
      <Navbar />
      <Button
        variant={"outline"}
        className="w-30"
        onClick={() => router.push("/")}
      >
        <ChevronLeft /> Back
      </Button>
      <img src={karaoke?.image} alt="Karaoke" className="w-full" />
      <h1 className="font-bold text-4xl">{karaoke?.name}</h1>
      <p className="flex gap-2 items-center">
        <MapPin /> {karaoke?.location}
      </p>
    </div>
  );
}
