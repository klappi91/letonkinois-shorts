import React from "react";
import { registerRoot } from "remotion";
import { Composition } from "remotion";
import {
  OsterBrunchTisch,
  OSTER_BRUNCH_TISCH_DURATION,
} from "../compositions/OsterBrunchTisch";


const Root: React.FC = () => (
  <>
    <Composition
      id="OsterBrunchTisch"
      component={OsterBrunchTisch}
      durationInFrames={OSTER_BRUNCH_TISCH_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);

registerRoot(Root);
