import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { colors } from "../utils/colors";
import { playfair, lora, lato } from "../utils/fonts";
import { VideoScene } from "../components/VideoScene";
import { ProductReveal } from "../components/ProductReveal";
import { EndCard } from "../components/EndCard";

// Clip 1: 3s=90f, Clip 2: 4s=120f, Clip 3: 5s=150f
// ProductReveal: 3s=90f, EndCard: 2.5s=75f
// Transitions: 2x 6f (hard cuts) + 1x 15f (smooth slide) + 1x 6f
export const EI_BOOT_AUFWENDIG_DURATION = 90 + 120 + 150 + 90 + 75 - (2 * 6 + 15 + 6);

// --- Brand badge — small pill in top-right for early brand recognition ---
const BrandBadge: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [15, 30], [0, 0.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 160,
        right: 60,
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(181, 6, 6, 0.85)",
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 8,
        paddingBottom: 8,
        borderRadius: 4,
      }}
    >
      <span
        style={{
          fontFamily: lato,
          fontWeight: 700,
          fontSize: 18,
          color: colors.lightText,
          letterSpacing: 1.5,
          textTransform: "uppercase" as const,
        }}
      >
        Le Tonkinois
      </span>
    </div>
  );
};

// --- Hook Text: "Ostereier... anders." ---
const HookText: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [8, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [8, 20], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 220,
        left: 80,
        right: 80,
      }}
    >
      <span
        style={{
          fontFamily: playfair,
          fontWeight: 700,
          fontSize: 58,
          color: colors.lightText,
          opacity,
          transform: `translateY(${y}px)`,
          textShadow: colors.textShadow,
          lineHeight: 1.2,
          display: "block",
        }}
      >
        Ostereier...
      </span>
    </div>
  );
};

// --- "anders." appears on reveal ---
const AndersText: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [10, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [10, 22], [1.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 160,
        left: 80,
        right: 80,
      }}
    >
      <span
        style={{
          fontFamily: playfair,
          fontWeight: 700,
          fontSize: 72,
          color: colors.lightText,
          opacity,
          transform: `scale(${scale})`,
          textShadow: colors.textShadow,
          lineHeight: 1.2,
          display: "block",
        }}
      >
        anders.
      </span>
    </div>
  );
};

// --- "Bon voyage." label on captain POV + brand bridge text ---
const BonVoyageLabel: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [40, 55], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Brand bridge text fades in later — connects story to product
  const bridgeOpacity = interpolate(frame, [90, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bridgeY = interpolate(frame, [90, 110], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <>
      <div
        style={{
          position: "absolute",
          bottom: 440,
          left: 80,
          right: 80,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: lora,
            fontWeight: 500,
            fontSize: 48,
            color: colors.lightText,
            opacity,
            transform: `translateY(${y}px)`,
            textShadow: colors.textShadow,
            letterSpacing: 3,
            fontStyle: "italic",
            display: "inline-block",
          }}
        >
          Bon voyage.
        </span>
      </div>
      {/* Brand bridge — connects the fantasy to the product */}
      <div
        style={{
          position: "absolute",
          bottom: 390,
          left: 80,
          right: 80,
          textAlign: "center",
          opacity: bridgeOpacity,
          transform: `translateY(${bridgeY}px)`,
        }}
      >
        <span
          style={{
            fontFamily: lato,
            fontWeight: 700,
            fontSize: 22,
            color: colors.brandRed,
            letterSpacing: 2,
            textTransform: "uppercase" as const,
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 6,
            paddingBottom: 6,
            borderRadius: 3,
          }}
        >
          Holzschutz seit 1906
        </span>
      </div>
    </>
  );
};

export const EiBootAufwendig: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        {/* Clip 1: Ei köpfen — HOOK (3s) */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <VideoScene
            src="clips/ei-boot-aufwendig/clip_01_crack_trimmed.mp4"
            gradientStrength={0.3}
          >
            <BrandBadge />
            <HookText />
          </VideoScene>
        </TransitionSeries.Sequence>

        {/* HARTER CUT — fast transition */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 6 })}
        />

        {/* Clip 2: Boot auf Eigelb — WTF-Moment (4s) */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <VideoScene
            src="clips/ei-boot-aufwendig/clip_02_reveal_trimmed.mp4"
            gradientStrength={0.4}
          >
            <AndersText />
          </VideoScene>
        </TransitionSeries.Sequence>

        {/* HARTER CUT */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 6 })}
        />

        {/* Clip 3: Kapitäns-POV auf Eigelb-See (5s) */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <VideoScene
            src="clips/ei-boot-aufwendig/clip_03_captain_pov_trimmed.mp4"
            gradientStrength={0.5}
          >
            <BonVoyageLabel />
          </VideoScene>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Product Reveal (3s) */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <ProductReveal
            productImage="product-cutouts/vernis.png"
            productName="Le Tonkinois Vernis"
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 6 })}
        />

        {/* EndCard (2.5s) */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <EndCard cta="Frohe Ostern!" />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
