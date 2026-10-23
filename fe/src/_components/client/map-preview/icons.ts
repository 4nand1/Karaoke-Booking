import L from "leaflet"

// CSS variables resolve at paint time, so the markers follow the theme.
export function createKaraokeIcon(active: boolean, free: boolean) {
  const size = active ? 34 : 28
  const color = free ? "var(--live)" : "var(--primary)"

  return L.divIcon({
    className: "custom-marker-root",
    html: `<div style="position:relative;width:${size}px;height:${size}px;background:${color};border-radius:${size}px ${size}px ${size}px 0;transform:rotate(-45deg);box-shadow:0 8px 20px rgba(0,0,0,.35);border:3px solid var(--background)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  })
}

export function createUserIcon() {
  return L.divIcon({
    className: "custom-marker-root",
    html: `<div style="width:22px;height:22px;border-radius:9999px;background:var(--foreground);border:4px solid var(--background);box-shadow:0 0 0 8px color-mix(in oklab,var(--foreground) 18%,transparent)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}
