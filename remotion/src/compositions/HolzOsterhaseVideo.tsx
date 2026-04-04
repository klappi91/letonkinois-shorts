import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { colors } from "../utils/colors";
import { playfair, lora } from "../utils/fonts";
import { ImageScene } from "../components/ImageScene";
import { VideoScene } from "../components/VideoScene";
import { ProductReveal } from "../components/ProductReveal";
import { EndCard } from "../components/EndCard";

const IMG_SEQ = "sequences/oster-hase-reveal";

// Softer text shadow — avoids the "PowerPoint drop shadow" look
const softShadow = "0 1px 8px rgba(0,0,0,0.35), 0 0 40px rgba(0,0,0,0.2)";

// REORDERED: Video Hook first (strongest scroll-stopper)
// Video Hook: 5s=150f, Bunny Close-up: 2.5s=75f, Reveal: 2.5s=75f
// ProductReveal: 3s=90f, EndCard: 2.5s=75f
// Transitions: 4x 8f
export const HOLZ_OSTERHASE_VIDEO_DURATION = 150 + 75 + 75 + 90 + 75 - 4 * 8;

// --- "Wasser perlt ab." hook text — appears fast on video scene ---
const WaterHookText: React.FC = () => {
  const frame = useCurrentFrame();

  // Text appears quickly (frame 5-15) to hook scrollers immediately
  const line1Opacity = interpolate(frame, [5, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line1Y = interpolate(frame, [5, 15], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const line2Opacity = interpolate(frame, [18, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "Seit 1906" brand anchor fades in later in the scene
  const brandOpacity = interpolate(frame, [80, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 160,
          left: 60,
          right: 60,
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
            textShadow: softShadow,
            lineHeight: 1.2,
            display: "block",
          }}
        >
          Wasser...
        </span>
        <span
          style={{
            fontFamily: playfair,
            fontWeight: 700,
            fontSize: 58,
            color: colors.lightText,
            opacity: line2Opacity,
            textShadow: softShadow,
            lineHeight: 1.2,
            display: "block",
            marginTop: 4,
          }}
        >
          perlt ab.
        </span>
      </div>
      {/* Brand heritage anchor — appears in second half of video scene */}
      <div
        style={{
          position: "absolute",
          bottom: 420,
          left: 80,
          right: 80,
          textAlign: "center",
          opacity: brandOpacity,
        }}
      >
        <span
          style={{
            fontFamily: lora,
            fontWeight: 500,
            fontSize: 28,
            color: colors.lightText,
            textShadow: softShadow,
            letterSpacing: 4,
            display: "inline-block",
            textTransform: "uppercase",
          }}
        >
          Holzschutz seit 1906
        </span>
      </div>
    </>
  );
};

// --- "Geschützt." label — on bunny close-up scene (75f total) ---
const ProtectedLabel: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [15, 30], [12, 0], {
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
          textShadow: softShadow,
          letterSpacing: 3,
          display: "inline-block",
        }}
      >
        Geschützt.
      </span>
    </div>
  );
};

export const HolzOsterhaseVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        {/* HOOK: Water Beading Video FIRST (5s=150f) — strongest scroll-stopper */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <VideoScene
            src="clips/holz-osterhase-video/clip_02_water_beading_trimmed.mp4"
            gradientStrength={0.55}
          >
            <WaterHookText />
          </VideoScene>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 8 })}
        />

        {/* Bunny Close-up (2.5s=75f) — reveals the subject */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <ImageScene
            src={`${IMG_SEQ}/01-hook.png`}
            zoomFrom={1.0}
            zoomTo={1.06}
            gradientStrength={0.4}
          >
            <ProtectedLabel />
          </ImageScene>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 8 })}
        />

        {/* Reveal: Hase in Oster-Szene (2.5s=75f) — Ken Burns zoom out */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <ImageScene
            src={`${IMG_SEQ}/03-reveal.png`}
            zoomFrom={1.06}
            zoomTo={1.0}
            gradientStrength={0.3}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: 8 })}
        />

        {/* Product Reveal (3s=90f) */}
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

        {/* EndCard (2.5s=75f) */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <EndCard cta="Frohe Ostern!" />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
