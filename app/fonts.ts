import localFont from "next/font/local";

export const instrumentSerif = localFont({
  src: [
    {
      path: "./fonts/instrument-serif-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/instrument-serif-italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-instrument",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const jost = localFont({
  src: [
    {
      path: "./fonts/jost-variable.woff2",
      weight: "300 600",
      style: "normal",
    },
  ],
  variable: "--font-jost",
  display: "swap",
  preload: true,
  fallback: ["Trebuchet MS", "Segoe UI", "sans-serif"],
});
