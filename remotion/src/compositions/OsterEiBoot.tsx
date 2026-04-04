import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { colors } from "../utils/colors";
import { playfair } from "../utils/fonts";
import { ImageScene } from "../components/ImageScene";
import { SceneLabel } from "../components/SceneLabel";
import { ProductReveal } from "../components/ProductReveal";
import { EndCard } from "../components/EndCard";
import { SAFE_ZONES } from "../../../src/lib/brand";

const SEQ = "sequences/oster-ei-boot";

// --- HOOK: Boot auf Eigelb — sofort das WTF-Bild, schnell Text ---
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();

  const textOpacity = interpolate(frame, [3, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textY = interpolate(frame, [3, 14], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <ImageScene src={`${SEQ}/02-boot-reveal.png`} zoomFrom={1.0} zoomTo={1.14}>
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
            fontFamily: playfair,
            fontWeight: 700,
            fontSize: 58,
            color: colors.lightText,
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
            textShadow: colors.textShadow,
            lineHeight: 1.2,
            display: "block",
          }}
        >
          Ostereier... anders.
        </span>
      </div>
    </ImageScene>
  );
};

// --- DETAIL: Extreme Nahaufnahme Boot — "Geölt." ---
const DetailScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle horizontal drift — boat "rocks" on the yolk
  const driftX = interpolate(frame, [0, 25, 50, 75], [0, 4, -3, 2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ transform: `translateX(${driftX}px)` }}>
      <ImageScene
        src={`${SEQ}/03-detail.png`}
        zoomFrom={1.1}
        zoomTo={1.0}
        gradientStrength={0.6}
      >
        <SceneLabel text="Geölt." delay={8} />
      </ImageScene>
    </AbsoluteFill>
  );
};

// --- ZOOM OUT: Der ganze Ostertisch ---
const TableScene: React.FC = () => {
  return (
    <ImageScene
      src={`${SEQ}/04-zoom-out.png`}
      zoomFrom={1.08}
      zoomTo={1.0}
      gradientStrength={0.4}
    />
  );
};

// --- TIMING (v3 — short & punchy, ~12s) ---
// Hook (Boot): 75f (2.5s) | Detail: 70f (2.3s) | Table: 65f (2.2s) |
// Product: 75f (2.5s) | EndCard: 70f (2.3s)
// Transitions: 6f each (4x) = 24f
// Total: 75+70+65+75+70 - 24 = 331f ~ 11s
export const OSTER_EI_BOOT_DURATION = 331;

export const OsterEiBoot: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.white }}>
      <TransitionSeries>
        {/* Hook: Boot auf Eigelb — "Ostereier... anders." */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <HookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: 6 })}
        />

        {/* Detail: Makro Boot — "Geölt." */}
        <TransitionSeries.Sequence durationInFrames={70}>
          <DetailScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 6 })}
        />

        {/* Zoom Out: Ostertisch */}
        <TransitionSeries.Sequence durationInFrames={65}>
          <TableScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 6 })}
        />

        {/* Produkt: Le Tonkinois Vernis */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <ProductReveal
            productImage="product-cutouts/vernis.png"
            productName="Le Tonkinois Vernis"
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 6 })}
        />

        {/* End Card */}
        <TransitionSeries.Sequence durationInFrames={70}>
          <EndCard cta="Frohe Ostern!" />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
