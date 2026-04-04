import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { colors } from "../utils/colors";
import { playfair, lato } from "../utils/fonts";
import { ImageScene } from "../components/ImageScene";
import { StepBadge } from "../components/StepBadge";
import { SceneLabel } from "../components/SceneLabel";
import { ProductReveal } from "../components/ProductReveal";
import { EndCard } from "../components/EndCard";

const SEQ = "sequences/oster-geschenke";

// --- HOOK: Alle drei Geschenke + "3 Geschenke unter 10€" ---
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();

  // "3 Geschenke" — big Playfair
  const titleOpacity = interpolate(frame, [8, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [8, 24], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // "unter 10€" — smaller Lato, delayed
  const subOpacity = interpolate(frame, [22, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subY = interpolate(frame, [22, 38], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <ImageScene src={`${SEQ}/01-hook-alle-drei.png`} zoomFrom={1.04} zoomTo={1.0}>
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
            fontFamily: playfair,
            fontWeight: 700,
            fontSize: 72,
            color: colors.lightText,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textShadow: "0 4px 20px rgba(0,0,0,0.6)",
            lineHeight: 1.15,
            display: "block",
          }}
        >
          3 Geschenke
        </span>
        <span
          style={{
            fontFamily: lato,
            fontWeight: 700,
            fontSize: 42,
            color: colors.lightText,
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
            textShadow: "0 3px 16px rgba(0,0,0,0.5)",
            lineHeight: 1.3,
            display: "block",
            marginTop: 12,
          }}
        >
          unter 10€
        </span>
      </div>
    </ImageScene>
  );
};

// --- Geschenk 1: Schneidebrett Vorher ---
const Schneidebrett1Scene: React.FC = () => (
  <ImageScene src={`${SEQ}/02-schneidebrett-vorher.png`}>
    <StepBadge number={1} totalSteps={3} />
    <SceneLabel text="Vorher" />
  </ImageScene>
);

// --- Geschenk 1: Schneidebrett Nachher ---
const Schneidebrett2Scene: React.FC = () => (
  <ImageScene src={`${SEQ}/03-schneidebrett-nachher.png`}>
    <StepBadge number={1} totalSteps={3} />
    <SceneLabel text="Nachher" />
  </ImageScene>
);

// --- Geschenk 2: Holzlöffel Vorher ---
const Loeffel1Scene: React.FC = () => (
  <ImageScene src={`${SEQ}/04-loeffel-vorher.png`}>
    <StepBadge number={2} totalSteps={3} />
    <SceneLabel text="Vorher" />
  </ImageScene>
);

// --- Geschenk 2: Holzlöffel Nachher ---
const Loeffel2Scene: React.FC = () => (
  <ImageScene src={`${SEQ}/05-loeffel-nachher.png`}>
    <StepBadge number={2} totalSteps={3} />
    <SceneLabel text="Nachher" />
  </ImageScene>
);

// --- Geschenk 3: Kästchen Vorher/Nachher ---
const KaestchenScene: React.FC = () => (
  <ImageScene src={`${SEQ}/06-kaestchen-vorher-nachher.png`}>
    <StepBadge number={3} totalSteps={3} />
    <SceneLabel text="Kästchen" />
  </ImageScene>
);

// --- Alle zusammen: Oster-Finale ---
const FinaleScene: React.FC = () => {
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
    <ImageScene src={`${SEQ}/07-alle-zusammen-oster.png`}>
      <SceneLabel text="Frohe Ostern" delay={12} />
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
// Hook: 110f (3.7s) | Brett Vorher: 90f (3s) | Brett Nachher: 90f (3s) |
// Löffel Vorher: 90f (3s) | Löffel Nachher: 90f (3s) |
// Kästchen: 100f (3.3s) | Finale: 100f (3.3s) |
// Product: 95f (3.2s) | EndCard: 85f (2.8s)
// Transitions: 10f each (8x) = 80f
// Total: 110+90+90+90+90+100+100+95+85 - 80 = 770f ≈ 25.7s
export const OSTER_GESCHENKE_DURATION = 770;

export const OsterGeschenke: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.white }}>
      <TransitionSeries>
        {/* Hook: Alle drei + "3 Geschenke unter 10€" */}
        <TransitionSeries.Sequence durationInFrames={110}>
          <HookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 10 })}
        />

        {/* Geschenk 1: Schneidebrett Vorher */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <Schneidebrett1Scene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 10 })}
        />

        {/* Geschenk 1: Schneidebrett Nachher */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <Schneidebrett2Scene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 10 })}
        />

        {/* Geschenk 2: Löffel Vorher */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <Loeffel1Scene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 10 })}
        />

        {/* Geschenk 2: Löffel Nachher */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <Loeffel2Scene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 10 })}
        />

        {/* Geschenk 3: Kästchen */}
        <TransitionSeries.Sequence durationInFrames={100}>
          <KaestchenScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 10 })}
        />

        {/* Finale: Alle zusammen mit Oster-Deko */}
        <TransitionSeries.Sequence durationInFrames={100}>
          <FinaleScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 10 })}
        />

        {/* Produkt: Vernis Dose */}
        <TransitionSeries.Sequence durationInFrames={95}>
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
        <TransitionSeries.Sequence durationInFrames={85}>
          <EndCard cta="Speicher dir das!" />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
