import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";

export const ImageScene: React.FC<{
  src: string;
  zoomFrom?: number;
  zoomTo?: number;
  gradientStrength?: number;
  children?: React.ReactNode;
}> = ({ src, zoomFrom = 1.0, zoomTo = 1.06, gradientStrength = 0.8, children }) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, 120], [zoomFrom, zoomTo], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
      />
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
      {children}
    </AbsoluteFill>
  );
};
