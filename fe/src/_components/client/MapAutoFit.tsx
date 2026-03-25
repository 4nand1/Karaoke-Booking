"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

type Point = [number, number];

type Props = {
  points: Point[];
  maxZoom?: number;
};

export default function MapAutoFit({ points, maxZoom = 15 }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom });
  }, [map, maxZoom, points]);

  return null;
}
