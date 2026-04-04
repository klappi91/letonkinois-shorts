import React from "react";
import { registerRoot } from "remotion";
import { Composition } from "remotion";
import {
  OsterHaseReveal,
  OSTER_HASE_REVEAL_DURATION,
} from "../compositions/OsterHaseReveal";

const Root: React.FC = () => (
  <>
    <Composition
      id="OsterHaseReveal"
      component={OsterHaseReveal}
      durationInFrames={OSTER_HASE_REVEAL_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);

registerRoot(Root);
