import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
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
          background: "linear-gradient(135deg, #6D28D9 0%, #4C1D95 100%)",
          borderRadius: 40,
          color: "#FFFFFF",
          fontFamily: "sans-serif",
          fontWeight: 900,
          fontSize: 84,
          letterSpacing: "-0.04em",
        }}
      >
        <span>TC</span>
        <span
          style={{
            color: "#FBBF24",
            fontSize: 56,
            marginLeft: 4,
            marginTop: -24,
          }}
        >
          ↗
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}