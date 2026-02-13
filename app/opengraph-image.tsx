import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "PartyTab - Free Bill Splitting App";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #faf6ee 0%, #f5efe2 50%, #e8f5f3 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(10, 119, 106, 0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(10, 119, 106, 0.06)",
          }}
        />

        {/* Logo / Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#0a776a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            PT
          </div>
          <span style={{ fontSize: 40, fontWeight: 800, color: "#1b1a18" }}>
            PartyTab
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: "#1b1a18",
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: 800,
            marginBottom: 24,
          }}
        >
          Split Group Expenses.
          <br />
          <span style={{ color: "#0a776a" }}>No App Required.</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "#6f6a61",
            textAlign: "center",
            maxWidth: 600,
          }}
        >
          Track who paid what and settle up the smart way. Free forever.
        </div>

        {/* Bottom pills */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
          }}
        >
          {["Browser-based", "Free to use", "No sign-up needed"].map((text) => (
            <div
              key={text}
              style={{
                background: "rgba(10, 119, 106, 0.1)",
                color: "#0a776a",
                padding: "10px 24px",
                borderRadius: 100,
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
