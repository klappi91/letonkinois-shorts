import React from "react";
import { registerRoot } from "remotion";
import { Composition } from "remotion";
import {
  OsterGartenmoebel,
  OSTER_GARTENMOEBEL_DURATION,
} from "../compositions/OsterGartenmoebel";

const Root: React.FC = () => (
  <>
    <Composition
      id="OsterGartenmoebel"
      component={OsterGartenmoebel}
      durationInFrames={OSTER_GARTENMOEBEL_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);

registerRoot(Root);
