import { registerRoot, Composition } from "remotion";
import React from "react";
import {
  EiBootEinfach,
  EI_BOOT_EINFACH_DURATION,
} from "../compositions/EiBootEinfach";

const Root: React.FC = () => (
  <Composition
    id="EiBootEinfach"
    component={EiBootEinfach}
    durationInFrames={EI_BOOT_EINFACH_DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
);

registerRoot(Root);
