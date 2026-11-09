import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0f0c",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 126,
            height: 92,
            border: "1px solid rgba(192, 208, 172, 0.28)",
            borderRadius: 9999,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 88,
            height: 62,
            border: "1px solid rgba(192, 208, 172, 0.48)",
            borderRadius: 9999,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {[52, 38, 24].map((width) => (
            <div
              key={width}
              style={{
                width,
                height: 4,
                borderRadius: 9999,
                background: "#c0d0ac",
              }}
            />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
