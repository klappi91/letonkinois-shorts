import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { colors } from "../utils/colors";
import { lora } from "../utils/fonts";
import { SAFE_ZONES } from "../../../src/lib/brand";

/**
 * Minimal label — max 1-3 Wörter, große Schrift.
 * Positioned in Instagram safe zone.
 */
export const SceneLabel: React.FC<{
  text: string;
  delay?: number;
}> = ({ text, delay = 15 }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [delay, delay + 16], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: SAFE_ZONES.bottomSafe,
        left: SAFE_ZONES.contentSide,
        right: SAFE_ZONES.contentSide,
      }}
    >
      <span
        style={{
          fontFamily: lora,
          fontWeight: 700,
          fontSize: 56,
          color: colors.lightText,
          opacity,
          transform: `translateY(${y}px)`,
          textShadow: colors.textShadow,
          display: "block",
        }}
      >
        {text}
      </span>
    </div>
  );
};
