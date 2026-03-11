"use client"

import Image from "next/image"
import { useState } from "react"
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
    x: direction < 0 ? "20%" : "-20%", 
    opacity: 0,
    transition: { opacity: { duration: 0.3 } } 
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
    <div className="w-full bg-gray-50 dark:bg-gray-900 py-6 sm:py-10">

      <div className="max-w-[1400px] mx-auto px-6 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex justify-center items-center">
          Түгээмэл байршлууд
        </h2>
      </div>

      {/* Carousel */}
      <div className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden bg-neutral-900">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "tween", duration: 0.5, ease: "easeInOut" },
              opacity: { duration: 0.4 }
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute bottom-16 left-0 right-0 text-center text-white px-4 z-10">
                <motion.h3 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl sm:text-5xl font-bold"
                >
                  {active.title}
                </motion.h3>
                <motion.p 
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm sm:text-lg text-white/80 mt-3 font-light"
                >
                  {active.subtitle}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel buttons */}
        <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-10 z-20 pointer-events-none">
          <button
            onClick={() => move(-1)}
            className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/20"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={() => move(1)}
            className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/20"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Pagination dots */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
          {categories.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > activeIndex ? 1 : -1)
                setActiveIndex(i)
              }}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                i === activeIndex ? "w-10 bg-white" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Category items */}
      <div className="max-w-[1400px] mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {active.items.map((item, i) => (
            <motion.div
              key={`${activeIndex}-${i}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group relative h-72 rounded-[2rem] overflow-hidden cursor-pointer shadow-xl"
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="font-bold text-xl mb-1">{item.name}</p>
                <p className="text-sm text-white/70 font-light flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> {item.location}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  )
}