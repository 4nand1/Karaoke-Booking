"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock3, MapPin, Navigation } from "lucide-react";
import type { LatLngExpression, DivIcon } from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { useRouter } from "next/navigation";
import { Map, MapTileLayer, MapZoomControl } from "@/components/ui/map";
import { getDistanceKm } from "@/lib/distance";
import { apiRootUrl } from "@/lib/api-url";
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
  ownerClerkUserId?: string;
  image?: string | null;
  rooms?: Array<{
    _id: string;
    name: string;
    type: string;
    price: number;
    capacity: number;
    image: string;
  }>;
};

type KaraokeWithDistance = Karaoke & {
  distance?: number;
};

type UserLocation = {
  latitude: number;
  longitude: number;
};

function createKaraokeIcon(L: typeof import("leaflet"), isActive = false) {
  const size = isActive ? 34 : 28;

  return L.divIcon({
    className: "custom-marker-root",
    html: `
      <div
        style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
          background: #ff2f92;
          border-radius: ${size}px ${size}px ${size}px 0;
          transform: rotate(-45deg);
          box-shadow: 0 10px 24px rgba(0,0,0,0.28);
          border: 3px solid #ffffff;
        "
      >
        <div
          style="
            position: absolute;
            top: 50%;
            left: 50%;
            width: ${isActive ? 12 : 10}px;
            height: ${isActive ? 12 : 10}px;
            background: rgba(255,255,255,0.35);
            border-radius: 9999px;
            transform: translate(-50%, -50%) rotate(45deg);
          "
        ></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 6],
  });
}

function createUserIcon(L: typeof import("leaflet")) {
  return L.divIcon({
    className: "custom-marker-root",
    html: `
      <div
        style="
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          background: #22d3ee;
          border: 4px solid #ffffff;
          box-shadow:
            0 0 0 8px rgba(34,211,238,0.20),
            0 8px 18px rgba(0,0,0,0.22);
        "
      ></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

export default function MapPreview() {
  const router = useRouter();
  const [karaokes, setKaraokes] = useState<Karaoke[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [leafletLib, setLeafletLib] = useState<typeof import("leaflet") | null>(null);

  useEffect(() => {
    let mounted = true;

    import("leaflet").then((mod) => {
      if (mounted) {
        setLeafletLib(mod);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchKaraokes = async () => {
      try {
        const url = `${apiRootUrl}/karaoke`;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Failed to fetch karaoke data: ${res.status}`);
        }

        const data = (await res.json()) as { karaokes?: Karaoke[] };
        setKaraokes(Array.isArray(data.karaokes) ? data.karaokes : []);
      } catch (error) {
        console.error("Failed to fetch karaokes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKaraokes();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Geolocation error:", error);
      }
    );
  }, []);

  const nearbyKaraokes = useMemo<KaraokeWithDistance[]>(() => {
    const valid = karaokes.filter(
      (karaoke): karaoke is KaraokeWithDistance =>
        typeof karaoke.latitude === "number" &&
        typeof karaoke.longitude === "number"
    );

    if (!userLocation) return valid;

    return valid
      .map((karaoke) => ({
        ...karaoke,
        distance: getDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          karaoke.latitude!,
          karaoke.longitude!
        ),
      }))
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }, [karaokes, userLocation]);

  useEffect(() => {
    if (!selectedId && nearbyKaraokes.length > 0) {
      setSelectedId(nearbyKaraokes[0]._id);
    }
  }, [nearbyKaraokes, selectedId]);

  const mapCenter = useMemo<LatLngExpression>(() => {
    const selected = nearbyKaraokes.find((karaoke) => karaoke._id === selectedId);

    if (
      typeof selected?.latitude === "number" &&
      typeof selected?.longitude === "number"
    ) {
      return [selected.latitude, selected.longitude];
    }

    if (userLocation) {
      return [userLocation.latitude, userLocation.longitude];
    }

    if (nearbyKaraokes.length > 0) {
      return [nearbyKaraokes[0].latitude!, nearbyKaraokes[0].longitude!];
    }

    return [47.9184, 106.9177];
  }, [nearbyKaraokes, selectedId, userLocation]);

  const fitPoints = useMemo<[number, number][]>(() => {
    const points: [number, number][] = [];

    if (userLocation) {
      points.push([userLocation.latitude, userLocation.longitude]);
    }

    nearbyKaraokes.forEach((karaoke) => {
      if (
        typeof karaoke.latitude === "number" &&
        typeof karaoke.longitude === "number"
      ) {
        points.push([karaoke.latitude, karaoke.longitude]);
      }
    });

    return points;
  }, [nearbyKaraokes, userLocation]);

  const karaokeIcon = useMemo<DivIcon | undefined>(() => {
    if (!leafletLib) return undefined;
    return createKaraokeIcon(leafletLib, false);
  }, [leafletLib]);

  const activeKaraokeIcon = useMemo<DivIcon | undefined>(() => {
    if (!leafletLib) return undefined;
    return createKaraokeIcon(leafletLib, true);
  }, [leafletLib]);

  const userIcon = useMemo<DivIcon | undefined>(() => {
    if (!leafletLib) return undefined;
    return createUserIcon(leafletLib);
  }, [leafletLib]);

  const openBookingFor = (karaokeId: string) => {
    router.push(`/book/${karaokeId}`);
  };

  if (!leafletLib) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          Loading map...
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Nearby Karaoke <span className="text-primary">Venues</span>
          </h2>
          <p className="mt-2 text-muted-foreground">
            Discover karaoke spots around you
          </p>
        </motion.div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
          <div className="space-y-3 lg:max-h-[520px] lg:overflow-y-auto lg:pr-1">
            {loading ? (
              <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-sm">
                Loading nearby karaoke venues...
              </div>
            ) : nearbyKaraokes.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-sm">
                No karaoke venues found.
              </div>
            ) : (
              nearbyKaraokes.map((karaoke) => {
                const isSelected = selectedId === karaoke._id;

                return (
                  <button
                    key={karaoke._id}
                    type="button"
                    onClick={() => {
                      setSelectedId(karaoke._id)
                      openBookingFor(karaoke._id)
                    }}
                    className={[
                      "w-full rounded-2xl border bg-card p-4 text-left shadow-sm transition-all duration-200",
                      isSelected
                        ? "border-primary ring-1 ring-primary/30"
                        : "border-border hover:-translate-y-0.5 hover:shadow-md",
                    ].join(" ")}
                  >
                    <div className="flex gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-card-foreground">
                          {karaoke.name}
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {karaoke.address}, {karaoke.city}
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock3 className="h-4 w-4" />
                          <span>
                            {karaoke.openingTime} - {karaoke.closingTime}
                          </span>
                        </div>

                        {typeof karaoke.distance === "number" && (
                          <div className="mt-2 flex items-center gap-2 text-sm font-medium text-primary">
                            <Navigation className="h-4 w-4" />
                            <span>{karaoke.distance.toFixed(1)} km away</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="rounded-3xl border border-border bg-card shadow-sm">
            <div className="relative h-[420px] overflow-hidden rounded-3xl md:h-[500px] lg:h-[520px]">
              <Map
                center={mapCenter}
                zoom={13}
                className="absolute inset-0 h-full w-full"
              >
                <MapTileLayer />
                <MapZoomControl />
                <MapAutoFit points={fitPoints} />

                {userLocation && userIcon && (
                  <Marker
                    position={[userLocation.latitude, userLocation.longitude]}
                    icon={userIcon}
                  >
                    <Popup>
                      <div className="space-y-1">
                        <p className="font-semibold">Your location</p>
                        <p className="text-sm text-muted-foreground">
                          Current position
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {nearbyKaraokes.map((karaoke) => {
                  if (
                    typeof karaoke.latitude !== "number" ||
                    typeof karaoke.longitude !== "number"
                  ) {
                    return null;
                  }

                  const icon =
                    selectedId === karaoke._id
                      ? activeKaraokeIcon
                      : karaokeIcon;

                  if (!icon) return null;

                  return (
                    <Marker
                      key={karaoke._id}
                      position={[karaoke.latitude, karaoke.longitude]}
                      icon={icon}
                      eventHandlers={{
                        click: () => setSelectedId(karaoke._id),
                      }}
                    >
                      <Popup>
                        <div className="space-y-2">
                          <p className="font-semibold">{karaoke.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {karaoke.address}, {karaoke.city}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {karaoke.phone}
                          </p>
                          {typeof karaoke.distance === "number" && (
                            <p className="text-sm font-medium text-primary">
                              {karaoke.distance.toFixed(1)} km away
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => openBookingFor(karaoke._id)}
                            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                          >
                            Open Booking
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </Map>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
