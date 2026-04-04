import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { colors } from "../utils/colors";
import { playfair, lora } from "../utils/fonts";
import { ImageScene } from "../components/ImageScene";
import { StepBadge } from "../components/StepBadge";
import { SceneLabel } from "../components/SceneLabel";
import { ProductReveal } from "../components/ProductReveal";
import { EndCard } from "../components/EndCard";

const SEQ = "sequences/oster-gartenmoebel";

// --- HOOK: Ergebnis mit Oster-Deko zuerst, "Ein Samstag." ---
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
    <ImageScene src={`${SEQ}/01-hook.png`} zoomFrom={1.04} zoomTo={1.0}>
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
          Ein Samstag.
        </span>
      </div>
    </ImageScene>
  );
};

// --- VORHER ---
const VorherScene: React.FC = () => {
  return (
    <ImageScene src={`${SEQ}/02-vorher.png`}>
      <SceneLabel text="Vorher" />
    </ImageScene>
  );
};

// --- REINIGEN ---
const ReinigenScene: React.FC = () => {
  return (
    <ImageScene src={`${SEQ}/03-reinigen.png`}>
      <StepBadge number={1} totalSteps={3} />
      <SceneLabel text="Reinigen" />
    </ImageScene>
  );
};

// --- SCHLEIFEN ---
const SchleifenScene: React.FC = () => {
  return (
    <ImageScene src={`${SEQ}/04-schleifen.png`}>
      <StepBadge number={2} totalSteps={3} />
      <SceneLabel text="Schleifen" />
    </ImageScene>
  );
};

// --- ÖLEN ---
const OelenScene: React.FC = () => {
  return (
    <ImageScene src={`${SEQ}/05-oelen.png`}>
      <StepBadge number={3} totalSteps={3} />
      <SceneLabel text="Schützen" />
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
    <ImageScene src={`${SEQ}/06-nachher.png`}>
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

// --- OSTER-DEKO: Fertige Bank mit Oster-Dekoration ---
const OsterDekoScene: React.FC = () => {
  const frame = useCurrentFrame();

  const labelOpacity = interpolate(frame, [15, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelY = interpolate(frame, [15, 30], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <ImageScene src={`${SEQ}/07-oster-deko.png`} zoomFrom={1.0} zoomTo={1.05}>
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
            fontFamily: lora,
            fontWeight: 700,
            fontSize: 52,
            color: colors.lightText,
            opacity: labelOpacity,
            transform: `translateY(${labelY}px)`,
            textShadow: colors.textShadow,
            lineHeight: 1.2,
            display: "block",
          }}
        >
          Frohe Ostern!
        </span>
      </div>
    </ImageScene>
  );
};

// --- TIMING ---
// Hook: 105f (3.5s) | Vorher: 100f (3.3s) | Reinigen: 105f (3.5s) |
// Schleifen: 105f (3.5s) | Ölen: 105f (3.5s) | Nachher: 110f (3.7s) |
// Oster-Deko: 110f (3.7s) | Product: 100f (3.3s) | EndCard: 90f (3s)
// Transitions: 12f each (8x) = 96f
// Total: 105+100+105+105+105+110+110+100+90 - 96 = 834f ≈ 27.8s
export const OSTER_GARTENMOEBEL_DURATION = 834;

export const OsterGartenmoebel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.white }}>
      <TransitionSeries>
        {/* Hook: Ergebnis mit Oster-Deko + "Ein Samstag." */}
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

        {/* Schritt 3: Ölen/Schützen */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <OelenScene />
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

        {/* Oster-Deko: Dekorierte Bank */}
        <TransitionSeries.Sequence durationInFrames={110}>
          <OsterDekoScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 12 })}
        />

        {/* Produkt: Die Dose */}
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
