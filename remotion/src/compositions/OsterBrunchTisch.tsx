import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
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

const SEQ = "sequences/oster-brunch-tisch";

/**
 * Subtle brand presence — top red accent line only.
 * Premium brands don't watermark every frame. The accent line
 * creates visual continuity with the EndCard red bar.
 */
const BrandAccent: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [8, 20], [0, 0.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: colors.brandGradient,
        opacity,
        zIndex: 10,
      }}
    />
  );
};

// --- HOOK: First Coat action shot — Oel wird aufgetragen, sofort Bewegung ---
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();

  const textOpacity = interpolate(frame, [5, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textY = interpolate(frame, [5, 20], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <ImageScene src={`${SEQ}/02-first-coat.png`} zoomFrom={1.06} zoomTo={1.0}>
      <BrandAccent />
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
            fontSize: 66,
            color: colors.lightText,
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
            textShadow: "0 2px 16px rgba(0,0,0,0.6)",
            lineHeight: 1.2,
            display: "block",
          }}
        >
          First Coat.
        </span>
      </div>
    </ImageScene>
  );
};

// --- VORHER: Unbehandelte Platte ---
const VorherScene: React.FC = () => {
  return (
    <ImageScene src={`${SEQ}/01-hook.png`} zoomFrom={1.0} zoomTo={1.04}>
      <BrandAccent />
      <SceneLabel text="Vorher." delay={8} />
    </ImageScene>
  );
};

// --- ERGEBNIS: Fertig geoelt ---
const ErgebnisScene: React.FC = () => {
  return (
    <ImageScene src={`${SEQ}/03-ergebnis.png`} zoomFrom={1.04} zoomTo={1.0}>
      <BrandAccent />
      <SceneLabel text="Einziehen lassen." delay={8} />
    </ImageScene>
  );
};

// --- OSTER-TISCH: Brunch-Aufbau ---
const OsterTischScene: React.FC = () => {
  return (
    <ImageScene
      src={`${SEQ}/04-oster-tisch.png`}
      zoomFrom={1.0}
      zoomTo={1.06}
      gradientStrength={0.5}
    >
      <BrandAccent />
      <SceneLabel text="Frohe Ostern." delay={8} />
    </ImageScene>
  );
};

// --- TIMING (tighter pacing for IG) ---
// Hook: 100f (3.3s) | Vorher: 90f (3.0s) | Ergebnis: 90f (3.0s) |
// Oster-Tisch: 100f (3.3s) | Product: 90f (3.0s) | EndCard: 80f (2.7s)
// Transitions: 10f each (5x) = 50f
// Total: 100+90+90+100+90+80 - 50 = 500f ~ 16.7s
export const OSTER_BRUNCH_TISCH_DURATION = 500;

export const OsterBrunchTisch: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.white }}>
      <TransitionSeries>
        {/* Hook: First Coat action — Oel wird aufgetragen */}
        <TransitionSeries.Sequence durationInFrames={100}>
          <HookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 10 })}
        />

        {/* Vorher: Unbehandeltes Holz */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <VorherScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 10 })}
        />

        {/* Ergebnis: Fertig geoelt */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <ErgebnisScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 10 })}
        />

        {/* Oster-Tisch: Brunch Aufbau */}
        <TransitionSeries.Sequence durationInFrames={100}>
          <OsterTischScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 10 })}
        />

        {/* Produkt: Die Dose */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <ProductReveal
            productImage="product-cutouts/vernis.png"
            productName="Le Tonkinois Vernis"
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 10 })}
        />

        {/* End Card */}
        <TransitionSeries.Sequence durationInFrames={80}>
          <EndCard cta="Speicher dir das!" />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
