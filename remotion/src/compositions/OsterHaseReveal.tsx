import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { colors } from "../utils/colors";
import { playfair, lora } from "../utils/fonts";
import { ImageScene } from "../components/ImageScene";
import { SceneLabel } from "../components/SceneLabel";
import { ProductReveal } from "../components/ProductReveal";
import { EndCard } from "../components/EndCard";
import { SAFE_ZONES } from "../../../src/lib/brand";

const SEQ = "sequences/oster-hase-reveal";

// --- HOOK: Extreme Nahaufnahme geöltes Holz + "Was glänzt da?" ---
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();

  const textOpacity = interpolate(frame, [12, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textY = interpolate(frame, [12, 30], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <ImageScene src={`${SEQ}/01-hook.png`} zoomFrom={1.08} zoomTo={1.0}>
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
            fontSize: 62,
            color: colors.lightText,
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
            textShadow: colors.textShadow,
            lineHeight: 1.2,
            display: "block",
          }}
        >
          Was glänzt da?
        </span>
      </div>
    </ImageScene>
  );
};

// --- WASSER: Tropfen perlen ab ---
const WasserScene: React.FC = () => {
  return (
    <ImageScene src={`${SEQ}/02-wasser.png`} zoomFrom={1.0} zoomTo={1.05}>
      <SceneLabel text="Geschützt." delay={12} />
    </ImageScene>
  );
};

// --- REVEAL: Der Osterhase ---
const RevealScene: React.FC = () => {
  return (
    <ImageScene src={`${SEQ}/03-reveal.png`} zoomFrom={1.06} zoomTo={1.0}>
      <SceneLabel text="Geölt." delay={15} />
    </ImageScene>
  );
};

// --- OSTERNEST: Hase mit Nest und Eiern ---
const OsternestScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle sparkle/glow on the eggs
  const glowOpacity = interpolate(frame, [20, 40, 60, 80], [0, 0.3, 0, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <ImageScene src={`${SEQ}/04-osternest.png`} zoomFrom={1.0} zoomTo={1.04}>
      {/* Warm glow overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(251,188,52,0.12) 0%, transparent 70%)",
          opacity: glowOpacity,
        }}
      />
      <SceneLabel text="Frohe Ostern!" delay={18} />
    </ImageScene>
  );
};

// --- TIMING ---
// Hook: 110f (3.7s) | Wasser: 105f (3.5s) | Reveal: 110f (3.7s) |
// Osternest: 110f (3.7s) | Product: 100f (3.3s) | EndCard: 90f (3s)
// Transitions: 12f each (5x) = 60f
// Total: 110+105+110+110+100+90 - 60 = 565f ~ 18.8s
export const OSTER_HASE_REVEAL_DURATION = 565;

export const OsterHaseReveal: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.white }}>
      <TransitionSeries>
        {/* Hook: Extreme Nahaufnahme + "Was glänzt da?" */}
        <TransitionSeries.Sequence durationInFrames={110}>
          <HookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 12 })}
        />

        {/* Wasser perlt ab */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <WasserScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 12 })}
        />

        {/* Reveal: Der Osterhase */}
        <TransitionSeries.Sequence durationInFrames={110}>
          <RevealScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: 12 })}
        />

        {/* Osternest mit Eiern */}
        <TransitionSeries.Sequence durationInFrames={110}>
          <OsternestScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 12 })}
        />

        {/* Produkt: Le Tonkinois Vernis */}
        <TransitionSeries.Sequence durationInFrames={100}>
          <ProductReveal
            productImage="product-cutouts/vernis.png"
            productName="Le Tonkinois Vernis"
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 12 })}
        />

        {/* End Card */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <EndCard cta="Frohe Ostern!" />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
