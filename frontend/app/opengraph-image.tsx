import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CupomForm — Responda e ganhe seu cupom";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#0b0a1f";

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
          background: BG,
          backgroundImage: "linear-gradient(135deg, #151233 0%, #0b0a1f 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 72 }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              width: 320,
              height: 200,
              borderRadius: 40,
              background: "linear-gradient(135deg, #6366f1 0%, #3730a3 100%)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: -28,
                marginLeft: -28,
                width: 56,
                height: 56,
                borderRadius: 28,
                background: BG,
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: -28,
                marginLeft: -28,
                width: 56,
                height: 56,
                borderRadius: 28,
                background: BG,
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 28,
                bottom: 28,
                marginLeft: -3,
                width: 0,
                borderLeft: "6px dashed rgba(255,255,255,0.55)",
                display: "flex",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 620 }}>
            <div
              style={{
                fontSize: 76,
                fontWeight: 800,
                color: "#f5f4fb",
                letterSpacing: -2,
                display: "flex",
              }}
            >
              CupomForm
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 500,
                color: "#c7c3e0",
                lineHeight: 1.35,
                display: "flex",
              }}
            >
              Responda e ganhe seu cupom exclusivo para o comércio local
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
