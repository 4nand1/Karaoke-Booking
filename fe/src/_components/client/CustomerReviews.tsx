"use client"
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Sarah M.",
    avatar: "S",
    rating: 5,
    text: "Best karaoke experience ever! The room was stunning and the sound system was incredible. We'll definitely be back!",
    venue: "Neon Lounge",
  },
  {
    name: "James K.",
    avatar: "J",
    rating: 5,
    text: "Booking was so easy through KaraokeNow. Found a perfect spot for our company event within minutes.",
    venue: "VoiceBox Premium",
  },
  {
    name: "Emily R.",
    avatar: "E",
    rating: 4,
    text: "Great selection of venues with real photos and honest reviews. The neon-lit VIP room was absolutely worth the price.",
    venue: "Sing Star",
  },
];

const CustomerReviews = () => (
  <section className="container mx-auto px-6 py-16">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
        What Our <span className="text-primary">Singers</span> Say
      </h2>
      <p className="mt-2 text-muted-foreground">Real reviews from real karaoke lovers</p>
    </motion.div>

    <div className="mt-10 grid gap-6 md:grid-cols-3">
      {reviews.map((review, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.15 }}
          className="card-hover rounded-2xl bg-card p-6 shadow-md"
        >
          <Quote className="h-8 w-8 text-primary/30" />
          <p className="mt-4 text-sm leading-relaxed text-card-foreground">{review.text}</p>
          <div className="mt-4 flex items-center gap-1">
            {Array.from({ length: review.rating }).map((_, j) => (
              <Star key={j} className="h-4 w-4 fill-primary text-primary" />
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {review.avatar}
            </div>
            <div>
              <p className="text-sm font-semibold text-card-foreground">{review.name}</p>
              <p className="text-xs text-muted-foreground">{review.venue}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

export default CustomerReviews;
