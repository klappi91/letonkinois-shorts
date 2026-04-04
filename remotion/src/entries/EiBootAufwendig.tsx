import { registerRoot, Composition } from "remotion";
import React from "react";
import {
  EiBootAufwendig,
  EI_BOOT_AUFWENDIG_DURATION,
} from "../compositions/EiBootAufwendig";

const Root: React.FC = () => (
  <Composition
    id="EiBootAufwendig"
    component={EiBootAufwendig}
    durationInFrames={EI_BOOT_AUFWENDIG_DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
);

registerRoot(Root);
