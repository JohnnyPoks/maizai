import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MaizAI: Maize Disease Detection";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0f3d28 0%, #2f7350 55%, #3d8b5c 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 40 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 60,
              fontWeight: 800,
            }}
          >
            M
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -1 }}>MaizAI</div>
        </div>
        <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>
          Detect maize disease before it spreads.
        </div>
        <div style={{ fontSize: 30, marginTop: 32, color: "rgba(255,255,255,0.85)", maxWidth: 880 }}>
          On-device AI for Cameroonian smallholder farmers. A diagnosis in seconds, even offline.
        </div>
        <div style={{ fontSize: 24, marginTop: 48, color: "rgba(255,255,255,0.7)" }}>
          Open source · Android · maizai.vercel.app
        </div>
      </div>
    ),
    { ...size },
  );
}
