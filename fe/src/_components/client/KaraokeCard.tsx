"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { MapPin, Star, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import BookingDialog from "@/_components/client/BookingDialog"

interface KaraokeCardProps {
  id: string
  image: string
  name: string
  location: string
  rating: number | null
  price: string
  hours: string
  index: number
  rooms: Array<{
    _id: string
    name: string
    type: string
    price: number
    capacity: number
    image: string
  }>
}

const KaraokeCard = ({
  id,
  image,
  name,
  location,
  rating,
  price,
  hours,
  rooms,
  index,
}: KaraokeCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="card-hover group cursor-pointer overflow-hidden rounded-2xl bg-card shadow-md"
        onClick={() => router.push(`/karaoke/${id}`)}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-card/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
            <Star className="h-3 w-3 fill-primary text-primary" />
            {rating === null ? "New" : rating}
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-display text-lg font-semibold text-card-foreground">
            {name}
          </h3>

          <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {location}
          </div>

          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {hours}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="font-display text-lg font-bold text-primary">
              {price}
            </span>
            <Button
              variant="neon"
              size="sm"
              className="rounded-xl"
              onClick={(e) => {
                e.stopPropagation()
                setDialogOpen(true)
              }}
            >
              Book Now
            </Button>
          </div>
        </div>
      </motion.div>

      <BookingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        image={image}
        name={name}
        location={location}
        rating={rating ?? 0}
        price={price}
        hours={hours}
        karaokeId={id}
        rooms={rooms.map((room) => ({
          _id: room._id,
          name: room.name,
          capacity: `${room.capacity} guests`,
          price: `₮${room.price.toLocaleString()}/hr`,
          type: room.type,
          features: [room.type, `${room.capacity} guests`],
        }))}
      />
    </>
  )
}

export default KaraokeCard
