import React, { useMemo, useState } from "react";

const destinations = [
  { name: "Cox's Bazar", meta: "Bd • #Beach" },
  { name: "Sundarbans", meta: "Bd • #Wildlife" },
  { name: "Bandarban", meta: "Bd • #Hills" },
  
  
  { name: "Saint Martin", meta: "Bangladesh • #Island" },
];

const SIZE = 360;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 150;

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

export default function DestinationWheel() {
  const sliceAngle = 360 / destinations.length;

  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(destinations[0]);

  const colors = useMemo(
    () => ["#fde2e2", "#ffeccc", "#dff7df", "#d7f8ff", "#e2e7ff", "#f3d9ff"],
    []
  );

  const spin = () => {
    const randomIndex = Math.floor(Math.random() * destinations.length);

    // Land on the chosen slice under the TOP pointer.
    // We rotate so that slice center aligns with 0deg (top pointer).
    const target = randomIndex * sliceAngle + sliceAngle / 2;

    // More spins for animation
    const extra = 6 * 360;

    // Increase rotation (keep it continuous)
    setRotation((prev) => prev + extra - target);

    setResult(destinations[randomIndex]);
  };

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ marginTop: 0 }}>Spin the Destination Wheel</h1>
      <p style={{ color: "#475569", marginTop: 6 }}>
        Get a suggested destination using preferences/history (fallback list if backend is not ready).
      </p>

      <div style={{ display: "flex", gap: 40, alignItems: "flex-start", marginTop: 18 }}>
        {/* WHEEL */}
        <div style={{ position: "relative", width: SIZE }}>
          {/* POINTER (INWARD / DOWNWARD) */}
          <div
            style={{
              position: "absolute",
              top: -6,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "14px solid transparent",
              borderRight: "14px solid transparent",
              borderBottom: "22px solid #0f172a", // ▼ points DOWN into wheel
              zIndex: 20,
            }}
          />

          {/* Little pointer base (makes it nicer like the sample) */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#0f172a",
              zIndex: 19,
            }}
          />

          <svg width={SIZE} height={SIZE} style={{ display: "block" }}>
            {/* Wheel ring */}
            <circle cx={CX} cy={CY} r={R + 6} fill="none" stroke="#0f172a" strokeWidth="10" />

            <g
              transform={`rotate(${rotation} ${CX} ${CY})`}
              style={{ transition: "transform 2.8s cubic-bezier(.15,.9,.2,1)" }}
            >
              {destinations.map((d, i) => {
                const start = i * sliceAngle;
                const end = (i + 1) * sliceAngle;

                // mid angle for label
                const mid = start + sliceAngle / 2;

                // label position: closer to outer edge like the sample
                const labelPos = polarToCartesian(CX, CY, R * 0.68, mid);

                // rotate text to follow the wheel a bit (tangential),
                // but keep it readable (not upside down)
                let textRot = mid;
                if (textRot > 90 && textRot < 270) textRot += 180;

                return (
                  <g key={i}>
                    <path d={slicePath(CX, CY, R, start, end)} fill={colors[i % colors.length]} stroke="#e5e7eb" />

                    {/* Main label */}
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textRot} ${labelPos.x} ${labelPos.y})`}
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        fill: "#0f172a",
                        userSelect: "none",
                      }}
                    >
                      {d.name}
                    </text>

                    {/* Smaller meta under it */}
                    <text
                      x={labelPos.x}
                      y={labelPos.y + 16}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textRot} ${labelPos.x} ${labelPos.y + 16})`}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        fill: "#334155",
                        opacity: 0.9,
                        userSelect: "none",
                      }}
                    >
                      {d.meta}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Center SPIN button (like the sample) */}
            <g
              onClick={spin}
              style={{ cursor: "pointer" }}
            >
              <circle cx={CX} cy={CY} r={38} fill="#ffffff" stroke="#0f172a" strokeWidth="5" />
              <circle cx={CX} cy={CY} r={30} fill="#4f46e5" stroke="#ffffff" strokeWidth="3" />
              <text
                x={CX}
                y={CY + 2}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fill: "#ffffff",
                  fontWeight: 900,
                  fontSize: 13,
                  letterSpacing: 1,
                  userSelect: "none",
                }}
              >
                SPIN
              </text>
            </g>
          </svg>

          {/* Keep your existing buttons (no feature change) */}
          <button
            onClick={spin}
            style={{
              marginTop: 20,
              width: "100%",
              padding: 14,
              background: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            🎡 Spin
          </button>

          <button
            style={{
              marginTop: 12,
              width: "100%",
              padding: 12,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Refresh Suggestions
          </button>
        </div>

        {/* RESULT (unchanged) */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 24,
            minWidth: 420,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Result</h3>
          <h2 style={{ margin: "8px 0 6px 0" }}>{result.name}</h2>
          <p style={{ marginTop: 0, color: "#475569", fontWeight: 700 }}>{result.meta}</p>

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button
              onClick={spin}
              style={{
                padding: "10px 14px",
                background: "#16a34a",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Spin Again
            </button>

            <button
              style={{
                padding: "10px 14px",
                border: "1px solid #c7d2fe",
                borderRadius: 10,
                fontWeight: 800,
                background: "white",
                cursor: "pointer",
              }}
            >
              ✅ Mark as Visited
            </button>
          </div>

          <p style={{ marginTop: 18, color: "#64748b", fontSize: 14 }}>
            If backend is not ready, it uses demo destinations. That’s normal.
          </p>
        </div>
      </div>
    </div>
  );
}
