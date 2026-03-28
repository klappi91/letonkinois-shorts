import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { colors } from "../utils/colors";
import { lato } from "../utils/fonts";
import { SAFE_ZONES } from "../../../src/lib/brand";

export const StepBadge: React.FC<{
  number: number;
  totalSteps: number;
  delay?: number;
}> = ({ number, totalSteps, delay = 10 }) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });

  const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: SAFE_ZONES.topSafe,
        right: SAFE_ZONES.sideSafe,
        opacity,
        transform: `scale(${scale})`,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: colors.brandRed,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(181,6,6,0.4)",
        }}
      >
        <span
          style={{
            fontFamily: lato,
            fontWeight: 700,
            fontSize: 28,
            color: colors.lightText,
            letterSpacing: 1,
          }}
        >
          {number}/{totalSteps}
        </span>
      </div>
    </div>
  );
};
