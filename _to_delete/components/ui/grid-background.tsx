// components/ui/grid-background.tsx
import React from "react";

interface GridBackgroundProps {
  className?: string;
  type?: "grid" | "dot";
  color?: string;
  opacity?: number;
}

export const GridBackground: React.FC<GridBackgroundProps> = ({
  className = "",
  type = "grid",
  color = "rgba(255,255,255,0.08)",
  opacity = 1,
}) => (
  <svg
    className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
    width="100%"
    height="100%"
    aria-hidden="true"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    style={{ opacity }}
  >
    {type === "dot" ? (
      [...Array(40)].map((_, row) =>
        [...Array(40)].map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={col * 2.5 + 0.8}
            cy={row * 2.5 + 0.8}
            r="0.4"
            fill={color}
          />
        ))
      )
    ) : (
      <>
        {[...Array(41)].map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 2.5}
            x2="100"
            y2={i * 2.5}
            stroke={color}
            strokeWidth="0.26"
          />
        ))}
        {[...Array(41)].map((_, i) => (
          <line
            key={`v-${i}`}
            y1="0"
            x1={i * 2.5}
            y2="100"
            x2={i * 2.5}
            stroke={color}
            strokeWidth="0.26"
          />
        ))}
      </>
    )}
  </svg>
);
