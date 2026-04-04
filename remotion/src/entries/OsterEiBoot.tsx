import React from "react";
import { registerRoot } from "remotion";
import { Composition } from "remotion";
import {
  OsterEiBoot,
  OSTER_EI_BOOT_DURATION,
} from "../compositions/OsterEiBoot";

const Root: React.FC = () => (
  <>
    <Composition
      id="OsterEiBoot"
      component={OsterEiBoot}
      durationInFrames={OSTER_EI_BOOT_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);

registerRoot(Root);
