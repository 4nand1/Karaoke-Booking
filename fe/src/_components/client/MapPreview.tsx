"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { LatLngExpression } from "leaflet";
import { getDistanceKm } from "@/lib/distance";
import {
  Map,
  MapMarker,
  MapPopup,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map";

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
  const [selectedKaraokeId, setSelectedKaraokeId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchKaraokes() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/karaoke`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error("Failed to fetch karaoke data");
        }

        setKaraokes(data);
      } catch {
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

  const mapCenter = useMemo<LatLngExpression>(() => {
    if (userLocation) {
      return [userLocation.latitude, userLocation.longitude];
    }

    const first = nearbyKaraokes.find(
      (karaoke) =>
        typeof karaoke.latitude === "number" &&
        typeof karaoke.longitude === "number"
    );

    if (first) {
      return [first.latitude as number, first.longitude as number];
    }

    return [47.9184, 106.9177];
  }, [userLocation, nearbyKaraokes]);

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

        <div className="relative z-10">
          {nearbyKaraokes.length > 0 ? (
            <div className="h-[360px] w-full overflow-hidden rounded-3xl">
              <Map center={mapCenter} zoom={13} className="h-full w-full">
                <MapTileLayer />
                <MapZoomControl />

                {userLocation && (
                  <MapMarker position={[userLocation.latitude, userLocation.longitude]}>
                    <div className="h-4 w-4 rounded-full border-2 border-white bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
                  </MapMarker>
                )}

                {nearbyKaraokes.map((karaoke) => {
                  if (
                    typeof karaoke.latitude !== "number" ||
                    typeof karaoke.longitude !== "number"
                  ) {
                    return null;
                  }

                  return (
                    <MapMarker
                      key={karaoke._id}
                      position={[karaoke.latitude, karaoke.longitude]}
                    >
                      <div className="flex flex-col items-center">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedKaraokeId((prev) =>
                              prev === karaoke._id ? null : karaoke._id
                            )
                          }
                          className="flex flex-col items-center"
                        >
                          <MapPin className="h-8 w-8 fill-primary text-primary drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                          <span className="mt-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white backdrop-blur-sm">
                            {karaoke.name}
                          </span>
                        </button>

                        {selectedKaraokeId === karaoke._id && (
                          <MapPopup>
                            <div className="min-w-[220px] text-sm">
                              <h3 className="text-base font-semibold">
                                {karaoke.name}
                              </h3>
                              <p className="mt-2">
                                {karaoke.address}, {karaoke.city}
                              </p>
                              <p className="mt-1">{karaoke.phone}</p>
                              <p className="mt-1">
                                {karaoke.openingTime} - {karaoke.closingTime}
                              </p>
                              {typeof karaoke.distance === "number" && (
                                <p className="mt-3 font-medium text-pink-400">
                                  {karaoke.distance.toFixed(1)} km away
                                </p>
                              )}
                            </div>
                          </MapPopup>
                        )}
                      </div>
                    </MapMarker>
                  );
                })}
              </Map>
            </div>
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