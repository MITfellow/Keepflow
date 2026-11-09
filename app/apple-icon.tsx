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
          background: "#04060b",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 126,
            height: 92,
            border: "1px solid rgba(111, 155, 255, 0.36)",
            borderRadius: 9999,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 88,
            height: 62,
            border: "1px solid rgba(111, 155, 255, 0.62)",
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
                background: "#6f9bff",
              }}
            />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
