"use client";

export function createKaraokeIcon(
  L: typeof import("leaflet"),
  isActive = false,
  color = "#ff2f92"
) {
  const size = isActive ? 34 : 28;

  return L.divIcon({
    className: "custom-marker-root",
    html: `
      <div
        style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
          background: ${color};
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

export function createUserIcon(L: typeof import("leaflet")) {
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
