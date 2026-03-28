// remotion/src/components/ColorGrade.tsx
// Golden-Hour color grading wrapper (D-05, D-06, D-07).
// Apply at composition root only — never inside individual Sequence children.
// Stacking on transitions causes double-grading (see RESEARCH.md Pitfall 2).
import React from "react";
import { AbsoluteFill } from "remotion";
import { COLOR_GRADE } from "../../../src/lib/brand";

interface ColorGradeProps {
  children: React.ReactNode;
  /** Set to false to disable Golden-Hour grading for this composition. Default: true. */
  enabled?: boolean;
}

export const ColorGrade: React.FC<ColorGradeProps> = ({
  children,
  enabled = true,
}) => {
  const filter = enabled
    ? [
        `sepia(${COLOR_GRADE.sepia})`,
        `saturate(${COLOR_GRADE.saturate})`,
        `brightness(${COLOR_GRADE.brightness})`,
        `contrast(${COLOR_GRADE.contrast})`,
        `hue-rotate(${COLOR_GRADE.hueRotate}deg)`,
      ].join(" ")
    : undefined;

  return (
    <AbsoluteFill style={filter ? { filter } : {}}>
      {children}
    </AbsoluteFill>
  );
};
