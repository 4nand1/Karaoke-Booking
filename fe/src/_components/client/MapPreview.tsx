"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { getDistanceKm } from "@/lib/distance";

type Karaoke = {
  _id: string;
  ownerClerkUserId: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  description: string;
  openingTime: string;
  closingTime: string;
  latitude?: number | null;
  longitude?: number | null;
  image?: string | null;
  rooms?: unknown[];
};

type KaraokeWithDistance = Karaoke & {
  distance?: number;
};

type UserLocation = {
  latitude: number;
  longitude: number;
};

const MapPreview = () => {
  const [karaokes, setKaraokes] = useState<Karaoke[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    async function fetchKaraokes() {
      try {
        const res = await fetch("http://localhost:9000/karaoke");
        const data = await res.json();

        if (!res.ok) {
          throw new Error("Failed to fetch karaoke data");
        }

        setKaraokes(data);
      } catch (error) {
        setFetchError("Failed to load karaoke locations");
      } finally {
        setLoading(false);
      }
    }

    fetchKaraokes();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setLocationError("Location permission denied");
      }
    );
  }, []);

  const nearbyKaraokes = useMemo<KaraokeWithDistance[]>(() => {
    const validKaraokes = karaokes.filter(
      (karaoke) =>
        typeof karaoke.latitude === "number" &&
        typeof karaoke.longitude === "number"
    );

    if (!userLocation) return validKaraokes;

    return validKaraokes
      .map((karaoke) => ({
        ...karaoke,
        distance: getDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          karaoke.latitude as number,
          karaoke.longitude as number
        ),
      }))
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }, [karaokes, userLocation]);

  return (
    <section className="container mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          Nearby Karaoke <span className="text-primary">Venues</span>
        </h2>
        <p className="mt-2 text-muted-foreground">
          Discover karaoke spots around you
        </p>
      </motion.div>

      {loading && (
        <p className="mt-4 text-sm text-muted-foreground">
          Loading karaoke locations...
        </p>
      )}

      {fetchError && (
        <p className="mt-4 text-sm text-red-500">{fetchError}</p>
      )}

      {locationError && (
        <p className="mt-2 text-sm text-yellow-500">{locationError}</p>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative mt-8 overflow-hidden rounded-3xl bg-secondary p-6 md:p-8"
      >
        <div className="absolute inset-0 opacity-20">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

        <div className="relative z-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nearbyKaraokes.length > 0 ? (
            nearbyKaraokes.map((karaoke) => (
              <div
                key={karaoke._id}
                className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <MapPin className="h-5 w-5 fill-primary text-primary" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {karaoke.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-300">
                      {karaoke.address}, {karaoke.city}
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      {karaoke.phone}
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      {karaoke.openingTime} - {karaoke.closingTime}
                    </p>

                    {typeof karaoke.distance === "number" && (
                      <p className="mt-3 text-sm font-medium text-pink-400">
                        {karaoke.distance.toFixed(1)} km away
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            !loading && (
              <p className="text-sm text-muted-foreground">
                No karaoke locations found
              </p>
            )
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default MapPreview;