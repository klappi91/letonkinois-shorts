import { registerRoot, Composition } from "remotion";
import React from "react";
import {
  FirstCoatMoment,
  FIRST_COAT_MOMENT_DURATION,
} from "../compositions/FirstCoatMoment";

const Root: React.FC = () => (
  <Composition
    id="FirstCoatMoment"
    component={FirstCoatMoment}
    durationInFrames={FIRST_COAT_MOMENT_DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
);

registerRoot(Root);
