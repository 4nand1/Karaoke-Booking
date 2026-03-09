"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import { useEffect, useState } from "react"

export const CarouselSec = () => {
  const images = [
    "/room1.png",
    "/room2.png",
    "/room3.png",
  ]

  const [api, setApi] = useState<any>(null)

  useEffect(() => {
    if (!api) return

    const interval = setInterval(() => {
      api.scrollNext()
    }, 3000)

    return () => clearInterval(interval)
  }, [api])

  return (
    <div className="w-full flex justify-center items-center py-20 bg-gray-50">
      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: "center" }}
        className="w-full"
      >
        <CarouselContent className="-ml-6">
          {images.map((img, index) => (
            <CarouselItem
              key={index}
              className="pl-6 basis-[65%]"
            >
              <div className="h-[420px] w-full overflow-hidden rounded-2xl">
                <img
                  src={img}
                  alt={`room-${index}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-6" />
        <CarouselNext className="right-6" />
      </Carousel>
    </div>
  )
}