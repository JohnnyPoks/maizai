import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MaizAI: Maize Disease Detection";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LOGO_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="10" fill="#3d8b5c"/><path d="M24 8 C24 8 16 16 16 26 C16 32 20 36 24 36 C28 36 32 32 32 26 C32 16 24 8 24 8Z" fill="#bce0c6"/><path d="M24 14 L24 36" stroke="#2d6e47" stroke-width="1.5" stroke-linecap="round"/><path d="M24 22 L20 18" stroke="#2d6e47" stroke-width="1.5" stroke-linecap="round"/><path d="M24 26 L28 22" stroke="#2d6e47" stroke-width="1.5" stroke-linecap="round"/><path d="M24 30 L20 26" stroke="#2d6e47" stroke-width="1.5" stroke-linecap="round"/></svg>';
const LOGO_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG)}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          background: "linear-gradient(135deg, #0f3d28 0%, #2f7350 55%, #3d8b5c 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: 44,
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_DATA_URI} width={132} height={132} alt="MaizAI logo" />
        </div>
        <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -2 }}>MaizAI</div>
        <div style={{ fontSize: 30, color: "rgba(255,255,255,0.85)" }}>
          Maize disease detection
        </div>
      </div>
    ),
    { ...size },
  );
}
