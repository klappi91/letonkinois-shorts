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
 * Product reveal: Die Dose auf weißem/cream Hintergrund.
 * Prominent, clean — wie im Shop.
 */
export const ProductReveal: React.FC<{
  productImage: string;
  productName: string;
}> = ({ productImage, productName }) => {
  const frame = useCurrentFrame();

  const productOpacity = interpolate(frame, [5, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const productY = interpolate(frame, [5, 22], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const nameOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineWidth = interpolate(frame, [22, 38], [0, 160], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.cream,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
      }}
    >
      {/* Product image — groß und prominent */}
      <Img
        src={staticFile(productImage)}
        style={{
          width: 440,
          height: 440,
          objectFit: "contain",
          opacity: productOpacity,
          transform: `translateY(${productY}px)`,
          filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.15))",
        }}
      />

      {/* Red line divider */}
      <div
        style={{
          width: lineWidth,
          height: 3,
          backgroundColor: colors.brandRed,
        }}
      />

      {/* Product name */}
      <span
        style={{
          fontFamily: playfair,
          fontWeight: 400,
          fontSize: 36,
          color: colors.title,
          opacity: nameOpacity,
          letterSpacing: 1,
        }}
      >
        {productName}
      </span>
    </AbsoluteFill>
  );
};
