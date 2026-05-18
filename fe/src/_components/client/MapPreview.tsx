"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { LatLngExpression, DivIcon } from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Map, MapTileLayer, MapZoomControl } from "@/components/ui/map";
import { apiBaseUrl, apiRootUrl } from "@/lib/api-url";
import MapAutoFit from "./MapAutoFit";
import NearbyKaraokeCard from "./map-preview/NearbyKaraokeCard";
import { createKaraokeIcon, createUserIcon } from "./map-preview/icons";
import type {
  Karaoke,
  KaraokeWithDistance,
  Order,
  UserLocation,
} from "./map-preview/types";
import { getFitPoints, getNearbyKaraokes, isFreeNow } from "./map-preview/utils";

export default function MapPreview() {
  const ITEMS_PER_PAGE = 4;
  const router = useRouter();
  const [karaokes, setKaraokes] = useState<Karaoke[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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
    const fetchMapData = async () => {
      try {
        const [karaokeRes, orderRes] = await Promise.all([
          fetch(`${apiRootUrl}/karaoke`),
          fetch(`${apiBaseUrl}/orders`),
        ]);

        if (!karaokeRes.ok) {
          throw new Error(`Failed to fetch karaoke data: ${karaokeRes.status}`);
        }

        const karaokeData = (await karaokeRes.json()) as { karaokes?: Karaoke[] };
        setKaraokes(Array.isArray(karaokeData.karaokes) ? karaokeData.karaokes : []);

        if (orderRes.ok) {
          const orderData = (await orderRes.json()) as Order[];
          setOrders(Array.isArray(orderData) ? orderData : []);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("Failed to fetch map data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
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
    return getNearbyKaraokes(karaokes, userLocation);
  }, [karaokes, userLocation]);

  useEffect(() => {
    if (!selectedId && nearbyKaraokes.length > 0) {
      setSelectedId(nearbyKaraokes[0]._id);
    }
  }, [nearbyKaraokes, selectedId]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(nearbyKaraokes.length / ITEMS_PER_PAGE));
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [nearbyKaraokes.length]);

  useEffect(() => {
    if (!selectedId) return;

    const selectedIndex = nearbyKaraokes.findIndex(
      (karaoke) => karaoke._id === selectedId
    );

    if (selectedIndex === -1) return;

    const nextPage = Math.floor(selectedIndex / ITEMS_PER_PAGE) + 1;
    setCurrentPage((prev) => (prev === nextPage ? prev : nextPage));
  }, [ITEMS_PER_PAGE, nearbyKaraokes, selectedId]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(nearbyKaraokes.length / ITEMS_PER_PAGE)),
    [ITEMS_PER_PAGE, nearbyKaraokes.length]
  );

  const paginatedKaraokes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return nearbyKaraokes.slice(start, start + ITEMS_PER_PAGE);
  }, [ITEMS_PER_PAGE, currentPage, nearbyKaraokes]);

  const visibleStart = nearbyKaraokes.length
    ? (currentPage - 1) * ITEMS_PER_PAGE + 1
    : 0;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, nearbyKaraokes.length);

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
    const focusTargets =
      paginatedKaraokes.length > 0
        ? paginatedKaraokes
        : nearbyKaraokes.slice(0, ITEMS_PER_PAGE);

    return getFitPoints(focusTargets, userLocation);
  }, [ITEMS_PER_PAGE, nearbyKaraokes, paginatedKaraokes, userLocation]);

  const karaokeIcon = useMemo<DivIcon | undefined>(() => {
    if (!leafletLib) return undefined;
    return createKaraokeIcon(leafletLib, false);
  }, [leafletLib]);

  const activeKaraokeIcon = useMemo<DivIcon | undefined>(() => {
    if (!leafletLib) return undefined;
    return createKaraokeIcon(leafletLib, true);
  }, [leafletLib]);

  const freeKaraokeIcon = useMemo<DivIcon | undefined>(() => {
    if (!leafletLib) return undefined;
    return createKaraokeIcon(leafletLib, false, "#22c55e");
  }, [leafletLib]);

  const activeFreeKaraokeIcon = useMemo<DivIcon | undefined>(() => {
    if (!leafletLib) return undefined;
    return createKaraokeIcon(leafletLib, true, "#22c55e");
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
      <section className="container mx-auto px-4 py-10 sm:px-6 sm:py-12">
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          Loading map...
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="container mx-auto px-4 py-10 sm:px-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
            Nearby Karaoke <span className="text-primary">Venues</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Discover karaoke spots around you
          </p>
        </motion.div>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
          <div className="order-2 space-y-3 lg:order-1 lg:max-h-[520px] lg:overflow-y-auto lg:pr-1">
            {loading ? (
              <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-sm">
                Loading nearby karaoke venues...
              </div>
            ) : nearbyKaraokes.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-sm">
                No karaoke venues found.
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-border bg-card/70 px-4 py-3 text-xs text-muted-foreground shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span>
                      Showing <span className="font-semibold text-foreground">{visibleStart}</span>
                      {" "}-{" "}
                      <span className="font-semibold text-foreground">{visibleEnd}</span>
                      {" "}of{" "}
                      <span className="font-semibold text-foreground">{nearbyKaraokes.length}</span>
                    </span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                      Page {currentPage}/{totalPages}
                    </span>
                  </div>
                  {totalPages > 1 ? (
                    <p className="mt-2">
                      More nearby spots are available. Use the pagination below to browse them.
                    </p>
                  ) : null}
                </div>

                {paginatedKaraokes.map((karaoke) => {
                  return (
                    <NearbyKaraokeCard
                      key={karaoke._id}
                      karaoke={karaoke}
                      orders={orders}
                      isSelected={selectedId === karaoke._id}
                      onSelect={() => {
                        setSelectedId(karaoke._id);
                        openBookingFor(karaoke._id);
                      }}
                      onBookNow={() => openBookingFor(karaoke._id)}
                    />
                  );
                })}

                {totalPages > 1 ? (
                  <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/70 p-3 shadow-sm">
                    <div className="flex items-center justify-center gap-2">
                      {Array.from({ length: totalPages }, (_, index) => {
                        const page = index + 1;

                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={[
                              "h-2.5 rounded-full transition-all",
                              page === currentPage
                                ? "w-8 bg-primary"
                                : "w-2.5 bg-primary/25 hover:bg-primary/50",
                            ].join(" ")}
                            aria-label={`Go to page ${page}`}
                            aria-current={page === currentPage ? "page" : undefined}
                          />
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                      </button>

                      <span className="text-xs text-muted-foreground">
                        {currentPage < totalPages
                          ? `${totalPages - currentPage} more page${totalPages - currentPage > 1 ? "s" : ""}`
                          : "You are on the last page"}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className="order-1 rounded-3xl border border-border bg-card shadow-sm lg:order-2">
            <div className="relative h-[320px] overflow-hidden rounded-3xl sm:h-[380px] md:h-[500px] lg:h-[520px]">
              <Map
                center={mapCenter}
                zoom={13}
                className="absolute inset-0 h-full w-full"
              >
                <MapTileLayer />
                <MapZoomControl />
                <MapAutoFit points={fitPoints} maxZoom={15} />

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

                  const free = isFreeNow(karaoke, orders);
                  const isActive = selectedId === karaoke._id;
                  const icon = free
                    ? (isActive ? activeFreeKaraokeIcon : freeKaraokeIcon)
                    : (isActive ? activeKaraokeIcon : karaokeIcon);

                  if (!icon) return null;

                  return (
                    <Marker
                      key={karaoke._id}
                      position={[karaoke.latitude, karaoke.longitude]}
                      icon={icon}
                      eventHandlers={{
                        click: () => {
                          setSelectedId(karaoke._id);
                          openBookingFor(karaoke._id);
                        },
                      }}
                    />
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
