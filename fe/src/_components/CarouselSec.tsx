"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const categories = [
{
image: "/room1.jpg",
title: "VIP Karaoke",
subtitle: "VIP Karaoke",
items: [
{ name: "Diamond Suite", location: "Төв байршил", image: "/room1.jpg" },
{ name: "Gold Room", location: "Сүхбаатар дүүрэг", image: "/room2.png" },
{ name: "Platinum Hall", location: "Баянзүрх дүүрэг", image: "/room3.jpg" },
],
},
{
image: "/room2.png",
title: "Cozy Karaoke",
subtitle: "Cozy Karaoke",
items: [
{ name: "Star Room", location: "Хан-Уул дүүрэг", image: "/room2.png" },
{ name: "Neon Hall", location: "Баянгол дүүрэг", image: "/room1.png" },
{ name: "Echo Chamber", location: "Чингэлтэй дүүрэг", image: "/room3.png" },
],
},
{
image: "/room3.jpg",
title: "Nox Karaoke",
subtitle: "Nox Karaoke",
items: [
{ name: "Cozy Booth", location: "Сонгинохайрхан", image: "/room3.jpg" },
{ name: "Mini Stage", location: "Налайх дүүрэг", image: "/room1.jpg" },
{ name: "Pocket Room", location: "Багануур дүүрэг", image: "/room2.png" },
],
},
]



const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  })
}

export const CarouselSec = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const move = (newDirection: number) => {
    setDirection(newDirection)
    setActiveIndex((prev) => (prev + newDirection + categories.length) % categories.length)
  }

  const active = categories[activeIndex]

  return (
    <div className="w-full bg-white py-6 sm:py-10">
      
      {/* Title - Төвдөө хэвээрээ */}
      <div className="max-w-[1400px] mx-auto px-6 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex justify-center items-center">
          Түгээмэл байршлууд
        </h2>
      </div>

      {/* Full Width Carousel Container */}
      <div className="relative w-full h-[50vh] min-h-[300px] max-h-[600px] overflow-hidden group rounded-4xl">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 }
            }}
            className="absolute inset-0 w-full h-full"
          >
            <div className="relative w-full h-full">
              <Image
                src={active.image}
                alt={active.title}
                fill
                priority
                quality={100}
                className="object-cover object-center"
              />
              {/* Зөөлөн сүүдэр - Текст тодотгох */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              
              {/* Content */}
              <div className="absolute bottom-12 left-0 right-0 text-center text-white px-4 z-10">
                <motion.h3 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-3xl sm:text-5xl font-bold"
                >
                  {active.title}
                </motion.h3>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm sm:text-lg text-white/80 mt-2 font-light"
                >
                  {active.subtitle}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Buttons - Дэлгэцийн захад */}
        <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-10 z-20 pointer-events-none">
          <button
            onClick={() => move(-1)}
            className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={() => move(1)}
            className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
          {categories.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > activeIndex ? 1 : -1)
                setActiveIndex(i)
              }}
              className={`h-1 transition-all rounded-full ${
                i === activeIndex ? "w-8 bg-white" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Sub Cards Section - Төвдөө хэвээрээ */}
      <div className="max-w-[1400px] mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {active.items.map((item, i) => (
              <motion.div
                key={`${activeIndex}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-lg"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-bold text-lg">{item.name}</p>
                  <p className="text-sm text-white/70">{item.location}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}