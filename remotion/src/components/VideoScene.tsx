import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Loop,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";

/**
 * VideoScene — Spielt einen Video-Clip ab (z.B. Veo-generiert).
 *
 * Nutzt OffthreadVideo für frame-genaues Rendering (statt <Video>).
 * Unterstützt Trimming (startFrom), Looping, und Gradient-Overlay.
 *
 * Adaptiert von ClawVid's scene-video.tsx für Le Tonkinois Pipeline.
 */
export const VideoScene: React.FC<{
  /** Pfad relativ zu remotion/public/, z.B. "clips/oster-ei-boot/01-hook.mp4" */
  src: string;
  /** Frame ab dem der Clip startet (für Trimming) */
  startFrom?: number;
  /** Lautstärke (0 = stumm, 1 = voll) */
  volume?: number;
  /** Wenn gesetzt, wird der Clip geloopt */
  loopDuration?: number;
  /** Gradient-Overlay unten (für Text-Lesbarkeit) */
  gradientStrength?: number;
  /** Children (Text-Overlays etc.) */
  children?: React.ReactNode;
}> = ({
  src,
  startFrom = 0,
  volume = 0,
  loopDuration,
  gradientStrength = 0,
  children,
}) => {
  const video = (
    <OffthreadVideo
      src={staticFile(src)}
      startFrom={startFrom}
      volume={volume}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  );

  return (
    <AbsoluteFill>
      {loopDuration ? (
        <Loop durationInFrames={loopDuration}>{video}</Loop>
      ) : (
        video
      )}

      {/* Optional gradient overlay for text readability */}
      {gradientStrength > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50%",
            background: `linear-gradient(0deg, rgba(0,0,0,${gradientStrength}) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)`,
          }}
        />
      )}

      {children}
    </AbsoluteFill>
  );
};
