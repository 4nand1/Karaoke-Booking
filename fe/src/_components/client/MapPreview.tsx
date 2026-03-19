"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { Map, MapTileLayer, MapZoomControl } from "@/components/ui/map";
import { getDistanceKm } from "@/lib/distance";
import MapAutoFit from "./MapAutoFit";

type Karaoke = {
  _id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  description: string;
  openingTime: string;
  closingTime: string;
  latitude?: number | null;
  longitude?: number | null;
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
  const [distanceFilter, setDistanceFilter] = useState<"all" | 1 | 5 | 10>("all");

  useEffect(() => {
    async function fetchKaraokes() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/karaoke`);
        const data = await res.json();
        setKaraokes(data);
      } catch (error) {
        console.error("Failed to fetch karaokes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchKaraokes();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    });
  }, []);

  const nearbyKaraokes = useMemo<KaraokeWithDistance[]>(() => {
    const valid: KaraokeWithDistance[] = karaokes.filter(
      (k): k is KaraokeWithDistance =>
        typeof k.latitude === "number" && typeof k.longitude === "number"
    );

    const withDistance: KaraokeWithDistance[] = userLocation
      ? valid.map((k) => ({
          ...k,
          distance: getDistanceKm(
            userLocation.latitude,
            userLocation.longitude,
            k.latitude as number,
            k.longitude as number
          ),
        }))
      : valid;

    const filtered: KaraokeWithDistance[] =
      distanceFilter === "all"
        ? withDistance
        : withDistance.filter((k) => (k.distance ?? 0) <= distanceFilter);

    return filtered.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }, [karaokes, userLocation, distanceFilter]);

  const mapCenter = useMemo<LatLngExpression>(() => {
    if (userLocation) {
      return [userLocation.latitude, userLocation.longitude];
    }

    if (nearbyKaraokes.length) {
      return [
        nearbyKaraokes[0].latitude as number,
        nearbyKaraokes[0].longitude as number,
      ];
    }

    return [47.9184, 106.9177];
  }, [userLocation, nearbyKaraokes]);

  const karaokeIcon = L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;background:#ec4899;border:2px solid white;border-radius:9999px;box-shadow:0 4px 12px rgba(0,0,0,0.18);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  const userIcon = L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;background:#22d3ee;border:2px solid white;border-radius:9999px;box-shadow:0 4px 12px rgba(0,0,0,0.18);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const fitPoints = useMemo<[number, number][]>(() => {
    const pts: [number, number][] = [];

    if (userLocation) {
      pts.push([userLocation.latitude, userLocation.longitude]);
    }

    nearbyKaraokes.forEach((k) => {
      if (typeof k.latitude === "number" && typeof k.longitude === "number") {
        pts.push([k.latitude, k.longitude]);
      }
    });

    return pts;
  }, [userLocation, nearbyKaraokes]);

  return (
    <section className="container mx-auto px-6 py-16">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          Nearby Karaoke <span className="text-primary">Venues</span>
        </h2>

        <p className="mt-2 text-muted-foreground">
          Discover karaoke spots around you
        </p>
      </motion.div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", 1, 5, 10] as const).map((f) => {
          const isActive = distanceFilter === f;

          return (
            <button
              key={String(f)}
              onClick={() => setDistanceFilter(f)}
              className={[
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              ].join(" ")}
            >
              {f === "all" ? "All" : `${f} km`}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-sm">
              Loading nearby karaoke venues...
            </div>
          ) : nearbyKaraokes.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-sm">
              No nearby karaoke venues found.
            </div>
          ) : (
            nearbyKaraokes.map((k) => (
              <div
                key={k._id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                  <div className="min-w-0">
                    <h3 className="font-semibold text-card-foreground">
                      {k.name}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {k.address}, {k.city}
                    </p>

                    {typeof k.distance === "number" && (
                      <p className="mt-2 text-sm font-medium text-primary">
                        {k.distance.toFixed(1)} km away
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="h-[420px] w-full bg-background">
            <Map center={mapCenter} zoom={13} className="h-full w-full">
              <MapTileLayer />
              <MapZoomControl />
              <MapAutoFit points={fitPoints} />

              {userLocation && (
                <Marker
                  position={[userLocation.latitude, userLocation.longitude]}
                  icon={userIcon}
                >
                  <Popup>You are here</Popup>
                </Marker>
              )}

              {nearbyKaraokes.map((k) => {
                if (
                  typeof k.latitude !== "number" ||
                  typeof k.longitude !== "number"
                ) {
                  return null;
                }

                return (
                  <Marker
                    key={k._id}
                    position={[k.latitude, k.longitude]}
                    icon={karaokeIcon}
                  >
                    <Popup>
                      <b>{k.name}</b>
                      <br />
                      {k.address}
                      <br />
                      {k.phone}
                    </Popup>
                  </Marker>
                );
              })}
            </Map>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapPreview;