import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { colors } from "../utils/colors";
import { playfair, lora, lato } from "../utils/fonts";
import { VideoScene } from "../components/VideoScene";
import { ImageScene } from "../components/ImageScene";

const IMG_SEQ = "sequences/oster-brunch-tisch";

// Restructured: Hook=Video(7s) → Ergebnis(3.5s) → Branded Outro over result(3s)
// Transitions: 2x 10f
export const FIRST_COAT_MOMENT_DURATION = 210 + 105 + 90 - 2 * 10;

// --- "First Coat Moment." hook text — fades in early over the video ---
const HookText: React.FC = () => {
  const frame = useCurrentFrame();

  const line1Opacity = interpolate(frame, [8, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line1Y = interpolate(frame, [8, 20], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const line2Opacity = interpolate(frame, [22, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out text after 3s so the action breathes
  const fadeOut = interpolate(frame, [80, 100], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 160,
        left: 60,
        right: 60,
        opacity: fadeOut,
      }}
    >
      <span
        style={{
          fontFamily: playfair,
          fontWeight: 700,
          fontSize: 58,
          color: colors.lightText,
          opacity: line1Opacity,
          transform: `translateY(${line1Y}px)`,
          textShadow: "0 2px 16px rgba(0,0,0,0.7)",
          lineHeight: 1.2,
          display: "block",
        }}
      >
        First Coat
      </span>
      <span
        style={{
          fontFamily: playfair,
          fontWeight: 700,
          fontSize: 58,
          color: colors.lightText,
          opacity: line2Opacity,
          textShadow: "0 2px 16px rgba(0,0,0,0.7)",
          lineHeight: 1.2,
          display: "block",
          marginTop: 4,
        }}
      >
        Moment.
      </span>
    </div>
  );
};

// --- "So befriedigend." label — appears mid-video ---
const SatisfyingLabel: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [110, 125], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [110, 125], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 420,
        left: 80,
        right: 80,
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontFamily: lora,
          fontWeight: 500,
          fontSize: 40,
          color: colors.lightText,
          opacity,
          transform: `translateY(${y}px)`,
          textShadow: "0 2px 16px rgba(0,0,0,0.7)",
          letterSpacing: 2,
          display: "inline-block",
        }}
      >
        So befriedigend.
      </span>
    </div>
  );
};

// --- Ergebnis label: short text over the result image ---
const ErgebnisLabel: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 420,
        left: 80,
        right: 80,
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontFamily: lora,
          fontWeight: 500,
          fontSize: 38,
          color: colors.lightText,
          opacity,
          textShadow: "0 2px 16px rgba(0,0,0,0.7)",
          letterSpacing: 2,
          display: "inline-block",
        }}
      >
        Das Ergebnis.
      </span>
    </div>
  );
};

// --- Branded outro overlaid on result image ---
const BrandedOutro: React.FC = () => {
  const frame = useCurrentFrame();

  // Gentle Ken Burns on background
  const bgScale = interpolate(frame, [0, 90], [1.04, 1.0], {
    extrapolateRight: "clamp",
  });

  // Darken overlay fades in softly
  const overlayOpacity = interpolate(frame, [0, 18], [0.15, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Product image rises in with subtle scale
  const productOpacity = interpolate(frame, [6, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const productY = interpolate(frame, [6, 20], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const productScale = interpolate(frame, [6, 20], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Logo + text
  const logoOpacity = interpolate(frame, [16, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineWidth = interpolate(frame, [24, 38], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const ctaOpacity = interpolate(frame, [36, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Result image as background with subtle Ken Burns */}
      <Img
        src={staticFile(`${IMG_SEQ}/03-ergebnis.png`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${bgScale})`,
        }}
      />

      {/* Warm-tinted dark overlay for readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, rgba(30,15,5,${overlayOpacity * 0.7}) 0%, rgba(20,10,0,${overlayOpacity}) 50%, rgba(30,15,5,${overlayOpacity * 0.8}) 100%)`,
        }}
      />

      {/* Centered brand content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {/* Product cutout — larger, with realistic shadow */}
        <Img
          src={staticFile("product-cutouts/vernis.png")}
          style={{
            width: 340,
            height: 340,
            objectFit: "contain",
            opacity: productOpacity,
            transform: `translateY(${productY}px) scale(${productScale})`,
            filter:
              "drop-shadow(0 12px 20px rgba(0,0,0,0.5)) drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
          }}
        />

        {/* Product name */}
        <span
          style={{
            fontFamily: playfair,
            fontWeight: 400,
            fontSize: 34,
            color: colors.lightText,
            opacity: logoOpacity,
            letterSpacing: 1,
            textShadow: "0 2px 12px rgba(0,0,0,0.6)",
          }}
        >
          Le Tonkinois Vernis
        </span>

        {/* Red divider */}
        <div
          style={{
            width: lineWidth,
            height: 3,
            backgroundColor: colors.brandRed,
            boxShadow: "0 0 8px rgba(181,6,6,0.3)",
          }}
        />

        {/* Seit 1906 */}
        <span
          style={{
            fontFamily: playfair,
            fontWeight: 400,
            fontSize: 26,
            color: colors.lightText,
            letterSpacing: 4,
            opacity: logoOpacity,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          Seit 1906
        </span>

        {/* CTA — elegant vintage text, no pill button */}
        <span
          style={{
            fontFamily: lora,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 28,
            color: colors.lightText,
            opacity: ctaOpacity,
            letterSpacing: 1,
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            marginTop: 12,
          }}
        >
          Frohe Ostern!
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
          opacity: logoOpacity,
        }}
      />
    </AbsoluteFill>
  );
};

export const FirstCoatMoment: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        {/* HOOK: Video starts immediately — brush hitting wood (7s) */}
        <TransitionSeries.Sequence durationInFrames={210}>
          <VideoScene
            src="clips/first-coat-moment/clip_02_first_coat_trimmed.mp4"
            gradientStrength={0.45}
          >
            <HookText />
            <SatisfyingLabel />
          </VideoScene>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 10 })}
        />

        {/* Ergebnis: Geölter Tisch mit Brunch (3.5s) — Ken Burns */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <ImageScene
            src={`${IMG_SEQ}/03-ergebnis.png`}
            zoomFrom={1.06}
            zoomTo={1.0}
            gradientStrength={0.4}
          >
            <ErgebnisLabel />
          </ImageScene>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 10 })}
        />

        {/* Branded Outro: Product + Logo overlaid on result image (3s) */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <BrandedOutro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
