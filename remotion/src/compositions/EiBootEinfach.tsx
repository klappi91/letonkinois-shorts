import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { colors } from "../utils/colors";
import { playfair, lora } from "../utils/fonts";
import { VideoScene } from "../components/VideoScene";
import { ProductReveal } from "../components/ProductReveal";
import { EndCard } from "../components/EndCard";

// Clip 1: 6s = 180 frames, Clip 2: 5s = 150 frames
// Product Reveal: 3s = 90 frames, EndCard: 3s = 90 frames
// Transitions: 3x ~8 frames
export const EI_BOOT_EINFACH_DURATION = 180 + 150 + 90 + 90 - 3 * 8;

// --- Hook Text: "Ostereier... anders." ---
const HookText: React.FC = () => {
  const frame = useCurrentFrame();

  const line1Opacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line1Y = interpolate(frame, [15, 30], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const line2Opacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Y = interpolate(frame, [40, 55], [20, 0], {
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
          fontSize: 62,
          color: colors.lightText,
          opacity: line1Opacity,
          transform: `translateY(${line1Y}px)`,
          textShadow: colors.textShadow,
          lineHeight: 1.2,
          display: "block",
        }}
      >
        Ostereier...
      </span>
      <span
        style={{
          fontFamily: playfair,
          fontWeight: 700,
          fontSize: 62,
          color: colors.lightText,
          opacity: line2Opacity,
          transform: `translateY(${line2Y}px)`,
          textShadow: colors.textShadow,
          lineHeight: 1.2,
          display: "block",
          marginTop: 8,
        }}
      >
        anders.
      </span>
    </div>
  );
};

// --- Scene Label: "Geölt." ---
const OilLabel: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [30, 45], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 400,
        left: 80,
        right: 80,
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontFamily: lora,
          fontWeight: 500,
          fontSize: 44,
          color: colors.lightText,
          opacity,
          transform: `translateY(${y}px)`,
          textShadow: colors.textShadow,
          letterSpacing: 3,
          display: "inline-block",
        }}
      >
        Geölt.
      </span>
    </div>
  );
};

export const EiBootEinfach: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        {/* Clip 1: Overhead — Boot auf Eigelb (6s) */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <VideoScene
            src="clips/ei-boot-einfach/clip_01_overhead_trimmed.mp4"
            gradientStrength={0.4}
          >
            <HookText />
          </VideoScene>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 8 })}
        />

        {/* Clip 2: Näher am Boot (5s) */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <VideoScene
            src="clips/ei-boot-einfach/clip_02_closer_trimmed.mp4"
            gradientStrength={0.5}
          >
            <OilLabel />
          </VideoScene>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: 8 })}
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
          timing={linearTiming({ durationInFrames: 8 })}
        />

        {/* EndCard (3s) */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <EndCard cta="Frohe Ostern!" />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
