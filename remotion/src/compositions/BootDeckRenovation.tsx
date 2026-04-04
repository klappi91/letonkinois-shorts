import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { colors } from "../utils/colors";
import { playfair } from "../utils/fonts";
import { ImageScene } from "../components/ImageScene";
import { StepBadge } from "../components/StepBadge";
import { SceneLabel } from "../components/SceneLabel";
import { ProductReveal } from "../components/ProductReveal";
import { EndCard } from "../components/EndCard";

const SEQ = "sequences/boot-deck-renovation";

// --- HOOK: Ergebnis zuerst, "Dein Boot." ---
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();

  const textOpacity = interpolate(frame, [10, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textY = interpolate(frame, [10, 28], [25, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <ImageScene src={`${SEQ}/05-ergebnis.png`} zoomFrom={1.04} zoomTo={1.0}>
      <div
        style={{
          position: "absolute",
          bottom: 380,
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
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
            textShadow: colors.textShadow,
            lineHeight: 1.2,
            display: "block",
          }}
        >
          Dein Boot.
        </span>
      </div>
    </ImageScene>
  );
};

// --- VORHER ---
const VorherScene: React.FC = () => {
  return (
    <ImageScene src={`${SEQ}/01-vorher.png`}>
      <SceneLabel text="Vorher" />
    </ImageScene>
  );
};

// --- REINIGEN ---
const ReinigenScene: React.FC = () => {
  return (
    <ImageScene src={`${SEQ}/02-reinigen.png`}>
      <StepBadge number={1} totalSteps={3} />
      <SceneLabel text="Reinigen" />
    </ImageScene>
  );
};

// --- SCHLEIFEN ---
const SchleifenScene: React.FC = () => {
  return (
    <ImageScene src={`${SEQ}/03-schleifen.png`}>
      <StepBadge number={2} totalSteps={3} />
      <SceneLabel text="Schleifen" />
    </ImageScene>
  );
};

// --- AUFTRAGEN ---
const AuftragenScene: React.FC = () => {
  return (
    <ImageScene src={`${SEQ}/04-auftragen.png`}>
      <StepBadge number={3} totalSteps={3} />
      <SceneLabel text="Auftragen" />
    </ImageScene>
  );
};

// --- NACHHER ---
const NachherScene: React.FC = () => {
  const frame = useCurrentFrame();

  const checkScale = interpolate(frame, [25, 40], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });
  const checkOpacity = interpolate(frame, [25, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <ImageScene src={`${SEQ}/05-ergebnis.png`}>
      <SceneLabel text="Fertig." delay={18} />
      <div
        style={{
          position: "absolute",
          top: 140,
          right: 60,
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: "#2E7D32",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: checkOpacity,
          transform: `scale(${checkScale})`,
          boxShadow: "0 4px 16px rgba(46,125,50,0.4)",
        }}
      >
        <span style={{ fontSize: 38, color: colors.lightText }}>&#10003;</span>
      </div>
    </ImageScene>
  );
};

// --- TIMING ---
// Hook: 105f (3.5s) | Vorher: 100f (3.3s) | Reinigen: 105f (3.5s) |
// Schleifen: 105f (3.5s) | Auftragen: 105f (3.5s) | Nachher: 110f (3.7s) |
// Product: 100f (3.3s) | EndCard: 90f (3s)
// Transitions: 12f each (7x) = 84f
// Total: 105+100+105+105+105+110+100+90 - 84 = 736f = 24.5s
export const BOOT_DECK_RENOVATION_DURATION = 736;

export const BootDeckRenovation: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.white }}>
      <TransitionSeries>
        {/* Hook: Ergebnis + "Dein Boot." */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <HookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 12 })}
        />

        {/* Vorher */}
        <TransitionSeries.Sequence durationInFrames={100}>
          <VorherScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 12 })}
        />

        {/* Schritt 1: Reinigen */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <ReinigenScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 12 })}
        />

        {/* Schritt 2: Schleifen */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <SchleifenScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 12 })}
        />

        {/* Schritt 3: Auftragen */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <AuftragenScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 12 })}
        />

        {/* Nachher: Fertig */}
        <TransitionSeries.Sequence durationInFrames={110}>
          <NachherScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 12 })}
        />

        {/* Produkt: Marine No.1 */}
        <TransitionSeries.Sequence durationInFrames={100}>
          <ProductReveal
            productImage="product-cutouts/marine-no1.png"
            productName="Le Tonkinois Marine N°1"
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 12 })}
        />

        {/* End Card */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <EndCard />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
