import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ReefCultures";
export const size = {
  width: 1200,
  height: 630,
};

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(1200px 630px at 20% 20%, #0EA5E9 0%, rgba(14,165,233,0.15) 35%, rgba(2,6,23,1) 100%)",
          color: "white",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: 64, maxWidth: 980 }}>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1 }}>ReefCultures</div>
          <div style={{ fontSize: 28, opacity: 0.85 }}>
            Live phytoplankton, engineered for reef performance.
          </div>
          <div style={{ fontSize: 18, opacity: 0.75 }}>
            Batch tracked · Cold chain · High density · Reef-safe
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
