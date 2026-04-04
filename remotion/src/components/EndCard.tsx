import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { colors } from "../utils/colors";
import { playfair, lato } from "../utils/fonts";

/**
 * End Card: Weiß/Cream mit Logo, "Seit 1906", CTA.
 * Clean wie die Website, rot als Akzent.
 */
export const EndCard: React.FC<{
  cta?: string;
}> = ({ cta = "Speicher dir das!" }) => {
  const frame = useCurrentFrame();

  const logoOpacity = interpolate(frame, [5, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(frame, [5, 22], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const lineWidth = interpolate(frame, [20, 36], [0, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const taglineOpacity = interpolate(frame, [30, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaOpacity = interpolate(frame, [44, 58], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.white,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      }}
    >
      {/* Logo */}
      <Img
        src={staticFile("brand/logo.png")}
        style={{
          width: 400,
          objectFit: "contain",
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
        }}
      />

      {/* Red divider */}
      <div
        style={{
          width: lineWidth,
          height: 3,
          backgroundColor: colors.brandRed,
        }}
      />

      {/* Seit 1906 */}
      <span
        style={{
          fontFamily: playfair,
          fontWeight: 400,
          fontSize: 30,
          color: colors.entity,
          letterSpacing: 4,
          opacity: taglineOpacity,
        }}
      >
        Seit 1906
      </span>

      {/* CTA */}
      <div
        style={{
          marginTop: 10,
          paddingLeft: 32,
          paddingRight: 32,
          paddingTop: 14,
          paddingBottom: 14,
          backgroundColor: colors.brandRed,
          borderRadius: 5,
          opacity: ctaOpacity,
        }}
      >
        <span
          style={{
            fontFamily: lato,
            fontWeight: 700,
            fontSize: 22,
            color: colors.lightText,
            letterSpacing: 1,
          }}
        >
          {cta}
        </span>
      </div>

      {/* Top red accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: colors.brandGradient,
        }}
      />
    </AbsoluteFill>
  );
};
