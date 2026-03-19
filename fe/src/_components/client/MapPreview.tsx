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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/karaoke`);
      const data = await res.json();
      setKaraokes(data);
      setLoading(false);
    }

    fetchKaraokes();
  }, []);

  useEffect(() => {
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
    html: `<div style="width:18px;height:18px;background:#ec4899;border:2px solid white;border-radius:9999px;"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  const userIcon = L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;background:#22d3ee;border:2px solid white;border-radius:9999px;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const fitPoints = useMemo<[number, number][]>(() => {
    const pts: [number, number][] = [];

    if (userLocation) {
      pts.push([userLocation.latitude, userLocation.longitude]);
    }

    nearbyKaraokes.forEach((k) => {
      if (k.latitude && k.longitude) {
        pts.push([k.latitude, k.longitude]);
      }
    });

    return pts;
  }, [userLocation, nearbyKaraokes]);

  return (
    <section className="container mx-auto px-6 py-16">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-3xl font-bold">
          Nearby Karaoke <span className="text-pink-500">Venues</span>
        </h2>
        <p className="text-muted-foreground">
          Discover karaoke spots around you
        </p>
      </motion.div>

      <div className="mt-6 flex gap-2">
        {(["all", 1, 5, 10] as const).map((f) => (
          <button
            key={String(f)}
            onClick={() => setDistanceFilter(f)}
            className={`rounded-full px-4 py-2 text-sm ${
              distanceFilter === f
                ? "bg-pink-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {f === "all" ? "All" : `${f} km`}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* LIST */}
        <div className="space-y-3">
          {nearbyKaraokes.map((k) => (
            <div
              key={k._id}
              className="rounded-xl bg-gray-200 p-4 text-sm"
            >
              <div className="flex gap-2">
                <MapPin className="h-4 w-4 text-pink-500" />
                <div>
                  <h3 className="font-semibold">{k.name}</h3>
                  <p>
                    {k.address}, {k.city}
                  </p>
                  {k.distance && (
                    <p className="text-pink-500">
                      {k.distance.toFixed(1)} km away
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MAP */}
        <div className="h-[420px] w-full rounded-3xl overflow-hidden">
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
              if (!k.latitude || !k.longitude) return null;

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
    </section>
  );
};

export default MapPreview;