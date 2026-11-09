import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

export async function createOgImage() {
  const serif = await readFile(
    path.join(process.cwd(), "assets", "fonts", "InstrumentSerif-Regular.ttf"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0f0c",
          color: "#ede8dc",
          padding: "62px 72px 54px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -190,
            top: -150,
            width: 980,
            height: 980,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(-12deg)",
          }}
        >
          {[320, 430, 540, 650, 760, 870].map((size) => (
            <div
              key={size}
              style={{
                position: "absolute",
                width: size,
                height: size * 0.74,
                border: "1px solid rgba(192, 208, 172, 0.15)",
                borderRadius: 9999,
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontFamily: "Instrument Serif",
              fontSize: 46,
              lineHeight: 1,
              letterSpacing: "-2px",
            }}
          >
            rill
          </span>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: 9999,
              background: "#c0d0ac",
              marginTop: 18,
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 790 }}>
          <div
            style={{
              fontFamily: "Instrument Serif",
              fontSize: 104,
              lineHeight: 0.9,
              letterSpacing: "-5px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Your day,</span>
            <span>quietly handled.</span>
          </div>
          <div
            style={{
              fontFamily: "Jost, sans-serif",
              fontSize: 27,
              lineHeight: 1.45,
              color: "#a7aa9c",
              marginTop: 30,
              maxWidth: 620,
              display: "flex",
            }}
          >
            A personal AI agent for email, calendar, and follow-through. Early access opens in
            waves through spring 2027.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: "Jost, sans-serif",
            fontSize: 18,
            letterSpacing: "0.04em",
            color: "#c0d0ac",
          }}
        >
          <div style={{ width: 42, height: 1, background: "#c0d0ac" }} />
          The list is open
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Instrument Serif", data: toArrayBuffer(serif), style: "normal", weight: 400 },
      ],
    },
  );
}
